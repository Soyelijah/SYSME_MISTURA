import {
  SystemModulesConfig,
  TicketPrintSettings,
  PrintArea,
  ModifierGroup,
  CustomRole,
  CustomerClient,
  UserPermissions
} from '../types';

export const DEFAULT_SYSTEM_MODULES: SystemModulesConfig = {
  dailyCashClose: true,
  inventoryControl: true,
  onlineStore: true,
  qrMenu: true,
  kitchenKDS: true,
  invoicing: true,
  clientsAndSuppliers: true,
  expenseControl: true,
  graphicalReports: true,
  whatsappAgent: false,
  reservations: true,
  cardTerminal: true,
  deliveryAndCounter: true,
};

export const SYSTEM_MODULE_ITEMS: {
  key: keyof SystemModulesConfig;
  label: string;
  description: string;
}[] = [
  {
    key: 'dailyCashClose',
    label: 'Arqueo de caja diario',
    description: 'Control de apertura, movimientos y cierre Z por turno.'
  },
  {
    key: 'inventoryControl',
    label: 'Control de inventario',
    description: 'Gestión de stock, alertas de reposición y almacén.'
  },
  {
    key: 'onlineStore',
    label: 'Tienda online',
    description: 'Canal de pedidos web directo sin comisiones de terceros.'
  },
  {
    key: 'qrMenu',
    label: 'Carta QR',
    description: 'Menú digital interactivo para escanear desde cada mesa.'
  },
  {
    key: 'kitchenKDS',
    label: 'Monitor de cocina KDS',
    description: 'Pantalla de pases, tiempos de marcha y alerta sonora en cocina.'
  },
  {
    key: 'invoicing',
    label: 'Emisión de boletas/facturas',
    description: 'Tickets fiscales, comprobantes detallados y serie tributaria.'
  },
  {
    key: 'clientsAndSuppliers',
    label: 'Gestión de clientes y proveedores',
    description: 'Base CRM de comensales frecuentes, cuenta corriente y datos fiscales.'
  },
  {
    key: 'expenseControl',
    label: 'Control de gastos',
    description: 'Registro de egresos, pagos a proveedores y salidas de caja.'
  },
  {
    key: 'graphicalReports',
    label: 'Reportes gráficos y resultados',
    description: 'Indicadores de ventas, platos estrella y rendimiento por turno.'
  },
  {
    key: 'whatsappAgent',
    label: 'Agente de WhatsApp',
    description: 'Confirmación automatizada de pedidos de delivery y estado.'
  },
  {
    key: 'reservations',
    label: 'Reservas',
    description: 'Agenda de reservas por salón y asignación anticipada de mesas.'
  },
  {
    key: 'cardTerminal',
    label: 'Terminal de pagos con tarjeta',
    description: 'Integración con datáfono Redcompra / POS bancario en caja.'
  },
  {
    key: 'deliveryAndCounter',
    label: 'Delivery y Mostrador Express',
    description: 'Control de pedidos a domicilio, retiro en mostrador y barra express.'
  },
];

export const DEFAULT_TICKET_SETTINGS: TicketPrintSettings = {
  precuenta: {
    printLogo: false,
    headerText: 'PRE-CUENTA',
    footerText: 'COMPROBANTE NO VÁLIDO COMO BOLETA\nGracias por su preferencia',
    showCurrencySymbol: true,
    saleIdFormat: 'last4',
    maxProductNameLength: 23,
    suggestTip: true,
    tipPercentage: 10,
    paperWidth: '80mm',
    fontSize: 'normal',
    showWaiter: true,
    showTable: true,
    showTime: true,
    showDiners: true,
    showSubtotalTax: true,
    autoPrint: false,
    copies: 1,
    printerAreaId: 'area-barra',
  },
  comanda: {
    printLogo: false,
    headerText: 'COMANDA DE PREPARACIÓN',
    footerText: '--- FIN DE COMANDA ---',
    showCurrencySymbol: false,
    saleIdFormat: 'last4',
    maxProductNameLength: 26,
    suggestTip: false,
    tipPercentage: 0,
    paperWidth: '80mm',
    fontSize: 'large',
    showWaiter: true,
    showTable: true,
    showTime: true,
    showDiners: true,
    showSubtotalTax: false,
    autoPrint: true,
    copies: 1,
    printerAreaId: 'area-cocina',
  },
};

export const DEFAULT_PRINT_AREAS: PrintArea[] = [
  {
    id: 'area-barra',
    name: 'Barra',
    printerName: 'Epson TM-T20III Barra',
    connectionType: 'network',
    ipOrPort: '192.168.1.51:9100',
    paperWidth: '80mm',
    copies: 1,
    categoryIds: [100, 6, 102, 7, 8, 103],
    autoCut: true,
    active: true,
    notes: 'Tickets de barra, coctelería, bebidas, cafés, licores y precuentas de caja.'
  },
  {
    id: 'area-cocina',
    name: 'Cocina',
    printerName: 'Star TSP143III Cocina Caliente',
    connectionType: 'network',
    ipOrPort: '192.168.1.52:9100',
    paperWidth: '80mm',
    copies: 1,
    categoryIds: [1, 109, 111, 110, 4, 112, 120, 2, 121, 122, 3, 123, 124, 9],
    autoCut: true,
    active: true,
    notes: 'Comandas de entradas, ceviches, causas, tiraditos, fondos, pescados, sopas y postres.'
  }
];

export const DEFAULT_MODIFIER_GROUPS: ModifierGroup[] = [
  {
    id: 'meat_doneness',
    name: 'Términos de Carnes',
    icon: 'flame',
    color: 'text-rose-500',
    multiSelect: false,
    required: false,
    categoryIds: [],
    options: [
      { id: 'opt-md-1', name: 'Al Punto', priceExtra: 0, active: true },
      { id: 'opt-md-2', name: 'Término Medio', priceExtra: 0, active: true },
      { id: 'opt-md-3', name: 'Tres Cuartos (3/4)', priceExtra: 0, active: true },
      { id: 'opt-md-4', name: 'Bien Cocido', priceExtra: 0, active: true },
      { id: 'opt-md-5', name: 'Sellado / A la Inglesa', priceExtra: 0, active: true },
      { id: 'opt-md-6', name: 'A la Plancha', priceExtra: 0, active: true },
      { id: 'opt-md-7', name: 'Crocante / Bien Dorado', priceExtra: 0, active: true },
    ],
  },
  {
    id: 'sides',
    name: 'Guarnición / Acompañamiento',
    icon: 'utensils',
    color: 'text-amber-500',
    multiSelect: true,
    required: false,
    categoryIds: [],
    options: [
      { id: 'opt-sd-1', name: 'Con Arroz', priceExtra: 0, active: true },
      { id: 'opt-sd-2', name: 'Con Puré de Papas', priceExtra: 0, active: true },
      { id: 'opt-sd-3', name: 'Con Puré Rústico', priceExtra: 0, active: true },
      { id: 'opt-sd-4', name: 'Con Papas Fritas', priceExtra: 0, active: true },
      { id: 'opt-sd-5', name: 'Con Ensalada Mixta', priceExtra: 0, active: true },
      { id: 'opt-sd-6', name: 'Con Verduras Salteadas', priceExtra: 0, active: true },
      { id: 'opt-sd-7', name: 'Cheddar Extra', priceExtra: 1500, active: true },
      { id: 'opt-sd-8', name: 'Sin Guarnición', priceExtra: 0, active: true },
    ],
  },
  {
    id: 'service',
    name: 'Servicio & Marcha',
    icon: 'package',
    color: 'text-blue-500',
    multiSelect: true,
    required: false,
    categoryIds: [],
    options: [
      { id: 'opt-sv-1', name: 'Para Llevar (Take Away)', priceExtra: 0, active: true },
      { id: 'opt-sv-2', name: 'En Aviso (Marchar Después)', priceExtra: 0, active: true },
      { id: 'opt-sv-3', name: 'Servir de Inmediato', priceExtra: 0, active: true },
      { id: 'opt-sv-4', name: 'Urgente / Prioridad Cocina', priceExtra: 0, active: true },
      { id: 'opt-sv-5', name: 'Para Compartir', priceExtra: 0, active: true },
      { id: 'opt-sv-6', name: 'Consumo en Salón', priceExtra: 0, active: true },
    ],
  },
  {
    id: 'exclusions',
    name: 'Preferencias & Exclusiones',
    icon: 'alert',
    color: 'text-emerald-500',
    multiSelect: true,
    required: false,
    categoryIds: [],
    options: [
      { id: 'opt-ex-1', name: 'Sin Sal', priceExtra: 0, active: true },
      { id: 'opt-ex-2', name: 'Sin Cebolla', priceExtra: 0, active: true },
      { id: 'opt-ex-3', name: 'Sin Ajo', priceExtra: 0, active: true },
      { id: 'opt-ex-4', name: 'Sin Picante', priceExtra: 0, active: true },
      { id: 'opt-ex-5', name: 'Extra Picante', priceExtra: 0, active: true },
      { id: 'opt-ex-6', name: 'Salsa Aparte', priceExtra: 0, active: true },
      { id: 'opt-ex-7', name: 'Sin Gluten / Celíaco', priceExtra: 0, active: true },
      { id: 'opt-ex-8', name: 'Sin Lactosa', priceExtra: 0, active: true },
      { id: 'opt-ex-9', name: 'Bebida con Hielo', priceExtra: 0, active: true },
      { id: 'opt-ex-10', name: 'Bebida Sin Hielo', priceExtra: 0, active: true },
      { id: 'opt-ex-11', name: 'Con Limón', priceExtra: 0, active: true },
    ],
  },
];

export interface PermissionGroupDefinition {
  id: string;
  label: string;
  items: { key: string; label: string }[];
}

export const PERMISSION_CATALOG: PermissionGroupDefinition[] = [
  {
    id: 'salon',
    label: 'Salón',
    items: [
      { key: 'salon.view', label: 'Ver mesas y estado del salón' },
      { key: 'salon.open_table', label: 'Abrir mesas y registrar comensales' },
      { key: 'salon.add_items', label: 'Agregar productos a comandas' },
      { key: 'salon.send_kitchen', label: 'Enviar órdenes a cocina / barra' },
      { key: 'salon.transfer_table', label: 'Traspasar o unir mesas' },
      { key: 'salon.print_preticket', label: 'Imprimir precuenta de mesa' },
      { key: 'salon.edit_layout', label: 'Editar mapa y diseño de salones' },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    items: [
      { key: 'delivery.view', label: 'Ver pedidos de Delivery y Mostrador' },
      { key: 'delivery.create', label: 'Crear nuevos pedidos de Delivery / Mostrador' },
      { key: 'delivery.assign_driver', label: 'Asignar repartidor a pedidos' },
      { key: 'delivery.change_status', label: 'Cambiar estado (En preparación / Listo / Enviado)' },
      { key: 'delivery.express', label: 'Operar Mostrador Express' },
    ],
  },
  {
    id: 'ventas',
    label: 'Ventas',
    items: [
      { key: 'ventas.view_open', label: 'Consultar ventas abiertas y pendientes' },
      { key: 'ventas.charge', label: 'Cobrar cuentas y emitir comprobantes' },
      { key: 'ventas.discounts', label: 'Aplicar descuentos y cupones' },
      { key: 'ventas.cancel', label: 'Anular ventas o eliminar líneas enviadas' },
      { key: 'ventas.edit_prices', label: 'Modificar tarifas y precios en terminal' },
    ],
  },
  {
    id: 'productos',
    label: 'Productos',
    items: [
      { key: 'productos.view', label: 'Ver catálogo, carta QR y precios' },
      { key: 'productos.edit', label: 'Crear y editar productos y categorías' },
      { key: 'productos.modifiers', label: 'Configurar opciones y modificadores' },
      { key: 'productos.stock', label: 'Gestionar stock e inventario de almacén' },
    ],
  },
  {
    id: 'gastos',
    label: 'Gastos y proveedores',
    items: [
      { key: 'gastos.view', label: 'Consultar movimientos de caja y gastos' },
      { key: 'gastos.create', label: 'Registrar salidas de efectivo y pagos a proveedores' },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    items: [
      { key: 'clientes.view', label: 'Ver directorio de clientes' },
      { key: 'clientes.edit', label: 'Crear, editar y exportar clientes' },
      { key: 'clientes.credit', label: 'Gestionar cuentas corrientes y saldos' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    items: [
      { key: 'reportes.view_sales', label: 'Ver reportes de ventas e indicadores' },
      { key: 'reportes.z_close', label: 'Consultar historial de cierres Z' },
      { key: 'reportes.export', label: 'Exportar reportes en CSV / imprimir' },
    ],
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    items: [
      { key: 'finanzas.open_close_cash', label: 'Abrir y cerrar turnos de caja (Cierre Z)' },
      { key: 'finanzas.cash_movements', label: 'Realizar ingresos y retiros de caja' },
      { key: 'finanzas.view_totals', label: 'Visualizar arqueos y diferencias de caja' },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    items: [
      { key: 'admin.users', label: 'Crear y administrar usuarios del personal' },
      { key: 'admin.roles', label: 'Crear y configurar roles con permisos personalizados' },
      { key: 'admin.printers', label: 'Configurar tickets y áreas de impresión' },
      { key: 'admin.modules', label: 'Activar o desactivar módulos del sistema' },
      { key: 'admin.settings', label: 'Editar datos del local, base de datos y terminales' },
    ],
  },
];

export const ALL_PERMISSION_KEYS: string[] = PERMISSION_CATALOG.flatMap(g => g.items.map(i => i.key));

const buildPermissionMap = (keys: string[] | 'all'): Record<string, boolean> => {
  const map: Record<string, boolean> = {};
  ALL_PERMISSION_KEYS.forEach(k => {
    map[k] = keys === 'all' ? true : keys.includes(k);
  });
  return map;
};

export const DEFAULT_CUSTOM_ROLES: CustomRole[] = [
  {
    id: 'role-admin',
    name: 'admin',
    description: 'Acceso completo a salón, finanzas, personal, impresoras y módulos.',
    baseRole: 'admin',
    isWaiter: false,
    isDeliveryDriver: false,
    permissions: buildPermissionMap('all'),
  },
  {
    id: 'role-manager',
    name: 'manager',
    description: 'Gestión operativa de salón, delivery, ventas, productos y reportes.',
    baseRole: 'manager',
    isWaiter: false,
    isDeliveryDriver: false,
    permissions: buildPermissionMap([
      'salon.view', 'salon.open_table', 'salon.add_items', 'salon.send_kitchen', 'salon.transfer_table', 'salon.print_preticket',
      'delivery.view', 'delivery.create', 'delivery.assign_driver', 'delivery.change_status', 'delivery.express',
      'ventas.view_open', 'ventas.charge', 'ventas.discounts', 'ventas.cancel',
      'productos.view', 'productos.edit', 'productos.modifiers', 'productos.stock',
      'gastos.view', 'gastos.create',
      'clientes.view', 'clientes.edit',
      'reportes.view_sales', 'reportes.z_close', 'reportes.export',
      'finanzas.open_close_cash', 'finanzas.cash_movements', 'finanzas.view_totals',
    ]),
  },
  {
    id: 'role-cashier',
    name: 'cashier',
    description: 'Operación de caja, cobro de mesas, mostrador, delivery y arqueo diario.',
    baseRole: 'cashier',
    isWaiter: false,
    isDeliveryDriver: false,
    permissions: buildPermissionMap([
      'salon.view', 'salon.open_table', 'salon.add_items', 'salon.send_kitchen', 'salon.transfer_table', 'salon.print_preticket',
      'delivery.view', 'delivery.create', 'delivery.assign_driver', 'delivery.change_status', 'delivery.express',
      'ventas.view_open', 'ventas.charge', 'ventas.discounts',
      'productos.view',
      'gastos.view', 'gastos.create',
      'clientes.view', 'clientes.edit',
      'reportes.view_sales', 'reportes.z_close',
      'finanzas.open_close_cash', 'finanzas.cash_movements', 'finanzas.view_totals',
    ]),
  },
  {
    id: 'role-waiter',
    name: 'waiter',
    description: 'Toma de pedidos en mesas, envío a cocina y consulta de carta.',
    baseRole: 'waiter',
    isWaiter: true,
    isDeliveryDriver: false,
    permissions: buildPermissionMap([
      'salon.view', 'salon.open_table', 'salon.add_items', 'salon.send_kitchen', 'salon.print_preticket',
      'ventas.view_open',
      'productos.view',
      'clientes.view',
    ]),
  },
  {
    id: 'role-kitchen',
    name: 'kitchen',
    description: 'Monitor de cocina KDS y despacho de platos.',
    baseRole: 'kitchen',
    isWaiter: false,
    isDeliveryDriver: false,
    permissions: buildPermissionMap(['productos.view']),
  },
  {
    id: 'role-delivery',
    name: 'repartidor',
    description: 'Repartidor de pedidos a domicilio y control de entregas.',
    baseRole: 'delivery',
    isWaiter: false,
    isDeliveryDriver: true,
    permissions: buildPermissionMap([
      'delivery.view', 'delivery.change_status', 'clientes.view'
    ]),
  },
];

export const mapCustomRoleToUserPermissions = (role: CustomRole): UserPermissions => {
  const p = role.permissions || {};
  if (role.baseRole === 'admin') {
    return {
      canOpenCloseCash: true,
      canCashMovements: true,
      canCancelSales: true,
      canApplyDiscounts: true,
      canEditCatalog: true,
      canManageUsers: true,
      canViewFinancialReports: true,
      canTransferTables: true,
      canCharge: true,
      canCloseBills: true,
      canPrintPrebill: true,
      canPrintPrebills: true,
    };
  }
  return {
    canOpenCloseCash: !!p['finanzas.open_close_cash'],
    canCashMovements: !!p['finanzas.cash_movements'],
    canCancelSales: !!p['ventas.cancel'],
    canApplyDiscounts: !!p['ventas.discounts'],
    canEditCatalog: !!(p['productos.edit'] || p['productos.stock'] || p['productos.modifiers']),
    canManageUsers: !!(p['admin.users'] || p['admin.roles'] || p['admin.modules'] || p['admin.printers']),
    canViewFinancialReports: !!(p['reportes.view_sales'] || p['finanzas.view_totals']),
    canTransferTables: !!p['salon.transfer_table'],
    canCharge: !!p['ventas.charge'],
    canCloseBills: !!p['ventas.charge'],
    canPrintPrebill: !!p['salon.print_preticket'],
    canPrintPrebills: !!p['salon.print_preticket'],
  };
};

export const INITIAL_CLIENTS: CustomerClient[] = [
  {
    id: 'cli-ejemplo',
    name: 'Cliente Ejemplo',
    email: 'ejemplo@email.com',
    phone: '+56 9 1122 3344',
    taxId: '16.540.320-1',
    address: 'Av. Providencia 1420, Depto 502',
    fiscalAddress: 'Av. Providencia 1420, Santiago',
    origin: 'TPV',
    group: 'Frecuente',
    notes: 'Prefiere entrega en conserjería o mesa junto a la ventana.',
    balance: 0,
    ordersCount: 6,
    totalSpent: 148500,
    createdAt: '2026-09-12T10:30:00Z',
    active: true,
  },
  {
    id: 'cli-camila',
    name: 'Camila Valenzuela',
    email: 'camila.valenzuela@correo.cl',
    phone: '+56 9 8451 2209',
    taxId: '18.230.911-4',
    address: 'Calle Los Leones 890, Providencia',
    fiscalAddress: 'Calle Los Leones 890, Santiago',
    origin: 'Delivery',
    group: 'VIP',
    notes: 'Alergia leve a frutos secos. Sin cebolla en hamburguesas.',
    balance: 0,
    ordersCount: 14,
    totalSpent: 392000,
    createdAt: '2026-08-03T18:15:00Z',
    active: true,
  },
  {
    id: 'cli-estudio',
    name: 'Estudio Nómada SpA',
    email: 'facturacion@estudionomada.cl',
    phone: '+56 2 2480 9900',
    taxId: '77.410.550-8',
    address: 'Nueva Tajamar 481, Oficina 904',
    fiscalAddress: 'Nueva Tajamar 481, Las Condes',
    origin: 'Manual',
    group: 'Empresa',
    notes: 'Solicita factura electrónica al cierre mensual.',
    balance: -24500,
    ordersCount: 9,
    totalSpent: 520000,
    createdAt: '2026-07-20T13:00:00Z',
    active: true,
  },
];
