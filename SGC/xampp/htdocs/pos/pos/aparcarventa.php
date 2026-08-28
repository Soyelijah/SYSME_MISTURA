<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
$result = mysql_query("select * from ventadir_comg where id_venta = ".$_POST['id_venta'],$conexion);
if (mysql_num_rows($result) == 0)
	{
	$result = mysql_query("delete from ventadirecta where id_venta = ".$_POST['id_venta'],$conexion);
	}
?>