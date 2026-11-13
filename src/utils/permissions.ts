import { ActiveView, Waiter, UserPermissions, UserRole, SystemModulesConfig } from '../types';

/**
 * Validates if a specific navigation view / tab is allowed for a user
 * according to their role, granular privileges, enabled system modules, and device station mode.
 */
export function isViewAllowedForUser(
  view: ActiveView,
  user?: Waiter | null,
  stationMode?: string,
  isMobile?: boolean,
  systemModules?: SystemModulesConfig
): boolean {
  if (!user) return false;

  // Respect system-wide enabled modules (except Admin panel so admin can always re-enable)
  if (systemModules) {
    if (view === 'kitchen' && !systemModules.kitchenKDS) return false;
    if (view === 'menu' && !systemModules.qrMenu) return false;
    if (view === 'inventory' && !systemModules.inventoryControl) return false;
    if (view === 'clients' && !systemModules.clientsAndSuppliers) return false;
    if (view === 'delivery' && !systemModules.deliveryAndCounter) return false;
    if (view === 'reports' && !systemModules.dailyCashClose && !systemModules.graphicalReports) return false;
  }

  // On mobile waiter handheld station or mobile device with waiter role,
  // strictly restrict to floor (mesas), pos (comandero), pending-sales (ventas abiertas) and menu (carta digital)
  const isMobileWaiter = user.role === 'waiter' && (stationMode === 'waiter-mobile' || isMobile);
  if (isMobileWaiter || stationMode === 'waiter-mobile') {
    return view === 'floor' || view === 'pos' || view === 'pending-sales' || view === 'menu';
  }

  // Super Admin on desktop/standard station has access to all modules and configurations
  if (user.role === 'admin') return true;

  switch (view) {
    case 'dashboard':
      return user.role === 'cashier' || user.role === 'manager' || !!user.permissions?.canViewFinancialReports;

    case 'floor':
    case 'pos':
    case 'pending-sales':
      return user.role === 'waiter' || user.role === 'cashier' || user.role === 'manager';

    case 'delivery':
      if (user.role === 'kitchen') return false;
      return user.role === 'cashier' || user.role === 'manager' || user.role === 'delivery' || !!user.permissions?.canCharge;

    case 'clients':
      if (user.role === 'kitchen') return false;
      return user.role === 'cashier' || user.role === 'manager' || user.role === 'waiter' || !!user.permissions?.canEditCatalog;

    case 'kitchen':
      return user.role === 'kitchen' || user.role === 'manager';

    case 'menu':
      return true;

    case 'reports':
      if (user.role === 'waiter' || user.role === 'kitchen' || user.role === 'delivery') return false;
      return (
        user.role === 'cashier' ||
        user.role === 'manager' ||
        !!user.permissions?.canViewFinancialReports ||
        !!user.permissions?.canOpenCloseCash
      );

    case 'inventory':
      if (user.role === 'waiter' || user.role === 'delivery') return false;
      return user.role === 'manager' || !!user.permissions?.canEditCatalog;

    case 'admin':
      if (user.role === 'waiter' || user.role === 'delivery') return false;
      return !!user.permissions?.canManageUsers;

    default:
      return true;
  }
}

/**
 * Returns the primary default landing view when a user logs in based on their role
 */
export function getDefaultViewForUser(user: Waiter): ActiveView {
  if (user.role === 'kitchen') return 'kitchen';
  if (user.role === 'delivery') return 'delivery';
  if (user.role === 'admin' || user.role === 'manager') return 'dashboard';
  return 'floor';
}

/**
 * Checks if a user has a specific granular permission
 */
export function hasUserPermission(user: Waiter, permission: keyof UserPermissions): boolean {
  if (user.role === 'admin') return true;
  if (!user.permissions) return false;
  return !!user.permissions[permission];
}

/**
 * Returns human-readable role metadata for UI displays
 */
export function getRoleMetadata(role: UserRole) {
  switch (role) {
    case 'admin':
      return {
        label: 'Administrador / Gerente',
        shortLabel: 'Admin',
        badgeColor: 'bg-purple-600 text-white',
        lightBg: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: '🛡️',
        description: 'Acceso total a todos los módulos, caja, reportes y configuración del sistema'
      };
    case 'manager':
      return {
        label: 'Encargado / Manager',
        shortLabel: 'Manager',
        badgeColor: 'bg-indigo-600 text-white',
        lightBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: '📋',
        description: 'Gestión de salón, delivery, catálogo, inventario y supervisión de turnos'
      };
    case 'cashier':
      return {
        label: 'Cajera Principal',
        shortLabel: 'Cajera',
        badgeColor: 'bg-emerald-600 text-white',
        lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '💰',
        description: 'Gestión de mesas, delivery, cobros de comandas, apertura y cierre Z de caja'
      };
    case 'waiter':
      return {
        label: 'Garzón / Salón',
        shortLabel: 'Garzón',
        badgeColor: 'bg-blue-600 text-white',
        lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: '📱',
        description: 'Toma de pedidos en mesas, envío de comandas a cocina y carta digital'
      };
    case 'kitchen':
      return {
        label: 'Cocina / Chef KDS',
        shortLabel: 'Cocina',
        badgeColor: 'bg-amber-600 text-white',
        lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: '🍳',
        description: 'Visualización y despacho de comandas en tiempo real'
      };
    case 'delivery':
      return {
        label: 'Repartidor / Delivery',
        shortLabel: 'Repartidor',
        badgeColor: 'bg-orange-600 text-white',
        lightBg: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: '🛵',
        description: 'Seguimiento y entrega de pedidos de delivery asignados'
      };
    default:
      return {
        label: 'Personal',
        shortLabel: 'Usuario',
        badgeColor: 'bg-slate-600 text-white',
        lightBg: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: '👤',
        description: 'Acceso básico al sistema'
      };
  }
}

