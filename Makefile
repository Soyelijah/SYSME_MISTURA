.PHONY: test lint check

test:
	php tests/product_pagination_test.php
	php tests/security_test.php

lint:
	php -l SGC/xampp/htdocs/pos/pos/lib/product_pagination.php
	php -l SGC/xampp/htdocs/pos/pos/productos.php
	php -l SGC/xampp/htdocs/pos/pos/finaliza_venta.php
	php -l SGC/xampp/htdocs/pos/pos/venta/finalizaventa.php
	php -l SGC/xampp/htdocs/pos/pos/login.php
	php -l SGC/xampp/htdocs/pos/pos/image.php
	php -l SGC/xampp/htdocs/pos/pos/imagecat.php
	php -l SGC/xampp/htdocs/pos/pos/lib/config.php
	php -l SGC/xampp/htdocs/pos/pos/lib/database.php
	php -l SGC/xampp/htdocs/pos/pos/lib/http.php
	php -l SGC/xampp/htdocs/pos/pos/lib/security.php
	php -l SGC/xampp/htdocs/pos/pos/lib/session.php
	php -l tests/product_pagination_test.php
	php -l tests/security_test.php

check: lint test
	git diff --check
