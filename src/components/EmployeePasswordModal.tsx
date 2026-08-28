import React, { useState, useEffect } from 'react';
import { Table, Waiter } from '../types';
import { Play, Ban, Delete, KeyRound, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';
import { usePOS } from '../context/POSContext';

interface EmployeePasswordModalProps {
  isOpen: boolean;
  table: Table | null;
  waiters: Waiter[];
  currentWaiter: Waiter;
  onAccept: (waiter: Waiter, table: Table) => void;
  onCancel: () => void;
}

export const EmployeePasswordModal: React.FC<EmployeePasswordModalProps> = ({
  isOpen,
  table,
  waiters,
  currentWaiter,
  onAccept,
  onCancel,
}) => {
  const { themeMode } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  const [password, setPassword] = useState<string>('');
  const [capsLock, setCapsLock] = useState<boolean>(false);
  const [shift, setShift] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
    }
  }, [isOpen, table]);

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAccept();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setPassword(prev => prev.slice(0, -1));
        setErrorMsg('');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setPassword(prev => prev + e.key);
        setErrorMsg('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, password, table]);

  if (!isOpen || !table) return null;

  const handleKeyPress = (char: string) => {
    sound.playTap();
    const finalChar = (capsLock || shift) ? char.toUpperCase() : char.toLowerCase();
    setPassword(prev => prev + finalChar);
    setErrorMsg('');
    if (shift) setShift(false);
  };

  const handleBackspace = () => {
    sound.playTap();
    setPassword(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    sound.playTap();
    setPassword('');
    setErrorMsg('');
  };

  const handleAccept = () => {
    sound.playTap();
    // Check if password matches any waiter PIN or matches current waiter or is demo accepted
    const matched = waiters.find(w => w.pin === password) ||
      (password.trim() === '' ? currentWaiter : null) ||
      (table.waiterId ? waiters.find(w => w.id === table.waiterId) : null) ||
      currentWaiter;

    if (matched) {
      onAccept(matched, table);
    } else {
      sound.playAlert();
      setErrorMsg('Contraseña incorrecta');
      setPassword('');
    }
  };

  const qwertyRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const qwertyRow2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const qwertyRow3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', '<', '>', ',', '.'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5 select-none animate-in fade-in duration-150">
      <div className={`border rounded-3xl w-full max-w-2xl overflow-hidden p-5 sm:p-7 shadow-2xl transition-all ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20'
          : 'bg-slate-900 border-slate-700 text-white shadow-black/80'
      }`}>
        
        {/* Top Header & Password Input Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between mb-4">
          
          {/* Left Column: Title, Black Password Box, Action Buttons */}
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-black tracking-wide uppercase">
                    Acceso de Empleado
                  </span>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                  isLight
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    : 'bg-indigo-950/60 border-indigo-700/80 text-indigo-300'
                }`}>
                  {table.name || `Mesa ${table.number}`}
                </span>
              </div>

              {/* Password Display Box (High-Contrast Black Screen with masked stars or text) */}
              <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl h-14 px-4 flex items-center justify-between shadow-inner">
                <div className="font-mono text-2xl tracking-widest text-emerald-400 font-bold flex items-center">
                  {password.length > 0 ? (
                    '•'.repeat(password.length)
                  ) : (
                    <span className="text-slate-500 text-xs sm:text-sm font-sans tracking-normal font-medium">
                      Ingrese PIN (Demo: 1234)...
                    </span>
                  )}
                  <span className="inline-block w-2.5 h-6 bg-emerald-400 ml-1.5 animate-pulse rounded-xs" />
                </div>

                {password.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-slate-300 hover:text-white text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-black transition-colors"
                  >
                    Borrar
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="text-rose-600 dark:text-rose-400 text-xs font-black mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errorMsg}
                </div>
              )}
            </div>

            {/* ACEPTAR & CANCELAR Big High-Contrast Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* ACEPTAR BUTTON */}
              <button
                id="btn-password-accept"
                onClick={handleAccept}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 rounded-2xl p-3 flex items-center justify-center gap-2.5 text-white shadow-lg shadow-emerald-600/30 transition-all font-black"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                </div>
                <span className="text-xs sm:text-sm tracking-wider">
                  ACEPTAR
                </span>
              </button>

              {/* CANCELAR BUTTON */}
              <button
                id="btn-password-cancel"
                onClick={onCancel}
                className={`border rounded-2xl p-3 flex items-center justify-center gap-2.5 transition-all font-black active:scale-98 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <Ban className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-xs sm:text-sm tracking-wider">
                  CANCELAR
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: 3x4 Numeric Keypad */}
          <div className={`w-full sm:w-52 p-3 rounded-2xl border shadow-inner shrink-0 ${
            isLight
              ? 'bg-slate-100 border-slate-300'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'C'].map((num) => {
                const isClear = num === 'C';
                return (
                  <button
                    key={num}
                    id={`num-pad-${num}`}
                    onClick={() => {
                      if (isClear) handleClear();
                      else handleKeyPress(num);
                    }}
                    className={`h-11 sm:h-12 rounded-xl font-black text-lg sm:text-xl border shadow-xs transition-all active:scale-95 flex items-center justify-center ${
                      isClear
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                        : isLight
                        ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-400 shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Full QWERTY Tactile Keyboard */}
        <div className={`p-2.5 sm:p-3.5 rounded-2xl border space-y-1.5 ${
          isLight
            ? 'bg-slate-100 border-slate-300'
            : 'bg-slate-950 border-slate-800'
        }`}>
          {/* Row 1: Q W E R T Y U I O P Back */}
          <div className="flex gap-1 justify-center">
            {qwertyRow1.map((letter) => {
              const displayChar = (capsLock || shift) ? letter.toUpperCase() : letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleKeyPress(letter)}
                  className={`flex-1 max-w-[52px] h-10 sm:h-11 rounded-xl border font-black text-sm sm:text-base shadow-xs active:scale-95 flex items-center justify-center transition-all ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  {displayChar}
                </button>
              );
            })}
            <button
              onClick={handleBackspace}
              className={`px-2.5 sm:px-3.5 h-10 sm:h-11 rounded-xl border font-bold text-xs shadow-xs active:scale-95 flex items-center justify-center gap-1 shrink-0 transition-all ${
                isLight
                  ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Borrar carácter"
            >
              <Delete className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>

          {/* Row 2: CapsLock A S D F G H J K L */}
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => {
                sound.playTap();
                setCapsLock(prev => !prev);
              }}
              className={`px-2.5 sm:px-3.5 h-10 sm:h-11 rounded-xl border font-bold text-xs shadow-xs active:scale-95 flex items-center justify-center shrink-0 transition-all ${
                capsLock
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : isLight
                  ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              Caps Lock
            </button>
            {qwertyRow2.map((letter) => {
              const displayChar = (capsLock || shift) ? letter.toUpperCase() : letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleKeyPress(letter)}
                  className={`flex-1 max-w-[52px] h-10 sm:h-11 rounded-xl border font-black text-sm sm:text-base shadow-xs active:scale-95 flex items-center justify-center transition-all ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  {displayChar}
                </button>
              );
            })}
          </div>

          {/* Row 3: Shift Z X C V B N M < > , . Space */}
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => {
                sound.playTap();
                setShift(prev => !prev);
              }}
              className={`px-2.5 sm:px-3.5 h-10 sm:h-11 rounded-xl border font-bold text-xs shadow-xs active:scale-95 flex items-center justify-center shrink-0 transition-all ${
                shift
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : isLight
                  ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              Shift
            </button>
            {qwertyRow3.map((char) => {
              const isLetter = char.match(/[a-z]/i);
              const displayChar = (isLetter && (capsLock || shift)) ? char.toUpperCase() : char;
              return (
                <button
                  key={char}
                  onClick={() => handleKeyPress(char)}
                  className={`flex-1 max-w-[46px] h-10 sm:h-11 rounded-xl border font-black text-sm sm:text-base shadow-xs active:scale-95 flex items-center justify-center transition-all ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  {displayChar}
                </button>
              );
            })}
            <button
              onClick={() => handleKeyPress(' ')}
              className={`flex-1 max-w-[120px] h-10 sm:h-11 rounded-xl border font-bold text-xs shadow-xs active:scale-95 flex items-center justify-center transition-all ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              Espacio
            </button>
          </div>
        </div>

        {/* Quick Hint / Footer note */}
        <div className={`text-center mt-3 text-xs font-semibold flex items-center justify-center gap-2 ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Garzón activo: <strong className={isLight ? 'text-slate-950' : 'text-white'}>{currentWaiter.name}</strong> • Toca Aceptar o presiona Enter para abrir la comanda</span>
        </div>
      </div>
    </div>
  );
};

