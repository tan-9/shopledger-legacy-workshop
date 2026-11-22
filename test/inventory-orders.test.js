'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

test('inventory check allows buying the last sellable unit', function () {
  const products = [{ id: 1, name: 'Rice', stock: 1, reserved: 0 }];

  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 1 }]), { ok: true });
});

test('inventory check permits quantities below sellable stock', function () {
  const products = [{ id: 1, name: 'Rice', stock: 2, reserved: 0 }];

  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 1 }]), { ok: true });
});

test('cancelling an order restores physical stock without changing quote reservations', function () {
  const db = {
    products: [{ id: 1, name: 'Rice', stock: 0, reserved: 2 }],
    orders: [{
      id: 10,
      date: '01/01/2024',
      customer: 'Walk-in',
      paymentMode: 'cash',
      status: 'completed',
      items: [{ id: 1, sku: 'RICE-1', name: 'Rice', price: 10, qty: 2 }],
      total: 20
    }]
  };

  const result = orders.cancel(db, 10, 'Customer changed mind');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.equal(db.products[0].stock, 2);
  assert.equal(db.products[0].reserved, 2);
});
