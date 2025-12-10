<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "../conn.php";
include "../stock/funciones.php";
	// actualiza empleado
	$result = mysql_query("update ventadirecta set id_camarero = ".$_SESSION['id_camarero']." where id_venta = ".$_POST['id_venta'],$conexion);

	// actualiza la linea
	// obten la cantidad
	$result = mysql_query("select * from ventadir_comg where id_venta = ".$_POST['id_venta']." and id_linea = '".$_POST['update_linea']."'",$conexion);
	$row = mysql_fetch_array($result);
	if ($row['cantidad'] <> $_POST['cantidad'])
		{
		restaurastock($row['id_complementog'],$row['cantidad']);
		restastock($row['id_complementog'],$_POST['cantidad']);
		}
	// si la cantidad enviada a cocina es mayor que la nueva cantidad, reduce la enviada a la cocina
	if ($row['cocina'] > $_POST['cantidad'])
		{
		$result9 = mysql_query("update ventadir_comg set cocina = ".$_POST['cantidad']." where id_venta = ".$_POST['id_venta']." and id_linea = '".$_POST['update_linea']."'",$conexion);
		}
		// bloque de cocina
	if (!isset($_POST['bloque_cocina'])) { $_POST['bloque_cocina'] = '1'; }
	// si el producto es susceptible de tener opciones de cocina
	$_POST['opciones'] = ''; 
		// obten opciones de cocina
		$result2 = mysql_query("select * from notacocina",$conexion);
		while ($row2 = mysql_fetch_array($result2))
			{
			if (isset($_POST[$row2['id_nota']]))
				{
				$_POST['opciones'] = $_POST['opciones'].' * '.$row2['nota'];
				}
			}
	// precio
			if (isset($_POST['precio']))
			{
			if ($_POST['precio'] != 0)
				{
				$_POST['precio'] = $_POST['precio'] / (1 + ($row['avgiva']/100));				
				}
			}
			else
			{
			$_POST['precio'] = $row['precio'];
			}
	// inserta
	if (!isset($_POST['observaciones'])) { $_POST['observaciones'] = ''; }
	//  $precio = $_GET['pvp'] / ( 1 + ($row['avgiva'] / 100)); DESHABILITADO
	$sql = "update ventadir_comg set cantidad = ".$_POST['cantidad'].",precio = ".$_POST['precio'].",nota = '".$_POST['opciones']."',observaciones='".$_POST['observaciones']."', bloque_cocina = ".$_POST['bloque_cocina'];
	$sql = $sql." where id_venta = ".$_POST['id_venta']." and id_linea = '".$_POST['update_linea']."'";
	$result = mysql_query($sql,$conexion);
	
	// opciones de tipo de combinado 2 y 3
	$result3 = mysql_query("select tipo_combinado from complementog where id_complementog = '".$row['id_complementog']."'",$conexion);
	$row3 = mysql_fetch_array($result3);
	if ($row3['tipo_combinado'] <> '1')
		{
		$cnt=0;
		$result2 = mysql_query("select p.id_tipo_comg as id_tipo_comg,p.complementog as complementog,c.id_complementog1 as id_complementog1,c.precio as precio,p.avgiva as avgiva,p.bloque_cocina as bloque_cocina from combinados c,complementog p where p.id_complementog = c.id_complementog1 and c.id_complementog = '".$row['id_complementog']."'",$conexion);
		while ($row2 = mysql_fetch_array($result2))
			{
			if (isset($_POST[$row2['id_complementog1']]))
				{
				// nuevo id linea
				$id_linea = $_POST['update_linea'];
				// arrastra lineas
				$result6 = mysql_query("select * from ventadir_comg where id_venta = ".$_POST['id_venta']." and id_linea > ".$_POST['update_linea']." order by id_linea desc",$conexion);
				while($row6 = mysql_fetch_array($result6))
					{
					$result7 = mysql_query("update ventadir_comg set id_linea = id_linea + 1 where id_venta = ".$_POST['id_venta']." and id_linea = ".$row6['id_linea'],$conexion);	
					}

	
				$cnt=$cnt+1;
				if ($row3['tipo_combinado'] == '2')
					{
					$precio = 0;
					$pvp = 0;
					}
				if ($row3['tipo_combinado'] == '3')
					{
					$precio = $row2['precio'] / (1 + ($row2['avgiva']/100));
					$pvp = $row2['precio'];
					}
				
				if ($row2['bloque_cocina'] != 0) { $_POST['bloque_cocina'] = $row2['bloque_cocina'];}
				// inserta
				$sql = "insert into ventadir_comg (id_complementog,id_venta,cantidad,id_tipo_comg,id_empresa,id_linea,id_centro,PVPTiquet,precio,avgiva,descuento,destino,id_almacen,cocina,complementog,total,nota,observaciones,bloque_cocina)";
				$sql = $sql." values ('".$row2['id_complementog1']."',".$_POST['id_venta'].",".$_POST['cantidad'].",'".$row2['id_tipo_comg']."','001',".($id_linea + $cnt).",'01',".$pvp.",".$precio.",".$row2['avgiva'].",0,'V','".$_SESSION['id_almacen']."',0,'-->".$row2['complementog']."',".$pvp.",'','',".$_POST['bloque_cocina'].")";
				$result4 = mysql_query($sql,$conexion);
				// resta stock
				restastock($row2['id_complementog1'],$_POST['cantidad']);
				}
			}
		}
?>