<?php
session_start();
include "./conn.php";
$result = mysql_query("select foto from camareros where id_camarero = '".$_GET['id']."'",$conexion);
$row = mysql_fetch_array($result);
header('Content-type: image/jpeg');
if (!isset($row['foto']))
	{
	$row['foto'] = imagecreatefromjpeg('./images/no-image.jpg');
	imagejpeg($row['foto']);
	imagedestroy($row['foto']);
	}
else
	{
	echo $row['foto'];
	}
?>
