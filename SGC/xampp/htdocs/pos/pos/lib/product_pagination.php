<?php

/**
 * Calculates the product grid pagination without requiring a database connection.
 *
 * The grid has 16 visual slots. The first page reserves one slot for "Next" and
 * subsequent pages reserve one for "Back" and one for "Next". Consequently the
 * first page contains up to 15 products and every subsequent page up to 14.
 *
 * @param mixed $requestedOffset Untrusted offset supplied by the request.
 * @param mixed $totalProducts   Number of matching products.
 *
 * @return array<string, int|bool|null>
 */
function product_pagination($requestedOffset, $totalProducts)
{
	$total = max(0, (int) $totalProducts);
	$offset = max(0, (int) $requestedOffset);

	if ($offset >= $total && $total > 0) {
		$offset = product_last_page_offset($total);
	}

	$limit = ($offset === 0) ? 15 : 14;
	$hasPrevious = $offset > 0;
	$hasNext = ($offset + $limit) < $total;

	return array(
		'offset' => $offset,
		'limit' => $limit,
		'previous_offset' => $hasPrevious ? (($offset <= 15) ? 0 : max(15, $offset - 14)) : null,
		'next_offset' => $hasNext ? $offset + $limit : null,
		'has_previous' => $hasPrevious,
		'has_next' => $hasNext,
	);
}

/**
 * Returns the first product offset of the final non-empty page.
 *
 * @param int $totalProducts
 *
 * @return int
 */
function product_last_page_offset($totalProducts)
{
	$total = max(0, (int) $totalProducts);
	if ($total <= 15) {
		return 0;
	}

	return 15 + (int) (floor(($total - 16) / 14) * 14);
}

/**
 * Renders an accessible navigation control for the product grid.
 *
 * json_encode safely produces the JavaScript string literal for the category.
 * The return false keeps the fallback href from changing the current location.
 *
 * @param string $parent
 * @param int    $offset
 * @param string $label
 * @param string $image
 *
 * @return string
 */
function product_navigation_link($parent, $offset, $label, $image)
{
	$encodedParent = json_encode((string) $parent);
	$escapedLabel = htmlspecialchars($label, ENT_QUOTES, 'UTF-8');
	$escapedImage = htmlspecialchars($image, ENT_QUOTES, 'UTF-8');

	return '<div class="botonpro">'
		. '<a class="btncat" href="#" aria-label="' . $escapedLabel . '" '
		. 'onclick="showproductos(' . htmlspecialchars($encodedParent, ENT_QUOTES, 'UTF-8') . ',' . (int) $offset . '); return false;">'
		. '<span class="btncat">' . $escapedLabel . '</span><br/>'
		. '<img src="' . $escapedImage . '" alt="" width="100%" height="100%" />'
		. '</a></div>';
}
