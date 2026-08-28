import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import {
  CreditCard, DollarSign, Coins, Building, Printer,
  CheckCircle2, X, AlertCircle, Sparkles, Check, ArrowRight,
  ShieldCheck, Receipt
} from 'lucide-react';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen, setIsPaymentModalOpen, activeSale,
    finalizeSale, setPrintableTicket, waiter, terminal, themeMode, currency
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';

  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'crypto' | 'other'>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('Habitación 204');
  const [autoPrintTicket, setAutoPrintTicket] = useState<boolean>(true);

  const total = activeSale ? activeSale.total : 0;
  const cashNum = parseFloat(cashGiven) || 0;
  const change = Math.max(0, cashNum - total);
  const isCashSufficient = cashNum >= total;

  useEffect(() => {
    if (activeSale) {
      setCashGiven(activeSale.total.toFixed(2));
      setSelectedMethod('cash');
    }
  }, [activeSale]);

  if (!isPaymentModalOpen || !activeSale) return null;

  const handleQuickCash = (amount: number) => {
    sound.playTap();
    setCashGiven(amount.toFixed(2));
  };

  const handleNumpad = (digit: string) => {
    sound.playTap();
    if (digit === 'C') {
      setCashGiven('');
    } else if (digit === '.') {
      if (!cashGiven.includes('.')) {
        setCashGiven(prev => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      setCashGiven(prev => prev + digit);
    }
  };

  const handleFinalizePayment = () => {
    sound.playCashRegister();

    // Trigger confetti celebration on checkout
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const completedSale = finalizeSale(
      selectedMethod,
      {
        cashGiven: selectedMethod === 'cash' ? cashNum : total,
        change: selectedMethod === 'cash' ? change : 0,
      }
    );

    if (autoPrintTicket && completedSale) {
      setPrintableTicket(completedSale);
    }

    setIsPaymentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
      <div className={`border rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors ${
        isLight ? 'bg-white border-slate-300 text-slate-900 shadow-slate-950/20' : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between transition-colors ${
          isLight
            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white'
            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-white'
        }`}>
          <div>
            <span className="text-[11px] font-mono opacity-90 font-bold block tracking-wider">
              COBRO & FACTURACIÓN #{activeSale.number || '001'}
            </span>
            <h3 className="text-lg sm:text-xl font-black flex items-center gap-2 mt-0.5">
              <span>{activeSale.tableName}</span>
              <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-lg font-bold">
                {activeSale.items.length} artículos
              </span>
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs opacity-90 block font-medium">Total a Pagar:</span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-300 drop-shadow">
              {total.toFixed(2)} {currency}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Payment Method Selector Pills with vibrant colors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Efectivo */}
            <button
              id="pay-method-cash"
              onClick={() => { sound.playTap(); setSelectedMethod('cash'); }}
              className={`p-3.5 rounded-2xl border text-center font-black text-xs transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                selectedMethod === 'cash'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                  : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <DollarSign className={`w-5 h-5 ${selectedMethod === 'cash' ? 'text-white' : 'text-emerald-500'}`} />
              <span>Efectivo</span>
            </button>

            {/* Tarjeta */}
            <button
              id="pay-method-card"
              onClick={() => { sound.playTap(); setSelectedMethod('card'); }}
              className={`p-3.5 rounded-2xl border text-center font-black text-xs transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                selectedMethod === 'card'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                  : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${selectedMethod === 'card' ? 'text-white' : 'text-indigo-400'}`} />
              <span>Tarjeta / TPV</span>
            </button>

            {/* Bitcoin */}
            <button
              id="pay-method-crypto"
              onClick={() => { sound.playTap(); setSelectedMethod('crypto'); }}
              className={`p-3.5 rounded-2xl border text-center font-black text-xs transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                selectedMethod === 'crypto'
                  ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30 scale-[1.02]'
                  : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Coins className={`w-5 h-5 ${selectedMethod === 'crypto' ? 'text-white' : 'text-amber-500'}`} />
              <span>Cripto / QR</span>
            </button>

            {/* Habitación */}
            <button
              id="pay-method-room"
              onClick={() => { sound.playTap(); setSelectedMethod('other'); }}
              className={`p-3.5 rounded-2xl border text-center font-black text-xs transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                selectedMethod === 'other'
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                  : isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Building className={`w-5 h-5 ${selectedMethod === 'other' ? 'text-white' : 'text-purple-400'}`} />
              <span>Habitación / Cargo</span>
            </button>
          </div>

          {/* EFECTIVO / CASH MODE */}
          {selectedMethod === 'cash' && (
            <div className={`space-y-3 p-4 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
            }`}>
              {/* Quick Cash preset pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <button
                  onClick={() => handleQuickCash(total)}
                  className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                    isLight
                      ? 'bg-white hover:bg-emerald-50 border-slate-300 hover:border-emerald-500 text-slate-900'
                      : 'bg-slate-900 hover:bg-emerald-950 hover:border-emerald-500 border-slate-700 text-slate-100'
                  }`}
                >
                  Exacto ({total.toFixed(2)}{currency})
                </button>
                {[10, 20, 50, 100, 200].map(amt => (
                  <button
                    key={amt}
                    disabled={amt < total}
                    onClick={() => handleQuickCash(amt)}
                    className={`p-2.5 rounded-xl border text-xs font-black font-mono transition-all ${
                      amt >= total
                        ? isLight
                          ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                        : 'opacity-40 border-transparent text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {amt} {currency}
                  </button>
                ))}
              </div>

              {/* Numpad & Cash Tender Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Inputs & Change Result */}
                <div className="space-y-3">
                  <div>
                    <label className={`text-xs font-black block mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Importe Entregado por Cliente:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 rounded-2xl text-2xl font-mono font-black focus:outline-none ${
                          isLight
                            ? 'bg-white border-slate-300 text-emerald-700 focus:border-emerald-500'
                            : 'bg-slate-900 border-slate-700 text-emerald-400 focus:border-emerald-500'
                        }`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono text-sm">{currency}</span>
                    </div>
                  </div>

                  {/* Change calculated */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isCashSufficient
                      ? isLight ? 'bg-emerald-100 border-emerald-400 text-emerald-950' : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-100'
                      : isLight ? 'bg-rose-100 border-rose-400 text-rose-950' : 'bg-rose-950/80 border-rose-500/80 text-rose-100'
                  }`}>
                    <span className="text-xs font-black">
                      {isCashSufficient ? 'Cambio a Devolver:' : 'Falta dinero:'}
                    </span>
                    <span className="text-2xl font-mono font-black">
                      {isCashSufficient ? `${change.toFixed(2)} ${currency}` : `${(total - cashNum).toFixed(2)} ${currency}`}
                    </span>
                  </div>
                </div>

                {/* Tactile Numpad */}
                <div className="grid grid-cols-3 gap-1.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '.'].map(key => (
                    <button
                      key={key}
                      onClick={() => handleNumpad(key)}
                      className={`py-2.5 border rounded-xl text-base font-black font-mono transition-colors active:scale-95 ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CARD MODE */}
          {selectedMethod === 'card' && (
            <div className={`p-6 rounded-2xl border text-center space-y-3 ${
              isLight ? 'bg-indigo-50 border-indigo-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}>
              <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                <CreditCard className="w-8 h-8" />
              </div>
              <h4 className="font-black text-base">Esperando Datáfono / Tarjeta Contactless</h4>
              <p className={`text-xs max-w-sm mx-auto font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Acerque la tarjeta contactless del cliente al terminal o inserte chip para autorizar el cobro de <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-black">{total.toFixed(2)}{currency}</strong>.
              </p>
            </div>
          )}

          {/* BITCOIN MODE */}
          {selectedMethod === 'crypto' && (
            <div className={`p-6 rounded-2xl border text-center space-y-3 ${
              isLight ? 'bg-amber-50 border-amber-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}>
              <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                <Coins className="w-8 h-8" />
              </div>
              <h4 className="font-black text-base">Pago con QR / Cripto</h4>
              <p className={`text-xs max-w-sm mx-auto font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Factura instantánea Lightning: <span className="font-mono text-amber-800 dark:text-amber-300 font-black">~ {Math.round(total * 1400)} SATS</span>
              </p>
            </div>
          )}

          {/* ROOM CHARGE MODE */}
          {selectedMethod === 'other' && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-purple-50 border-purple-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <label className={`text-xs font-black block ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                Número de Habitación / Huésped:
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-xs font-bold focus:outline-none focus:border-purple-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              />
            </div>
          )}

          {/* Auto-print ticket checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="auto-print-ticket-chk"
              checked={autoPrintTicket}
              onChange={(e) => setAutoPrintTicket(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="auto-print-ticket-chk" className={`text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
              isLight ? 'text-slate-800' : 'text-slate-300'
            }`}>
              <Printer className="w-4 h-4 text-indigo-500" />
              <span>Imprimir ticket fiscal automáticamente al finalizar</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => { sound.playTap(); setIsPaymentModalOpen(false); }}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-colors border ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            Cancelar
          </button>

          <button
            id="finalize-payment-btn"
            disabled={selectedMethod === 'cash' && !isCashSufficient}
            onClick={handleFinalizePayment}
            className={`touch-btn flex-1 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-98 ${
              selectedMethod === 'cash' && !isCashSufficient
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/40'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>CONFIRMAR Y FINALIZAR COBRO ({total.toFixed(2)} {currency})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

