<?php

$failures = 0;

function mobile_assert($condition, $message)
{
	global $failures;
	if (!$condition) {
		$failures++;
		fwrite(STDERR, "FAIL: " . $message . "\n");
	}
}

$root = dirname(__FILE__) . '/../SGC/xampp/htdocs/pos/pos/';
$index = file_get_contents($root . 'index.php');
$styles = file_get_contents($root . 'css/estilo.css');

mobile_assert(
	strpos($index, 'width=device-width, initial-scale=1, viewport-fit=cover') !== false,
	'El documento configura escala y areas seguras para dispositivos moviles.'
);
mobile_assert(strpos($index, 'name="theme-color"') !== false, 'El navegador recibe el color de la interfaz.');
mobile_assert(strpos($index, '<html lang=') !== false, 'El documento expone su idioma a lectores de pantalla.');
mobile_assert(strpos($index, 'id="pagina" role="main"') !== false, 'El contenido principal tiene una region semantica.');

foreach (array(
	'--tpv-ink',
	'min-height: 100dvh',
	'min-height: 44px',
	'touch-action: manipulation',
	'overflow-x: auto',
	'@media (max-width: 720px)',
	'@media (max-width: 420px)',
	'@media (prefers-reduced-motion: reduce)',
	'env(safe-area-inset-bottom)',
) as $responsiveContract) {
	mobile_assert(
		strpos($styles, $responsiveContract) !== false,
		'El contrato responsive incluye: ' . $responsiveContract
	);
}

mobile_assert(
	!file_exists($root . 'css/estilo - copia.css'),
	'La copia obsoleta de la hoja de estilos no debe reaparecer.'
);

if ($failures) {
	fwrite(STDERR, $failures . " mobile UI test(s) failed.\n");
	exit(1);
}

echo "All mobile UI tests passed.\n";
