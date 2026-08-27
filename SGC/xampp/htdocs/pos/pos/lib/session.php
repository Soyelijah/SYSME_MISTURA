<?php

function start_secure_session()
{
	if (session_id() !== '') {
		return;
	}

	$isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== '' && $_SERVER['HTTPS'] !== 'off';
	ini_set('session.use_only_cookies', '1');
	ini_set('session.cookie_httponly', '1');
	if ($isHttps) {
		ini_set('session.cookie_secure', '1');
	}
	session_set_cookie_params(0, '/', '', $isHttps, true);
	session_start();
}
