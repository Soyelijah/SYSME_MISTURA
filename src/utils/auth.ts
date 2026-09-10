import type { Waiter } from '../types';

export const isValidPin = (pin: string): boolean => /^\d{4}$/.test(pin);

export const authenticateWaiter = (
  waiters: readonly Waiter[],
  waiterId: number,
  pin: string,
): Waiter | null => {
  if (!isValidPin(pin)) return null;

  return waiters.find(waiter => (
    waiter.id === waiterId
    && waiter.active !== false
    && waiter.pin === pin
  )) ?? null;
};
