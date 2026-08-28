<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
include "./stock/funciones.php";
include "./".$_SESSION['idioma'].".php";


if (isset($_POST['cambio_mesa']))
	{
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
	// cambio de mesa
	$sql = "update ventadirecta set Num_Mesa ='".$_POST['mesa']."',tarifa = '".$desc_tarifa."' where id_venta = ".$_POST['id_venta'];
	$result = mysql_query($sql,$conexion);
	
	$result = mysql_query("select * from ventadir_comg where id_venta = ".$_POST['id_venta']." and precio <> 0",$conexion);
	while ($row = mysql_fetch_array($result))
		{
		// aqui comprueba si existe otra tarifa por la mesa o sesi?n ( sesi?n mas adelante)
			$result2 = mysql_query("select pvptarifa from comg_tarifa where id_complementog = '".$row['id_complementog']."' and id_tarifa in (select id_tarifa from mesa where Num_Mesa in (select Num_Mesa from ventadirecta where id_venta = ".$_POST['id_venta']."))",$conexion);
			if (mysql_num_rows($result2) > 0)
				{
				$row2 = mysql_fetch_array($result2);
				$pvp = $row2['pvptarifa'];
				$precio = $pvp / (1 + ($row['avgiva']/100));
				$result3 = mysql_query("update ventadir_comg set precio = ".$precio.", total = ".$pvp." where id_venta = ".$_POST['id_venta']." and id_linea = ".$row['id_linea'],$conexion);
				}
		}
	
	}
	
if (isset($_POST['id_tarifa']))
	{
	// CAMBIA TARIFA
	$result = mysql_query("select * from ventadir_comg where id_venta = ".$_POST['id_venta']." and precio <> 0",$conexion);
	while ($row = mysql_fetch_array($result))
		{
			if ($_POST['id_tarifa'] == 'default')
			{
			$result2 = mysql_query("select pvp as pvptarifa from complementog where id_complementog = '".$row['id_complementog']."'",$conexion);	
			}
			else
			{
			$result2 = mysql_query("select pvptarifa from comg_tarifa where id_complementog = '".$row['id_complementog']."' and id_tarifa = '".$_POST['id_tarifa']."'",$conexion);
			}
			if (mysql_num_rows($result2) > 0)
				{
				$row2 = mysql_fetch_array($result2);
				$pvp = $row2['pvptarifa'];
				$precio = $pvp / (1 + ($row['avgiva']/100));
				$result3 = mysql_query("update ventadir_comg set precio = ".$precio.", total = ".$pvp." where id_venta = ".$_POST['id_venta']." and id_linea = ".$row['id_linea'],$conexion);
				}
		}	
	}
	
if (isset($_POST['update_observaciones']))
	{
	// actualiza observaciones
	$sql = "update ventadirecta set observaciones ='".$_POST['observaciones']."' where id_venta = ".$_POST['id_venta'];
	$result = mysql_query($sql,$conexion);
	}
// obten datos de la venta
$result = mysql_query("select * from ventadirecta where id_venta = ".$_POST['id_venta']." and cerrada = 'N'",$conexion);
if (mysql_num_rows($result) == 0)
	{
	echo "<script>carga('./abiertas.php','pagina');</script>"; 
	exit();
	}
$row = mysql_fetch_array($result);
$resultmesa = mysql_query("select Num_Mesa,descripcion from mesa where Num_Mesa = '".$row['Num_Mesa']."'",$conexion);
$rowmesa = mysql_fetch_array($resultmesa);
// busca el ultimo bloque de cocina y guarda en sesi�n
$resultbloque = mysql_query("select max(bloque_cocina) as bloque_cocina from ventadir_comg where id_venta = ".$_POST['id_venta'],$conexion);
$rowbloque = mysql_fetch_array($resultbloque);
$_SESSION['bloque_cocina'] = $rowbloque['bloque_cocina'];
if (!isset($_SESSION['bloque_cocina'])) {$_SESSION['bloque_cocina'] = 1;}
?>


            <div class="header">
                                <?php echo $txtsale.": ".$row['id_venta'];
								if ($_SESSION['hosteleria'] == 'S') 
									{
									echo " - ".$txtmesa.": ".$rowmesa['descripcion']." ".$txtcomensales.": ".$row['comensales']; 
									}
								?>
								<div style="float:right;"><a href="./index.php" class="btn">Cerrar</a></div>
            </div>
			
            <div class="content">
			
			
			<div class="tab">
			  <button class="tablinks" onclick="opentab(event, 'Catalogo')" id="defaultOpen">Catalogo</button>
			  <button class="tablinks" onclick="opentab(event, 'Venta')">Venta</button>
			  <button class="tablinks" onclick="opentab(event, 'Opciones')">Opciones</button>
			</div>

			<div id="Catalogo" class="tabcontent">
							
							<div id="buscador">
							<input type="text" id="criterio" name="criterio" placeholder="buscar" size="10" value="" onkeyup="buscaproductos();" size="5"  />
							
							<input type="radio" name="bloquec" value="1" checked>1&nbsp;&nbsp;&nbsp;
							<input type="radio" name="bloquec" value="2">2&nbsp;&nbsp;&nbsp;
							<input type="radio" name="bloquec" value="3">3&nbsp;&nbsp;&nbsp;
							<input type="radio" name="bloquec" value="4">4
							</div>
							<div id="boxcategorias" style="position: relative;">
							</div>
							<div style="clear:both;"><br/></div>
							<div id="boxproductos">
							</div>

			</div>

			<div id="Venta" class="tabcontent">		
				<div class="tabla" id="tabla">

				</div>
						<?php
						// si hay observaciones
						if ($row['observaciones'] != "")
						{
						?>
						
						<p>
						 Obs: <?php echo $row['observaciones']; ?>
						</p>
						<?php
						}
						?>
						

							

			</div>

				<div id="Opciones" class="tabcontent">
					<br/>
					<?php
					if ($_SESSION['cancelartiquet'] != "N") {
					?>
					<a href="#" onclick="$('#popcancelar').show();" class="btn"><?php echo $txtcancellsale; ?></a><br/><br/>
					<?php
					}
					?>
					<?php if ($_SESSION['hosteleria'] == 'S') { ?>
					<a href="#" onclick="$('#cambio_mesa').show();" class="btn"><?php echo $txtchangetable; ?></a><br/><br/>
					<?php } ?>
					<a href="#" onclick="$('#popobservaciones').show();" class="btn">+ <?php echo $txtobservations; ?></a><br/><br/>
					<a href="javascript:void(null);" onclick="imprimepreticket();" class="btn"><?php echo $txtprintpreticket; ?></a><br/><br/>
					<?php
					if ($_SESSION['cambiartarifa'] != "N") {
					?>
					<a href="#" onclick="$('#popcambiotarifa').show();" class="btn"><?php echo $txtchangerate; ?></a><br/><br/>
					<?php
					}
					?>
					

			</div>
			
			



            </div>
			

			<div class="footer">

                            <a href="javascript:void(null);" onclick="aparcarventa();" class="btn">
                                <?php echo $txtaparcar; ?>
                            </a>
							
							<a href="javascript:void(null);" onclick="enviacocina();" class="btn">
								<?php echo $txtsendtokitchen; ?>
							</a>
							
							<?php if ($_SESSION['finalizarventas'] == 'Y') { ?>
							<a href="javascript:void(null);" onclick="finalizaventa();" class="btn">
								<?php echo $txtfinishsale; ?>
							</a>
							<?php } ?>

			</div>
			

			
			<div class="popup" id="popobservaciones">
	
					<?php echo $txtobservations; ?>:<br/>
					<input type="text" name="observacionesgen" id="observacionesgen" value="<?php echo $row['observaciones']; ?>" />
					<br/><br/>
					<a class="btn" href="javascript:void(null);" onclick="updateobservaciones();" ><?php echo $txtaccept; ?></a>
					<a class="btn" onclick="$('#popobservaciones').hide();" href="#"><?php echo $txtcancell; ?></a>
	
			</div>
			
			<div class="popup" id="popcambiotarifa">
	
					<?php echo $txtchangerate; ?>:<br/>
								<?php 
								// obten mesas
								$result = mysql_query("select id_tarifa,nombre from tarifa",$conexion);
								while ($row = mysql_fetch_array($result))
									{
									echo "<div class='botonprocombi'>";
									echo "<a class='btncat' href='javascript: void(null);' onclick='cambiatarifa(".$row['id_tarifa'].");'>".$row['nombre'];
									echo '<img src="./images/trans.png" width="100%" height="100%" />';
									echo "</a>";
									echo "</div>";	
										
									
									}
								?>
					<div style='clear:both;'><br/><br/></div>
					<a class="btn" onclick="cambiatarifa('default')" href="#">Standard</a>
					<div style='clear:both;'><br/><br/></div>
					<a class="btn" onclick="$('#popcambiotarifa').hide();" href="#"><?php echo $txtcancell; ?></a>
			</div>
			
			<div class="popup" id="poplinea">
	
			</div>
			
			<div class="popup"  id="popcancelar">
	
					<h3><?php echo $txtcancellsale; ?>?</h3>
					<a class="btn" onclick="$('#popcancelar').hide();" href="#" ><?php echo $txtno; ?></a>
					<a class="btn" href="javascript:void(null);" onclick="cancelaventa();"><?php echo $txtyes; ?></a>
	
			</div>
			
			<div class="popup" id="cambio_mesa">

							<?php echo $txtselecttable; ?><br/>
								<?php 
								// obten mesas
								$result = mysql_query("select Num_Mesa,descripcion from mesa",$conexion);
								while ($row = mysql_fetch_array($result))
									{
									echo "<div class='botonprocombi'>";
									echo "<input type='radio' name='mesa' id='mesa".$row['Num_Mesa']."' value='".$row['Num_Mesa']."'";
									if ($rowmesa['Num_Mesa'] == $row['Num_Mesa']) { echo " checked "; }
									echo "/>";
									$cadena = '"mesa'.$row['Num_Mesa'].'"';
									echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>".$row['descripcion'];
									echo '<img src="./images/trans.png" width="100%" height="100%" />';
									echo "</a>";
									echo "</div>";	
										
									
									}
								?>
							<div style='clear:both;'><br/><br/></div>
							<a class="btn" href="javascript:void(null);" onclick="cambiamesa();"><?php echo $txtaccept; ?></a>
							<a class="btn" onclick="$('#cambio_mesa').hide();" href="#"><?php echo $txtcancell; ?></a>

			</div>
			
			<div class="popup" id="operaciones">
			
			</div>
			
		
			
			<div class="popup" id="ficha_producto">
			
			</div>

<script>

	function aparcarventa()
		{	
		$('.imgcategoria').appendTo('#img-pro-container'); 
		$('.imgproducto').appendTo('#img-pro-container');	
		$('#operaciones1').load
				(
				'./aparcarventa.php',
				{
				id_venta:<?php echo $_POST['id_venta']; ?>
				},
				function()
					{
					carga('./abiertas.php','pagina');
					}
				);		
		}	
	
	function cambiamesa()
		{
		$('#pagina').load
			(
			'./venta.php',
			{
			id_venta:'<?php echo $_POST['id_venta']; ?>',
			cambio_mesa:'Y',
			//mesa: $('#mesa').attr('value')
			mesa: $('input:radio[name=mesa]:checked').val()
			}
			);		
		}
		
	function cambiatarifa(id)
		{
		$('#pagina').load
			(
			'./venta.php',
			{
			id_venta:'<?php echo $_POST['id_venta']; ?>',
			id_tarifa:id
			}
			);		
		}
		
	function updateobservaciones()
		{
		$('#pagina').load
			(
			'./venta.php',
			{
			id_venta:'<?php echo $_POST['id_venta']; ?>',
			update_observaciones:'Y',
			observaciones: $('#observacionesgen').attr('value')
			}
			);		
		}
		
	function enviacocina()
		{
		$('#operaciones').show();
		$('#operaciones').load
			(
			'./operaciones_venta.php',
			{
			id_venta:'<?php echo $_POST['id_venta']; ?>',
			enviar_cocina:'Y'
			},
			function() 
				{		
				//lineas_venta();
				//setTimeout("$('#operaciones').show();",1);
				//setTimeout("$('#operaciones').hide();",1000);
				}
			);		
		}
		
	function imprimepreticket()
		{
		$('#operaciones').show();
		$('#operaciones').load
			(
			'./operaciones_venta.php',
			{
			id_venta:'<?php echo $_POST['id_venta']; ?>',
			imprimir_preticket:'Y'
			},
			function() 
				{
				//carga('./abiertas.php','pagina');
				//setTimeout("$('#operaciones').show();",500);
				//setTimeout("$('#operaciones').hide();",1500);
				}
			);		
		}
		
	function cargalinea(id)
		{
		$("#ficha_producto").empty();
		$("#poplinea").empty();
		$('#poplinea').load
			(
			'./opciones_linea.php',
			{
			id_venta:'<?php echo $_POST['id_venta']; ?>',
			id_linea:id
			},
			function() 
				{
				$('#poplinea').show();
				}
			);		
		}
		
	function borralinea(id)
		{
		$('#poplinea').load
			(
			'./venta/borralinea.php',
			{
			id_venta:<?php echo $_POST['id_venta']; ?>,
			borrar_producto:id
			},
			function()
				{
				lineas_venta();	
				}
			);		
		}
		
	function showcatalogo()
		{
		$('#pagina').load
			(
			'./catalogo.php',
			{
			id_venta:<?php echo $_POST['id_venta']; ?>
			}
			);		
		}
		
	function cancelaventa()
		{
		$('.imgcategoria').appendTo('#img-pro-container'); 
		$('.imgproducto').appendTo('#img-pro-container');
		$('#operaciones1').load
			(
			'./venta/cancelaventa.php',
			{
			id_venta:<?php echo $_POST['id_venta']; ?>
			}
			);
		$('#pagina').load('./abiertas.php');
		}
		
	function finalizaventa()
		{
		$('.imgcategoria').appendTo('#img-pro-container'); 
		$('.imgproducto').appendTo('#img-pro-container');
		$('#pagina').load
			(
			'./finaliza_venta.php',
			{
			id_venta:<?php echo $_POST['id_venta']; ?>
			}
			);
		}
		
	function showcatalogo(id)
		{

			contsub = document.getElementById("boxsubcategorias").innerHTML;
			//alert(contsub);
			$('#boxsubcategorias').load
				(
				'./sub_categorias.php',
				{
				padre: id,
				contenido: contsub
				}
				);	

			$('#boxproductos').load
				(
				'./productos.php',
				{
				padre: id,
				id_venta:<?php echo $_POST['id_venta']; ?>
				}
				);	
			
		}
	
	function showcategorias(inicio)
		{
			$('.imgcategoria').appendTo('#img-pro-container');
			$('#boxcategorias').load
				(
				'./categorias.php',
				{
				desde: inicio
				}
				);			
		}
			
		
	function showsubcategorias(id,inicio)
		{
			$('.imgsubcategoria').appendTo('#img-pro-container');
			//$('#boxsubcategorias').show();
			$('#boxsubcategorias').load
				(
				'./sub_categorias.php',
				{
				padre: id,	
				desde: inicio
				}
				);
		
		}

	function showproductos(id,inicio)
		{	
			
			$('.imgproducto').appendTo('#img-pro-container');
			$('#boxproductos').load
				(
				'./productos.php',
				{
				padre: id,
				desde: inicio,
				id_venta:<?php echo $_POST['id_venta']; ?>
				},
				function()
					{
					lineas_venta();
					}
				);		
		}
		
	function buscaproductos()
		{
			$('.imgproducto').appendTo('#img-pro-container');
			$('#boxproductos').load
				(
				'./bproductos.php',
				{
				criterio: $("#criterio").val(),
				id_venta:<?php echo $_POST['id_venta']; ?>
				},
				function()
					{
					lineas_venta();
					}
				);		
		}
		
		
	function plusone(id)
		{
		contador = contador + 1;
		if (contador == 11) {contador = 1;}
		//alert($("input[name='bloquec']:checked").val());
		
		$('#operaciones'+contador).load
			(
			'./venta/insertalinea.php',
			{
			add_producto: id,
			cantidad: 1,
			bloque_cocina: $("input[name='bloquec']:checked").val(),
			id_venta:<?php echo $_POST['id_venta']; ?>
			},
			function() 
				{
				//$('#link'+id).prepend('<img src="./images/ok.png"/>');
				lineas_venta();
				}
			);			
		}
		
	function ficha_producto(id)
		{
		$("#ficha_producto").empty();
		$("#poplinea").empty();
		$('#ficha_producto').load
			(
			'./add_producto.php',
			{
			producto: id,
			id_venta:<?php echo $_POST['id_venta']; ?>
			},
			function() 
				{
				$('#ficha_producto').show();
				}
			);			
		}
	function lineas_venta()
		{
		$('#tabla').load
			(
			'./lineas_venta.php',
			{
			id_venta:<?php echo $_POST['id_venta']; ?>
			}
			);			
		}

var elemento = $(".footer");
var posicion = elemento.position();

var alto = posicion.top - elemento.height() - $(".header").height() - $("#buscador").height() - $(".tab").height();	
$("#boxcategorias").height((30*alto)/100);		
$("#boxproductos").height((50*alto)/100);


showcategorias(0);
showproductos('F',0);	
lineas_venta();
document.getElementById("defaultOpen").click();
		


</script>
