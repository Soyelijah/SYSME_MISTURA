<?php
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit();
	}
include "./conn.php";
include_once "./lib/security.php";
include "./".$_SESSION['idioma'].".php";
// datos del producto
$result = mysql_query("select complementog,precio,descripcion,cocina,tipo_combinado,bloque_cocina from complementog where id_complementog = '".$_POST['producto']."'",$conexion);
$row = mysql_fetch_array($result);
if ($row['cocina'] == 'Y') {$cocina = 'Y';} else {$cocina = 'N';}
if ($row['bloque_cocina'] > 0) {$_SESSION['bloque_cocina'] = $row['bloque_cocina'];}
$combinado = 'N';
$tipocombinado = $row['tipo_combinado'];
?>


							<h3>
							<?php echo $row['complementog']; ?>
                            </h3>
							<p>
							<?php echo $row['descripcion']; ?>
                            </p>



					<form>

					<?php echo $txtcantidad; ?>:
					<input type="text" name="cantidad" id="cantidad" value="1" size="1" readonly />
					<a class="btn" href="#" onclick="restar('cantidad')"><?php echo $txtrestar; ?></a>
					<a class="btn" href="#" onclick="sumar('cantidad')"><?php echo $txtsumar; ?> </a>
					<br/><br/>
					<?php
					// muestra nuevo precio si el precio es 0
					if ($row['precio'] == 0)
					{
					?>
					Precio: <input type="text" name="precio" id="precio" value="0" size="3" readonly /><br/><br/>
					<a class="btn" href="#" onclick="escribirprecio('precio','7')">7</a>
					<a class="btn" href="#" onclick="escribirprecio('precio','8')">8</a>
					<a class="btn" href="#" onclick="escribirprecio('precio','9')">9</a><br/><br/>
					<a class="btn" href="#" onclick="escribirprecio('precio','4')">4</a>
					<a class="btn" href="#" onclick="escribirprecio('precio','5')">5</a>
					<a class="btn" href="#" onclick="escribirprecio('precio','6')">6</a><br/><br/>
					<a class="btn" href="#" onclick="escribirprecio('precio','1')">1</a>
					<a class="btn" href="#" onclick="escribirprecio('precio','2')">2</a>
					<a class="btn" href="#" onclick="escribirprecio('precio','3')">3</a><br/><br/>
					<a class="btn" href="#" onclick="escribirprecio('precio','0')">0</a>
					<a class="btn" href="#" onclick="escribirprecio('precio','.')">.</a>
					<a class="btn" href="#" onclick="borrarprecio('precio')">C</a><br/><br/>
					<br/><br/>
					<?php
					}
					?>

					<?php
					// Opciones de combinación
					$result2 = mysql_query("select c.pack_generado as pack_generado,c.id_complementog1 as id_complementog1,p.complementog as complementog from combinados c,complementog p where c.id_complementog = '".$_POST['producto']."' and c.id_complementog1 = p.id_complementog",$conexion);
					if (mysql_num_rows($result2) > 0)
						{
						$combinado = 'Y';
						if ($row['tipo_combinado'] == '1')
							{
							?>

							<?php echo $txtcombinewith; ?>:<br/>
							<?php

							echo "<div class='botonprocombi'>";
							echo "<input type='radio' name='combinado' id='combinadono' value='no' checked />";
							$cadena = '"combinadono"';
							echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>".$txtnocombine;
							echo '<img src="./images/trans.png" width="100%" height="100%" />';
							echo "</a>";
							echo "</div>";

							while ($row2 = mysql_fetch_array($result2))
								{
								echo "<div class='botonprocombi'>";
								echo "<input type='radio' name='combinado' id='combinado".$row2['pack_generado']."' value='".$row2['pack_generado']."'/>";
								$cadena = '"combinado'.$row2['pack_generado'].'"';
								echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>".substr($row2['complementog'],0,15);
								echo '<img src="./image.php?id='.$row2['id_complementog1'].'" width="100%" height="100%" />';
								echo "</a>";
								echo "</div>";


								//echo "<option value='".$row2['pack_generado']."'>".$row2['complementog']."</option>";
								}
							?>

							<?php
							}
						else
							{

							echo $txtcombinationsextras.":<br/>";
							while ($row2 = mysql_fetch_array($result2))
								{
								echo "<div class='botonprocombi'>";
								echo "<input type='checkbox' id='".$row2['id_complementog1']."' name='".$row2['id_complementog1']."' value='".$row2['id_complementog1']."'/>";
								$cadena = '"'.$row2['id_complementog1'].'"';
								echo "<a class='btncat' href='javascript: void(null);' onclick='marca(".$cadena.");'>".substr($row2['complementog'],0,15);
								echo '<img src="./image.php?id='.$row2['id_complementog1'].'" width="100%" height="100%" />';
								echo "</a>";
								echo "</div>";
								}

							}
						echo "<div style='clear:both;'><br/><br/></div>";
						}

					?>

					<?php
					//if ($row['cocina'] == 'Y')
					//{
						// BLOQUES DE COCINA

						echo $txtkitchenorder.":<br/>";

						echo "<div class='botonprocombi'>";
						echo "<input type='radio' name='bloque_cocina' id='bloque1' value='1'";
						if ($_SESSION['bloque_cocina'] == 1) { echo " checked "; }
						echo "/>";
						$cadena = '"bloque1"';
						echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>1";
						echo '<img src="./images/trans.png" width="100%" height="100%" />';
						echo "</a>";
						echo "</div>";

						echo "<div class='botonprocombi'>";
						echo "<input type='radio' name='bloque_cocina' id='bloque2' value='2'";
						if ($_SESSION['bloque_cocina'] == 2) { echo " checked "; }
						echo "/>";
						$cadena = '"bloque2"';
						echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>2";
						echo '<img src="./images/trans.png" width="100%" height="100%" />';
						echo "</a>";
						echo "</div>";

						echo "<div class='botonprocombi'>";
						echo "<input type='radio' name='bloque_cocina' id='bloque3' value='3'";
						if ($_SESSION['bloque_cocina'] == 3) { echo " checked "; }
						echo "/>";
						$cadena = '"bloque3"';
						echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>3";
						echo '<img src="./images/trans.png" width="100%" height="100%" />';
						echo "</a>";
						echo "</div>";

						echo "<div class='botonprocombi'>";
						echo "<input type='radio' name='bloque_cocina' id='bloque4' value='4'";
						if ($_SESSION['bloque_cocina'] == 4) { echo " checked "; }
						echo "/>";
						$cadena = '"bloque4"';
						echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>4";
						echo '<img src="./images/trans.png" width="100%" height="100%" />';
						echo "</a>";
						echo "</div>";



						echo "<div style='clear:both;'><br/><br/></div>";

						// OPCIONES DE COCINA

						echo $txtkitchenoptions.":<br/>";
						// obten opciones de cocina
						//$result = mysql_query("select * from notacocina",$conexion);

						$result = mysql_query("select * from notacocina where id_nota in (select id_nota from pnotacocina where id_complementog = '".$_POST['producto']."')",$conexion);
						if (mysql_num_rows($result) == 0)
						  {
						  $result = mysql_query("select * from notacocina",$conexion);
						  }

						while ($row = mysql_fetch_array($result))
							{
							echo "<div class='botonprocombi'>";
							echo "<input type='checkbox' id='nota".$row['id_nota']."' name='".$row['id_nota']."' value='".$row['id_nota']."'/>";
							$cadena = '"nota'.$row['id_nota'].'"';
							echo "<a class='btncat' href='javascript: void(null);' onclick='marca(".$cadena.");'>";
							echo $row['nota'];
							echo '<img src="./images/trans.png" width="100%" height="100%" />';
							echo "</a>";
							echo "</div>";
							}
						echo "<div style='clear:both;'><br/><br/></div>";
						// bloques para configurar ordenees
					//}
					?>


					<?php echo $txtobservations; ?>:<br/>
					<!--<input type="text" name="observaciones" id="observaciones" placeholder="<?php echo $txtobservations; ?>" value="" />-->
					<textarea id="observaciones" name="observaciones" rows="4" cols="40"></textarea>
					<div style='clear:both;'><br/><br/></div>

					</form>



               <div class="footerpopup">

                            <a href="javascript:void(null);" onclick="$('#ficha_producto').empty(); $('#ficha_producto').hide();" class="btn">
                                <?php echo $txtcancell; ?>
                            </a>
							&nbsp;
							<a href="javascript:void(null);" onclick="add('<?php echo $_POST['producto']; ?>');" class="btn">
                                <?php echo $txtaccept; ?>
                            </a>
							<br/><br/>

                </div>

<script>


	function add(id)
		{
		// comprueba si el campo de precio existe
		if ( $("#precio") )
			{
				nuevoprecio = $('#precio').val();
			}
		else
			{
			nuevoprecio = 0;
			}

			$.ajax({
				url: './venta/insertalinea.php',
				type: 'POST',
				dataType: 'json',
				data: {
			add_producto: id,
				cantidad: $('#cantidad').val(),
			precio: nuevoprecio,
			<?php
			if ($combinado == 'Y')
				{
				if ($tipocombinado == '1')
					{
					?>
					combinado: $('input:radio[name=combinado]:checked').val(),
					<?php
					}
				else
					{
					$result2 = mysql_query("select c.pack_generado as pack_generado,c.id_complementog1 as id_complementog1,p.complementog as complementog from combinados c,complementog p where c.id_complementog = '".$_POST['producto']."' and c.id_complementog1 = p.id_complementog",$conexion);
					while ($row2 = mysql_fetch_array($result2))
						{
						echo "'".$row2['id_complementog1']."':$('#".$row2['id_complementog1'].":checked').val(),";
						}
					}
				}
			if ($cocina == 'Y')
				{
				?>
				bloque_cocina: $("input[name='bloque_cocina']:checked").val(),
				<?php
				$result3 = mysql_query("select * from notacocina",$conexion);
				while ($row3 = mysql_fetch_array($result3))
					{
					echo "'".$row3['id_nota']."':$('#nota".$row3['id_nota'].":checked').val(),";
					}
				}
			?>
				observaciones: $('#observaciones').val(),
				id_venta: <?php echo (int) $_POST['id_venta']; ?>,
				csrf_token: <?php echo json_encode(csrf_token()); ?>
					}
			}).done(function () {
					lineas_venta();
					$("#ficha_producto").empty();
					$('#ficha_producto').hide();
			}).fail(showOperationError);
		}

</script>
