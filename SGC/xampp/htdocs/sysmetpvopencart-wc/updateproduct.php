<?php
// Configuration

require_once '../wp-config.php';
require_once './token.php';

if ($token != $_POST['token']) {
    die;
}
$conexion = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD) or die('Error');
mysqli_set_charset($conexion, 'utf8');
mysqli_select_db($conexion, DB_NAME);
// variables
$table_prefix = $table_prefix;
$errores = '';
$product_id = $_POST['idinterno'];
$_POST['stock'] = str_replace(',', '.', $_POST['stock']);

    // valor de stock
    $sql = 'update ' . $table_prefix . 'postmeta set ';

    $sql = $sql . 'meta_value = ' . $_POST['stock'] . '';

    $sql = $sql . ' where post_id = ' . $product_id . ' and meta_key = "_stock"';
    $result2 = mysqli_query($conexion, $sql);
    $errores = $errores.mysqli_error($conexion);
	
    // texto de stock
    $sql = 'update ' . $table_prefix . 'postmeta set ';

	if ($_POST['stock'] > 0)
		{
		$sql = $sql . 'meta_value = "instock"';
		}
	else	
		{
		$sql = $sql . 'meta_value = "outofstock"';	
		}
    $sql = $sql . ' where post_id = ' . $product_id . ' and meta_key = "_stock_status"';
    $result2 = mysqli_query($conexion, $sql);
    $errores = $errores.mysqli_error($conexion);


// RESPUESTA
if ($errores == "")
{ echo "OK"; }
else
{ echo $errores; }
?>
