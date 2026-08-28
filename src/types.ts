export type Language = 'es' | 'en' | 'nl' | 'fr' | 'de';

export type ThemeMode = 'vibrant-light' | 'vibrant-dark' | 'sysme-classic';

export type TableStatus = 'free' | 'occupied' | 'kitchen' | 'billed';

export type KitchenItemStatus = 'pending' | 'cooking' | 'ready' | 'served';

export type ActiveView = 'floor' | 'pos' | 'kitchen' | 'menu' | 'reports' | 'inventory' | 'sysme-hub' | 'pending-sales' | 'admin';

export type UserRole = 'admin' | 'cashier' | 'waiter' | 'kitchen';

export type DeviceStationMode = 'master-pc' | 'waiter-mobile' | 'kitchen-kds';

export interface UserPermissions {
  canOpenCloseCash: boolean;
  canCashMovements: boolean;
  canCancelSales: boolean;
  canApplyDiscounts: boolean;
  canEditCatalog: boolean;
  canManageUsers: boolean;
  canViewFinancialReports: boolean;
  canTransferTables: boolean;
}

export interface Waiter {
  id: number;
  name: string;
  pin: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  permissions?: UserPermissions;
}

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

export interface Product {
  id: string;
  name: string;
  categoryId: number;
  subcategoryId?: number;
  price: number; // PVP con IVA
  buyPrice: number;
  iva: number; // ej: 10 o 21
  stock: number;
  minStock: number;
  image: string;
  isKitchen: boolean;
  kitchenBlock: number; // 1: Primeros/Bebidas, 2: Segundos, 3: Postres
  description?: string;
  allergens?: string[];
  available: boolean;
  options?: ProductOption[];
  isCombination?: boolean;
  combinationGroup?: string;
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
  kitchenStatus: KitchenItemStatus;
  selectedOption?: string;
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
  preticketPrinted?: boolean;
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
