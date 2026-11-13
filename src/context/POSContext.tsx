import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Waiter, Warehouse, POSTerminal, Salon, Table, Category, Product, Rate,
  Sale, SaleLine, Language, CashRegisterReport, TranslationStrings, ActiveView, ThemeMode,
  CashMovement, CashShift, DeviceStationMode, UserPermissions, DeviceType,
  SystemModulesConfig, TicketPrintSettings, TicketTemplateConfig, PrintArea,
  ModifierGroup, CustomRole, CustomerClient, OrderChannel, DeliveryWorkflowStatus
} from '../types';
import {
  INITIAL_WAITERS, INITIAL_WAREHOUSES, INITIAL_TERMINALS, INITIAL_SALONS,
  INITIAL_TABLES, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_RATES,
  INITIAL_SALES, TRANSLATIONS, DEFAULT_ADMIN_PERMISSIONS, DEFAULT_CASHIER_PERMISSIONS,
  DEFAULT_WAITER_PERMISSIONS, DEFAULT_KITCHEN_PERMISSIONS
} from '../data/mockData';
import {
  DEFAULT_SYSTEM_MODULES, DEFAULT_TICKET_SETTINGS, DEFAULT_PRINT_AREAS,
  DEFAULT_MODIFIER_GROUPS, DEFAULT_CUSTOM_ROLES, INITIAL_CLIENTS,
  mapCustomRoleToUserPermissions
} from '../data/defaultConfigs';
import { isViewAllowedForUser, getDefaultViewForUser } from '../utils/permissions';
import {
  normalizeCurrencySymbol,
  roundCLP,
  calculateNetAndIva,
  CHILE_IVA_PERCENT,
  formatDateCL,
  formatTimeCL,
} from '../utils/currency';
import { calculateShiftCashSummary } from '../utils/cashShift';

const CATALOG_SEED_VERSION = '2026-11-mistura-clp-v2';
let hasCheckedSeedMigration = false;

/**
 * Sincroniza catalogos semilla y migra cachés legadas en EUR a Pesos Chilenos (CLP) enteros
 * cuando cambia la version de semilla, preservando operaciones en curso del usuario.
 */
const ensureCLPSeedMigration = () => {
  if (hasCheckedSeedMigration || typeof window === 'undefined') return;
  hasCheckedSeedMigration = true;
  try {
    const currentVer = localStorage.getItem('sysme_catalog_seed_version');
    if (currentVer !== CATALOG_SEED_VERSION) {
      localStorage.setItem('sysme_categories', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem('sysme_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('sysme_print_areas', JSON.stringify(DEFAULT_PRINT_AREAS));
      localStorage.setItem('sysme_tables', JSON.stringify(INITIAL_TABLES));
      localStorage.setItem('sysme_sales', JSON.stringify(INITIAL_SALES));

      const savedTerm = localStorage.getItem('sysme_terminal');
      if (savedTerm) {
        try {
          const parsedTerm = JSON.parse(savedTerm);
          if (parsedTerm && parsedTerm.initialCash === 250) {
            parsedTerm.initialCash = 50000;
            localStorage.setItem('sysme_terminal', JSON.stringify(parsedTerm));
          }
        } catch {}
      }

      const savedShift = localStorage.getItem('sysme_current_shift');
      if (savedShift) {
        try {
          const parsedShift = JSON.parse(savedShift);
          if (parsedShift && parsedShift.initialCash === 250) {
            parsedShift.initialCash = 50000;
            if (Array.isArray(parsedShift.movements)) {
              parsedShift.movements = parsedShift.movements.map((m: CashMovement) =>
                m.id === 'MOV-01' && m.amount === 50 ? { ...m, amount: 20000 } : m
              );
            }
            localStorage.setItem('sysme_current_shift', JSON.stringify(parsedShift));
          }
        } catch {}
      }

      localStorage.setItem('sysme_catalog_seed_version', CATALOG_SEED_VERSION);
    }
  } catch {}
};

/**
 * Detects current device classification (mobile / tablet / desktop)
 * based on viewport dimensions, touch capabilities, user agent and URL station parameter.
 */
export const detectCurrentDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop';

  // 1. Explicit station override in URL parameter
  try {
    const params = new URLSearchParams(window.location.search);
    const station = params.get('station') || params.get('mode');
    if (station === 'waiter-mobile' || station === 'waiter' || station === 'garzon') {
      return 'mobile';
    }
  } catch {}

  // 2. User agent detection
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);

  // 3. Viewport width & touch capabilities
  const width = window.innerWidth;
  const hasTouch = (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;

  if (isMobileUA || (hasTouch && width <= 768) || width <= 640) {
    return 'mobile';
  }
  if (isTabletUA || (width > 640 && width <= 1024 && hasTouch)) {
    return 'tablet';
  }
  return 'desktop';
};

export interface RestaurantSettings {
  name: string;
  tagline: string;
  cif: string;
  address: string;
  phone: string;
  city: string;
  currency: string;
  tipPercentage: number;
  ticketFooter: string;
}

interface POSContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStrings;

  // Active Session & Users
  waiter: Waiter;
  setWaiter: (waiter: Waiter) => void;
  waiters: Waiter[];
  setWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
  addWaiter: (user: Omit<Waiter, 'id'>) => Waiter;
  updateWaiter: (id: number, updates: Partial<Waiter>) => void;
  deleteWaiter: (id: number) => void;
  warehouse: Warehouse;
  setWarehouse: (wh: Warehouse) => void;
  terminal: POSTerminal;
  setTerminal: (term: POSTerminal) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  login: (pin: string) => boolean;
  loginUser: (user: Waiter, pin: string) => boolean;
  quickLogin: (user: Waiter) => void;
  logout: () => void;

  // Device & Station Intelligence
  deviceType: DeviceType;
  isMobileDevice: boolean;
  isMobileWaiter: boolean;
  stationMode: DeviceStationMode;
  setStationMode: (mode: DeviceStationMode) => void;

  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Floor & Tables
  salons: Salon[];
  selectedSalonId: number;
  setSelectedSalonId: (id: number) => void;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  openTable: (table: Table) => void;

  // Catalog
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: number, updates: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  rates: Rate[];
  selectedRateId: string;
  setSelectedRateId: (id: string) => void;

  // Orders / Sales
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  activeSale: Sale | null;
  setActiveSale: (sale: Sale | null) => void;
  createSale: (tableId?: number, dinersCount?: number) => Sale;
  createChannelSale: (params: {
    orderType: OrderChannel;
    customerId?: string;
    customerName?: string;
    deliveryAddress?: string;
    deliveryPhone?: string;
    driverId?: number;
    driverName?: string;
    deliveryFee?: number;
    notes?: string;
    items?: { product: Product; quantity: number }[];
    openInPos?: boolean;
  }) => Sale;
  updateDeliveryStatus: (saleId: number, status: DeliveryWorkflowStatus) => void;
  assignDriverToSale: (saleId: number, driverId?: number, driverName?: string) => void;
  assignClientToActiveSale: (client: CustomerClient | null) => void;
  addItemToActiveSale: (product: Product, quantity?: number, optionName?: string, notes?: string, customBlock?: number, extraPrice?: number) => void;
  submitCustomerOrder: (
    tableNumber: string,
    items: { product: Product; quantity: number; selectedOptions: string[]; notes: string; unitPrice: number }[]
  ) => Sale;
  updateSaleLine: (lineId: string, updates: Partial<SaleLine>) => void;
  removeSaleLine: (lineId: string) => void;
  sendActiveSaleToKitchen: () => void;
  transferTable: (targetTableId: number) => void;
  parkSale: () => void;
  cancelActiveSale: () => void;
  finalizeSale: (paymentMethod: 'cash' | 'card' | 'crypto' | 'other', details: { cashGiven?: number; change?: number }) => Sale;
  
  // Kitchen KDS
  markKitchenItemServed: (saleId: number, lineId: string) => void;
  markAllKitchenItemsServed: (saleId: number) => void;

  // Cash Shifts & Arqueo
  currentShift: CashShift | null;
  shiftHistory: CashShift[];
  setShiftHistory: React.Dispatch<React.SetStateAction<CashShift[]>>;
  openCashShift: (initialCash: number, notes?: string) => CashShift;
  addCashMovement: (movement: Omit<CashMovement, 'id' | 'date' | 'time' | 'userName'>) => CashMovement;
  closeCashShift: (countedCash: number, notes?: string) => { report: CashRegisterReport; shift: CashShift };
  reports: CashRegisterReport[];
  generateZReport: (countedCash: number, notes?: string) => CashRegisterReport;

  // Modals for Cash Register
  isCashShiftModalOpen: boolean;
  setIsCashShiftModalOpen: (open: boolean) => void;
  cashModalMode: 'open' | 'close' | 'movement';
  setCashModalMode: (mode: 'open' | 'close' | 'movement') => void;

  // Theme & Branding
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  restaurantBrand: RestaurantSettings;
  updateRestaurantBrand: (brand: Partial<RestaurantSettings>) => void;
  currency: string;

  // System Configuration & Advanced Modules
  systemModules: SystemModulesConfig;
  updateSystemModules: (updates: Partial<SystemModulesConfig>) => void;
  ticketSettings: TicketPrintSettings;
  updateTicketSettings: (type: 'precuenta' | 'comanda', updates: Partial<TicketTemplateConfig>) => void;
  resetTicketSettings: (type: 'precuenta' | 'comanda') => void;
  printAreas: PrintArea[];
  addPrintArea: (area: Omit<PrintArea, 'id'>) => PrintArea;
  updatePrintArea: (id: string, updates: Partial<PrintArea>) => void;
  deletePrintArea: (id: string) => void;
  modifierGroups: ModifierGroup[];
  addModifierGroup: (group: Omit<ModifierGroup, 'id'>) => ModifierGroup;
  updateModifierGroup: (id: string, updates: Partial<ModifierGroup>) => void;
  deleteModifierGroup: (id: string) => void;
  customRoles: CustomRole[];
  addCustomRole: (role: Omit<CustomRole, 'id'>) => CustomRole;
  updateCustomRole: (id: string, updates: Partial<CustomRole>) => void;
  deleteCustomRole: (id: string) => void;
  clients: CustomerClient[];
  addClient: (client: Omit<CustomerClient, 'id' | 'createdAt' | 'ordersCount' | 'totalSpent'>) => CustomerClient;
  updateClient: (id: string, updates: Partial<CustomerClient>) => void;
  deleteClient: (id: string) => void;

  // Modals & Printing
  printableTicket: Sale | null;
  setPrintableTicket: (sale: Sale | null) => void;
  printPreTicket: (sale: Sale) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  ensureCLPSeedMigration();

  // 1. Language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sysme_lang');
    return (saved as Language) || 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sysme_lang', lang);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.es;

  // 2. Users / Waiters
  const [waiters, setWaiters] = useState<Waiter[]>(() => {
    const saved = localStorage.getItem('sysme_waiters');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_WAITERS;
  });

  const [waiter, setWaiter] = useState<Waiter>(() => {
    const saved = localStorage.getItem('sysme_waiter');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return waiters[0] || INITIAL_WAITERS[0];
  });

  const [warehouse, setWarehouse] = useState<Warehouse>(() => {
    const saved = localStorage.getItem('sysme_warehouse');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_WAREHOUSES[0];
  });

  const [terminal, setTerminal] = useState<POSTerminal>(() => {
    const saved = localStorage.getItem('sysme_terminal');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TERMINALS[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const active = sessionStorage.getItem('sysme_session_active');
    return active === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [stationMode, setStationModeState] = useState<DeviceStationMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const station = params.get('station') || params.get('mode');
        if (station === 'waiter-mobile' || station === 'waiter' || station === 'garzon') {
          return 'waiter-mobile';
        }
        if (station === 'kitchen-kds' || station === 'kitchen' || station === 'cocina') {
          return 'kitchen-kds';
        }
      } catch {}
    }
    const saved = localStorage.getItem('sysme_station_mode');
    return (saved as DeviceStationMode) || 'master-pc';
  });

  const setStationMode = (mode: DeviceStationMode) => {
    setStationModeState(mode);
    localStorage.setItem('sysme_station_mode', mode);
  };

  // Device Type Detection (mobile, tablet, desktop)
  const [deviceType, setDeviceType] = useState<DeviceType>(() => detectCurrentDeviceType());
  const isMobileDevice = deviceType === 'mobile';
  const isMobileWaiter = waiter?.role === 'waiter' && (isMobileDevice || stationMode === 'waiter-mobile');

  // Resize listener to dynamically detect device changes / orientation
  useEffect(() => {
    const handleDeviceResize = () => {
      const detected = detectCurrentDeviceType();
      setDeviceType(detected);
    };

    window.addEventListener('resize', handleDeviceResize);
    window.addEventListener('orientationchange', handleDeviceResize);
    return () => {
      window.removeEventListener('resize', handleDeviceResize);
      window.removeEventListener('orientationchange', handleDeviceResize);
    };
  }, []);

  // Theme & Branding
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('sysme_theme_mode');
    return (saved as ThemeMode) || 'vibrant-light';
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('sysme_theme_mode', mode);
  };

  const [restaurantBrand, setRestaurantBrand] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem('sysme_restaurant_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.currency = normalizeCurrencySymbol(parsed.currency);
        return parsed;
      } catch {}
    }
    return {
      name: 'Dy Pos Gastrobar',
      tagline: 'Sistema TPV Gastronómico & Control Total',
      cif: '76.841.259-K',
      address: 'Avenida Providencia 1208, Santiago',
      phone: '+56 9 8765 4321',
      city: 'Santiago (Chile)',
      currency: '$',
      tipPercentage: 10,
      ticketFooter: '¡Gracias por su visita! Dy Pos TPV Suite.',
    };
  });

  const updateRestaurantBrand = (updates: Partial<RestaurantSettings>) => {
    setRestaurantBrand(prev => {
      const updated = { ...prev, ...updates };
      updated.currency = normalizeCurrencySymbol(updated.currency);
      localStorage.setItem('sysme_restaurant_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const currency = normalizeCurrencySymbol(restaurantBrand.currency);

  // Station sync from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const station = params.get('station') || params.get('mode');
      if (station === 'waiter-mobile' || station === 'waiter' || station === 'garzon') {
        setStationModeState('waiter-mobile');
        localStorage.setItem('sysme_station_mode', 'waiter-mobile');
        setIsLoggedIn(true);
        sessionStorage.setItem('sysme_session_active', 'true');
        const waiterUser = waiters.find(w => w.role === 'waiter') || waiters[0];
        if (waiterUser) {
          setWaiter(waiterUser);
          localStorage.setItem('sysme_waiter', JSON.stringify(waiterUser));
        }
        setActiveViewState('floor');
      } else if (station === 'kitchen-kds' || station === 'kitchen' || station === 'cocina') {
        setStationModeState('kitchen-kds');
        localStorage.setItem('sysme_station_mode', 'kitchen-kds');
        setIsLoggedIn(true);
        sessionStorage.setItem('sysme_session_active', 'true');
        const kitchenUser = waiters.find(w => w.role === 'kitchen') || waiters[0];
        if (kitchenUser) {
          setWaiter(kitchenUser);
          localStorage.setItem('sysme_waiter', JSON.stringify(kitchenUser));
        }
        setActiveViewState('kitchen');
      } else if (station === 'menu') {
        setActiveViewState('menu');
      }
    } catch {}
  }, [waiters]);

  // System Modules, Tickets, Print Areas, Modifiers, Custom Roles, Clients
  const [systemModules, setSystemModules] = useState<SystemModulesConfig>(() => {
    const saved = localStorage.getItem('sysme_system_modules');
    if (saved) {
      try { return { ...DEFAULT_SYSTEM_MODULES, ...JSON.parse(saved) }; } catch {}
    }
    return DEFAULT_SYSTEM_MODULES;
  });

  const updateSystemModules = (updates: Partial<SystemModulesConfig>) => {
    setSystemModules(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('sysme_system_modules', JSON.stringify(next));
      return next;
    });
  };

  const [ticketSettings, setTicketSettings] = useState<TicketPrintSettings>(() => {
    const saved = localStorage.getItem('sysme_ticket_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          precuenta: { ...DEFAULT_TICKET_SETTINGS.precuenta, ...(parsed.precuenta || {}) },
          comanda: { ...DEFAULT_TICKET_SETTINGS.comanda, ...(parsed.comanda || {}) },
        };
      } catch {}
    }
    return DEFAULT_TICKET_SETTINGS;
  });

  const updateTicketSettings = (type: 'precuenta' | 'comanda', updates: Partial<TicketTemplateConfig>) => {
    setTicketSettings(prev => {
      const next: TicketPrintSettings = {
        ...prev,
        [type]: { ...prev[type], ...updates },
      };
      localStorage.setItem('sysme_ticket_settings', JSON.stringify(next));
      return next;
    });
  };

  const resetTicketSettings = (type: 'precuenta' | 'comanda') => {
    setTicketSettings(prev => {
      const next: TicketPrintSettings = {
        ...prev,
        [type]: { ...DEFAULT_TICKET_SETTINGS[type] },
      };
      localStorage.setItem('sysme_ticket_settings', JSON.stringify(next));
      return next;
    });
  };

  const [printAreas, setPrintAreas] = useState<PrintArea[]>(() => {
    const saved = localStorage.getItem('sysme_print_areas');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_PRINT_AREAS;
  });

  const addPrintArea = (areaData: Omit<PrintArea, 'id'>): PrintArea => {
    const newArea: PrintArea = {
      id: `area-${Date.now().toString(36)}`,
      ...areaData,
    };
    setPrintAreas(prev => {
      const next = [...prev, newArea];
      localStorage.setItem('sysme_print_areas', JSON.stringify(next));
      return next;
    });
    return newArea;
  };

  const updatePrintArea = (id: string, updates: Partial<PrintArea>) => {
    setPrintAreas(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      localStorage.setItem('sysme_print_areas', JSON.stringify(next));
      return next;
    });
  };

  const deletePrintArea = (id: string) => {
    setPrintAreas(prev => {
      const next = prev.filter(a => a.id !== id);
      localStorage.setItem('sysme_print_areas', JSON.stringify(next));
      return next;
    });
  };

  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(() => {
    const saved = localStorage.getItem('sysme_modifier_groups');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_MODIFIER_GROUPS;
  });

  const addModifierGroup = (groupData: Omit<ModifierGroup, 'id'>): ModifierGroup => {
    const newGroup: ModifierGroup = {
      id: `mod-${Date.now().toString(36)}`,
      ...groupData,
    };
    setModifierGroups(prev => {
      const next = [...prev, newGroup];
      localStorage.setItem('sysme_modifier_groups', JSON.stringify(next));
      return next;
    });
    return newGroup;
  };

  const updateModifierGroup = (id: string, updates: Partial<ModifierGroup>) => {
    setModifierGroups(prev => {
      const next = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      localStorage.setItem('sysme_modifier_groups', JSON.stringify(next));
      return next;
    });
  };

  const deleteModifierGroup = (id: string) => {
    setModifierGroups(prev => {
      const next = prev.filter(g => g.id !== id);
      localStorage.setItem('sysme_modifier_groups', JSON.stringify(next));
      return next;
    });
  };

  const [customRoles, setCustomRoles] = useState<CustomRole[]>(() => {
    const saved = localStorage.getItem('sysme_custom_roles');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_CUSTOM_ROLES;
  });

  const addCustomRole = (roleData: Omit<CustomRole, 'id'>): CustomRole => {
    const newRole: CustomRole = {
      id: `role-${Date.now().toString(36)}`,
      ...roleData,
    };
    setCustomRoles(prev => {
      const next = [...prev, newRole];
      localStorage.setItem('sysme_custom_roles', JSON.stringify(next));
      return next;
    });
    return newRole;
  };

  const updateCustomRole = (id: string, updates: Partial<CustomRole>) => {
    setCustomRoles(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      localStorage.setItem('sysme_custom_roles', JSON.stringify(next));
      const updatedRole = next.find(r => r.id === id);
      if (updatedRole) {
        const mappedPerms = mapCustomRoleToUserPermissions(updatedRole);
        setWaiters(wPrev => wPrev.map(w => w.customRoleId === id ? { ...w, role: updatedRole.baseRole, permissions: mappedPerms } : w));
      }
      return next;
    });
  };

  const deleteCustomRole = (id: string) => {
    setCustomRoles(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem('sysme_custom_roles', JSON.stringify(next));
      return next;
    });
  };

  const [clients, setClients] = useState<CustomerClient[]>(() => {
    const saved = localStorage.getItem('sysme_clients');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CLIENTS;
  });

  const addClient = (clientData: Omit<CustomerClient, 'id' | 'createdAt' | 'ordersCount' | 'totalSpent'>): CustomerClient => {
    const newClient: CustomerClient = {
      id: `cli-${Date.now().toString(36)}`,
      ordersCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      ...clientData,
    };
    setClients(prev => {
      const next = [newClient, ...prev];
      localStorage.setItem('sysme_clients', JSON.stringify(next));
      return next;
    });
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<CustomerClient>) => {
    setClients(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      localStorage.setItem('sysme_clients', JSON.stringify(next));
      return next;
    });
  };

  const deleteClient = (id: string) => {
    setClients(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem('sysme_clients', JSON.stringify(next));
      return next;
    });
  };

  // 3. Views
  const [activeView, setActiveViewState] = useState<ActiveView>(() => {
    const savedView = localStorage.getItem('sysme_active_view');
    if (savedView) return savedView as ActiveView;
    const savedSale = localStorage.getItem('sysme_active_sale');
    if (savedSale) return 'pos';
    return 'floor';
  });

  const setActiveView = (view: ActiveView) => {
    const currentDevice = detectCurrentDeviceType();
    const isMobile = currentDevice === 'mobile';

    // Validate if the requested view is permitted for this user & device & enabled modules
    if (!isViewAllowedForUser(view, waiter, stationMode, isMobile, systemModules)) {
      console.warn(
        `[Security Alert] Access Denied: View '${view}' is restricted for user '${waiter.name}' (role: ${waiter.role}) on device '${currentDevice}'.`
      );
      const fallback = getDefaultViewForUser(waiter);
      setActiveViewState(fallback);
      try {
        localStorage.setItem('sysme_active_view', fallback);
      } catch {}
      return;
    }

    setActiveViewState(view);
    try {
      localStorage.setItem('sysme_active_view', view);
    } catch {}
  };

  // 4. Salons & Tables
  const [salons] = useState<Salon[]>(INITIAL_SALONS);
  const [selectedSalonId, setSelectedSalonId] = useState<number>(1);
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('sysme_tables');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t: Table) =>
            (t.currentSaleId === 1004 && t.total === 27.5) || (t.currentSaleId === 1005 && t.total === 6.8)
              ? { ...t, status: 'free' as const, currentSaleId: null, ticketNumber: undefined, diners: undefined, openedAt: undefined, total: 0 }
              : t
          );
        }
      } catch {}
    }
    return INITIAL_TABLES;
  });

  // 5. Products & Categories & Rates
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('sysme_categories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sysme_products');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [rates] = useState<Rate[]>(INITIAL_RATES);
  const [selectedRateId, setSelectedRateId] = useState<string>('standard');

  // 6. Sales & Orders
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sysme_sales');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_SALES;
  });

  const [activeSale, setActiveSale] = useState<Sale | null>(() => {
    const saved = localStorage.getItem('sysme_active_sale');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.status === 'open') {
          return parsed;
        }
      } catch {}
    }
    return null;
  });

  // 7. Cash Shifts & Cash Management
  const [currentShift, setCurrentShift] = useState<CashShift | null>(() => {
    const saved = localStorage.getItem('sysme_current_shift');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // Default open shift for convenience (CLP)
    const now = new Date();
    return {
      id: `SHIFT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-001`,
      terminalId: 1,
      terminalName: 'TPV 1 - Barra Principal',
      openedBy: 'ALLISSON (Cajera)',
      openedAtDate: formatDateCL(now),
      openedAtTime: '08:30:00',
      openedAtIso: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString(),
      initialCash: 50000,
      status: 'open',
      movements: [
        {
          id: 'MOV-01',
          type: 'in',
          amount: 20000,
          concept: 'Sencillo y monedas de cambio para caja',
          category: 'change',
          userName: 'PIERRE (Admin/Gerente)',
          date: formatDateCL(now),
          time: '09:15:00',
        }
      ],
    };
  });

  const [shiftHistory, setShiftHistory] = useState<CashShift[]>(() => {
    const saved = localStorage.getItem('sysme_shift_history');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [reports, setReports] = useState<CashRegisterReport[]>(() => {
    const saved = localStorage.getItem('sysme_reports');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  // Modal controls for cash
  const [isCashShiftModalOpen, setIsCashShiftModalOpen] = useState<boolean>(false);
  const [cashModalMode, setCashModalMode] = useState<'open' | 'close' | 'movement'>('open');

  // Printing & Payment Modal
  const [printableTicket, setPrintableTicket] = useState<Sale | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Sync state reference to always have latest snapshot available for periodic sync & unload flush
  const stateRef = useRef({
    waiters,
    waiter,
    warehouse,
    terminal,
    tables,
    categories,
    products,
    sales,
    activeSale,
    currentShift,
    shiftHistory,
    reports,
    restaurantBrand,
    activeView,
    themeMode,
    stationMode,
  });

  useEffect(() => {
    stateRef.current = {
      waiters,
      waiter,
      warehouse,
      terminal,
      tables,
      categories,
      products,
      sales,
      activeSale,
      currentShift,
      shiftHistory,
      reports,
      restaurantBrand,
      activeView,
      themeMode,
      stationMode,
    };
  }, [
    waiters,
    waiter,
    warehouse,
    terminal,
    tables,
    categories,
    products,
    sales,
    activeSale,
    currentShift,
    shiftHistory,
    reports,
    restaurantBrand,
    activeView,
    themeMode,
    stationMode,
  ]);

  // Periodic LocalStorage Sync Handler
  const syncStateToLocalStorage = useCallback(() => {
    try {
      const snap = stateRef.current;
      localStorage.setItem('sysme_sales', JSON.stringify(snap.sales));
      localStorage.setItem('sysme_tables', JSON.stringify(snap.tables));
      localStorage.setItem('sysme_products', JSON.stringify(snap.products));
      localStorage.setItem('sysme_categories', JSON.stringify(snap.categories));
      localStorage.setItem('sysme_waiters', JSON.stringify(snap.waiters));
      localStorage.setItem('sysme_waiter', JSON.stringify(snap.waiter));
      localStorage.setItem('sysme_warehouse', JSON.stringify(snap.warehouse));
      localStorage.setItem('sysme_terminal', JSON.stringify(snap.terminal));
      localStorage.setItem('sysme_current_shift', JSON.stringify(snap.currentShift));
      localStorage.setItem('sysme_shift_history', JSON.stringify(snap.shiftHistory));
      localStorage.setItem('sysme_reports', JSON.stringify(snap.reports));
      localStorage.setItem('sysme_restaurant_settings', JSON.stringify(snap.restaurantBrand));
      localStorage.setItem('sysme_theme_mode', snap.themeMode);
      localStorage.setItem('sysme_station_mode', snap.stationMode);
      localStorage.setItem('sysme_active_view', snap.activeView);
      if (snap.activeSale && snap.activeSale.status === 'open') {
        localStorage.setItem('sysme_active_sale', JSON.stringify(snap.activeSale));
      } else {
        localStorage.removeItem('sysme_active_sale');
      }
      localStorage.setItem('sysme_last_sync_timestamp', Date.now().toString());
    } catch (err) {
      console.warn('POSProvider: Error saving to localStorage', err);
    }
  }, []);

  // Periodic timer + lifecycle event listeners (pagehide, beforeunload, visibilitychange)
  useEffect(() => {
    // Immediate sync on mount
    syncStateToLocalStorage();

    // Periodic sync every 2.5 seconds to guarantee zero data loss
    const timer = setInterval(() => {
      syncStateToLocalStorage();
    }, 2500);

    const handleBeforeUnload = () => {
      syncStateToLocalStorage();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncStateToLocalStorage();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Final flush
      syncStateToLocalStorage();
    };
  }, [syncStateToLocalStorage]);

  // Reactive immediate sync on state mutations
  useEffect(() => {
    try {
      localStorage.setItem('sysme_waiters', JSON.stringify(waiters));
    } catch {}
  }, [waiters]);

  useEffect(() => {
    try {
      localStorage.setItem('sysme_tables', JSON.stringify(tables));
    } catch {}
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem('sysme_categories', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('sysme_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('sysme_sales', JSON.stringify(sales));
    } catch {}
  }, [sales]);

  useEffect(() => {
    try {
      if (activeSale && activeSale.status === 'open') {
        localStorage.setItem('sysme_active_sale', JSON.stringify(activeSale));
      } else {
        localStorage.removeItem('sysme_active_sale');
      }
    } catch {}
  }, [activeSale]);

  useEffect(() => {
    try {
      localStorage.setItem('sysme_current_shift', JSON.stringify(currentShift));
    } catch {}
  }, [currentShift]);

  useEffect(() => {
    try {
      localStorage.setItem('sysme_shift_history', JSON.stringify(shiftHistory));
    } catch {}
  }, [shiftHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('sysme_reports', JSON.stringify(reports));
    } catch {}
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem('sysme_waiter', JSON.stringify(waiter));
    } catch {}
  }, [waiter]);

  // Centralized security & navigation restriction handler upon login or role/device switch
  const enforceUserSecurityAndRestrictions = useCallback((userToLogin: Waiter) => {
    const detectedDevice = detectCurrentDeviceType();
    const isMobile = detectedDevice === 'mobile';

    if (userToLogin.role === 'waiter') {
      if (isMobile || stationMode === 'waiter-mobile') {
        setStationModeState('waiter-mobile');
        localStorage.setItem('sysme_station_mode', 'waiter-mobile');
      }

      setActiveViewState(currentView => {
        if (!isViewAllowedForUser(currentView, userToLogin, isMobile ? 'waiter-mobile' : stationMode, isMobile, systemModules)) {
          const safeView = getDefaultViewForUser(userToLogin);
          localStorage.setItem('sysme_active_view', safeView);
          return safeView;
        }
        return currentView;
      });
    } else if (userToLogin.role === 'kitchen') {
      if (stationMode !== 'kitchen-kds') {
        setStationModeState('kitchen-kds');
        localStorage.setItem('sysme_station_mode', 'kitchen-kds');
      }
      setActiveViewState('kitchen');
      localStorage.setItem('sysme_active_view', 'kitchen');
    } else {
      setActiveViewState(currentView => {
        if (!isViewAllowedForUser(currentView, userToLogin, stationMode, isMobile, systemModules)) {
          const safeView = getDefaultViewForUser(userToLogin);
          localStorage.setItem('sysme_active_view', safeView);
          return safeView;
        }
        return currentView;
      });
    }
  }, [stationMode, systemModules]);

  const stampUserLogin = (user: Waiter): Waiter => {
    const now = new Date();
    const stamp = `${now.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${formatTimeCL(now)}`;
    const updated = { ...user, lastLoginAt: stamp };
    setWaiters(prev => prev.map(w => w.id === user.id ? updated : w));
    return updated;
  };

  // Login / Logout
  const login = (pin: string): boolean => {
    const matched = waiters.find(w => w.pin === pin && w.active !== false);
    if (matched) {
      const stamped = stampUserLogin(matched);
      setWaiter(stamped);
      setIsLoggedIn(true);
      sessionStorage.setItem('sysme_session_active', 'true');
      setIsLoginModalOpen(false);
      setActiveSale(prev => prev ? { ...prev, currentWaiterId: stamped.id, currentWaiterName: stamped.name } : null);
      enforceUserSecurityAndRestrictions(stamped);
      return true;
    }
    return false;
  };

  const loginUser = (selectedUser: Waiter, pin: string): boolean => {
    if (selectedUser.active === false) return false;
    if (selectedUser.pin === pin) {
      const stamped = stampUserLogin(selectedUser);
      setWaiter(stamped);
      setIsLoggedIn(true);
      sessionStorage.setItem('sysme_session_active', 'true');
      setIsLoginModalOpen(false);
      setActiveSale(prev => prev ? { ...prev, currentWaiterId: stamped.id, currentWaiterName: stamped.name } : null);
      enforceUserSecurityAndRestrictions(stamped);
      return true;
    }
    return false;
  };

  const quickLogin = (selectedUser: Waiter) => {
    if (selectedUser.active === false) return;
    const stamped = stampUserLogin(selectedUser);
    setWaiter(stamped);
    setIsLoggedIn(true);
    sessionStorage.setItem('sysme_session_active', 'true');
    setIsLoginModalOpen(false);
    setActiveSale(prev => prev ? { ...prev, currentWaiterId: stamped.id, currentWaiterName: stamped.name } : null);
    enforceUserSecurityAndRestrictions(stamped);
  };

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('sysme_session_active');
    setIsLoginModalOpen(false);
  };

  // Active session security verification: ensure mobile waiters can never access admin screens
  useEffect(() => {
    if (isLoggedIn && waiter) {
      const isMobile = deviceType === 'mobile';
      if (waiter.role === 'waiter' && isMobile && stationMode !== 'waiter-mobile') {
        setStationModeState('waiter-mobile');
        localStorage.setItem('sysme_station_mode', 'waiter-mobile');
      }

      if (!isViewAllowedForUser(activeView, waiter, stationMode, isMobile, systemModules)) {
        const safeView = getDefaultViewForUser(waiter);
        setActiveViewState(safeView);
        try {
          localStorage.setItem('sysme_active_view', safeView);
        } catch {}
      }
    }
  }, [isLoggedIn, waiter, deviceType, stationMode, activeView, systemModules]);

  // User Management
  const addWaiter = (newUserData: Omit<Waiter, 'id'>): Waiter => {
    const newId = Math.max(0, ...waiters.map(w => w.id)) + 1;
    const defaultPerms = newUserData.role === 'admin'
      ? DEFAULT_ADMIN_PERMISSIONS
      : newUserData.role === 'cashier'
      ? DEFAULT_CASHIER_PERMISSIONS
      : newUserData.role === 'kitchen'
      ? DEFAULT_KITCHEN_PERMISSIONS
      : DEFAULT_WAITER_PERMISSIONS;

    const newUser: Waiter = {
      id: newId,
      ...newUserData,
      permissions: newUserData.permissions || defaultPerms,
    };
    setWaiters(prev => [...prev, newUser]);
    return newUser;
  };

  const updateWaiter = (id: number, updates: Partial<Waiter>) => {
    setWaiters(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    if (waiter.id === id) {
      setWaiter(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteWaiter = (id: number) => {
    setWaiters(prev => prev.filter(w => w.id !== id));
  };

  // Category Management
  const addCategory = (catData: Omit<Category, 'id'>): Category => {
    const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
    const newCat: Category = {
      id: newId,
      ...catData,
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: number, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Product Management
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newId = `PROD-${Date.now().toString(36).toUpperCase()}`;
    const newProd: Product = {
      id: newId,
      ...prodData,
    };
    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Cash Shifts: Open, Movements, Close
  const openCashShift = (initialCash: number, notes?: string): CashShift => {
    const now = new Date();
    const newShift: CashShift = {
      id: `SHIFT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(shiftHistory.length + 1).padStart(3, '0')}`,
      terminalId: terminal.id,
      terminalName: terminal.name,
      openedBy: waiter.name,
      openedAtDate: formatDateCL(now),
      openedAtTime: formatTimeCL(now, true),
      openedAtIso: now.toISOString(),
      initialCash: roundCLP(initialCash),
      status: 'open',
      movements: [],
      notes,
    };

    setCurrentShift(newShift);
    setTerminal(prev => ({ ...prev, isOpen: true, initialCash: roundCLP(initialCash) }));
    return newShift;
  };

  const addCashMovement = (movData: Omit<CashMovement, 'id' | 'date' | 'time' | 'userName'>): CashMovement => {
    const now = new Date();
    const newMov: CashMovement = {
      id: `MOV-${Date.now().toString(36).toUpperCase()}`,
      userName: waiter.name,
      date: formatDateCL(now),
      time: formatTimeCL(now, true),
      ...movData,
      amount: roundCLP(movData.amount),
    };

    setCurrentShift(prev => {
      if (!prev) return null;
      return {
        ...prev,
        movements: [newMov, ...prev.movements],
      };
    });

    return newMov;
  };

  const closeCashShift = (countedCash: number, notes?: string) => {
    const now = new Date();
    const {
      closedSales,
      cashSales,
      cardSales,
      cryptoSales,
      otherSales,
      totalSales,
      totalTax,
      initialCash: initial,
      expectedCashInDrawer: expectedCash,
    } = calculateShiftCashSummary({
      sales,
      currentShift,
      shiftHistory,
      fallbackInitialCash: terminal.initialCash,
    });

    const difference = roundCLP(roundCLP(countedCash) - expectedCash);

    const reportId = `Z-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(reports.length + 1).padStart(3, '0')}`;
    
    const newReport: CashRegisterReport = {
      id: reportId,
      date: formatDateCL(now),
      time: formatTimeCL(now, true),
      terminalId: terminal.id,
      terminalName: terminal.name,
      openedBy: currentShift?.openedBy || waiter.name,
      closedBy: waiter.name,
      initialCash: roundCLP(initial),
      cashSales: roundCLP(cashSales),
      cardSales: roundCLP(cardSales),
      cryptoSales: roundCLP(cryptoSales),
      otherSales: roundCLP(otherSales),
      totalSales: roundCLP(totalSales),
      totalTax: roundCLP(totalTax),
      cashCounted: roundCLP(countedCash),
      difference,
      salesCount: closedSales.length,
      notes: notes || 'Cierre de turno oficial Z',
    };

    setReports(prev => [newReport, ...prev]);

    const finishedShift: CashShift = {
      ...(currentShift || {
        id: `SHIFT-${Date.now()}`,
        terminalId: terminal.id,
        terminalName: terminal.name,
        openedBy: waiter.name,
        openedAtDate: formatDateCL(now),
        openedAtTime: '08:00:00',
        initialCash: roundCLP(initial),
        status: 'closed',
        movements: [],
      }),
      status: 'closed',
      closedBy: waiter.name,
      closedAtDate: formatDateCL(now),
      closedAtTime: formatTimeCL(now, true),
      cashCounted: roundCLP(countedCash),
      difference,
      reportId,
      notes,
    };

    setShiftHistory(prev => [finishedShift, ...prev]);
    setCurrentShift(null);
    setTerminal(prev => ({ ...prev, isOpen: false }));

    return { report: newReport, shift: finishedShift };
  };

  const generateZReport = (countedCash: number, notes?: string): CashRegisterReport => {
    return closeCashShift(countedCash, notes).report;
  };

  // Recalculate totals helper using Chilean CLP integer rounding and IVA breakdown
  const calculateSaleTotals = (items: SaleLine[]): { subtotal: number; taxTotal: number; total: number } => {
    let subtotal = 0;
    let taxTotal = 0;
    let total = 0;

    items.forEach(item => {
      const { net, iva, gross } = calculateNetAndIva(item.total, item.iva ?? CHILE_IVA_PERCENT);
      subtotal += net;
      taxTotal += iva;
      total += gross;
    });

    return {
      subtotal: roundCLP(subtotal),
      taxTotal: roundCLP(taxTotal),
      total: roundCLP(total),
    };
  };

  // Create or open a sale
  const createSale = (tableId?: number, dinersCount: number = 2): Sale => {
    const matchedTable = tables.find(t => t.id === tableId);
    const now = new Date();
    const dateStr = formatDateCL(now);
    const timeStr = formatTimeCL(now);
    const newId = Date.now();
    const newNumber = `T-${now.getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`;

    const currentRate = rates.find(r => r.id === selectedRateId) || rates[0];

    const newSaleObj: Sale = {
      id: newId,
      number: newNumber,
      date: dateStr,
      time: timeStr,
      tableNumber: matchedTable ? matchedTable.number : 'DIR',
      tableName: matchedTable ? matchedTable.name : 'Venta Directa',
      salonId: matchedTable ? matchedTable.salonId : 1,
      salonName: matchedTable ? salons.find(s => s.id === matchedTable.salonId)?.name || 'Barra' : 'Barra',
      diners: dinersCount,
      waiterId: waiter.id,
      waiterName: waiter.name,
      rateId: currentRate.id,
      rateName: currentRate.name,
      status: 'open',
      items: [],
      subtotal: 0,
      taxTotal: 0,
      total: 0,
      createdAt: now.toISOString(),
    };

    setSales(prev => [newSaleObj, ...prev]);
    setActiveSale(newSaleObj);

    if (matchedTable) {
      setTables(prev => prev.map(tbl => {
        if (tbl.id === matchedTable.id) {
          return {
            ...tbl,
            status: 'occupied',
            currentSaleId: newId,
            diners: dinersCount,
            openedAt: timeStr,
            waiterId: waiter.id,
            total: 0,
          };
        }
        return tbl;
      }));
    }

    setActiveView('pos');
    return newSaleObj;
  };

  const openTable = (table: Table) => {
    if (table.currentSaleId) {
      const existingSale = sales.find(s => s.id === table.currentSaleId && s.status === 'open');
      if (existingSale) {
        const updatedWithCurrentWaiter: Sale = {
          ...existingSale,
          currentWaiterId: waiter.id,
          currentWaiterName: waiter.name,
        };
        setActiveSale(updatedWithCurrentWaiter);
        setSales(allSales => allSales.map(s => s.id === updatedWithCurrentWaiter.id ? updatedWithCurrentWaiter : s));
        setSelectedRateId(existingSale.rateId);
        setActiveView('pos');
        return;
      }
    }
    createSale(table.id, table.seats || 2);
  };

  // Create channel sale (Delivery, Mostrador, Mostrador Express)
  const createChannelSale = (params: {
    orderType: OrderChannel;
    customerId?: string;
    customerName?: string;
    deliveryAddress?: string;
    deliveryPhone?: string;
    driverId?: number;
    driverName?: string;
    deliveryFee?: number;
    notes?: string;
    items?: { product: Product; quantity: number }[];
    openInPos?: boolean;
  }): Sale => {
    const now = new Date();
    const dateStr = formatDateCL(now);
    const timeStr = formatTimeCL(now);
    const newId = Date.now();
    const prefix = params.orderType === 'delivery' ? 'DLV' : params.orderType === 'express' ? 'EXP' : 'MOS';
    const newNumber = `${prefix}-${String(sales.length + 1).padStart(4, '0')}`;
    const currentRate = rates.find(r => r.id === selectedRateId) || rates[0];

    const initialItems: SaleLine[] = (params.items || []).map((entry, idx) => {
      const unitPrice = roundCLP(entry.product.price * currentRate.multiplier);
      return {
        id: `L-${newId}-${idx}`,
        lineId: idx + 1,
        productId: entry.product.id,
        productName: entry.product.name,
        quantity: entry.quantity,
        unitPrice,
        originalPrice: entry.product.price,
        iva: entry.product.iva ?? CHILE_IVA_PERCENT,
        discount: 0,
        total: roundCLP(unitPrice * entry.quantity),
        kitchenBlock: entry.product.kitchenBlock || 1,
        kitchenStatus: entry.product.isKitchen ? 'cooking' : 'ready',
        waiterId: waiter.id,
        waiterName: waiter.name,
        addedAtTime: timeStr,
      };
    });

    const totals = calculateSaleTotals(initialItems);
    const fee = roundCLP(params.deliveryFee || 0);
    const totalWithFee = roundCLP(totals.total + fee);

    const label =
      params.orderType === 'delivery'
        ? `Delivery • ${params.customerName || 'Sin cliente'}`
        : params.orderType === 'express'
        ? `Express • ${params.customerName || 'Retiro rápido'}`
        : `Mostrador • ${params.customerName || 'Mostrador'}`;

    const newSaleObj: Sale = {
      id: newId,
      number: newNumber,
      date: dateStr,
      time: timeStr,
      tableNumber: prefix,
      tableName: label,
      salonId: 0,
      salonName: params.orderType === 'delivery' ? 'Delivery' : 'Mostrador',
      diners: 1,
      waiterId: waiter.id,
      waiterName: waiter.name,
      rateId: currentRate.id,
      rateName: currentRate.name,
      status: 'open',
      orderType: params.orderType,
      deliveryStatus: 'preparing',
      customerId: params.customerId,
      customerName: params.customerName,
      deliveryAddress: params.deliveryAddress,
      deliveryPhone: params.deliveryPhone,
      driverId: params.driverId,
      driverName: params.driverName,
      deliveryFee: fee,
      notes: params.notes,
      items: initialItems,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totalWithFee,
      createdAt: now.toISOString(),
    };

    if (params.items && params.items.length > 0) {
      setProducts(prev => prev.map(p => {
        const used = params.items?.find(it => it.product.id === p.id);
        return used ? { ...p, stock: Math.max(0, p.stock - used.quantity) } : p;
      }));
    }

    setSales(prev => [newSaleObj, ...prev]);

    if (params.openInPos) {
      setActiveSale(newSaleObj);
      setActiveView('pos');
    }

    return newSaleObj;
  };

  const updateDeliveryStatus = (saleId: number, status: DeliveryWorkflowStatus) => {
    setSales(prev => prev.map(s => {
      if (s.id !== saleId) return s;
      const updatedItems = status === 'ready' || status === 'delivered'
        ? s.items.map(it => ({ ...it, kitchenStatus: 'served' as const }))
        : s.items;
      return { ...s, deliveryStatus: status, items: updatedItems };
    }));
  };

  const assignDriverToSale = (saleId: number, driverId?: number, driverName?: string) => {
    setSales(prev => prev.map(s => s.id === saleId ? { ...s, driverId, driverName } : s));
  };

  const assignClientToActiveSale = (client: CustomerClient | null) => {
    setActiveSale(prev => {
      if (!prev) return null;
      const updated: Sale = {
        ...prev,
        customerId: client?.id,
        customerName: client?.name,
        deliveryPhone: client?.phone || prev.deliveryPhone,
        deliveryAddress: client?.address || prev.deliveryAddress,
      };
      setSales(all => all.map(s => s.id === updated.id ? updated : s));
      return updated;
    });
  };

  // Add Item
  const addItemToActiveSale = (product: Product, quantity: number = 1, optionName?: string, notes?: string, customBlock?: number, extraPrice: number = 0) => {
    let ensuredSale: Sale | null = activeSale;
    if (!ensuredSale) {
      ensuredSale = createSale();
    }

    const now = new Date();
    const timeStr = formatTimeCL(now);
    const currentRate = rates.find(r => r.id === (ensuredSale?.rateId || selectedRateId)) || rates[0];
    const baseUnitPrice = roundCLP(product.price * currentRate.multiplier);
    const unitPrice = roundCLP(baseUnitPrice + extraPrice);
    const lineTotal = roundCLP(unitPrice * quantity);

    // Decrement stock
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      }
      return p;
    }));

    setActiveSale(prev => {
      const baseSale = prev || ensuredSale;
      if (!baseSale) return null;

      const existingIndex = baseSale.items.findIndex(i =>
        i.productId === product.id &&
        !i.kitchenNotes &&
        !notes &&
        !i.selectedOption &&
        !optionName &&
        !extraPrice &&
        i.kitchenStatus === 'pending' &&
        (i.waiterId === waiter.id || !i.waiterId)
      );

      let newItems: SaleLine[];
      if (existingIndex > -1) {
        newItems = [...baseSale.items];
        const exist = newItems[existingIndex];
        const newQty = exist.quantity + quantity;
        const newTotal = roundCLP(exist.unitPrice * newQty * (1 - exist.discount / 100));
        newItems[existingIndex] = {
          ...exist,
          quantity: newQty,
          total: newTotal,
          waiterId: waiter.id,
          waiterName: waiter.name,
          addedAtTime: timeStr,
        };
      } else {
        const newLine: SaleLine = {
          id: `L-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          lineId: baseSale.items.length + 1,
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          originalPrice: product.price,
          modifiersExtraPrice: extraPrice,
          iva: product.iva ?? CHILE_IVA_PERCENT,
          discount: 0,
          total: lineTotal,
          kitchenBlock: customBlock || product.kitchenBlock || 1,
          kitchenStatus: product.isKitchen ? 'pending' : 'ready',
          selectedOption: optionName,
          kitchenNotes: notes,
          waiterId: waiter.id,
          waiterName: waiter.name,
          addedAtTime: timeStr,
        };
        newItems = [...baseSale.items, newLine];
      }

      const totals = calculateSaleTotals(newItems);
      const fee = baseSale.deliveryFee || 0;
      const updatedSale: Sale = {
        ...baseSale,
        currentWaiterId: waiter.id,
        currentWaiterName: waiter.name,
        items: newItems,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: roundCLP(totals.total + fee),
      };

      setSales(allSales => allSales.map(s => s.id === updatedSale.id ? updatedSale : s));

      setTables(allTables => allTables.map(t => {
        if (t.currentSaleId === updatedSale.id) {
          return { ...t, total: updatedSale.total, currentWaiterName: waiter.name };
        }
        return t;
      }));

      return updatedSale;
    });
  };

  // Submit Customer QR Order directly to kitchen for a table without disrupting staff activeSale
  const submitCustomerOrder = (
    tableNumber: string,
    items: { product: Product; quantity: number; selectedOptions: string[]; notes: string; unitPrice: number }[]
  ): Sale => {
    const now = new Date();
    const nowIso = now.toISOString();
    const dateStr = formatDateCL(now);
    const timeStr = formatTimeCL(now);
    const targetTable = tables.find(t => t.number === tableNumber) || tables[0];
    const existingSale = sales.find(s => s.tableNumber === tableNumber && s.status === 'open');

    const newLines: SaleLine[] = items.map((it, idx) => {
      const unitPrice = roundCLP(it.unitPrice);
      const extraPrice = Math.max(0, roundCLP(unitPrice - it.product.price));
      return {
        id: `L-QR-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        lineId: (existingSale?.items.length || 0) + idx + 1,
        productId: it.product.id,
        productName: it.product.name,
        quantity: it.quantity,
        unitPrice,
        originalPrice: it.product.price,
        modifiersExtraPrice: extraPrice,
        iva: it.product.iva ?? CHILE_IVA_PERCENT,
        discount: 0,
        total: roundCLP(unitPrice * it.quantity),
        kitchenBlock: it.product.kitchenBlock || 1,
        kitchenStatus: it.product.isKitchen ? 'cooking' : 'ready',
        selectedOption: it.selectedOptions.length > 0 ? it.selectedOptions.join(', ') : undefined,
        kitchenNotes: it.notes || 'Pedido Carta QR',
        sentToKitchenAt: nowIso,
        waiterName: 'Carta QR',
        addedAtTime: timeStr,
      };
    });

    // Decrement stock
    setProducts(prev => prev.map(p => {
      const orderedQty = items.filter(it => it.product.id === p.id).reduce((s, it) => s + it.quantity, 0);
      return orderedQty > 0 ? { ...p, stock: Math.max(0, p.stock - orderedQty) } : p;
    }));

    let resultSale: Sale;
    if (existingSale) {
      const mergedItems = [...existingSale.items, ...newLines];
      const totals = calculateSaleTotals(mergedItems);
      resultSale = {
        ...existingSale,
        items: mergedItems,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
      };
      setSales(prev => prev.map(s => s.id === resultSale.id ? resultSale : s));
      if (activeSale && activeSale.id === resultSale.id) {
        setActiveSale(resultSale);
      }
    } else {
      const totals = calculateSaleTotals(newLines);
      const nextId = Math.max(1000, ...sales.map(s => s.id), 35000) + 1;
      resultSale = {
        id: nextId,
        number: nextId.toString(),
        ticketNumber: (nextId - 12000).toString(),
        date: dateStr,
        time: timeStr,
        tableNumber: targetTable ? targetTable.number : tableNumber,
        tableName: targetTable ? targetTable.name : `Mesa ${tableNumber}`,
        salonId: targetTable ? targetTable.salonId : 1,
        salonName: salons.find(s => s.id === (targetTable?.salonId || 1))?.name || 'Salón Principal',
        diners: 2,
        waiterId: waiter.id,
        waiterName: 'Carta QR',
        rateId: 'standard',
        rateName: 'Tarifa Estándar',
        status: 'open',
        orderType: 'salon',
        items: newLines,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        createdAt: nowIso,
      };
      setSales(prev => [resultSale, ...prev]);
    }

    setTables(prev => prev.map(t =>
      t.number === (targetTable?.number || tableNumber)
        ? {
            ...t,
            status: 'kitchen',
            currentSaleId: resultSale.id,
            ticketNumber: resultSale.ticketNumber,
            openedAt: t.openedAt || timeStr,
            diners: t.diners || 2,
            total: resultSale.total,
          }
        : t
    ));

    return resultSale;
  };

  // Update Line
  const updateSaleLine = (lineId: string, updates: Partial<SaleLine>) => {
    setActiveSale(prev => {
      if (!prev) return null;
      const newItems = prev.items.map(item => {
        if (item.id === lineId) {
          const updated = { ...item, ...updates };
          if (updates.modifiersExtraPrice !== undefined) {
            const basePrice = item.unitPrice - (item.modifiersExtraPrice || 0);
            updated.unitPrice = roundCLP(basePrice + updates.modifiersExtraPrice);
          }
          const disc = updated.discount || 0;
          updated.total = roundCLP(updated.unitPrice * updated.quantity * (1 - disc / 100));
          return updated;
        }
        return item;
      });

      const totals = calculateSaleTotals(newItems);
      const fee = prev.deliveryFee || 0;
      const updatedSale: Sale = {
        ...prev,
        currentWaiterId: waiter.id,
        currentWaiterName: waiter.name,
        items: newItems,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: roundCLP(totals.total + fee),
      };

      setSales(allSales => allSales.map(s => s.id === updatedSale.id ? updatedSale : s));
      setTables(allTables => allTables.map(t => {
        if (t.currentSaleId === updatedSale.id) {
          return { ...t, total: updatedSale.total };
        }
        return t;
      }));

      return updatedSale;
    });
  };

  // Remove Line
  const removeSaleLine = (lineId: string) => {
    setActiveSale(prev => {
      if (!prev) return null;
      const lineToRemove = prev.items.find(i => i.id === lineId);
      if (lineToRemove) {
        setProducts(allProducts => allProducts.map(p => {
          if (p.id === lineToRemove.productId) {
            return { ...p, stock: p.stock + lineToRemove.quantity };
          }
          return p;
        }));
      }

      const newItems = prev.items.filter(item => item.id !== lineId);
      const totals = calculateSaleTotals(newItems);
      const fee = prev.deliveryFee || 0;
      const updatedSale: Sale = {
        ...prev,
        currentWaiterId: waiter.id,
        currentWaiterName: waiter.name,
        items: newItems,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: roundCLP(totals.total + (newItems.length > 0 ? fee : 0)),
      };

      setSales(allSales => allSales.map(s => s.id === updatedSale.id ? updatedSale : s));
      setTables(allTables => allTables.map(t => {
        if (t.currentSaleId === updatedSale.id) {
          return { ...t, total: updatedSale.total };
        }
        return t;
      }));

      return updatedSale;
    });
  };

  // Send to Kitchen
  const sendActiveSaleToKitchen = () => {
    if (!activeSale) return;
    const nowIso = new Date().toISOString();
    const timeStr = formatTimeCL();
    
    setActiveSale(prev => {
      if (!prev) return null;
      const updatedItems = prev.items.map(item => {
        if (item.kitchenStatus === 'pending') {
          return {
            ...item,
            kitchenStatus: 'cooking' as const,
            sentToKitchenAt: nowIso,
            sentByWaiterId: waiter.id,
            sentByWaiterName: waiter.name,
            waiterName: item.waiterName || waiter.name,
            addedAtTime: item.addedAtTime || timeStr,
          };
        }
        return item;
      });

      const updatedSale: Sale = {
        ...prev,
        currentWaiterId: waiter.id,
        currentWaiterName: waiter.name,
        items: updatedItems,
      };

      setSales(allSales => allSales.map(s => s.id === updatedSale.id ? updatedSale : s));

      setTables(allTables => allTables.map(t => {
        if (t.currentSaleId === updatedSale.id) {
          return { ...t, status: 'kitchen', currentWaiterName: waiter.name };
        }
        return t;
      }));

      return updatedSale;
    });
  };

  // Transfer Table
  const transferTable = (targetTableId: number) => {
    if (!activeSale) return;
    const targetTable = tables.find(t => t.id === targetTableId);
    if (!targetTable || targetTable.status !== 'free') return;

    const oldTableNum = activeSale.tableNumber;

    const updatedSale: Sale = {
      ...activeSale,
      tableNumber: targetTable.number,
      tableName: targetTable.name,
      salonId: targetTable.salonId,
      salonName: salons.find(s => s.id === targetTable.salonId)?.name || 'Salón',
    };

    setActiveSale(updatedSale);
    setSales(allSales => allSales.map(s => s.id === updatedSale.id ? updatedSale : s));

    setTables(allTables => allTables.map(t => {
      if (t.number === oldTableNum) {
        return {
          ...t,
          status: 'free',
          currentSaleId: null,
          diners: undefined,
          openedAt: undefined,
          total: 0,
        };
      }
      if (t.id === targetTableId) {
        return {
          ...t,
          status: 'occupied',
          currentSaleId: updatedSale.id,
          diners: activeSale.diners,
          openedAt: activeSale.time,
          total: updatedSale.total,
        };
      }
      return t;
    }));
  };

  // Park Sale / Exit POS view
  const parkSale = () => {
    setActiveSale(null);
    setActiveView('floor');
  };

  // Cancel Sale
  const cancelActiveSale = () => {
    if (!activeSale) return;
    const tableNum = activeSale.tableNumber;

    activeSale.items.forEach(item => {
      setProducts(allProducts => allProducts.map(p => {
        if (p.id === item.productId) {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      }));
    });

    setSales(allSales => allSales.map(s => s.id === activeSale.id ? { ...s, status: 'cancelled' } : s));

    setTables(allTables => allTables.map(t => {
      if (t.number === tableNum) {
        return {
          ...t,
          status: 'free',
          currentSaleId: null,
          diners: undefined,
          openedAt: undefined,
          total: 0,
        };
      }
      return t;
    }));

    setActiveSale(null);
    setActiveView('floor');
  };

  // Finalize Sale
  const finalizeSale = (paymentMethod: 'cash' | 'card' | 'crypto' | 'other', details: { cashGiven?: number; change?: number }): Sale => {
    if (!activeSale) throw new Error('No active sale to finalize');

    const now = new Date();
    const closedSale: Sale = {
      ...activeSale,
      status: 'closed',
      closedAt: now.toISOString(),
      shiftId: currentShift?.id,
      paymentMethod,
      paymentDetails: details,
    };

    setSales(allSales => allSales.map(s => s.id === closedSale.id ? closedSale : s));

    setTables(allTables => allTables.map(t => {
      if (t.number === closedSale.tableNumber) {
        return {
          ...t,
          status: 'free',
          currentSaleId: null,
          diners: undefined,
          openedAt: undefined,
          total: 0,
        };
      }
      return t;
    }));

    setPrintableTicket(closedSale);
    setActiveSale(null);
    setIsPaymentModalOpen(false);
    setActiveView('floor');

    return closedSale;
  };

  // Kitchen operations
  const markKitchenItemServed = (saleId: number, lineId: string) => {
    setSales(prev => prev.map(s => {
      if (s.id === saleId) {
        const updatedLines = s.items.map(l => {
          if (l.id === lineId) {
            return { ...l, kitchenStatus: 'served' as const };
          }
          return l;
        });
        return { ...s, items: updatedLines };
      }
      return s;
    }));

    if (activeSale && activeSale.id === saleId) {
      setActiveSale(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(l => l.id === lineId ? { ...l, kitchenStatus: 'served' as const } : l),
        };
      });
    }
  };

  const markAllKitchenItemsServed = (saleId: number) => {
    setSales(prev => prev.map(s => {
      if (s.id === saleId) {
        const updatedLines = s.items.map(l => ({ ...l, kitchenStatus: 'served' as const }));
        return { ...s, items: updatedLines };
      }
      return s;
    }));

    setTables(prev => prev.map(t => {
      if (t.currentSaleId === saleId) {
        return { ...t, status: 'occupied' };
      }
      return t;
    }));

    if (activeSale && activeSale.id === saleId) {
      setActiveSale(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(l => ({ ...l, kitchenStatus: 'served' as const })),
        };
      });
    }
  };

  const printPreTicket = (sale: Sale) => {
    setSales(prev => prev.map(s => {
      if (s.id === sale.id) {
        return { ...s, preticketPrinted: true };
      }
      return s;
    }));

    if (activeSale && activeSale.id === sale.id) {
      setActiveSale(prev => prev ? { ...prev, preticketPrinted: true } : null);
    }

    if (sale.tableNumber) {
      setTables(prev => prev.map(t => {
        if (t.number === sale.tableNumber) {
          return { ...t, preticketPrinted: true, status: 'billed' };
        }
        return t;
      }));
    }

    setPrintableTicket({ ...sale, preticketPrinted: true });
  };

  return (
    <POSContext.Provider
      value={{
        language,
        setLanguage,
        t,
        waiter,
        setWaiter,
        waiters,
        setWaiters,
        addWaiter,
        updateWaiter,
        deleteWaiter,
        warehouse,
        setWarehouse,
        terminal,
        setTerminal,
        isLoggedIn,
        setIsLoggedIn,
        login,
        loginUser,
        quickLogin,
        logout,
        deviceType,
        isMobileDevice,
        isMobileWaiter,
        stationMode,
        setStationMode,
        activeView,
        setActiveView,
        salons,
        selectedSalonId,
        setSelectedSalonId,
        tables,
        setTables,
        openTable,
        categories,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        rates,
        selectedRateId,
        setSelectedRateId,
        sales,
        setSales,
        activeSale,
        setActiveSale,
        createSale,
        createChannelSale,
        updateDeliveryStatus,
        assignDriverToSale,
        assignClientToActiveSale,
        addItemToActiveSale,
        submitCustomerOrder,
        updateSaleLine,
        removeSaleLine,
        sendActiveSaleToKitchen,
        transferTable,
        parkSale,
        cancelActiveSale,
        finalizeSale,
        markKitchenItemServed,
        markAllKitchenItemsServed,
        currentShift,
        shiftHistory,
        setShiftHistory,
        openCashShift,
        addCashMovement,
        closeCashShift,
        reports,
        generateZReport,
        isCashShiftModalOpen,
        setIsCashShiftModalOpen,
        cashModalMode,
        setCashModalMode,
        themeMode,
        setThemeMode,
        restaurantBrand,
        updateRestaurantBrand,
        currency,
        systemModules,
        updateSystemModules,
        ticketSettings,
        updateTicketSettings,
        resetTicketSettings,
        printAreas,
        addPrintArea,
        updatePrintArea,
        deletePrintArea,
        modifierGroups,
        addModifierGroup,
        updateModifierGroup,
        deleteModifierGroup,
        customRoles,
        addCustomRole,
        updateCustomRole,
        deleteCustomRole,
        clients,
        addClient,
        updateClient,
        deleteClient,
        printableTicket,
        setPrintableTicket,
        printPreTicket,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
