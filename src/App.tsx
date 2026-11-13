import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CashShiftBanner } from './components/CashShiftBanner';
import { DashboardView } from './components/DashboardView';
import { FloorPlanView } from './components/FloorPlanView';
import { POSOrderTerminal } from './components/POSOrderTerminal';
import { KitchenDisplay } from './components/KitchenDisplay';
import { DigitalMenu } from './components/DigitalMenu';
import { CashReports } from './components/CashReports';
import { InventoryManager } from './components/InventoryManager';
import { AdminPanel } from './components/AdminPanel';
import { PaymentModal } from './components/PaymentModal';
import { TicketPrintModal } from './components/TicketPrintModal';
import { LoginModal } from './components/LoginModal';
import { CashShiftModal } from './components/CashShiftModal';
import { PendingSalesView } from './components/PendingSalesView';
import { LoginScreen } from './components/LoginScreen';
import { CustomerPortal } from './components/CustomerPortal';
import { DeliveryAndCounterView } from './components/DeliveryAndCounterView';
import { ClientsView } from './components/ClientsView';
import { isViewAllowedForUser, getDefaultViewForUser } from './utils/permissions';

const POSMainContent: React.FC = () => {
  const { activeView, themeMode, isLoggedIn, waiter, stationMode, isMobileDevice, systemModules } = usePOS();

  // Customer guest mode (triggered exclusively when a table QR code is scanned via URL param)
  const [isCustomerMode, setIsCustomerMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get('mode') === 'customer' || !!params.get('table');
      } catch {}
    }
    return false;
  });

  const [customerTableNumber, setCustomerTableNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get('table') || '1';
      } catch {}
    }
    return '1';
  });

  useEffect(() => {
    if (themeMode === 'vibrant-light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [themeMode]);

  // If visitor is in Customer Mode (e.g. Scanned Table QR Code)
  if (isCustomerMode) {
    return (
      <CustomerPortal
        tableNumber={customerTableNumber}
        onExitToStaff={() => {
          setIsCustomerMode(false);
          try {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch {}
        }}
      />
    );
  }

  // If not logged in as staff, strictly render the secure employee LoginScreen
  // (New staff account creation is strictly reserved for the Administrator inside their Admin Panel)
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // Strict defense-in-depth permission verification for active view based on user role & enabled modules
  const isAllowed = isViewAllowedForUser(activeView, waiter, stationMode, isMobileDevice, systemModules);
  const currentSafeView = isAllowed ? activeView : getDefaultViewForUser(waiter);

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-200 ${
      themeMode === 'vibrant-light'
        ? 'bg-slate-100 text-slate-900'
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* 1. Modern Animated Collapsible Sidebar on Left */}
      <Sidebar />

      {/* 2. Main Workspace Viewport on Right */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopBar />
        <CashShiftBanner />

        <main className="flex-1 flex overflow-hidden relative">
          {currentSafeView === 'dashboard' && <DashboardView />}
          {currentSafeView === 'floor' && <FloorPlanView />}
          {currentSafeView === 'pos' && <POSOrderTerminal />}
          {currentSafeView === 'delivery' && <DeliveryAndCounterView />}
          {currentSafeView === 'pending-sales' && <PendingSalesView />}
          {currentSafeView === 'kitchen' && <KitchenDisplay />}
          {currentSafeView === 'menu' && <DigitalMenu />}
          {currentSafeView === 'clients' && <ClientsView />}
          {currentSafeView === 'reports' && <CashReports />}
          {currentSafeView === 'inventory' && <InventoryManager />}
          {currentSafeView === 'admin' && <AdminPanel />}
        </main>
      </div>

      {/* Global Modals */}
      <PaymentModal />
      <TicketPrintModal />
      <LoginModal />
      <CashShiftModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <POSProvider>
      <POSMainContent />
    </POSProvider>
  );
};

export default App;
