import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, Sparkles, X, Check, Flame, Utensils, Package, AlertCircle } from 'lucide-react';
import { sound } from '../utils/sound';
import { formatCLP, roundCLP } from '../utils/currency';
import { usePOS } from '../context/POSContext';
import { ModifierGroup, Product } from '../types';

export interface ProductOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  product?: Product | null;
  confirmLabel?: string;
  initialSelectedOptions?: string;
  initialKitchenNotes?: string;
  onApply: (selectedOptions: string, kitchenNotes: string, extraPrice?: number) => void;
  isLight?: boolean;
}

const getGroupIcon = (icon: ModifierGroup['icon']) => {
  switch (icon) {
    case 'flame':
      return Flame;
    case 'utensils':
      return Utensils;
    case 'package':
      return Package;
    case 'alert':
      return AlertCircle;
    default:
      return Sparkles;
  }
};

export const ProductOptionsModal: React.FC<ProductOptionsModalProps> = ({
  isOpen,
  onClose,
  productName,
  product = null,
  confirmLabel = 'Aplicar Opciones',
  initialSelectedOptions = '',
  initialKitchenNotes = '',
  onApply,
  isLight = false
}) => {
  const { modifierGroups, currency } = usePOS();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const tags = initialSelectedOptions
        ? initialSelectedOptions.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      setSelectedTags(tags);
      setCustomNote(initialKitchenNotes || '');
    }
  }, [isOpen, initialSelectedOptions, initialKitchenNotes]);

  const totalExtraPrice = useMemo(() => {
    let extra = 0;
    if (product?.options) {
      product.options.forEach(opt => {
        if (selectedTags.includes(opt.name)) {
          extra += opt.priceExtra || 0;
        }
      });
    }
    modifierGroups.forEach(group => {
      if (group.categoryIds && group.categoryIds.length > 0 && product && !group.categoryIds.includes(product.categoryId)) {
        return;
      }
      group.options.forEach(opt => {
        if (opt.active && selectedTags.includes(opt.name)) {
          extra += opt.priceExtra || 0;
        }
      });
    });
    return roundCLP(extra);
  }, [modifierGroups, product, selectedTags]);

  if (!isOpen) return null;

  const handleToggleProductOption = (optionName: string) => {
    sound.playTap();
    setSelectedTags(prev => {
      const productOptionNames = new Set((product?.options || []).map(o => o.name));
      const filtered = prev.filter(t => !productOptionNames.has(t));
      return [optionName, ...filtered];
    });
  };

  const handleToggleOption = (group: ModifierGroup, optionName: string) => {
    sound.playTap();
    setSelectedTags(prev => {
      const already = prev.includes(optionName);
      if (already) {
        return prev.filter(t => t !== optionName);
      }
      if (!group.multiSelect) {
        const groupOptionNames = new Set(group.options.map(o => o.name));
        const filtered = prev.filter(t => !groupOptionNames.has(t));
        return [...filtered, optionName];
      }
      return [...prev, optionName];
    });
  };

  const handleRemoveTag = (tag: string) => {
    sound.playTap();
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = () => {
    sound.playTap();
    const optionsString = selectedTags.join(', ');
    onApply(optionsString, customNote.trim(), totalExtraPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`border rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden ${
        isLight ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20' : 'bg-slate-900 border-slate-700 text-white shadow-black/80'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider block">
                Opciones & Modificadores
              </span>
              <h3 className="font-extrabold text-sm sm:text-base truncate leading-tight">
                {productName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shrink-0 ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedTags.length > 0 && (
            <div className={`p-2.5 rounded-2xl border flex flex-wrap items-center gap-1.5 ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-blue-950/50 border-blue-800 text-blue-200'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Seleccionadas:
              </span>
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <span>{tag}</span>
                  <span className="text-[10px] opacity-70">✕</span>
                </button>
              ))}
              {totalExtraPrice > 0 && (
                <span className="ml-auto text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCLP(totalExtraPrice, currency)}
                </span>
              )}
            </div>
          )}

          {product?.options && product.options.length > 0 && (
            <div className={`p-3 rounded-2xl border space-y-2 ${
              isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'
            }`}>
              <div className="flex items-center justify-between gap-2 text-xs font-black">
                <div className="flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  <span className={isLight ? 'text-slate-900' : 'text-amber-200'}>Opciones del Plato</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Selección única
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {product.options.map(opt => {
                  const isSelected = selectedTags.includes(opt.name);
                  const totalWithVariant = product.price + (opt.priceExtra || 0);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleProductOption(opt.name)}
                      className={`min-h-[44px] px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between gap-1 shadow-2xs active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-black ring-2 ring-amber-400/60 shadow-xs'
                          : isLight
                          ? 'bg-white hover:bg-amber-100/60 text-slate-800 border-amber-200'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                      }`}
                    >
                      <div className="leading-tight min-w-0">
                        <span className="block truncate">{opt.name}</span>
                        <span className={`text-[10px] font-mono tabular-nums ${
                          isSelected ? 'text-slate-900 font-black' : 'text-emerald-600 dark:text-emerald-400 font-bold'
                        }`}>
                          {opt.priceExtra && opt.priceExtra > 0
                            ? `+${formatCLP(opt.priceExtra, currency)} (${formatCLP(totalWithVariant, currency)})`
                            : `${formatCLP(totalWithVariant, currency)} (Base)`}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {modifierGroups
            .filter(group => !group.categoryIds || group.categoryIds.length === 0 || (product && group.categoryIds.includes(product.categoryId)))
            .map(group => {
            const activeOptions = group.options.filter(o => o.active);
            if (activeOptions.length === 0) return null;
            const Icon = getGroupIcon(group.icon);

            return (
              <div key={group.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs font-black">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${group.color}`} />
                    <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{group.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {group.multiSelect ? 'Selección múltiple' : 'Selección única'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {activeOptions.map(option => {
                    const isSelected = selectedTags.includes(option.name);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleToggleOption(group, option.name)}
                        className={`min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between gap-1 shadow-2xs active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-600 font-black ring-2 ring-amber-400/60 shadow-xs'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                        }`}
                      >
                        <div className="leading-tight min-w-0">
                          <span className="block truncate">{option.name}</span>
                          {option.priceExtra > 0 && (
                            <span className={`text-[10px] font-mono tabular-nums ${
                              isSelected ? 'text-slate-900 font-black' : 'text-emerald-600 dark:text-emerald-400 font-bold'
                            }`}>
                              +{formatCLP(option.priceExtra, currency)}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <label className={`text-xs font-black block mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Observación adicional o personalizada:
            </label>
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="Ej: Plato bien caliente, salsa tártara aparte..."
              className={`w-full border-2 rounded-2xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3.5 border-t flex items-center justify-between gap-2 shrink-0 ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            type="button"
            onClick={() => {
              setSelectedTags([]);
              setCustomNote('');
            }}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Limpiar Todo
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
