<?php
session_start();
if (!isset($_SESSION['id_camarero'])) {
	http_response_code(401);
	exit();
}

require_once './conn.php';
require_once './lib/product_pagination.php';

$parent = isset($_POST['padre']) ? (string) $_POST['padre'] : 'F';
$requestedOffset = isset($_POST['desde']) ? $_POST['desde'] : 0;
$escapedParentSql = mysql_real_escape_string($parent, $conexion);

if ($parent === 'F') {
	$productFilter = " and favorito = 'Y'";
} else {
	$productFilter = " and (id_tipo_comg = '" . $escapedParentSql . "'"
		. " or id_complementog in (select id_complementog from tipo_comg_comg"
		. " where id_tipo_comg = '" . $escapedParentSql . "'))";
}

$countSql = "select count(*) as cuenta from complementog where venta = 'S' and cafeteria = 'S'" . $productFilter;
$countResult = mysql_query($countSql, $conexion);
if ($countResult === false) {
	http_response_code(500);
	exit('No se ha podido cargar el catálogo de productos.');
}

$countRow = mysql_fetch_array($countResult);
$pagination = product_pagination($requestedOffset, $countRow['cuenta']);
$offset = $pagination['offset'];
$limit = $pagination['limit'];

$output = '';
if ($pagination['has_previous']) {
	$output .= product_navigation_link($parent, $pagination['previous_offset'], 'Volver', './images/volver.jpg');
}

$allowedOrderColumns = array(
	'0' => 'id_complementog',
	'1' => 'complementog',
	'2' => 'sort_order',
);
$requestedOrder = isset($_SESSION['orderpro']) ? (string) $_SESSION['orderpro'] : '0';
$orderBy = isset($allowedOrderColumns[$requestedOrder]) ? $allowedOrderColumns[$requestedOrder] : $allowedOrderColumns['0'];

$productSql = "select * from complementog where venta = 'S' and cafeteria = 'S'"
	. $productFilter
	. " order by " . $orderBy
	. " limit " . (int) $offset . "," . (int) $limit;
$productResult = mysql_query($productSql, $conexion);
if ($productResult === false) {
	http_response_code(500);
	exit('No se ha podido cargar el catálogo de productos.');
}

while ($product = mysql_fetch_array($productResult)) {
	$productId = (string) $product['id_complementog'];
	$escapedProductIdSql = mysql_real_escape_string($productId, $conexion);
	$productIdHtml = htmlspecialchars($productId, ENT_QUOTES, 'UTF-8');
	$productIdJs = htmlspecialchars(json_encode($productId), ENT_QUOTES, 'UTF-8');

	$combinationResult = mysql_query(
		"select 1 from combinados where id_complementog = '" . $escapedProductIdSql . "' limit 1",
		$conexion
	);
	$hasCombinations = $combinationResult !== false && mysql_num_rows($combinationResult) > 0;
	$requiresOptions = $product['solicitaopciones'] === 'S' || $hasCombinations || (float) $product['precio'] === 0.0;
	$clickHandler = $requiresOptions ? 'ficha_producto' : 'plusone';

	$alias = trim((string) $product['alias']);
	$productName = $alias !== '' ? $alias : substr((string) $product['complementog'], 0, 40);
	$productNameHtml = htmlspecialchars($productName, ENT_QUOTES, 'UTF-8');
	$linkId = 'link2' . $productIdHtml;

	$output .= '<div class="botonpro">';
	$output .= '<a class="btncat" href="#" id="' . $linkId . '" onclick="'
		. $clickHandler . '(' . $productIdJs . '); return false;">';
	$output .= $productNameHtml;

	if (isset($_SESSION['imagenes']) && $_SESSION['imagenes'] === 'Y') {
		$output .= '<img id="imgproducto-' . $productIdHtml . '" class="imgproducto" '
			. 'src="./image.php?id=' . rawurlencode($productId) . '" alt="" width="100%" height="100%" />';
	}

	$output .= '</a>';
	$output .= '<div id="link' . $productIdHtml . '" class="procuenta"></div>';
	$output .= '<div id="linkcocina' . $productIdHtml . '" class="procuenta2"></div>';
	$output .= '</div>';
}

if ($pagination['has_next']) {
	$output .= product_navigation_link($parent, $pagination['next_offset'], 'Siguiente', './images/adelante.jpg');
}

echo $output;
