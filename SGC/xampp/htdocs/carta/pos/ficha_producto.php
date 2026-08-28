<?php 
session_start();
include "./conn.php";
include "./".$_SESSION['idioma'].".php";
// datos del producto
$result = mysql_query("select complementog,descripcion,pvp,precio,cocina from complementog where id_complementog = '".$_POST['producto']."'",$conexion);
$row = mysql_fetch_array($result);

?>

					
							<h3>
							<?php echo $row['complementog'].'<br/>'.$row['pvp'].$_SESSION['moneda']; ?>
                            </h3>
							<img src="./image.php?id=<?php echo $_POST['producto'] ?>"/>
							<div style="clear:both;">
							<?php echo $row['descripcion']; ?>
							<br/><br/>
							</div>

					

				
               <div class="footerpopup">

                            <a href="javascript:void(null);" onclick="$('#ficha_producto').empty(); $('#ficha_producto').hide();" class="btn">
                                <?php echo $txtaccept; ?>
                            </a>
							<br/><br/>
							
                </div>