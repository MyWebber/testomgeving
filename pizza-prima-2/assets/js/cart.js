/* ==========================================================================
   Pizza Prima 2 — Cart state & pricing logic (no DOM here; UI lives in app.js)
   Persisted to localStorage so the cart survives refresh, matching the spec's
   "persistent cart" requirement without needing a server session.
   ========================================================================== */

const Cart = (() => {
  const STORAGE_KEY = "pp2_cart_v1";
  const FREE_DELIVERY_THRESHOLD = 25;
  const DELIVERY_FEE = 2.5;
  const BTW_RATE = 0.09;

  let state = {
    items: [],       // {lineId, productId, name, image, cat, unitPrice, qty, optionLabels:[], notes}
    couponCode: null,
    fulfilment: "delivery", // 'delivery' | 'pickup'
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = { ...state, ...JSON.parse(raw) };
    } catch (e) { /* corrupted storage, start fresh */ }
  }
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  function lineId() { return "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function add({ productId, name, image, cat, unitPrice, qty = 1, optionLabels = [], notes = "" }) {
    state.items.push({ lineId: lineId(), productId, name, image, cat, unitPrice, qty, optionLabels, notes });
    persist();
  }

  function updateQty(id, qty) {
    const item = state.items.find(i => i.lineId === id);
    if (!item) return;
    item.qty = Math.max(1, qty);
    persist();
  }
  function remove(id) {
    state.items = state.items.filter(i => i.lineId !== id);
    persist();
  }
  function clear() {
    state.items = [];
    state.couponCode = null;
    persist();
  }
  function setFulfilment(mode) {
    state.fulfilment = mode;
    persist();
  }
  function itemCount() { return state.items.reduce((s, i) => s + i.qty, 0); }

  function subtotal() {
    return state.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  }

  function applyCoupon(code) {
    const offer = getAllOffers().find(o => o.code.toLowerCase() === String(code).trim().toLowerCase());
    if (!offer) return { ok: false, message: "Deze couponcode is niet geldig." };
    if (subtotal() < offer.minOrder) {
      return { ok: false, message: `Minimale bestelwaarde voor deze code is €${offer.minOrder.toFixed(2)}.` };
    }
    state.couponCode = offer.code;
    persist();
    return { ok: true, message: `Code "${offer.code}" toegepast!` };
  }
  function removeCoupon() { state.couponCode = null; persist(); }

  function discount() {
    if (!state.couponCode) return 0;
    const offer = getAllOffers().find(o => o.code === state.couponCode);
    if (!offer) return 0;
    const sub = subtotal();
    if (sub < offer.minOrder) return 0;
    if (offer.type === "percent") return +(sub * (offer.value / 100)).toFixed(2);
    if (offer.type === "fixed") return Math.min(offer.value, sub);
    if (offer.type === "bogo") {
      const pizzas = state.items.filter(i => i.cat === "pizza" || i.cat === "calzone");
      const units = pizzas.flatMap(i => Array(i.qty).fill(i.unitPrice)).sort((a, b) => a - b);
      if (units.length >= 3) return +units[0].toFixed(2);
      return 0;
    }
    return 0;
  }

  function deliveryFee() {
    if (state.fulfilment === "pickup") return 0;
    if (state.items.length === 0) return 0;
    const sub = subtotal() - discount();
    return sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  }

  function total() {
    return Math.max(0, subtotal() - discount() + deliveryFee());
  }
  function taxIncluded() {
    return +(subtotal() * (BTW_RATE / (1 + BTW_RATE))).toFixed(2);
  }

  function eta() {
    return state.fulfilment === "pickup" ? "15–20 min" : "25–40 min";
  }

  load();

  return {
    get items() { return state.items; },
    get couponCode() { return state.couponCode; },
    get fulfilment() { return state.fulfilment; },
    add, updateQty, remove, clear, setFulfilment,
    itemCount, subtotal, applyCoupon, removeCoupon, discount,
    deliveryFee, total, taxIncluded, eta,
    FREE_DELIVERY_THRESHOLD,
  };
})();

/* ---------- Favorites (localStorage) ---------- */
const Favorites = (() => {
  const KEY = "pp2_favorites_v1";
  let ids = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  function persist() {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
    document.dispatchEvent(new CustomEvent("favorites:change"));
  }
  return {
    has: id => ids.has(id),
    toggle(id) { ids.has(id) ? ids.delete(id) : ids.add(id); persist(); return ids.has(id); },
    all() { return [...ids]; },
    count() { return ids.size; },
  };
})();

/* ---------- Simple order history (mock "backend") ---------- */
const Orders = (() => {
  const KEY = "pp2_orders_v1";
  function all() { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
  function create(order) {
    const list = all();
    const id = "PP" + Math.floor(100000 + Math.random() * 900000);
    const record = {
      id,
      placedAt: new Date().toISOString(),
      status: "received",
      statusUpdatedAt: new Date().toISOString(),
      ...order,
    };
    list.unshift(record);
    save(list);
    return record;
  }
  function get(id) { return all().find(o => o.id === id); }
  function updateStatus(id, status) {
    const list = all();
    const o = list.find(o => o.id === id);
    if (o) { o.status = status; o.statusUpdatedAt = new Date().toISOString(); save(list); }
    return o;
  }
  return { all, create, get, updateStatus };
})();
