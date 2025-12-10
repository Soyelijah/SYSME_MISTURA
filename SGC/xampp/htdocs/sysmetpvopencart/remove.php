<?php


// Configuration
require_once '../config.php';
require_once './token.php';
if ($token != $_POST['token']) {
    die;
}
if (!isset($_POST['tipo'])) {
    die;
}
$conexion = mysqli_connect(DB_HOSTNAME, DB_USERNAME, DB_PASSWORD) or die('Error');
mysqli_set_charset($conexion, 'utf8');
mysqli_select_db($conexion, DB_DATABASE);
if ($_POST['tipo'] == 'CAT') {
    $category_id = '';
    $result = mysqli_query($conexion, 'select category_id from ' . DB_PREFIX . 'category where image = \'data/' . $_POST['item'] . '.jpg\'');
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_array($result);
        $category_id = $row['category_id'];
        if ($category_id != '') {
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category_description where category_id = ' . $category_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category_path where category_id = ' . $category_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category_path where path_id = ' . $category_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category_filter where category_id = ' . $category_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category_to_layout where category_id = ' . $category_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category_to_store where category_id = ' . $category_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'url_alias where query = \'category_id=' . $category_id . '\'');
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category where category_id = ' . $category_id);
        }
    }
}
if ($_POST['tipo'] == 'PRO') {
    $product_id = '';
    $result = mysqli_query($conexion, 'select product_id from ' . DB_PREFIX . 'product where model = \'' . $_POST['item'] . '\'');
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_array($result);
        $product_id = $row['product_id'];
        if ($product_id != '') {
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_description where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_to_store where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_image where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_attribute where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_discount where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_filter where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_option where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_option_value where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_related where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_reward where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_special where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_to_download where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_to_layout where product_id = ' . $product_id);
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'url_alias where query = \'product_id=' . $product_id . '\'');
            $result2 = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product where product_id = ' . $product_id);
        }
    }
}
?>
