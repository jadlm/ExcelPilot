const fold = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const aliases = {
  quantity: ['quantite', 'qte', 'qty', 'quantity', 'units', 'unites', 'nombre'],
  price: ['prix vente ht', 'prix de vente ht', 'prix unitaire vente', 'prix unitaire', 'unit price', 'selling price', 'price', 'pu vente', 'tarif'],
  cost: ['cout achat', 'cout unitaire', 'prix achat', 'prix d achat', 'cost', 'unit cost', 'purchase price'],
};

export function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  let s = value.trim().replace(/[\s\u00a0\u202f]/g, '').replace(/[A-Z]{3}|MAD|DH|€|\$|£/gi, '');
  if (/^\(.*\)$/.test(s)) s = `-${s.slice(1, -1)}`;
  if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (s.includes(',')) s = s.replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) && s !== '' ? n : null;
}

export function detectColumn(columns, kind) {
  const normalized = columns.map(name => [name, fold(name)]);
  const candidates = aliases[kind] || [];
  for (const alias of candidates) {
    const match = normalized.find(([, key]) => key === fold(alias));
    if (match) return match[0];
  }
  return null;
}

export function calculateCommercial(rows, columns, mapping = {}) {
  const quantity = mapping.quantity ?? detectColumn(columns, 'quantity');
  const price = mapping.price ?? detectColumn(columns, 'price');
  const cost = mapping.cost ?? detectColumn(columns, 'cost');
  const missingQuantity = !quantity;
  const missingPrice = !price;
  let revenue = null, totalCost = null;
  if (!missingQuantity && !missingPrice) {
    revenue = 0;
    for (const row of rows) {
      const q = parseNumber(row[quantity]); const p = parseNumber(row[price]);
      if (q === null || p === null) { revenue = null; break; }
      revenue += q * p;
    }
  }
  if (!missingQuantity && cost) {
    totalCost = 0;
    for (const row of rows) {
      const q = parseNumber(row[quantity]); const c = parseNumber(row[cost]);
      if (q === null || c === null) { totalCost = null; break; }
      totalCost += q * c;
    }
  }
  return { quantity, price, cost, revenue, totalCost, profit: revenue !== null && totalCost !== null ? revenue - totalCost : null, missingQuantity, missingPrice };
}
