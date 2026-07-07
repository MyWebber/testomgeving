/* ==========================================================================
   Pizza Prima 2 — Multi-step checkout
   ========================================================================== */

(function () {
  PP2.init({ active: "menu" });

  if (Cart.items.length === 0) {
    PP2.toast("Je winkelwagen is leeg — voeg eerst gerechten toe.");
    setTimeout(() => location.href = "menu.html", 900);
  }

  const STEPS = [
    { id: "customer", label: "Gegevens" },
    { id: "delivery", label: "Bezorging" },
    { id: "payment", label: "Betaling" },
    { id: "confirm", label: "Bevestiging" },
  ];
  let current = 0;

  const form = {
    name: "", phone: "", email: "",
    fulfilment: "delivery", postcode: "", city: "", street: "", houseNumber: "", notes: "",
    payment: "ideal",
  };

  function renderSteps() {
    document.getElementById("stepsBar").innerHTML = STEPS.map((s, i) => `
      <div class="step-pill ${i === current ? "active" : ""} ${i < current ? "done" : ""}">
        <span class="step-num">${i < current ? "✓" : i + 1}</span>
        <span class="step-label">${s.label}</span>
      </div>
      ${i < STEPS.length - 1 ? `<span class="step-sep"></span>` : ""}
    `).join("");
  }

  function renderSummary() {
    document.getElementById("summaryItems").innerHTML = Cart.items.map(i => `
      <div style="display:flex;justify-content:space-between;gap:10px;font-size:.85rem;">
        <span>${i.qty}× ${i.name}</span><span>${PP2.money(i.unitPrice * i.qty)}</span>
      </div>`).join("");
    const sub = Cart.subtotal(), disc = Cart.discount(), fee = Cart.deliveryFee(), tot = Cart.total();
    document.getElementById("summaryTotals").innerHTML = `
      <div class="cart-eta">⏱️ Geschat: ${Cart.eta()}</div>
      <div class="cart-row"><span>Subtotaal</span><span>${PP2.money(sub)}</span></div>
      ${disc > 0 ? `<div class="cart-row"><span>Korting</span><span>-${PP2.money(disc)}</span></div>` : ""}
      <div class="cart-row"><span>Bezorgkosten</span><span>${fee === 0 ? "Gratis" : PP2.money(fee)}</span></div>
      <div class="cart-row total"><span>Totaal</span><span>${PP2.money(tot)}</span></div>`;
  }

  function panelCustomer() {
    return `
      <div class="card" style="padding:28px;">
        <h2 class="font-display" style="margin-bottom:20px;font-size:1.3rem;">Jouw gegevens</h2>
        <div class="field"><label>Volledige naam</label><input type="text" id="f-name" value="${form.name}" placeholder="Voor- en achternaam" required></div>
        <div class="field-row">
          <div class="field"><label>Telefoonnummer</label><input type="tel" id="f-phone" value="${form.phone}" placeholder="06 12345678" required></div>
          <div class="field"><label>E-mailadres</label><input type="email" id="f-email" value="${form.email}" placeholder="jij@email.nl" required></div>
        </div>
        <button class="btn btn-primary btn-lg btn-block" id="next1">Volgende stap</button>
      </div>`;
  }

  function panelDelivery() {
    return `
      <div class="card" style="padding:28px;">
        <h2 class="font-display" style="margin-bottom:20px;font-size:1.3rem;">Bezorgen of afhalen?</h2>
        <div class="toggle-row">
          <div class="toggle-opt ${form.fulfilment === "delivery" ? "active" : ""}" id="opt-delivery">
            <div class="ic">🛵</div><div class="lbl">Laten bezorgen</div><div class="sub">25–40 minuten</div>
          </div>
          <div class="toggle-opt ${form.fulfilment === "pickup" ? "active" : ""}" id="opt-pickup">
            <div class="ic">🏪</div><div class="lbl">Zelf afhalen</div><div class="sub">15–20 minuten</div>
          </div>
        </div>
        <div id="addressFields" class="${form.fulfilment === "pickup" ? "hidden" : ""}">
          <div class="field-row">
            <div class="field"><label>Postcode</label><input type="text" id="f-postcode" value="${form.postcode}" placeholder="3011 AB"></div>
            <div class="field"><label>Plaats</label><input type="text" id="f-city" value="${form.city}" placeholder="Rotterdam"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Straatnaam</label><input type="text" id="f-street" value="${form.street}" placeholder="Via Roma"></div>
            <div class="field"><label>Huisnummer</label><input type="text" id="f-housenr" value="${form.houseNumber}" placeholder="12A"></div>
          </div>
          <div class="field"><label>Bezorgnotities</label><textarea id="f-notes" rows="2" placeholder="Bijv. bel niet aan, code deur 1234...">${form.notes}</textarea></div>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-secondary btn-lg" id="back2">Terug</button>
          <button class="btn btn-primary btn-lg btn-block" id="next2">Volgende stap</button>
        </div>
      </div>`;
  }

  const PAY_METHODS = [
    { id: "ideal", ic: "🏦", lbl: "iDEAL" },
    { id: "applepay", ic: "🍎", lbl: "Apple Pay" },
    { id: "googlepay", ic: "🔵", lbl: "Google Pay" },
    { id: "visa", ic: "💳", lbl: "Visa" },
    { id: "mastercard", ic: "💳", lbl: "Mastercard" },
    { id: "bancontact", ic: "🇧🇪", lbl: "Bancontact" },
    { id: "cash", ic: "💶", lbl: "Contant" },
    { id: "pin", ic: "📟", lbl: "PIN bij bezorging" },
  ];
  function panelPayment() {
    return `
      <div class="card" style="padding:28px;">
        <h2 class="font-display" style="margin-bottom:20px;font-size:1.3rem;">Kies je betaalmethode</h2>
        <div class="pay-grid">
          ${PAY_METHODS.map(m => `
            <div class="pay-opt ${form.payment === m.id ? "active" : ""}" data-pay="${m.id}">
              <span class="ic">${m.ic}</span><span class="lbl">${m.lbl}</span>
            </div>`).join("")}
        </div>
        <p class="field-hint" style="margin:16px 0 20px;">Dit is een demo-checkout — er wordt geen echte betaling verwerkt.</p>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-secondary btn-lg" id="back3">Terug</button>
          <button class="btn btn-primary btn-lg btn-block" id="next3">Volgende stap</button>
        </div>
      </div>`;
  }

  function panelConfirm() {
    const payLabel = PAY_METHODS.find(m => m.id === form.payment)?.lbl;
    return `
      <div class="card" style="padding:28px;">
        <h2 class="font-display" style="margin-bottom:20px;font-size:1.3rem;">Controleer &amp; bevestig</h2>
        <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-soft);padding-bottom:10px;">
            <span class="text-muted">Klant</span><strong>${form.name} · ${form.phone} · ${form.email}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-soft);padding-bottom:10px;">
            <span class="text-muted">${form.fulfilment === "delivery" ? "Bezorgadres" : "Afhalen bij"}</span>
            <strong>${form.fulfilment === "delivery" ? `${form.street} ${form.houseNumber}, ${form.postcode} ${form.city}` : "Via Roma 12, Rotterdam"}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span class="text-muted">Betaalmethode</span><strong>${payLabel}</strong>
          </div>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-secondary btn-lg" id="back4">Terug</button>
          <button class="btn btn-primary btn-lg btn-block" id="placeOrder">Plaats bestelling</button>
        </div>
      </div>`;
  }

  function renderPanel() {
    renderSteps();
    const el = document.getElementById("stepPanels");
    if (current === 0) el.innerHTML = panelCustomer();
    if (current === 1) el.innerHTML = panelDelivery();
    if (current === 2) el.innerHTML = panelPayment();
    if (current === 3) el.innerHTML = panelConfirm();
    wirePanel();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateStep0() {
    form.name = document.getElementById("f-name").value.trim();
    form.phone = document.getElementById("f-phone").value.trim();
    form.email = document.getElementById("f-email").value.trim();
    if (!form.name || !form.phone || !form.email) { PP2.toast("Vul alle verplichte velden in."); return false; }
    return true;
  }
  function validateStep1() {
    if (form.fulfilment === "delivery") {
      form.postcode = document.getElementById("f-postcode").value.trim();
      form.city = document.getElementById("f-city").value.trim();
      form.street = document.getElementById("f-street").value.trim();
      form.houseNumber = document.getElementById("f-housenr").value.trim();
      form.notes = document.getElementById("f-notes").value.trim();
      if (!form.postcode || !form.city || !form.street || !form.houseNumber) { PP2.toast("Vul je volledige adres in."); return false; }
    }
    return true;
  }

  function wirePanel() {
    document.getElementById("next1")?.addEventListener("click", () => { if (validateStep0()) { current = 1; renderPanel(); } });

    document.getElementById("opt-delivery")?.addEventListener("click", () => { form.fulfilment = "delivery"; Cart.setFulfilment("delivery"); renderPanel(); renderSummary(); });
    document.getElementById("opt-pickup")?.addEventListener("click", () => { form.fulfilment = "pickup"; Cart.setFulfilment("pickup"); renderPanel(); renderSummary(); });
    document.getElementById("back2")?.addEventListener("click", () => { current = 0; renderPanel(); });
    document.getElementById("next2")?.addEventListener("click", () => { if (validateStep1()) { current = 2; renderPanel(); } });

    document.querySelectorAll("[data-pay]").forEach(el => el.addEventListener("click", () => { form.payment = el.dataset.pay; renderPanel(); }));
    document.getElementById("back3")?.addEventListener("click", () => { current = 1; renderPanel(); });
    document.getElementById("next3")?.addEventListener("click", () => { current = 3; renderPanel(); });

    document.getElementById("back4")?.addEventListener("click", () => { current = 2; renderPanel(); });
    document.getElementById("placeOrder")?.addEventListener("click", () => {
      const order = Orders.create({
        items: Cart.items,
        customer: { name: form.name, phone: form.phone, email: form.email },
        fulfilment: form.fulfilment,
        address: form.fulfilment === "delivery" ? { postcode: form.postcode, city: form.city, street: form.street, houseNumber: form.houseNumber, notes: form.notes } : null,
        payment: form.payment,
        subtotal: Cart.subtotal(), discount: Cart.discount(), deliveryFee: Cart.deliveryFee(), total: Cart.total(),
        couponCode: Cart.couponCode,
      });
      Cart.clear();
      location.href = `track-order.html?id=${order.id}`;
    });
  }

  renderPanel();
  renderSummary();
  document.addEventListener("cart:change", renderSummary);
})();
