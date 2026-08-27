# Auditoría técnica y de seguridad

Fecha de revisión: 2026-08-27

## Veredicto

Los flujos modernizados de paginación, autenticación, imágenes y finalización de
venta superan las pruebas automatizadas y el análisis sintáctico. Durante esta
revisión se detectó y corrigió una regresión de autorización: el esquema del TPV
representa permisos concedidos con `Y`, mientras que la primera implementación
del comprobador solo aceptaba `S`.

El sistema completo **todavía no debe considerarse apto para exposición a una
red no confiable**. Permanecen 27 scripts propios que utilizan la API eliminada
`mysql_*`; varios endpoints mutables concatenan datos de la petición y no tienen
protección CSRF ni transacciones. Esta deuda es anterior a la modernización y no
queda ocultada por el resultado positivo de las pruebas de los endpoints
críticos migrados.

## Controles completados

- Lint de los 45 archivos PHP propios del TPV.
- Validación sintáctica de los dos archivos JavaScript propios.
- Pruebas de paginación y recorrido sin duplicados.
- Pruebas de tokens CSRF, permisos `Y/N` y `S/N`, configuración por entorno,
  rechazo de usuario administrativo y estructura segura del cobro.
- Búsqueda de credenciales en el árbol Git actual.
- Confirmación de una única rama local `main`.

## Riesgos residuales priorizados

### Crítico

1. Migrar a PDO y consultas preparadas los endpoints de líneas de venta:
   `insertalinea.php`, `updatelinea.php`, `borralinea.php` y
   `cancelaventa.php`.
2. Añadir CSRF, autorización por operación y transacciones a todos los
   endpoints mutables.
3. Rotar las credenciales históricas y sanear el historial antes de publicar el
   repositorio. Quitarlas del árbol actual no invalida copias anteriores.

### Alto

1. Migrar los 27 scripts que todavía dependen de `mysql_*`.
2. Dejar de guardar credenciales de base de datos en la sesión cuando finalice
   la migración de los scripts heredados.
3. Ejecutar pruebas de integración concurrentes contra una copia del esquema
   MySQL real. El repositorio solo incluye binarios Windows y el entorno de
   auditoría no proporciona una instancia compatible inicializada.

### Medio

1. Sustituir el PHP 5.4 incluido por una versión con soporte de seguridad.
2. Incorporar análisis estático, pruebas de navegador y auditoría WCAG en CI.
3. Completar la sustitución de enlaces `javascript:` y estilos rígidos en las
   pantallas que no fueron modificadas.

## Condiciones antes de producción

1. Rotar secretos y crear un usuario SQL de mínimo privilegio.
2. Ejecutar `make check` y `make audit`.
3. Probar login, cobro, rollback, doble cobro concurrente e impresión contra una
   copia de la base de datos real.
4. Completar los elementos críticos anteriores o aislar el TPV en una red de
   confianza hasta terminar la migración.
