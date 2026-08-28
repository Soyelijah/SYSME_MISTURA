import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Boxes, Search, AlertTriangle, ArrowUpDown, Plus, Minus,
  Sparkles, CheckCircle2, TrendingDown, RefreshCw, Layers, ShieldAlert
} from 'lucide-react';
import { getCategoryTheme } from '../utils/theme';
import { sound } from '../utils/sound';

export const InventoryManager: React.FC = () => {
  const { products, updateProductStock, categories, warehouse, themeMode } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  const [search, setSearch] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<number | 'all'>('all');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const filtered = products.filter(p => {
    if (search.trim() !== '') {
      const match = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
    }
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (onlyLowStock && p.stock > p.minStock) return false;
    return true;
  });

  const handleStockChange = (productId: string, delta: number) => {
    const current = products.find(p => p.id === productId)?.stock || 0;
    const next = Math.max(0, current + delta);
    if (delta > 0) {
      sound.playItemAdd();
    } else {
      sound.playItemRemove();
    }
    updateProductStock(productId, next);
  };

  return (
    <div className={`flex-1 flex flex-col h-full p-4 sm:p-6 overflow-y-auto select-none transition-colors ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
        isLight ? 'border-slate-200' : 'border-slate-800/80'
      }`}>
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <Boxes className="w-5 h-5" />
            </div>
            <span>Gestión de Stock & Control de Almacén</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ubicación: <span className="font-bold text-slate-700 dark:text-slate-200">{warehouse.name}</span> • Control en tiempo real con alertas de reposición
          </p>
        </div>

        {/* Low Stock Warning Counter */}
        {lowStockCount > 0 && (
          <button
            onClick={() => { sound.playTap(); setOnlyLowStock(!onlyLowStock); }}
            className={`touch-btn px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
              onlyLowStock
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 font-black'
                : isLight
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{lowStockCount} artículos bajo stock mínimo</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="my-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por artículo o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500'
            }`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          <button
            onClick={() => { sound.playTap(); setSelectedCat('all'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCat === 'all'
                ? 'bg-sky-600 text-white shadow-md'
                : isLight
                ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({products.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => { sound.playTap(); setSelectedCat(c.id); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCat === c.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : isLight
                  ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Stock Table */}
      <div className={`flex-1 rounded-3xl border overflow-hidden shadow-2xl ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-mono ${
              isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="p-3.5">Artículo / Imagen</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">PVP / Coste</th>
                <th className="p-3.5">Estado Stock</th>
                <th className="p-3.5 text-center">Stock Actual</th>
                <th className="p-3.5 text-right">Ajuste Rápido Táctil</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {filtered.map(prod => {
                const isOutOfStock = prod.stock <= 0;
                const isLow = prod.stock > 0 && prod.stock <= prod.minStock;
                const theme = getCategoryTheme(prod.categoryId);

                return (
                  <tr key={prod.id} className={`transition-colors ${
                    isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/60'
                  }`}>
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold block">{prod.id}</span>
                        <span className="font-bold text-xs sm:text-sm">{prod.name}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                        {categories.find(c => c.id === prod.categoryId)?.name || 'General'}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-amber-600 dark:text-amber-400">{prod.price.toFixed(2)} €</div>
                      <div className="text-[10px] text-slate-400">Coste: {prod.buyPrice.toFixed(2)} €</div>
                    </td>

                    <td className="p-3.5">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700">
                          Agotado (0)
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                          Bajo Mínimo ({prod.minStock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                          Correcto
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="text-base font-black font-mono">
                        {prod.stock}
                      </span>
                      <span className="text-[10px] text-slate-400 block">mín: {prod.minStock}</span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className={`inline-flex items-center gap-1 p-1 rounded-xl border ${
                        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}>
                        <button
                          onClick={() => handleStockChange(prod.id, -1)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                            isLight ? 'bg-white hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockChange(prod.id, 1)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                            isLight ? 'bg-white hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleStockChange(prod.id, 5)}
                          className="w-7 h-7 bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center font-bold text-[11px]"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockChange(prod.id, 10)}
                          className="w-7 h-7 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-[11px]"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
