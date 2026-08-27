<?php
session_start();
require_once './lib/database.php';

$categoryId = isset($_GET['id']) && is_string($_GET['id']) && preg_match('/^[A-Za-z0-9_.-]{1,64}$/', $_GET['id'])
	? $_GET['id'] : null;
if (!$categoryId || empty($_SESSION['id_camarero'])) {
	http_response_code(empty($_SESSION['id_camarero']) ? 401 : 400);
	exit();
}

try {
	$statement = application_database()->prepare(
		'select imagen from tipo_comg where id_tipo_comg = ? limit 1'
	);
	$statement->execute(array($categoryId));
	$image = $statement->fetchColumn();
	header('Content-Type: image/jpeg');
	header('Cache-Control: private, max-age=300');
	if ($image !== false && $image !== null) {
		echo $image;
		exit();
	}
} catch (Exception $exception) {
	error_log('Category image failed: ' . $exception->getMessage());
}

header('Content-Type: image/jpeg');
readfile('./images/no-imagecat.jpg');
