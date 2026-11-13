# Arquitectura del Sistema — Dy Pos Gastrobar (`Mistura del Perú`)

> Documentación técnica de referencia diseñada para facilitar el mantenimiento, la auditoría y la migración o reescritura del sistema a cualquier otro lenguaje o stack desde GitHub (Python/FastAPI, Node/NestJS, Go, Java/Spring Boot, C#/.NET, Flutter, etc.).

---

## 1. Visión General y Reglas de Negocio

**Dy Pos Gastrobar** es un sistema POS gastronómico integral con soporte para salón, barra, cocina en tiempo real (KDS), delivery, mostrador, carta digital QR interactiva y control de caja con arqueo ciego (Cierre Z).

### Reglas Monetarias y Tributarias (Chile — CLP)
Todas las reglas financieras residen sin dependencias de framework en `src/utils/currency.ts`:
- **Moneda única oficial**: Peso Chileno (`CLP`, símbolo `$`, configuración regional `es-CL`).
- **Aritmética estrictamente entera**: Los precios unitarios, subtotales, impuestos, descuentos, recargos de envío, propinas y vueltos se operan con `roundCLP(amount)` (cero decimales / cero centavos).
- **IVA Chileno (19%)**:
  - Los PVP de catálogo incluyen IVA por defecto (`iva = 19`, o `0` para ítems exentos).
  - Cálculo exacto de desglose neto desde el total bruto para evitar descuadres de redondeo:
    ```text
    neto = round(bruto / (1 + tasaIva / 100))
    iva  = bruto - neto
    // Identidad garantizada: neto + iva === bruto
    ```
- **Arqueo Físico de Caja (Cierre Z)**:
  - Denominaciones vigentes en Chile: `$20.000`, `$10.000`, `$5.000`, `$2.000`, `$1.000`, `$500`, `$100`, `$50`, `$10`.
  - Billetes rápidos de cobro: `$5.000`, `$10.000`, `$20.000`, `$40.000`, `$50.000`.

---

## 2. Estructura del Proyecto

```text
src/
├── App.tsx                       # Enrutador principal de vistas, modo cliente QR y verificación RBAC
├── main.tsx                      # Punto de entrada React
├── types.ts                      # Modelos de dominio e interfaces TypeScript (portables a SQL/JSON Schema)
├── index.css                     # Estilos globales Tailwind CSS v4
│
├── utils/                        # Lógica pura sin estado UI (100% portable a backend u otro lenguaje)
│   ├── currency.ts               # Reglas CLP enteros, IVA 19% Chile, formateo es-CL y denominaciones
│   ├── permissions.ts            # Matriz RBAC por rol, privilegios granulares, módulos y estación
│   ├── categoryMeta.ts           # Metadatos visuales y descripciones de categorías gastronómicas
│   ├── language.ts               # Catálogo de idiomas disponibles (es, en, nl, fr, de)
│   ├── sound.ts                  # Sintetizador Web Audio API (feedback táctil y campana KDS)
│   └── theme.ts                  # Paletas y utilidades de tema claro/oscuro/clásico
│
├── data/                         # Datos semilla iniciales y traducciones
│   ├── mockData.ts               # Carta Mistura del Perú (85 platos, 14 categorías), salones, mesas, usuarios semilla
│   └── defaultConfigs.ts         # Módulos del sistema, plantillas de ticket, áreas de impresión, modificadores y roles
│
├── context/
│   └── POSContext.tsx            # Store central de estado, sincronización multi-pestaña y persistencia localStorage
│
└── components/                   # Capa de presentación modular por dominio
    ├── LoginScreen.tsx           # Autenticación por PIN (sin credenciales expuestas en pantalla)
    ├── RegisterScreen.tsx        # Componente de alta de operador (reservado al flujo administrativo)
    ├── Sidebar.tsx               # Menú lateral animado filtrable según permisos del usuario
    ├── TopBar.tsx                # Cabecera contextual, reloj es-CL y selector de usuario
    ├── UserSessionSheet.tsx      # Hoja de sesión activa, cambio rápido de usuario y cierre de sesión
    ├── CashShiftBanner.tsx       # Indicador de estado de turno/caja abierto
    ├── DashboardView.tsx         # Panel ejecutivo en tiempo real
    ├── FloorPlanView.tsx         # Plano interactivo de salones y mesas
    ├── POSOrderTerminal.tsx      # TPV / Comandero táctil de toma de pedidos (desktop y móvil garzón)
    ├── PendingSalesView.tsx      # Listado y cobro rápido de ventas abiertas
    ├── DeliveryAndCounterView.tsx# Flujo de Delivery, Mostrador y Express
    ├── KitchenDisplay.tsx        # Monitor de Cocina KDS por bloques de marcha (1º, 2º, 3º, Barra)
    ├── DigitalMenu.tsx           # Administrador de Carta Digital y generador de QR por mesa
    ├── CustomerPortal.tsx        # Portal público de autoservicio del comensal vía QR
    ├── ClientsView.tsx           # Directorio de clientes y cuentas corrientes
    ├── CashReports.tsx           # Gráficos de ventas y Cierres Z históricos
    ├── InventoryManager.tsx      # Control de stock y alertas de stock mínimo
    ├── AdminPanel.tsx            # Panel integral de administración
    ├── DatabaseManager.tsx       # Visor CRUD de tablas, exportación JSON/SQL/CSV y restauración
    ├── PaymentModal.tsx          # Modal de cobro (Efectivo CLP, Tarjeta, QR/Crypto) y vuelto
    ├── CashShiftModal.tsx        # Apertura de caja, movimientos de efectivo y Cierre Z
    ├── TicketPrintModal.tsx      # Previsualización e impresión térmica 58mm / 80mm
    ├── ProductOptionsModal.tsx   # Selector de variantes, modificadores y notas de cocina
    ├── EmployeePasswordModal.tsx # Validación de PIN al abrir mesa ocupada
    ├── admin/                    # Sub-módulos exclusivos de Administración
    │   ├── UsersDirectoryManager.tsx      # Creación y gestión de personal (solo Admin)
    │   ├── RolesPermissionsManager.tsx    # Roles personalizados y matriz de permisos
    │   ├── ModifiersManager.tsx           # Grupos de opciones y modificadores con extras en CLP
    │   ├── PrintAreasManager.tsx          # Impresoras de cocina/barra/caja y enrutamiento por categoría
    │   ├── TicketCustomizationSettings.tsx# Editor WYSIWYG de Precuenta y Comanda (58/80mm)
    │   └── SystemModulesSettings.tsx      # Activación/desactivación modular del sistema
    └── digital-menu/             # Sub-componentes de la Carta Digital QR
        ├── MobileCustomerView.tsx
        ├── DishDetailModal.tsx
        ├── MobileOrderDrawer.tsx
        ├── CallWaiterModal.tsx
        └── QRStandModal.tsx
```

---

## 3. Modelos de Dominio Clave (`src/types.ts`)

Para portar el sistema a una base de datos relacional (PostgreSQL/MySQL) o backend orientado a objetos:

| Entidad | Clave Primaria | Relaciones y Campos Principales |
| :--- | :--- | :--- |
| `Waiter` (Usuario/Personal) | `id: number` | `role` (`admin` \| `manager` \| `cashier` \| `waiter` \| `kitchen` \| `delivery`), `pin`, `customRoleId`, `permissions: UserPermissions`, `active` |
| `CustomRole` | `id: string` | `baseRole`, `isWaiter`, `isDeliveryDriver`, `permissions: Record<string, boolean>` |
| `Category` | `id: number` | `name`, `icon`, `color`, `order` |
| `Product` | `id: string` | `categoryId -> Category`, `price` (CLP entero c/IVA), `buyPrice` (CLP entero), `iva` (`19` o `0`), `stock`, `minStock`, `isKitchen`, `kitchenBlock` (`1..4`), `options?: ProductOption[]` |
| `Salon` / `Table` | `id: number` | `salonId -> Salon`, `status` (`free` \| `occupied` \| `kitchen` \| `billed`), `currentSaleId -> Sale`, `diners`, `total` |
| `Sale` (Comanda/Ticket) | `id: number` | `orderType` (`salon` \| `mostrador` \| `delivery` \| `express`), `status` (`open` \| `closed` \| `parked` \| `cancelled`), `deliveryStatus`, `items: SaleLine[]`, `subtotal` (Neto CLP), `taxTotal` (IVA CLP), `deliveryFee` (CLP), `total` (Total Bruto CLP), `paymentMethod`, `paymentDetails` |
| `SaleLine` | `id: string` | `productId -> Product`, `quantity`, `unitPrice`, `iva`, `discount` (%), `total` (CLP), `kitchenBlock`, `kitchenStatus` (`pending` \| `cooking` \| `ready` \| `served`), `selectedOption`, `modifiersExtraPrice` |
| `CashShift` / `CashRegisterReport` | `id: string` | `terminalId`, `initialCash` (CLP), `movements: CashMovement[]`, `cashSales`, `cardSales`, `cryptoSales`, `cashCounted`, `difference` |
| `PrintArea` | `id: string` | `printerName`, `connectionType` (`network` \| `usb` \| `bluetooth`), `ipOrPort`, `paperWidth` (`58mm` \| `80mm`), `categoryIds: number[]` |

---

## 4. Control de Acceso Basado en Roles (RBAC)

La función pura `isViewAllowedForUser()` y `hasUserPermission()` en `src/utils/permissions.ts` gobiernan tanto la navegación como las acciones críticas:

- **`admin`**: Acceso completo a todas las vistas y pestañas de configuración. Único rol autorizado para crear y administrar usuarios desde `AdminPanel -> UsersDirectoryManager`.
- **`manager`**: Dashboard, salón/mesas, TPV, ventas abiertas, delivery, clientes, inventario, cocina, carta QR y reportes (sin gestión de usuarios salvo permiso explícito).
- **`cashier`**: Dashboard, salón/mesas, TPV, ventas abiertas, delivery, clientes, carta QR y caja/reportes (Cierre Z).
- **`waiter`**: Salón/mesas, TPV comandero, ventas abiertas, clientes y carta QR. En dispositivos móviles o estación `waiter-mobile`, queda bloqueado estrictamente a `floor`, `pos`, `pending-sales` y `menu`.
- **`kitchen`**: Monitor de Cocina KDS (`kitchen`) y Carta QR (`menu`).
- **`delivery`**: Gestión de entregas (`delivery`) y Carta QR (`menu`).

---

## 5. Modos de Estación y Parámetros URL

El sistema detecta automáticamente parámetros de consulta (`URLSearchParams`) para operar como terminales independientes en red local:

| Parámetro URL | Modo Activado | Descripción |
| :--- | :--- | :--- |
| `/` (sin parámetros) | `master-pc` | Caja Principal / Administración (requiere login por PIN). |
| `/?mode=customer&table=N` | Portal Comensal QR | Carta digital pública de clientes asociada a la Mesa `N` con envío directo de pedidos a cocina/caja. |
| `/?station=waiter-mobile` | `waiter-mobile` | Modo Comandero Móvil para garzones (acceso directo móvil sin barra lateral de escritorio). |
| `/?station=kitchen-kds` | `kitchen-kds` | Pantalla dedicada de Cocina KDS en tiempo real. |

---

## 6. Persistencia de Estado y Migración a Backend API

Actualmente el estado se persiste en `localStorage` bajo el prefijo `sysme_*` (y se sincroniza entre pestañas mediante el evento `storage` del navegador en `POSContext.tsx`). Al migrar a un backend REST/GraphQL o SQL:

1. **Catálogo y Configuración**: `sysme_categories`, `sysme_products`, `sysme_print_areas`, `sysme_modifier_groups`, `sysme_system_modules`, `sysme_ticket_settings`, `sysme_restaurant_settings`.
2. **Operación Diaria**: `sysme_tables`, `sysme_sales`, `sysme_active_sale`, `sysme_clients`.
3. **Caja y Auditoría**: `sysme_terminal`, `sysme_current_shift`, `sysme_shift_history`, `sysme_reports`.
4. **Seguridad y Sesión**: `sysme_waiters`, `sysme_custom_roles`, `sysme_waiter`, `sessionStorage['sysme_session_active']`.
5. **Control de Semilla**: `sysme_catalog_seed_version` (gestionado por `ensureCLPSeedMigration()`).

> **Tip para portabilidad**: `DatabaseManager.tsx` ya incluye generadores de esquema SQL (`CREATE TABLE` / `INSERT ... ON CONFLICT`) con columnas `DECIMAL(12,0)` listas para PostgreSQL/MySQL/SQLite.
