<?php

// Configuration
require_once '../config.php';
require_once './token.php';
if ($token != $_GET['token']) {
    die;
}
$conexion = mysqli_connect(DB_HOSTNAME, DB_USERNAME, DB_PASSWORD) or die('Error');
mysqli_set_charset($conexion, 'utf8');
mysqli_select_db($conexion, DB_DATABASE);
$result = mysqli_query($conexion, 'update ' . DB_DATABASE . '.' . DB_PREFIX . 'order set importado = \'Y\' where order_id = ' . $_GET['order_id']);
?>