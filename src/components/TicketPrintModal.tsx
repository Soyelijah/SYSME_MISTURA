import React from 'react';
import { usePOS } from '../context/POSContext';
import { Printer, X, Download, QrCode, ReceiptText } from 'lucide-react';

export const TicketPrintModal: React.FC = () => {
  const { printableTicket, setPrintableTicket, restaurantSettings, themeMode, currency } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  if (!printableTicket) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPreticket = printableTicket.preticketPrinted && printableTicket.status !== 'closed';

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
            <span className="text-xs sm:text-sm font-black">
              {isPreticket ? 'Vista Previa Pre-Ticket (Cuenta)' : 'Ticket Fiscal / Factura Simplificada'}
            </span>
          </div>
          <button
            onClick={() => setPrintableTicket(null)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Ticket Paper Emulation */}
        <div className="flex-1 overflow-y-auto bg-white text-slate-950 p-6 rounded-2xl font-mono text-xs shadow-inner space-y-3 leading-tight border-2 border-slate-300">
          {/* Header */}
          <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-slate-400">
            <h2 className="text-base font-black tracking-wider uppercase">{restaurantSettings.name || 'Dy Pos PRO Restaurant'}</h2>
            <p className="text-[11px] font-bold text-slate-800">{restaurantSettings.businessName || 'Dy Pos Gastronomía & Hostelería'}</p>
            <p className="text-[10px] text-slate-700">NIF / CIF: {restaurantSettings.cif || 'B-87654321'}</p>
            <p className="text-[10px] text-slate-700">{restaurantSettings.address || 'Av. Principal Gastronómica 101'}</p>
            <p className="text-[10px] text-slate-700">Tel: {restaurantSettings.phone || '+34 912 345 678'}</p>
          </div>

          {/* Ticket Meta */}
          <div className="space-y-0.5 text-[11px] pb-2 border-b-2 border-dashed border-slate-400">
            <div className="flex justify-between font-black text-slate-950">
              <span>{isPreticket ? '*** PRE-TICKET / CUENTA ***' : 'FACTURA SIMPLIFICADA'}</span>
              <span>{printableTicket.number}</span>
            </div>
            <div className="flex justify-between text-slate-800">
              <span>Fecha: {printableTicket.date}</span>
              <span>Hora: {printableTicket.time}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-semibold">
              <span>Mesa: {printableTicket.tableName}</span>
              <span>Comensales: {printableTicket.diners}</span>
            </div>
            <div className="flex justify-between text-slate-800">
              <span>Atendido por: {printableTicket.waiterName}</span>
              <span>Tarifa: {printableTicket.rateName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 py-1 text-[11px]">
            <div className="grid grid-cols-12 font-black pb-1 border-b-2 border-slate-900 text-slate-950">
              <span className="col-span-2">Uds</span>
              <span className="col-span-6">Descripción</span>
              <span className="col-span-2 text-right">PVP</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {printableTicket.items.map((line) => (
              <div key={line.id} className="grid grid-cols-12 py-0.5 border-b border-slate-100">
                <span className="col-span-2 font-black text-slate-950">{line.quantity}x</span>
                <div className="col-span-6">
                  <span className="font-bold text-slate-950">{line.productName}</span>
                  {line.selectedOption && (
                    <span className="block text-[10px] text-slate-600 italic font-medium">({line.selectedOption})</span>
                  )}
                  {line.kitchenNotes && (
                    <span className="block text-[10px] text-slate-600 italic font-medium">[{line.kitchenNotes}]</span>
                  )}
                </div>
                <span className="col-span-2 text-right text-slate-800 font-semibold">{line.unitPrice.toFixed(2)}</span>
                <span className="col-span-2 text-right font-black text-slate-950">{line.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals & Taxes */}
          <div className="pt-2 border-t-2 border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-800">
              <span>Base Imponible:</span>
              <span className="font-bold">{printableTicket.subtotal.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-slate-800">
              <span>IVA Incluido (10% / 21%):</span>
              <span className="font-bold">{printableTicket.taxTotal.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-1.5 border-t-2 border-slate-950 text-slate-950">
              <span>TOTAL FACTURA:</span>
              <span className="text-base font-black">{printableTicket.total.toFixed(2)} {currency}</span>
            </div>

            {printableTicket.paymentMethod && (
              <div className="pt-2 text-[10px] text-slate-800 border-t border-dotted border-slate-300 space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>Forma de Pago:</span>
                  <span className="uppercase">{printableTicket.paymentMethod === 'cash' ? 'Efectivo' : printableTicket.paymentMethod === 'card' ? 'Tarjeta TPV' : printableTicket.paymentMethod}</span>
                </div>
                {printableTicket.paymentDetails?.cashGiven && (
                  <>
                    <div className="flex justify-between">
                      <span>Entregado en Mano:</span>
                      <span className="font-bold">{printableTicket.paymentDetails.cashGiven.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-950">
                      <span>Cambio devuelto:</span>
                      <span>{(printableTicket.paymentDetails.change || 0).toFixed(2)} {currency}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-3 border-t-2 border-dashed border-slate-400 space-y-1 text-[10px] text-slate-700">
            <p className="font-black text-slate-950 text-xs">¡GRACIAS POR SU VISITA!</p>
            <p className="font-medium">IVA incluido según normativa tributaria vigente.</p>
            <p className="text-[9px] font-mono font-bold text-slate-500 pt-1">Software: Dy Pos PRO 2026</p>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className={`flex items-center justify-between gap-2 pt-2 border-t ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <button
            onClick={() => setPrintableTicket(null)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket (ESC/POS 80mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

