/* ==========================================================================
   Pizza Prima 2 — Shared UI: header/footer injection, cart drawer, search,
   favorites, mobile menu, toasts, reveal animations, countdowns, accordions.
   Loaded on every page after data.js and cart.js.
   ========================================================================== */

const PP2 = (() => {

  const NAV_LINKS = [
    { label: "Home", href: "index.html", key: "home" },
    { label: "Menu", href: "menu.html", key: "menu", mega: true },
    { label: "Pizza's", href: "menu.html#pizza", key: "pizza" },
    { label: "Pasta", href: "menu.html#pasta", key: "pasta" },
    { label: "Schotels", href: "menu.html#schotels", key: "schotels" },
    { label: "Broodjes", href: "menu.html#broodjes", key: "broodjes" },
    { label: "Snacks", href: "menu.html#snacks", key: "snacks" },
    { label: "Desserts", href: "menu.html#desserts", key: "desserts" },
    { label: "Dranken", href: "menu.html#dranken", key: "dranken" },
    { label: "Aanbiedingen", href: "offers.html", key: "offers" },
    { label: "Over Ons", href: "about.html", key: "about" },
    { label: "Contact", href: "contact.html", key: "contact" },
  ];

  function money(n) { return "€" + n.toFixed(2).replace(".", ","); }

  function emojiFor(cat) { const c = getCategory(cat); return c ? c.icon : "🍽️"; }

  function badgeHTML(b) {
    const map = { popular: "Populair", new: "Nieuw", spicy: "Pittig", vegetarian: "Vegetarisch", vegan: "Vegan", halal: "Halal" };
    if (!map[b]) return "";
    return `<span class="badge badge-${b === "vegetarian" ? "veggie" : b}">${map[b]}</span>`;
  }

  function mediaBox(src, alt, emoji, cls = "") {
    return `<div class="media-box ${cls}">
      <img src="${src}" alt="${alt}" loading="lazy" onerror="this.remove()">
      <span class="mb-icon" aria-hidden="true">${emoji}</span>
    </div>`;
  }

  function productCard(p) {
    const isFav = Favorites.has(p.id);
    const outOfStock = p.inStock === false;
    return `
    <article class="product-card" data-product-card="${p.id}" style="${outOfStock ? "opacity:.6;" : ""}">
      <div class="product-media">
        ${mediaBox(p.image, p.name, emojiFor(p.cat))}
        <div class="product-badges">${outOfStock ? `<span class="badge" style="background:var(--ink);color:#fff;">Uitverkocht</span>` : p.badges.slice(0, 2).map(badgeHTML).join("")}</div>
        <button class="product-fav ${isFav ? "active" : ""}" data-fav="${p.id}" aria-pressed="${isFav}" aria-label="Favoriet">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
        </button>
      </div>
      <div class="product-body">
        <span class="product-cat">${getCategory(p.cat)?.name || ""}</span>
        <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-tags">${p.badges.slice(2).map(badgeHTML).join("")}</div>
        <div class="product-foot">
          <span class="product-price">${money(p.price)}</span>
          <button class="btn-quickadd" data-quickadd="${p.id}" aria-label="Snel toevoegen" ${outOfStock ? "disabled" : ""}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </article>`;
  }

  /* ---------------- Header / Footer templates ---------------- */
  function headerHTML(active) {
    const dropdownItems = CATEGORIES.map(c => `<a href="menu.html#${c.id}"><span class="ic">${c.icon}</span> ${c.name}</a>`).join("");
    const items = NAV_LINKS.map(l => {
      const isActive = l.key === active;
      if (l.mega) {
        return `<li>
          <a href="${l.href}" class="${isActive ? "active" : ""}">${l.label}
            <svg class="chev" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.6"/></svg>
          </a>
          <div class="mega">${dropdownItems}</div>
        </li>`;
      }
      return `<li><a href="${l.href}" class="${isActive ? "active" : ""}">${l.label}</a></li>`;
    }).join("");

    return `
    <div class="topbar">
      <div class="container">
        <div class="topbar-left">
          <span>📍 Via Roma 12, 3011 AB Rotterdam</span>
          <span>🕓 Vandaag geopend 16:00–22:30</span>
        </div>
        <div class="topbar-right">
          <a href="tel:+31101234567">📞 010 123 4567</a>
          <a href="track-order.html">📦 Bestelling volgen</a>
        </div>
      </div>
    </div>
    <div class="nav-wrap">
      <nav class="navbar" id="navbar">
        <div class="container">
          <a href="index.html" class="brand">
            <span class="brand-mark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 10 12 3l9 7-9 12-9-12Z" fill="#fff" fill-opacity=".92"/><circle cx="9" cy="12" r="1.1" fill="#C6351F"/><circle cx="14" cy="14.5" r="1.1" fill="#C6351F"/><circle cx="12" cy="9.5" r="1.1" fill="#C6351F"/></svg>
            </span>
            <span class="brand-text">
              <span class="brand-name">Pizza Prima 2</span>
              <span class="brand-tag">Cucina Italiana</span>
            </span>
          </a>
          <ul class="nav-menu">${items}</ul>
          <div class="nav-actions">
            <button class="nav-icon-btn" id="searchToggle" aria-label="Zoeken">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <a class="nav-icon-btn" href="account.html#favorites" aria-label="Favorieten">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
              <span class="count" id="favCount" hidden>0</span>
            </a>
            <a class="nav-icon-btn" href="account.html" aria-label="Account">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.2a7.5 7.5 0 0 1 15 0"/></svg>
            </a>
            <button class="nav-icon-btn" id="cartToggle" aria-label="Winkelwagen">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
              <span class="count" id="cartCount" hidden>0</span>
            </button>
            <a href="menu.html" class="btn btn-primary btn-sm nav-cta">Bestel Nu</a>
            <button class="nav-burger" id="burgerToggle" aria-label="Menu openen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
          </div>
        </div>
        <div class="search-input-wrap" id="searchPanel" style="display:none;position:absolute;top:100%;left:0;right:0;padding:14px 28px;background:var(--paper);border-bottom:1px solid var(--border);box-shadow:var(--shadow);">
          <span class="sic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span>
          <input type="text" id="searchInput" placeholder="Zoek op gerecht, ingrediënt of categorie…" autocomplete="off" aria-label="Zoeken in menu">
          <div class="search-suggest" id="searchSuggest"></div>
        </div>
      </nav>
    </div>`;
  }

  function footerHTML() {
    const hours = getHours().map(h => `<li><span>${h.day}</span><span>${h.open ? h.open + " – " + h.close : "Gesloten"}</span></li>`).join("");
    return `
    <div class="container">
      <div class="footer-top">
        <div class="footer-col">
          <a href="index.html" class="footer-brand">
            <span class="brand-mark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 10 12 3l9 7-9 12-9-12Z" fill="#fff" fill-opacity=".92"/></svg></span>
            <span class="brand-name">Pizza Prima 2</span>
          </a>
          <p class="footer-desc">Authentieke Italiaanse keuken, met liefde bereid van verse ingrediënten. Elke pizza, elke pasta — met passie gemaakt sinds 2011.</p>
          <div class="footer-social">
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="TikTok">🎵</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Snel naar</h4>
          <ul>
            <li><a href="menu.html">Volledig menu</a></li>
            <li><a href="offers.html">Aanbiedingen</a></li>
            <li><a href="about.html">Over ons</a></li>
            <li><a href="gallery.html">Galerij</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Account</h4>
          <ul>
            <li><a href="account.html">Mijn account</a></li>
            <li><a href="account.html#orders">Bestelgeschiedenis</a></li>
            <li><a href="track-order.html">Bestelling volgen</a></li>
            <li><a href="faq.html">Veelgestelde vragen</a></li>
            <li><a href="admin/index.html">Beheerpaneel</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Openingstijden</h4>
          <ul class="footer-hours">${hours}</ul>
        </div>
        <div class="footer-col">
          <h4>Blijf op de hoogte</h4>
          <p class="footer-desc">Aanbiedingen en nieuwe gerechten rechtstreeks in je inbox.</p>
          <form class="newsletter-form" id="newsletterForm">
            <input type="email" required placeholder="jij@email.nl" aria-label="E-mailadres">
            <button class="btn btn-primary btn-sm" type="submit">Aanmelden</button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Pizza Prima 2 — Alle rechten voorbehouden.</span>
        <div class="footer-legal">
          <a href="privacy.html">Privacybeleid</a>
          <a href="terms.html">Algemene voorwaarden</a>
          <a href="cookies.html">Cookiebeleid</a>
        </div>
        <div class="payment-icons">
          <span>iDEAL</span><span>Apple Pay</span><span>Google Pay</span><span>Visa</span><span>Mastercard</span><span>Bancontact</span>
        </div>
      </div>
    </div>`;
  }

  function globalUIHTML() {
    return `
    <div class="overlay-scrim" id="scrim"></div>

    <aside class="cart-drawer" id="cartDrawer" aria-label="Winkelwagen">
      <div class="cart-head">
        <h2>Je winkelwagen</h2>
        <button class="btn-icon" id="cartClose" aria-label="Sluiten">✕</button>
      </div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-coupon">
        <input type="text" id="couponInput" placeholder="Couponcode invullen">
        <button class="btn btn-secondary btn-sm" id="couponApply">Toepassen</button>
      </div>
      <div class="cart-foot" id="cartFoot"></div>
    </aside>

    <button class="fab-cart" id="fabCart" hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"/></svg>
      <span id="fabCartCount">0</span> bekijk winkelwagen
    </button>

    <div class="mobile-menu" id="mobileMenu">
      <div class="mobile-menu-head">
        <span class="brand-name font-display">Menu</span>
        <button class="btn-icon" id="mobileMenuClose" aria-label="Sluiten">✕</button>
      </div>
      <ul class="mobile-menu-list">
        ${NAV_LINKS.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}
      </ul>
      <div class="mobile-menu-cta">
        <a href="menu.html" class="btn btn-primary btn-block">Bestel Nu</a>
        <a href="account.html" class="btn btn-secondary btn-block">Mijn account</a>
      </div>
    </div>

    <div class="toast-stack" id="toastStack"></div>

    <div class="modal-scrim" id="quickModalScrim">
      <div class="modal" id="quickModal"></div>
    </div>`;
  }

  /* ---------------- Cart drawer rendering ---------------- */
  function renderCart() {
    const itemsEl = document.getElementById("cartItems");
    const footEl = document.getElementById("cartFoot");
    if (!itemsEl || !footEl) return;

    const count = Cart.itemCount();
    document.querySelectorAll("#cartCount, #fabCartCount").forEach(el => el.textContent = count);
    const badge = document.getElementById("cartCount");
    if (badge) badge.hidden = count === 0;
    const fab = document.getElementById("fabCart");
    if (fab) fab.hidden = count === 0 || window.innerWidth > 760;

    if (Cart.items.length === 0) {
      itemsEl.innerHTML = `<div class="cart-empty">
        <span class="ic">🛒</span>
        <p><strong>Je winkelwagen is leeg.</strong><br>Voeg heerlijke gerechten toe vanuit ons menu.</p>
        <a href="menu.html" class="btn btn-primary btn-sm">Bekijk menu</a>
      </div>`;
      footEl.innerHTML = "";
      return;
    }

    itemsEl.innerHTML = Cart.items.map(i => `
      <div class="cart-item">
        <div class="cart-item-img">${mediaBox(i.image, i.name, emojiFor(i.cat))}</div>
        <div class="cart-item-body">
          <div class="cart-item-top">
            <span class="cart-item-name">${i.name}</span>
            <span class="cart-item-price">${money(i.unitPrice * i.qty)}</span>
          </div>
          ${i.optionLabels.length ? `<div class="cart-item-meta">${i.optionLabels.join(" · ")}</div>` : ""}
          ${i.notes ? `<div class="cart-item-meta">Notitie: ${i.notes}</div>` : ""}
          <div class="cart-item-bottom">
            <div class="qty-stepper">
              <button data-qty-minus="${i.lineId}" aria-label="Minder">−</button>
              <span>${i.qty}</span>
              <button data-qty-plus="${i.lineId}" aria-label="Meer">+</button>
            </div>
            <button class="cart-item-remove" data-remove="${i.lineId}">Verwijderen</button>
          </div>
        </div>
      </div>`).join("");

    const sub = Cart.subtotal(), disc = Cart.discount(), fee = Cart.deliveryFee(), tot = Cart.total();
    footEl.innerHTML = `
      <div class="cart-eta">⏱️ Geschatte ${Cart.fulfilment === "pickup" ? "afhaal" : "bezorg"}tijd: ${Cart.eta()}</div>
      <div class="cart-row"><span>Subtotaal</span><span>${money(sub)}</span></div>
      ${disc > 0 ? `<div class="cart-row"><span>Korting (${Cart.couponCode})</span><span>-${money(disc)}</span></div>` : ""}
      <div class="cart-row"><span>Bezorgkosten</span><span>${fee === 0 ? "Gratis" : money(fee)}</span></div>
      <div class="cart-row"><span>Waarvan BTW (9%)</span><span>${money(Cart.taxIncluded())}</span></div>
      <div class="cart-row total"><span>Totaal</span><span>${money(tot)}</span></div>
      ${sub - disc < Cart.FREE_DELIVERY_THRESHOLD && Cart.fulfilment !== "pickup" ? `<p class="field-hint" style="margin-bottom:12px;">Nog ${money(Cart.FREE_DELIVERY_THRESHOLD - (sub - disc))} tot gratis bezorging</p>` : ""}
      <a href="checkout.html" class="btn btn-primary btn-block btn-lg">Afrekenen</a>
      <button class="btn btn-ghost btn-block" id="continueShopping">Verder winkelen</button>
    `;
  }

  /* ---------------- Toasts ---------------- */
  function toast(message, type = "") {
    const stack = document.getElementById("toastStack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = message;
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; setTimeout(() => el.remove(), 300); }, 2600);
  }

  /* ---------------- Quick add modal ---------------- */
  function openQuickAdd(productId) {
    const p = getProduct(productId);
    if (!p) return;
    const required = p.options.filter(o => o.required);
    if (required.length === 0) {
      Cart.add({ productId: p.id, name: p.name, image: p.image, cat: p.cat, unitPrice: p.price, qty: 1, optionLabels: [] });
      toast(`${p.name} toegevoegd aan winkelwagen ✓`, "success");
      openCart();
      return;
    }
    const scrim = document.getElementById("quickModalScrim");
    const modal = document.getElementById("quickModal");
    let selections = {};
    required.forEach(g => { selections[g.id] = g.choices[0].id; });

    function calcPrice() {
      let price = p.price;
      required.forEach(g => {
        const choice = g.choices.find(c => c.id === selections[g.id]);
        if (choice) price += choice.priceDelta;
      });
      return price;
    }
    function renderModal() {
      modal.innerHTML = `
        <div class="modal-head">
          <h3 class="font-display">${p.name}</h3>
          <button class="btn-icon" id="quickModalClose">✕</button>
        </div>
        <div class="modal-body">
          ${required.map(g => `
            <div class="opt-group">
              <div class="opt-group-head"><span class="opt-group-title">${g.label}</span></div>
              ${g.choices.map(c => `
                <label class="opt-choice ${selections[g.id] === c.id ? "selected" : ""}">
                  <span class="opt-choice-left">
                    <input type="radio" name="${g.id}" value="${c.id}" ${selections[g.id] === c.id ? "checked" : ""} data-qgroup="${g.id}">
                    ${c.label}
                  </span>
                  <span class="opt-choice-price">${c.priceDelta ? (c.priceDelta > 0 ? "+" : "") + money(c.priceDelta) : ""}</span>
                </label>`).join("")}
            </div>`).join("")}
          <p class="field-hint">Meer opties zoals extra toppings vind je op de productpagina.</p>
        </div>
        <div class="opt-sticky-price">
          <strong id="quickModalPrice">${money(calcPrice())}</strong>
          <button class="btn btn-primary" id="quickModalAdd">Toevoegen aan winkelwagen</button>
        </div>`;
      modal.querySelectorAll("[data-qgroup]").forEach(input => {
        input.addEventListener("change", e => {
          selections[e.target.dataset.qgroup] = e.target.value;
          renderModal();
        });
      });
      modal.querySelector("#quickModalClose").addEventListener("click", closeQuickAdd);
      modal.querySelector("#quickModalAdd").addEventListener("click", () => {
        const labels = required.map(g => g.choices.find(c => c.id === selections[g.id]).label);
        Cart.add({ productId: p.id, name: p.name, image: p.image, cat: p.cat, unitPrice: calcPrice(), qty: 1, optionLabels: labels });
        toast(`${p.name} toegevoegd aan winkelwagen ✓`, "success");
        closeQuickAdd();
        openCart();
      });
    }
    renderModal();
    scrim.classList.add("open");
  }
  function closeQuickAdd() { document.getElementById("quickModalScrim").classList.remove("open"); }

  /* ---------------- Drawer / menu open-close ---------------- */
  function openCart() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("scrim").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeAllOverlays() {
    document.getElementById("cartDrawer")?.classList.remove("open");
    document.getElementById("mobileMenu")?.classList.remove("open");
    document.getElementById("scrim")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ---------------- Search ---------------- */
  function wireSearch() {
    const toggle = document.getElementById("searchToggle");
    const panel = document.getElementById("searchPanel");
    const input = document.getElementById("searchInput");
    const suggest = document.getElementById("searchSuggest");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const show = panel.style.display === "none";
      panel.style.display = show ? "block" : "none";
      if (show) input.focus();
    });
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { suggest.classList.remove("open"); return; }
      const results = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.ingredients.some(i => i.toLowerCase().includes(q)) ||
        getCategory(p.cat)?.name.toLowerCase().includes(q)
      ).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8);
      suggest.innerHTML = results.length
        ? results.map(p => `<a class="suggest-item" href="product.html?id=${p.id}">
            <img src="${p.image}" alt="" loading="lazy" onerror="this.src='';this.style.background='var(--sand)'">
            <span><span class="si-name">${p.name}</span><br><span class="si-cat">${getCategory(p.cat)?.name} · ${money(p.price)}</span></span>
          </a>`).join("")
        : `<div style="padding:16px;color:var(--muted);font-size:.85rem;">Geen resultaten voor "${q}"</div>`;
      suggest.classList.add("open");
    });
    document.addEventListener("click", e => {
      if (!panel.contains(e.target) && e.target !== toggle) suggest.classList.remove("open");
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function wireReveal() {
    const els = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .12 });
    els.forEach(el => io.observe(el));
  }

  /* ---------------- Countdown timers ---------------- */
  function wireCountdowns() {
    document.querySelectorAll("[data-countdown-hours]").forEach(el => {
      const endsAt = Date.now() + Number(el.dataset.countdownHours) * 3600 * 1000;
      function tick() {
        const diff = Math.max(0, endsAt - Date.now());
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(h / 24);
        const hh = h % 24;
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerHTML = `
          <div class="cd-unit"><div class="cd-num">${String(d).padStart(2, "0")}</div><div class="cd-lbl">dagen</div></div>
          <div class="cd-unit"><div class="cd-num">${String(hh).padStart(2, "0")}</div><div class="cd-lbl">uur</div></div>
          <div class="cd-unit"><div class="cd-num">${String(m).padStart(2, "0")}</div><div class="cd-lbl">min</div></div>
          <div class="cd-unit"><div class="cd-num">${String(s).padStart(2, "0")}</div><div class="cd-lbl">sec</div></div>`;
      }
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ---------------- Accordion ---------------- */
  function wireAccordions() {
    document.querySelectorAll(".accordion-item").forEach(item => {
      const trigger = item.querySelector(".accordion-trigger");
      const panel = item.querySelector(".accordion-panel");
      trigger?.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        item.parentElement.querySelectorAll(".accordion-item.open").forEach(o => {
          if (o !== item) { o.classList.remove("open"); o.querySelector(".accordion-panel").style.maxHeight = null; }
        });
        item.classList.toggle("open", !isOpen);
        panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
      });
    });
  }

  /* ---------------- Counters ---------------- */
  function wireCounters() {
    document.querySelectorAll("[data-counter]").forEach(el => {
      const target = Number(el.dataset.counter);
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          io.unobserve(el);
          let cur = 0;
          const step = Math.max(1, target / 60);
          const t = setInterval(() => {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(t); }
            el.textContent = Math.floor(cur).toLocaleString("nl-NL") + (el.dataset.suffix || "");
          }, 16);
        });
      }, { threshold: .5 });
      io.observe(el);
    });
  }

  /* ---------------- Favorites wiring (event delegation) ---------------- */
  function wireFavorites() {
    document.body.addEventListener("click", e => {
      const btn = e.target.closest("[data-fav]");
      if (!btn) return;
      const id = btn.dataset.fav;
      const active = Favorites.toggle(id);
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active);
      const svg = btn.querySelector("svg");
      if (svg) svg.setAttribute("fill", active ? "currentColor" : "none");
      toast(active ? "Toegevoegd aan favorieten ♥" : "Verwijderd uit favorieten");
    });
    document.addEventListener("favorites:change", updateFavCount);
    updateFavCount();
  }
  function updateFavCount() {
    const el = document.getElementById("favCount");
    if (!el) return;
    const c = Favorites.count();
    el.textContent = c;
    el.hidden = c === 0;
  }

  /* ---------------- Quick add + cart controls wiring ---------------- */
  function wireGlobalClicks() {
    document.body.addEventListener("click", e => {
      const qa = e.target.closest("[data-quickadd]");
      if (qa) { if (qa.disabled) return; openQuickAdd(qa.dataset.quickadd); return; }

      if (e.target.closest("#cartToggle") || e.target.closest("#fabCart")) { openCart(); return; }
      if (e.target.closest("#cartClose") || e.target === document.getElementById("scrim") || e.target.closest("#continueShopping")) { closeAllOverlays(); return; }
      if (e.target.closest("#burgerToggle")) { document.getElementById("mobileMenu").classList.add("open"); return; }
      if (e.target.closest("#mobileMenuClose")) { closeAllOverlays(); return; }
      if (e.target.closest("#quickModalClose") === null && e.target === document.getElementById("quickModalScrim")) { closeQuickAdd(); return; }

      const plus = e.target.closest("[data-qty-plus]");
      if (plus) { const it = Cart.items.find(i => i.lineId === plus.dataset.qtyPlus); if (it) Cart.updateQty(it.lineId, it.qty + 1); return; }
      const minus = e.target.closest("[data-qty-minus]");
      if (minus) {
        const it = Cart.items.find(i => i.lineId === minus.dataset.qtyMinus);
        if (it) { if (it.qty <= 1) Cart.remove(it.lineId); else Cart.updateQty(it.lineId, it.qty - 1); }
        return;
      }
      const rm = e.target.closest("[data-remove]");
      if (rm) { Cart.remove(rm.dataset.remove); toast("Product verwijderd uit winkelwagen"); return; }

      const mobileLink = e.target.closest("#mobileMenu a");
      if (mobileLink) closeAllOverlays();
    });

    document.body.addEventListener("submit", e => {
      if (e.target.id === "couponForm") return;
      if (e.target.id === "newsletterForm") {
        e.preventDefault();
        toast("Bedankt voor je aanmelding! Check je inbox 📬", "success");
        e.target.reset();
      }
    });

    document.getElementById("couponApply")?.addEventListener("click", () => {
      const input = document.getElementById("couponInput");
      const res = Cart.applyCoupon(input.value);
      toast(res.message, res.ok ? "success" : "");
      if (res.ok) input.value = "";
    });

    document.addEventListener("cart:change", renderCart);
    window.addEventListener("resize", renderCart);
  }

  function wireNavbarScroll() {
    const nav = document.getElementById("navbar");
    if (!nav) return;
    function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function init(opts = {}) {
    document.body.insertAdjacentHTML("afterbegin", `<a href="#main" class="skip-link">Ga naar inhoud</a>`);
    const headerMount = document.getElementById("site-header");
    if (headerMount) headerMount.innerHTML = headerHTML(opts.active);
    const footerMount = document.getElementById("site-footer");
    if (footerMount) footerMount.innerHTML = footerHTML();
    document.body.insertAdjacentHTML("beforeend", globalUIHTML());

    wireNavbarScroll();
    wireSearch();
    wireReveal();
    wireCountdowns();
    wireAccordions();
    wireCounters();
    wireFavorites();
    wireGlobalClicks();
    renderCart();
  }

  return { init, money, badgeHTML, mediaBox, productCard, emojiFor, toast, openCart, closeAllOverlays, renderCart, wireAccordions, wireReveal, wireCountdowns, wireCounters };
})();
