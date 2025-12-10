<?php
session_start();
// ini
$array_ini = parse_ini_file("../../sysmetpv.ini");
$_SESSION['dbhost'] = $array_ini['dbhost'];
$_SESSION['dbport'] = $array_ini['dbport'];
$_SESSION['dbuser'] = $array_ini['dbuser'];
$_SESSION['dbpass'] = $array_ini['dbpass'];
$_SESSION['dbname'] = $array_ini['dbname'];
$_SESSION['idioma'] = $array_ini['idioma'];
$_SESSION['hosteleria'] = $array_ini['hosteleria'];
$_SESSION['checkincremento'] = $array_ini['checkincremento'];
$_SESSION['ordercat'] = $array_ini['ordercat'];
$_SESSION['orderpro'] = $array_ini['orderpro'];
$_SESSION['almacen'] = $array_ini['almacen'];
$_SESSION['tpv'] = $array_ini['tpv'];
$_SESSION['login'] = $array_ini['login'];
$_SESSION['anchotpv'] = $array_ini['anchotpv'];
$_SESSION['altotpv'] = $array_ini['altotpv'];
$_SESSION['seriefactura'] = $array_ini['SerieFactura'];
include "./conn.php";
$result = mysql_query("select id_almacen from almacen where nom_almacen = '".$_SESSION['almacen']."'",$conexion);
$row = mysql_fetch_array($result);
$_SESSION['id_almacen'] = $row['id_almacen'];
$result = mysql_query("select id_caja from cajas where nombre = '".$_SESSION['tpv']."'",$conexion);
$row = mysql_fetch_array($result);
$_SESSION['id_caja'] = $row['id_caja'];
$result = mysql_query("select moneda from sysme.empresa",$conexion);
$row = mysql_fetch_array($result);
$_SESSION['moneda'] = $row['moneda'];

include "./".$_SESSION['idioma'].".php";
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>
		<?php echo $txtappname; ?>
        </title>
		<meta name="viewport" content="width=device-width"/>
		<link rel="stylesheet" href="./css/estilo.css?<?php echo time(); ?>" />
		<script src="./js/jquery.js"></script>
		<script src="./js/cargomedia.js"></script>
		
		
		<script>
		var contador = 0;
		</script>
    </head>
    <body>
	


        <div id="pagina">
		</div>
		
			<div id="operaciones1" class="oculto"></div>
			<div id="operaciones2" class="oculto"></div>
			<div id="operaciones3" class="oculto"></div>
			<div id="operaciones4" class="oculto"></div>
			<div id="operaciones5" class="oculto"></div>
			<div id="operaciones6" class="oculto"></div>
			<div id="operaciones7" class="oculto"></div>
			<div id="operaciones8" class="oculto"></div>
			<div id="operaciones9" class="oculto"></div>
			<div id="operaciones10" class="oculto"></div>
			
<div id="img-pro-container" class="popup">

</div>
		
<script>




	function carga(fichero,contenedor)
		{
		var anchodisponible = document.getElementById('pagina').offsetWidth;
		if (anchodisponible > 980) {anchodisponible = 980;}
		var altodisponible = document.getElementById('pagina').offsetHeight;
		$('#'+contenedor).load
			(
			fichero,
			{
			ancho: anchodisponible,
			alto: altodisponible
			}
			);		
		}
		
		
	function cargaventa(id)
		{
		$('#pagina').load
			(
			'./venta.php',
			{
			id_venta:id
			}
			);		
		}
		
	function sumar(id)
		{
		var valor=parseInt($('input[name='+id+']').val());
		valor = valor + 1;
		$('input[name='+id+']').val(valor);
		}

	function restar(id)
		{
		var valor=parseInt($('input[name='+id+']').val());
		//if (valor > 1)
		//	{
			valor = valor - 1;
		//	}
		$('input[name='+id+']').val(valor);
		}	
		
	function escribirprecio(id,texto)
		{
		var valor=$('input[name='+id+']').val();
		if (valor == '0') {valor = '';}
		if ((valor.indexOf('.') != -1) && (texto == '.')) {texto = '';}
		valor = valor + texto;
		$('input[name='+id+']').val(valor);
		}
		
	function borrarprecio(id)
		{
		valor = '0';
		$('input[name='+id+']').val(valor);
		}

	function marca(id)
		{
				//alert(id);
				var marcado = $("#"+id+"").is(":checked");
				//alert(marcado);
				if(!marcado)
					$("#"+id).prop("checked", true);
				else
					$("#"+id).prop("checked", false);
		}
		
	function marca2(id)
		{
				//alert(id);
				$("#"+id).prop("checked", true);
		}	

	function createimage(tipo,padre,id) 
	{
		var x = document.createElement("IMG");
		//alert(tipo);
		if (tipo == "P")
			{
			x.setAttribute("src", "./image.php?id="+id);
			x.setAttribute("id", "imgproducto-"+id);
			x.setAttribute("class", "imgproducto");
			}
		if (tipo == "C")
			{
			x.setAttribute("src", "./imagecat.php?id="+id);
			x.setAttribute("id", "imgcategoria-"+id);
			x.setAttribute("class", "imgcategoria");
			}
		if (tipo == "S")
			{
			x.setAttribute("src", "./imagecat.php?id="+id);
			x.setAttribute("id", "imgsubcategoria-"+id);
			x.setAttribute("class", "imgsubcategoria");
			}

		x.setAttribute("width", "100%");
		x.setAttribute("height", "100%");
		$("#"+padre).append(x);
	}		

function opentab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
		
	// carga inicial
	carga('./mobile.php','pagina');
	
	
	
</script>

		
    </body>
</html>

