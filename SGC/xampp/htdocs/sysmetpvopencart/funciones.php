<?php 
function limpiatexto($texto)
	{
	$cadena=$texto;

	// acentos
	$cadena= str_replace('á', '&aacute;',$cadena);
	$cadena= str_replace('é', '&eacute;',$cadena);
	$cadena= str_replace('í', '&iacute;',$cadena);
	$cadena= str_replace('ó', '&oacute;',$cadena);
	$cadena= str_replace('ú', '&uacute;',$cadena);
	$cadena= str_replace('Á', '&Aacute;',$cadena);
	$cadena= str_replace('É', '&Eacute;',$cadena);
	$cadena= str_replace('Í', '&Iacute;',$cadena);
	$cadena= str_replace('Ó', '&Oacute;',$cadena);
	$cadena= str_replace('Ú', '&Uacute;',$cadena);

	// eñes
	$cadena= str_replace('ñ', '&ntilde;',$cadena);
	$cadena= str_replace('Ñ', '&Ntilde;',$cadena);
	
	// espacios
	$cadena= str_replace('&nbsp;', ' ',$cadena);
	
	// segunda funcion
	$cadena = sanear_string(utf8_encode($cadena));
   
	return $cadena;
	}
	
function sanear_string($string)
{

    $string = trim($string);

    $string = str_replace(
        array('á', 'à', 'ä', 'â', 'ª', 'Á', 'À', 'Â', 'Ä'),
        array('a', 'a', 'a', 'a', 'a', 'A', 'A', 'A', 'A'),
        $string
    );

    $string = str_replace(
        array('é', 'è', 'ë', 'ê', 'É', 'È', 'Ê', 'Ë'),
        array('e', 'e', 'e', 'e', 'E', 'E', 'E', 'E'),
        $string
    );

    $string = str_replace(
        array('í', 'ì', 'ï', 'î', 'Í', 'Ì', 'Ï', 'Î'),
        array('i', 'i', 'i', 'i', 'I', 'I', 'I', 'I'),
        $string
    );

    $string = str_replace(
        array('ó', 'ò', 'ö', 'ô', 'Ó', 'Ò', 'Ö', 'Ô'),
        array('o', 'o', 'o', 'o', 'O', 'O', 'O', 'O'),
        $string
    );

    $string = str_replace(
        array('ú', 'ù', 'ü', 'û', 'Ú', 'Ù', 'Û', 'Ü'),
        array('u', 'u', 'u', 'u', 'U', 'U', 'U', 'U'),
        $string
    );

    $string = str_replace(
        array('ñ', 'Ñ', 'ç', 'Ç'),
        array('n', 'N', 'c', 'C',),
        $string
    );

    //Esta parte se encarga de eliminar cualquier caracter extraño
    $string = str_replace(
        array("\\", "¨", "º", "~",
             "#", "|", "\"",
             "·",
             "¡",
             "[", "^", "`", "]",
             "}", "{", "¨", "´",
             ";"),
        '',
        $string
    );


    return $string;
}
?>
