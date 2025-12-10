<?php


// Configuration
$errores = "";
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
$_POST['precio'] = str_replace(',', '.', $_POST['precio']);
if (!isset($_POST['peso'])) {
    $_POST['peso'] = 0;
}
$_POST['peso'] = str_replace(',', '.', $_POST['peso']);
$_POST['pvr'] = str_replace(',', '.', $_POST['pvr']);
$_POST['stock'] = str_replace(',', '.', $_POST['stock']);
$_POST['avgiva'] = str_replace(',', '.', $_POST['avgiva']);
$_POST['html'] = limpiatexto($_POST['html']);
$_POST['nombre'] = limpiatexto($_POST['nombre']);
$_POST['descripcion'] = limpiatexto($_POST['descripcion']);
// versión
if ($_POST['version'] == '1.5') {
    $folder = 'data/';
}
if ($_POST['version'] == '2.0') {
    $folder = 'catalog/';
}
// ACTUALIZA LA TABLA PRODUCTOS CON PVR
//$result = mysqli_query($conexion, 'alter table ' . DB_PREFIX . 'product add pvr float default 0');
$result = mysqli_query($conexion, 'select product_id from ' . DB_PREFIX . 'product where model = \'' . $_POST['id_complementog'] . '\'');
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $product_id = $row['product_id'];
    // existe, actualiza
    $sql = 'update ' . DB_PREFIX . 'product set ';
    $sql = $sql . 'model = \'' . $_POST['id_complementog'] . '\',';
    $sql = $sql . 'upc = \'\',';
    $sql = $sql . 'EAN = \'' . $_POST['codbarras'] . '\',';
    $sql = $sql . 'quantity = ' . $_POST['stock'] . ',';
    $sql = $sql . 'image = \'' . $folder . $_POST['id_complementog'] . '.jpg\',';
    $sql = $sql . 'price = \'' . $_POST['precio'] . '\',';
	$sql = $sql . 'subtract = 1,';
    $sql = $sql . 'weight = \'' . $_POST['peso'] . '\',';
    //$sql = $sql . 'pvr = \'' . $_POST['pvr'] . '\',';
    $sql = $sql . 'sort_order = ' . $_POST['sort_order'] . ',';
    $sql = $sql . 'date_modified = curdate() ';
    $sql = $sql . ' where product_id = ' . $product_id;
    $result2 = mysqli_query($conexion, $sql);
    $errores = $errores.mysqli_error($conexion);
} else {
    // no existe, crea
    $sql = 'insert into ' . DB_PREFIX . 'product (model,upc,sku,location,EAN,jan,isbn,mpn,quantity,stock_status_id,image,shipping,price,points,tax_class_id,';
    $sql = $sql . 'date_available,weight,weight_class_id,length,length_class_id,subtract,minimum,sort_order,status,date_added,date_modified,manufacturer_id,viewed)';
    $sql = $sql . ' values (';
    $sql = $sql . '\'' . $_POST['id_complementog'] . '\',';
    $sql = $sql . '\'\',';
    $sql = $sql . '\'\',';
    $sql = $sql . '\'\',';
	$sql = $sql . '\'' . $_POST['codbarras'] . '\',';
    $sql = $sql . '\'\',';
    $sql = $sql . '\'\',';
    $sql = $sql . '\'\',';
    $sql = $sql . '' . $_POST['stock'] . ',';
    $sql = $sql . '5,';
    $sql = $sql . '\'' . $folder . $_POST['id_complementog'] . '.jpg\',';
    $sql = $sql . '1,';
    $sql = $sql . '' . $_POST['precio'] . ',';
    $sql = $sql . '0,';
    $sql = $sql . '9,';
    $sql = $sql . 'curdate(),';
    $sql = $sql . '' . $_POST['peso'] . ',';
    $sql = $sql . '1,';
    $sql = $sql . '0,';
    $sql = $sql . '0,';
    $sql = $sql . '1,';
    $sql = $sql . '1,';
    $sql = $sql . $_POST['sort_order'] . ',';
    $sql = $sql . '1,';
    $sql = $sql . 'curdate(),';
    $sql = $sql . 'curdate(),';
    $sql = $sql . '0,';
    $sql = $sql . '0';
    $sql = $sql . ')';
    $result2 = mysqli_query($conexion, $sql);
    $errores = $errores.mysqli_error($conexion);
    $result2 = mysqli_query($conexion, 'select product_id from ' . DB_PREFIX . 'product where model = \'' . $_POST['id_complementog'] . '\'');
    if (mysqli_num_rows($result2) > 0) {
        $row2 = mysqli_fetch_array($result2);
        $product_id = $row2['product_id'];
    }
}
// si no hay product_id, ha habido un fallo .. sal
if ($product_id == '') {
    die;
}


// friendly
if ($_POST['friendly'] == '') {
    $_POST['friendly'] = $_POST['id_complementog'];
}
// friendly 2x
$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'url_alias where query = \'product_id=' . $product_id . '\'');
if (mysqli_num_rows($result) > 0) {
    $result2 = mysqli_query($conexion, 'update ' . DB_PREFIX . 'url_alias set keyword = \'' . $_POST['friendly'] . '\' where query = \'product_id=' . $product_id . '\'');
} else {
    $result2 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'url_alias (keyword,query) values (\'' . $_POST['friendly'] . '\',\'product_id=' . $product_id . '\')');
	$errores = $errores.mysqli_error($conexion);
}
// friendly 3x
//$resultstore = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'store');
//while ($rowstore = mysqli_fetch_array($resultstore)) 
//{
	$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'seo_url where query = \'product_id=' . $product_id . '\'');
	if (mysqli_num_rows($result) > 0) {
		$result2 = mysqli_query($conexion, 'update ' . DB_PREFIX . 'seo_url set keyword = \'' . $_POST['friendly'] . '\' where query = \'product_id=' . $product_id . '\'');
	} else 
	{
	$resultlang = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'language');
	while ($rowlang = mysqli_fetch_array($resultlang)) 
		{
		$result2 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'seo_url (keyword,query,store_id,language_id) values (\'' . $_POST['friendly'] . '\',\'product_id=' . $product_id . '\',0,'.$rowlang['language_id'].')');
		//$errores = $errores.mysqli_error($conexion);
		}
	}
//}

// descripciones
//$result = mysql_query("delete from ".DB_PREFIX."product_description where product_id = ".$product_id,$conexion);
$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'language');
while ($row = mysqli_fetch_array($result)) {
    $result3 = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'product_description where product_id = ' . $product_id . ' and language_id = ' . $row['language_id']);
    if (mysqli_num_rows($result3) > 0) {
        if ($_POST['sinchtml'] == 'Y') {
            $sql = 'update ' . DB_PREFIX . 'product_description set ';
            $sql = $sql . 'name = \'' . $_POST['nombre'] . '\',';
            $sql = $sql . 'description = \'' . $_POST['html'] . '\',';
            $sql = $sql . 'meta_description = \'' . $_POST['descripcion'] . '\',';
			$sql = $sql . 'meta_title = \'' . $_POST['nombre'] . '\',';
			$sql = $sql . 'meta_keyword = \'' . str_replace(' ',',',$_POST['nombre']) . '\',';
			$sql = $sql . 'tag = \'' . str_replace(' ',',',$_POST['nombre']) . '\' ';
            $sql = $sql . 'where product_id = ' . $product_id . ' and language_id = ' . $row['language_id'];
            $result2 = mysqli_query($conexion, $sql);
        }
    } else {
        $sql = 'insert into ' . DB_PREFIX . 'product_description (product_id,language_id,name,description,meta_description,meta_keyword,meta_title,tag) values (';
        $sql = $sql . $product_id . ',';
        $sql = $sql . $row['language_id'] . ',';
        $sql = $sql . '\'' . $_POST['nombre'] . '\',';
        $sql = $sql . '\'' . $_POST['html'] . '\',';
        $sql = $sql . '\'' . $_POST['descripcion'] . '\',';
        $sql = $sql . '\'' . str_replace(' ',',',$_POST['nombre']) . '\',';
		$sql = $sql . '\''.$_POST['nombre'].'\',';
        $sql = $sql . '\'' . str_replace(' ',',',$_POST['nombre']) . '\')';
        $result2 = mysqli_query($conexion, $sql);
		$errores = $errores.mysqli_error($conexion);
    }
}
// tema de las eñes y acentos
$result = mysqli_query($conexion, 'update ' . DB_PREFIX . 'product_description set name = REPLACE(name,\'ñ\',\'ñ\') where product_id = ' . $product_id);
$result = mysqli_query($conexion, 'update ' . DB_PREFIX . 'product_description set name = REPLACE(name,\'acute\',\'acute;\') where product_id = ' . $product_id);
// store
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_to_store where product_id = ' . $product_id);
$result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'product_to_store (product_id,store_id) values (' . $product_id . ',0)');
$errores = $errores.mysqli_error($conexion);
$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'store');
while ($row = mysqli_fetch_array($result)) {
    $sql = 'insert into ' . DB_PREFIX . 'product_to_store (product_id,store_id) values (';
    $sql = $sql . $product_id . ',';
    $sql = $sql . $row['store_id'] . ')';
    $result2 = mysqli_query($conexion, $sql);
	$errores = $errores.mysqli_error($conexion);
}
// borra todas las categorias (luego se añade una a una en product_category.php)
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_to_category where product_id = ' . $product_id);
// borra todas las imagenes (luego se añade una a una en product_image.php)
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_image where product_id = ' . $product_id);
// borra todas las opciones (luego se añade una a una en updatetallas.php)
if ($_POST['sinctallas'] == 'Y')
{
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_option_value where product_id = ' . $product_id);
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_option where product_id = ' . $product_id);
}
// fabricante
$manufacturer_id = '';
if (isset($_POST['fabricante'])) {
    $result = mysqli_query($conexion, 'select manufacturer_id from ' . DB_PREFIX . 'manufacturer where name = \'' . $_POST['fabricante'] . '\'');
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_array($result);
        $manufacturer_id = $row['manufacturer_id'];
    } else {
        $result2 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'manufacturer (name,sort_order) values (\'' . $_POST['fabricante'] . '\',0)');
        $result2 = mysqli_query($conexion, 'select manufacturer_id from ' . DB_PREFIX . 'manufacturer where name = \'' . $_POST['fabricante'] . '\'');
        if (mysqli_num_rows($result2) > 0) {
            $row2 = mysqli_fetch_array($result2);
            $manufacturer_id = $row2['manufacturer_id'];
            $result3 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'url_alias (keyword,query) values (\'' . $_POST['fabricantefriendly'] . '\',\'manufacturer_id=' . $manufacturer_id . '\')');
            $result3 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'manufacturer_to_store (manufacturer_id,store_id) values (' . $manufacturer_id . ',0)');
            $result3 = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'store');
            while ($row3 = mysqli_fetch_array($result3)) {
                $sql = 'insert into ' . DB_PREFIX . 'manufacturer_to_store (manufacturer_id,store_id) values (';
                $sql = $sql . $manufacturer_id . ',';
                $sql = $sql . $row3['store_id'] . ')';
                $result4 = mysqli_query($conexion, $sql);
            }
        }
    }
    if ($manufacturer_id != '') {
        $result = mysqli_query($conexion, 'update ' . DB_PREFIX . 'product set manufacturer_id = ' . $manufacturer_id . ' where product_id = ' . $product_id);
    }
}
// tipo de impuesto
$result = mysqli_query($conexion, 'select tax_class_id from ' . DB_PREFIX . 'tax_rule where tax_rate_id in (select tax_rate_id from ' . DB_PREFIX . 'tax_rate where round(rate,2) = round(' . $_POST['avgiva'] . ',2))');
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $result2 = mysqli_query($conexion, 'update ' . DB_PREFIX . 'product set tax_class_id = ' . $row['tax_class_id'] . ' where product_id = ' . $product_id);
}
// borra optiones
if ($_POST['sinctallas'] == 'Y')
{
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_option_value where product_id = ' . $product_id);
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'product_option where product_id = ' . $product_id);
}

// RESPUESTA
if ($errores == "")
{ echo "OK"; }
else
{ echo $errores; }
?>
