<?php

require_once dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/lib/security.php';

$failures = 0;
function security_assert($condition, $message)
{
	global $failures;
	if (!$condition) {
		$failures++;
		fwrite(STDERR, "FAIL: " . $message . "\n");
	}
}

$_SESSION = array();
$token = csrf_token();
security_assert(is_string($token) && strlen($token) === 64, 'CSRF tokens contain 256 bits encoded as hexadecimal.');
security_assert(csrf_token() === $token, 'The CSRF token remains stable during a session.');
security_assert(csrf_is_valid($token), 'The current CSRF token is accepted.');
security_assert(!csrf_is_valid('invalid'), 'An invalid CSRF token is rejected.');
security_assert(!csrf_is_valid(null), 'A missing CSRF token is rejected.');

$checkout = file_get_contents(dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/venta/finalizaventa.php');
security_assert(strpos($checkout, '$_POST[\'total\']') === false, 'Checkout never trusts a client-provided total.');
security_assert(strpos($checkout, 'beginTransaction()') !== false, 'Checkout starts a database transaction.');
security_assert(strpos($checkout, 'rollBack()') !== false, 'Checkout rolls back failed operations.');
security_assert(strpos($checkout, 'require_valid_csrf()') !== false, 'Checkout enforces CSRF protection.');
security_assert(strpos($checkout, "require_employee_permission('finalizarventas')") !== false, 'Checkout enforces employee permission.');

foreach (array('login.php', 'image.php', 'imagecat.php', 'venta/finalizaventa.php') as $endpoint) {
	$source = file_get_contents(dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/' . $endpoint);
	security_assert(strpos($source, 'mysql_query') === false, $endpoint . ' does not use the legacy query API.');
}

$exampleConfig = file_get_contents(dirname(__FILE__) . '/../SGC/xampp/htdocs/sysmetpv.ini.example');
security_assert(preg_match('/^dbpass\s*=\s*$/m', $exampleConfig) === 1, 'The configuration template contains no database password.');
security_assert(strpos($exampleConfig, 'dbuser = ' . 'root') === false, 'The configuration template does not use the administrative account.');

if ($failures) {
	fwrite(STDERR, $failures . " security test(s) failed.\n");
	exit(1);
}

echo "All security tests passed.\n";
