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
require_employee_permission('modtiquet');
require_valid_csrf();

$saleId = filter_input(INPUT_POST, 'id_venta', FILTER_VALIDATE_INT);
$lineId = filter_input(INPUT_POST, 'update_linea', FILTER_VALIDATE_INT);
$quantity = request_positive_number(isset($_POST['cantidad']) ? $_POST['cantidad'] : null);
$submittedPvp = request_nonnegative_number(isset($_POST['precio']) ? $_POST['precio'] : null);
$kitchenBlock = filter_var(isset($_POST['bloque_cocina']) ? $_POST['bloque_cocina'] : 1, FILTER_VALIDATE_INT);
if (!$saleId || !$lineId || $quantity === null || $submittedPvp === null || $kitchenBlock === false || $kitchenBlock < 1 || $kitchenBlock > 99) {
	api_error(422, 'invalid_request', 'Los datos de la línea no son válidos.');
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

	$lineStatement = $database->prepare(
		'select * from ventadir_comg where id_venta = ? and id_linea = ? for update'
	);
	$lineStatement->execute(array($saleId, $lineId));
	$line = $lineStatement->fetch();
	if (!$line) {
		throw new DomainException('line_not_found');
	}

	$productStatement = $database->prepare(
		'select cocina, tipo_combinado, permitircambioprecio from complementog where id_complementog = ?'
	);
	$productStatement->execute(array($line['id_complementog']));
	$product = $productStatement->fetch();
	if (!$product) {
		throw new DomainException('product_not_found');
	}

	$currentPvp = round($line['precio'] * (1 + ($line['avgiva'] / 100)), 2);
	$priceChanged = abs($submittedPvp - $currentPvp) >= 0.005;
	if ($priceChanged && (
		!permission_value_is_allowed(isset($_SESSION['preciomanual']) ? $_SESSION['preciomanual'] : '')
		|| $product['permitircambioprecio'] !== 'S'
	)) {
		throw new DomainException('manual_price_forbidden');
	}
	$basePrice = $priceChanged ? $submittedPvp / (1 + ($line['avgiva'] / 100)) : $line['precio'];
	$pvp = $priceChanged ? $submittedPvp : $currentPvp;

	$notes = '';
	if ($product['cocina'] === 'Y') {
		$noteStatement = $database->query('select id_nota, nota from notacocina');
		while ($note = $noteStatement->fetch()) {
			if (isset($_POST[$note['id_nota']])) {
				$notes .= ' * ' . $note['nota'];
			}
		}
	}

	$stockDelta = (float) $line['cantidad'] - $quantity;
	if ($stockDelta != 0) {
		apply_stock_delta($database, $_SESSION['id_almacen'], $line['id_complementog'], $stockDelta);
	}
	$kitchenQuantity = min((float) $line['cocina'], $quantity);
	$update = $database->prepare(
		'update ventadir_comg set cantidad = ?, precio = ?, PVPTiquet = ?, total = ?, cocina = ?, '
		. 'nota = ?, observaciones = ?, bloque_cocina = ? where id_venta = ? and id_linea = ?'
	);
	$update->execute(array(
		$quantity, $basePrice, $pvp, $pvp, $kitchenQuantity, $notes, $observations,
		$kitchenBlock, $saleId, $lineId,
	));

	if ($product['tipo_combinado'] !== '1') {
		$nextLine = $database->prepare('select coalesce(max(id_linea), 0) + 1 from ventadir_comg where id_venta = ?');
		$nextLine->execute(array($saleId));
		$extraLineId = (int) $nextLine->fetchColumn();
		$components = $database->prepare(
			'select p.id_tipo_comg, p.complementog, c.id_complementog1, c.precio as pvp, '
			. 'p.avgiva, p.bloque_cocina from combinados c join complementog p '
			. 'on p.id_complementog = c.id_complementog1 where c.id_complementog = ?'
		);
		$components->execute(array($line['id_complementog']));
		while ($component = $components->fetch()) {
			if (!isset($_POST[$component['id_complementog1']])) {
				continue;
			}
			$componentPvp = $product['tipo_combinado'] === '2' ? 0 : (float) $component['pvp'];
			$componentPrice = $componentPvp / (1 + ($component['avgiva'] / 100));
			$componentBlock = (int) $component['bloque_cocina'] ?: $kitchenBlock;
			$insert = $database->prepare(
				'insert into ventadir_comg (id_complementog, id_venta, cantidad, id_tipo_comg, id_empresa, '
				. 'id_linea, id_centro, PVPTiquet, precio, avgiva, descuento, destino, id_almacen, cocina, '
				. 'complementog, total, nota, observaciones, bloque_cocina) '
				. "values (?, ?, ?, ?, '001', ?, '01', ?, ?, ?, 0, 'V', ?, 0, ?, ?, '', '', ?)"
			);
			$insert->execute(array(
				$component['id_complementog1'], $saleId, $quantity, $component['id_tipo_comg'], $extraLineId++,
				$componentPvp, $componentPrice, $component['avgiva'], $_SESSION['id_almacen'],
				'-->' . $component['complementog'], $componentPvp, $componentBlock,
			));
			apply_stock_delta($database, $_SESSION['id_almacen'], $component['id_complementog1'], -$quantity);
		}
	}

	$employee = $database->prepare('update ventadirecta set id_camarero = ? where id_venta = ?');
	$employee->execute(array((int) $_SESSION['id_camarero'], $saleId));
	$database->commit();
	api_success(array('sale_id' => $saleId, 'line_id' => $lineId));
} catch (InvalidArgumentException $exception) {
	api_error(422, 'invalid_text', 'Las observaciones son demasiado largas.');
} catch (DomainException $exception) {
	if (isset($database) && $database->inTransaction()) {
		$database->rollBack();
	}
	$messages = array(
		'sale_not_open' => 'La venta ya no está abierta.',
		'line_not_found' => 'La línea no existe.',
		'product_not_found' => 'El producto ya no existe.',
		'manual_price_forbidden' => 'No tienes permiso para modificar el precio.',
	);
	$status = $exception->getMessage() === 'manual_price_forbidden' ? 403 : 409;
	api_error($status, $exception->getMessage(), $messages[$exception->getMessage()]);
} catch (Exception $exception) {
	if (isset($database) && $database->inTransaction()) {
		$database->rollBack();
	}
	error_log('Update sale line failed: ' . $exception->getMessage());
	api_error(500, 'update_line_failed', 'No se pudo actualizar la línea; no se aplicó ningún cambio.');
}
