import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Waiter } from '../types';
import { ShieldCheck, Lock, Check, X, Smartphone, ChefHat, KeyRound } from 'lucide-react';
import { sound } from '../utils/sound';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, waiter, loginUser, waiters, themeMode } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  const [selectedUser, setSelectedUser] = useState<Waiter>(waiter || waiters[0]);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  if (!isLoginModalOpen) return null;

  const handleDigit = (digit: string) => {
    sound.playTap();
    if (pinInput.length < 4) {
      setPinInput(prev => prev + digit);
      setPinError(false);
    }
  };

  const handleBackspace = () => {
    sound.playTap();
    setPinInput(prev => prev.slice(0, -1));
    setPinError(false);
  };

  const handleClear = () => {
    sound.playTap();
    setPinInput('');
    setPinError(false);
  };

  const handleSubmit = () => {
    const success = loginUser(selectedUser, pinInput);
    if (success) {
      sound.playSuccess();
      setPinInput('');
      setPinError(false);
    } else {
      sound.playBeep();
      setPinError(true);
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
      <div className={`border rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl transition-colors my-auto ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900 shadow-slate-950/20'
          : 'bg-slate-900 border-slate-800 text-white shadow-black/80'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm">Cambio de Usuario / Login</h2>
              <p className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Seleccione su usuario e ingrese su PIN
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Selection Pills */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
          {waiters.map(w => {
            const isSelected = selectedUser.id === w.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  sound.playTap();
                  setSelectedUser(w);
                  setPinInput('');
                  setPinError(false);
                }}
                className={`p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30'
                    : isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                <img
                  src={w.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={w.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/40 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <span className={`text-xs truncate font-black block ${isSelected ? 'text-white' : isLight ? 'text-slate-900' : 'text-white'}`}>{w.name}</span>
                  <span className={`text-[9px] font-bold uppercase block ${isSelected ? 'text-indigo-100' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {w.role === 'admin' ? '🛡️ Admin' : w.role === 'cashier' ? '💰 Cajera' : w.role === 'kitchen' ? '🍳 Cocina' : '📱 Garzón'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* PIN Display */}
        <div className={`text-center space-y-2 py-2 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <label className={`text-xs block font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            PIN para <strong className="text-indigo-600 dark:text-indigo-400 font-black">{selectedUser.name}</strong>:
          </label>
          <div className="flex justify-center gap-3 py-1">
            {[0, 1, 2, 3].map(index => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all ${
                  index < pinInput.length
                    ? 'bg-indigo-600 scale-110 shadow-sm shadow-indigo-600'
                    : isLight
                    ? 'bg-slate-200 border-2 border-slate-300'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              />
            ))}
          </div>
          {pinError && (
            <span className="text-rose-600 dark:text-rose-400 text-xs font-black block animate-bounce">
              ¡PIN incorrecto! Inténtelo de nuevo (Demo: {selectedUser.pin})
            </span>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((key) => {
            const isOk = key === 'OK';
            const isClear = key === 'C';

            return (
              <button
                key={key}
                id={`pin-key-${key}`}
                onClick={() => {
                  if (isOk) handleSubmit();
                  else if (isClear) handleClear();
                  else handleDigit(key);
                }}
                className={`h-12 rounded-2xl font-mono text-base font-black transition-all active:scale-95 flex items-center justify-center ${
                  isOk
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30'
                    : isClear
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 hover:border-slate-400 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

