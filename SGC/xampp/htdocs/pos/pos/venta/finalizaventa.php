<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "../conn.php";

// crea tiquet
$result = mysql_query("select id_tiquet from tiquet where serie = '".$_SESSION['seriefactura']."' order by id_tiquet desc limit 1",$conexion);
$row = mysql_fetch_array($result);
$id_tiquet = $row['id_tiquet'] + 1;
$sql = "insert into tiquet (serie,id_tiquet,id_empresa,id_centro,fecha_tiquet,iva,total,horatiquet) values (";
$sql = $sql."'".$_SESSION['seriefactura']."',";
$sql = $sql.$id_tiquet.",";
$sql = $sql."'001',";
$sql = $sql."'01',";
$sql = $sql."curdate(),";
$sql = $sql."1,";
$sql = $sql.$_POST['total'].",";
$sql = $sql."curtime()";

$sql = $sql.")";
$result = mysql_query($sql,$conexion);
$error = mysql_error();
echo $error;

// añade pago
$result = mysql_query("select id_apcajas from apcajas where abierta = 'S' and id_caja = ".$_SESSION['id_caja'],$conexion);
$row = mysql_fetch_array($result);
$id_apcajas = $row['id_apcajas'];

$result = mysql_query("select id_pagoscobros,saldo from pagoscobros where id_apcajas = ".$id_apcajas." order by id_pagoscobros desc limit 1",$conexion);
$row = mysql_fetch_array($result);
$id_pagoscobros = $row['id_pagoscobros']+1;
$saldo = $row['saldo']+$_POST['total'];

$sql = "insert into pagoscobros (id_pagoscobros,tipo,id_venta,fecha,hora,descripcion,importe,id_modo_pago,id_camarero,saldo,id_tiquet,serie_fac,id_apcajas,id_caja) values (";
$sql = $sql.$id_pagoscobros.",";
$sql = $sql."'E',";
$sql = $sql.$_POST['id_venta'].",";
$sql = $sql."curdate(),";
$sql = $sql."curtime(),";
$sql = $sql."'ticket ".$_SESSION['seriefactura'].$id_tiquet."',";
$sql = $sql.$_POST['total'].",";
$sql = $sql."'".$_POST['id_modo_pago']."',";
$sql = $sql."'".$_SESSION['id_camarero']."',";
$sql = $sql.$saldo.",";
$sql = $sql.$id_tiquet.",";
$sql = $sql."'".$_SESSION['seriefactura']."',";
$sql = $sql.$id_apcajas.",";
$sql = $sql.$_SESSION['id_caja'].")";
$result = mysql_query($sql,$conexion);
$error = mysql_error();
echo $error;

// marca venta como cerrada
$result = mysql_query("update ventadirecta set cerrada = 'S',serie = '".$_SESSION['seriefactura']."', id_tiquet = ".$id_tiquet." where id_venta = ".$_POST['id_venta'],$conexion);
$result = mysql_query("update ventadirecta set id_camarero = ".$_SESSION['id_camarero']." where id_venta = ".$_POST['id_venta'],$conexion);

// envia para impresión
$result = mysql_query("insert into venta_ticket values (".$_POST['id_venta'].")",$conexion);

// vuelve a abiertas
?>

<script>
carga('./abiertas.php','pagina');
</script>