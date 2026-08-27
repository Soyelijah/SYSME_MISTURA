<?php
session_start();

require_once '../lib/http.php';
require_once '../lib/security.php';
require_once '../lib/database.php';
require_once '../lib/stock.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	api_error(405, 'method_not_allowed', 'Esta operación requiere una solicitud POST.');
}
require_employee_permission('cancelartiquet');
require_valid_csrf();

$saleId = filter_input(INPUT_POST, 'id_venta', FILTER_VALIDATE_INT);
if (!$saleId) {
	api_error(422, 'invalid_request', 'La venta debe ser válida.');
}

$database = application_database();
try {
	$database->beginTransaction();
	$saleStatement = $database->prepare(
		"select id_venta, imppretiquet from ventadirecta where id_venta = ? and cerrada = 'N' for update"
	);
	$saleStatement->execute(array($saleId));
	$sale = $saleStatement->fetch();
	if (!$sale) {
		throw new DomainException('sale_not_open');
	}
	if ($sale['imppretiquet'] === 'S' && !permission_value_is_allowed(isset($_SESSION['modtraspreticket']) ? $_SESSION['modtraspreticket'] : '')) {
		throw new DomainException('printed_sale_forbidden');
	}

	$lines = $database->prepare(
		'select id_complementog, cantidad from ventadir_comg where id_venta = ? for update'
	);
	$lines->execute(array($saleId));
	while ($line = $lines->fetch()) {
		apply_stock_delta($database, $_SESSION['id_almacen'], $line['id_complementog'], $line['cantidad']);
	}

	$cancel = $database->prepare(
		"update ventadirecta set cerrada = 'C', id_camarero = ? where id_venta = ? and cerrada = 'N'"
	);
	$cancel->execute(array((int) $_SESSION['id_camarero'], $saleId));
	if ($cancel->rowCount() !== 1) {
		throw new RuntimeException('The sale changed concurrently.');
	}
	foreach (array('venta_cocina', 'venta_preticket') as $table) {
		$cleanup = $database->prepare('delete from ' . $table . ' where id_venta = ?');
		$cleanup->execute(array($saleId));
	}
	$database->commit();
	api_success(array('sale_id' => $saleId, 'status' => 'cancelled'));
} catch (DomainException $exception) {
	if ($database->inTransaction()) {
		$database->rollBack();
	}
	$message = $exception->getMessage() === 'printed_sale_forbidden'
		? 'No tienes permiso para cancelar una venta con preticket impreso.'
		: 'La venta ya no está abierta.';
	api_error(409, $exception->getMessage(), $message);
} catch (Exception $exception) {
	if ($database->inTransaction()) {
		$database->rollBack();
	}
	error_log('Cancel sale failed: ' . $exception->getMessage());
	api_error(500, 'cancel_sale_failed', 'No se pudo cancelar la venta; no se aplicó ningún cambio.');
}
