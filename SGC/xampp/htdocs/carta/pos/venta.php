<?php 
session_start();
include "./conn.php";
include "./".$_SESSION['idioma'].".php";
// datos del producto
$result = mysql_query("select razon_social from sysme.empresa",$conexion);
$row = mysql_fetch_array($result);

?>


            <div class="header">
				<?php echo $row['razon_social']; ?>
            </div>
			
            <div class="content">
			
		

			<div id="Catalogo">
							

							<div id="boxcategorias" style="position: relative;">
							</div>
							
							<div style="clear:both;"></div>
							
							<div id="boxsubcategorias" style="width: 100%; background-color: #eeeeee; display: none;">
							</div>
							
							<div style="clear:both;"></div>
							
							<div id="boxproductos">
							</div>

			</div>





            </div>
			

			<div class="footer">

                            <a href="javascript:void(null);" onclick="topFunction();" class="btn">
                                Arriba
                            </a>

			</div>
			

		
			
			<div class="popup" id="ficha_producto">
			
			</div>

<script>

	
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
			
			//$('.imgproducto').appendTo('#img-pro-container');
			$('#boxproductos').load
				(
				'./productos.php',
				{
				padre: id,
				desde: inicio
				}
				);		
		}
		
	function ficha_producto(id)
		{
		$("#ficha_producto").empty();
		$('#ficha_producto').load
			(
			'./ficha_producto.php',
			{
			producto: id
			},
			function() 
				{
				topFunction();
				$('#ficha_producto').show();
				}
			);			
		}
		

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}


$("#boxcategorias").height(200);
$("#boxsubcategorias").height(150);

showcategorias(0);
showproductos('F',0);	

		


</script>
