<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "../conn.php";
include "../stock/funciones.php";

	// comprueba si tiene permiso
	if ($_SESSION['modtraspreticket'] == "N")
		{
		// consulta si se ha impreso preticket
		$result2 = mysql_query("select imppretiquet from ventadirecta where id_venta = ".$_POST['id_venta'],$conexion);
		$row2 = mysql_fetch_array($result2);
		$imppretiquet = $row2["imppretiquet"];
		if ($imppretiquet == "S")
			{
			// si no tiene permiso y se ha impreso preticket cancela
			exit();
			}
		}

	// restaura stock
	$result = mysql_query("select * from ventadir_comg where id_venta = ".$_POST['id_venta'],$conexion);
	while ($row = mysql_fetch_array($result))
		{
		restaurastock($row['id_complementog'],$row['cantidad']);
		}
	// MARCA LA CANCELACION
	$result = mysql_query("update ventadirecta set cerrada = 'C' where id_venta = ".$_POST['id_venta'],$conexion);
	$result = mysql_query("delete from venta_cocina where id_venta = ".$_POST['id_venta'],$conexion);
	$result = mysql_query("delete from venta_preticket where id_venta = ".$_POST['id_venta'],$conexion);
	// actualiza empleado
	$result = mysql_query("update ventadirecta set id_camarero = ".$_SESSION['id_camarero']." where id_venta = ".$_POST['id_venta'],$conexion);
	

?>