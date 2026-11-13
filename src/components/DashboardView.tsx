import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  QrCode,
  Receipt,
  Boxes,
  Settings,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Banknote,
  Percent,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Flame,
  Coffee,
  Wine,
  UserPlus
} from 'lucide-react';
import { sound } from '../utils/sound';
import { formatCLP } from '../utils/currency';
import { isViewAllowedForUser } from '../utils/permissions';

export const DashboardView: React.FC = () => {
  const {
    waiter,
    tables,
    sales,
    salons,
    products,
    categories,
    currentShift,
    currency,
    themeMode,
    setActiveView,
    setIsCashShiftModalOpen,
    setCashModalMode,
    restaurantBrand,
    stationMode,
    isMobileDevice
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';

  // Compute live metrics
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'kitchen' || t.status === 'billed').length;
  const freeTables = totalTables - occupiedTables;
  const occupancyPercentage = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  // Closed sales today
  const closedSales = sales.filter(s => s.status === 'closed');
  const openSales = sales.filter(s => s.status === 'open');

  const totalRevenue = closedSales.reduce((acc, s) => acc + s.total, 0);
  const totalOpenRevenue = openSales.reduce((acc, s) => acc + s.total, 0);

  // Sales by payment method
  const cashTotal = closedSales.filter(s => s.paymentMethod === 'cash').reduce((acc, s) => acc + s.total, 0);
  const cardTotal = closedSales.filter(s => s.paymentMethod === 'card').reduce((acc, s) => acc + s.total, 0);

  // Kitchen pending items
  const kitchenCookingOrders = sales.filter(s => s.status === 'open' && s.items.some(i => i.kitchenStatus === 'cooking' || i.kitchenStatus === 'pending'));
  const totalKitchenItemsInPrep = sales
    .filter(s => s.status === 'open')
    .reduce((acc, s) => acc + s.items.filter(i => i.kitchenStatus === 'cooking' || i.kitchenStatus === 'pending').length, 0);

  // Average ticket
  const averageTicket = closedSales.length > 0 ? totalRevenue / closedSales.length : 0;

  // Format currency
  const fmt = (val: number) => formatCLP(val, currency);

  // Top products calculation
  const productSalesMap = new Map<string, { name: string; categoryName: string; quantity: number; revenue: number }>();
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSalesMap.get(item.productId);
      const prod = products.find(p => p.id === item.productId);
      const cat = categories.find(c => c.id === prod?.categoryId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.total;
      } else {
        productSalesMap.set(item.productId, {
          name: item.productName,
          categoryName: cat?.name || 'Gastronomía',
          quantity: item.quantity,
          revenue: item.total
        });
      }
    });
  });

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto select-none transition-colors ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Banner / Breadcrumb */}
      <div className={`p-4 sm:px-6 border-b transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">
                  Panel de Control Principal
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resumen ejecutivo, salones, cocina KDS y facturación del turno en tiempo real.
              </p>
            </div>
          </div>

          {/* Quick Cash Action */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                sound.playTap();
                if (currentShift) {
                  setCashModalMode('close');
                } else {
                  setCashModalMode('open');
                }
                setIsCashShiftModalOpen(true);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                currentShift
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>{currentShift ? 'Arqueo de Turno Activo' : 'Abrir Turno de Caja'}</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setActiveView('pos');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Nueva Venta Rápida</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Facturado */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider">Facturado Hoy (Cerrado)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {fmt(totalRevenue)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>💳 {fmt(cardTotal)}</span>
              <span>·</span>
              <span>💵 {fmt(cashTotal)}</span>
            </div>
          </div>

          {/* Card 2: Mesas Activas & Ocupación */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider">Ocupación de Sala</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
                {occupiedTables} / {totalTables}
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">
                {occupancyPercentage}%
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{freeTables} mesas disponibles para nuevos clientes</span>
            </div>
          </div>

          {/* Card 3: Cocina KDS */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider">Comandas en Cocina</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-amber-500">
              {totalKitchenItemsInPrep} platos
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{kitchenCookingOrders.length} mesas en preparación activa</span>
            </div>
          </div>

          {/* Card 4: Ticket Medio */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider">Ticket Promedio</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400">
              {fmt(averageTicket)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Basado en {closedSales.length} cobros finalizados</span>
            </div>
          </div>
        </div>

        {/* Quick Launchpad to Independent Pages */}
        <div className={`p-5 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Páginas Independientes del Sistema
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acceso directo modular a cada área operativa de Dy Pos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            {/* Mesas / Salón */}
            {isViewAllowedForUser('floor', waiter, stationMode, isMobileDevice) && (
              <button
                onClick={() => { sound.playTap(); setActiveView('floor'); }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between h-28 ${
                  isLight ? 'bg-slate-50 hover:bg-blue-50/60 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-slate-100">Salón & Mesas</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Plano interactivo ({occupiedTables} ocupadas)</div>
                </div>
              </button>
            )}

            {/* Bar / TPV Comandas */}
            {isViewAllowedForUser('pos', waiter, stationMode, isMobileDevice) && (
              <button
                onClick={() => { sound.playTap(); setActiveView('pos'); }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between h-28 ${
                  isLight ? 'bg-slate-50 hover:bg-emerald-50/60 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-slate-100">Bar / TPV Comandas</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Toma de pedidos ágil</div>
                </div>
              </button>
            )}

            {/* Ventas Abiertas */}
            {isViewAllowedForUser('pending-sales', waiter, stationMode, isMobileDevice) && (
              <button
                onClick={() => { sound.playTap(); setActiveView('pending-sales'); }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between h-28 ${
                  isLight ? 'bg-slate-50 hover:bg-indigo-50/60 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-slate-100">Ventas Abiertas</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{openSales.length} cuentas activas</div>
                </div>
              </button>
            )}

            {/* Cocina KDS */}
            {isViewAllowedForUser('kitchen', waiter, stationMode, isMobileDevice) && (
              <button
                onClick={() => { sound.playTap(); setActiveView('kitchen'); }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between h-28 ${
                  isLight ? 'bg-slate-50 hover:bg-amber-50/60 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-slate-100">Cocina / KDS</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{totalKitchenItemsInPrep} platos en marcha</div>
                </div>
              </button>
            )}

            {/* Carta Digital QR */}
            {isViewAllowedForUser('menu', waiter, stationMode, isMobileDevice) && (
              <button
                onClick={() => { sound.playTap(); setActiveView('menu'); }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between h-28 ${
                  isLight ? 'bg-slate-50 hover:bg-teal-50/60 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                </div>
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-slate-100">Carta QR & Mesas</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Códigos QR y comensales</div>
                </div>
              </button>
            )}

            {/* Caja & Informes */}
            {isViewAllowedForUser('reports', waiter, stationMode, isMobileDevice) && (
              <button
                onClick={() => { sound.playTap(); setActiveView('reports'); }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between h-28 ${
                  isLight ? 'bg-slate-50 hover:bg-purple-50/60 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-slate-100">Caja & Cierre Z</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Arqueos e informes fiscales</div>
                </div>
              </button>
            )}

            {/* Inventario & Stock */}
            {isViewAllowedForUser('inventory', waiter, stationMode, isMobileDevice) && (
              <button
                onClick={() => { sound.playTap(); setActiveView('inventory'); }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between h-28 ${
                  isLight ? 'bg-slate-50 hover:bg-sky-50/60 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                </div>
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-slate-100">Almacén & Stock</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Control de existencias</div>
                </div>
              </button>
            )}

            {/* Panel de Administración (Gestión de Personal & Alta) */}
            {isViewAllowedForUser('admin', waiter, stationMode, isMobileDevice) && (
              <button
                onClick={() => { sound.playTap(); setActiveView('admin'); }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between h-28 ${
                  isLight ? 'bg-slate-50 hover:bg-violet-50/60 border-slate-200' : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                </div>
                <div>
                  <div className="font-black text-xs text-slate-900 dark:text-slate-100">Administración</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Personal, altas y permisos</div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Section: Salones Breakdown vs Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Estado de los Salones */}
          <div className={`lg:col-span-7 p-5 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Distribución por Salón
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ocupación y mesas activas en cada zona del restaurante.
                </p>
              </div>
              <button
                onClick={() => { sound.playTap(); setActiveView('floor'); }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Salón</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {salons.map(salon => {
                const salonTables = tables.filter(t => t.salonId === salon.id);
                const occ = salonTables.filter(t => t.status !== 'free').length;
                const total = salonTables.length;
                const pct = total > 0 ? Math.round((occ / total) * 100) : 0;

                return (
                  <div
                    key={salon.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-black text-slate-900 dark:text-slate-100">{salon.name}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
                          {occ} de {total} mesas ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct > 75 ? 'bg-rose-500' : pct > 40 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        occ > 0
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {occ > 0 ? `${occ} con servicio` : 'Disponible'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Top Gastronómico */}
          <div className={`lg:col-span-5 p-5 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Platos Más Solicitados Hoy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Artículos con mayor rotación en comanda.
                </p>
              </div>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-2.5">
              {topProducts.length > 0 ? (
                topProducts.map((p, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-xs text-slate-900 dark:text-slate-100 truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {p.categoryName}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right font-mono">
                      <div className="font-black text-xs text-slate-900 dark:text-slate-100">
                        {p.quantity} uds
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {fmt(p.revenue)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No hay ventas registradas aún en este turno.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
