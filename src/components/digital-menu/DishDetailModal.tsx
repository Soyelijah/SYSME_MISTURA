import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Check, Flame, Sparkles, Utensils, Wine, AlertCircle, Heart } from 'lucide-react';
import { Product } from '../../types';
import { sound } from '../../utils/sound';

interface DishDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedOptions: string[], notes: string) => void;
  isLight: boolean;
  currencySymbol?: string;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isLight,
  currencySymbol = '$'
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const toggleOption = (optionId: string) => {
    sound.playTap();
    setSelectedOptions(prev =>
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const calculateTotalPrice = () => {
    let extra = 0;
    if (product.options) {
      product.options.forEach(opt => {
        if (selectedOptions.includes(opt.id) && opt.priceExtra) {
          extra += opt.priceExtra;
        }
      });
    }
    return (product.price + extra) * quantity;
  };

  const handleAdd = () => {
    sound.playSuccess();
    onAddToCart(product, quantity, selectedOptions, notes);
    onClose();
  };

  // Sommelier pairing suggestion based on dish category/name
  const getPairingSuggestion = () => {
    const name = product.name.toLowerCase();
    if (name.includes('carne') || name.includes('chuletrón') || name.includes('solomillo') || name.includes('vacuno')) {
      return { drink: 'Tinto Ribera del Duero Pago de Carraovejas', icon: '🍷', note: 'Notas de roble y frutos negros que realzan la maduración de la carne.' };
    }
    if (name.includes('ceviche') || name.includes('tiradito') || name.includes('pulpo') || name.includes('pescado') || name.includes('reineta') || name.includes('lubina')) {
      return { drink: 'Pisco Sour Catedral o Cerveza Artesanal Helada', icon: '🍸', note: 'La acidez cítrica equilibra y potencia la frescura marina.' };
    }
    if (name.includes('arroz') || name.includes('paella') || name.includes('tapas') || name.includes('jamón')) {
      return { drink: 'Cava Brut Nature o Copa de Tinto Rioja', icon: '🥂', note: 'Burbuja fina que limpia el paladar entre cada bocado.' };
    }
    if (name.includes('tarta') || name.includes('coulant') || name.includes('chocolate') || name.includes('postre')) {
      return { drink: 'Café Espresso Arábica o Bajativo de Maracuyá', icon: '☕', note: 'Contraste cálido y aromático perfecto para el dulce.' };
    }
    return { drink: 'Cóctel Mistura Especial de la Casa', icon: '🍹', note: 'Armonía refrescante con toques frutales y botánicos.' };
  };

  const pairing = getPairingSuggestion();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border my-auto ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => { sound.playTap(); onClose(); }}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Favorite button */}
          <button
            onClick={() => { sound.playTap(); setIsFavorite(!isFavorite); }}
            className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all"
            aria-label="Favorito"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </button>

          {/* High-res Image Banner */}
          <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-950">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-amber-500 text-slate-950 shadow-lg mb-1.5 uppercase">
                  Recomendación Gastronómica
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-tight">
                  {product.name}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-amber-300 font-mono drop-shadow-md">
                  {currencySymbol} {product.price.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Description */}
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Descripción & Elaboración
              </h4>
              <p className={`text-sm leading-relaxed font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                {product.description || 'Plato elaborado diariamente en nuestras cocinas con ingredientes seleccionados y técnicas tradicionales.'}
              </p>
            </div>

            {/* Allergens */}
            {product.allergens && product.allergens.length > 0 && (
              <div className={`p-3 rounded-2xl border ${isLight ? 'bg-amber-100/90 border-amber-300' : 'bg-amber-950/30 border-amber-800/40'}`}>
                <div className={`flex items-center gap-1.5 text-xs font-black mb-1.5 ${isLight ? 'text-amber-950' : 'text-amber-400'}`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Información de Alérgenos</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.allergens.map((allergen, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black ${
                        isLight ? 'bg-amber-200 text-amber-950 border border-amber-300' : 'bg-amber-900/60 text-amber-200'
                      }`}
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sommelier Pairing Suggestion */}
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              isLight ? 'bg-indigo-50/80 border-indigo-200' : 'bg-gradient-to-r from-teal-950/40 to-slate-900 border-teal-800/40'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                isLight ? 'bg-indigo-600 text-white' : 'bg-teal-500/20 text-teal-400'
              }`}>
                {pairing.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${
                  isLight ? 'text-indigo-900' : 'text-teal-400'
                }`}>
                  <Wine className="w-3 h-3" />
                  <span>Maridaje Sugerido del Sumiller</span>
                </div>
                <h5 className={`text-xs font-black mt-0.5 ${isLight ? 'text-slate-950' : 'text-slate-200'}`}>
                  {pairing.drink}
                </h5>
                <p className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  {pairing.note}
                </p>
              </div>
            </div>

            {/* Product Options if available */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-2">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Opciones & Preferencias
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.options.map(opt => {
                    const isSelected = selectedOptions.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleOption(opt.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
                            : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-white text-indigo-700 border-white' : 'border-slate-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          {opt.name}
                        </span>
                        {opt.priceExtra ? (
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-100' : isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            +{opt.priceExtra.toFixed(2)} {currencySymbol}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className={`text-xs font-black uppercase tracking-wider block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Instrucciones especiales para cocina
              </label>
              <input
                type="text"
                placeholder="Ej: Salsa aparte, sin cebolla, muy caliente..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold border outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                    : 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:bg-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Modal Footer with Stepper & Add Button */}
          <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            {/* Quantity Stepper */}
            <div className={`flex items-center rounded-2xl border p-1 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}>
              <button
                type="button"
                onClick={() => { sound.playTap(); setQuantity(Math.max(1, quantity - 1)); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-black text-sm font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => { sound.playTap(); setQuantity(quantity + 1); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Order Button */}
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-500 hover:to-cyan-500 shadow-xl shadow-teal-600/30 flex items-center justify-between transition-all"
            >
              <span>Añadir a mi Comanda</span>
              <span className="font-mono bg-black/20 px-2.5 py-1 rounded-xl">
                {currencySymbol} {calculateTotalPrice().toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
