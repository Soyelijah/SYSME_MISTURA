import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Navbar } from './components/Navbar';
import { CashShiftBanner } from './components/CashShiftBanner';
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

const POSMainContent: React.FC = () => {
  const { activeView, themeMode, isLoggedIn } = usePOS();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${
      themeMode === 'vibrant-light'
        ? 'bg-slate-100 text-slate-900'
        : 'bg-slate-950 text-slate-100'
    }`}>
      <Navbar />
      <CashShiftBanner />

      <main className="flex-1 flex overflow-hidden relative">
        {activeView === 'floor' && <FloorPlanView />}
        {activeView === 'pos' && <POSOrderTerminal />}
        {activeView === 'pending-sales' && <PendingSalesView />}
        {activeView === 'kitchen' && <KitchenDisplay />}
        {activeView === 'menu' && <DigitalMenu />}
        {activeView === 'reports' && <CashReports />}
        {activeView === 'inventory' && <InventoryManager />}
        {activeView === 'admin' && <AdminPanel />}
      </main>

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
