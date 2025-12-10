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
$category_id = '';
$_POST['html'] = limpiatexto($_POST['html']);
$_POST['categoria'] = limpiatexto($_POST['categoria']);
if ($_POST['version'] == '1.5') {
    $imgurl = 'data/' . $_POST['id_tipo_comg'] . '.jpg';
}
if ($_POST['version'] == '2.0') {
    $imgurl = 'catalog/' . $_POST['id_tipo_comg'] . '.jpg';
}

$result = mysqli_query($conexion, 'select category_id from ' . DB_PREFIX . 'category where image = \'' . $imgurl . '\'');
if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_array($result);
    $category_id = $row['category_id'];
    // existe, actualiza
    $sql = 'update ' . DB_PREFIX . 'category set ';
    $sql = $sql . 'sort_order = ' . $_POST['sort_order'] . ',';
    if (isset($_POST['top'])) {
        $sql = $sql . 'top = 1,';
    }
    $sql = $sql . 'status = 1';
    $sql = $sql . ' where category_id = ' . $category_id;
    $result2 = mysqli_query($conexion, $sql);
} else {
    // no existe, crea
    $sql = 'insert into ' . DB_PREFIX . 'category (image,top,sort_order,status,'. DB_PREFIX .'category.column,date_added,date_modified)';
    $sql = $sql . ' values (';
    $sql = $sql . '\'' . $imgurl . '\',';
    if (isset($_POST['top'])) {
        $sql = $sql . '1,';
    } else {
        $sql = $sql . '0,';
    }
    $sql = $sql . '' . $_POST['sort_order'] . ',';
    $sql = $sql . '1,';
	$sql = $sql . '0,';
	$sql = $sql . 'curdate(),';
	$sql = $sql . 'curdate()';
    $sql = $sql . ')';
    $result2 = mysqli_query($conexion, $sql);
	$errores = $errores.mysqli_error($conexion);
    $result2 = mysqli_query($conexion, 'select category_id from ' . DB_PREFIX . 'category where image = \'' . $imgurl . '\'');
    if (mysqli_num_rows($result2) > 0) {
        $row2 = mysqli_fetch_array($result2);
        $category_id = $row2['category_id'];
    }
}
// si no hay product_id, ha habido un fallo .. sal
if ($category_id == '') {
    die;
}
// category_path (no se para que, pero parece que se necesita)
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category_path where category_id = ' . $category_id);
$result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'category_path (category_id,path_id,level) values (' . $category_id . ',' . $category_id . ',0)');
$errores = $errores.mysqli_error($conexion);
// friendly
if ($_POST['friendly'] == '') {
    $_POST['friendly'] = $_POST['id_tipo_comg'];
}
// friendly 2xx
$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'url_alias where query = \'category_id=' . $category_id . '\'');
if (mysqli_num_rows($result) > 0) {
    $result2 = mysqli_query($conexion, 'update ' . DB_PREFIX . 'url_alias set keyword = \'' . $_POST['friendly'] . '\' where query = \'category_id=' . $category_id . '\'');
} else {
    $result2 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'url_alias (keyword,query) values (\'' . $_POST['friendly'] . '\',\'category_id=' . $category_id . '\')');
}
// friendly 3x
//$resultstore = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'store');
//while ($rowstore = mysqli_fetch_array($resultstore)) 
//{
	$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'seo_url where query = \'category_id=' . $category_id . '\'');
	if (mysqli_num_rows($result) > 0) {
		$result2 = mysqli_query($conexion, 'update ' . DB_PREFIX . 'seo_url set keyword = \'' . $_POST['friendly'] . '\' where query = \'category_id=' . $category_id . '\'');
	} else 
	{
	$resultlang = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'language');
	while ($rowlang = mysqli_fetch_array($resultlang)) 
		{
		$result2 = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'seo_url (keyword,query,store_id,language_id) values (\'' . $_POST['friendly'] . '\',\'category_id=' . $category_id . '\',0,'.$rowlang['language_id'].')');
		//$errores = $errores.mysqli_error($conexion);
		}
	}
//}
$errores = $errores.mysqli_error($conexion);
// descripciones
//$result = mysql_query("delete from ".DB_PREFIX."category_description where category_id = ".$category_id,$conexion);
$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'language');
while ($row = mysqli_fetch_array($result)) {
    $result3 = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'category_description where category_id = ' . $category_id . ' and language_id = ' . $row['language_id']);
    if (mysqli_num_rows($result3) > 0) {
        if ($_POST['sinchtml'] == 'Y') {
            $sql = 'update ' . DB_PREFIX . 'category_description set ';
            $sql = $sql . 'name = \'' . $_POST['categoria'] . '\',';
			$sql = $sql . 'meta_title = \'' . $_POST['categoria'] . '\',';
			$sql = $sql . 'meta_keyword = \'' . str_replace(' ',',',$_POST['categoria']) . '\',';
			$sql = $sql . 'meta_description = \'' . $_POST['categoria'] . '\',';
            $sql = $sql . 'description = \'' . $_POST['html'] . '\' ';
            $sql = $sql . 'where category_id = ' . $category_id . ' and language_id = ' . $row['language_id'];
            $result2 = mysqli_query($conexion, $sql);
        }
    } else {
        $sql = 'insert into ' . DB_PREFIX . 'category_description (category_id,language_id,name,description,meta_description,meta_title,meta_keyword) values (';
        $sql = $sql . $category_id . ',';
        $sql = $sql . $row['language_id'] . ',';
        $sql = $sql . '\'' . $_POST['categoria'] . '\',';
        $sql = $sql . '\'' . $_POST['html'] . '\',';
        $sql = $sql . '\''.$_POST['categoria'] .'\',';
		$sql = $sql . '\''.$_POST['categoria'] .'\',';
        $sql = $sql . '\''.str_replace(' ',',',$_POST['categoria'] ).'\')';
        $result2 = mysqli_query($conexion, $sql);
		$errores = $errores.mysqli_error($conexion);
    }
}
// tema de las eñes y acentos
$result = mysqli_query($conexion, 'update ' . DB_PREFIX . 'category_description set name = REPLACE(name,\'ñ\',\'ñ\') where category_id = ' . $category_id);
$result = mysqli_query($conexion, 'update ' . DB_PREFIX . 'category_description set name = REPLACE(name,\'acute\',\'acute;\') where category_id = ' . $category_id);
// store
$result = mysqli_query($conexion, 'delete from ' . DB_PREFIX . 'category_to_store where category_id = ' . $category_id);
$result = mysqli_query($conexion, 'insert into ' . DB_PREFIX . 'category_to_store (category_id,store_id) values (' . $category_id . ',0)');
$result = mysqli_query($conexion, 'select * from ' . DB_PREFIX . 'store');
$errores = $errores.mysqli_error($conexion);
while ($row = mysqli_fetch_array($result)) {
    $sql = 'insert into ' . DB_PREFIX . 'category_to_store (category_id,store_id) values (';
    $sql = $sql . $category_id . ',';
    $sql = $sql . $row['store_id'] . ')';
    $result2 = mysqli_query($conexion, $sql);
	$errores = $errores.mysqli_error($conexion);
}

// RESPUESTA
if ($errores == "")
{ echo "OK"; }
else
{ echo $errores; }
?>
