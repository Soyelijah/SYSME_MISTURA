<?php


// Configuration
require_once '../config.php';
require_once './token.php';
require_once './funciones.php';
if ($token != $_POST['token']) {
    die;
}
$conexion = mysqli_connect(DB_HOSTNAME, DB_USERNAME, DB_PASSWORD) or die('Error');
mysqli_set_charset($conexion, 'utf8');
mysqli_select_db($conexion, DB_DATABASE);
// variables
$product_id = '';
$option_id = '';
$option_value_id = '';
// versión
if ($_POST['version'] == '1.5') {
    $campo = 'option_value';
}
if ($_POST['version'] == '2.0') {
    $campo = 'value';
}
echo 'punto 0';
$result = mysqli_query($conexion, 'select product_id from ' . DB_PREFIX . 'product where model = \'' . $_POST['id_complementog'] . '\'');
echo mysqli_error($conexion);
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $product_id = $row['product_id'];
} else {
    // no existe, sal
    die;
}
echo 'punto 1';
// Obtener option_id y option_value_id en base al nombre de la talla
$result = mysqli_query($conexion, 'select option_id,option_value_id from ' . DB_PREFIX . 'option_value_description where name = \'' . $_POST['variacion'] . '\'');
echo mysqli_error($conexion);
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $option_id = $row['option_id'];
    $option_value_id = $row['option_value_id'];
} else {
    // no existe
    // mira si existe la opción y si no existe la creas
    $result = mysqli_query($conexion, 'select option_id from ' . DB_PREFIX . 'option_description where name = \'' . $_POST['option'] . '\'');
    if (mysqli_num_rows($result) < 1) {
        $result = mysqli_query($conexion, 'insert into ' . DB_DATABASE . '.' . DB_PREFIX . 'option (type,sort_order) values (\'select\',0)');
        echo mysqli_error($conexion);
        $result = mysqli_query($conexion, 'select option_id from ' . DB_DATABASE . '.' . DB_PREFIX . 'option order by option_id desc limit 1');
        $row = mysqli_fetch_array($result);
        $option_id = $row['option_id'];
        $result2 = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'language');
        while ($row2 = mysqli_fetch_array($result2)) {
            $result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'option_description (option_id,language_id,name) values (' . $option_id . ',' . $row2['language_id'] . ',\'' . $_POST['option'] . '\')');
            echo mysqli_error($conexion);
        }
    } else {
        $row = mysqli_fetch_array($result);
        $option_id = $row['option_id'];
    }
    // ahora crea la opción value
    $result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'option_value (option_id,image,sort_order) values (' . $option_id . ',\'\',0)');
    echo mysqli_error($conexion);
    $result = mysqli_query($conexion, 'select option_value_id from ' . DB_PREFIX . 'option_value order by option_value_id desc limit 1');
    $row = mysqli_fetch_array($result);
    $option_value_id = $row['option_value_id'];
    $result2 = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'language');
    while ($row2 = mysqli_fetch_array($result2)) {
        $result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'option_value_description (option_id,language_id,name,option_value_id) values (' . $option_id . ',' . $row2['language_id'] . ',\'' . $_POST['variacion'] . '\',' . $option_value_id . ')');
        echo mysqli_error($conexion);
    }
}
echo 'punto 2';
// Buscar product_option_id en product_option, si no existe en product_option, crealo
$result = mysqli_query($conexion, 'select product_option_id from ' . DB_PREFIX . 'product_option where product_id = ' . $product_id . ' and option_id = ' . $option_id);
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $product_option_id = $row['product_option_id'];
} else {
    $result2 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'product_option (product_id,option_id,' . $campo . ',required) values (' . $product_id . ',' . $option_id . ',\'\',1)');
    $result = mysqli_query($conexion, 'select product_option_id from ' . DB_PREFIX . 'product_option where product_id = ' . $product_id . ' and option_id = ' . $option_id);
    $row = mysqli_fetch_array($result);
    $product_option_id = $row['product_option_id'];
}
// Buscar en product_option_value y actualizar cantidad, si no existe crealo
$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'product_option_value where product_id = ' . $product_id . ' and option_id = ' . $option_id . ' and option_value_id = ' . $option_value_id . ' and product_option_id = ' . $product_option_id);
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $sql = 'update ' . DB_PREFIX . 'product_option_value set quantity = ' . $_POST['stock'] . ' where product_id = ' . $product_id . ' and option_id = ' . $option_id . ' and option_value_id = ' . $option_value_id . ' and product_option_id = ' . $product_option_id . ' and product_option_value_id = ' . $row['product_option_value_id'];
    $result2 = mysqli_query($conexion, $sql);
} else {
    $result2 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'product_option_value (product_option_id,product_id,option_id,option_value_id,quantity,subtract,price,price_prefix,points,points_prefix,weight,weight_prefix) values (' . $product_option_id . ',' . $product_id . ',' . $option_id . ',' . $option_value_id . ',' . $_POST['stock'] . ',1,0,\'+\',0,\'+\',0,\'+\')');
}
echo 'fin';
?>
