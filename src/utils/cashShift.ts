import { CashShift, Sale } from '../types';
import { CLP_DENOMINATIONS, roundCLP } from './currency';

export interface ShiftCashSummary {
  closedSales: Sale[];
  cashSales: number;
  cardSales: number;
  cryptoSales: number;
  otherSales: number;
  totalSales: number;
  totalTax: number;
  totalCashIn: number;
  totalCashOut: number;
  netMovements: number;
  initialCash: number;
  expectedCashInDrawer: number;
}

/**
 * Genera un conteo de denominaciones CLP inicializado en cero para el arqueo físico.
 */
export const createEmptyBillCounts = (): Record<number, number> =>
  CLP_DENOMINATIONS.reduce<Record<number, number>>((acc, denom) => {
    acc[denom] = 0;
    return acc;
  }, {});

/**
 * Calcula el total físico contado en Pesos Chilenos (CLP) a partir de las cantidades por denominación.
 */
export const calculateBillCountsTotal = (billCounts: Record<number, number>): number =>
  roundCLP(
    CLP_DENOMINATIONS.reduce((sum, denom) => {
      const qty = Math.max(0, Math.floor(Number(billCounts[denom]) || 0));
      return sum + denom * qty;
    }, 0)
  );

/**
 * Filtra únicamente las ventas cerradas que pertenecen al turno de caja activo.
 * Evita que ventas de turnos anteriores (ya cerrados en Arqueo Z) se acumulen en un nuevo turno.
 */
export const getShiftClosedSales = (
  sales: Sale[],
  currentShift: CashShift | null,
  shiftHistory: CashShift[] = []
): Sale[] => {
  if (!currentShift || currentShift.status !== 'open') {
    return [];
  }

  return sales.filter((sale) => {
    if (sale.status !== 'closed') return false;

    // 1. Venta vinculada explícitamente al turno actual
    if (sale.shiftId) {
      return sale.shiftId === currentShift.id;
    }

    // 2. Compatibilidad con ventas antiguas sin shiftId:
    // Si ya existen turnos cerrados en historial, no arrastrar ventas sin shiftId de turnos previos
    if (currentShift.openedAtIso && sale.closedAt) {
      return sale.closedAt >= currentShift.openedAtIso;
    }

    return shiftHistory.length === 0;
  });
};

/**
 * Calcula el resumen teórico completo de caja del turno activo en CLP enteros.
 */
export const calculateShiftCashSummary = ({
  sales,
  currentShift,
  shiftHistory,
  fallbackInitialCash = 0,
}: {
  sales: Sale[];
  currentShift: CashShift | null;
  shiftHistory: CashShift[];
  fallbackInitialCash?: number;
}): ShiftCashSummary => {
  const closedSales = getShiftClosedSales(sales, currentShift, shiftHistory);

  let cashSales = 0;
  let cardSales = 0;
  let cryptoSales = 0;
  let otherSales = 0;
  let totalSales = 0;
  let totalTax = 0;

  closedSales.forEach((sale) => {
    const amount = roundCLP(sale.total);
    totalSales += amount;
    totalTax += roundCLP(sale.taxTotal);

    if (sale.paymentMethod === 'cash') cashSales += amount;
    else if (sale.paymentMethod === 'card') cardSales += amount;
    else if (sale.paymentMethod === 'crypto') cryptoSales += amount;
    else otherSales += amount;
  });

  const movements = currentShift?.movements || [];
  const totalCashIn = roundCLP(
    movements.filter((m) => m.type === 'in').reduce((acc, m) => acc + roundCLP(m.amount), 0)
  );
  const totalCashOut = roundCLP(
    movements.filter((m) => m.type === 'out').reduce((acc, m) => acc + roundCLP(m.amount), 0)
  );
  const netMovements = roundCLP(totalCashIn - totalCashOut);

  const initialCash = roundCLP(currentShift ? currentShift.initialCash : fallbackInitialCash);
  const expectedCashInDrawer = roundCLP(initialCash + cashSales + netMovements);

  return {
    closedSales,
    cashSales: roundCLP(cashSales),
    cardSales: roundCLP(cardSales),
    cryptoSales: roundCLP(cryptoSales),
    otherSales: roundCLP(otherSales),
    totalSales: roundCLP(totalSales),
    totalTax: roundCLP(totalTax),
    totalCashIn,
    totalCashOut,
    netMovements,
    initialCash,
    expectedCashInDrawer,
  };
};
