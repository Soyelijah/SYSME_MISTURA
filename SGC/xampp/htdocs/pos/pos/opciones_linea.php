<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
include "./".$_SESSION['idioma'].".php";
// datos de la linea
$result = mysql_query("select *,round(precio * (1 + (avgiva / 100)),2) as pvp from ventadir_comg where id_linea = ".$_POST['id_linea']." and id_venta = ".$_POST['id_venta'],$conexion);
$row = mysql_fetch_array($result);
$result2 = mysql_query("select permitircambioprecio from complementog where id_complementog = ".$row['id_complementog'],$conexion);
$row2 = mysql_fetch_array($result2);
?>



							<h3>
                                <?php echo $row['complementog']; ?>
                            </h3>	

			


                <form>
				
					<?php echo $txtcantidad; ?>:<br/>
					<input type="text" name="cantidad" id="cantidad" value="<?php echo $row['cantidad']; ?>" readonly /><br/><br/>
					<a class="btn" href="#" onclick="restar('cantidad')"><?php echo $txtrestar; ?></a>
					<a class="btn" href="#" onclick="sumar('cantidad')"><?php echo $txtsumar; ?> </a>
					<br/><br/>
					
					<?php
					if ($_SESSION['preciomanual'] == 'Y' && $row2['permitircambioprecio'] == 'S')
					{
					?>
					Precio: <input type="text" name="precio" id="precio" value="<?php echo $row['pvp']; ?>" size="3" readonly /><br/><br/>
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
					<?php
					} else {
					?>
					<input type="hidden" name="precio" id="precio" value="<?php echo $row['pvp']; ?>" />
					
					<?php
					}
					?>
					
					
					
					
					<?php 
					// Opciones de combinación
					$escombinado = 'N';
					$result2 = mysql_query("select c.pack_generado as pack_generado,c.id_complementog1 as id_complementog1,p.complementog as complementog from combinados c,complementog p where c.id_complementog = '".$row['id_complementog']."' and c.id_complementog1 = p.id_complementog and c.id_complementog in (select id_complementog from complementog where id_complementog = '".$row['id_complementog']."' and (tipo_combinado = '2' or tipo_combinado = '3'))",$conexion);
					if (mysql_num_rows($result2) > 0)
						{
						$escombinado = 'Y';


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

						
						echo "<div style='clear:both;'><br/><br/></div>";
						}
					
					?>
					
					
					
					<?php 
					$result2 = mysql_query("select cocina from complementog where id_complementog= '".$row['id_complementog']."'",$conexion);
					$row2 = mysql_fetch_array($result2);
					if ($row2['cocina'] == 'Y')
					{
					
						// BLOQUES DE COCINA
						
						echo $txtkitchenorder.":<br/>";
						
						
						echo "<div class='botonprocombi'>";
						echo "<input type='radio' name='bloque_cocina' id='bloque1' value='1'";
						if ($row['bloque_cocina'] == 1) { echo " checked "; }
						echo "/>";
						$cadena = '"bloque1"';
						echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>1";
						echo '<img src="./images/trans.png" width="100%" height="100%" />';
						echo "</a>";
						echo "</div>";
						
						echo "<div class='botonprocombi'>";
						echo "<input type='radio' name='bloque_cocina' id='bloque2' value='2'";
						if ($row['bloque_cocina'] == 2) { echo " checked "; }
						echo "/>";
						$cadena = '"bloque2"';
						echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>2";
						echo '<img src="./images/trans.png" width="100%" height="100%" />';
						echo "</a>";
						echo "</div>";
					
						echo "<div class='botonprocombi'>";
						echo "<input type='radio' name='bloque_cocina' id='bloque3' value='3'";
						if ($row['bloque_cocina'] == 3) { echo " checked "; }
						echo "/>";
						$cadena = '"bloque3"';
						echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>3";
						echo '<img src="./images/trans.png" width="100%" height="100%" />';
						echo "</a>";
						echo "</div>";
						
						echo "<div class='botonprocombi'>";
						echo "<input type='radio' name='bloque_cocina' id='bloque4' value='4'";
						if ($row['bloque_cocina'] == 4) { echo " checked "; }
						echo "/>";
						$cadena = '"bloque4"';
						echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>4";
						echo '<img src="./images/trans.png" width="100%" height="100%" />';
						echo "</a>";
						echo "</div>";

						
						echo "<div style='clear:both;'><br/><br/></div>";
					
						echo $txtkitchenoptions.":<br/>";
						// obten opciones de cocina
						$result3 = mysql_query("select * from notacocina where id_nota in (select id_nota from pnotacocina where id_complementog = '".$row['id_complementog']."')",$conexion);
						if (mysql_num_rows($result3) == 0)
						  {
						  $result3 = mysql_query("select * from notacocina",$conexion);	
						  }
						while ($row3 = mysql_fetch_array($result3))
							{
							echo "<div class='botonprocombi'>";
							echo "<input type='checkbox' id='".$row3['id_nota']."' name='".$row3['id_nota']."' value='".$row3['id_nota']."'";
							if (strpos($row['nota'],$row3['nota']) !== false) { echo " checked='true'"; }
							echo "/>";
							$cadena = '"'.$row3['id_nota'].'"';
							echo "<a class='btncat' href='javascript: void(null);' onclick='marca(".$cadena.");'>";
							echo $row3['nota'];
							echo '<img src="./images/trans.png" width="100%" height="100%" />';
							echo "</a>";
							echo "</div>";
							}
					echo "<div style='clear:both;'><br/><br/></div>";		
					}
					?>
					
					<?php echo $txtobservations; ?>:<br/>
					<!--<input type="text" name="observaciones" id="observaciones" placeholder="<?php echo $txtobservations; ?>" value="<?php echo $row['observaciones']; ?>" />-->
					<textarea id="observaciones" name="observaciones" rows="4" cols="40"><?php echo $row['observaciones']; ?></textarea>
					<div style='clear:both;'><br/><br/></div>
					
					
                </form>

               <div class="footerpopup">

                            <a href="javascript:void(null);" onclick="$('#poplinea').empty(); $('#poplinea').hide();" class="btn">
                                <?php echo $txtcancell; ?>
                            </a>
							&nbsp;
							<a href="javascript:void(null);" onclick="updatelinea();" class="btn">
                                <?php echo $txtaccept; ?>
                            </a>
							<br/><br/>
                </div>		


<script>	


		
	function updatelinea()
		{
		$('#operaciones1').load
			(
			'./venta/updatelinea.php',
			{
			id_venta:'<?php echo $_POST['id_venta']; ?>',
			update_linea:'<?php echo $_POST['id_linea']; ?>',
			cantidad: $('#cantidad').attr('value'),
			precio: $('#precio').attr('value'),
			<?php 
			if ($escombinado == 'Y')
			//if ($bandera == 'Y')
				{
					$result4 = mysql_query("select c.pack_generado as pack_generado,c.id_complementog1 as id_complementog1,p.complementog as complementog from combinados c,complementog p where c.id_complementog = '".$row['id_complementog']."' and c.id_complementog1 = p.id_complementog and c.id_complementog in (select id_complementog from complementog where id_complementog = '".$row['id_complementog']."' and (tipo_combinado = '2' or tipo_combinado = '3'))",$conexion);
					while ($row4 = mysql_fetch_array($result4))
						{
						echo "'".$row4['id_complementog1']."':$('#".$row4['id_complementog1'].":checked').val(),";
						}
				}
			if ($row2['cocina'] == 'Y')
			{
			?>
			bloque_cocina: $("input[name='bloque_cocina']:checked").val(),
			<?php 
			$result3 = mysql_query("select * from notacocina",$conexion);
			while ($row3 = mysql_fetch_array($result3))
				{
				echo "'".$row3['id_nota']."':$('#".$row3['id_nota'].":checked').val(),";
				}
			}
			?>
			observaciones: $('#observaciones').attr('value')
			},
			function() 
				{
				lineas_venta();
				$("#poplinea").empty();
				$('#poplinea').hide();
				}
			);		
		}
</script>
