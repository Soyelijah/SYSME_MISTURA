import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, X, Printer, Wifi, Sparkles, Smartphone, Check, Download } from 'lucide-react';
import { Table, RestaurantBrand } from '../../types';
import { sound } from '../../utils/sound';

interface QRStandModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: Table[];
  selectedTableNumber: string;
  onSelectTableNumber: (tableNum: string) => void;
  restaurantBrand: RestaurantBrand;
  isLight: boolean;
}

export const QRStandModal: React.FC<QRStandModalProps> = ({
  isOpen,
  onClose,
  tables,
  selectedTableNumber,
  onSelectTableNumber,
  restaurantBrand,
  isLight
}) => {
  const [standStyle, setStandStyle] = useState<'gold' | 'minimal' | 'dark'>('gold');
  const [wifiPassword, setWifiPassword] = useState('Mistura2026');

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playSuccess();
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border my-auto flex flex-col ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base">Generador de Soporte QR de Mesa</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cree soportes físicos y tarjetas de sobremesa listas para imprimir.
                </p>
              </div>
            </div>

            <button
              onClick={() => { sound.playTap(); onClose(); }}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Customization Controls */}
            <div className="space-y-4 text-xs">
              {/* Select Table */}
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Mesa Destino
                </label>
                <select
                  value={selectedTableNumber}
                  onChange={e => onSelectTableNumber(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border font-bold outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <optgroup label="Salón Principal">
                    {tables.filter(t => t.salonId === 1).slice(0, 30).map(t => (
                      <option key={t.id} value={t.number}>
                        {t.name} (Nº {t.number})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Terraza">
                    {tables.filter(t => t.salonId === 2).map(t => (
                      <option key={t.id} value={t.number}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Barra">
                    {tables.filter(t => t.salonId === 3).map(t => (
                      <option key={t.id} value={t.number}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="VIP">
                    {tables.filter(t => t.salonId === 4).map(t => (
                      <option key={t.id} value={t.number}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Theme Style Selector */}
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Estilo de Diseño
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStandStyle('gold')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      standStyle === 'gold'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500 ring-2 ring-amber-500/20'
                        : 'border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    ✨ Gourmet Oro
                  </button>
                  <button
                    type="button"
                    onClick={() => setStandStyle('minimal')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      standStyle === 'minimal'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-2 ring-teal-500/20'
                        : 'border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    🌱 Minimal Clean
                  </button>
                  <button
                    type="button"
                    onClick={() => setStandStyle('dark')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      standStyle === 'dark'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 ring-2 ring-cyan-500/20'
                        : 'border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    🖤 Dark Luxury
                  </button>
                </div>
              </div>

              {/* WiFi Password */}
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Clave WiFi Clientes (Opcional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={e => setWifiPassword(e.target.value)}
                    className={`w-full px-3 py-2 pl-8 rounded-xl border font-mono outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                    placeholder="Contraseña WiFi"
                  />
                  <Wifi className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Live Stand Preview */}
            <div className="flex justify-center">
              <div
                id="printable-qr-stand"
                className={`w-64 rounded-3xl p-6 shadow-2xl border-2 text-center flex flex-col items-center justify-between relative transition-all ${
                  standStyle === 'gold'
                    ? 'bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950 border-amber-400/80 text-white'
                    : standStyle === 'minimal'
                    ? 'bg-white border-slate-300 text-slate-900 shadow-teal-500/10'
                    : 'bg-slate-950 border-cyan-500/50 text-white'
                }`}
              >
                {/* Brand Header */}
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-black opacity-75">
                    {restaurantBrand.name}
                  </span>
                  <h4 className="text-xs font-black tracking-tight text-amber-400 mt-0.5">
                    CARTA & PEDIDOS EN MESA
                  </h4>
                </div>

                {/* QR Box */}
                <div className="my-4 p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>

                {/* Table Badge */}
                <div className="space-y-1">
                  <div className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    standStyle === 'gold'
                      ? 'bg-amber-400 text-slate-950'
                      : standStyle === 'minimal'
                      ? 'bg-slate-900 text-white'
                      : 'bg-cyan-500 text-slate-950'
                  }`}>
                    Mesa {selectedTableNumber}
                  </div>
                  <p className="text-[10px] opacity-80 leading-tight">
                    Enfoca la cámara para ver alérgenos, fotos y pedir directamente.
                  </p>
                </div>

                {/* WiFi Footer */}
                {wifiPassword && (
                  <div className="mt-3 pt-2 border-t border-white/10 w-full flex items-center justify-center gap-1.5 text-[9px] opacity-75 font-mono">
                    <Wifi className="w-3 h-3" />
                    <span>WiFi: {wifiPassword}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-950">
            <button
              onClick={() => { sound.playTap(); onClose(); }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-black shadow-lg shadow-teal-600/30 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Soporte de Mesa</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
