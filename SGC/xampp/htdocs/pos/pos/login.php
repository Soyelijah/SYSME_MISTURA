<?php
session_start();

require_once './lib/http.php';
require_once './lib/security.php';
require_once './lib/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	api_error(405, 'method_not_allowed', 'Esta operación requiere una solicitud POST.');
}
require_valid_csrf();

$employeeId = filter_input(INPUT_POST, 'id_camarero', FILTER_VALIDATE_INT);
$password = isset($_POST['passwd']) ? (string) $_POST['passwd'] : '';
if (!$employeeId) {
	api_error(422, 'invalid_employee', 'Selecciona un empleado válido.');
}

$now = time();
$attempts = isset($_SESSION['login_attempts']) ? (int) $_SESSION['login_attempts'] : 0;
$retryAfter = isset($_SESSION['login_retry_after']) ? (int) $_SESSION['login_retry_after'] : 0;
if ($retryAfter > $now) {
	api_error(429, 'too_many_attempts', 'Demasiados intentos. Espera antes de volver a probar.');
}

try {
	$statement = application_database()->prepare(
		"select id_camarero, clavecamarero, borrarlinea, modtiquet, modtraspreticket, finalizarventas,"
		. " cancelartiquet, preciomanual, cambiartarifa from camareros"
		. " where id_camarero = ? and activo = 'S' limit 1"
	);
	$statement->execute(array($employeeId));
	$employee = $statement->fetch();
	$loginRequired = !isset($_SESSION['login']) || $_SESSION['login'] === 'S';
	$validPassword = false;
	if ($employee && !$loginRequired) {
		$validPassword = true;
	} elseif ($employee && function_exists('password_verify') && strpos($employee['clavecamarero'], '$2y$') === 0) {
		$validPassword = password_verify($password, $employee['clavecamarero']);
	} elseif ($employee) {
		$validPassword = function_exists('hash_equals')
			? hash_equals((string) $employee['clavecamarero'], $password)
			: (string) $employee['clavecamarero'] === $password;
	}

	if (!$validPassword) {
		$attempts++;
		$_SESSION['login_attempts'] = $attempts;
		if ($attempts >= 5) {
			$_SESSION['login_retry_after'] = $now + min(300, ($attempts - 4) * 30);
		}
		api_error(401, 'invalid_credentials', 'Empleado o contraseña incorrectos.');
	}

	session_regenerate_id(true);
	$_SESSION['id_camarero'] = (int) $employee['id_camarero'];
	foreach (array('borrarlinea', 'modtiquet', 'modtraspreticket', 'finalizarventas', 'cancelartiquet', 'preciomanual', 'cambiartarifa') as $permission) {
		$_SESSION[$permission] = $employee[$permission];
	}
	$_SESSION['imagenes'] = isset($_POST['imagenes']) && $_POST['imagenes'] === 'N' ? 'N' : 'Y';
	unset($_SESSION['login_attempts'], $_SESSION['login_retry_after']);
	csrf_token();

	api_success(array('employee_id' => (int) $employee['id_camarero']));
} catch (Exception $exception) {
	error_log('Login failed: ' . $exception->getMessage());
	api_error(500, 'login_failed', 'No se pudo iniciar sesión. Inténtalo de nuevo.');
}
