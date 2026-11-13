import React from 'react';
import { usePOS } from '../../context/POSContext';
import { SYSTEM_MODULE_ITEMS } from '../../data/defaultConfigs';
import { SystemModulesConfig } from '../../types';
import { sound } from '../../utils/sound';
import { Check, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const SystemModulesSettings: React.FC = () => {
  const { systemModules, updateSystemModules, themeMode } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  const enabledCount = SYSTEM_MODULE_ITEMS.filter(item => systemModules[item.key]).length;

  const handleToggle = (key: keyof SystemModulesConfig) => {
    sound.playTap();
    updateSystemModules({ [key]: !systemModules[key] });
  };

  const handleEnableAll = () => {
    sound.playTap();
    const allTrue: Partial<SystemModulesConfig> = {};
    SYSTEM_MODULE_ITEMS.forEach(item => {
      allTrue[item.key] = true;
    });
    updateSystemModules(allTrue);
  };

  return (
    <div className="space-y-5 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            <span>Módulos y Funcionalidades del Sistema</span>
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Elige qué herramientas desea utilizar el restaurante. Los módulos desactivados se ocultan automáticamente de la barra lateral.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold tabular-nums px-3 py-1.5 rounded-xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            {enabledCount} de {SYSTEM_MODULE_ITEMS.length} activos
          </span>
          <button
            type="button"
            onClick={handleEnableAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Activar todos</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SYSTEM_MODULE_ITEMS.map(item => {
          const isChecked = !!systemModules[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleToggle(item.key)}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                isChecked
                  ? isLight
                    ? 'bg-orange-50/70 border-orange-400 shadow-xs'
                    : 'bg-orange-950/30 border-orange-500/60'
                  : isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isChecked
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : isLight
                    ? 'bg-white border-slate-300'
                    : 'bg-slate-950 border-slate-600'
                }`}
              >
                {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className={`text-sm font-bold leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {item.label}
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
