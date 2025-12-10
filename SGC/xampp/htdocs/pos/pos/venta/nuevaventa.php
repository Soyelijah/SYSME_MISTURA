<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "../conn.php";
include "../stock/funciones.php";

	// crea nueva venta
	if ($_SESSION['hosteleria'] == 'N') 
		{
		$_POST['mesa'] = '00';
		$_POST['comensales'] = '1';
		}
	// nuevo id
	$result = mysql_query("select (1 + id_venta) as nuevo_id from ventadirecta order by id_venta desc limit 1",$conexion);
	$row = mysql_fetch_array($result);
	$_POST['id_venta'] = $row['nuevo_id'];
	// tarifa
	$result = mysql_query("select nombre from tarifa where id_tarifa in (select id_tarifa from mesa where Num_Mesa = '".$_POST['mesa']."')",$conexion);
	if (mysql_num_rows($result) > 0)
		{
		$row = mysql_fetch_array($result);
		$desc_tarifa = $row['nombre'];	
		}
	else
		{
		$desc_tarifa = 'Default';	
		}
	// inserta
	$sql = "insert into ventadirecta (id_venta,id_empresa,id_centro,id_entidad,id_camarero,fecha_venta,cerrada,Num_Mesa,id_caja,hora,comensales,tarifa)";
	$sql = $sql." values (".$_POST['id_venta'].",'001','01','2',".$_SESSION['id_camarero'].",curdate(),'N','".$_POST['mesa']."',".$_SESSION['id_caja'].",curtime(),".$_POST['comensales'].",'".$desc_tarifa."')";
	$result = mysql_query($sql,$conexion);
	// auto productos
	$sql = 'select id_complementog,autoadd from complementog where cafeteria = "S" and autoadd = "S"';
	$result2 = mysql_query($sql,$conexion);
	while ($row2 = mysql_fetch_array($result2))
		{
		// pendiente
		// nuevo id_linea
		$result = mysql_query("select 1+max(id_linea) as nuevo_id from ventadir_comg where id_venta = ".$_POST['id_venta']." order by id_linea desc limit 1",$conexion);
		$row = mysql_fetch_array($result);
		if (isset($row['nuevo_id']))
			{
			$id_linea = $row['nuevo_id'];
			}
		else
			{
			$id_linea = 1;
			}
			
		// precios
		$result = mysql_query("select id_tipo_comg,complementog,precio,avgIva,(precio * (1 + (avgIva/100))) as pvp from complementog where id_complementog = '".$row2['id_complementog']."'",$conexion);
		$row = mysql_fetch_array($result);
		// aqui comprueba si existe otra tarifa por la mesa o sesión ( sesión mas adelante)
			$result3 = mysql_query("select pvptarifa from comg_tarifa where id_complementog = '".$row2['id_complementog']."' and id_tarifa in (select id_tarifa from mesa where Num_Mesa in (select Num_Mesa from ventadirecta where id_venta = ".$_POST['id_venta']."))",$conexion);
			if (mysql_num_rows($result3) > 0)
				{
				$row3 = mysql_fetch_array($result3);
				$row['pvp'] = $row3['pvptarifa'];
				$row['precio'] = $row['pvp'] / (1 + ($row['avgIva']/100));
				}
		// inserta
		if (!isset($_POST['opciones'])) { $_POST['opciones'] = ''; }
		if (!isset($_POST['observaciones'])) { $_POST['observaciones'] = ''; }
		$sql = "insert into ventadir_comg (id_complementog,id_venta,cantidad,id_tipo_comg,id_empresa,id_linea,id_centro,PVPTiquet,precio,avgiva,descuento,destino,id_almacen,cocina,complementog,total,nota,observaciones)";
		$sql = $sql." values ('".$row2['id_complementog']."',".$_POST['id_venta'].",".$_POST['comensales'].",'".$row['id_tipo_comg']."','001',".$id_linea.",'01',".$row['pvp'].",".$row['precio'].",".$row['avgIva'].",0,'V','".$_SESSION['id_almacen']."',0,'".$row['complementog']."',".$row['pvp'].",'".$_POST['opciones']."','".$_POST['observaciones']."')";
		$result = mysql_query($sql,$conexion);
		// resta stock
		restastock($row2['id_complementog'],$_POST['comensales']);	
		}

?>

<script>
cargaventa(<?php echo $_POST['id_venta']; ?>);
</script>