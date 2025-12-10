<?php


// Configuration
require_once '../config.php';
require_once './token.php';
if ($token != $_POST['token']) {
    die;
}
$conexion = mysqli_connect(DB_HOSTNAME, DB_USERNAME, DB_PASSWORD) or die('Error');
mysqli_set_charset($conexion, 'utf8');
mysqli_select_db($conexion, DB_DATABASE);
// variables
$product_id = '';
// versión
if ($_POST['version'] == '1.5') {
    $folder = 'data/';
}
if ($_POST['version'] == '2.0') {
    $folder = 'catalog/';
}
$result = mysqli_query($conexion, 'select product_id from ' . DB_PREFIX . 'product where model = \'' . $_POST['id_complementog'] . '\'');
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $product_id = $row['product_id'];
} else {
    // sal
    die;
}
// si no hay product_id, ha habido un fallo .. sal
if ($product_id == '') {
    die;
}
// categoria
$category_id = '';
if (isset($_POST['id_tipo_comg'])) {
    // mira si existe
    $result = mysqli_query($conexion, 'select category_id from ' . DB_PREFIX . 'category where image = \'' . $folder . $_POST['id_tipo_comg'] . '.jpg\'');
    if (mysqli_num_rows($result) > 0) {
        // existe
        $row = mysqli_fetch_array($result);
        $category_id = $row['category_id'];
        $result2 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'product_to_category (category_id,product_id) values (' . $category_id . ',' . $product_id . ')');
    }
}
?>
