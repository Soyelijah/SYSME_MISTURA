<?php
include "./conn.php";
// informe
if (!isset($_POST['informe'])) { $_POST['informe'] = 'ventas-total'; }
// parametros
if (!isset($_POST['tipo'])) { $_POST['tipo'] = 'S'; }
if (!isset($_POST['fecha_desde'])) { $_POST['fecha_desde'] = date('Y-m-d'); }
if (!isset($_POST['fecha_hasta'])) { $_POST['fecha_hasta'] = date('Y-m-d'); }
if (!isset($_POST['hora_desde'])) { $_POST['hora_desde'] = '00:00:01'; }
if (!isset($_POST['hora_hasta'])) { $_POST['hora_hasta'] = '23:59:59'; }

if (!isset($_POST['id_caja'])) { $_POST['id_caja'] = ' '; }
if ($_POST['id_caja'] == ' ')
	{
	$sqlcaja = '';
	}
else
	{
	$sqlcaja = ' and v.id_caja = '.$_POST['id_caja'];
	}
	
if (!isset($_POST['id_almacen'])) { $_POST['id_almacen'] = ' '; }
if ($_POST['id_almacen'] == ' ')
	{
	$sqlalmacen = '';
	}
else
	{
	$sqlalmacen = ' and vc.id_almacen = '.$_POST['id_almacen'];
	}
	
if (!isset($_POST['id_empleado'])) { $_POST['id_empleado'] = ' '; }
if ($_POST['id_empleado'] == ' ')
	{
	$sqlempleado = '';
	}
else
	{
	$sqlempleado = ' and v.id_camarero = '.$_POST['id_empleado'];
	}
	
if (!isset($_POST['id_categoria'])) { $_POST['id_categoria'] = ' '; }
if ($_POST['id_categoria'] == ' ')
	{
	$sqlcategoria = '';
	}
else
	{
	$sqlcategoria = ' and vc.id_tipo_comg = "'.$_POST['id_categoria'].'"';
	}

if (!isset($_POST['id_producto'])) 
	{ 
	$sqlproducto = '';
	}
else
	{
	$sqlproducto = ' and vc.id_complementog in (select id_complementog from complementog where complementog like "%'.$_POST['id_producto'].'%")';
	}


if ($_POST['informe'] == 'ventas-total')
	{
	$sql = 'select curdate() as fecha,';
	$sql = $sql.' Round(Sum(vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100))-((vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100)) * descuento)/100)),2) as total';
	$sql = $sql.' from ventadirecta v, ventadir_comg vc';
	$sql = $sql.' where v.id_venta=vc.id_venta';
	$sql = $sql.' and v.cerrada="'.$_POST['tipo'].'"';
	$sql = $sql.' and v.fecha_venta >="'.$_POST['fecha_desde'].'"';
	$sql = $sql.' and v.fecha_venta <="'.$_POST['fecha_hasta'].'"';
	$sql = $sql.' and v.hora >="'.$_POST['hora_desde'].'"';
	$sql = $sql.' and v.hora <="'.$_POST['hora_hasta'].'"';
	$sql = $sql.$sqlcaja.$sqlalmacen.$sqlempleado.$sqlcategoria.$sqlproducto;
	$sql = $sql.' group by 1 order by 1';
	}

if ($_POST['informe'] == 'ventas-dia')
	{
	$sql = 'select v.fecha_venta as fecha,';
	$sql = $sql.' Round(Sum(vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100))-((vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100)) * descuento)/100)),2) as total';
	$sql = $sql.' from ventadirecta v, ventadir_comg vc';
	$sql = $sql.' where v.id_venta=vc.id_venta';
	$sql = $sql.' and v.cerrada="'.$_POST['tipo'].'"';
	$sql = $sql.' and v.fecha_venta >="'.$_POST['fecha_desde'].'"';
	$sql = $sql.' and v.fecha_venta <="'.$_POST['fecha_hasta'].'"';
	$sql = $sql.' and v.hora >="'.$_POST['hora_desde'].'"';
	$sql = $sql.' and v.hora <="'.$_POST['hora_hasta'].'"';
	$sql = $sql.$sqlcaja.$sqlalmacen.$sqlempleado.$sqlcategoria.$sqlproducto;
	$sql = $sql.' group by 1 order by 1';
	}
	
if ($_POST['informe'] == 'ventas-mes')
	{
	$sql = 'select date_format(v.fecha_venta,"%Y-%M") as fecha,';
	$sql = $sql.' Round(Sum(vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100))-((vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100)) * descuento)/100)),2) as total';
	$sql = $sql.' from ventadirecta v, ventadir_comg vc';
	$sql = $sql.' where v.id_venta=vc.id_venta';
	$sql = $sql.' and v.cerrada="'.$_POST['tipo'].'"';
	$sql = $sql.' and v.fecha_venta >="'.$_POST['fecha_desde'].'"';
	$sql = $sql.' and v.fecha_venta <="'.$_POST['fecha_hasta'].'"';
	$sql = $sql.' and v.hora >="'.$_POST['hora_desde'].'"';
	$sql = $sql.' and v.hora <="'.$_POST['hora_hasta'].'"';
	$sql = $sql.$sqlcaja.$sqlalmacen.$sqlempleado.$sqlcategoria.$sqlproducto;
	$sql = $sql.' group by 1 order by 1';
	}
	
if ($_POST['informe'] == 'ventas-ano')
	{
	$sql = 'select date_format(v.fecha_venta,"%Y") as fecha,';
	$sql = $sql.' Round(Sum(vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100))-((vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100)) * descuento)/100)),2) as total';
	$sql = $sql.' from ventadirecta v, ventadir_comg vc';
	$sql = $sql.' where v.id_venta=vc.id_venta';
	$sql = $sql.' and v.cerrada="'.$_POST['tipo'].'"';
	$sql = $sql.' and v.fecha_venta >="'.$_POST['fecha_desde'].'"';
	$sql = $sql.' and v.fecha_venta <="'.$_POST['fecha_hasta'].'"';
	$sql = $sql.' and v.hora >="'.$_POST['hora_desde'].'"';
	$sql = $sql.' and v.hora <="'.$_POST['hora_hasta'].'"';
	$sql = $sql.$sqlcaja.$sqlalmacen.$sqlempleado.$sqlcategoria.$sqlproducto;
	$sql = $sql.' group by 1 order by 1';
	}
	
if ($_POST['informe'] == 'ventas-categoria')
	{
	$sql = 'select c.tipo_comg as categoria,';
	$sql = $sql.' Round(Sum(vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100))-((vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100)) * descuento)/100)),2) as total';
	$sql = $sql.' from ventadirecta v, ventadir_comg vc,tipo_comg c';
	$sql = $sql.' where v.id_venta=vc.id_venta and vc.id_tipo_comg = c.id_tipo_comg';
	$sql = $sql.' and v.cerrada="'.$_POST['tipo'].'"';
	$sql = $sql.' and v.fecha_venta >="'.$_POST['fecha_desde'].'"';
	$sql = $sql.' and v.fecha_venta <="'.$_POST['fecha_hasta'].'"';
	$sql = $sql.' and v.hora >="'.$_POST['hora_desde'].'"';
	$sql = $sql.' and v.hora <="'.$_POST['hora_hasta'].'"';
	$sql = $sql.$sqlcaja.$sqlalmacen.$sqlempleado.$sqlcategoria.$sqlproducto;
	$sql = $sql.' group by 1 order by 2 desc';
	}
	
if ($_POST['informe'] == 'ventas-producto')
	{
	$sql = 'select p.complementog as producto,';
	$sql = $sql.' Round(Sum(vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100))-((vc.cantidad * (vc.precio + ((vc.precio * vc.avgiva)/100)) * descuento)/100)),2) as total';
	$sql = $sql.' from ventadirecta v, ventadir_comg vc,complementog p';
	$sql = $sql.' where v.id_venta=vc.id_venta and vc.id_complementog = p.id_complementog';
	$sql = $sql.' and v.cerrada="'.$_POST['tipo'].'"';
	$sql = $sql.' and v.fecha_venta >="'.$_POST['fecha_desde'].'"';
	$sql = $sql.' and v.fecha_venta <="'.$_POST['fecha_hasta'].'"';
	$sql = $sql.' and v.hora >="'.$_POST['hora_desde'].'"';
	$sql = $sql.' and v.hora <="'.$_POST['hora_hasta'].'"';
	$sql = $sql.$sqlcaja.$sqlalmacen.$sqlempleado.$sqlcategoria.$sqlproducto;
	$sql = $sql.' group by 1 order by 2 desc';
	}

//echo $sql;
$result = mysql_query($sql,$conexion);

$col = mysql_num_fields($result); 
?>





							<table id="table-informe-ventas" class="display">
								<thead>
									<tr>
									<?php
									for ($i = 0; $i < $col; $i++) 
										{
										$row = mysql_fetch_field($result,$i);
										echo '<th>'.$row->name.'</th>';
										}
									?>
									</tr>
								</thead>
								<tbody>
								<?php 
								while ($row = mysql_fetch_array($result)) 
									{
									echo '<tr>';
									for ($i = 0; $i < $col; $i++) 
										{
										echo '<td>'.$row[$i].'</td>';
										}
									echo '</tr>';						
									}
								?>

								</tbody>
							</table>	
														


<script>

	// tabla
	var table = $('#table-informe-ventas').dataTable({
	
		"bJQueryUI": true,
		"sPaginationType": "full_numbers",
		"iDisplayLength": 20,
		"aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
		
	});


</script>


