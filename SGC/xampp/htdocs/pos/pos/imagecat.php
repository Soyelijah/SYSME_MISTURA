<?php
session_start();
include "./conn.php";
$result = mysql_query("select imagen from tipo_comg where id_tipo_comg = '".$_GET['id']."'",$conexion);
$row = mysql_fetch_array($result);
header('Content-type: image/jpeg');
if (!isset($row['imagen']))
	{
	$row['imagen'] = imagecreatefromjpeg('./images/no-imagecat.jpg');
	imagejpeg($row['imagen']);
	imagedestroy($row['imagen']);
	}
else
	{
	//$row['imagen'] = imagecreatefromjpeg('./images/no-imagecat.jpg');
	//imagejpeg($row['imagen']);
	//imagedestroy($row['imagen']);
	echo $row['imagen'];
	}
?>
