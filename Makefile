.PHONY: test lint audit check

test:
	php tests/product_pagination_test.php
	php tests/security_test.php
	php tests/stock_service_test.php

lint:
	find SGC/xampp/htdocs/pos/pos -type f -name '*.php' -print0 | sort -z | xargs -0 -n1 php -l
	find SGC/xampp/htdocs/pos/pos -type f -name '*.js' -print0 | sort -z | xargs -0 -n1 node --check
	php -l tests/product_pagination_test.php
	php -l tests/security_test.php
	php -l tests/stock_service_test.php

audit:
	! git grep -n -I -E 'dbpass[[:space:]]*=[[:space:]]*[^[:space:];]+|dbuser[[:space:]]*=[[:space:]]*root' -- ':!AUDIT.md' ':!SECURITY.md' ':!Makefile'
	test "$$(git branch --format='%(refname:short)' | paste -sd, -)" = main
	@printf 'Legacy mysql_* files: '; rg -l 'mysql_(query|connect|real_escape_string)' SGC/xampp/htdocs/pos/pos -g '*.php' | wc -l

check: lint test audit
	git diff --check
