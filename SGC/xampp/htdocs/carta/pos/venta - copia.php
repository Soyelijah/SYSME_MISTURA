


            <div class="header">
				NOMBRE DEL LOCAL
            </div>
			
            <div class="content">
			
			
			<div class="tab">
			  <button class="tablinks" onclick="opentab(event, 'Catalogo')" id="defaultOpen">Catalogo</button>
			  <button class="tablinks" onclick="opentab(event, 'Venta')">Venta</button>
			  <button class="tablinks" onclick="opentab(event, 'Opciones')">Opciones</button>
			</div>

			<div id="Catalogo" class="tabcontent">
							
							<div id="buscador">

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

			</div>

				<div id="Opciones" class="tabcontent">

					
				</div>

            </div>
			

			<div class="footer">

				FOOTER

			</div>
			

			

			
			<div class="popup" id="poplinea">
	
			</div>
			

			

			
			<div class="popup" id="operaciones">
			
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
			
			$('.imgproducto').appendTo('#img-pro-container');
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
				$('#ficha_producto').show();
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
//document.getElementById("defaultOpen").click();
		


</script>
