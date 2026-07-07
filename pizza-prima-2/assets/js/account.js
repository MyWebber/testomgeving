/* ==========================================================================
   Pizza Prima 2 — Account: mock auth, dashboard (orders/addresses/favorites/loyalty)
   Demo-only: there is no real backend, so "auth" is just a local profile —
   this is clearly not secure and is not meant to be.
   ========================================================================== */

(function () {
  PP2.init({ active: "" });

  const ACCOUNT_KEY = "pp2_account_v1";
  const ADDR_KEY = "pp2_addresses_v1";
  const PAY_KEY = "pp2_paymethods_v1";

  function getAccount() { try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY)); } catch { return null; } }
  function setAccount(a) { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a)); }
  function getAddresses() { return JSON.parse(localStorage.getItem(ADDR_KEY) || "[]"); }
  function setAddresses(list) { localStorage.setItem(ADDR_KEY, JSON.stringify(list)); }
  function getPayMethods() { return JSON.parse(localStorage.getItem(PAY_KEY) || "[]"); }
  function setPayMethods(list) { localStorage.setItem(PAY_KEY, JSON.stringify(list)); }

  function renderAuth() {
    document.getElementById("accountArea").innerHTML = `
      <div style="max-width:440px;margin:0 auto;">
        <div class="section-head center">
          <span class="eyebrow"><span class="dot"></span> Account</span>
          <h1 class="section-title" style="font-size:2rem;">Welkom terug</h1>
        </div>
        <div class="tabs" style="justify-content:center;">
          <button class="tab-btn active" data-authtab="login">Inloggen</button>
          <button class="tab-btn" data-authtab="register">Account aanmaken</button>
        </div>
        <div class="tab-panel active" id="authtab-login">
          <div class="card" style="padding:28px;">
            <div class="field"><label>E-mailadres</label><input type="email" id="loginEmail" placeholder="jij@email.nl"></div>
            <div class="field"><label>Wachtwoord</label><input type="password" id="loginPass" placeholder="••••••••"></div>
            <button class="btn btn-primary btn-block btn-lg" id="loginBtn">Inloggen</button>
            <p class="field-hint" style="margin-top:14px;text-align:center;">Demo-omgeving: elk e-mailadres/wachtwoord werkt.</p>
          </div>
        </div>
        <div class="tab-panel" id="authtab-register">
          <div class="card" style="padding:28px;">
            <div class="field"><label>Volledige naam</label><input type="text" id="regName" placeholder="Voor- en achternaam"></div>
            <div class="field"><label>E-mailadres</label><input type="email" id="regEmail" placeholder="jij@email.nl"></div>
            <div class="field"><label>Wachtwoord</label><input type="password" id="regPass" placeholder="Kies een wachtwoord"></div>
            <button class="btn btn-primary btn-block btn-lg" id="registerBtn">Account aanmaken</button>
          </div>
        </div>
      </div>`;

    document.querySelectorAll("[data-authtab]").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll("[data-authtab]").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("authtab-" + btn.dataset.authtab).classList.add("active");
    }));
    document.getElementById("loginBtn").addEventListener("click", () => {
      const email = document.getElementById("loginEmail").value.trim();
      if (!email) { PP2.toast("Vul je e-mailadres in."); return; }
      setAccount({ name: email.split("@")[0], email, joined: new Date().toISOString() });
      renderDashboard();
    });
    document.getElementById("registerBtn").addEventListener("click", () => {
      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      if (!name || !email) { PP2.toast("Vul alle velden in."); return; }
      setAccount({ name, email, joined: new Date().toISOString() });
      PP2.toast("Account aangemaakt! Welkom bij Pizza Prima 2 🎉", "success");
      renderDashboard();
    });
  }

  function loyaltyPoints() {
    const total = Orders.all().reduce((s, o) => s + o.total, 0);
    return Math.floor(total);
  }
  function loyaltyTier(points) {
    if (points >= 300) return { name: "Gold", next: null };
    if (points >= 100) return { name: "Silver", next: 300 };
    return { name: "Bronze", next: 100 };
  }

  function renderDashboard() {
    const acc = getAccount();
    const points = loyaltyPoints();
    const tier = loyaltyTier(points);
    const orders = Orders.all();
    const favProducts = Favorites.all().map(getProduct).filter(Boolean);
    const addresses = getAddresses();
    const payMethods = getPayMethods();

    document.getElementById("accountArea").innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:30px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="testi-avatar" style="width:54px;height:54px;font-size:1.3rem;">${acc.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1 class="font-display" style="font-size:1.5rem;">Hoi, ${acc.name}!</h1>
            <p class="text-muted" style="font-size:.84rem;">${acc.email}</p>
          </div>
        </div>
        <button class="btn btn-secondary" id="logoutBtn">Uitloggen</button>
      </div>

      <div class="tabs" id="dashTabs">
        <button class="tab-btn active" data-tab="overview">Overzicht</button>
        <button class="tab-btn" data-tab="orders">Bestellingen</button>
        <button class="tab-btn" data-tab="addresses">Adressen</button>
        <button class="tab-btn" data-tab="favorites">Favorieten</button>
        <button class="tab-btn" data-tab="payment">Betaalmethoden</button>
      </div>

      <div class="tab-panel active" id="tab-overview">
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-bottom:28px;">
          <div class="card" style="padding:24px;">
            <div class="text-muted" style="font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Prima Punten</div>
            <div class="font-display" style="font-size:2.2rem;font-weight:700;color:var(--tomato-dark);">${points}</div>
            <div class="text-muted" style="font-size:.8rem;">${tier.next ? `Nog ${tier.next - points} punten tot ${tier.name === "Bronze" ? "Silver" : "Gold"}` : "Hoogste niveau bereikt!"}</div>
          </div>
          <div class="card" style="padding:24px;">
            <div class="text-muted" style="font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Ledenniveau</div>
            <div class="font-display" style="font-size:2.2rem;font-weight:700;">${tier.name}</div>
            <div class="text-muted" style="font-size:.8rem;">Lid sinds ${new Date(acc.joined).toLocaleDateString("nl-NL")}</div>
          </div>
          <div class="card" style="padding:24px;">
            <div class="text-muted" style="font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Totaal bestellingen</div>
            <div class="font-display" style="font-size:2.2rem;font-weight:700;">${orders.length}</div>
            <div class="text-muted" style="font-size:.8rem;"><a href="offers.html" style="color:var(--tomato);">Bekijk aanbiedingen →</a></div>
          </div>
        </div>
        ${orders[0] ? `
          <h3 class="font-display" style="margin-bottom:14px;">Snel opnieuw bestellen</h3>
          <div class="card" style="padding:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
            <div>
              <strong>Bestelling #${orders[0].id}</strong>
              <p class="text-muted" style="font-size:.84rem;">${orders[0].items.map(i => i.qty + "× " + i.name).join(", ")}</p>
            </div>
            <button class="btn btn-primary" id="reorderBtn" data-reorder="${orders[0].id}">Opnieuw bestellen</button>
          </div>` : `<p class="text-muted">Nog geen bestellingen geplaatst. <a href="menu.html" style="color:var(--tomato);">Bekijk het menu →</a></p>`}
      </div>

      <div class="tab-panel" id="tab-orders">
        ${orders.length ? orders.map(o => `
          <div class="card" style="padding:20px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:8px;">
              <strong>#${o.id}</strong>
              <span class="badge badge-popular">${statusLabel(o.status)}</span>
            </div>
            <p class="text-muted" style="font-size:.82rem;margin-bottom:10px;">${new Date(o.placedAt).toLocaleString("nl-NL")} · ${o.items.reduce((s, i) => s + i.qty, 0)} items · ${PP2.money(o.total)}</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a href="track-order.html?id=${o.id}" class="btn btn-secondary btn-sm">Bekijk status</a>
              <button class="btn btn-secondary btn-sm" data-reorder="${o.id}">Opnieuw bestellen</button>
            </div>
          </div>`).join("") : `<p class="text-muted">Je hebt nog geen bestellingen geplaatst.</p>`}
      </div>

      <div class="tab-panel" id="tab-addresses">
        <div id="addressList" style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;"></div>
        <div class="card" style="padding:22px;">
          <h3 class="font-display" style="margin-bottom:14px;font-size:1.05rem;">Nieuw adres toevoegen</h3>
          <div class="field-row">
            <div class="field"><label>Label</label><input type="text" id="addrLabel" placeholder="Thuis / Werk"></div>
            <div class="field"><label>Postcode</label><input type="text" id="addrPostcode" placeholder="3011 AB"></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Straat</label><input type="text" id="addrStreet" placeholder="Via Roma"></div>
            <div class="field"><label>Huisnummer</label><input type="text" id="addrHouseNr" placeholder="12A"></div>
          </div>
          <div class="field"><label>Plaats</label><input type="text" id="addrCity" placeholder="Rotterdam"></div>
          <button class="btn btn-primary" id="addAddressBtn">Adres opslaan</button>
        </div>
      </div>

      <div class="tab-panel" id="tab-favorites">
        <div class="grid" id="favGrid">${favProducts.length ? favProducts.map(PP2.productCard).join("") : `<p class="text-muted">Nog geen favorieten. Tik op het hartje bij een gerecht om het hier te bewaren.</p>`}</div>
      </div>

      <div class="tab-panel" id="tab-payment">
        <div id="payList" style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;"></div>
        <div class="card" style="padding:22px;">
          <h3 class="font-display" style="margin-bottom:14px;font-size:1.05rem;">Betaalmethode toevoegen</h3>
          <div class="field-row">
            <div class="field"><label>Type</label>
              <select id="payType"><option value="Visa">Visa</option><option value="Mastercard">Mastercard</option><option value="iDEAL">iDEAL</option></select>
            </div>
            <div class="field"><label>Laatste 4 cijfers</label><input type="text" id="payLast4" maxlength="4" placeholder="1234"></div>
          </div>
          <p class="field-hint" style="margin-bottom:14px;">Demo-omgeving: er worden geen echte kaartgegevens opgeslagen.</p>
          <button class="btn btn-primary" id="addPayBtn">Opslaan</button>
        </div>
      </div>
    `;

    function statusLabel(s) {
      return { received: "Ontvangen", preparing: "In bereiding", inoven: "In de oven", outfordelivery: "Onderweg", delivered: "Bezorgd", ready: "Klaar om af te halen" }[s] || s;
    }

    function renderAddresses() {
      const list = getAddresses();
      document.getElementById("addressList").innerHTML = list.length ? list.map(a => `
        <div class="card" style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
          <div><strong>${a.label}</strong><p class="text-muted" style="font-size:.84rem;">${a.street} ${a.houseNumber}, ${a.postcode} ${a.city}</p></div>
          <button class="btn btn-secondary btn-sm" data-del-addr="${a.id}">Verwijderen</button>
        </div>`).join("") : `<p class="text-muted">Nog geen adressen opgeslagen.</p>`;
      document.querySelectorAll("[data-del-addr]").forEach(b => b.addEventListener("click", () => {
        setAddresses(getAddresses().filter(a => a.id !== b.dataset.delAddr));
        renderAddresses();
      }));
    }
    function renderPayMethods() {
      const list = getPayMethods();
      document.getElementById("payList").innerHTML = list.length ? list.map(p => `
        <div class="card" style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
          <div><strong>${p.type}</strong><p class="text-muted" style="font-size:.84rem;">•••• •••• •••• ${p.last4}</p></div>
          <button class="btn btn-secondary btn-sm" data-del-pay="${p.id}">Verwijderen</button>
        </div>`).join("") : `<p class="text-muted">Nog geen betaalmethoden opgeslagen.</p>`;
      document.querySelectorAll("[data-del-pay]").forEach(b => b.addEventListener("click", () => {
        setPayMethods(getPayMethods().filter(p => p.id !== b.dataset.delPay));
        renderPayMethods();
      }));
    }
    renderAddresses();
    renderPayMethods();

    document.getElementById("logoutBtn").addEventListener("click", () => { localStorage.removeItem(ACCOUNT_KEY); renderAuth(); });
    document.getElementById("addAddressBtn").addEventListener("click", () => {
      const label = document.getElementById("addrLabel").value.trim() || "Thuis";
      const postcode = document.getElementById("addrPostcode").value.trim();
      const street = document.getElementById("addrStreet").value.trim();
      const houseNumber = document.getElementById("addrHouseNr").value.trim();
      const city = document.getElementById("addrCity").value.trim();
      if (!postcode || !street || !houseNumber || !city) { PP2.toast("Vul alle adresvelden in."); return; }
      setAddresses([...getAddresses(), { id: "a" + Date.now(), label, postcode, street, houseNumber, city }]);
      PP2.toast("Adres opgeslagen ✓", "success");
      renderAddresses();
    });
    document.getElementById("addPayBtn").addEventListener("click", () => {
      const type = document.getElementById("payType").value;
      const last4 = document.getElementById("payLast4").value.trim();
      if (!/^\d{4}$/.test(last4)) { PP2.toast("Vul 4 cijfers in."); return; }
      setPayMethods([...getPayMethods(), { id: "p" + Date.now(), type, last4 }]);
      PP2.toast("Betaalmethode opgeslagen ✓", "success");
      renderPayMethods();
    });
    document.querySelectorAll("[data-reorder]").forEach(b => b.addEventListener("click", () => {
      const order = Orders.get(b.dataset.reorder);
      order.items.forEach(i => Cart.add({ productId: i.productId, name: i.name, image: i.image, cat: i.cat, unitPrice: i.unitPrice, qty: i.qty, optionLabels: i.optionLabels, notes: i.notes }));
      PP2.toast("Bestelling toegevoegd aan winkelwagen ✓", "success");
      PP2.openCart();
    }));

    document.querySelectorAll("#dashTabs .tab-btn").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll("#dashTabs .tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    }));

    if (location.hash === "#favorites") document.querySelector('[data-tab="favorites"]')?.click();
    if (location.hash === "#orders") document.querySelector('[data-tab="orders"]')?.click();
  }

  getAccount() ? renderDashboard() : renderAuth();
})();
