/* ==========================================================================
   Pizza Prima 2 — Product detail page logic
   ========================================================================== */

(function () {
  const params = new URLSearchParams(location.search);
  const product = getProduct(params.get("id")) || PRODUCTS[0];

  document.title = `${product.name} — Pizza Prima 2`;
  document.getElementById("pageDesc").setAttribute("content", product.desc);

  PP2.init({ active: product.cat });

  document.getElementById("breadcrumb").innerHTML =
    `<a href="index.html">Home</a> <span>/</span> <a href="menu.html">Menu</a> <span>/</span>
     <a href="menu.html#${product.cat}">${getCategory(product.cat).name}</a> <span>/</span> <span>${product.name}</span>`;

  /* ---------- Selection state ---------- */
  const selections = {}; // groupId -> id (single) | Set (multiple)
  product.options.forEach(g => {
    if (g.type === "single") selections[g.id] = g.choices[0].id;
    else selections[g.id] = new Set();
  });
  const removedIngredients = new Set();
  let qty = 1;

  function calcPrice() {
    let price = product.price;
    product.options.forEach(g => {
      if (g.type === "single") {
        const c = g.choices.find(c => c.id === selections[g.id]);
        if (c) price += c.priceDelta;
      } else {
        selections[g.id].forEach(id => {
          const c = g.choices.find(c => c.id === id);
          if (c) price += c.priceDelta;
        });
      }
    });
    return price;
  }

  function optionLabels() {
    const labels = [];
    product.options.forEach(g => {
      if (g.type === "single") {
        const c = g.choices.find(c => c.id === selections[g.id]);
        if (c) labels.push(c.label);
      } else if (selections[g.id].size) {
        labels.push([...selections[g.id]].map(id => g.choices.find(c => c.id === id)?.label).join(", "));
      }
    });
    if (removedIngredients.size) labels.push("Zonder " + [...removedIngredients].join(", "));
    return labels;
  }

  /* ---------- Render left/right top ---------- */
  function renderTop() {
    const groupsHTML = product.options.map(g => `
      <div class="opt-group">
        <div class="opt-group-head">
          <span class="opt-group-title">${g.label}${g.required ? "" : " (optioneel)"}</span>
          ${g.type === "multiple" ? `<span class="opt-group-hint">Meerdere mogelijk</span>` : ""}
        </div>
        ${g.choices.map(c => {
          const isSel = g.type === "single" ? selections[g.id] === c.id : selections[g.id].has(c.id);
          return `<label class="opt-choice ${isSel ? "selected" : ""}">
            <span class="opt-choice-left">
              <input type="${g.type === "single" ? "radio" : "checkbox"}" name="${g.id}" value="${c.id}" ${isSel ? "checked" : ""} data-group="${g.id}" data-type="${g.type}">
              ${c.label}
            </span>
            <span class="opt-choice-price">${c.priceDelta ? (c.priceDelta > 0 ? "+" : "") + PP2.money(c.priceDelta) : "Gratis"}</span>
          </label>`;
        }).join("")}
      </div>`).join("");

    const removeHTML = product.ingredients.length ? `
      <div class="opt-group">
        <div class="opt-group-head"><span class="opt-group-title">Ingrediënt verwijderen</span><span class="opt-group-hint">optioneel</span></div>
        ${product.ingredients.map(ing => `
          <label class="opt-choice ${removedIngredients.has(ing) ? "selected" : ""}">
            <span class="opt-choice-left">
              <input type="checkbox" data-remove-ing="${ing}" ${removedIngredients.has(ing) ? "checked" : ""}>
              Zonder ${ing}
            </span>
            <span class="opt-choice-price">Gratis</span>
          </label>`).join("")}
      </div>` : "";

    document.getElementById("productTop").innerHTML = `
      <div>
        <div style="border-radius:var(--radius-xl);overflow:hidden;aspect-ratio:1/1;box-shadow:var(--shadow-lg);position:sticky;top:calc(var(--nav-h) + 24px);">
          ${PP2.mediaBox(product.image, product.name, PP2.emojiFor(product.cat))}
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
          <div>
            <span class="product-cat">${getCategory(product.cat).name}</span>
            <h1 class="font-display" style="font-size:2rem;margin:6px 0 10px;">${product.name}</h1>
          </div>
          <button class="product-fav ${Favorites.has(product.id) ? "active" : ""}" data-fav="${product.id}" style="position:static;" aria-label="Favoriet">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${Favorites.has(product.id) ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
          </button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <span class="stars">${"★".repeat(Math.round(product.rating))}${"☆".repeat(5 - Math.round(product.rating))}</span>
          <span class="text-muted" style="font-size:.84rem;">${product.rating} (${product.reviewCount} reviews)</span>
        </div>
        <div class="product-tags" style="margin-bottom:16px;">${product.badges.map(PP2.badgeHTML).join("")}</div>
        <p class="section-sub" style="margin-bottom:20px;">${product.desc}</p>

        ${groupsHTML}
        ${removeHTML}

        <div class="opt-group">
          <div class="opt-group-head"><span class="opt-group-title">Notitie voor de keuken</span><span class="opt-group-hint">optioneel</span></div>
          <textarea id="kitchenNote" rows="2" placeholder="Bijv. allergie, extra goed doorbakken, geen ui..." style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--border);"></textarea>
        </div>

        <div class="card" style="padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;position:sticky;bottom:16px;box-shadow:var(--shadow-lg);">
          <div class="qty-stepper" style="border-width:1.5px;">
            <button id="qtyMinus" aria-label="Minder">−</button>
            <span id="qtyVal">1</span>
            <button id="qtyPlus" aria-label="Meer">+</button>
          </div>
          <strong id="livePrice" style="font-size:1.5rem;font-family:var(--font-display);">${PP2.money(calcPrice())}</strong>
          <button class="btn btn-primary btn-lg" id="addToCartBtn">Toevoegen aan winkelwagen</button>
        </div>
      </div>`;

    document.querySelectorAll("[data-group]").forEach(input => {
      input.addEventListener("change", e => {
        const { group, type } = e.target.dataset;
        if (type === "single") selections[group] = e.target.value;
        else {
          if (e.target.checked) selections[group].add(e.target.value);
          else selections[group].delete(e.target.value);
        }
        renderTop();
      });
    });
    document.querySelectorAll("[data-remove-ing]").forEach(input => {
      input.addEventListener("change", e => {
        const ing = e.target.dataset.removeIng;
        e.target.checked ? removedIngredients.add(ing) : removedIngredients.delete(ing);
        renderTop();
      });
    });
    document.getElementById("qtyMinus").addEventListener("click", () => { qty = Math.max(1, qty - 1); document.getElementById("qtyVal").textContent = qty; updatePrice(); });
    document.getElementById("qtyPlus").addEventListener("click", () => { qty += 1; document.getElementById("qtyVal").textContent = qty; updatePrice(); });
    document.getElementById("addToCartBtn").addEventListener("click", () => {
      const note = document.getElementById("kitchenNote").value.trim();
      Cart.add({
        productId: product.id, name: product.name, image: product.image, cat: product.cat,
        unitPrice: calcPrice(), qty, optionLabels: optionLabels(), notes: note,
      });
      PP2.toast(`${qty}× ${product.name} toegevoegd aan winkelwagen ✓`, "success");
      PP2.openCart();
    });
    updatePrice();
  }
  function updatePrice() {
    const el = document.getElementById("livePrice");
    if (el) el.textContent = PP2.money(calcPrice() * qty);
  }

  /* ---------- Tabs: ingredients/nutrition + reviews ---------- */
  function renderTabs() {
    document.getElementById("tab-ingredients").innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;">
        <div>
          <h3 class="font-display" style="margin-bottom:14px;">Ingrediënten</h3>
          <ul style="display:flex;flex-direction:column;gap:8px;">
            ${product.ingredients.map(i => `<li style="font-size:.9rem;">• ${i}</li>`).join("")}
          </ul>
        </div>
        <div>
          <h3 class="font-display" style="margin-bottom:14px;">Allergenen &amp; voedingswaarde</h3>
          <p style="font-size:.9rem;margin-bottom:12px;"><strong>Allergenen:</strong> ${product.allergens.length ? product.allergens.join(", ") : "Geen bekende allergenen"}</p>
          <p style="font-size:.9rem;"><strong>Calorieën:</strong> ± ${product.calories} kcal per portie</p>
        </div>
      </div>`;

    const savedReviews = getUserReviews(product.id).map(r => ({ name: r.name, stars: Number(r.stars), text: r.text, verified: true, date: new Date(r.date).toLocaleDateString("nl-NL"), isNew: true }));
    const reviews = [...savedReviews, ...generateReviews(product)];
    document.getElementById("tab-reviews").innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;flex-wrap:wrap;">
        <div style="text-align:center;">
          <div class="font-display" style="font-size:2.6rem;font-weight:700;">${product.rating}</div>
          <div class="stars">${"★".repeat(Math.round(product.rating))}${"☆".repeat(5 - Math.round(product.rating))}</div>
          <div class="text-muted" style="font-size:.78rem;">${product.reviewCount} reviews</div>
        </div>
        <button class="btn btn-secondary" id="writeReviewBtn">Schrijf een review</button>
      </div>
      <div id="reviewForm" class="hidden" style="margin-bottom:26px;padding:18px;border:1.5px solid var(--border);border-radius:var(--radius);">
        <div class="field-row">
          <div class="field"><label>Naam</label><input type="text" id="reviewName" placeholder="Je naam"></div>
          <div class="field"><label>Beoordeling</label>
            <select id="reviewStars"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option></select>
          </div>
        </div>
        <div class="field"><label>Jouw review</label><textarea id="reviewText" rows="3" placeholder="Vertel over je ervaring..."></textarea></div>
        <button class="btn btn-primary btn-sm" id="submitReviewBtn">Plaatsen</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:20px;">
        ${reviews.map(r => `
          <div style="border-bottom:1px solid var(--border-soft);padding-bottom:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <div class="testi-avatar" style="width:34px;height:34px;font-size:.85rem;">${r.name.charAt(0)}</div>
                <strong style="font-size:.88rem;">${r.name}</strong>
                ${r.verified ? `<span class="badge badge-veggie">Geverifieerde aankoop</span>` : ""}
                ${r.isNew ? `<span class="badge badge-new">Jouw review</span>` : ""}
              </div>
              <span class="text-muted" style="font-size:.76rem;">${r.date}</span>
            </div>
            <div class="stars" style="margin-bottom:6px;">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
            <p style="font-size:.88rem;color:var(--ink-soft);line-height:1.6;">${r.text}</p>
          </div>`).join("")}
      </div>`;

    document.getElementById("writeReviewBtn").addEventListener("click", () => document.getElementById("reviewForm").classList.toggle("hidden"));
    document.getElementById("submitReviewBtn").addEventListener("click", () => {
      const name = document.getElementById("reviewName").value.trim() || "Anonieme klant";
      const text = document.getElementById("reviewText").value.trim();
      const stars = document.getElementById("reviewStars").value;
      if (!text) { PP2.toast("Schrijf eerst een review."); return; }
      addUserReview({ productId: product.id, productName: product.name, name, text, stars });
      PP2.toast("Bedankt voor je review! ✓", "success");
      document.getElementById("reviewForm").classList.add("hidden");
      document.getElementById("reviewName").value = "";
      document.getElementById("reviewText").value = "";
      renderTabs();
      document.querySelector('[data-tab="reviews"]').click();
    });
  }

  const REVIEW_POOL = [
    "Echt heerlijk, precies zoals in Italië. Komt zeker terug!",
    "Snel bezorgd en nog warm. Top kwaliteit voor de prijs.",
    "Verrassend goed, de smaken zijn perfect in balans.",
    "Beste in de buurt, bestel dit nu al een jaar regelmatig.",
    "Portie was groot en alles zag er vers uit. Aanrader!",
    "Net iets te zout naar mijn smaak, maar verder prima.",
    "De personalisatie-opties zijn top, precies naar eigen smaak.",
    "Mooie presentatie en heerlijke verse ingrediënten.",
  ];
  const NAME_POOL = ["Anne", "Bram", "Nour", "Julia", "Kevin", "Sophie", "Emre", "Mila", "Rens", "Fatima"];
  function generateReviews(p) {
    let seed = [...p.id].reduce((s, c) => s + c.charCodeAt(0), 0);
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    const n = 3 + Math.floor(rnd() * 3);
    return Array.from({ length: n }, (_, i) => ({
      name: NAME_POOL[Math.floor(rnd() * NAME_POOL.length)],
      stars: 4 + Math.round(rnd()),
      text: REVIEW_POOL[Math.floor(rnd() * REVIEW_POOL.length)],
      verified: rnd() > .25,
      date: `${1 + Math.floor(rnd() * 27)} ${["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"][Math.floor(rnd()*12)]} 2026`,
    }));
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  /* ---------- Frequently bought together + related ---------- */
  function renderCrossSell() {
    const sauces = getProductsByCat("sauzen").slice(0, 2);
    const drink = getProductsByCat("dranken")[0];
    const dessert = getProductsByCat("desserts")[0];
    const fbt = product.cat === "sauzen" ? getProductsByCat("pizza").slice(0, 4) : [...sauces, drink, dessert].filter(Boolean);
    document.getElementById("fbtGrid").innerHTML = fbt.map(PP2.productCard).join("");

    const related = getProductsByCat(product.cat).filter(p => p.id !== product.id).slice(0, 4);
    document.getElementById("relatedGrid").innerHTML = related.length
      ? related.map(PP2.productCard).join("")
      : `<p class="text-muted">Geen gerelateerde gerechten gevonden.</p>`;
  }

  renderTop();
  renderTabs();
  renderCrossSell();
  window.scrollTo(0, 0);
})();
