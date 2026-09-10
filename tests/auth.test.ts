import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticateWaiter, isValidPin } from '../src/utils/auth';
import type { Waiter } from '../src/types';

const waiters: Waiter[] = [
  { id: 1, name: 'Active', pin: '1234', role: 'admin', active: true },
  { id: 2, name: 'Disabled', pin: '5678', role: 'waiter', active: false },
];

test('PINs must contain exactly four digits', () => {
  assert.equal(isValidPin('1234'), true);
  assert.equal(isValidPin('123'), false);
  assert.equal(isValidPin('12345'), false);
  assert.equal(isValidPin('12a4'), false);
  assert.equal(isValidPin(''), false);
});

test('authentication requires matching user, PIN, and active status', () => {
  assert.equal(authenticateWaiter(waiters, 1, '1234')?.name, 'Active');
  assert.equal(authenticateWaiter(waiters, 1, '9999'), null);
  assert.equal(authenticateWaiter(waiters, 999, '1234'), null);
  assert.equal(authenticateWaiter(waiters, 2, '5678'), null);
});

test('a PIN belonging to another user cannot authenticate the selected user', () => {
  assert.equal(authenticateWaiter(waiters, 1, '5678'), null);
});
