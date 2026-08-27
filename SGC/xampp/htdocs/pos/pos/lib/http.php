<?php

function api_response($status, array $payload)
{
	http_response_code((int) $status);
	header('Content-Type: application/json; charset=UTF-8');
	header('Cache-Control: no-store');
	echo json_encode($payload);
	exit();
}

function api_error($status, $code, $message)
{
	api_response($status, array(
		'ok' => false,
		'error' => array('code' => $code, 'message' => $message),
	));
}

function api_success(array $data)
{
	api_response(200, array('ok' => true, 'data' => $data));
}
