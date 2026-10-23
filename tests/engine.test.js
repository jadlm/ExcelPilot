import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCommercial, detectColumn, parseNumber } from '../src/engine.js';

test('normalizes commercial headers', () => {
  assert.equal(detectColumn(['Qte'], 'quantity'), 'Qte');
  assert.equal(detectColumn(['Unit Price'], 'price'), 'Unit Price');
  assert.equal(detectColumn(['Cost'], 'cost'), 'Cost');
});

test('parses localized and currency formatted numeric text', () => {
  assert.equal(parseNumber('1 234,50 MAD'), 1234.5);
  assert.equal(parseNumber('1,234.50'), 1234.5);
  assert.equal(parseNumber(''), null);
  assert.equal(parseNumber('N/A'), null);
});

test('calculates commercial totals without defaulting missing data', () => {
  const rows = [
    { Qte: '2', 'Unit Price': '100,00', Cost: '60' },
    { Qte: 3, 'Unit Price': 50, Cost: 20 },
  ];
  assert.deepEqual(calculateCommercial(rows, Object.keys(rows[0])), {
    quantity: 'Qte', price: 'Unit Price', cost: 'Cost', revenue: 350,
    totalCost: 180, profit: 170, missingQuantity: false, missingPrice: false,
  });
  assert.equal(calculateCommercial([{Total: 80}], ['Total']).revenue, null);
});

test('respects explicit mapping and zero quantity', () => {
  const result = calculateCommercial([{Units: 0, Sell: 100}], ['Units', 'Sell'], {quantity:'Units', price:'Sell'});
  assert.equal(result.revenue, 0);
});

test('marks totals unavailable when required row values are missing', () => {
  const result = calculateCommercial([{Units: 2, Sell: 10}, {Units: '', Sell: 5}], ['Units', 'Sell'], {quantity:'Units', price:'Sell'});
  assert.equal(result.revenue, null);
});
