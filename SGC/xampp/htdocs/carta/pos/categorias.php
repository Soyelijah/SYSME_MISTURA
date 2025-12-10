<?php 
session_start();

include "./conn.php";
	$salida = "<h3>Categorias</h3>";

	
	
		
	if (isset($_SESSION['ordercat']))
		{
		if ($_SESSION['ordercat'] == '0')
			{
			$orderby = 'id_tipo_comg';	
			}
		if ($_SESSION['ordercat'] == '1')
			{
			$orderby = 'tipo_comg';	
			}
		if ($_SESSION['ordercat'] == '2')
			{
			$orderby = 'sort_order';	
			}
		}
	else
		{
		$orderby = 'id_tipo_comg';	
		}
	$sql = "select id_tipo_comg,tipo_comg,alias from tipo_comg where cafeteria = 'S' and visibleen = '0' and padre is null order by ".$orderby;
	$result = mysql_query($sql,$conexion);
	
	while ($row = mysql_fetch_array($result))
		{
		$salida = $salida.'<div class="boton"><a class="btncat" href=#" id="link8'.$row['id_tipo_comg'].'" onclick="showsubcategorias(\''.$row['id_tipo_comg'].'\',0); showproductos(\''.$row['id_tipo_comg'].'\',0);">';
		
		if ($row['alias'] != '')
			{
			if ($row['alias'] == ' ') { $row['alias'] = ''; }
			$salida = $salida.$row['alias'];
			}
		else
			{
			$salida = $salida.$row['tipo_comg'];
			}

			//$salida = $salida.'<img src="./imagecat.php?id='.$row['id_tipo_comg'].'" width="100%" height="100%" />';
			$salida = $salida.'<script>';
			$salida = $salida.' if ( $("#imgcategoria-'.$row['id_tipo_comg'].'").length > 0 ) {';
			$salida = $salida.'$("#imgcategoria-'.$row['id_tipo_comg'].'").appendTo("#link8'.$row['id_tipo_comg'].'"); } else { createimage("C","link8'.$row['id_tipo_comg'].'","'.$row['id_tipo_comg'].'"); }';
			$salida = $salida.'</script>';	
			
		
		$salida = $salida.'</a></div>';	
		//$salida = $salida.'<script> $("#imgcategoria-'.$row['id_tipo_comg'].'").appendTo("#link8'.$row['id_tipo_comg'].'"); </script>';
		}

		
	echo $salida;

?>
