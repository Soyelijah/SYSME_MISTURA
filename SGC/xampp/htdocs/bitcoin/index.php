<?php
 require_once './jsonRPCClient.php';
 include "../pos/phpqrcode.php";
 
try 
	{
	$bitcoin = new jsonRPCClient('http://'.$_POST['user'].':'.$_POST['passwd'].'@'.$_POST['host'].':'.$_POST['port'].'/');

 
  // nueva direcci�n para recibir cobros
  if (isset($_POST['amount']) and isset($_POST['label']))
	{
	$_POST['amount'] = str_replace(",",".",$_POST['amount']);
	$nueva = $bitcoin->getnewaddress($_POST['label']);
	$url = "bitcoin:".$nueva."?amount=".$_POST['amount']."&label=".$_POST['label'];
	//QRcode::png($url, $nueva.'.png', 'H', 4, 2);
	QRcode::png($url, $nueva.'.png');
	echo $nueva;
	}
	}
catch (Exception $e)
	{
	echo "error";
	}	  


  
?>