<?php
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
$sql = "update ventadir_comg set servido_cocina = servido_cocina + (cocina - servido_cocina) where id_venta = ".$_POST['id_venta'];
if ($_POST["id_linea"] <> 0)
	{ $sql = $sql." and id_linea = ".$_POST["id_linea"]; }
$result = mysql_query($sql,$conexion);
?>