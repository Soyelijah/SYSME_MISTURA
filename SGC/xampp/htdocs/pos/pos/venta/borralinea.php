<?php
session_start();

require_once '../lib/http.php';
require_once '../lib/security.php';
require_once '../lib/database.php';
require_once '../lib/stock.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	api_error(405, 'method_not_allowed', 'Esta operación requiere una solicitud POST.');
}
require_employee_permission('borrarlinea');
require_valid_csrf();

$saleId = filter_input(INPUT_POST, 'id_venta', FILTER_VALIDATE_INT);
$lineId = filter_input(INPUT_POST, 'borrar_producto', FILTER_VALIDATE_INT);
if (!$saleId || !$lineId) {
	api_error(422, 'invalid_request', 'La venta y la línea deben ser válidas.');
}

$database = application_database();
try {
	$database->beginTransaction();
	$saleStatement = $database->prepare(
		"select id_venta from ventadirecta where id_venta = ? and cerrada = 'N' for update"
	);
	$saleStatement->execute(array($saleId));
	if (!$saleStatement->fetch()) {
		throw new DomainException('sale_not_open');
	}

	$lineStatement = $database->prepare(
		'select id_complementog, cantidad from ventadir_comg where id_venta = ? and id_linea = ? for update'
	);
	$lineStatement->execute(array($saleId, $lineId));
	$line = $lineStatement->fetch();
	if (!$line) {
		throw new DomainException('line_not_found');
	}

	apply_stock_delta($database, $_SESSION['id_almacen'], $line['id_complementog'], $line['cantidad']);
	$archive = $database->prepare(
		'insert into lineaseliminadas select * from ventadir_comg where id_venta = ? and id_linea = ?'
	);
	$archive->execute(array($saleId, $lineId));
	$delete = $database->prepare('delete from ventadir_comg where id_venta = ? and id_linea = ?');
	$delete->execute(array($saleId, $lineId));
	if ($delete->rowCount() !== 1) {
		throw new RuntimeException('The sale line changed concurrently.');
	}

	$employee = $database->prepare('update ventadirecta set id_camarero = ? where id_venta = ?');
	$employee->execute(array((int) $_SESSION['id_camarero'], $saleId));
	$database->commit();
	api_success(array('sale_id' => $saleId, 'line_id' => $lineId, 'product_id' => $line['id_complementog']));
} catch (DomainException $exception) {
	if ($database->inTransaction()) {
		$database->rollBack();
	}
	$status = $exception->getMessage() === 'line_not_found' ? 404 : 409;
	$message = $exception->getMessage() === 'line_not_found' ? 'La línea no existe.' : 'La venta ya no está abierta.';
	api_error($status, $exception->getMessage(), $message);
} catch (Exception $exception) {
	if ($database->inTransaction()) {
		$database->rollBack();
	}
	error_log('Delete sale line failed: ' . $exception->getMessage());
	api_error(500, 'delete_line_failed', 'No se pudo borrar la línea; no se aplicó ningún cambio.');
}
