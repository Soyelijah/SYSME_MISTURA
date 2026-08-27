<?php

require_once dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/lib/security.php';
require_once dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/lib/config.php';

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
$tokens = array();
for ($index = 0; $index < 32; $index++) {
	$_SESSION = array();
	$tokens[] = csrf_token();
}
security_assert(count(array_unique($tokens)) === count($tokens), 'Generated CSRF tokens are unique.');

security_assert(permission_value_is_allowed('Y'), 'The Y/N permission convention used by the POS is accepted.');
security_assert(permission_value_is_allowed('S'), 'Historical S/N affirmative permissions remain compatible.');
security_assert(!permission_value_is_allowed('N'), 'A denied permission is rejected.');
security_assert(!permission_value_is_allowed(''), 'A missing permission is rejected.');

$checkout = file_get_contents(dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/venta/finalizaventa.php');
security_assert(strpos($checkout, '$_POST[\'total\']') === false, 'Checkout never trusts a client-provided total.');
security_assert(strpos($checkout, 'beginTransaction()') !== false, 'Checkout starts a database transaction.');
security_assert(strpos($checkout, 'rollBack()') !== false, 'Checkout rolls back failed operations.');
security_assert(strpos($checkout, 'require_valid_csrf()') !== false, 'Checkout enforces CSRF protection.');
security_assert(strpos($checkout, "require_employee_permission('finalizarventas')") !== false, 'Checkout enforces employee permission.');

$saleScreen = file_get_contents(dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/venta.php');
security_assert(strpos($saleScreen, "\$_SESSION['finalizarventas'] == 'Y'") !== false, 'The regression fixture confirms that checkout permission is stored as Y/N.');

foreach (array('login.php', 'image.php', 'imagecat.php', 'venta/finalizaventa.php') as $endpoint) {
	$source = file_get_contents(dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/' . $endpoint);
	security_assert(strpos($source, 'mysql_query') === false, $endpoint . ' does not use the legacy query API.');
}

$exampleConfig = file_get_contents(dirname(__FILE__) . '/../SGC/xampp/htdocs/sysmetpv.ini.example');
security_assert(preg_match('/^dbpass\s*=\s*$/m', $exampleConfig) === 1, 'The configuration template contains no database password.');
security_assert(strpos($exampleConfig, 'dbuser = ' . 'root') === false, 'The configuration template does not use the administrative account.');

$emptyConfigDirectory = sys_get_temp_dir() . '/sysme-security-' . uniqid('', true);
mkdir($emptyConfigDirectory, 0700, true);
putenv('SYSME_DB_HOST=127.0.0.1');
putenv('SYSME_DB_PORT=4306');
putenv('SYSME_DB_USER=sysme_test');
putenv('SYSME_DB_PASSWORD=test-only-password');
putenv('SYSME_DB_NAME=sysme_test');
$environmentConfig = application_config($emptyConfigDirectory);
security_assert($environmentConfig['dbuser'] === 'sysme_test', 'Environment variables provide deployment credentials.');
putenv('SYSME_DB_USER=' . 'root');
try {
	application_config($emptyConfigDirectory);
	security_assert(false, 'The administrative database account must be rejected.');
} catch (RuntimeException $exception) {
	security_assert(strpos($exception->getMessage(), 'root') !== false, 'The administrative database account is rejected explicitly.');
}
foreach (array('HOST', 'PORT', 'USER', 'PASSWORD', 'NAME') as $variable) {
	putenv('SYSME_DB_' . $variable);
}
rmdir($emptyConfigDirectory);

if ($failures) {
	fwrite(STDERR, $failures . " security test(s) failed.\n");
	exit(1);
}

echo "All security tests passed.\n";
