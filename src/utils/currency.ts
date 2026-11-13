/**
 * @file currency.ts
 * @description Modulo centralizado de moneda (Peso Chileno - CLP) y calculo tributario (IVA 19% Chile).
 *
 * Reglas de negocio portables (sin dependencias de framework):
 * 1. El Peso Chileno (CLP) opera exclusivamente en enteros (sin centavos ni decimales).
 * 2. El simbolo oficial mostrado en pantalla y tickets es "$" con separador de miles "." (locale "es-CL").
 * 3. Los precios de venta (PVP) en carta incluyen IVA chileno (19% por defecto, o 0% si es exento).
 * 4. Desglose neto desde precio bruto con IVA incluido:
 *      neto = Math.round(bruto / (1 + tasaIva))
 *      iva  = bruto - neto
 *    Esto garantiza que siempre se cumpla la identidad exacta: neto + iva === bruto (sin descuadres de 1 peso).
 */

export const CLP_CURRENCY_CODE = 'CLP' as const;
export const CLP_SYMBOL = '$' as const;
export const CLP_LOCALE = 'es-CL' as const;
export const CHILE_IVA_PERCENT = 19 as const;
export const CHILE_IVA_RATE = 0.19 as const;

/**
 * Denominaciones oficiales vigentes de billetes y monedas en Chile (CLP),
 * ordenadas de mayor a menor para el arqueo fisico de caja (Cierre Z).
 */
export const CLP_DENOMINATIONS: readonly number[] = [
  20000,
  10000,
  5000,
  2000,
  1000,
  500,
  100,
  50,
  10,
] as const;

/**
 * Montos rapidos de billetes en caja al momento de cobrar una venta en efectivo.
 */
export const CLP_QUICK_CASH_PRESETS: readonly number[] = [
  5000,
  10000,
  20000,
  40000,
  50000,
] as const;

/**
 * Montos sugeridos para el fondo inicial de sencillo al abrir turno de caja.
 */
export const CLP_INITIAL_CASH_PRESETS: readonly number[] = [
  20000,
  30000,
  50000,
  80000,
  100000,
  150000,
] as const;

/**
 * Normaliza cualquier simbolo legado ('€', 'EUR', vacio, 'CLP$') al simbolo estandar '$'.
 */
export function normalizeCurrencySymbol(currency?: string | null): string {
  if (!currency) return CLP_SYMBOL;
  const trimmed = currency.trim();
  if (!trimmed || trimmed === '€' || trimmed.toUpperCase() === 'EUR' || trimmed === 'CLP' || trimmed === 'CLP$') {
    return CLP_SYMBOL;
  }
  return trimmed;
}

/**
 * Redondea cualquier valor monetario a entero CLP seguro (evita NaN, Infinity y decimales flotantes).
 */
export function roundCLP(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount);
}

/**
 * Formatea un monto en Pesos Chilenos enteros. Ej: 15900 -> "$15.900" (o "$ 15.900" si spaced=true).
 */
export function formatCLP(
  amount: number,
  currency?: string | null,
  options?: { spaced?: boolean; showSymbol?: boolean }
): string {
  const rounded = roundCLP(amount);
  const formattedNumber = rounded.toLocaleString(CLP_LOCALE, { maximumFractionDigits: 0 });
  const showSymbol = options?.showSymbol ?? true;
  if (!showSymbol) return formattedNumber;

  const symbol = normalizeCurrencySymbol(currency);
  return options?.spaced ? `${symbol} ${formattedNumber}` : `${symbol}${formattedNumber}`;
}

/**
 * Formatea una diferencia o movimiento de efectivo con signo explicito.
 * Ej: 5000 -> "+$5.000", -2000 -> "-$2.000", 0 -> "$0".
 */
export function formatSignedCLP(
  amount: number,
  currency?: string | null,
  options?: { forcePlusOnZero?: boolean; spaced?: boolean }
): string {
  const rounded = roundCLP(amount);
  const absFormatted = formatCLP(Math.abs(rounded), currency, { spaced: options?.spaced });
  if (rounded > 0) return `+${absFormatted}`;
  if (rounded < 0) return `-${absFormatted}`;
  return options?.forcePlusOnZero ? `+${absFormatted}` : absFormatted;
}

/**
 * Calcula el desglose tributario chileno (Neto + IVA) desde un total bruto con IVA incluido.
 * Mantiene enteros exactos en CLP de modo que `net + iva === gross`.
 */
export function calculateNetAndIva(
  grossTotal: number,
  ivaPercent: number = CHILE_IVA_PERCENT
): { net: number; iva: number; gross: number } {
  const gross = roundCLP(grossTotal);
  const safePercent = Number.isFinite(ivaPercent) && ivaPercent >= 0 ? ivaPercent : CHILE_IVA_PERCENT;
  if (safePercent === 0 || gross === 0) {
    return { net: gross, iva: 0, gross };
  }
  const net = roundCLP(gross / (1 + safePercent / 100));
  const iva = gross - net;
  return { net, iva, gross };
}

/**
 * Formatea una fecha u hora usando la configuracion regional de Chile (es-CL).
 */
export function formatDateCL(date: Date = new Date()): string {
  return date.toLocaleDateString(CLP_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTimeCL(date: Date = new Date(), includeSeconds = false): string {
  return date.toLocaleTimeString(CLP_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
  });
}
