import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { TicketTemplateConfig } from '../../types';
import { sound } from '../../utils/sound';
import { formatCLP, normalizeCurrencySymbol } from '../../utils/currency';
import { RotateCcw, Printer, Save, Check, Utensils } from 'lucide-react';

export const TicketCustomizationSettings: React.FC = () => {
  const {
    ticketSettings,
    updateTicketSettings,
    resetTicketSettings,
    printAreas,
    restaurantBrand,
    currency,
    themeMode
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const [ticketType, setTicketType] = useState<'precuenta' | 'comanda'>('precuenta');
  const [subTab, setSubTab] = useState<'contenido' | 'formato' | 'impresion'>('contenido');
  const [draft, setDraft] = useState<TicketTemplateConfig>(ticketSettings[ticketType]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [testNotice, setTestNotice] = useState<boolean>(false);

  useEffect(() => {
    setDraft(ticketSettings[ticketType]);
    setHasChanges(false);
  }, [ticketType, ticketSettings]);

  const updateField = <K extends keyof TicketTemplateConfig>(key: K, value: TicketTemplateConfig[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    sound.playTap();
    updateTicketSettings(ticketType, draft);
    setHasChanges(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    sound.playTap();
    resetTicketSettings(ticketType);
    setHasChanges(false);
  };

  const handleTestPrint = () => {
    sound.playTap();
    setTestNotice(true);
    setTimeout(() => setTestNotice(false), 2500);
  };

  const normalizedCurr = normalizeCurrencySymbol(currency);
  const formatSamplePrice = (val: number) =>
    formatCLP(val, normalizedCurr, { showSymbol: draft.showCurrencySymbol });
  const maxLen = Math.max(10, draft.maxProductNameLength || 23);
  const trunc = (s: string) => (s.length > maxLen ? `${s.slice(0, maxLen)}…` : s);

  const sampleItems = [
    { qty: 1, name: 'Pisco Sour Peruano', price: 5900 },
    { qty: 1, name: 'Ceviche Mixto', price: 15500 },
    { qty: 1, name: 'Lomo Saltado', price: 15800 },
  ];
  const sampleSubtotal = 37200;
  const sampleTip = draft.suggestTip ? Math.round((sampleSubtotal * (draft.tipPercentage || 10)) / 100) : 0;
  const sampleTotal = sampleSubtotal + sampleTip;

  return (
    <div className="mt-4 space-y-4">
      {/* Header Toolbar */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div>
          <h2 className="text-lg font-black tracking-tight">Personalización de tickets</h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Configura el diseño, ancho de papel y datos visibles en precuentas y comandas térmicas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-1">
              <Check className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
          {testNotice && (
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mr-1">
              Enviando prueba ({draft.paperWidth})...
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            onClick={handleTestPrint}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isLight
                ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200'
                : 'bg-orange-950/50 hover:bg-orange-900/60 text-orange-300 border border-orange-800/60'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir prueba</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              hasChanges
                ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-sm'
                : isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Main Split Editor + Live Thermal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT EDITOR */}
        <div className={`lg:col-span-7 rounded-xl border p-4 sm:p-5 space-y-5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Precuenta / Comanda Segmented Switch */}
          <div className={`inline-flex p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => { sound.playTap(); setTicketType('precuenta'); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                ticketType === 'precuenta'
                  ? 'bg-slate-900 text-white dark:bg-orange-600 shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Precuenta
            </button>
            <button
              type="button"
              onClick={() => { sound.playTap(); setTicketType('comanda'); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                ticketType === 'comanda'
                  ? 'bg-slate-900 text-white dark:bg-orange-600 shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Comanda
            </button>
          </div>

          {/* Subtabs: Contenido | Formato | Impresión */}
          <div className={`flex items-center gap-6 border-b ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            {[
              { id: 'contenido', label: 'Contenido' },
              { id: 'formato', label: 'Formato' },
              { id: 'impresion', label: 'Impresión' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { sound.playTap(); setSubTab(tab.id as typeof subTab); }}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  subTab === tab.id
                    ? 'border-slate-900 text-slate-900 dark:border-orange-500 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SUBTAB 1: CONTENIDO */}
          {subTab === 'contenido' && (
            <div className="space-y-5">
              {/* Encabezado */}
              <div className="space-y-3">
                <h3 className="text-sm font-black">Encabezado</h3>

                {ticketType === 'precuenta' && (
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-xs font-semibold">Imprimir logo</span>
                    <button
                      type="button"
                      onClick={() => updateField('printLogo', !draft.printLogo)}
                      className={`w-10 h-5.5 rounded-full transition-colors p-0.5 cursor-pointer ${
                        draft.printLogo ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                        draft.printLogo ? 'translate-x-4.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                )}

                <div>
                  <label className={`text-[11px] font-bold block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Texto de encabezado
                  </label>
                  <textarea
                    rows={3}
                    value={draft.headerText}
                    onChange={e => updateField('headerText', e.target.value)}
                    placeholder={ticketType === 'precuenta' ? 'PRE-CUENTA' : 'Texto superior en comanda...'}
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Cuerpo */}
              <div className={`space-y-4 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <h3 className="text-sm font-black">Cuerpo</h3>

                {ticketType === 'precuenta' && (
                  <>
                    <label className="flex items-center justify-between gap-4 cursor-pointer">
                      <span className="text-xs font-semibold">Mostrar símbolo de moneda</span>
                      <button
                        type="button"
                        onClick={() => updateField('showCurrencySymbol', !draft.showCurrencySymbol)}
                        className={`w-10 h-5.5 rounded-full transition-colors p-0.5 cursor-pointer ${
                          draft.showCurrencySymbol ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                          draft.showCurrencySymbol ? 'translate-x-4.5' : 'translate-x-0'
                        }`} />
                      </button>
                    </label>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold">ID de venta</span>
                      <select
                        value={draft.saleIdFormat}
                        onChange={e => updateField('saleIdFormat', e.target.value as TicketTemplateConfig['saleIdFormat'])}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      >
                        <option value="last4">Incluir los últimos 4 dígitos</option>
                        <option value="full">Incluir código completo</option>
                        <option value="none">No mostrar ID</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold">Largo máximo del nombre de producto</div>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Cuántos caracteres se muestran antes de cortar (por defecto: 23).
                        </p>
                      </div>
                      <div className="w-24 shrink-0">
                        <label className="text-[10px] text-slate-400 block">Caracteres</label>
                        <input
                          type="number"
                          min={10}
                          max={48}
                          value={draft.maxProductNameLength}
                          onChange={e => updateField('maxProductNameLength', Number(e.target.value) || 23)}
                          className={`w-full rounded-lg border px-2.5 py-1 text-xs font-bold tabular-nums text-right ${
                            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                          }`}
                        />
                      </div>
                    </div>

                    <label className="flex items-center justify-between gap-4 cursor-pointer">
                      <div>
                        <div className="text-xs font-semibold">Sugerir propina</div>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Se imprime como línea sugerida antes del total ({draft.tipPercentage}%).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('suggestTip', !draft.suggestTip)}
                        className={`w-10 h-5.5 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                          draft.suggestTip ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                          draft.suggestTip ? 'translate-x-4.5' : 'translate-x-0'
                        }`} />
                      </button>
                    </label>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.showTable}
                      onChange={e => updateField('showTable', e.target.checked)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <span>Mostrar Mesa / Salón</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.showWaiter}
                      onChange={e => updateField('showWaiter', e.target.checked)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <span>Mostrar Camarero</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.showTime}
                      onChange={e => updateField('showTime', e.target.checked)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <span>Mostrar Fecha y Hora</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.showDiners}
                      onChange={e => updateField('showDiners', e.target.checked)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <span>Mostrar Comensales</span>
                  </label>
                </div>
              </div>

              {/* Pie */}
              <div className={`space-y-2 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <h3 className="text-sm font-black">Pie</h3>
                <label className={`text-[11px] font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Texto de pie
                </label>
                <textarea
                  rows={3}
                  value={draft.footerText}
                  onChange={e => updateField('footerText', e.target.value)}
                  placeholder="Mensaje al pie del ticket..."
                  className={`w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>
          )}

          {/* SUBTAB 2: FORMATO */}
          {subTab === 'formato' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-2">Tamaño de letra</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'Compacto' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'large', label: 'Grande (Cocina)' },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => updateField('fontSize', f.id as TicketTemplateConfig['fontSize'])}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer ${
                        draft.fontSize === f.id
                          ? 'bg-orange-500 text-white border-orange-500'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {ticketType === 'precuenta' && (
                <div className="flex items-center justify-between gap-4 pt-2">
                  <div>
                    <div className="text-xs font-bold">Porcentaje de propina sugerida (%)</div>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Se calcula sobre el subtotal neto del pedido.
                    </p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={draft.tipPercentage}
                    onChange={e => updateField('tipPercentage', Number(e.target.value) || 0)}
                    className={`w-20 rounded-lg border px-2.5 py-1.5 text-xs font-bold tabular-nums text-right ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              )}

              <label className="flex items-center justify-between gap-4 cursor-pointer pt-2">
                <span className="text-xs font-semibold">Mostrar desglose Subtotal e IVA</span>
                <input
                  type="checkbox"
                  checked={draft.showSubtotalTax}
                  onChange={e => updateField('showSubtotalTax', e.target.checked)}
                  className="accent-orange-500 w-4 h-4"
                />
              </label>
            </div>
          )}

          {/* SUBTAB 3: IMPRESIÓN */}
          {subTab === 'impresion' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold">Impresión automática</div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Enviar a impresora al confirmar comanda o solicitar cuenta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('autoPrint', !draft.autoPrint)}
                  className={`w-10 h-5.5 rounded-full transition-colors p-0.5 cursor-pointer ${
                    draft.autoPrint ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                    draft.autoPrint ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold">Área de impresión predeterminada</span>
                <select
                  value={draft.printerAreaId || ''}
                  onChange={e => updateField('printerAreaId', e.target.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {printAreas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} ({area.printerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold">Cantidad de copias</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={draft.copies}
                  onChange={e => updateField('copies', Math.max(1, Number(e.target.value) || 1))}
                  className={`w-20 rounded-lg border px-2.5 py-1.5 text-xs font-bold tabular-nums text-right ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT LIVE THERMAL PREVIEW */}
        <div className={`lg:col-span-5 rounded-xl border p-5 flex flex-col items-center space-y-4 ${
          isLight ? 'bg-slate-200/75 border-slate-300' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black">
                {ticketType === 'precuenta' ? 'Precuenta' : 'Comanda'}
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {ticketType === 'precuenta'
                  ? 'Se entrega al cliente al pedir la cuenta'
                  : 'Va a cocina o barra para preparar el pedido'}
              </div>
            </div>

            <div className={`inline-flex p-1 rounded-lg border ${
              isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}>
              {(['58mm', '80mm'] as const).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateField('paperWidth', w)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    draft.paperWidth === w
                      ? 'bg-slate-900 text-white dark:bg-orange-600'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Printer Slot + Thermal Paper */}
          <div className="w-full flex flex-col items-center">
            <div className="w-64 h-3 bg-slate-800 rounded-t-lg border-b-4 border-slate-950" />
            <div
              className={`bg-white text-slate-900 font-mono p-4 shadow-md border-x border-b border-slate-300 transition-all ${
                draft.paperWidth === '58mm' ? 'w-[225px]' : 'w-[285px]'
              } ${
                draft.fontSize === 'compact' ? 'text-[10px]' : draft.fontSize === 'large' ? 'text-[12px]' : 'text-[11px]'
              }`}
            >
              {ticketType === 'precuenta' ? (
                <div className="space-y-2.5">
                  {draft.printLogo && (
                    <div className="w-9 h-9 mx-auto rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                  )}
                  <div className="text-center font-bold text-sm uppercase tracking-wide whitespace-pre-line">
                    {draft.headerText || restaurantBrand.name}
                  </div>
                  <div className="text-[10px] space-y-0.5 text-slate-700">
                    {draft.showTable && <div>Mesa: 10</div>}
                    {draft.showDiners && <div>Personas: 2</div>}
                    {draft.saleIdFormat !== 'none' && (
                      <div>ID: {draft.saleIdFormat === 'last4' ? '#3456' : 'T-2026-3456'}</div>
                    )}
                    {draft.showTime && <div>Fecha: 13/07/26 11:35:51</div>}
                    {draft.showWaiter && <div>Camarero: Ana</div>}
                  </div>

                  <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[10px]">
                    {sampleItems.map((it, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="truncate">{it.qty}  {trunc(it.name)}</span>
                        <span className="tabular-nums shrink-0">{formatSamplePrice(it.price)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 border-t border-dotted border-slate-300">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatSamplePrice(sampleSubtotal)}</span>
                    </div>
                    {draft.suggestTip && (
                      <>
                        <div className="flex justify-between pt-1">
                          <span>PROPINA SUGERIDA {draft.tipPercentage}%</span>
                          <span className="tabular-nums">{formatSamplePrice(sampleTip)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal con propina</span>
                          <span className="tabular-nums">{formatSamplePrice(sampleTotal)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-baseline font-black text-sm pt-2 border-t border-slate-900">
                    <span>Total</span>
                    <span className="tabular-nums">{formatSamplePrice(sampleTotal)}</span>
                  </div>

                  {draft.footerText && (
                    <div className="text-center text-[10px] pt-2 border-t border-dashed border-slate-300 whitespace-pre-line text-slate-700">
                      {draft.footerText}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {draft.headerText && (
                    <div className="text-center font-bold text-xs uppercase whitespace-pre-line">
                      {draft.headerText}
                    </div>
                  )}
                  <div className="text-[10px] space-y-0.5 text-slate-700">
                    {draft.showTable && <div className="font-bold">-Mesa 10 (Salón)-</div>}
                    <div>Etiqueta 12</div>
                    {draft.showTime && <div>13/07/26 11:35:51</div>}
                    {draft.showWaiter && <div>Camarero: Ana</div>}
                    {draft.showDiners && <div>Personas: 2</div>}
                  </div>
                  <div className="border-t border-dashed border-slate-300 pt-2 space-y-2 text-[11px] font-bold">
                    <div>1 {trunc('Lomo Saltado')}<div className="pl-2 font-normal text-[10px]">- Sin cebolla</div></div>
                    <div>1 {trunc('Ceviche Mixto')}<div className="pl-2 font-normal text-[10px]">- Poco picante</div></div>
                  </div>
                  {draft.footerText && (
                    <div className="text-center text-[10px] pt-2 border-t border-dashed border-slate-300 whitespace-pre-line text-slate-600">
                      {draft.footerText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className={`text-[11px] text-center ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            La impresión real puede variar según tu impresora térmica ESC/POS.
          </p>
        </div>
      </div>
    </div>
  );
};
