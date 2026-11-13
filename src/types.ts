export type Language = 'es' | 'en' | 'nl' | 'fr' | 'de';

export type ThemeMode = 'vibrant-light' | 'vibrant-dark' | 'sysme-classic';

export type TableStatus = 'free' | 'occupied' | 'kitchen' | 'billed';

export type KitchenItemStatus = 'pending' | 'cooking' | 'ready' | 'served';

export type ActiveView =
  | 'dashboard'
  | 'floor'
  | 'delivery'
  | 'pos'
  | 'kitchen'
  | 'menu'
  | 'clients'
  | 'reports'
  | 'inventory'
  | 'sysme-hub'
  | 'pending-sales'
  | 'admin';

export type UserRole = 'admin' | 'cashier' | 'waiter' | 'kitchen' | 'manager' | 'delivery';

export type DeviceStationMode = 'master-pc' | 'waiter-mobile' | 'kitchen-kds';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface UserPermissions {
  canOpenCloseCash: boolean;
  canCashMovements: boolean;
  canCancelSales: boolean;
  canApplyDiscounts: boolean;
  canEditCatalog: boolean;
  canManageUsers: boolean;
  canViewFinancialReports: boolean;
  canTransferTables: boolean;
  canCharge?: boolean;
  canCloseBills?: boolean;
  canPrintPrebill?: boolean;
  canPrintPrebills?: boolean;
}

export interface Waiter {
  id: number;
  name: string;
  username?: string;
  pin: string;
  role: UserRole;
  customRoleId?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  lastLoginAt?: string;
  permissions?: UserPermissions;
}

export interface SystemModulesConfig {
  dailyCashClose: boolean;
  inventoryControl: boolean;
  onlineStore: boolean;
  qrMenu: boolean;
  kitchenKDS: boolean;
  invoicing: boolean;
  clientsAndSuppliers: boolean;
  expenseControl: boolean;
  graphicalReports: boolean;
  whatsappAgent: boolean;
  reservations: boolean;
  cardTerminal: boolean;
  deliveryAndCounter: boolean;
}

export interface TicketTemplateConfig {
  printLogo: boolean;
  headerText: string;
  footerText: string;
  showCurrencySymbol: boolean;
  saleIdFormat: 'last4' | 'full' | 'none';
  maxProductNameLength: number;
  suggestTip: boolean;
  tipPercentage: number;
  paperWidth: '58mm' | '80mm';
  fontSize: 'compact' | 'normal' | 'large';
  showWaiter: boolean;
  showTable: boolean;
  showTime: boolean;
  showDiners: boolean;
  showSubtotalTax: boolean;
  autoPrint: boolean;
  copies: number;
  printerAreaId?: string;
}

export interface TicketPrintSettings {
  precuenta: TicketTemplateConfig;
  comanda: TicketTemplateConfig;
}

export interface PrintArea {
  id: string;
  name: string;
  printerName: string;
  connectionType: 'network' | 'usb' | 'bluetooth';
  ipOrPort: string;
  paperWidth: '58mm' | '80mm';
  copies: number;
  categoryIds: number[];
  autoCut: boolean;
  active: boolean;
  notes?: string;
}

export interface ModifierOptionItem {
  id: string;
  name: string;
  priceExtra: number;
  active: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  icon: 'flame' | 'utensils' | 'package' | 'alert' | 'sparkles';
  color: string;
  multiSelect: boolean;
  required: boolean;
  categoryIds: number[];
  options: ModifierOptionItem[];
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  baseRole: UserRole;
  isWaiter: boolean;
  isDeliveryDriver: boolean;
  permissions: Record<string, boolean>;
}

export interface CustomerClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  fiscalAddress?: string;
  origin?: 'TPV' | 'Delivery' | 'Web' | 'Manual';
  group?: 'General' | 'VIP' | 'Frecuente' | 'Empresa';
  notes?: string;
  balance: number;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  active: boolean;
}

export type OrderChannel = 'salon' | 'mostrador' | 'delivery' | 'express';
export type DeliveryWorkflowStatus = 'preparing' | 'ready' | 'dispatched' | 'delivered';


export interface Warehouse {
  id: number;
  name: string;
  description: string;
}

export interface POSTerminal {
  id: number;
  name: string;
  code: string;
  isOpen: boolean;
  initialCash: number;
}

export interface Salon {
  id: number;
  name: string;
  icon: string;
}

export interface Table {
  id: number;
  number: string;
  name: string;
  salonId: number;
  seats: number;
  status: TableStatus;
  x: number; // grid or canvas coordinates
  y: number;
  width?: number;
  height?: number;
  shape?: 'square' | 'round' | 'rectangle';
  currentSaleId?: number | null;
  ticketNumber?: string;
  preticketPrinted?: boolean;
  diners?: number;
  openedAt?: string;
  waiterId?: number;
  waiterName?: string;
  currentWaiterName?: string;
  total?: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  image?: string;
  order: number;
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
}

export interface ProductOption {
  id: string;
  name: string;
  priceExtra: number;
}

/** Producto o plato vendible del catalogo (precios en CLP enteros con IVA incluido). */
export interface Product {
  id: string;
  name: string;
  categoryId: number;
  subcategoryId?: number;
  /** Precio de venta al publico con IVA incluido, en Pesos Chilenos (CLP enteros). */
  price: number;
  /** Costo de compra / elaboracion en Pesos Chilenos (CLP enteros). */
  buyPrice: number;
  /** Porcentaje de IVA aplicable (en Chile: 19% general, 0% exento). */
  iva: number;
  stock: number;
  minStock: number;
  image: string;
  isKitchen: boolean;
  /** Bloque de marcha KDS: 1 Entradas/Bebidas, 2 Fondos, 3 Postres, 4 Barra. */
  kitchenBlock?: number;
  description?: string;
  allergens?: string[];
  available: boolean;
  options?: ProductOption[];
  isCombination?: boolean;
  combinationGroup?: string;
}

/** Datos fiscales y configuracion de marca del establecimiento (moneda CLP por defecto). */
export interface RestaurantBrand {
  name: string;
  tagline?: string;
  cif: string;
  address: string;
  phone: string;
  city: string;
  postalCode?: string;
  currency?: string;
  tipPercentage?: number;
  ticketFooter?: string;
}

export interface Rate {
  id: string;
  name: string;
  multiplier: number;
  isDefault?: boolean;
}

export interface SaleLine {
  id: string;
  lineId: number;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // Price with rate applied
  originalPrice: number;
  iva: number;
  discount: number; // percentage (0 - 100)
  total: number;
  kitchenNotes?: string;
  observations?: string;
  kitchenBlock: number;
  courseBlock?: number;
  kitchenStatus: KitchenItemStatus;
  selectedOption?: string;
  modifiersExtraPrice?: number;
  sentToKitchenAt?: string;
  waiterId?: number;
  waiterName?: string;
  addedAtTime?: string;
  sentByWaiterId?: number;
  sentByWaiterName?: string;
}

export interface Sale {
  id: number;
  number: string;
  ticketNumber?: string;
  date: string;
  time: string;
  tableNumber: string;
  tableName: string;
  salonId: number;
  salonName: string;
  diners: number;
  waiterId: number;
  waiterName: string;
  currentWaiterId?: number;
  currentWaiterName?: string;
  rateId: string;
  rateName: string;
  status: 'open' | 'closed' | 'parked' | 'cancelled';
  orderType?: OrderChannel;
  deliveryStatus?: DeliveryWorkflowStatus;
  deliveryAddress?: string;
  deliveryPhone?: string;
  customerId?: string;
  customerName?: string;
  driverId?: number;
  driverName?: string;
  deliveryFee?: number;
  items: SaleLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'crypto' | 'other';
  paymentDetails?: {
    cashGiven?: number;
    change?: number;
    cardRef?: string;
    cryptoTx?: string;
  };
  observations?: string;
  notes?: string;
  preticketPrinted?: boolean;
  shiftId?: string;
  createdAt: string;
  closedAt?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'crypto' | 'other';
  active: boolean;
  isDefault?: boolean;
  icon: string;
}

export interface CashMovement {
  id: string;
  type: 'in' | 'out'; // Entrada de efectivo o Salida/Gasto
  amount: number;
  concept: string;
  category: 'supplier' | 'advance' | 'deposit' | 'petty_cash' | 'change' | 'other';
  userName: string;
  date: string;
  time: string;
  receiptNumber?: string;
  notes?: string;
}

export interface CashShift {
  id: string;
  terminalId: number;
  terminalName: string;
  openedBy: string;
  openedAtDate: string;
  openedAtTime: string;
  openedAtIso?: string;
  initialCash: number;
  status: 'open' | 'closed';
  closedBy?: string;
  closedAtDate?: string;
  closedAtTime?: string;
  movements: CashMovement[];
  cashCounted?: number;
  difference?: number;
  reportId?: string;
  notes?: string;
}

export interface CashRegisterReport {
  id: string;
  date: string;
  time: string;
  terminalId: number;
  terminalName: string;
  openedBy: string;
  closedBy: string;
  initialCash: number;
  cashSales: number;
  cardSales: number;
  cryptoSales: number;
  otherSales: number;
  totalSales: number;
  totalTax: number;
  cashCounted: number;
  difference: number;
  salesCount: number;
  notes?: string;
}

export interface TranslationStrings {
  appName: string;
  loginHeader: string;
  employeePasswd: string;
  selectStore: string;
  selectPos: string;
  employee: string;
  store: string;
  pos: string;
  accept: string;
  cancel: string;
  back: string;
  quantity: string;
  add: string;
  subtract: string;
  loginError: string;
  observations: string;
  kitchenOptions: string;
  kitchenOrder: string;
  sale: string;
  table: string;
  time: string;
  diners: string;
  parkSale: string;
  options: string;
  product: string;
  cancelSale: string;
  selectTable: string;
  changeTable: string;
  sendToKitchen: string;
  printPreticket: string;
  search: string;
  openSales: string;
  newSale: string;
  refresh: string;
  closeSession: string;
  kitchenPanel: string;
  finishSale: string;
  changeRate: string;
  floorMap: string;
  digitalMenu: string;
  cashReports: string;
  inventory: string;
  freeTables: string;
  occupiedTables: string;
  totalDay: string;
  cash: string;
  card: string;
  crypto: string;
  change: string;
  amountReceived: string;
  pay: string;
  printTicket: string;
  closeRegister: string;
  adminPanel: string;
  exit: string;
  switchUser: string;
  openCash: string;
  closedCash: string;
  colorMode: string;
  darkMode: string;
  all: string;
  pinPrompt: string;
  selectUser: string;
  lockedTerminal: string;
  ticket: string;
  total: string;
  subtotal: string;
  tax: string;
  pending: string;
  cooking: string;
  ready: string;
  served: string;
  filter: string;
  discount: string;
}
