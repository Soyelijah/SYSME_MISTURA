<?php
session_start();

require_once '../lib/http.php';
require_once '../lib/security.php';
require_once '../lib/database.php';
require_once '../lib/stock.php';
require_once '../lib/validation.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	api_error(405, 'method_not_allowed', 'Esta operación requiere una solicitud POST.');
}
require_authenticated_employee();
require_valid_csrf();

$saleId = filter_input(INPUT_POST, 'id_venta', FILTER_VALIDATE_INT);
$quantity = request_positive_number(isset($_POST['cantidad']) ? $_POST['cantidad'] : null);
$requestedProductId = request_identifier(isset($_POST['add_producto']) ? $_POST['add_producto'] : null);
$combinedProductProvided = isset($_POST['combinado']) && $_POST['combinado'] !== 'no';
$combinedProductId = request_identifier($combinedProductProvided ? $_POST['combinado'] : '');
$productId = $combinedProductId !== null ? $combinedProductId : $requestedProductId;
$kitchenBlock = filter_var(isset($_POST['bloque_cocina']) ? $_POST['bloque_cocina'] : 1, FILTER_VALIDATE_INT);
$manualPriceProvided = isset($_POST['precio']) && $_POST['precio'] !== ''
	&& (!is_scalar($_POST['precio']) || (float) $_POST['precio'] !== 0.0);
$manualPrice = $manualPriceProvided ? request_positive_number($_POST['precio'], 999999) : null;

if (!$saleId || $quantity === null || $productId === null || ($combinedProductProvided && $combinedProductId === null)
	|| ($manualPriceProvided && $manualPrice === null)
	|| $kitchenBlock === false || $kitchenBlock < 1 || $kitchenBlock > 99) {
	api_error(422, 'invalid_request', 'Los datos del producto no son válidos.');
}
if ($manualPrice !== null && !permission_value_is_allowed(isset($_SESSION['preciomanual']) ? $_SESSION['preciomanual'] : '')) {
	api_error(403, 'manual_price_forbidden', 'No tienes permiso para introducir un precio manual.');
}

try {
	$observations = request_bounded_text(isset($_POST['observaciones']) ? $_POST['observaciones'] : '', 500);
	$database = application_database();
	$database->beginTransaction();

	$sale = $database->prepare("select id_venta from ventadirecta where id_venta = ? and cerrada = 'N' for update");
	$sale->execute(array($saleId));
	if (!$sale->fetch()) {
		throw new DomainException('sale_not_open');
	}

	$productStatement = $database->prepare(
		'select id_tipo_comg, id_complementog, complementog, precio, avgIva, bloque_cocina, '
		. '(precio * (1 + (avgIva / 100))) as pvp, cocina, precio_compra, tipo_combinado, permitircambioprecio '
		. 'from complementog where id_complementog = ? and venta = \'S\' for update'
	);
	$productStatement->execute(array($productId));
	$product = $productStatement->fetch();
	if (!$product) {
		throw new DomainException('product_not_found');
	}
	if ($manualPrice !== null && $product['permitircambioprecio'] !== 'S') {
		throw new DomainException('manual_price_forbidden');
	}

	$tariff = $database->prepare(
		'select pvptarifa from comg_tarifa where id_complementog = ? and id_tarifa in '
		. '(select id_tarifa from mesa where Num_Mesa in '
		. '(select Num_Mesa from ventadirecta where id_venta = ?)) limit 1'
	);
	$tariff->execute(array($productId, $saleId));
	$tariffPrice = $tariff->fetchColumn();
	if ($tariffPrice !== false) {
		$product['pvp'] = $tariffPrice;
		$product['precio'] = $tariffPrice / (1 + ($product['avgIva'] / 100));
	}
	if ($manualPrice !== null) {
		$product['pvp'] = $manualPrice;
		$product['precio'] = $manualPrice / (1 + ($product['avgIva'] / 100));
	}
	if ((int) $product['bloque_cocina'] !== 0) {
		$kitchenBlock = (int) $product['bloque_cocina'];
	}

	$notes = '';
	if ($product['cocina'] === 'Y') {
		$noteStatement = $database->query('select id_nota, nota from notacocina');
		while ($note = $noteStatement->fetch()) {
			if (isset($_POST[$note['id_nota']])) {
				$notes .= ' * ' . $note['nota'];
			}
		}
	}

	$nextLine = $database->prepare('select coalesce(max(id_linea), 0) + 1 from ventadir_comg where id_venta = ?');
	$nextLine->execute(array($saleId));
	$lineId = (int) $nextLine->fetchColumn();
	$componentBaseLine = $lineId;
	$incremented = false;
	if (isset($_SESSION['checkincremento']) && $_SESSION['checkincremento'] === 'S' && $observations === '' && $notes === '') {
		$existing = $database->prepare(
			"select id_linea from ventadir_comg where id_venta = ? and id_complementog = ? "
			. "and observaciones = '' and (nota is null or nota = '') limit 1 for update"
		);
		$existing->execute(array($saleId, $productId));
		$existingLine = $existing->fetchColumn();
		if ($existingLine !== false) {
			$increase = $database->prepare(
				'update ventadir_comg set cantidad = cantidad + ? where id_venta = ? and id_linea = ?'
			);
			$increase->execute(array($quantity, $saleId, $existingLine));
			$lineId = (int) $existingLine;
			$incremented = true;
		}
	}

	if (!$incremented) {
		$insert = $database->prepare(
			'insert into ventadir_comg (id_complementog, id_venta, cantidad, id_tipo_comg, id_empresa, '
			. 'id_linea, id_centro, PVPTiquet, precio, precio_compra, avgiva, descuento, destino, '
			. 'id_almacen, cocina, complementog, total, nota, observaciones, bloque_cocina) '
			. "values (?, ?, ?, ?, '001', ?, '01', ?, ?, ?, ?, 0, 'V', ?, 0, ?, ?, ?, ?, ?)"
		);
		$insert->execute(array(
			$productId, $saleId, $quantity, $product['id_tipo_comg'], $lineId, $product['pvp'],
			$product['precio'], $product['precio_compra'], $product['avgIva'], $_SESSION['id_almacen'],
			$product['complementog'], $product['pvp'], $notes, $observations, $kitchenBlock,
		));
	}
	apply_stock_delta($database, $_SESSION['id_almacen'], $productId, -$quantity);

	if ($product['tipo_combinado'] !== '1') {
		$componentStatement = $database->prepare(
			'select p.id_tipo_comg, p.complementog, c.id_complementog1, c.precio as pvp, '
			. 'p.avgiva, p.bloque_cocina from combinados c join complementog p '
			. 'on p.id_complementog = c.id_complementog1 where c.id_complementog = ?'
		);
		$componentStatement->execute(array($productId));
		$componentCount = 0;
		while ($component = $componentStatement->fetch()) {
			if (!isset($_POST[$component['id_complementog1']])) {
				continue;
			}
			$componentCount++;
			$componentPvp = $product['tipo_combinado'] === '2' ? 0 : (float) $component['pvp'];
			if ($product['tipo_combinado'] === '3') {
				$tariff->execute(array($component['id_complementog1'], $saleId));
				$componentTariff = $tariff->fetchColumn();
				if ($componentTariff !== false) {
					$componentPvp = (float) $componentTariff;
				}
			}
			$componentPrice = $componentPvp / (1 + ($component['avgiva'] / 100));
			$componentBlock = (int) $component['bloque_cocina'] ?: $kitchenBlock;
			$componentInsert = $database->prepare(
				'insert into ventadir_comg (id_complementog, id_venta, cantidad, id_tipo_comg, id_empresa, '
				. 'id_linea, id_centro, PVPTiquet, precio, avgiva, descuento, destino, id_almacen, cocina, '
				. 'complementog, total, nota, observaciones, bloque_cocina) '
				. "values (?, ?, ?, ?, '001', ?, '01', ?, ?, ?, 0, 'V', ?, 0, ?, ?, '', '', ?)"
			);
			$componentInsert->execute(array(
				$component['id_complementog1'], $saleId, $quantity, $component['id_tipo_comg'],
				$componentBaseLine + $componentCount, $componentPvp, $componentPrice, $component['avgiva'],
				$_SESSION['id_almacen'], '-->' . $component['complementog'], $componentPvp, $componentBlock,
			));
			apply_stock_delta($database, $_SESSION['id_almacen'], $component['id_complementog1'], -$quantity);
		}
	}

	$employee = $database->prepare('update ventadirecta set id_camarero = ? where id_venta = ?');
	$employee->execute(array((int) $_SESSION['id_camarero'], $saleId));
	$database->commit();
	api_success(array('sale_id' => $saleId, 'line_id' => $lineId, 'product_id' => $productId));
} catch (InvalidArgumentException $exception) {
	api_error(422, 'invalid_text', 'Las observaciones son demasiado largas.');
} catch (DomainException $exception) {
	if (isset($database) && $database->inTransaction()) {
		$database->rollBack();
	}
	$messages = array(
		'product_not_found' => 'El producto no existe o no está disponible.',
		'manual_price_forbidden' => 'Este producto no permite modificar manualmente el precio.',
		'sale_not_open' => 'La venta ya no está abierta.',
	);
	$status = $exception->getMessage() === 'manual_price_forbidden' ? 403 : 409;
	api_error($status, $exception->getMessage(), $messages[$exception->getMessage()]);
} catch (Exception $exception) {
	if (isset($database) && $database->inTransaction()) {
		$database->rollBack();
	}
	error_log('Insert sale line failed: ' . $exception->getMessage());
	api_error(500, 'insert_line_failed', 'No se pudo añadir el producto; no se aplicó ningún cambio.');
}
