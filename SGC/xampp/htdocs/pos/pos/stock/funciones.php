<?php 
function restastock($producto,$cantidad)
	{
	include "../conn.php";
	// resta stock
	$result = mysql_query("update almacen_complementg set cantidad = (cantidad - ".$cantidad.") where id_almacen = '".$_SESSION['id_almacen']."' and id_complementog = '".$producto."'",$conexion);
		
	// Ahora comprueba si es un pack y por tanto tiene componentes
	$result = mysql_query("select * from pack where id_complementog = '".$producto."'",$conexion);
	while ($row = mysql_fetch_array($result))
		{
		// llama a la funcion para restar stock
		restastock($row['id_complementog1'],($cantidad * $row['cantidad']));		
		}
	}
function restaurastock($producto,$cantidad)
	{
	// cambia el signo
	$cantidad2 = $cantidad - $cantidad - $cantidad;
	restastock($producto,$cantidad2);
	}
	
?>