<?php

require_once dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/lib/product_pagination.php';

$failures = 0;

function assert_same($expected, $actual, $message)
{
	global $failures;
	if ($expected !== $actual) {
		$failures++;
		fwrite(STDERR, "FAIL: " . $message . "\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true) . "\n");
	}
}

function assert_true($condition, $message)
{
	assert_same(true, (bool) $condition, $message);
}

// Empty and short result sets never expose navigation controls.
$page = product_pagination(0, 0);
assert_same(0, $page['offset'], 'An empty result starts at offset zero.');
assert_same(false, $page['has_previous'], 'An empty result has no previous page.');
assert_same(false, $page['has_next'], 'An empty result has no next page.');

$page = product_pagination(0, 14);
assert_same(false, $page['has_next'], 'A short first page has no next page.');

// The exact first-page capacity must not create an empty page.
$page = product_pagination(0, 15);
assert_same(15, $page['limit'], 'The first page contains at most 15 products.');
assert_same(false, $page['has_next'], 'Exactly 15 products fit on the first page.');

// Middle pages use 14 product slots because both navigation controls may exist.
$first = product_pagination(0, 43);
$middle = product_pagination($first['next_offset'], 43);
$last = product_pagination($middle['next_offset'], 43);
assert_same(15, $first['next_offset'], 'The second page starts after the first 15 products.');
assert_same(14, $middle['limit'], 'A subsequent page contains at most 14 products.');
assert_same(0, $middle['previous_offset'], 'The second page returns to offset zero.');
assert_same(29, $middle['next_offset'], 'The third page follows the 14 middle products.');
assert_same(15, $last['previous_offset'], 'The third page returns to the second page without overlap.');
assert_same(false, $last['has_next'], 'The last page has no next control.');

// Walking every page must cover every product exactly once.
$visited = array();
$offset = 0;
do {
	$page = product_pagination($offset, 100);
	$end = min(100, $page['offset'] + $page['limit']);
	for ($id = $page['offset']; $id < $end; $id++) {
		$visited[] = $id;
	}
	$offset = $page['next_offset'];
} while ($page['has_next']);
assert_same(range(0, 99), $visited, 'A full traversal includes each product exactly once.');

// Invalid and stale offsets are normalized instead of reaching SQL unchanged.
$negativeOffsetPage = product_pagination('-20', 30);
$staleOffsetPage = product_pagination('999', 30);
assert_same(0, $negativeOffsetPage['offset'], 'Negative offsets are normalized to zero.');
assert_same(29, $staleOffsetPage['offset'], 'An excessive offset is moved to the final page.');

// Navigation markup remains valid, accessible, and safe for quoted categories.
$link = product_navigation_link("cat'\"</a>", 15, 'Siguiente', './images/adelante.jpg');
assert_true(strpos($link, 'href="#"') !== false, 'Navigation uses a quoted fallback href.');
assert_true(strpos($link, 'return false;') !== false, 'Navigation prevents the fallback action.');
assert_true(strpos($link, 'aria-label="Siguiente"') !== false, 'Navigation exposes an accessible label.');
assert_true(strpos($link, 'href=javascript:void(null);"') === false, 'The malformed legacy href cannot regress.');
assert_true(strpos($link, "cat'\"") === false, 'Untrusted category text is not emitted as raw markup.');

// The customer-facing closed-register message keeps the corrected spelling.
$checkout = file_get_contents(dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/finaliza_venta.php');
assert_true(strpos($checkout, 'vinculado está cerrado;') !== false, 'The closed-register message uses “está”.');

if ($failures > 0) {
	fwrite(STDERR, $failures . " test(s) failed.\n");
	exit(1);
}

echo "All product pagination tests passed.\n";
