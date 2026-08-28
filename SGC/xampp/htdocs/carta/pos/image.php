<?php
session_start();
include "./conn.php";
$result = mysql_query("select imagen from complementogimg where id_complementog = '".$_GET['id']."'",$conexion);
$row = mysql_fetch_array($result);
header('Content-type: image/jpeg');
if (!isset($row['imagen']))
	{
	$row['imagen'] = imagecreatefromjpeg('./images/no-image.jpg');
	imagejpeg($row['imagen']);
	imagedestroy($row['imagen']);
	}
else
	{
	echo $row['imagen'];
	}
?>
