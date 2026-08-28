import { ActiveView, Waiter, UserPermissions, UserRole } from '../types';

/**
 * Validates if a specific navigation view / tab is allowed for a user
 * according to their role and granular privileges.
 */
export function isViewAllowedForUser(view: ActiveView, user?: Waiter | null): boolean {
  if (!user) return false;

  // Super Admin has access to all modules and configurations
  if (user.role === 'admin') return true;

  switch (view) {
    case 'floor':
    case 'pos':
    case 'pending-sales':
      // Dining room, tables and POS order taking are for waiters, cashiers and admins
      return user.role === 'waiter' || user.role === 'cashier';

    case 'kitchen':
      // Kitchen KDS panel is exclusively for kitchen chefs and admins
      return user.role === 'kitchen';

    case 'menu':
      // Digital QR menu is accessible to all staff to consult dishes and allergens
      return true;

    case 'reports':
      // Cash shift, closing Z, and financial reports require cashier role or explicit financial/cash permissions
      return (
        user.role === 'cashier' ||
        !!user.permissions?.canViewFinancialReports ||
        !!user.permissions?.canOpenCloseCash
      );

    case 'inventory':
      // Stock and warehouse management requires catalog editing permission
      return !!user.permissions?.canEditCatalog;

    case 'admin':
      // System settings, users and brand config requires user management permission or admin role
      return !!user.permissions?.canManageUsers;

    default:
      return true;
  }
}

/**
 * Returns the primary default landing view when a user logs in based on their role
 */
export function getDefaultViewForUser(user: Waiter): ActiveView {
  if (user.role === 'kitchen') {
    return 'kitchen';
  }
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
    case 'cashier':
      return {
        label: 'Cajera Principal',
        shortLabel: 'Cajera',
        badgeColor: 'bg-emerald-600 text-white',
        lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '💰',
        description: 'Gestión de mesas, cobros de comandas, apertura y cierre Z de caja'
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
