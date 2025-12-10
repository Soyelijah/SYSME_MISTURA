<?php
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";

$result = mysql_query('select v.*,DATE_FORMAT(v.fecha_venta, "%d/%m/%Y") as fecha, m.descripcion as mesa from ventadirecta v, mesa m where v.Num_Mesa = m.Num_Mesa and (v.cerrada = "N" or v.cerrada = "M") and v.id_venta in (select id_venta from ventadir_comg where cocina > servido_cocina and id_complementog in (select id_complementog from complementog where cocina = "Y")) order by v.id_venta',$conexion);
while ($row = mysql_fetch_array($result))
	{
	?>
	<div class="panelticket">
	<?php
	//cabecera
	echo '<div class="panelheader">';
	echo 'Num: '.$row['id_venta'].' - Mesa: '.$row['mesa'].' - Pax: '.$row['comensales'].'<br/>'.$row['fecha'].'-'.$row['hora'];
	echo '</div>';
	// bloques
	$result2 = mysql_query('select distinct vc.bloque_cocina as bloque_cocina from ventadir_comg vc,complementog c where vc.cocina > vc.servido_cocina and vc.id_venta='.$row['id_venta'].' and vc.id_complementog = c.id_complementog and c.cocina = "Y" order by bloque_cocina',$conexion);
	while ($row2 = mysql_fetch_array($result2))
		{
		echo '<div class="panelblock">';
		echo 'Bloque '.$row2['bloque_cocina'];
		echo '</div>';
		echo '<div class="panellines">';
		echo '<table>';
		$result3 = mysql_query('select vc.*,t.color as color,c.alias from ventadir_comg vc,complementog c,tipo_comg t where t.id_tipo_comg = c.id_tipo_comg and vc.cocina > vc.servido_cocina and vc.id_venta='.$row['id_venta'].' and vc.bloque_cocina = '.$row2['bloque_cocina'].' and vc.id_complementog = c.id_complementog and c.cocina = "Y" and c.panelcocina in (select id_caja from cajas where nombre = "'.$_SESSION['tpv'].'") order by id_linea',$conexion);
		while ($row3 = mysql_fetch_array($result3))
			{
			
				echo '<tr><td>';
				echo $row3['complementog'];
				if ($row3['nota'] <> '')
					{ echo '<br/><i>'.$row3['nota'].'</i>'; }
				if ($row3['observaciones'] <> '')
					{ echo '<br/><i>'.$row3['observaciones'].'</i>'; }
				echo '</td>';
				echo '<td>';
				echo ($row3['cocina']-$row3['servido_cocina']);
				echo '</td>';
				echo '<td>';
				echo '<a href="javascript:void(null);" onclick="marcar_servido('.$row['id_venta'].','.$row3['id_linea'].')" class="btn">Ok</a>';
				echo '</td></tr>';
			
			}
		echo '</table>';
		echo '</div>';
		}
	?>
		<div class="panelfooter">
		<a href="javascript:void(null);" onclick="marcar_servido(<?php echo $row['id_venta']; ?>,0);" class="btn">Marcar Servido</a>
		</div>
	</div>
	<?php
	}



?>