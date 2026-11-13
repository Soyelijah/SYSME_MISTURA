import React from 'react';
import { usePOS } from '../context/POSContext';
import { Printer, X, ReceiptText, Utensils } from 'lucide-react';
import { formatCLP, roundCLP, normalizeCurrencySymbol } from '../utils/currency';

export const TicketPrintModal: React.FC = () => {
  const { printableTicket, setPrintableTicket, restaurantBrand, themeMode, currency, ticketSettings } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  if (!printableTicket) return null;

  const tpl = ticketSettings.precuenta;
  const isPreticket = printableTicket.preticketPrinted && printableTicket.status !== 'closed';
  const showSym = tpl.showCurrencySymbol;
  const normalizedCurr = normalizeCurrencySymbol(currency);
  const formatTicketAmount = (val: number) => formatCLP(val, normalizedCurr, { showSymbol: showSym });
  const maxLen = tpl.maxProductNameLength || 23;
  const tipPct = tpl.tipPercentage || 10;
  const suggestedTip = tpl.suggestTip ? roundCLP(printableTicket.total * (tipPct / 100)) : 0;
  const totalWithTip = roundCLP(printableTicket.total + suggestedTip);

  const formattedSaleId =
    tpl.saleIdFormat === 'none'
      ? ''
      : tpl.saleIdFormat === 'last4'
      ? `#${String(printableTicket.id).slice(-4)}`
      : printableTicket.number;

  const truncateName = (name: string) => {
    if (name.length <= maxLen) return name;
    return `${name.slice(0, maxLen)}…`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className={`border rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl flex flex-col max-h-[92vh] transition-colors ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/20'
          : 'bg-slate-900 border-slate-800 text-white shadow-black/80'
      }`}>
        {/* Modal Toolbar */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black block">
                {isPreticket ? 'Vista Previa Pre-Ticket (Cuenta)' : 'Ticket Fiscal / Factura Simplificada'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Formato térmico configurado: {tpl.paperWidth} • {tpl.copies} copia(s)
              </span>
            </div>
          </div>
          <button
            onClick={() => setPrintableTicket(null)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Ticket Paper Emulation */}
        <div className="flex-1 overflow-y-auto flex justify-center bg-slate-200/70 dark:bg-slate-950 p-4 rounded-2xl">
          <div
            id="thermal-receipt"
            className={`bg-white text-slate-950 p-5 rounded-xl font-mono shadow-lg space-y-3 leading-tight border border-slate-300 ${
              tpl.paperWidth === '58mm' ? 'w-[250px]' : 'w-full max-w-[330px]'
            } ${
              tpl.fontSize === 'compact' ? 'text-[10px]' : tpl.fontSize === 'large' ? 'text-[13px]' : 'text-xs'
            }`}
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-slate-400">
              {tpl.printLogo && (
                <div className="w-10 h-10 mx-auto rounded-xl bg-slate-900 text-white flex items-center justify-center mb-1">
                  <Utensils className="w-5 h-5" />
                </div>
              )}
              <h2 className="text-sm font-black tracking-wider uppercase">{restaurantBrand?.name || 'Dy Pos Gastrobar'}</h2>
              {tpl.headerText && (
                <p className="text-[11px] font-black uppercase tracking-wide whitespace-pre-line">{tpl.headerText}</p>
              )}
              <p className="text-[10px] text-slate-700">RUT / CIF: {restaurantBrand?.cif || '76.841.259-K'}</p>
              <p className="text-[10px] text-slate-700">{restaurantBrand?.address || 'Avenida Providencia 1208, Santiago'}</p>
              <p className="text-[10px] text-slate-700">Tel: {restaurantBrand?.phone || '+56 9 8765 4321'}</p>
            </div>

            {/* Ticket Meta */}
            <div className="space-y-0.5 text-[11px] pb-2 border-b-2 border-dashed border-slate-400">
              <div className="flex justify-between font-black text-slate-950">
                <span>{isPreticket ? '*** PRE-CUENTA ***' : 'COMPROBANTE'}</span>
                {formattedSaleId && <span>{formattedSaleId}</span>}
              </div>
              {tpl.showTime && (
                <div className="flex justify-between text-slate-800">
                  <span>Fecha: {printableTicket.date}</span>
                  <span>{printableTicket.time}</span>
                </div>
              )}
              {tpl.showTable && (
                <div className="flex justify-between text-slate-800 font-semibold">
                  <span>Mesa/Canal: {printableTicket.tableName}</span>
                  {tpl.showDiners && <span>Pers: {printableTicket.diners}</span>}
                </div>
              )}
              {printableTicket.customerName && (
                <div className="text-slate-800 font-semibold truncate">
                  Cliente: {printableTicket.customerName}
                </div>
              )}
              {tpl.showWaiter && (
                <div className="flex justify-between text-slate-800">
                  <span>Atiende: {printableTicket.waiterName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-1.5 py-1 text-[11px]">
              <div className="grid grid-cols-12 font-black pb-1 border-b-2 border-slate-900 text-slate-950">
                <span className="col-span-2">Cant</span>
                <span className="col-span-6">Descripción</span>
                <span className="col-span-4 text-right">Total</span>
              </div>

              {printableTicket.items.map((line) => (
                <div key={line.id} className="grid grid-cols-12 py-0.5 border-b border-slate-100">
                  <span className="col-span-2 font-black text-slate-950">{line.quantity}</span>
                  <div className="col-span-6">
                    <span className="font-bold text-slate-950">{truncateName(line.productName)}</span>
                    {line.selectedOption && (
                      <span className="block text-[9px] text-slate-600 italic">({line.selectedOption})</span>
                    )}
                    {line.kitchenNotes && (
                      <span className="block text-[9px] text-slate-600 italic">[{line.kitchenNotes}]</span>
                    )}
                  </div>
                  <span className="col-span-4 text-right font-black text-slate-950 tabular-nums">
                    {formatTicketAmount(line.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals & Taxes */}
            <div className="pt-2 border-t-2 border-dashed border-slate-400 space-y-1 text-[11px]">
              {tpl.showSubtotalTax && (
                <>
                  <div className="flex justify-between text-slate-800">
                    <span>Subtotal Neto:</span>
                    <span className="font-bold tabular-nums">{formatTicketAmount(printableTicket.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-800">
                    <span>IVA Incluido (19%):</span>
                    <span className="font-bold tabular-nums">{formatTicketAmount(printableTicket.taxTotal)}</span>
                  </div>
                </>
              )}

              {tpl.suggestTip && (
                <>
                  <div className="flex justify-between text-slate-800 pt-1">
                    <span>PROPINA SUGERIDA ({tipPct}%):</span>
                    <span className="font-bold tabular-nums">{formatTicketAmount(suggestedTip)}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-semibold">
                    <span>Subtotal con propina:</span>
                    <span className="tabular-nums">{formatTicketAmount(totalWithTip)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-sm font-black pt-1.5 border-t-2 border-slate-950 text-slate-950">
                <span>TOTAL:</span>
                <span className="text-base font-black tabular-nums">
                  {formatTicketAmount(tpl.suggestTip && isPreticket ? totalWithTip : printableTicket.total)}
                </span>
              </div>

              {printableTicket.paymentMethod && (
                <div className="pt-2 text-[10px] text-slate-800 border-t border-dotted border-slate-300 space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>Forma de Pago:</span>
                    <span className="uppercase">{printableTicket.paymentMethod === 'cash' ? 'Efectivo' : printableTicket.paymentMethod === 'card' ? 'Tarjeta / TPV' : printableTicket.paymentMethod}</span>
                  </div>
                  {printableTicket.paymentDetails?.cashGiven !== undefined && (
                    <>
                      <div className="flex justify-between">
                        <span>Entregado:</span>
                        <span className="font-bold tabular-nums">{formatTicketAmount(printableTicket.paymentDetails.cashGiven)}</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-950">
                        <span>Vuelto devuelto:</span>
                        <span className="tabular-nums">{formatTicketAmount(printableTicket.paymentDetails.change || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-3 border-t-2 border-dashed border-slate-400 space-y-1 text-[10px] text-slate-700">
              {tpl.footerText ? (
                <p className="font-semibold whitespace-pre-line">{tpl.footerText}</p>
              ) : (
                <p className="font-black text-slate-950 text-xs">¡GRACIAS POR SU VISITA!</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className={`flex items-center justify-between gap-2 pt-2 border-t ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <button
            onClick={() => setPrintableTicket(null)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket (ESC/POS {tpl.paperWidth})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
