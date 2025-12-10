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
$category_id = '';
$parent = '';
// versión
if ($_POST['version'] == '1.5') {
    $folder = 'data/';
}
if ($_POST['version'] == '2.0') {
    $folder = 'catalog/';
}
$result = mysqli_query($conexion, 'select category_id from ' . DB_PREFIX . 'category where image = \'' . $folder . $_POST['categoria'] . '.jpg\'');
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $category_id = $row['category_id'];
}
$result = mysqli_query($conexion, 'select category_id from ' . DB_PREFIX . 'category where image = \'' . $folder . $_POST['padre'] . '.jpg\'');
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $parent = $row['category_id'];
}
if ($category_id != '' and $parent != '') {
    $result = mysqli_query($conexion, 'update ' . DB_PREFIX . 'category set parent_id = ' . $parent . ' where category_id = ' . $category_id);
}
?>
