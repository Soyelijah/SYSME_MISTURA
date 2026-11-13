import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { Sale, Product } from '../types';
import { sound } from '../utils/sound';
import { formatCLP, normalizeCurrencySymbol } from '../utils/currency';
import {
  Truck, ShoppingBag, Zap, Plus, Search, Clock, Phone, MapPin, User,
  ArrowRight, CreditCard, Check, X, ChevronRight, Utensils
} from 'lucide-react';

export const DeliveryAndCounterView: React.FC = () => {
  const {
    sales,
    products,
    categories,
    clients,
    waiters,
    customRoles,
    currency,
    themeMode,
    createChannelSale,
    updateDeliveryStatus,
    assignDriverToSale,
    setActiveSale,
    setIsPaymentModalOpen,
    setActiveView,
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const curr = normalizeCurrencySymbol(currency);

  const [channelTab, setChannelTab] = useState<'delivery' | 'mostrador' | 'express'>('delivery');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);

  // Express counter state
  const [expressSubTab, setExpressSubTab] = useState<'pedidos' | 'historial'>('pedidos');
  const [expressCategoryId, setExpressCategoryId] = useState<number | 'favorites'>('favorites');
  const [expressSearch, setExpressSearch] = useState<string>('');
  const [expressCart, setExpressCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [expressCustomerName, setExpressCustomerName] = useState<string>('');

  // New Order Form state (Delivery / Mostrador)
  const [newCustomerId, setNewCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newDriverId, setNewDriverId] = useState<string>('');
  const [newDeliveryFee, setNewDeliveryFee] = useState<string>('2500');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newOrderCart, setNewOrderCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [newProdSearch, setNewProdSearch] = useState<string>('');

  // Drivers: staff assigned to a custom role with isDeliveryDriver=true or baseRole='delivery', fallback to all active staff
  const driverCandidates = useMemo(() => {
    const driverRoleIds = new Set(customRoles.filter(r => r.isDeliveryDriver).map(r => r.id));
    const specific = waiters.filter(
      w => w.active !== false && (w.role === 'delivery' || (w.customRoleId && driverRoleIds.has(w.customRoleId)))
    );
    return specific.length > 0 ? specific : waiters.filter(w => w.active !== false);
  }, [waiters, customRoles]);

  // Channel filtered sales
  const deliverySales = sales.filter(s => s.orderType === 'delivery' && s.status === 'open');
  const deliveryPreparing = deliverySales.filter(s => !s.deliveryStatus || s.deliveryStatus === 'preparing');
  const deliveryReady = deliverySales.filter(s => s.deliveryStatus === 'ready');
  const deliveryDispatched = deliverySales.filter(s => s.deliveryStatus === 'dispatched');

  const mostradorOpen = sales.filter(s => s.orderType === 'mostrador' && s.status === 'open');
  const mostradorInCourse = mostradorOpen.filter(s => !s.deliveryStatus || s.deliveryStatus === 'preparing');
  const mostradorToDeliver = mostradorOpen.filter(s => s.deliveryStatus === 'ready' || s.deliveryStatus === 'dispatched');
  const mostradorClosed = sales
    .filter(s => (s.orderType === 'mostrador' || s.orderType === 'express') && s.status === 'closed')
    .slice(0, 5);

  const selectedOrder = sales.find(s => s.id === selectedOrderId) || null;

  const formatMoney = (amount: number) => formatCLP(amount, currency);

  const handleSelectExistingClient = (clientId: string) => {
    setNewCustomerId(clientId);
    const cli = clients.find(c => c.id === clientId);
    if (cli) {
      setNewCustomerName(cli.name);
      setNewPhone(cli.phone || '');
      setNewAddress(cli.address || '');
    }
  };

  const handleAddProductToNewOrder = (prod: Product) => {
    sound.playTap();
    setNewOrderCart(prev => {
      const idx = prev.findIndex(i => i.product.id === prod.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;
    sound.playTap();

    const driverObj = waiters.find(w => String(w.id) === newDriverId);
    const fee = channelTab === 'delivery' ? Math.max(0, Number(newDeliveryFee) || 0) : 0;

    const created = createChannelSale({
      orderType: channelTab === 'delivery' ? 'delivery' : 'mostrador',
      customerId: newCustomerId || undefined,
      customerName: newCustomerName.trim(),
      deliveryPhone: newPhone.trim() || undefined,
      deliveryAddress: channelTab === 'delivery' ? newAddress.trim() : undefined,
      driverId: driverObj?.id,
      driverName: driverObj?.name,
      deliveryFee: fee,
      notes: newNotes.trim() || undefined,
      items: newOrderCart,
      openInPos: newOrderCart.length === 0,
    });

    setSelectedOrderId(created.id);
    setIsCreatingOrder(false);
    setNewCustomerId('');
    setNewCustomerName('');
    setNewPhone('');
    setNewAddress('');
    setNewNotes('');
    setNewOrderCart([]);
  };

  const handleChargeOrder = (sale: Sale) => {
    sound.playTap();
    setActiveSale(sale);
    setIsPaymentModalOpen(true);
  };

  // Express products list
  const expressProducts = useMemo(() => {
    let list = products.filter(p => p.available !== false);
    if (expressSearch.trim()) {
      const q = expressSearch.toLowerCase();
      return list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    if (expressCategoryId === 'favorites') {
      return list.slice(0, 12);
    }
    return list.filter(p => p.categoryId === expressCategoryId);
  }, [products, expressCategoryId, expressSearch]);

  const expressCartTotal = expressCart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);

  const handleConfirmExpressOrder = (chargeNow: boolean) => {
    if (expressCart.length === 0) return;
    sound.playTap();
    const created = createChannelSale({
      orderType: 'express',
      customerName: expressCustomerName.trim() || 'Mostrador Express',
      items: expressCart,
      openInPos: false,
    });
    setExpressCart([]);
    setExpressCustomerName('');
    if (chargeNow) {
      setActiveSale(created);
      setIsPaymentModalOpen(true);
    } else {
      setSelectedOrderId(created.id);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* TOP SUB-BAR: MESAS SHORTCUT | MOSTRADOR | DELIVERY | MOSTRADOR EXPRESS */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isLight ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-900 text-white border-slate-800'
      }`}>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => { sound.playTap(); setActiveView('floor'); }}
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700/70 transition-colors cursor-pointer shrink-0"
          >
            Mesas
          </button>
          <button
            type="button"
            onClick={() => { sound.playTap(); setChannelTab('mostrador'); setIsCreatingOrder(false); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              channelTab === 'mostrador'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Mostrador</span>
            {mostradorOpen.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] tabular-nums">{mostradorOpen.length}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => { sound.playTap(); setChannelTab('delivery'); setIsCreatingOrder(false); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              channelTab === 'delivery'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery</span>
            {deliverySales.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] tabular-nums">{deliverySales.length}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => { sound.playTap(); setChannelTab('express'); setIsCreatingOrder(false); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              channelTab === 'express'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Mostrador express</span>
          </button>
        </div>

        {channelTab !== 'express' && (
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setIsCreatingOrder(true);
              setSelectedOrderId(null);
            }}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Pedido</span>
          </button>
        )}
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* ===================== TAB: DELIVERY ===================== */}
          {channelTab === 'delivery' && (
            <>
              {/* 1. EN PREPARACIÓN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-wider uppercase text-orange-600 dark:text-orange-400">
                    EN PREPARACIÓN ({deliveryPreparing.length})
                  </h3>
                </div>
                <div className={`rounded-xl border overflow-x-auto ${
                  isLight ? 'bg-white border-orange-200' : 'bg-slate-900 border-orange-900/50'
                }`}>
                  <table className="w-full text-left text-xs min-w-[680px]">
                    <thead className={isLight ? 'bg-orange-100 text-orange-900' : 'bg-orange-950/60 text-orange-200'}>
                      <tr>
                        <th className="px-3 py-2.5 font-bold">ID</th>
                        <th className="px-3 py-2.5 font-bold">Hora Inicio</th>
                        <th className="px-3 py-2.5 font-bold">Dirección</th>
                        <th className="px-3 py-2.5 font-bold">Teléfono</th>
                        <th className="px-3 py-2.5 font-bold">Cliente</th>
                        <th className="px-3 py-2.5 font-bold">Repartidor</th>
                        <th className="px-3 py-2.5 font-bold text-right">Total</th>
                        <th className="px-3 py-2.5 font-bold text-right">Avanzar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {deliveryPreparing.map(order => (
                        <tr
                          key={order.id}
                          onClick={() => { setSelectedOrderId(order.id); setIsCreatingOrder(false); }}
                          className={`cursor-pointer transition-colors ${
                            selectedOrderId === order.id ? 'bg-orange-50 dark:bg-orange-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="px-3 py-2.5 font-mono font-bold">{order.number}</td>
                          <td className="px-3 py-2.5 tabular-nums">{order.time}</td>
                          <td className="px-3 py-2.5 max-w-[180px] truncate">{order.deliveryAddress || 'Sin dirección'}</td>
                          <td className="px-3 py-2.5 tabular-nums">{order.deliveryPhone || '—'}</td>
                          <td className="px-3 py-2.5 font-semibold">{order.customerName || 'Cliente'}</td>
                          <td className="px-3 py-2.5">{order.driverName || 'Sin asignar'}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold tabular-nums">{formatMoney(order.total)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                sound.playTap();
                                updateDeliveryStatus(order.id, 'ready');
                              }}
                              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Listo
                            </button>
                          </td>
                        </tr>
                      ))}
                      {deliveryPreparing.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                            No hay pedidos en preparación.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. LISTO PARA ENTREGAR */}
              <div className="space-y-2">
                <h3 className="text-xs font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">
                  LISTO PARA ENTREGAR ({deliveryReady.length})
                </h3>
                <div className={`rounded-xl border overflow-x-auto ${
                  isLight ? 'bg-white border-blue-200' : 'bg-slate-900 border-blue-900/50'
                }`}>
                  <table className="w-full text-left text-xs min-w-[680px]">
                    <thead className={isLight ? 'bg-blue-100 text-blue-900' : 'bg-blue-950/60 text-blue-200'}>
                      <tr>
                        <th className="px-3 py-2.5 font-bold">ID</th>
                        <th className="px-3 py-2.5 font-bold">Hora Inicio</th>
                        <th className="px-3 py-2.5 font-bold">Dirección</th>
                        <th className="px-3 py-2.5 font-bold">Teléfono</th>
                        <th className="px-3 py-2.5 font-bold">Cliente</th>
                        <th className="px-3 py-2.5 font-bold">Repartidor</th>
                        <th className="px-3 py-2.5 font-bold text-right">Total</th>
                        <th className="px-3 py-2.5 font-bold text-right">Despachar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {deliveryReady.map(order => (
                        <tr
                          key={order.id}
                          onClick={() => { setSelectedOrderId(order.id); setIsCreatingOrder(false); }}
                          className={`cursor-pointer transition-colors ${
                            selectedOrderId === order.id ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="px-3 py-2.5 font-mono font-bold">{order.number}</td>
                          <td className="px-3 py-2.5 tabular-nums">{order.time}</td>
                          <td className="px-3 py-2.5 max-w-[180px] truncate">{order.deliveryAddress || 'Sin dirección'}</td>
                          <td className="px-3 py-2.5 tabular-nums">{order.deliveryPhone || '—'}</td>
                          <td className="px-3 py-2.5 font-semibold">{order.customerName || 'Cliente'}</td>
                          <td className="px-3 py-2.5">{order.driverName || 'Sin asignar'}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold tabular-nums">{formatMoney(order.total)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                sound.playTap();
                                updateDeliveryStatus(order.id, 'dispatched');
                              }}
                              className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                            >
                              Enviar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {deliveryReady.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                            No hay pedidos listos para entregar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. ENVIADOS */}
              <div className="space-y-2">
                <h3 className="text-xs font-black tracking-wider uppercase text-amber-600 dark:text-amber-400">
                  ENVIADOS ({deliveryDispatched.length})
                </h3>
                <div className={`rounded-xl border overflow-x-auto ${
                  isLight ? 'bg-white border-amber-200' : 'bg-slate-900 border-amber-900/50'
                }`}>
                  <table className="w-full text-left text-xs min-w-[680px]">
                    <thead className={isLight ? 'bg-amber-100 text-amber-900' : 'bg-amber-950/60 text-amber-200'}>
                      <tr>
                        <th className="px-3 py-2.5 font-bold">ID</th>
                        <th className="px-3 py-2.5 font-bold">Hora Inicio</th>
                        <th className="px-3 py-2.5 font-bold">Dirección</th>
                        <th className="px-3 py-2.5 font-bold">Teléfono</th>
                        <th className="px-3 py-2.5 font-bold">Cliente</th>
                        <th className="px-3 py-2.5 font-bold">Repartidor</th>
                        <th className="px-3 py-2.5 font-bold text-right">Total</th>
                        <th className="px-3 py-2.5 font-bold text-right">Cobro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {deliveryDispatched.map(order => (
                        <tr
                          key={order.id}
                          onClick={() => { setSelectedOrderId(order.id); setIsCreatingOrder(false); }}
                          className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-3 py-2.5 font-mono font-bold">{order.number}</td>
                          <td className="px-3 py-2.5 tabular-nums">{order.time}</td>
                          <td className="px-3 py-2.5 max-w-[180px] truncate">{order.deliveryAddress || 'Sin dirección'}</td>
                          <td className="px-3 py-2.5 tabular-nums">{order.deliveryPhone || '—'}</td>
                          <td className="px-3 py-2.5 font-semibold">{order.customerName || 'Cliente'}</td>
                          <td className="px-3 py-2.5">{order.driverName || 'Sin asignar'}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold tabular-nums">{formatMoney(order.total)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleChargeOrder(order);
                              }}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Cobrar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {deliveryDispatched.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                            No hay pedidos enviados en ruta.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ===================== TAB: MOSTRADOR ===================== */}
          {channelTab === 'mostrador' && (
            <>
              {[
                { title: `EN CURSO (${mostradorInCourse.length})`, rows: mostradorInCourse, empty: 'Sin ventas en curso.', actionLabel: 'Listo', nextStatus: 'ready' as const },
                { title: `A ENTREGAR (${mostradorToDeliver.length})`, rows: mostradorToDeliver, empty: 'Sin ventas por entregar.', actionLabel: 'Cobrar', nextStatus: null },
                { title: 'CERRADAS (ÚLTIMAS 5)', rows: mostradorClosed, empty: 'Sin ventas cerradas recientes.', actionLabel: null, nextStatus: null },
              ].map(section => (
                <div key={section.title} className="space-y-2">
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-600 dark:text-slate-300">
                    {section.title}
                  </h3>
                  <div className={`rounded-xl border overflow-x-auto ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <table className="w-full text-left text-xs min-w-[520px]">
                      <thead className={isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}>
                        <tr>
                          <th className="px-3 py-2.5 font-bold">ID</th>
                          <th className="px-3 py-2.5 font-bold">Hora Inicio</th>
                          <th className="px-3 py-2.5 font-bold">Estado</th>
                          <th className="px-3 py-2.5 font-bold">Cliente</th>
                          <th className="px-3 py-2.5 font-bold text-right">Total</th>
                          {section.actionLabel && <th className="px-3 py-2.5 font-bold text-right">Acción</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {section.rows.map(order => (
                          <tr
                            key={order.id}
                            onClick={() => { setSelectedOrderId(order.id); setIsCreatingOrder(false); }}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="px-3 py-2.5 font-mono font-bold">{order.number}</td>
                            <td className="px-3 py-2.5 tabular-nums">{order.time}</td>
                            <td className="px-3 py-2.5">
                              {order.status === 'closed'
                                ? 'Cerrada'
                                : order.deliveryStatus === 'ready'
                                ? 'Listo para retiro'
                                : 'En preparación'}
                            </td>
                            <td className="px-3 py-2.5 font-semibold">{order.customerName || 'Mostrador'}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold tabular-nums">{formatMoney(order.total)}</td>
                            {section.actionLabel && (
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (section.nextStatus) {
                                      updateDeliveryStatus(order.id, section.nextStatus);
                                    } else {
                                      handleChargeOrder(order);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  {section.actionLabel}
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                        {section.rows.length === 0 && (
                          <tr>
                            <td colSpan={section.actionLabel ? 6 : 5} className="px-4 py-6 text-center text-slate-400">
                              {section.empty}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ===================== TAB: MOSTRADOR EXPRESS ===================== */}
          {channelTab === 'express' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className={`inline-flex p-1 rounded-xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <button
                    type="button"
                    onClick={() => setExpressSubTab('pedidos')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      expressSubTab === 'pedidos'
                        ? 'bg-slate-800 text-white dark:bg-orange-600'
                        : 'text-slate-500'
                    }`}
                  >
                    Pedidos
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpressSubTab('historial')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      expressSubTab === 'historial'
                        ? 'bg-slate-800 text-white dark:bg-orange-600'
                        : 'text-slate-500'
                    }`}
                  >
                    Historial ({mostradorClosed.length})
                  </button>
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={expressSearch}
                    onChange={e => setExpressSearch(e.target.value)}
                    placeholder="Buscar producto o código"
                    className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {expressSubTab === 'pedidos' ? (
                <>
                  {/* Category Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => { setExpressCategoryId('favorites'); setExpressSearch(''); }}
                      className={`shrink-0 px-4 py-2.5 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                        expressCategoryId === 'favorites' && !expressSearch
                          ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      Favoritos
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setExpressCategoryId(cat.id); setExpressSearch(''); }}
                        className={`shrink-0 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          expressCategoryId === cat.id && !expressSearch
                            ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Quick Product Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {expressProducts.map((prod, idx) => (
                      <button
                        key={prod.id}
                        type="button"
                        disabled={prod.stock <= 0}
                        onClick={() => {
                          sound.playTap();
                          setExpressCart(prev => {
                            const found = prev.findIndex(i => i.product.id === prod.id);
                            if (found > -1) {
                              const next = [...prev];
                              next[found] = { ...next[found], quantity: next[found].quantity + 1 };
                              return next;
                            }
                            return [...prev, { product: prod, quantity: 1 }];
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-95 flex flex-col justify-between min-h-[84px] ${
                          prod.stock <= 0
                            ? 'opacity-40 cursor-not-allowed'
                            : isLight
                            ? 'bg-white hover:border-orange-400 border-slate-200'
                            : 'bg-slate-900 hover:border-orange-500 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold line-clamp-2">{prod.name}</div>
                          <div className="text-xs font-mono font-black text-orange-600 dark:text-orange-400 tabular-nums mt-1">
                            {formatMoney(prod.price)}
                          </div>
                        </div>
                        <span className="mt-2 inline-block self-start text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {idx + 10}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className={`rounded-xl border overflow-hidden ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead className={isLight ? 'bg-slate-100' : 'bg-slate-800'}>
                      <tr>
                        <th className="px-4 py-2.5 font-bold">ID</th>
                        <th className="px-4 py-2.5 font-bold">Hora</th>
                        <th className="px-4 py-2.5 font-bold">Cliente</th>
                        <th className="px-4 py-2.5 font-bold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {mostradorClosed.map(s => (
                        <tr key={s.id}>
                          <td className="px-4 py-2.5 font-mono font-bold">{s.number}</td>
                          <td className="px-4 py-2.5 tabular-nums">{s.time}</td>
                          <td className="px-4 py-2.5">{s.customerName || s.tableName}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums">{formatMoney(s.total)}</td>
                        </tr>
                      ))}
                      {mostradorClosed.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                            Sin historial reciente de mostrador.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CREATE ORDER / EXPRESS CART / ORDER INSPECTOR */}
        <aside className={`w-full lg:w-[380px] xl:w-[410px] border-t lg:border-t-0 lg:border-l flex flex-col shrink-0 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {channelTab === 'express' ? (
            <div className="flex flex-col h-full p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span>Pedido Express</span>
                </h3>
                {expressCart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpressCart([])}
                    className="text-xs font-bold text-rose-500 cursor-pointer"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              <input
                type="text"
                value={expressCustomerName}
                onChange={e => setExpressCustomerName(e.target.value)}
                placeholder="Nombre o referencia para llamado (opcional)"
                className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />

              <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
                {expressCart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-400">
                    <Utensils className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-xs">Toca los productos de la izquierda para armar un pedido express.</p>
                  </div>
                ) : (
                  expressCart.map(item => (
                    <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate">{item.product.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {item.quantity} × {formatMoney(item.product.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpressCart(prev =>
                              prev
                                .map(p => p.product.id === item.product.id ? { ...p, quantity: p.quantity - 1 } : p)
                                .filter(p => p.quantity > 0)
                            )
                          }
                          className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpressCart(prev =>
                              prev.map(p => p.product.id === item.product.id ? { ...p, quantity: p.quantity + 1 } : p)
                            )
                          }
                          className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <div className="w-16 text-right font-mono font-black tabular-nums">
                        {formatMoney(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-base font-black">
                  <span>TOTAL</span>
                  <span className="font-mono tabular-nums">{formatMoney(expressCartTotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={expressCart.length === 0}
                    onClick={() => handleConfirmExpressOrder(false)}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                  >
                    Enviar a Cocina
                  </button>
                  <button
                    type="button"
                    disabled={expressCart.length === 0}
                    onClick={() => handleConfirmExpressOrder(true)}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cobrar Ahora</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isCreatingOrder ? (
            <form onSubmit={handleCreateOrderSubmit} className="flex flex-col h-full p-4 space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-black">
                  Nuevo Pedido ({channelTab === 'delivery' ? 'Delivery' : 'Mostrador'})
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingOrder(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1">Cliente registrado (opcional)</label>
                <select
                  value={newCustomerId}
                  onChange={e => handleSelectExistingClient(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  <option value="">-- Seleccionar cliente o ingresar manual --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'Sin tel.'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Nombre cliente *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={e => setNewCustomerName(e.target.value)}
                    placeholder="Nombre completo"
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+56 9..."
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {channelTab === 'delivery' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold block mb-1">Dirección de entrega *</label>
                    <input
                      type="text"
                      required
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      placeholder="Calle, número, depto o referencia"
                      className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold block mb-1">Repartidor</label>
                      <select
                        value={newDriverId}
                        onChange={e => setNewDriverId(e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      >
                        <option value="">Sin asignar</option>
                        {driverCandidates.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold block mb-1">Costo envío ({curr})</label>
                      <input
                        type="number"
                        min={0}
                        value={newDeliveryFee}
                        onChange={e => setNewDeliveryFee(e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-xs font-mono font-bold tabular-nums ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Quick Product Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold block">Agregar productos (opcional, o abre TPV)</label>
                <input
                  type="text"
                  value={newProdSearch}
                  onChange={e => setNewProdSearch(e.target.value)}
                  placeholder="Buscar producto..."
                  className={`w-full rounded-lg border px-3 py-1.5 text-xs ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                <div className="max-h-28 overflow-y-auto grid grid-cols-2 gap-1 pt-1">
                  {products
                    .filter(p => !newProdSearch.trim() || p.name.toLowerCase().includes(newProdSearch.toLowerCase()))
                    .slice(0, 12)
                    .map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddProductToNewOrder(p)}
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold text-left truncate cursor-pointer ${
                          isLight ? 'bg-slate-50 hover:bg-orange-50 border-slate-200' : 'bg-slate-950 hover:bg-slate-800 border-slate-800'
                        }`}
                      >
                        + {p.name} ({formatMoney(p.price)})
                      </button>
                    ))}
                </div>
                {newOrderCart.length > 0 && (
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 text-[11px] space-y-1">
                    {newOrderCart.map(it => (
                      <div key={it.product.id} className="flex justify-between font-semibold">
                        <span>{it.quantity}× {it.product.name}</span>
                        <span className="font-mono tabular-nums">{formatMoney(it.product.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="mt-auto w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{newOrderCart.length > 0 ? 'Crear Pedido' : 'Crear y Abrir en TPV'}</span>
              </button>
            </form>
          ) : selectedOrder ? (
            <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">
                    {selectedOrder.orderType === 'delivery' ? 'Pedido Delivery' : 'Pedido Mostrador'}
                  </span>
                  <h3 className="text-base font-black">{selectedOrder.number}</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">{selectedOrder.time}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-bold">{selectedOrder.customerName || selectedOrder.tableName}</span>
                </div>
                {selectedOrder.deliveryPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="tabular-nums">{selectedOrder.deliveryPhone}</span>
                  </div>
                )}
                {selectedOrder.deliveryAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {selectedOrder.orderType === 'delivery' && (
                <div>
                  <label className="text-[11px] font-bold block mb-1">Asignar / cambiar repartidor</label>
                  <select
                    value={selectedOrder.driverId || ''}
                    onChange={e => {
                      const d = waiters.find(w => String(w.id) === e.target.value);
                      assignDriverToSale(selectedOrder.id, d?.id, d?.name);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="">Sin repartidor asignado</option>
                    {driverCandidates.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex-1 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Detalle del pedido</div>
                {selectedOrder.items.map(it => (
                  <div key={it.id} className="flex justify-between py-1">
                    <span>{it.quantity}× {it.productName}</span>
                    <span className="font-mono font-bold tabular-nums">{formatMoney(it.total)}</span>
                  </div>
                ))}
                {(selectedOrder.deliveryFee || 0) > 0 && (
                  <div className="flex justify-between py-1 text-slate-500">
                    <span>Costo envío</span>
                    <span className="font-mono tabular-nums">{formatMoney(selectedOrder.deliveryFee || 0)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-base font-black">
                  <span>TOTAL</span>
                  <span className="font-mono tabular-nums">{formatMoney(selectedOrder.total)}</span>
                </div>

                {selectedOrder.status === 'open' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSale(selectedOrder);
                        setActiveView('pos');
                      }}
                      className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                      }`}
                    >
                      Editar en TPV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChargeOrder(selectedOrder)}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Cobrar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <ChevronRight className="w-6 h-6 opacity-40" />
              <button
                type="button"
                onClick={() => setIsCreatingOrder(true)}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                Crear un nuevo pedido
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
