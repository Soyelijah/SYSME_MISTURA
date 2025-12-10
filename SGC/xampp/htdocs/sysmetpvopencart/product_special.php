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
$customer_group_id = '';
$_POST['precio'] = str_replace(',', '.', $_POST['precio']);
// versión
if ($_POST['version'] == '1.5') {
    $folder = 'data/';
}
if ($_POST['version'] == '2.0') {
    $folder = 'catalog/';
}
$result = mysqli_query($conexion, 'select product_id,price from ' . DB_PREFIX . 'product where model = \'' . $_POST['id_complementog'] . '\'');
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $product_id = $row['product_id'];
    $precio = $row['price'];
} else {
    // sal
    die;
}
// si no hay product_id, ha habido un fallo .. sal
if ($product_id == '') {
    die;
}
// SI ES OFERTA EJECUTA ESTO Y SAL
if ($_POST['tipoentrada'] == 'oferta') {
    $result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'setting where ' . DB_PREFIX . 'setting.key = \'config_customer_group_id\'');
    $row = mysqli_fetch_array($result);
    $customer_group_id = $row['value'];
    $result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_special where product_id = ' . $product_id);
    if ($_POST['precio'] + 0.02 < $precio) {
        $result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'product_special (product_id,customer_group_id,priority,price,date_start,date_end) values (' . $product_id . ',' . $customer_group_id . ',1,' . $_POST['precio'] . ',"2000-01-01","2100-01-01")');
    }
    echo mysqli_error($conexion);
    die;
}
// FIN SI ES OFERTA
$result = mysqli_query($conexion, 'select customer_group_id from ' . DB_PREFIX . 'customer_group_description where name = \'' . $_POST['tipo'] . '\'');
echo mysqli_error($conexion);
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $customer_group_id = $row['customer_group_id'];
} else {
    // no existe grupo, crealo
    $result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'customer_group (approval,sort_order) values (0,1)');
    echo mysqli_error($conexion);
    $result = mysqli_query($conexion, 'select customer_group_id from ' . DB_PREFIX . 'customer_group order by 1 desc limit 1');
    echo mysqli_error($conexion);
    $row = mysqli_fetch_array($result);
    $customer_group_id = $row['customer_group_id'];
    $result2 = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'language');
    while ($row2 = mysqli_fetch_array($result2)) {
        $result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'customer_group_description (customer_group_id,language_id,name,description) values (' . $customer_group_id . ',' . $row2['language_id'] . ',\'' . $_POST['tipo'] . '\',\'\')');
        echo mysqli_error($conexion);
    }
}
// si no hay product_id, ha habido un fallo .. sal
if ($customer_group_id == '') {
    die;
}
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_discount where product_id = ' . $product_id . ' and customer_group_id = ' . $customer_group_id);
$result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'product_discount (product_id,customer_group_id,priority,price,quantity,date_start,date_end) values (' . $product_id . ',' . $customer_group_id . ',1,' . $_POST['precio'] . ',1,"2000-01-01","2100-01-01")');
echo mysqli_error($conexion);
?>
