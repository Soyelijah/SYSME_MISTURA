import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { ModifierGroup, ModifierOptionItem } from '../../types';
import { sound } from '../../utils/sound';
import { SlidersHorizontal, Plus, Trash2, Check, Flame, Utensils, Package, AlertCircle, Sparkles } from 'lucide-react';

export const ModifiersManager: React.FC = () => {
  const {
    modifierGroups,
    addModifierGroup,
    updateModifierGroup,
    deleteModifierGroup,
    currency,
    themeMode
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const [selectedGroupId, setSelectedGroupId] = useState<string>(modifierGroups[0]?.id || '');

  // New Group inline form
  const [isAddingGroup, setIsAddingGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupMulti, setNewGroupMulti] = useState<boolean>(true);
  const [newGroupIcon, setNewGroupIcon] = useState<ModifierGroup['icon']>('sparkles');

  // New Option inline form
  const [newOptName, setNewOptName] = useState<string>('');
  const [newOptPrice, setNewOptPrice] = useState<string>('0');

  const selectedGroup = modifierGroups.find(g => g.id === selectedGroupId) || modifierGroups[0] || null;

  const getIconComp = (icon: ModifierGroup['icon']) => {
    switch (icon) {
      case 'flame': return <Flame className="w-4 h-4 text-rose-500" />;
      case 'utensils': return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'package': return <Package className="w-4 h-4 text-blue-500" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Sparkles className="w-4 h-4 text-orange-500" />;
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    sound.playTap();
    const created = addModifierGroup({
      name: newGroupName.trim(),
      icon: newGroupIcon,
      color: 'text-amber-500',
      multiSelect: newGroupMulti,
      required: false,
      categoryIds: [],
      options: [],
    });
    setSelectedGroupId(created.id);
    setNewGroupName('');
    setIsAddingGroup(false);
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newOptName.trim()) return;
    sound.playTap();
    const newOption: ModifierOptionItem = {
      id: `opt-${Date.now().toString(36)}`,
      name: newOptName.trim(),
      priceExtra: Math.max(0, Number(newOptPrice) || 0),
      active: true,
    };
    updateModifierGroup(selectedGroup.id, {
      options: [...selectedGroup.options, newOption],
    });
    setNewOptName('');
    setNewOptPrice('0');
  };

  const handleToggleOptionActive = (optId: string) => {
    if (!selectedGroup) return;
    sound.playTap();
    updateModifierGroup(selectedGroup.id, {
      options: selectedGroup.options.map(o => o.id === optId ? { ...o, active: !o.active } : o),
    });
  };

  const handleUpdateOptionPrice = (optId: string, price: number) => {
    if (!selectedGroup) return;
    updateModifierGroup(selectedGroup.id, {
      options: selectedGroup.options.map(o => o.id === optId ? { ...o, priceExtra: Math.max(0, price) } : o),
    });
  };

  const handleDeleteOption = (optId: string) => {
    if (!selectedGroup) return;
    sound.playTap();
    updateModifierGroup(selectedGroup.id, {
      options: selectedGroup.options.filter(o => o.id !== optId),
    });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span>Opciones y Modificadores de Productos</span>
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Personaliza los grupos de cocción, guarniciones, agregados con costo adicional y preferencias que aparecen en el TPV.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { sound.playTap(); setIsAddingGroup(!isAddingGroup); }}
          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      {isAddingGroup && (
        <form
          onSubmit={handleCreateGroup}
          className={`p-4 rounded-xl border flex flex-wrap items-end gap-3 ${
            isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold block mb-1">Nombre del grupo *</label>
            <input
              type="text"
              required
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              placeholder="Ej: Salsas Adicionales, Tipo de Leche..."
              className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Ícono</label>
            <select
              value={newGroupIcon}
              onChange={e => setNewGroupIcon(e.target.value as ModifierGroup['icon'])}
              className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
              }`}
            >
              <option value="sparkles">General / Destacado</option>
              <option value="flame">Cocción / Fuego</option>
              <option value="utensils">Guarnición / Plato</option>
              <option value="package">Servicio / Empaque</option>
              <option value="alert">Exclusión / Alergia</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold pb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newGroupMulti}
              onChange={e => setNewGroupMulti(e.target.checked)}
              className="accent-orange-500 w-4 h-4"
            />
            <span>Selección múltiple</span>
          </label>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Crear Grupo</span>
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT GROUPS LIST */}
        <div className="lg:col-span-5 space-y-2">
          {modifierGroups.map(group => {
            const isSelected = selectedGroup?.id === group.id;
            const activeOpts = group.options.filter(o => o.active).length;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => { sound.playTap(); setSelectedGroupId(group.id); }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-amber-100/80 border-amber-400 text-slate-950 shadow-xs'
                      : 'bg-orange-950/40 border-orange-500/70 text-white'
                    : isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-800/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-slate-100' : 'bg-slate-800'
                  }`}>
                    {getIconComp(group.icon)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate">{group.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {group.multiSelect ? 'Múltiple' : 'Selección única'} • {activeOpts} activas
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold tabular-nums text-slate-400">
                  {group.options.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT OPTIONS EDITOR */}
        <div className={`lg:col-span-7 rounded-xl border p-5 space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {selectedGroup ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  {getIconComp(selectedGroup.icon)}
                  <div>
                    <h3 className="text-sm font-black">{selectedGroup.name}</h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Configura las opciones disponibles y su cargo extra opcional
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGroup.multiSelect}
                      onChange={e => updateModifierGroup(selectedGroup.id, { multiSelect: e.target.checked })}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <span>Permitir varias</span>
                  </label>

                  {modifierGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar el grupo "${selectedGroup.name}"?`)) {
                          deleteModifierGroup(selectedGroup.id);
                          setSelectedGroupId(modifierGroups.find(g => g.id !== selectedGroup.id)?.id || '');
                        }
                      }}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Eliminar grupo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add Option Form */}
              <form onSubmit={handleAddOption} className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-[11px] font-bold block mb-1">Nueva opción</label>
                  <input
                    type="text"
                    required
                    value={newOptName}
                    onChange={e => setNewOptName(e.target.value)}
                    placeholder="Ej: Doble Queso, Sin Hielo, Término 3/4..."
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div className="w-28">
                  <label className="text-[11px] font-bold block mb-1">Extra ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    step="100"
                    value={newOptPrice}
                    onChange={e => setNewOptPrice(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-mono font-bold tabular-nums ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </form>

              {/* Options List */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border rounded-xl border-slate-200 dark:border-slate-800 max-h-[340px] overflow-y-auto">
                {selectedGroup.options.map(opt => (
                  <div
                    key={opt.id}
                    className={`px-3.5 py-2.5 flex items-center justify-between gap-3 ${
                      !opt.active ? 'opacity-50' : ''
                    }`}
                  >
                    <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opt.active}
                        onChange={() => handleToggleOptionActive(opt.id)}
                        className="accent-orange-500 w-4 h-4 shrink-0"
                      />
                      <span className="text-xs font-bold truncate">{opt.name}</span>
                    </label>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400">+{currency}</span>
                      <input
                        type="number"
                        min={0}
                        step="100"
                        value={opt.priceExtra}
                        onChange={e => handleUpdateOptionPrice(opt.id, Number(e.target.value) || 0)}
                        className={`w-20 rounded-md border px-2 py-1 text-xs font-mono font-bold text-right tabular-nums ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(opt.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Eliminar opción"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {selectedGroup.options.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Este grupo no tiene opciones aún. Agrega una arriba.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Crea o selecciona un grupo de modificadores.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
