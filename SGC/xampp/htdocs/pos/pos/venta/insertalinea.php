<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "../conn.php";
include "../stock/funciones.php";
include "../string/funciones.php";

	// actualiza empleado
	$result = mysql_query("update ventadirecta set id_camarero = ".$_SESSION['id_camarero']." where id_venta = ".$_POST['id_venta'],$conexion);

	// a?ade producto
	// si es combinado cambia el id del producto
	if (isset($_POST['combinado']) and $_POST['combinado'] <> 'no') { $_POST['add_producto'] = $_POST['combinado']; }
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
	$result = mysql_query("select id_tipo_comg,complementog,precio,avgIva,bloque_cocina,(precio * (1 + (avgIva/100))) as pvp,cocina,precio_compra from complementog where id_complementog = '".$_POST['add_producto']."'",$conexion);
	$row = mysql_fetch_array($result);
	// nombre del producto
	$producto = $row['complementog'];
	// aqui comprueba si existe otra tarifa por la mesa o sesi?n ( sesi?n mas adelante)
		$result2 = mysql_query("select pvptarifa from comg_tarifa where id_complementog = '".$_POST['add_producto']."' and id_tarifa in (select id_tarifa from mesa where Num_Mesa in (select Num_Mesa from ventadirecta where id_venta = ".$_POST['id_venta']."))",$conexion);
		if (mysql_num_rows($result2) > 0)
			{
			$row2 = mysql_fetch_array($result2);
			$row['pvp'] = $row2['pvptarifa'];
			$row['precio'] = $row['pvp'] / (1 + ($row['avgIva']/100));
			}
		if (isset($_POST['precio']))
			{
			if ($_POST['precio'] != 0)
				{
				$row['pvp'] = $_POST['precio'];
				$row['precio'] = $row['pvp'] / (1 + ($row['avgIva']/100));				
				}
			}
	// bloque de cocina
	
	if ($row['bloque_cocina'] != '0') { $_POST['bloque_cocina'] = $row['bloque_cocina']; }
	if (!isset($_POST['bloque_cocina'])) { $_POST['bloque_cocina'] = '1'; }
	//if ($row['bloque_cocina'] == '0') { $_POST['bloque_cocina'] = '1'; }
	// si el producto es susceptible de tener opciones de cocina
	if (!isset($_POST['opciones'])) { $_POST['opciones'] = ''; }
	if ($row['cocina'] == 'Y')
		{
		// obten opciones de cocina
		$result2 = mysql_query("select * from notacocina",$conexion);
		while ($row2 = mysql_fetch_array($result2))
			{
			if (isset($_POST[$row2['id_nota']]))
				{
				$_POST['opciones'] = $_POST['opciones'].' * '.$row2['nota'];
				}
			}
		}
	// inserta
	if (!isset($_POST['observaciones'])) { $_POST['observaciones'] = ''; }
	
	$sql = "";
	if (isset($_SESSION['checkincremento']) and $_SESSION['checkincremento'] == 'S')
	{
	$result = mysql_query("select * from ventadir_comg where id_venta = ".$_POST['id_venta']." and id_complementog = '".$_POST['add_producto']."'  and observaciones = '' and (nota is null or nota = '')",$conexion);
	if (mysql_num_rows($result) > 0)
		{
		$row2 = mysql_fetch_array($result);
		$sql = "update ventadir_comg set cantidad = cantidad + ".$_POST['cantidad']." where id_venta = ".$_POST['id_venta']." and id_complementog = '".$_POST['add_producto']."' and id_linea = ".$row2['id_linea'];	
		}	
	else
		{
		$sql = "";	
		}
	}
	if ($sql == "")
	{
	if (!isset($_POST['bloque_cocina'])) { $_POST['bloque_cocina'] = '1'; }
	$sql = "insert into ventadir_comg (id_complementog,id_venta,cantidad,id_tipo_comg,id_empresa,id_linea,id_centro,PVPTiquet,precio,precio_compra,avgiva,descuento,destino,id_almacen,cocina,complementog,total,nota,observaciones,bloque_cocina)";
	$sql = $sql." values ('".$_POST['add_producto']."',".$_POST['id_venta'].",".$_POST['cantidad'].",'".$row['id_tipo_comg']."','001',".$id_linea.",'01',".$row['pvp'].",".$row['precio'].",".$row['precio_compra'].",".$row['avgIva'].",0,'V','".$_SESSION['id_almacen']."',0,'".limpiatexto($row['complementog'])."',".$row['pvp'].",'".$_POST['opciones']."','".$_POST['observaciones']."',".$_POST['bloque_cocina'].")";
	}
	//echo $sql;
	
	
	
	$result = mysql_query($sql,$conexion);
	// resta stock
	restastock($_POST['add_producto'],$_POST['cantidad']);
	
	// opciones de tipo de combinado 2 y 3
	$result = mysql_query("select tipo_combinado from complementog where id_complementog = '".$_POST['add_producto']."'",$conexion);
	$row = mysql_fetch_array($result);
	if ($row['tipo_combinado'] <> '1')
		{
		$cnt=0;
		$result2 = mysql_query("select p.id_tipo_comg as id_tipo_comg,p.complementog as complementog,c.id_complementog1 as id_complementog1,c.precio as precio,p.avgiva as avgiva,p.bloque_cocina as bloque_cocina from combinados c,complementog p where p.id_complementog = c.id_complementog1 and c.id_complementog = '".$_POST['add_producto']."'",$conexion);
		while ($row2 = mysql_fetch_array($result2))
			{
			if (isset($_POST[$row2['id_complementog1']]))
				{
				$cnt=$cnt+1;
				if ($row['tipo_combinado'] == '2')
					{
					$precio = 0;
					$pvp = 0;
					}
				if ($row['tipo_combinado'] == '3')
					{
					$precio = $row2['precio'] / (1 + ($row2['avgiva']/100));
					$pvp = $row2['precio'];
					
					// aqui comprueba si existe otra tarifa por la mesa o sesi?n ( sesi?n mas adelante)
						$result3 = mysql_query("select pvptarifa from comg_tarifa where id_complementog = '".$row2['id_complementog1']."' and id_tarifa in (select id_tarifa from mesa where Num_Mesa in (select Num_Mesa from ventadirecta where id_venta = ".$_POST['id_venta']."))",$conexion);
						if (mysql_num_rows($result3) > 0)
							{
							$row3 = mysql_fetch_array($result3);
							$pvp = $row3['pvptarifa'];
							$precio = $pvp / (1 + ($row2['avgiva']/100));
							}
					
					}
				
				if ($row2['bloque_cocina'] != 0) { $_POST['bloque_cocina'] = $row2['bloque_cocina'];}
				// inserta
				$sql = "insert into ventadir_comg (id_complementog,id_venta,cantidad,id_tipo_comg,id_empresa,id_linea,id_centro,PVPTiquet,precio,avgiva,descuento,destino,id_almacen,cocina,complementog,total,nota,observaciones,bloque_cocina)";
				$sql = $sql." values ('".$row2['id_complementog1']."',".$_POST['id_venta'].",".$_POST['cantidad'].",'".$row2['id_tipo_comg']."','001',".($id_linea + $cnt).",'01',".$pvp.",".$precio.",".$row2['avgiva'].",0,'V','".$_SESSION['id_almacen']."',0,'-->".limpiatexto($row2['complementog'])."',".$pvp.",'','',".$_POST['bloque_cocina'].")";
				$result3 = mysql_query($sql,$conexion);
				// resta stock
				restastock($row2['id_complementog1'],$_POST['cantidad']);
				}
			}
		}
	//echo $producto." insertado Ok.";
	
?>