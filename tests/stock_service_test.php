<?php

require_once dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/lib/stock.php';

$failures = 0;
function stock_assert_same($expected, $actual, $message)
{
	global $failures;
	if ($expected !== $actual) {
		$failures++;
		fwrite(STDERR, "FAIL: " . $message . "\nExpected: " . var_export($expected, true)
			. "\nActual: " . var_export($actual, true) . "\n");
	}
}

$database = new PDO('sqlite::memory:');
$database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$database->exec('create table almacen_complementg (id_almacen text, id_complementog text, cantidad real)');
$database->exec('create table pack (id_complementog text, id_complementog1 text, cantidad real)');
$database->exec("insert into almacen_complementg values ('01', 'MENU', 10), ('01', 'DRINK', 20), ('01', 'SYRUP', 30)");
$database->exec("insert into pack values ('MENU', 'DRINK', 2), ('DRINK', 'SYRUP', 0.5)");

$database->beginTransaction();
apply_stock_delta($database, '01', 'MENU', -3);
$database->commit();
$stock = $database->query('select id_complementog, cantidad from almacen_complementg order by id_complementog')->fetchAll(PDO::FETCH_KEY_PAIR);
stock_assert_same(14.0, (float) $stock['DRINK'], 'Nested pack stock uses the component multiplier.');
stock_assert_same(7.0, (float) $stock['MENU'], 'The parent product stock is decremented.');
stock_assert_same(27.0, (float) $stock['SYRUP'], 'Nested components are decremented recursively.');

$database->beginTransaction();
apply_stock_delta($database, '01', 'MENU', 3);
$database->commit();
$restored = $database->query('select id_complementog, cantidad from almacen_complementg order by id_complementog')->fetchAll(PDO::FETCH_KEY_PAIR);
stock_assert_same(20.0, (float) $restored['DRINK'], 'Cancelling or deleting restores component stock.');
stock_assert_same(10.0, (float) $restored['MENU'], 'Cancelling or deleting restores parent stock.');
stock_assert_same(30.0, (float) $restored['SYRUP'], 'Cancelling or deleting restores nested stock.');

$database->exec("insert into pack values ('SYRUP', 'MENU', 1)");
$database->beginTransaction();
try {
	apply_stock_delta($database, '01', 'MENU', -1);
	stock_assert_same(true, false, 'A cyclic pack must be rejected.');
} catch (RuntimeException $exception) {
	$database->rollBack();
	stock_assert_same('Pack configuration contains a cycle.', $exception->getMessage(), 'Cycles return a deterministic error.');
}
$afterRollback = $database->query('select cantidad from almacen_complementg where id_complementog = \'MENU\'')->fetchColumn();
stock_assert_same(10.0, (float) $afterRollback, 'A failed recursive adjustment can be rolled back atomically.');

if ($failures) {
	fwrite(STDERR, $failures . " stock service test(s) failed.\n");
	exit(1);
}

echo "All stock service tests passed.\n";
