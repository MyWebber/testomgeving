/* ==========================================================================
   Pizza Prima 2 — Order tracking (simulated live progression)
   ========================================================================== */

(function () {
  PP2.init({ active: "" });

  const DELIVERY_STEPS = [
    { id: "received", ic: "🧾", title: "Bestelling ontvangen", sub: "We hebben je bestelling in goede orde ontvangen." },
    { id: "preparing", ic: "👨‍🍳", title: "In bereiding", sub: "Onze chefs zijn aan de slag met verse ingrediënten." },
    { id: "inoven", ic: "🔥", title: "In de oven", sub: "Bijna klaar — krokant en goudbruin gebakken." },
    { id: "outfordelivery", ic: "🛵", title: "Onderweg", sub: "Je bezorger is onderweg naar jouw adres." },
    { id: "delivered", ic: "✅", title: "Bezorgd", sub: "Eet smakelijk!" },
  ];
  const PICKUP_STEPS = [
    { id: "received", ic: "🧾", title: "Bestelling ontvangen", sub: "We hebben je bestelling in goede orde ontvangen." },
    { id: "preparing", ic: "👨‍🍳", title: "In bereiding", sub: "Onze chefs zijn aan de slag met verse ingrediënten." },
    { id: "inoven", ic: "🔥", title: "In de oven", sub: "Bijna klaar — krokant en goudbruin gebakken." },
    { id: "ready", ic: "🏪", title: "Klaar om af te halen", sub: "Je bestelling staat klaar bij de balie." },
  ];

  let timer = null;

  function stepsFor(order) { return order.fulfilment === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS; }

  function render(order) {
    const steps = stepsFor(order);
    const activeIdx = steps.findIndex(s => s.id === order.status);
    const isFinal = activeIdx === steps.length - 1;

    document.getElementById("orderResult").innerHTML = `
      <div class="card reveal in" style="padding:28px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:6px;">
          <h2 class="font-display" style="font-size:1.3rem;">Bestelling #${order.id}</h2>
          <span class="badge badge-popular">${order.fulfilment === "pickup" ? "Afhalen" : "Bezorging"}</span>
        </div>
        <p class="text-muted" style="font-size:.85rem;">Geplaatst op ${new Date(order.placedAt).toLocaleString("nl-NL")}</p>
      </div>

      <div class="card" style="padding:28px;margin-bottom:24px;">
        <div class="track-timeline">
          ${steps.map((s, i) => `
            <div class="track-step ${i < activeIdx || isFinal && i <= activeIdx ? "done" : ""} ${i === activeIdx && !isFinal ? "active" : ""} ${isFinal && i === activeIdx ? "done" : ""}">
              <div class="track-dot">${s.ic}</div>
              <div>
                <div class="track-title">${s.title}</div>
                <div class="track-sub">${s.sub}</div>
                ${i === activeIdx ? `<div class="track-time">Bijgewerkt: ${new Date(order.statusUpdatedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</div>` : ""}
              </div>
            </div>`).join("")}
        </div>
      </div>

      <div class="card" style="padding:28px;">
        <h3 class="font-display" style="margin-bottom:14px;font-size:1.1rem;">Besteloverzicht</h3>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
          ${order.items.map(i => `<div style="display:flex;justify-content:space-between;font-size:.88rem;"><span>${i.qty}× ${i.name}</span><span>${PP2.money(i.unitPrice * i.qty)}</span></div>`).join("")}
        </div>
        <div class="cart-row total"><span>Totaal</span><span>${PP2.money(order.total)}</span></div>
      </div>
    `;
  }

  function simulate(order) {
    clearInterval(timer);
    const steps = stepsFor(order);
    if (steps.findIndex(s => s.id === order.status) >= steps.length - 1) return;
    timer = setInterval(() => {
      const fresh = Orders.get(order.id);
      const idx = steps.findIndex(s => s.id === fresh.status);
      if (idx >= steps.length - 1) { clearInterval(timer); return; }
      const updated = Orders.updateStatus(order.id, steps[idx + 1].id);
      render(updated);
      if (idx + 1 >= steps.length - 1) clearInterval(timer);
    }, 7000);
  }

  function loadOrder(id) {
    const order = Orders.get(id);
    if (!order) {
      document.getElementById("orderResult").innerHTML = `
        <div class="card" style="padding:40px;text-align:center;">
          <div style="font-size:2.2rem;margin-bottom:10px;">📦</div>
          <h3 class="font-display">Geen bestelling gevonden</h3>
          <p class="text-muted">Controleer je bestelnummer of <a href="menu.html" style="color:var(--tomato);">plaats een nieuwe bestelling</a>.</p>
        </div>`;
      return;
    }
    render(order);
    simulate(order);
  }

  document.getElementById("findOrderBtn").addEventListener("click", () => {
    const id = document.getElementById("orderIdInput").value.trim().toUpperCase();
    if (id) loadOrder(id);
  });
  document.getElementById("orderIdInput").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("findOrderBtn").click(); });

  const params = new URLSearchParams(location.search);
  const initialId = params.get("id");
  if (initialId) {
    document.getElementById("orderIdInput").value = initialId;
    loadOrder(initialId);
  } else {
    const last = Orders.all()[0];
    if (last) loadOrder(last.id);
    else document.getElementById("orderResult").innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p class="text-muted">Voer je bestelnummer in om de status te bekijken.</p></div>`;
  }
})();
