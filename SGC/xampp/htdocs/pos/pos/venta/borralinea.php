<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "../conn.php";
include "../stock/funciones.php";



	// restaura stock
	$result = mysql_query("select * from ventadir_comg where id_venta = ".$_POST['id_venta']." and id_linea = '".$_POST['borrar_producto']."'",$conexion);
	$row = mysql_fetch_array($result);
	restaurastock($row['id_complementog'],$row['cantidad']);
	
	// inserta en lineaseliminadas
	$result = mysql_query("insert into lineaseliminadas select * from ventadir_comg where id_venta = ".$_POST['id_venta']." and id_linea = '".$_POST['borrar_producto']."'",$conexion);
	
	// borra producto
	$result = mysql_query("delete from ventadir_comg where id_venta = ".$_POST['id_venta']." and id_linea = '".$_POST['borrar_producto']."'",$conexion);
	// actualiza empleado
	$result = mysql_query("update ventadirecta set id_camarero = ".$_SESSION['id_camarero']." where id_venta = ".$_POST['id_venta'],$conexion);
	
	// elimina la marca en los botones
?>
	<script>$(<?php echo '"#link'.$row['id_complementog'].'"'; ?>).html('');</script>