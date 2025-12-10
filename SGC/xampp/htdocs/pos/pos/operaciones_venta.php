<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
if (isset($_POST['enviar_cocina']))
	{	
	$result = mysql_query("insert into venta_cocina values (".$_POST['id_venta'].",".$_SESSION['id_caja'].")",$conexion);
	echo "Se ha enviado la orden a cocina.";
	$bandera=0;
	if ($_SESSION['borrarlinea'] != "N" and $_SESSION['modtiquet'] != "N")
		{
		$bandera = 1;
			?>
			<script>
			lineas_venta();
			$('#operaciones').hide();
			</script>
			<?php
		}
	while ($bandera == 0)
		{
		$result = mysql_query("select * from ventadir_comg where cocina < cantidad and id_venta = ".$_POST['id_venta']." and id_complementog in (select id_complementog from complementog where cocina = 'Y')",$conexion);
		if (mysql_num_rows($result) > 0)
			{ 
			sleep(1); 
			}
		else
			{ 
			$bandera = 1;
			?>
			<script>
			lineas_venta();
			$('#operaciones').hide();
			</script>
			<?php
			}
		}
		
	}
if (isset($_POST['imprimir_preticket']))
	{
	$result = mysql_query("update ventadirecta set imppretiquet = 'S' where id_venta = ".$_POST['id_venta']."",$conexion);
	$result = mysql_query("insert into venta_preticket values (".$_POST['id_venta'].")",$conexion);
	echo "Se ha enviado la orden de impresion.";
	sleep(1);
			?>
			<script>
			lineas_venta();
			$('#operaciones').hide();
			</script>
			<?php
	}
?>
