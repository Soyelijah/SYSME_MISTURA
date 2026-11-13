import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { PrintArea } from '../../types';
import { sound } from '../../utils/sound';
import { Search, Plus, Printer, Trash2, Edit2, Check, X } from 'lucide-react';

export const PrintAreasManager: React.FC = () => {
  const { printAreas, addPrintArea, updatePrintArea, deletePrintArea, categories, themeMode } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  const [search, setSearch] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(printAreas[0]?.id || null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [testPrintFeedback, setTestPrintFeedback] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<PrintArea, 'id'>>({
    name: '',
    printerName: '',
    connectionType: 'network',
    ipOrPort: '192.168.1.50:9100',
    paperWidth: '80mm',
    copies: 1,
    categoryIds: [],
    autoCut: true,
    active: true,
    notes: '',
  });

  const filteredAreas = printAreas.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.printerName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedArea = printAreas.find(a => a.id === selectedId) || null;

  const startCreate = () => {
    sound.playTap();
    setForm({
      name: '',
      printerName: 'Epson TM-T20III',
      connectionType: 'network',
      ipOrPort: '192.168.1.55:9100',
      paperWidth: '80mm',
      copies: 1,
      categoryIds: [],
      autoCut: true,
      active: true,
      notes: '',
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const startEdit = (area: PrintArea) => {
    sound.playTap();
    setForm({
      name: area.name,
      printerName: area.printerName,
      connectionType: area.connectionType,
      ipOrPort: area.ipOrPort,
      paperWidth: area.paperWidth,
      copies: area.copies,
      categoryIds: [...area.categoryIds],
      autoCut: area.autoCut,
      active: area.active,
      notes: area.notes || '',
    });
    setIsCreating(false);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    sound.playTap();
    if (isCreating) {
      const created = addPrintArea(form);
      setSelectedId(created.id);
    } else if (selectedArea) {
      updatePrintArea(selectedArea.id, form);
    }
    setIsEditing(false);
    setIsCreating(false);
  };

  const toggleCategory = (catId: number) => {
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter(id => id !== catId)
        : [...prev.categoryIds, catId],
    }));
  };

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* LEFT PANEL: SEARCH, NEW BUTTON & TABLE */}
      <div className="lg:col-span-7 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar"
              className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva área de impresión</span>
          </button>
        </div>

        <div className={`rounded-xl border overflow-hidden ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <table className="w-full text-left text-xs">
            <thead className={isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}>
              <tr>
                <th className="px-4 py-2.5 font-bold">Nombre</th>
                <th className="px-4 py-2.5 font-bold">Impresora / Puerto</th>
                <th className="px-4 py-2.5 font-bold text-right">Categorías</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAreas.map(area => {
                const isSelected = selectedId === area.id && !isCreating;
                return (
                  <tr
                    key={area.id}
                    onClick={() => {
                      sound.playTap();
                      setSelectedId(area.id);
                      setIsEditing(false);
                      setIsCreating(false);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-100/80 text-slate-900 font-bold'
                          : 'bg-orange-950/40 text-white font-bold'
                        : isLight
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold">{area.name}</td>
                    <td className={`px-4 py-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {area.printerName} • <span className="font-mono">{area.ipOrPort}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{area.categoryIds.length}</td>
                  </tr>
                );
              })}
              {filteredAreas.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron áreas de impresión.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT PANEL: DETAIL OR EDITOR */}
      <div className={`lg:col-span-5 rounded-xl border p-5 min-h-[420px] flex flex-col ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black">
                {isCreating ? 'Nueva área de impresión' : `Editar: ${selectedArea?.name}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <label className="text-xs font-bold block mb-1">Nombre del área *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Barra, Cocina, Parrilla, Pastelería..."
                  className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Impresora</label>
                  <input
                    type="text"
                    value={form.printerName}
                    onChange={e => setForm({ ...form, printerName: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Conexión</label>
                  <select
                    value={form.connectionType}
                    onChange={e => setForm({ ...form, connectionType: e.target.value as PrintArea['connectionType'] })}
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="network">Red / Ethernet IP</option>
                    <option value="usb">USB Local</option>
                    <option value="bluetooth">Bluetooth</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold block mb-1">IP / Puerto</label>
                  <input
                    type="text"
                    value={form.ipOrPort}
                    onChange={e => setForm({ ...form, ipOrPort: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-mono ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Ancho papel</label>
                  <select
                    value={form.paperWidth}
                    onChange={e => setForm({ ...form, paperWidth: e.target.value as '58mm' | '80mm' })}
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="80mm">80 mm</option>
                    <option value="58mm">58 mm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1.5">Categorías asignadas a esta estación</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1">
                  {categories.map(cat => {
                    const checked = form.categoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-left flex items-center justify-between cursor-pointer ${
                          checked
                            ? 'bg-orange-500 text-white border-orange-500'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {checked && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setIsCreating(false); }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white cursor-pointer"
              >
                Guardar área
              </button>
            </div>
          </form>
        ) : selectedArea ? (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className={`px-4 py-3 -mx-5 -mt-5 rounded-t-xl border-b flex items-center justify-between ${
              isLight ? 'bg-amber-100/70 border-amber-200 text-slate-900' : 'bg-orange-950/40 border-slate-800 text-white'
            }`}>
              <h3 className="text-sm font-black">{selectedArea.name}</h3>
              <span className="text-[11px] font-bold">
                {selectedArea.active ? 'Activa' : 'Pausada'}
              </span>
            </div>

            <div className="space-y-3 text-xs flex-1">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Impresora configurada</span>
                <span className="font-bold">{selectedArea.printerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Dirección / Puerto</span>
                <span className="font-mono font-bold">{selectedArea.ipOrPort}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Formato y copias</span>
                <span className="font-bold tabular-nums">{selectedArea.paperWidth} • {selectedArea.copies} copia(s)</span>
              </div>

              <div className="pt-1">
                <span className="text-slate-500 block mb-1.5">Categorías enrutadas ({selectedArea.categoryIds.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedArea.categoryIds.map(cid => {
                    const cat = categories.find(c => c.id === cid);
                    return cat ? (
                      <span
                        key={cid}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                          isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        {cat.name}
                      </span>
                    ) : null;
                  })}
                  {selectedArea.categoryIds.length === 0 && (
                    <span className="text-slate-400 italic">Sin categorías asignadas</span>
                  )}
                </div>
              </div>

              {testPrintFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  {testPrintFeedback}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setTestPrintFeedback(`Prueba enviada a ${selectedArea.printerName} (${selectedArea.ipOrPort})`);
                  setTimeout(() => setTestPrintFeedback(null), 2500);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                  isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Probar impresora</span>
              </button>

              <div className="flex items-center gap-2">
                {printAreas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar el área "${selectedArea.name}"?`)) {
                        deletePrintArea(selectedArea.id);
                        setSelectedId(printAreas.find(a => a.id !== selectedArea.id)?.id || null);
                      }
                    }}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-rose-600 cursor-pointer"
                    title="Eliminar área"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(selectedArea)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    isLight
                      ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200'
                      : 'bg-orange-950/50 hover:bg-orange-900/60 text-orange-300 border border-orange-800/60'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
            <Printer className="w-10 h-10 opacity-40" />
            <p className="text-xs font-medium">Selecciona un área de impresión para más detalles</p>
          </div>
        )}
      </div>
    </div>
  );
};
