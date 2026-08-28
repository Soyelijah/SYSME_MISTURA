import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Utensils, Receipt, CreditCard, Banknote, HelpCircle, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTable: string;
  isLight: boolean;
}

export const CallWaiterModal: React.FC<CallWaiterModalProps> = ({
  isOpen,
  onClose,
  selectedTable,
  isLight
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('assistance');
  const [sent, setSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const reasons = [
    { id: 'assistance', label: 'Atención en Mesa', desc: 'El garzón se acercará en breve', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'cutlery', label: 'Servilletas / Cubiertos / Hielo', desc: 'Reposición rápida de utensilios', icon: <Utensils className="w-5 h-5" /> },
    { id: 'bill_card', label: 'Pedir la Cuenta (Tarjeta)', desc: 'Garzón traerá el datafono inalámbrico', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'bill_cash', label: 'Pedir la Cuenta (Efectivo)', desc: 'Cobro en mesa con cambio exacto', icon: <Banknote className="w-5 h-5" /> },
  ];

  const handleSend = () => {
    sound.playSuccess();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-black text-sm">Llamar al Garzón</h3>
            </div>
            <button
              onClick={() => { sound.playTap(); onClose(); }}
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sent ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                ¡Aviso Enviado al Garzón!
              </h4>
              <p className="text-xs text-slate-500">
                Notificación emitida para la Mesa <span className="font-bold text-slate-900 dark:text-white">{selectedTable}</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seleccione el motivo de la llamada para que el personal de sala acuda preparado:
              </p>

              <div className="space-y-2">
                {reasons.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { sound.playTap(); setSelectedReason(r.id); }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      selectedReason === r.id
                        ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedReason === r.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs">{r.label}</h4>
                      <p className={`text-[10px] mt-0.5 truncate ${selectedReason === r.id ? 'text-teal-100' : 'text-slate-400'}`}>
                        {r.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSend}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>Enviar Llamada a Mesa {selectedTable}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
