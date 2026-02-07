

const STORAGE_KEY = 'rg_bookings';

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function generateRef() {
  return 'RG-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
}

export function createBooking(booking) {
  const all = loadAll();
  const ref = generateRef();
  const saved = Object.assign({
    ref,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }, booking);
  all.push(saved);
  saveAll(all);
  return saved;
}

export function getBooking(ref) {
  const all = loadAll();
  return all.find(b => b.ref === ref) || null;
}

export function updateBooking(ref, updates) {
  const all = loadAll();
  const idx = all.findIndex(b => b.ref === ref);
  if (idx === -1) return null;
  all[idx] = Object.assign({}, all[idx], updates, {updatedAt: new Date().toISOString()});
  saveAll(all);
  return all[idx];
}

export function cancelBooking(ref, reason) {
  return updateBooking(ref, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelReason: reason });
}

export function listBookings() {
  return loadAll();
}

export default { createBooking, getBooking, updateBooking, cancelBooking, listBookings };
