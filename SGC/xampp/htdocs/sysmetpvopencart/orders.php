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
$result = mysqli_query($conexion, 'select * from ' . DB_DATABASE . '.' . DB_PREFIX . 'order where importado = \'N\' and order_status_id > 0');
if (mysqli_num_rows($result) == 0) {
    die;
}
echo '[';
while ($row = mysqli_fetch_array($result)) {
    echo '{';
    $col = mysqli_field_count($conexion);
    for ($i = 0; $i < $col; $i++) {
        $column = mysqli_fetch_field_direct($result, $i);
        echo '"' . $column->name . '":';
        if ($column->numeric == 1) {
            $valor = $row[$column->name];
        } else {
            $valor = '"' . $row[$column->name] . '"';
        }
        echo $valor . ',';
    }
    echo '}';
}
echo ']';
?>
