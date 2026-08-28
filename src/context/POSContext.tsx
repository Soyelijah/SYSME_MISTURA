import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Waiter, Warehouse, POSTerminal, Salon, Table, Category, Product, Rate,
  Sale, SaleLine, Language, CashRegisterReport, TranslationStrings, ActiveView, ThemeMode,
  CashMovement, CashShift, DeviceStationMode, UserPermissions
} from '../types';
import {
  INITIAL_WAITERS, INITIAL_WAREHOUSES, INITIAL_TERMINALS, INITIAL_SALONS,
  INITIAL_TABLES, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_RATES,
  INITIAL_SALES, TRANSLATIONS, DEFAULT_ADMIN_PERMISSIONS, DEFAULT_CASHIER_PERMISSIONS,
  DEFAULT_WAITER_PERMISSIONS, DEFAULT_KITCHEN_PERMISSIONS
} from '../data/mockData';
import { isViewAllowedForUser, getDefaultViewForUser } from '../utils/permissions';

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

  // Device Station Simulation
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
  activeSale: Sale | null;
  setActiveSale: (sale: Sale | null) => void;
  createSale: (tableId?: number, dinersCount?: number) => Sale;
  addItemToActiveSale: (product: Product, quantity?: number, optionName?: string, notes?: string, customBlock?: number) => void;
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

  // Station Mode
  const [stationMode, setStationModeState] = useState<DeviceStationMode>(() => {
    const saved = localStorage.getItem('sysme_station_mode');
    return (saved as DeviceStationMode) || 'master-pc';
  });

  const setStationMode = (mode: DeviceStationMode) => {
    setStationModeState(mode);
    localStorage.setItem('sysme_station_mode', mode);
  };

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
      try { return JSON.parse(saved); } catch {}
    }
    return {
      name: 'Dy Pos Gastrobar',
      tagline: 'Sistema TPV Gastronómico & Control Total',
      cif: 'B-88741259',
      address: 'Avenida Principal 102, Planta Central',
      phone: '+34 912 345 678',
      city: 'Madrid (España)',
      currency: '€',
      tipPercentage: 10,
      ticketFooter: '¡Gracias por su visita! Dy Pos TPV Suite.',
    };
  });

  const updateRestaurantBrand = (updates: Partial<RestaurantSettings>) => {
    setRestaurantBrand(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('sysme_restaurant_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const currency = restaurantBrand.currency || '€';

  // 3. Views
  const [activeView, setActiveViewState] = useState<ActiveView>(() => {
    const savedView = localStorage.getItem('sysme_active_view');
    if (savedView) return savedView as ActiveView;
    const savedSale = localStorage.getItem('sysme_active_sale');
    if (savedSale) return 'pos';
    return 'floor';
  });

  const setActiveView = (view: ActiveView) => {
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
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TABLES;
  });

  // 5. Products & Categories & Rates
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sysme_categories');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sysme_products');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
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
    // Default open shift for convenience
    const now = new Date();
    return {
      id: `SHIFT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-001`,
      terminalId: 1,
      terminalName: 'TPV 1 - Barra Principal',
      openedBy: 'ALLISSON (Cajera)',
      openedAtDate: now.toLocaleDateString('es-ES'),
      openedAtTime: '08:30:00',
      initialCash: 250.00,
      status: 'open',
      movements: [
        {
          id: 'MOV-01',
          type: 'in',
          amount: 50.00,
          concept: 'Monedas de cambio adicionales para caja',
          category: 'change',
          userName: 'PIERRE (Admin/Gerente)',
          date: now.toLocaleDateString('es-ES'),
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

  // Login / Logout
  const login = (pin: string): boolean => {
    const matched = waiters.find(w => w.pin === pin);
    if (matched) {
      setWaiter(matched);
      setIsLoggedIn(true);
      sessionStorage.setItem('sysme_session_active', 'true');
      setIsLoginModalOpen(false);
      setActiveSale(prev => prev ? { ...prev, currentWaiterId: matched.id, currentWaiterName: matched.name } : null);
      if (!isViewAllowedForUser(activeView, matched)) {
        setActiveView(getDefaultViewForUser(matched));
      }
      return true;
    }
    return false;
  };

  const loginUser = (selectedUser: Waiter, pin: string): boolean => {
    if (selectedUser.pin === pin) {
      setWaiter(selectedUser);
      setIsLoggedIn(true);
      sessionStorage.setItem('sysme_session_active', 'true');
      setIsLoginModalOpen(false);
      setActiveSale(prev => prev ? { ...prev, currentWaiterId: selectedUser.id, currentWaiterName: selectedUser.name } : null);
      if (!isViewAllowedForUser(activeView, selectedUser)) {
        setActiveView(getDefaultViewForUser(selectedUser));
      }
      return true;
    }
    return false;
  };

  const quickLogin = (selectedUser: Waiter) => {
    setWaiter(selectedUser);
    setIsLoggedIn(true);
    sessionStorage.setItem('sysme_session_active', 'true');
    setIsLoginModalOpen(false);
    setActiveSale(prev => prev ? { ...prev, currentWaiterId: selectedUser.id, currentWaiterName: selectedUser.name } : null);
    if (!isViewAllowedForUser(activeView, selectedUser)) {
      setActiveView(getDefaultViewForUser(selectedUser));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('sysme_session_active');
    setIsLoginModalOpen(false);
  };

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
      openedAtDate: now.toLocaleDateString('es-ES'),
      openedAtTime: now.toLocaleTimeString('es-ES'),
      initialCash,
      status: 'open',
      movements: [],
      notes,
    };

    setCurrentShift(newShift);
    setTerminal(prev => ({ ...prev, isOpen: true, initialCash }));
    return newShift;
  };

  const addCashMovement = (movData: Omit<CashMovement, 'id' | 'date' | 'time' | 'userName'>): CashMovement => {
    const now = new Date();
    const newMov: CashMovement = {
      id: `MOV-${Date.now().toString(36).toUpperCase()}`,
      userName: waiter.name,
      date: now.toLocaleDateString('es-ES'),
      time: now.toLocaleTimeString('es-ES'),
      ...movData,
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
    const closedSales = sales.filter(s => s.status === 'closed');
    let cashSales = 0;
    let cardSales = 0;
    let cryptoSales = 0;
    let otherSales = 0;
    let totalSales = 0;
    let totalTax = 0;

    closedSales.forEach(s => {
      totalSales += s.total;
      totalTax += s.taxTotal;
      if (s.paymentMethod === 'cash') cashSales += s.total;
      else if (s.paymentMethod === 'card') cardSales += s.total;
      else if (s.paymentMethod === 'crypto') cryptoSales += s.total;
      else otherSales += s.total;
    });

    const shiftMovements = currentShift?.movements || [];
    const totalCashIn = shiftMovements.filter(m => m.type === 'in').reduce((acc, m) => acc + m.amount, 0);
    const totalCashOut = shiftMovements.filter(m => m.type === 'out').reduce((acc, m) => acc + m.amount, 0);

    const initial = currentShift ? currentShift.initialCash : terminal.initialCash;
    const expectedCash = initial + cashSales + totalCashIn - totalCashOut;
    const difference = Math.round((countedCash - expectedCash) * 100) / 100;

    const reportId = `Z-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(reports.length + 1).padStart(3, '0')}`;
    
    const newReport: CashRegisterReport = {
      id: reportId,
      date: now.toLocaleDateString('es-ES'),
      time: now.toLocaleTimeString('es-ES'),
      terminalId: terminal.id,
      terminalName: terminal.name,
      openedBy: currentShift?.openedBy || waiter.name,
      closedBy: waiter.name,
      initialCash: initial,
      cashSales: Math.round(cashSales * 100) / 100,
      cardSales: Math.round(cardSales * 100) / 100,
      cryptoSales: Math.round(cryptoSales * 100) / 100,
      otherSales: Math.round(otherSales * 100) / 100,
      totalSales: Math.round(totalSales * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      cashCounted: countedCash,
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
        openedAtDate: now.toLocaleDateString('es-ES'),
        openedAtTime: '08:00:00',
        initialCash: initial,
        status: 'closed',
        movements: [],
      }),
      status: 'closed',
      closedBy: waiter.name,
      closedAtDate: now.toLocaleDateString('es-ES'),
      closedAtTime: now.toLocaleTimeString('es-ES'),
      cashCounted: countedCash,
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

  // Recalculate totals helper
  const calculateSaleTotals = (items: SaleLine[]): { subtotal: number; taxTotal: number; total: number } => {
    let subtotal = 0;
    let taxTotal = 0;
    let total = 0;

    items.forEach(item => {
      const lineTotal = item.total;
      const taxRate = item.iva / 100;
      const lineSubtotal = lineTotal / (1 + taxRate);
      const lineTax = lineTotal - lineSubtotal;

      subtotal += lineSubtotal;
      taxTotal += lineTax;
      total += lineTotal;
    });

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  };

  // Create or open a sale
  const createSale = (tableId?: number, dinersCount: number = 2): Sale => {
    const matchedTable = tables.find(t => t.id === tableId);
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
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

  // Add Item
  const addItemToActiveSale = (product: Product, quantity: number = 1, optionName?: string, notes?: string, customBlock?: number) => {
    if (!activeSale) {
      const newSale = createSale();
      setActiveSale(newSale);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const currentRate = rates.find(r => r.id === (activeSale?.rateId || selectedRateId)) || rates[0];
    const unitPrice = Math.round((product.price * currentRate.multiplier) * 100) / 100;
    const lineTotal = Math.round((unitPrice * quantity) * 100) / 100;

    // Decrement stock
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      }
      return p;
    }));

    setActiveSale(prev => {
      if (!prev) return null;

      const existingIndex = prev.items.findIndex(i =>
        i.productId === product.id &&
        !i.kitchenNotes &&
        !notes &&
        !i.selectedOption &&
        !optionName &&
        i.kitchenStatus === 'pending' &&
        (i.waiterId === waiter.id || !i.waiterId)
      );

      let newItems: SaleLine[];
      if (existingIndex > -1) {
        newItems = [...prev.items];
        const exist = newItems[existingIndex];
        const newQty = exist.quantity + quantity;
        const newTotal = Math.round((exist.unitPrice * newQty * (1 - exist.discount / 100)) * 100) / 100;
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
          lineId: prev.items.length + 1,
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          originalPrice: product.price,
          iva: product.iva,
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
        newItems = [...prev.items, newLine];
      }

      const totals = calculateSaleTotals(newItems);
      const updatedSale: Sale = {
        ...prev,
        currentWaiterId: waiter.id,
        currentWaiterName: waiter.name,
        items: newItems,
        ...totals,
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

  // Update Line
  const updateSaleLine = (lineId: string, updates: Partial<SaleLine>) => {
    setActiveSale(prev => {
      if (!prev) return null;
      const newItems = prev.items.map(item => {
        if (item.id === lineId) {
          const updated = { ...item, ...updates };
          const disc = updated.discount || 0;
          updated.total = Math.round((updated.unitPrice * updated.quantity * (1 - disc / 100)) * 100) / 100;
          return updated;
        }
        return item;
      });

      const totals = calculateSaleTotals(newItems);
      const updatedSale: Sale = {
        ...prev,
        currentWaiterId: waiter.id,
        currentWaiterName: waiter.name,
        items: newItems,
        ...totals,
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
      const updatedSale: Sale = {
        ...prev,
        currentWaiterId: waiter.id,
        currentWaiterName: waiter.name,
        items: newItems,
        ...totals,
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
    const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
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
        activeSale,
        setActiveSale,
        createSale,
        addItemToActiveSale,
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
