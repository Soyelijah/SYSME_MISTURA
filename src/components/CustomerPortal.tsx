import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, Table, Language } from '../types';
import { MobileCustomerView } from './digital-menu/MobileCustomerView';
import { MobileOrderDrawer, CartItem } from './digital-menu/MobileOrderDrawer';
import { DishDetailModal } from './digital-menu/DishDetailModal';
import { CallWaiterModal } from './digital-menu/CallWaiterModal';
import { sound } from '../utils/sound';
import {
  QrCode,
  Utensils,
  LogOut,
  CheckCircle2,
  Bell,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Smartphone
} from 'lucide-react';

interface CustomerPortalProps {
  tableNumber?: string;
  onExitToStaff?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  tableNumber: initialTableNumber,
  onExitToStaff
}) => {
  const {
    categories,
    products,
    tables,
    restaurantBrand,
    language,
    setLanguage,
    currency,
    submitCustomerOrder,
    setTables
  } = usePOS();

  // Determine active table number from prop, URL search, or fallback to '1'
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(() => {
    if (initialTableNumber) return initialTableNumber;
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const tbl = params.get('table') || params.get('mesa');
        if (tbl) return tbl;
      } catch {}
    }
    return '1';
  });

  const activeTable = useMemo(() => {
    return tables.find(t => t.number === selectedTableNumber) || tables[0];
  }, [tables, selectedTableNumber]);

  // Customer Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDish, setSelectedDish] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState<boolean>(false);
  const [orderSentSuccess, setOrderSentSuccess] = useState<boolean>(false);
  const [billRequested, setBillRequested] = useState<boolean>(false);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity: number = 1,
    selectedOptions: string[] = [],
    notes: string = '',
    extraPrice: number = 0
  ) => {
    sound.playAdd();
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id &&
                JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions) &&
                item.notes === notes
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const unitPrice = product.price + extraPrice;
      return [...prev, { product, quantity, selectedOptions, notes, unitPrice }];
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    sound.playTap();
    setCart(prev => {
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    sound.playItemRemove();
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Submit order directly into POS for that table
  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    sound.playSuccess();

    submitCustomerOrder(selectedTableNumber, cart);

    setCart([]);
    setIsCartDrawerOpen(false);
    setOrderSentSuccess(true);
    setTimeout(() => setOrderSentSuccess(false), 5000);
  };

  const handleRequestBill = () => {
    sound.playSuccess();
    setTables(prev => prev.map(t => {
      if (t.number === selectedTableNumber) {
        return { ...t, status: 'billed', preticketPrinted: true };
      }
      return t;
    }));
    setBillRequested(true);
    setTimeout(() => setBillRequested(false), 5000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* Top Staff / Customer Notice Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <QrCode className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-teal-400">Carta QR Comensal:</span>
            <span className="font-black text-white px-2 py-0.2 rounded-md bg-white/10">
              {activeTable ? activeTable.name : `Mesa ${selectedTableNumber}`}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (Vista generada por escaneo de QR en mesa)
            </span>
          </div>
        </div>

        {/* Exit back to staff / TPV button */}
        {onExitToStaff && (
          <button
            onClick={() => { sound.playTap(); onExitToStaff(); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] border border-white/15 transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-3 h-3 text-amber-400" />
            <span>Acceso Personal / TPV</span>
          </button>
        )}
      </div>

      {/* Success Notifications */}
      {orderSentSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-black shadow-lg flex items-center justify-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Su pedido ha sido enviado a cocina con éxito! En breve estará en su mesa.</span>
        </div>
      )}

      {billRequested && (
        <div className="bg-amber-600 text-slate-950 px-4 py-2.5 text-center text-xs font-black shadow-lg flex items-center justify-center gap-2">
          <Receipt className="w-4 h-4" />
          <span>Hemos avisado al camarero que solicita la cuenta. Un momento por favor.</span>
        </div>
      )}

      {/* Main Interactive Customer Mobile View */}
      <div className="flex-1 max-w-lg mx-auto w-full flex flex-col">
        <MobileCustomerView
          categories={categories}
          products={products}
          tables={tables}
          restaurantBrand={restaurantBrand}
          selectedTable={selectedTableNumber}
          onSelectTable={setSelectedTableNumber}
          language={language}
          onSelectLanguage={setLanguage}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          onOpenDetailModal={setSelectedDish}
          onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
          onOpenCallWaiter={() => setIsCallWaiterOpen(true)}
          currencySymbol={currency}
        />
      </div>

      {/* Modals for Mobile Experience */}
      <MobileOrderDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        selectedTable={selectedTableNumber}
        isLight={false}
        currencySymbol={currency}
        onOrderSuccess={handleConfirmOrder}
      />

      {selectedDish && (
        <DishDetailModal
          product={selectedDish}
          onClose={() => setSelectedDish(null)}
          onAddToCart={handleAddToCart}
          isLight={false}
          currencySymbol={currency}
        />
      )}

      <CallWaiterModal
        isOpen={isCallWaiterOpen}
        onClose={() => setIsCallWaiterOpen(false)}
        selectedTable={selectedTableNumber}
        isLight={false}
      />
    </div>
  );
};
