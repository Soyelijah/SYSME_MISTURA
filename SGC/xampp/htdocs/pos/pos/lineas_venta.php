<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
include "./".$_SESSION['idioma'].".php";
?>
			            <table >
							<tr>
								<td>
									Producto
								</td>
								<td>
									Cant.
								</td>
								<td>
									Total
								</td>
								<td>
									
								</td>
								<td>
									 
								</td>
							</tr>
					<?php 
					// consulta si se ha impreso preticket
					$result2 = mysql_query("select imppretiquet from ventadirecta where id_venta = ".$_POST['id_venta'],$conexion);
					$row2 = mysql_fetch_array($result2);
					$imppretiquet = $row2["imppretiquet"];
					// obten productos
					$result2 = mysql_query("select id_linea,cantidad,id_complementog,complementog,nota,observaciones,bloque_cocina,cocina,round((precio - (IF(descuento = 0,0,(precio * descuento)/100))) * cantidad * (1 + (avgiva / 100)),2) as totallinea from ventadir_comg where id_venta = ".$_POST['id_venta']." order by id_linea",$conexion);
					while ($row2 = mysql_fetch_array($result2))
						{
						?>
						<tr>

							<td><small>
								(<?php echo $row2['bloque_cocina']; ?>) <?php echo $row2['complementog']; ?>
								<?php if (isset($row2['nota']) and $row2['nota'] != '') {	echo ": ".$row2['nota']; } if (isset($row2['observaciones']) and $row2['observaciones'] != '') { echo ": ".$row2['observaciones']; } ?>
								</small>
							</td>
							<td><?php echo $row2['cantidad']; ?></td>
							<td><?php echo $row2['totallinea'].$_SESSION['moneda']; ?></td>
							<td>
								<a
								<?php
								if ($row2['cocina'] > 0 and $row2['cocina'] = $row2['cantidad'] and $_SESSION['modtiquet'] == "N")
									{
									echo ' style="display:none;" ';
									}
								if ($imppretiquet == "S" and $_SESSION['modtraspreticket'] == "N")
									{
									echo ' style="display:none;" ';
									}
								?>
								
								class="btn2" href="javascript:void(null);" onclick="cargalinea(<?php echo $row2['id_linea']; ?>);">editar</a>		
								
							</td>
							<td>
								<a 
								<?php
								if ($row2['cocina'] > 0 and $row2['cocina'] = $row2['cantidad'] and $_SESSION['modtiquet'] == "N")
									{
									echo ' style="display:none;" ';
									}
								if ($imppretiquet == "S" and $_SESSION['modtraspreticket'] == "N")
									{
									echo ' style="display:none;" ';
									}
								if ($_SESSION['borrarlinea'] == "N")
									{
									echo ' style="display:none;" ';
									}
								?>								
								href="javascript:void(null);" onclick="borralinea(<?php echo $row2['id_linea']; ?>);" class="btn2">borrar</a>	
								
							</td>
						</tr>
	
								
							

												
						<?php 
						}
						?>
					</table>
					<?php 
					
					// obten total
					$result2 = mysql_query("select round(sum((precio - (IF(descuento = 0,0,(precio * descuento)/100))) * cantidad * (1 + (avgiva / 100))),2) as total from ventadir_comg where id_venta = ".$_POST['id_venta'],$conexion);
					$row2 = mysql_fetch_array($result2);
					if (!isset($row2['total']))
						{
						$row2['total'] = '0.00';
						}
						?>
						<p>
								<strong>Total: <?php echo $row2['total'].' '.$_SESSION['moneda']; ?></strong>							
						</p>
					<div style="clear:both;"><br/><br/></div>
						
					<script>
					<?php
					// suma de cada producto para marcarlo en los botones
					$result2 = mysql_query("select id_complementog,sum(cantidad) as suma from ventadir_comg where id_venta = ".$_POST['id_venta']." group by 1",$conexion);
					while ($row2 = mysql_fetch_array($result2))
						{
						?>
						$(<?php echo '"#link'.$row2['id_complementog'].'"'; ?>).html(<?php echo $row2['suma']; ?>);
						<?php
						}
					?>
					<?php
					// suma de cada producto - enviados a cocina para marcarlo en los botones
					$result2 = mysql_query("select id_complementog,sum(cantidad-cocina) as suma from ventadir_comg where id_venta = ".$_POST['id_venta']." group by 1",$conexion);
					while ($row2 = mysql_fetch_array($result2))
						{
						?>
						$(<?php echo '"#linkcocina'.$row2['id_complementog'].'"'; ?>).html(<?php echo $row2['suma']; ?>);
						<?php
						}
					?>
					</script>