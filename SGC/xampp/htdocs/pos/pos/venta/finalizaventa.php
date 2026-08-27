<?php
session_start();

require_once '../lib/http.php';
require_once '../lib/security.php';
require_once '../lib/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	api_error(405, 'method_not_allowed', 'Esta operación requiere una solicitud POST.');
}

require_employee_permission('finalizarventas');
require_valid_csrf();

$saleId = filter_input(INPUT_POST, 'id_venta', FILTER_VALIDATE_INT);
$paymentMethodId = filter_input(INPUT_POST, 'id_modo_pago', FILTER_VALIDATE_INT);
if (!$saleId || !$paymentMethodId) {
	api_error(422, 'invalid_request', 'La venta y la forma de pago deben ser válidas.');
}

$database = application_database();
$lockName = null;

function release_checkout_lock($database, $lockName)
{
	if ($lockName === null) {
		return;
	}
	try {
		$release = $database->prepare('select release_lock(?)');
		$release->execute(array($lockName));
	} catch (Exception $ignored) {
		// Closing the connection also releases MySQL advisory locks.
	}
}

try {
	$database->beginTransaction();

	$saleStatement = $database->prepare(
		"select id_venta, cerrada from ventadirecta where id_venta = ? for update"
	);
	$saleStatement->execute(array($saleId));
	$sale = $saleStatement->fetch();
	if (!$sale) {
		throw new DomainException('sale_not_found');
	}
	if ($sale['cerrada'] !== 'N') {
		throw new DomainException('sale_already_closed');
	}

	$registerStatement = $database->prepare(
		"select id_apcajas from apcajas where abierta = 'S' and id_caja = ? for update"
	);
	$registerStatement->execute(array((int) $_SESSION['id_caja']));
	$register = $registerStatement->fetch();
	if (!$register) {
		throw new DomainException('register_closed');
	}

	$paymentStatement = $database->prepare(
		"select id_modo_pago from modo_pago where id_modo_pago = ? and activo = 'Y'"
	);
	$paymentStatement->execute(array($paymentMethodId));
	if (!$paymentStatement->fetch()) {
		throw new DomainException('payment_method_invalid');
	}

	$totalStatement = $database->prepare(
		"select round(coalesce(sum((precio - if(descuento = 0, 0, (precio * descuento) / 100))"
		. " * cantidad * (1 + (avgiva / 100))), 0), 2) as total"
		. " from ventadir_comg where id_venta = ?"
	);
	$totalStatement->execute(array($saleId));
	$total = $totalStatement->fetchColumn();
	if ((float) $total <= 0) {
		throw new DomainException('empty_sale');
	}

	$series = (string) $_SESSION['seriefactura'];
	$lockName = 'sysme_ticket_' . sha1($series);
	$lockStatement = $database->prepare('select get_lock(?, 5)');
	$lockStatement->execute(array($lockName));
	if ((int) $lockStatement->fetchColumn() !== 1) {
		throw new RuntimeException('Ticket sequence is busy.');
	}

	$ticketNumberStatement = $database->prepare(
		'select coalesce(max(id_tiquet), 0) + 1 from tiquet where serie = ?'
	);
	$ticketNumberStatement->execute(array($series));
	$ticketNumber = (int) $ticketNumberStatement->fetchColumn();

	$ticketStatement = $database->prepare(
		"insert into tiquet (serie, id_tiquet, id_empresa, id_centro, fecha_tiquet, iva, total, horatiquet)"
		. " values (?, ?, '001', '01', curdate(), 1, ?, curtime())"
	);
	$ticketStatement->execute(array($series, $ticketNumber, $total));

	$cashStatement = $database->prepare(
		'select coalesce(max(id_pagoscobros), 0) + 1 as next_id, '
		. 'round(coalesce((select saldo from pagoscobros where id_apcajas = ? order by id_pagoscobros desc limit 1), 0) + ?, 2) as next_balance '
		. 'from pagoscobros'
	);
	$cashStatement->execute(array($register['id_apcajas'], $total));
	$cash = $cashStatement->fetch();

	$paymentInsert = $database->prepare(
		"insert into pagoscobros (id_pagoscobros, tipo, id_venta, fecha, hora, descripcion, importe,"
		. " id_modo_pago, id_camarero, saldo, id_tiquet, serie_fac, id_apcajas, id_caja)"
		. " values (?, 'E', ?, curdate(), curtime(), ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	);
	$paymentInsert->execute(array(
		$cash['next_id'], $saleId, 'ticket ' . $series . $ticketNumber, $total,
		$paymentMethodId, (int) $_SESSION['id_camarero'], $cash['next_balance'], $ticketNumber,
		$series, $register['id_apcajas'], (int) $_SESSION['id_caja'],
	));

	$closeStatement = $database->prepare(
		"update ventadirecta set cerrada = 'S', serie = ?, id_tiquet = ?, id_camarero = ?"
		. " where id_venta = ? and cerrada = 'N'"
	);
	$closeStatement->execute(array($series, $ticketNumber, (int) $_SESSION['id_camarero'], $saleId));
	if ($closeStatement->rowCount() !== 1) {
		throw new RuntimeException('Sale state changed concurrently.');
	}

	$printStatement = $database->prepare('insert into venta_ticket (id_venta) values (?)');
	$printStatement->execute(array($saleId));
	$database->commit();

	release_checkout_lock($database, $lockName);

	api_success(array(
		'sale_id' => $saleId,
		'ticket_number' => $ticketNumber,
		'total' => number_format((float) $total, 2, '.', ''),
	));
} catch (DomainException $exception) {
	if ($database->inTransaction()) {
		$database->rollBack();
	}
	release_checkout_lock($database, $lockName);
	$errors = array(
		'sale_not_found' => array(404, 'La venta no existe.'),
		'sale_already_closed' => array(409, 'La venta ya estaba finalizada o cancelada.'),
		'register_closed' => array(409, 'La caja está cerrada.'),
		'payment_method_invalid' => array(422, 'La forma de pago no está disponible.'),
		'empty_sale' => array(422, 'No se puede finalizar una venta vacía.'),
	);
	$error = isset($errors[$exception->getMessage()]) ? $errors[$exception->getMessage()] : array(422, 'La operación no es válida.');
	api_error($error[0], $exception->getMessage(), $error[1]);
} catch (Exception $exception) {
	if ($database->inTransaction()) {
		$database->rollBack();
	}
	release_checkout_lock($database, $lockName);
	error_log('Checkout failed: ' . $exception->getMessage());
	api_error(500, 'checkout_failed', 'No se pudo finalizar la venta. No se ha realizado ningún cobro.');
}
