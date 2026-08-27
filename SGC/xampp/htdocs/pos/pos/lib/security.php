<?php

function security_random_token()
{
	if (function_exists('random_bytes')) {
		return bin2hex(random_bytes(32));
	}

	return bin2hex(openssl_random_pseudo_bytes(32));
}

function csrf_token()
{
	if (empty($_SESSION['csrf_token'])) {
		$_SESSION['csrf_token'] = security_random_token();
	}

	return $_SESSION['csrf_token'];
}

function csrf_is_valid($token)
{
	$expected = isset($_SESSION['csrf_token']) ? $_SESSION['csrf_token'] : '';
	if (!is_string($token) || $expected === '') {
		return false;
	}

	return function_exists('hash_equals') ? hash_equals($expected, $token) : $expected === $token;
}

function require_authenticated_employee()
{
	if (empty($_SESSION['id_camarero'])) {
		api_error(401, 'authentication_required', 'La sesión ha caducado. Vuelve a identificarte.');
	}
}

function require_employee_permission($permission)
{
	require_authenticated_employee();
	if (!isset($_SESSION[$permission]) || $_SESSION[$permission] !== 'S') {
		api_error(403, 'permission_denied', 'No tienes permiso para realizar esta operación.');
	}
}

function require_valid_csrf()
{
	$token = isset($_POST['csrf_token']) ? $_POST['csrf_token'] : '';
	if (!csrf_is_valid($token)) {
		api_error(403, 'invalid_csrf', 'La solicitud ha caducado. Actualiza la pantalla e inténtalo de nuevo.');
	}
}
