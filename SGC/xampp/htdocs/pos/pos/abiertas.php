<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
include "./".$_SESSION['idioma'].".php";
if (isset($_POST['ancho']))
	{
	$_SESSION['ancho'] = $_POST['ancho'];
	}
if (isset($_POST['alto']))
	{
	$_SESSION['alto'] = $_POST['alto'];
	}

?>
			<div class="header">
                                <?php echo $txtopensales; ?>
								<div style="float:right;"><a href="./index.php" class="btn">Cerrar</a></div>
            </div>
			
            <div class="content">
			<div id="mapa">
			<div id="mapa-salon">
				Salones: <br/>
				<?php
				// tamaño del mapa
				$altura = ($_SESSION['ancho']*$_SESSION['altotpv'])/$_SESSION['anchotpv'];
				
				
				
				// salones
				$result = mysql_query("select * from salon",$conexion);
				while ($row = mysql_fetch_array($result))
					{
					if (!isset($_SESSION['id_salon']))
						{
						$_SESSION['id_salon'] = $row['id_salon'];
						}
					?>
					<div class='botonprocombi'>
					<a class="btncat" href="javascript:void(null);" onclick="mapa('<?php echo $row['id_salon']; ?>');"><?php echo $row['nombre']; ?>
					<img src="./images/trans.png" width="100%" height="100%" />
					</a>
					</div>
					<?php
					}
				?>
				<div class='botonprocombi' style="float:right;">
				<input type="checkbox" id="muestramapa" 
				<?php
				if (!isset($_SESSION['showmap']))
				{
				$_SESSION['showmap'] = 'Y';	
				}
				if ($_SESSION['showmap'] == 'Y')
				{
				echo 'checked ';
				}
				?>
				onclick="muestraoculta();" />
				<a class="btncat" href="javascript:void(null);" onclick="marca('muestramapa'); muestraoculta();">
				Mostrar Mapa
				<img src="./images/trans.png" width="100%" height="100%" />
				</a>
				</div>
			</div>
			<div style='clear:both;'></div>
			<div id="mapa-mesas" style="background: #aaaaaa; height: <?php echo $altura; ?>px; width: <?php echo $_SESSION['ancho'] ?>px; margin: 0 0 5px 0;">

			</div>
			</div>
			<div class="tabla">
			            <table >
							<tr>
								<td>
									<?php echo $txtsale; ?>
								</td>
								<td>
									<?php echo $txtmesa; ?>
								</td>
								<td>
									<?php echo $txthora; ?>
								</td>
								<td>
									Alias
								</td>
								<td>
									Importe
								</td>
								<td>
									 
								</td>
							</tr>
					<?php 
					// lista las ventas abiertas
					//$result = mysql_query("select * from ventadirecta where cerrada='N' order by id_venta,Num_Mesa",$conexion);
					$result = mysql_query("select v.*,m.descripcion as mesadesc from ventadirecta v,mesa m where v.cerrada='N' and v.Num_Mesa = m.Num_Mesa order by v.id_venta,v.Num_Mesa",$conexion);
					if (mysql_num_rows($result) == 0)
						{
 						?>
						<!--No hay ventas abiertas-->
						<?php 
						}
					else
						{	
					?>
						

					
					<?php 
					while ($row = mysql_fetch_array($result))
						{
						// total venta
						$result2 = mysql_query("select round(sum((precio - (IF(descuento = 0,0,(precio * descuento)/100))) * cantidad * (1 + (avgiva / 100))),2) as total from ventadir_comg where id_venta = ".$row['id_venta'],$conexion);
						$row2 = mysql_fetch_array($result2);
						if (!isset($row2['total']))
							{
							$row2['total'] = '0.00';
							}
						if ($row['imppretiquet'] == 'N')
							{
							
							}
						else
							{
							
							}
						?>
							<tr>
								<td><?php echo $row['id_venta']; ?></td>
								<td><?php echo $row['mesadesc']; ?><?php if ($_SESSION['hosteleria'] == 'S') { ?> (<?php echo $row['comensales']; ?>) <?php } ?></td>
								<td><?php echo $row['hora']; ?></td>
								<td><?php echo $row['alias']; ?></td>
								<td><?php echo $row2['total'].' '.$_SESSION['moneda']; ?></td>
								<td><a class="btn2" href="javascript:void(null);" onclick="cargaventa(<?php echo $row['id_venta']; ?>);">Mostrar</a></td>
							</tr>
							
										
						<?php 
						}
						?>
						<?php 
						}
					?>
						</table>
			</div>
			<div style="clear: both;"><br/>&nbsp;</br>&nbsp;</div>
			</div>
			<div class="footer">
							
                            <a href="javascript:void(null);" onclick="carga('./menu.php','pagina');" class="btn">
                                <?php echo $txtback; ?>
                            </a>

                            <a href="javascript:void(null);" onclick="carga('./abiertas.php','pagina');" class="btn">
                                <?php echo $txtrefresh; ?>
                            </a>

							<a href="javascript:void(null);" 
							<?php if ($_SESSION['hosteleria'] == 'S') { ?>
								onclick="$('#nueva_venta').show()"
							<?php } else { ?>
								onclick="add2();"
							<?php } ?>
                                 class="btn"> <?php echo $txtnew." ".$txtsale; ?>
                            </a>
		
			</div>
			
			<div class="popup" id="nueva_venta">
							
							<h3>Nueva Venta</h3>
							<?php echo $txtcomensales; ?>:<br/>
							<input type="text" name="comensales" id="comensales" value="1" readonly /><br/><br/>
							<a class="btn" href="#" onclick="restar('comensales')"><?php echo $txtrestar; ?></a>
							<a class="btn" href="#" onclick="sumar('comensales')"><?php echo $txtsumar; ?> </a>
							<div style='clear:both;'><br/><br/></div>
							<?php echo $txtselecttable; ?><br/>
							
								<?php 
								// obten mesas
								$result = mysql_query("select Num_Mesa,descripcion from mesa",$conexion);
								while ($row = mysql_fetch_array($result))
									{
									echo "<div class='botonprocombi'>";
									echo "<input type='radio' name='mesa' id='mesa".$row['Num_Mesa']."' value='".$row['Num_Mesa']."'";
									echo "/>";
									$cadena = '"mesa'.$row['Num_Mesa'].'"';
									echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>".$row['descripcion'];
									echo '<img src="./images/trans.png" width="100%" height="100%" />';
									echo "</a>";
									echo "</div>";	
									}
								?>
							

							<div style='clear:both;'><br/><br/><br/><br/></div>
										<div class="footer">
										<a href="javascript:void(null);" onclick="$('#nueva_venta').hide();" class="btn">
											<?php echo $txtcancell; ?>
										</a>
										<a href="javascript:void(null);" onclick="add();" class="btn">
											<?php echo $txtaccept; ?>
										</a>
										</div>

								
							
			</div>
				
<script>

	function muestraoculta()
		{
				var marcado = $("#muestramapa").is(":checked");
				//alert(marcado);
				if(!marcado)
					{
					$("#mapa-mesas").hide();
					var mostrar = "N";
					}
				else
					{
					$("#mapa-mesas").show();
					var mostrar = "Y";
					}
		$('#operaciones1').load
			(
			'./showmap.php',
			{
			showmap: mostrar
			}
			);
		
		}

	function seleccionamesa(id)
		{
		//alert (id);
		//$('#mesa option[value='+ id +']').attr('selected',true);
		$("#mesa"+id).prop("checked", true);
		}

	function add(id)
		{
		$('#operaciones1').load
			(
			'./venta/nuevaventa.php',
			{
			nueva_venta: 'Y',
			//mesa: $('#mesa').attr('value'),
			mesa: $('input:radio[name=mesa]:checked').val(),
			comensales: $('#comensales').attr('value')	
			},
			function() 
				{
				
				}
			);			
		}
	function add2(id)
		{
		$('#operaciones1').load
			(
			'./venta/nuevaventa.php',
			{
			nueva_venta: 'Y'
			},
			function() 
				{
				
				}
			);			
		}

	function mapa(salon)
		{
		var elemento = $("#mapa-mesas");
		var posicion = elemento.position();
		$('#mapa-mesas').load
			(
			'./mapa-mesas.php',
			{
			id_salon: salon,
			mapatop: posicion.top,
			mapaleft: posicion.left
			}
			);	
		}
	mapa('<?php echo $_SESSION['id_salon']; ?>');
	muestraoculta();

</script>

