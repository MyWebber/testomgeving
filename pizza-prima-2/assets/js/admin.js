/* ==========================================================================
   Pizza Prima 2 — Admin panel
   Demo-only "backend": all data lives in localStorage via the helpers in
   data.js/cart.js. A real deployment would replace these calls with API
   requests to an authenticated backend + database.
   ========================================================================== */

(function () {
  const AUTH_KEY = "pp2_admin_session_v1";
  const DEMO_PASSWORD = "prima2026";

  function isAuthed() { return sessionStorage.getItem(AUTH_KEY) === "1"; }
  function showApp() {
    document.getElementById("loginGate").classList.add("hidden");
    document.getElementById("adminShell").classList.remove("hidden");
    renderTab(currentTab);
  }
  function showGate() {
    document.getElementById("loginGate").classList.remove("hidden");
    document.getElementById("adminShell").classList.add("hidden");
  }

  document.getElementById("adminLoginBtn").addEventListener("click", () => {
    const pass = document.getElementById("adminPassword").value;
    if (pass === DEMO_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      showApp();
    } else {
      PP2.toast("Onjuist wachtwoord.");
    }
  });
  document.getElementById("adminPassword").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("adminLoginBtn").click(); });
  document.getElementById("adminLogoutBtn").addEventListener("click", () => { sessionStorage.removeItem(AUTH_KEY); showGate(); });

  let currentTab = "dashboard";
  document.querySelectorAll("#adminNav button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#adminNav button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.dataset.tab;
      renderTab(currentTab);
    });
  });

  const main = () => document.getElementById("adminMain");

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    const orders = Orders.all();
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const avgOrder = orders.length ? revenue / orders.length : 0;
    const itemCounts = {};
    orders.forEach(o => o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
    const top = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxCount = top.length ? top[0][1] : 1;
    const lowStock = PRODUCTS.filter(p => p.inStock === false);

    main().innerHTML = `
      <div class="admin-topbar"><h1>Dashboard</h1><span class="text-muted" style="font-size:.82rem;">Bijgewerkt: ${new Date().toLocaleString("nl-NL")}</span></div>
      <div class="stat-grid">
        <div class="stat-tile"><div class="lbl">Totale omzet</div><div class="val">${PP2.money(revenue)}</div></div>
        <div class="stat-tile"><div class="lbl">Bestellingen</div><div class="val">${orders.length}</div></div>
        <div class="stat-tile"><div class="lbl">Gem. bestelwaarde</div><div class="val">${PP2.money(avgOrder)}</div></div>
        <div class="stat-tile"><div class="lbl">Producten uitverkocht</div><div class="val">${lowStock.length}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:22px;align-items:start;">
        <div class="admin-table-wrap" style="padding:22px;">
          <h3 class="font-display" style="margin-bottom:16px;font-size:1.05rem;">Best verkochte gerechten</h3>
          ${top.length ? top.map(([name, count]) => `
            <div class="bar-row">
              <span>${name}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${(count / maxCount) * 100}%;"></div></div>
              <span style="text-align:right;font-weight:700;">${count}×</span>
            </div>`).join("") : `<p class="text-muted">Nog geen bestelgegevens.</p>`}
        </div>
        <div class="admin-table-wrap" style="padding:22px;">
          <h3 class="font-display" style="margin-bottom:16px;font-size:1.05rem;">Recente bestellingen</h3>
          ${orders.slice(0, 5).map(o => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-soft);font-size:.84rem;">
              <span>#${o.id}</span><span>${PP2.money(o.total)}</span>
            </div>`).join("") || `<p class="text-muted">Geen bestellingen.</p>`}
        </div>
      </div>`;
  }

  /* ---------------- Products & stock ---------------- */
  function renderProducts() {
    let catFilter = "all";
    function draw() {
      const overrides = readJSON(ADMIN_KEYS.products, {});
      const list = PRODUCTS.filter(p => catFilter === "all" || p.cat === catFilter);
      main().innerHTML = `
        <div class="admin-topbar">
          <h1>Producten &amp; Voorraad</h1>
          <select id="prodCatFilter" style="padding:9px 14px;border-radius:8px;border:1.5px solid var(--border);">
            <option value="all">Alle categorieën</option>
            ${CATEGORIES.map(c => `<option value="${c.id}" ${catFilter === c.id ? "selected" : ""}>${c.icon} ${c.name}</option>`).join("")}
          </select>
        </div>
        <p class="field-hint" style="margin-bottom:14px;">Beeldbeheer (uploaden/vervangen van productfoto's) vereist een bestandsopslag-backend en is in deze demo niet beschikbaar — prijs, zichtbaarheid en voorraad zijn wel direct te beheren en worden live op de website toegepast.</p>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Product</th><th>Categorie</th><th>Prijs</th><th>Zichtbaar</th><th>Op voorraad</th><th></th></tr></thead>
            <tbody>
              ${list.map(p => `
                <tr data-row="${p.id}">
                  <td><strong>${p.name}</strong></td>
                  <td>${getCategory(p.cat).name}</td>
                  <td><input type="number" step="0.10" min="0" value="${p.price.toFixed(2)}" data-field="price" data-id="${p.id}"></td>
                  <td><label class="switch"><input type="checkbox" data-field="active" data-id="${p.id}" ${p.active !== false ? "checked" : ""}><span class="slider"></span></label></td>
                  <td><label class="switch"><input type="checkbox" data-field="inStock" data-id="${p.id}" ${p.inStock !== false ? "checked" : ""}><span class="slider"></span></label></td>
                  <td><button class="btn btn-secondary btn-sm" data-reset="${p.id}">Reset</button></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>`;

      document.getElementById("prodCatFilter").addEventListener("change", e => { catFilter = e.target.value; draw(); });

      function saveField(id, field, value) {
        const overrides = readJSON(ADMIN_KEYS.products, {});
        overrides[id] = { ...overrides[id], [field]: value };
        writeJSON(ADMIN_KEYS.products, overrides);
        applyProductOverrides();
      }
      main().querySelectorAll('[data-field="price"]').forEach(input => {
        input.addEventListener("change", () => {
          const val = Math.max(0, parseFloat(input.value) || 0);
          saveField(input.dataset.id, "price", val);
          PP2.toast(`Prijs bijgewerkt naar ${PP2.money(val)} ✓`, "success");
        });
      });
      main().querySelectorAll('[data-field="active"], [data-field="inStock"]').forEach(input => {
        input.addEventListener("change", () => {
          saveField(input.dataset.id, input.dataset.field, input.checked);
          PP2.toast("Wijziging opgeslagen ✓", "success");
        });
      });
      main().querySelectorAll("[data-reset]").forEach(btn => {
        btn.addEventListener("click", () => {
          const overrides = readJSON(ADMIN_KEYS.products, {});
          delete overrides[btn.dataset.reset];
          writeJSON(ADMIN_KEYS.products, overrides);
          const p = getProduct(btn.dataset.reset);
          p.price = p.basePrice; p.active = true; p.inStock = true;
          draw();
        });
      });
    }
    draw();
  }

  /* ---------------- Categories ---------------- */
  function renderCategories() {
    main().innerHTML = `
      <div class="admin-topbar"><h1>Categorieën</h1></div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Categorie</th><th>Beschrijving</th><th>Aantal producten</th><th>Zichtbare producten</th></tr></thead>
          <tbody>
            ${CATEGORIES.map(c => {
              const all = PRODUCTS.filter(p => p.cat === c.id);
              const visible = all.filter(p => p.active !== false);
              return `<tr><td>${c.icon} <strong>${c.name}</strong></td><td class="text-muted">${c.desc}</td><td>${all.length}</td><td>${visible.length}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  }

  /* ---------------- Orders ---------------- */
  const STATUS_LABEL = { received: "Ontvangen", preparing: "In bereiding", inoven: "In de oven", outfordelivery: "Onderweg", delivered: "Bezorgd", ready: "Klaar om af te halen" };
  function statusOptionsFor(order) {
    const flow = order.fulfilment === "pickup" ? ["received", "preparing", "inoven", "ready"] : ["received", "preparing", "inoven", "outfordelivery", "delivered"];
    return flow.map(s => `<option value="${s}" ${order.status === s ? "selected" : ""}>${STATUS_LABEL[s]}</option>`).join("");
  }
  function renderOrders() {
    function draw() {
      const orders = Orders.all();
      main().innerHTML = `
        <div class="admin-topbar"><h1>Bestellingen</h1><span class="text-muted" style="font-size:.82rem;">${orders.length} totaal</span></div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Order</th><th>Klant</th><th>Type</th><th>Items</th><th>Totaal</th><th>Status</th><th>Volgen</th></tr></thead>
            <tbody>
              ${orders.length ? orders.map(o => `
                <tr>
                  <td><strong>#${o.id}</strong><br><span class="text-muted" style="font-size:.74rem;">${new Date(o.placedAt).toLocaleString("nl-NL")}</span></td>
                  <td>${o.customer.name}<br><span class="text-muted" style="font-size:.74rem;">${o.customer.phone}</span></td>
                  <td>${o.fulfilment === "pickup" ? "Afhalen" : "Bezorging"}</td>
                  <td>${o.items.reduce((s, i) => s + i.qty, 0)} stuks</td>
                  <td>${PP2.money(o.total)}</td>
                  <td><select data-order-status="${o.id}">${statusOptionsFor(o)}</select></td>
                  <td><a href="../track-order.html?id=${o.id}" target="_blank" class="btn btn-secondary btn-sm">Bekijk</a></td>
                </tr>`).join("") : `<tr><td colspan="7" class="text-muted" style="text-align:center;padding:30px;">Nog geen bestellingen geplaatst.</td></tr>`}
            </tbody>
          </table>
        </div>`;
      main().querySelectorAll("[data-order-status]").forEach(sel => {
        sel.addEventListener("change", () => {
          Orders.updateStatus(sel.dataset.orderStatus, sel.value);
          PP2.toast("Bestelstatus bijgewerkt ✓", "success");
        });
      });
    }
    draw();
  }

  /* ---------------- Coupons & Offers ---------------- */
  function renderOffers() {
    function draw() {
      const custom = getAdminOffers();
      main().innerHTML = `
        <div class="admin-topbar"><h1>Coupons &amp; Aanbiedingen</h1></div>
        <div class="admin-table-wrap" style="margin-bottom:24px;">
          <table class="admin-table">
            <thead><tr><th>Code</th><th>Titel</th><th>Type</th><th>Waarde</th><th>Min. bestelling</th><th>Bron</th><th></th></tr></thead>
            <tbody>
              ${[...OFFERS.map(o => ({ ...o, builtin: true })), ...custom].map(o => `
                <tr>
                  <td><strong>${o.code}</strong></td>
                  <td>${o.title}</td>
                  <td>${o.type}</td>
                  <td>${o.type === "percent" ? o.value + "%" : o.type === "fixed" ? PP2.money(o.value) : "—"}</td>
                  <td>${PP2.money(o.minOrder || 0)}</td>
                  <td>${o.builtin ? "Standaard" : "Aangepast"}</td>
                  <td>${o.builtin ? "" : `<button class="btn btn-secondary btn-sm" data-del-offer="${o.code}">Verwijderen</button>`}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="admin-table-wrap" style="padding:22px;max-width:640px;">
          <h3 class="font-display" style="margin-bottom:16px;font-size:1.05rem;">Nieuwe coupon toevoegen</h3>
          <div class="field-row">
            <div class="field"><label>Code</label><input type="text" id="offCode" placeholder="ZOMER2026"></div>
            <div class="field"><label>Type</label>
              <select id="offType"><option value="percent">Percentage</option><option value="fixed">Vast bedrag</option></select>
            </div>
          </div>
          <div class="field"><label>Titel</label><input type="text" id="offTitle" placeholder="Zomeractie"></div>
          <div class="field"><label>Beschrijving</label><input type="text" id="offDesc" placeholder="Korte omschrijving voor klanten"></div>
          <div class="field-row">
            <div class="field"><label>Waarde</label><input type="number" id="offValue" placeholder="10"></div>
            <div class="field"><label>Min. bestelwaarde (€)</label><input type="number" id="offMin" placeholder="0"></div>
          </div>
          <div class="field"><label>Geldig (uren vanaf nu)</label><input type="number" id="offHours" placeholder="72" value="72"></div>
          <button class="btn btn-primary" id="addOfferBtn">Coupon toevoegen</button>
        </div>`;

      main().querySelectorAll("[data-del-offer]").forEach(btn => {
        btn.addEventListener("click", () => {
          saveAdminOffers(getAdminOffers().filter(o => o.code !== btn.dataset.delOffer));
          PP2.toast("Coupon verwijderd", "success");
          draw();
        });
      });
      document.getElementById("addOfferBtn").addEventListener("click", () => {
        const code = document.getElementById("offCode").value.trim().toUpperCase();
        const title = document.getElementById("offTitle").value.trim();
        if (!code || !title) { PP2.toast("Vul minimaal code en titel in."); return; }
        const offer = {
          code, title,
          desc: document.getElementById("offDesc").value.trim() || title,
          type: document.getElementById("offType").value,
          value: parseFloat(document.getElementById("offValue").value) || 0,
          minOrder: parseFloat(document.getElementById("offMin").value) || 0,
          endsInHours: parseFloat(document.getElementById("offHours").value) || 72,
        };
        saveAdminOffers([...getAdminOffers(), offer]);
        PP2.toast(`Coupon "${code}" toegevoegd ✓`, "success");
        draw();
      });
    }
    draw();
  }

  /* ---------------- Customers (derived from orders) ---------------- */
  function renderCustomers() {
    const orders = Orders.all();
    const byEmail = {};
    orders.forEach(o => {
      const key = o.customer.email || o.customer.phone;
      if (!byEmail[key]) byEmail[key] = { ...o.customer, orders: 0, spent: 0, last: o.placedAt };
      byEmail[key].orders += 1;
      byEmail[key].spent += o.total;
      if (o.placedAt > byEmail[key].last) byEmail[key].last = o.placedAt;
    });
    const customers = Object.values(byEmail).sort((a, b) => b.spent - a.spent);

    main().innerHTML = `
      <div class="admin-topbar"><h1>Klanten</h1><span class="text-muted" style="font-size:.82rem;">${customers.length} klanten</span></div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Naam</th><th>Contact</th><th>Bestellingen</th><th>Totaal besteed</th><th>Laatste bestelling</th></tr></thead>
          <tbody>
            ${customers.length ? customers.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.email}<br><span class="text-muted" style="font-size:.74rem;">${c.phone}</span></td>
                <td>${c.orders}</td>
                <td>${PP2.money(c.spent)}</td>
                <td>${new Date(c.last).toLocaleDateString("nl-NL")}</td>
              </tr>`).join("") : `<tr><td colspan="5" class="text-muted" style="text-align:center;padding:30px;">Nog geen klanten — klanten verschijnen hier zodra er bestellingen zijn geplaatst.</td></tr>`}
          </tbody>
        </table>
      </div>`;
  }

  /* ---------------- Reviews moderation ---------------- */
  function renderReviews() {
    function draw() {
      const reviews = getUserReviews();
      main().innerHTML = `
        <div class="admin-topbar"><h1>Reviews</h1><span class="text-muted" style="font-size:.82rem;">${reviews.length} klantreviews</span></div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Product</th><th>Klant</th><th>Score</th><th>Review</th><th>Datum</th><th></th></tr></thead>
            <tbody>
              ${reviews.length ? reviews.map(r => `
                <tr>
                  <td>${r.productName}</td>
                  <td>${r.name}</td>
                  <td>${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</td>
                  <td style="max-width:280px;">${r.text}</td>
                  <td>${new Date(r.date).toLocaleDateString("nl-NL")}</td>
                  <td><button class="btn btn-secondary btn-sm" data-del-review="${r.id}">Verwijderen</button></td>
                </tr>`).join("") : `<tr><td colspan="6" class="text-muted" style="text-align:center;padding:30px;">Nog geen klantreviews geplaatst via de website.</td></tr>`}
            </tbody>
          </table>
        </div>`;
      main().querySelectorAll("[data-del-review]").forEach(btn => btn.addEventListener("click", () => {
        deleteUserReview(btn.dataset.delReview);
        PP2.toast("Review verwijderd", "success");
        draw();
      }));
    }
    draw();
  }

  /* ---------------- Delivery zones ---------------- */
  function renderZones() {
    function draw() {
      const zones = getZones();
      main().innerHTML = `
        <div class="admin-topbar"><h1>Bezorggebieden</h1></div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Gebied</th><th>Postcodes</th><th>Bezorgkosten (€)</th><th>Actief</th></tr></thead>
            <tbody>
              ${zones.map(z => `
                <tr data-zone="${z.id}">
                  <td><input type="text" data-zfield="name" value="${z.name}" style="max-width:160px;"></td>
                  <td><input type="text" data-zfield="postcodes" value="${z.postcodes}" style="max-width:140px;"></td>
                  <td><input type="number" step="0.10" data-zfield="fee" value="${z.fee}"></td>
                  <td><label class="switch"><input type="checkbox" data-zfield="active" ${z.active ? "checked" : ""}><span class="slider"></span></label></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary" id="saveZonesBtn" style="margin-top:18px;">Wijzigingen opslaan</button>`;

      document.getElementById("saveZonesBtn").addEventListener("click", () => {
        const rows = main().querySelectorAll("[data-zone]");
        const updated = zones.map((z, i) => {
          const row = rows[i];
          return {
            id: z.id,
            name: row.querySelector('[data-zfield="name"]').value,
            postcodes: row.querySelector('[data-zfield="postcodes"]').value,
            fee: parseFloat(row.querySelector('[data-zfield="fee"]').value) || 0,
            active: row.querySelector('[data-zfield="active"]').checked,
          };
        });
        saveZones(updated);
        PP2.toast("Bezorggebieden opgeslagen ✓", "success");
      });
    }
    draw();
  }

  /* ---------------- Opening hours ---------------- */
  function renderHours() {
    const hours = getHours();
    main().innerHTML = `
      <div class="admin-topbar"><h1>Openingstijden</h1></div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Dag</th><th>Gesloten</th><th>Open</th><th>Sluit</th></tr></thead>
          <tbody>
            ${hours.map((h, i) => `
              <tr data-hrow="${i}">
                <td><strong>${h.day}</strong></td>
                <td><label class="switch"><input type="checkbox" data-hfield="closed" ${!h.open ? "checked" : ""}><span class="slider"></span></label></td>
                <td><input type="text" data-hfield="open" value="${h.open || "16:00"}" style="max-width:90px;"></td>
                <td><input type="text" data-hfield="close" value="${h.close || "22:30"}" style="max-width:90px;"></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary" id="saveHoursBtn" style="margin-top:18px;">Openingstijden opslaan</button>`;

    document.getElementById("saveHoursBtn").addEventListener("click", () => {
      const rows = main().querySelectorAll("[data-hrow]");
      const updated = hours.map((h, i) => {
        const row = rows[i];
        const closed = row.querySelector('[data-hfield="closed"]').checked;
        return {
          day: h.day,
          open: closed ? null : row.querySelector('[data-hfield="open"]').value,
          close: closed ? null : row.querySelector('[data-hfield="close"]').value,
        };
      });
      saveHours(updated);
      PP2.toast("Openingstijden opgeslagen ✓ Direct zichtbaar op de website.", "success");
    });
  }

  /* ---------------- Homepage banner ---------------- */
  function renderBanner() {
    const banner = getBanner();
    main().innerHTML = `
      <div class="admin-topbar"><h1>Homepage banner</h1></div>
      <div class="admin-table-wrap" style="padding:24px;max-width:640px;">
        <div class="field"><label>Hero titel (HTML toegestaan, gebruik &lt;em&gt; voor accentkleur)</label>
          <textarea id="bannerTitle" rows="2">${banner.title || "Italiaanse smaak,<br><em>gemaakt om te delen.</em>"}</textarea>
        </div>
        <div class="field"><label>Hero subtekst</label>
          <textarea id="bannerSub" rows="2">${banner.subtitle || "Steenoven pizza's, huisgemaakte pasta en de beste kapsalon van de stad — vers bereid en binnen 30 minuten bij jou op tafel."}</textarea>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" id="saveBannerBtn">Opslaan</button>
          <button class="btn btn-secondary" id="resetBannerBtn">Standaard herstellen</button>
        </div>
      </div>`;
    document.getElementById("saveBannerBtn").addEventListener("click", () => {
      saveBanner({ title: document.getElementById("bannerTitle").value, subtitle: document.getElementById("bannerSub").value });
      PP2.toast("Homepage banner bijgewerkt ✓", "success");
    });
    document.getElementById("resetBannerBtn").addEventListener("click", () => {
      saveBanner({ title: "", subtitle: "" });
      PP2.toast("Terug naar standaard tekst", "success");
      renderBanner();
    });
  }

  /* ---------------- Notifications ---------------- */
  function renderNotifications() {
    const orders = Orders.all().slice(0, 8);
    const lowStock = PRODUCTS.filter(p => p.inStock === false);
    const notes = [
      ...orders.map(o => ({ ic: "🧾", text: `Nieuwe bestelling #${o.id} — ${PP2.money(o.total)}`, time: o.placedAt })),
      ...lowStock.map(p => ({ ic: "⚠️", text: `"${p.name}" is uitverkocht`, time: new Date().toISOString() })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    main().innerHTML = `
      <div class="admin-topbar"><h1>Notificaties</h1></div>
      <div class="admin-table-wrap">
        ${notes.length ? notes.map(n => `
          <div style="display:flex;gap:14px;padding:16px 20px;border-bottom:1px solid var(--border-soft);align-items:center;">
            <span style="font-size:1.2rem;">${n.ic}</span>
            <div style="flex:1;">
              <div style="font-size:.88rem;font-weight:600;">${n.text}</div>
              <div class="text-muted" style="font-size:.74rem;">${new Date(n.time).toLocaleString("nl-NL")}</div>
            </div>
          </div>`).join("") : `<p class="text-muted" style="padding:30px;text-align:center;">Geen meldingen.</p>`}
      </div>`;
  }

  function renderTab(tab) {
    ({
      dashboard: renderDashboard,
      products: renderProducts,
      categories: renderCategories,
      orders: renderOrders,
      offers: renderOffers,
      customers: renderCustomers,
      reviews: renderReviews,
      zones: renderZones,
      hours: renderHours,
      banner: renderBanner,
      notifications: renderNotifications,
    })[tab]?.();
  }

  if (isAuthed()) showApp(); else showGate();
})();
