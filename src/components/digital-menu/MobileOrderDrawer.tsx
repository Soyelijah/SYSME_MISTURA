import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Send, CheckCircle2, Receipt, Clock, Sparkles, Utensils } from 'lucide-react';
import { Product } from '../../types';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions: string[];
  notes: string;
  unitPrice: number;
}

interface MobileOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  selectedTable: string;
  isLight: boolean;
  currencySymbol?: string;
  onOrderSuccess?: () => void;
}

export const MobileOrderDrawer: React.FC<MobileOrderDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedTable,
  isLight,
  currencySymbol = '$',
  onOrderSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [sentOrderNumber, setSentOrderNumber] = useState('');

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleSendOrder = () => {
    sound.playSuccess();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSent(true);
      const generatedOrderNum = `QR-${Math.floor(1000 + Math.random() * 9000)}`;
      setSentOrderNumber(generatedOrderNum);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // Safe fallback
      }

      if (onOrderSuccess) {
        onOrderSuccess();
      }
    }, 1200);
  };

  const handleReset = () => {
    setOrderSent(false);
    onClearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm">Mi Comanda en Mesa</h3>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                  Mesa {selectedTable} • Autoservicio Digital
                </span>
              </div>
            </div>

            <button
              onClick={() => { sound.playTap(); onClose(); }}
              className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {orderSent ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ¡Comanda Enviada a Cocina!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Tu pedido #{sentOrderNumber} ha sido transferido directamente a la pantalla de cocina y barra de la Mesa {selectedTable}.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border text-left space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Mesa:</span>
                    <span className="font-mono text-teal-600 dark:text-teal-400">{selectedTable}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Estado:</span>
                    <span className="text-amber-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" /> En Preparación
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Estimado:</span>
                    <span className="font-mono text-amber-500 font-black">
                      {currencySymbol} {totalAmount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30"
                >
                  Seguir Viendo la Carta
                </button>
              </motion.div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Utensils className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  Tu comanda está vacía
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explora las categorías y añade platos o bebidas para realizar tu pedido desde la mesa.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold pb-1">
                  <span className="text-slate-500">Platos seleccionados ({cart.length})</span>
                  <button
                    onClick={() => { sound.playTap(); onClearCart(); }}
                    className="text-rose-500 hover:text-rose-600 flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3 h-3" /> Vaciar
                  </button>
                </div>

                {cart.map((item, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-3 rounded-2xl border flex gap-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs truncate">{item.product.name}</h4>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-500 shrink-0 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.notes && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 italic truncate mt-0.5">
                          Nota: {item.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-mono font-black text-amber-500">
                          {currencySymbol} {(item.unitPrice * item.quantity).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>

                        <div className={`flex items-center rounded-lg border p-0.5 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
                        }`}>
                          <button
                            onClick={() => { sound.playTap(); onUpdateQuantity(index, item.quantity - 1); }}
                            className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => { sound.playTap(); onUpdateQuantity(index, item.quantity + 1); }}
                            className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Submit Action */}
          {!orderSent && cart.length > 0 && (
            <div className={`p-4 border-t space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">{currencySymbol} {(totalAmount * 0.9).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>IVA Incluido (10%):</span>
                  <span className="font-mono">{currencySymbol} {(totalAmount * 0.1).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total a Pagar:</span>
                  <span className="font-mono text-amber-500 text-base">
                    {currencySymbol} {totalAmount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSendOrder}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enviando Comanda a Cocina...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirmar y Enviar Pedido a Cocina</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
