/* ==========================================================================
   Pizza Prima 2 — Menu data, options engine, and shared content
   In production this would be served from a CMS/database + API. Here it is
   a single static source of truth so every page (menu, product, cart,
   checkout, admin) reads from the same catalog.
   ========================================================================== */

const CATEGORIES = [
  { id: "pizza",    name: "Pizza's",       icon: "🍕", desc: "Steenoven gebakken, dun en krokant." },
  { id: "calzone",  name: "Calzones",      icon: "🥟", desc: "Dichtgevouwen en goudbruin gebakken." },
  { id: "pasta",    name: "Pasta",         icon: "🍝", desc: "Vers bereid, Italiaanse recepten." },
  { id: "turkish",  name: "Turkse Pizza",  icon: "🫓", desc: "Krokante bodem, rijkelijk belegd." },
  { id: "broodjes", name: "Broodjes",      icon: "🥖", desc: "Vers belegde broodjes." },
  { id: "kapsalon", name: "Kapsalon",      icon: "🍟", desc: "De Rotterdamse klassieker." },
  { id: "schotels", name: "Schotels",      icon: "🍛", desc: "Stevige gevulde schotels." },
  { id: "burgers",  name: "Burgers",       icon: "🍔", desc: "Handgemaakte burgers." },
  { id: "snacks",   name: "Snacks",        icon: "🍤", desc: "Perfect om te delen." },
  { id: "salades",  name: "Salades",       icon: "🥗", desc: "Fris en verantwoord." },
  { id: "desserts", name: "Desserts",      icon: "🍰", desc: "Zoete afsluiters." },
  { id: "dranken",  name: "Dranken",       icon: "🥤", desc: "Fris, warm en met bubbels." },
  { id: "sauzen",   name: "Sauzen",        icon: "🥫", desc: "Voor bij alles." },
];

// Curated, stable Unsplash photo ids per family — rendered with a graceful
// emoji fallback (see media.js) if an image ever fails to load.
const IMG = {
  pizza:    ["1513104890138-7c749659a591","1574071318508-1cdbab80d002","1565299624946-b28f40a0ae38","1594007654729-407eedc4be65","1548365328-9f547fb0953b","1571066811602-716837d681de","1552539618-7eec9b4d1796","1590947132387-155cc02f3212","1600891964599-f61ba0e24092","1517248135467-4c7edcad34c4"],
  calzone:  ["1595854341625-f33ee10dbf94","1548365328-9f547fb0953b","1574071318508-1cdbab80d002","1571066811602-716837d681de"],
  pasta:    ["1551183053-bf91a1d81141","1608219992759-8d74ed8d76eb","1595295333158-4742f28fbd85","1621996346565-e3dbc353d2e5","1608756687911-aa1599ab3bd9","1673487154569-e5cbe62c0e3d","1626804475297-411 87991d81e"],
  turkish:  ["1628840042765-356cda07504e","1574071318508-1cdbab80d002","1590947132387-155cc02f3212","1600628421055-4d30de868b8f"],
  broodjes: ["1550507992-eb63ffee0847","1553909489-cd47e0ef937f","1621996346565-e3dbc353d2e5","1554433607-66b5efe9d304","1509722747041-616f39b57569","1600891964092-4316c0bb739f"],
  kapsalon: ["1626804475297-4118b7991d81","1585109649139-366815a0d713","1600628421055-4d30de868b8f","1551782450-a2132b4ba21d"],
  schotels: ["1544025162-d76694265947","1601050690597-df0568f70950","1544025162-d76694265947","1516684732162-798a0062be99","1512058564366-18510be2db19","1606850780554-b55ea4dd0b70"],
  burgers:  ["1568901346375-23c9450c58cd","1550547660-d9450f859349","1571091718767-18b5b1457add","1586190848861-99aa4a171e90","1607013251379-e6eecfffe234","1553979459-d2229ba7433b"],
  snacks:   ["1585109649139-366815a0d713","1541592106381-b31e9677c0e5","1585109649139-366815a0d713","1518013431117-eb1465fa5752","1541592106381-b31e9677c0e5","1541592106381-b31e9677c0e5","1585109649139-366815a0d713"],
  salades:  ["1512621776951-a57141f2eefd","1540420773420-3366772f4999","1551248429-40975aa4de74","1512852939750-1305098529bf","1546069901-ba9599a7e63c"],
  desserts: ["1551024506-0bccd828d307","1571877227200-a0d98ea607e9","1624353365286-3f8d62daad51","1624353365286-3f8d62daad51","1541599468348-e96984315921","1571115177098-24ec42ed204d"],
  dranken:  ["1544145945-f90425340c7e","1521572163474-6864f9cf17ab","1600271886742-f049cd451bba","1544145945-f90425340c7e","1613478223719-2ab802602423","1544145945-f90425340c7e","1584225064785-c62a8b43d148","1560508180-03f285f67ded"],
  sauzen:   ["1472476443507-c7a5948772fc","1472476443507-c7a5948772fc","1472476443507-c7a5948772fc","1472476443507-c7a5948772fc","1472476443507-c7a5948772fc","1472476443507-c7a5948772fc"],
};

function img(cat, i, w = 800) {
  const pool = IMG[cat] || IMG.pizza;
  const id = pool[i % pool.length].replace(/\s+/g, "");
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/* ---------- Reusable customization option groups ---------- */
const OPTIONS = {
  pizzaSize: {
    id: "size", label: "Kies je formaat", type: "single", required: true,
    choices: [
      { id: "26", label: "26 cm — Normaal", priceDelta: 0 },
      { id: "32", label: "32 cm — Groot", priceDelta: 4 },
      { id: "40", label: "40 cm — Familie", priceDelta: 8 },
    ],
  },
  crust: {
    id: "crust", label: "Bodem", type: "single", required: true,
    choices: [
      { id: "normal", label: "Traditioneel dun", priceDelta: 0 },
      { id: "thick", label: "Luchtig dik", priceDelta: 0 },
      { id: "cheese", label: "Kaasrand", priceDelta: 2.5 },
      { id: "glutenfree", label: "Glutenvrije bodem", priceDelta: 2.5 },
    ],
  },
  pizzaExtras: {
    id: "extras", label: "Extra toppings", type: "multiple", required: false,
    choices: [
      { id: "extra-kaas", label: "Extra kaas", priceDelta: 1.5 },
      { id: "pepperoni", label: "Pepperoni", priceDelta: 1.5 },
      { id: "ham", label: "Ham", priceDelta: 1.5 },
      { id: "champignons", label: "Champignons", priceDelta: 1.0 },
      { id: "ui", label: "Rode ui", priceDelta: 1.0 },
      { id: "paprika", label: "Paprika", priceDelta: 1.0 },
      { id: "olijven", label: "Olijven", priceDelta: 1.0 },
      { id: "jalapeno", label: "Jalapeño", priceDelta: 1.0 },
      { id: "spek", label: "Spekjes", priceDelta: 1.5 },
      { id: "gehakt", label: "Gehakt", priceDelta: 2.0 },
      { id: "kip", label: "Gegrilde kip", priceDelta: 2.0 },
      { id: "truffel", label: "Truffelolie", priceDelta: 2.5 },
    ],
  },
  sauceChoice: {
    id: "sauce", label: "Sauskeuze", type: "single", required: false,
    choices: [
      { id: "tomaat", label: "Tomatensaus", priceDelta: 0 },
      { id: "bbq", label: "BBQ-saus", priceDelta: 0 },
      { id: "pesto", label: "Pesto", priceDelta: .5 },
      { id: "witte", label: "Witte roomsaus", priceDelta: .5 },
    ],
  },
  proteinExtra: {
    id: "protein", label: "Extra vlees / vega", type: "multiple", required: false,
    choices: [
      { id: "extra-vlees", label: "Extra portie vlees", priceDelta: 3.0 },
      { id: "extra-falafel", label: "Extra falafel (3st)", priceDelta: 2.5 },
      { id: "extra-kaas2", label: "Extra gesmolten kaas", priceDelta: 1.5 },
    ],
  },
  bunChoice: {
    id: "bun", label: "Broodkeuze", type: "single", required: true,
    choices: [
      { id: "brioche", label: "Brioche bun", priceDelta: 0 },
      { id: "sesame", label: "Sesambroodje", priceDelta: 0 },
      { id: "glutenfree", label: "Glutenvrij broodje", priceDelta: 1.5 },
    ],
  },
  sizeSimple: {
    id: "portion", label: "Portie", type: "single", required: true,
    choices: [
      { id: "klein", label: "Klein", priceDelta: -1.5 },
      { id: "normaal", label: "Normaal", priceDelta: 0 },
      { id: "groot", label: "Groot", priceDelta: 2.5 },
    ],
  },
  drinkSize: {
    id: "drinksize", label: "Formaat", type: "single", required: true,
    choices: [
      { id: "33", label: "33 cl", priceDelta: 0 },
      { id: "50", label: "50 cl", priceDelta: 1.0 },
      { id: "100", label: "1 liter", priceDelta: 2.5 },
    ],
  },
  cookPref: {
    id: "cook", label: "Bereiding", type: "single", required: false,
    choices: [
      { id: "normal", label: "Standaard gebakken", priceDelta: 0 },
      { id: "wellDone", label: "Extra goed doorbakken / krokant", priceDelta: 0 },
    ],
  },
};

function optionsFor(cat) {
  switch (cat) {
    case "pizza":
    case "turkish":
      return [OPTIONS.pizzaSize, OPTIONS.crust, OPTIONS.pizzaExtras];
    case "calzone":
      return [OPTIONS.crust, OPTIONS.pizzaExtras];
    case "pasta":
      return [OPTIONS.sizeSimple, OPTIONS.proteinExtra, OPTIONS.cookPref];
    case "broodjes":
    case "kapsalon":
    case "schotels":
      return [OPTIONS.sauceChoice, OPTIONS.proteinExtra];
    case "burgers":
      return [OPTIONS.bunChoice, OPTIONS.proteinExtra, OPTIONS.cookPref];
    case "snacks":
    case "salades":
      return [OPTIONS.sauceChoice];
    case "dranken":
      return [OPTIONS.drinkSize];
    default:
      return [];
  }
}

/* ---------- Product catalog ---------- */
/* p = price, b = badges, ing = ingredients, alg = allergens, cal = calories */
const RAW_PRODUCTS = [
  // PIZZA
  ["pizza","Margherita","Klassieker met San Marzano tomaten, mozzarella di bufala en verse basilicum.",10.5,["popular","vegetarian"],["Tomatensaus","Mozzarella","Basilicum","Olijfolie"],["Gluten","Melk"],780],
  ["pizza","Pizza Prima Speciale","Ons huisrecept: burrata, prosciutto crudo, rucola en oude parmezaan.",15.5,["popular","new"],["Tomatensaus","Burrata","Prosciutto crudo","Rucola","Parmezaan"],["Gluten","Melk"],920],
  ["pizza","Diavola","Voor de liefhebbers van pittig: salami piccante en verse chili.",12.5,["spicy"],["Tomatensaus","Mozzarella","Salami piccante","Chili"],["Gluten","Melk"],860],
  ["pizza","Quattro Formaggi","Vier kazen: mozzarella, gorgonzola, parmezaan en taleggio.",13.5,["vegetarian"],["Mozzarella","Gorgonzola","Parmezaan","Taleggio"],["Gluten","Melk"],910],
  ["pizza","Prosciutto e Funghi","Ham en verse champignons op een romige tomatensaus.",12,[],["Tomatensaus","Mozzarella","Ham","Champignons"],["Gluten","Melk"],830],
  ["pizza","Vegetariana","Paprika, courgette, aubergine, rode ui en olijven.",12,["vegetarian"],["Tomatensaus","Mozzarella","Paprika","Courgette","Aubergine","Olijven"],["Gluten","Melk"],770],
  ["pizza","Vegan Verdure","100% plantaardige mozzarella met cherrytomaatjes en rucola.",13,["vegan"],["Tomatensaus","Plantaardige mozzarella","Cherrytomaat","Rucola","Spinazie"],["Gluten"],700],
  ["pizza","Tonno e Cipolla","Tonijn, rode ui en kappertjes.",12.5,[],["Tomatensaus","Mozzarella","Tonijn","Rode ui","Kappertjes"],["Gluten","Melk","Vis"],820],
  ["pizza","Calabrese","'Nduja, krokante spekjes en een vleugje honing.",14,["spicy","new"],["Tomatensaus","Mozzarella","'Nduja","Spekjes","Honing"],["Gluten","Melk"],940],
  ["pizza","Bianca Tartufo","Truffelroom, champignons, parmezaan en rucola — zonder tomatensaus.",16.5,["popular"],["Truffelroom","Mozzarella","Champignons","Parmezaan","Rucola"],["Gluten","Melk"],960],
  // CALZONE
  ["calzone","Calzone Classico","Dichtgevouwen met ham, champignons en mozzarella.",12.5,[],["Tomatensaus","Mozzarella","Ham","Champignons"],["Gluten","Melk"],880],
  ["calzone","Calzone Diavola","Pittige salami en chili in een krokant gebakken deeg.",13.5,["spicy"],["Tomatensaus","Mozzarella","Salami piccante","Chili"],["Gluten","Melk"],900],
  ["calzone","Calzone Vegetariano","Spinazie, ricotta en cherrytomaat.",12.5,["vegetarian"],["Ricotta","Spinazie","Mozzarella","Cherrytomaat"],["Gluten","Melk"],780],
  ["calzone","Calzone Quattro Stagioni","Ham, champignons, artisjok en olijven — vier vakken, vier smaken.",13.5,[],["Tomatensaus","Mozzarella","Ham","Champignons","Artisjok","Olijven"],["Gluten","Melk"],860],
  // PASTA
  ["pasta","Spaghetti Bolognese","Uren getrokken huisgemaakte ragù met verse parmezaan.",13.5,["popular"],["Spaghetti","Rundvlees ragù","Tomaat","Parmezaan"],["Gluten","Melk"],790],
  ["pasta","Penne Arrabbiata","Pittige tomatensaus met knoflook en chili.",11.5,["spicy","vegan"],["Penne","Tomaat","Knoflook","Chili","Olijfolie"],["Gluten"],650],
  ["pasta","Fettuccine Alfredo","Romige boter-parmezaansaus.",13,["vegetarian"],["Fettuccine","Boter","Room","Parmezaan"],["Gluten","Melk"],830],
  ["pasta","Tagliatelle al Tartufo","Truffelroom, champignons en parmezaan.",16,["popular"],["Tagliatelle","Truffelroom","Champignons","Parmezaan"],["Gluten","Melk"],860],
  ["pasta","Lasagne della Casa","Gelaagd rundvlees, bechamelsaus en mozzarella, uit de oven.",14.5,["popular"],["Pastabladen","Rundvlees ragù","Bechamel","Mozzarella"],["Gluten","Melk","Ei"],920],
  ["pasta","Pasta Pesto Genovese","Basilicumpesto, pijnboompitten en parmezaan.",12.5,["vegetarian"],["Pasta","Basilicumpesto","Pijnboompitten","Parmezaan"],["Gluten","Melk","Noten"],740],
  ["pasta","Spaghetti Frutti di Mare","Garnalen, mosselen en inktvis op een lichte tomatensaus.",17.5,["new"],["Spaghetti","Garnalen","Mosselen","Inktvis","Tomaat"],["Gluten","Schaaldieren","Weekdieren"],780],
  // TURKISH
  ["turkish","Turkse Pizza Kaas","Krokante bodem met mozzarella, Turkse kaas en peterselie.",7.5,["vegetarian"],["Deeg","Mozzarella","Turkse kaas","Peterselie"],["Gluten","Melk"],610],
  ["turkish","Turkse Pizza Gehakt","Belegen met rundergehakt, ui, paprika en peterselie.",8.5,["popular"],["Deeg","Rundergehakt","Ui","Paprika","Peterselie"],["Gluten"],690],
  ["turkish","Turkse Pizza Kip","Kipfilet, paprika, ui en Turkse kruiden.",8.5,[],["Deeg","Kipfilet","Paprika","Ui","Kruiden"],["Gluten"],650],
  ["turkish","Turkse Pizza Mix","Gehakt, kaas en een ei erover.",9.5,[],["Deeg","Rundergehakt","Kaas","Ei"],["Gluten","Melk","Ei"],740],
  // BROODJES
  ["broodjes","Broodje Kapsalon Kip","Halal kip, patat, gesmolten kaas, sla, ui en huissauzen.",9.5,["popular","halal"],["Stokbrood","Kip","Patat","Kaas","Sla","Knoflooksaus"],["Gluten","Melk"],880],
  ["broodjes","Broodje Shoarma","Mals shoarmavlees met sla, ui, knoflook- en pikante saus.",7.5,["halal"],["Pitabroodje","Shoarma","Sla","Ui","Knoflooksaus","Pikante saus"],["Gluten"],650],
  ["broodjes","Broodje Falafel","Krokante falafel, hummus, sla en tahin.",6.5,["vegan"],["Broodje","Falafel","Hummus","Sla","Tahin"],["Gluten","Sesam"],540],
  ["broodjes","Broodje Gezond","Ei, kaas, ham, sla, tomaat en komkommer.",5.5,["vegetarian"],["Broodje","Ei","Kaas","Ham","Sla","Tomaat","Komkommer"],["Gluten","Melk","Ei"],480],
  ["broodjes","Broodje Frikandel Speciaal","Frikandel met curry, mayonaise en ui.",4.5,[],["Broodje","Frikandel","Curry","Mayonaise","Ui"],["Gluten","Ei"],560],
  ["broodjes","Broodje Kipfilet","Gegrilde kipfilet, sla en honing-mosterd.",7,[],["Broodje","Kipfilet","Sla","Honing-mosterd"],["Gluten","Mosterd"],510],
  // KAPSALON
  ["kapsalon","Kapsalon Kip","Patat, halal kip, gesmolten kaas, sla, knoflook- en pikante saus.",10.5,["popular","halal"],["Patat","Kip","Kaas","Sla","Knoflooksaus","Pikante saus"],["Gluten","Melk"],1050],
  ["kapsalon","Kapsalon Shoarma","Patat, shoarma, gesmolten kaas, sla en huissauzen.",11,["halal"],["Patat","Shoarma","Kaas","Sla","Sauzen"],["Gluten","Melk"],1080],
  ["kapsalon","Kapsalon Falafel","Patat, falafel, gesmolten kaas, sla en tahinsaus.",10,["vegetarian"],["Patat","Falafel","Kaas","Sla","Tahin"],["Gluten","Melk","Sesam"],960],
  ["kapsalon","Kapsalon Gemengd","Kip én shoarma samen, extra kaas en extra saus.",12.5,["new","halal"],["Patat","Kip","Shoarma","Extra kaas","Sauzen"],["Gluten","Melk"],1150],
  // SCHOTELS
  ["schotels","Shoarmaschotel","Mals shoarmavlees met patat of rijst, salade en sauzen.",14.5,["popular","halal"],["Shoarma","Patat/Rijst","Salade","Sauzen","Pitabroodje"],["Gluten"],1020],
  ["schotels","Kipschotel","Gegrilde kipfilet met patat of rijst, salade en sauzen.",13.5,["halal"],["Kipfilet","Patat/Rijst","Salade","Sauzen"],["Gluten"],920],
  ["schotels","Mixschotel","Shoarma, kip én kofta samen op één bord.",16.5,["halal"],["Shoarma","Kip","Kofta","Patat/Rijst","Salade"],["Gluten"],1180],
  ["schotels","Kapsalonschotel XL","Dubbele portie kapsalon, extra kaas, voor de echte trek.",17.5,["new","halal"],["Patat","Kip/Shoarma","Extra kaas","Sla","Sauzen"],["Gluten","Melk"],1350],
  ["schotels","Vegetarische Schotel","Falafel, gegrilde groenten en hummus met salade.",13,["vegetarian"],["Falafel","Gegrilde groenten","Hummus","Salade"],["Sesam"],780],
  ["schotels","Lamsvleesschotel","Mals lamsvlees met rijst, salade en knoflooksaus.",16,["halal"],["Lamsvlees","Rijst","Salade","Knoflooksaus"],["Melk"],1080],
  // BURGERS
  ["burgers","Prima Classic Burger","150g rundvlees, cheddar, sla, tomaat en huissaus.",10.5,["popular"],["Rundvlees","Cheddar","Sla","Tomaat","Huissaus","Brioche bun"],["Gluten","Melk","Ei"],780],
  ["burgers","Bacon BBQ Burger","Rundvlees, krokante bacon, bbq-saus en gefrituurde ui.",12,[],["Rundvlees","Bacon","BBQ-saus","Gefrituurde ui","Brioche bun"],["Gluten"],920],
  ["burgers","Chicken Crunch Burger","Krokant gepaneerde kip met sla en honing-mosterd.",10.5,[],["Kipfilet","Sla","Honing-mosterd","Brioche bun"],["Gluten","Mosterd"],830],
  ["burgers","Veggie Burger","Plantaardige burger met avocado, sla en chipotle mayo.",10.5,["vegetarian"],["Groenteburger","Avocado","Sla","Chipotle mayo","Brioche bun"],["Gluten","Ei"],700],
  ["burgers","Vegan Burger Deluxe","100% plantaardig met veganistische kaas en rode ui.",11.5,["vegan"],["Plantaardige burger","Veganistische kaas","Rode ui","Broodje"],["Gluten"],690],
  ["burgers","Double Trouble Burger","Dubbel rundvlees, dubbel kaas en bacon.",14.5,["spicy","new"],["2x Rundvlees","2x Cheddar","Bacon","Jalapeño","Brioche bun"],["Gluten","Melk"],1240],
  // SNACKS
  ["snacks","Patat","Huisgesneden friet, krokant vanbuiten, zacht vanbinnen.",3.5,["vegan"],["Aardappel","Zonnebloemolie"],[],540],
  ["snacks","Bitterballen (8 stuks)","Romige rundvlees ragout, geserveerd met mosterd.",6.5,["popular"],["Rundvlees ragout","Paneermeel","Mosterd"],["Gluten","Melk","Ei"],620],
  ["snacks","Mozzarella Sticks (6 stuks)","Krokant gepaneerde mozzarella met marinara dip.",6,["vegetarian"],["Mozzarella","Paneermeel","Marinarasaus"],["Gluten","Melk"],640],
  ["snacks","Kipnuggets (8 stuks)","Krokante kipnuggets met bbq- of honing-mosterddip.",5.5,[],["Kipfilet","Paneermeel"],["Gluten"],560],
  ["snacks","Loaded Fries","Patat met kaassaus, krokante bacon en bosui.",7.5,["new"],["Patat","Kaassaus","Bacon","Bosui"],["Melk"],780],
  ["snacks","Uienringen","Krokante uienringen met chilimayo.",5,["vegetarian"],["Ui","Beslag","Chilimayo"],["Gluten","Ei"],520],
  ["snacks","Kroket (2 stuks)","Klassieke rundvleeskroket met mosterd.",4.5,[],["Rundvlees ragout","Paneermeel","Mosterd"],["Gluten","Melk"],480],
  // SALADES
  ["salades","Caesar Salade","Romaine sla, krokante kip, parmezaan, croutons en caesar dressing.",11.5,["popular"],["Romaine sla","Kip","Parmezaan","Croutons","Caesar dressing"],["Gluten","Melk","Ei","Vis"],520],
  ["salades","Caprese Salade","Buffelmozzarella, tomaat, basilicum en olijfolie.",10.5,["vegetarian"],["Buffelmozzarella","Tomaat","Basilicum","Olijfolie"],["Melk"],420],
  ["salades","Griekse Salade","Feta, olijven, komkommer, tomaat en rode ui.",10,["vegetarian"],["Feta","Olijven","Komkommer","Tomaat","Rode ui"],["Melk"],390],
  ["salades","Tonijnsalade","Tonijn, ei, olijven en cherrytomaat op een bedje van sla.",11,[],["Tonijn","Ei","Olijven","Cherrytomaat","Sla"],["Vis","Ei"],440],
  ["salades","Quinoa Powerbowl","Quinoa, avocado, geroosterde groenten en granaatappel.",12,["vegan","new"],["Quinoa","Avocado","Geroosterde groenten","Granaatappel"],[],460],
  // DESSERTS
  ["desserts","Tiramisu Classico","Huisgemaakt met mascarpone, espresso en cacao.",6.5,["popular"],["Mascarpone","Lange vingers","Espresso","Cacao"],["Gluten","Melk","Ei"],420],
  ["desserts","Panna Cotta","Zachte vanillepudding met rood fruitcoulis.",5.5,["vegetarian"],["Room","Vanille","Rood fruitcoulis"],["Melk"],360],
  ["desserts","Cannoli Siciliani (2 stuks)","Krokant gebak gevuld met ricotta en pistache.",6,["new"],["Cannoli deeg","Ricotta","Pistache"],["Gluten","Melk","Noten"],400],
  ["desserts","Chocolate Lava Cake","Warme chocoladetaart met vloeibare kern en vanille-ijs.",6.5,["popular"],["Pure chocolade","Boter","Ei","Vanille-ijs"],["Gluten","Melk","Ei"],520],
  ["desserts","Affogato","Romig vanille-ijs met een shot verse espresso.",5,["vegetarian"],["Vanille-ijs","Espresso"],["Melk"],280],
  ["desserts","Nutella Pizza Dessert","Pizzadeeg met nutella, poedersuiker en aardbeien.",7.5,["popular"],["Pizzadeeg","Nutella","Poedersuiker","Aardbeien"],["Gluten","Melk","Noten"],640],
  // DRANKEN
  ["dranken","Cola","Cola / Cola Zero / Fanta / Sprite.",2.5,[],["Koolzuurhoudende frisdrank"],[],140],
  ["dranken","San Pellegrino Aranciata","Italiaans bruisend sinaasappelfris.",3,["vegan"],["Sinaasappelsap","Koolzuur"],[],120],
  ["dranken","Chinotto","Italiaanse bittere frisdrank.",3,["vegan"],["Chinotto extract","Koolzuur"],[],110],
  ["dranken","Water","Plat of bruisend bronwater.",2,["vegan"],["Bronwater"],[],0],
  ["dranken","Verse Jus d'Orange","Vers geperst sinaasappelsap.",3.5,["vegan"],["Sinaasappels"],[],160],
  ["dranken","Ice Tea","Frisse ice tea met citroen.",2.5,["vegan"],["Thee-extract","Citroen"],[],120],
  ["dranken","Birra Moretti","Italiaans bier van de tap of fles.",4,[],["Gerstemout","Hop"],["Gluten"],150],
  ["dranken","Huiswijn Rosso/Bianco","Glas Italiaanse rode of witte huiswijn.",5.5,["vegan"],["Druiven"],["Sulfieten"],125],
  // SAUZEN
  ["sauzen","Knoflooksaus","Romige huisgemaakte knoflooksaus.",0.75,["vegetarian"],["Mayonaise","Knoflook"],["Ei"],90],
  ["sauzen","Pikante Saus","Pittige huisgemaakte chilisaus.",0.75,["spicy","vegan"],["Chili","Tomaat","Kruiden"],[],40],
  ["sauzen","Curry Saus","Zoete curry ketchup.",0.75,["vegan"],["Tomaat","Curry","Kruiden"],[],60],
  ["sauzen","Mayonaise","Romige klassieke mayonaise.",0.75,["vegetarian"],["Zonnebloemolie","Ei"],["Ei"],95],
  ["sauzen","Ketchup","Klassieke tomatenketchup.",0.75,["vegan"],["Tomaat","Suiker","Azijn"],[],35],
  ["sauzen","Truffelmayo","Mayonaise op smaak gebracht met zwarte truffel.",1.25,["vegetarian"],["Mayonaise","Truffel"],["Ei"],100],
];

const PRODUCTS = RAW_PRODUCTS.map((row, i) => {
  const [cat, name, desc, price, badges, ingredients, allergens, calories] = row;
  const id = `${cat}-${name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  const catIndex = RAW_PRODUCTS.slice(0, i).filter(r => r[0] === cat).length;
  return {
    id, cat, name, desc, price,
    badges, // subset of: popular,new,spicy,vegetarian,vegan,halal
    ingredients, allergens, calories,
    image: img(cat, catIndex),
    rating: (4 + Math.random() * .9).toFixed(1) * 1,
    reviewCount: 8 + Math.floor(Math.random() * 210),
    options: optionsFor(cat),
  };
});

function getProduct(id) { return PRODUCTS.find(p => p.id === id); }
function getProductsByCat(cat) { return PRODUCTS.filter(p => p.cat === cat && p.active !== false); }
function getCategory(id) { return CATEGORIES.find(c => c.id === id); }

/* ---------- Admin overrides (localStorage) ----------
   Lets the admin panel edit prices/stock/visibility, opening hours, the
   homepage banner text, and extra coupons — and have those changes reflect
   immediately across the storefront, without a real backend. */
const ADMIN_KEYS = {
  products: "pp2_admin_products_v1",
  hours: "pp2_admin_hours_v1",
  banner: "pp2_admin_banner_v1",
  offers: "pp2_admin_offers_v1",
  zones: "pp2_admin_zones_v1",
};
function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function applyProductOverrides() {
  const overrides = readJSON(ADMIN_KEYS.products, {});
  PRODUCTS.forEach(p => {
    if (p.active === undefined) p.active = true;
    if (p.inStock === undefined) p.inStock = true;
    if (p.basePrice === undefined) p.basePrice = p.price;
    const o = overrides[p.id];
    if (!o) return;
    if (typeof o.price === "number") p.price = o.price;
    if (typeof o.active === "boolean") p.active = o.active;
    if (typeof o.inStock === "boolean") p.inStock = o.inStock;
  });
}
applyProductOverrides();

function getHours() {
  const override = readJSON(ADMIN_KEYS.hours, null);
  return override && override.length === 7 ? override : DEFAULT_HOURS;
}
function saveHours(hours) { writeJSON(ADMIN_KEYS.hours, hours); }

function getBanner() {
  return readJSON(ADMIN_KEYS.banner, { title: "", subtitle: "" });
}
function saveBanner(banner) { writeJSON(ADMIN_KEYS.banner, banner); }

function getAdminOffers() { return readJSON(ADMIN_KEYS.offers, []); }
function saveAdminOffers(list) { writeJSON(ADMIN_KEYS.offers, list); }
function getAllOffers() { return [...OFFERS, ...getAdminOffers()]; }

const REVIEWS_KEY = "pp2_user_reviews_v1";
function getUserReviews(productId) {
  const all = readJSON(REVIEWS_KEY, []);
  return productId ? all.filter(r => r.productId === productId) : all;
}
function addUserReview(review) {
  const all = readJSON(REVIEWS_KEY, []);
  const record = { id: "rv" + Date.now(), date: new Date().toISOString(), ...review };
  all.unshift(record);
  writeJSON(REVIEWS_KEY, all);
  return record;
}
function deleteUserReview(id) {
  writeJSON(REVIEWS_KEY, readJSON(REVIEWS_KEY, []).filter(r => r.id !== id));
}

function getZones() {
  return readJSON(ADMIN_KEYS.zones, [
    { id: "z1", name: "Centrum", postcodes: "3011–3013", fee: 0, active: true },
    { id: "z2", name: "Noord", postcodes: "3031–3035", fee: 1.5, active: true },
    { id: "z3", name: "Zuid", postcodes: "3071–3079", fee: 2.5, active: true },
    { id: "z4", name: "Buitenring (>6km)", postcodes: "Overig", fee: 0, active: false },
  ]);
}
function saveZones(list) { writeJSON(ADMIN_KEYS.zones, list); }

/* ---------- Offers ---------- */
const OFFERS = [
  { code: "PRIMA10", title: "10% korting op je eerste bestelling", desc: "Nieuwe klanten krijgen 10% korting vanaf €20 bestelwaarde.", type: "percent", value: 10, minOrder: 20, endsInHours: 240 },
  { code: "2VOOR1PIZZA", title: "Buy 2 Get 1 Free op pizza's", desc: "Bestel 2 pizza's, de goedkoopste derde is gratis. Elke maandag en dinsdag.", type: "bogo", minOrder: 0, endsInHours: 48 },
  { code: "STUDENT15", title: "Studentenkorting 15%", desc: "Toon je studentenkaart bij bezorging of afhalen voor 15% korting.", type: "percent", value: 15, minOrder: 12, endsInHours: 720 },
  { code: "FAMILIE25", title: "Familiedeal — bespaar €7,50", desc: "2 grote pizza's + patat + 1.5L drank voor een vaste familieprijs.", type: "fixed", value: 7.5, minOrder: 35, endsInHours: 96 },
  { code: "WEEKEND5", title: "Weekendactie: €5 korting", desc: "Elk weekend €5 korting vanaf €30 bestelwaarde.", type: "fixed", value: 5, minOrder: 30, endsInHours: 60 },
];

/* ---------- Testimonials ---------- */
const TESTIMONIALS = [
  { name: "Sanne de Vries", role: "Vaste klant sinds 2021", text: "De beste pizza van de stad, zonder twijfel. De bodem is precies goed — krokant maar niet droog. Bezorging is altijd stipt op tijd.", stars: 5 },
  { name: "Youssef El Amrani", role: "Google review", text: "Kapsalon hier is legendarisch. Verse ingrediënten, genereuze porties en de sauzen zijn echt huisgemaakt. Aanrader!", stars: 5 },
  { name: "Lotte Bakker", role: "Vaste klant", text: "Eindelijk een pizzeria die ook aan vegan denkt zonder in te leveren op smaak. De Vegan Verdure is favoriet bij ons gezin.", stars: 5 },
  { name: "Mehmet Yildiz", role: "Google review", text: "Turkse pizza net zoals bij oma. Verrassend goed voor een Italiaanse pizzeria — die combinatie werkt hier echt.", stars: 4 },
  { name: "Fleur Janssen", role: "Vaste klant", text: "Bestel hier al jaren en het niveau blijft hoog. De app/website werkt ook super soepel, binnen 2 minuten besteld.", stars: 5 },
  { name: "Daan Visser", role: "Google review", text: "Tiramisu is werkelijk godenspijs. En de bezorger is altijd vriendelijk. Vijf sterren verdiend.", stars: 5 },
];

/* ---------- FAQ ---------- */
const FAQS = [
  { cat: "Bezorging", q: "Wat is jullie bezorggebied?", a: "Wij bezorgen binnen een straal van 6 km rond onze vestiging aan de Via Roma 12. Vul je postcode in op de bestelpagina om te checken of we bij jou bezorgen." },
  { cat: "Bezorging", q: "Hoe lang duurt de bezorging?", a: "Gemiddeld 25–40 minuten, afhankelijk van drukte en afstand. Je ziet een live schatting zodra je bestelling geplaatst is." },
  { cat: "Bezorging", q: "Wat is de minimale bestelwaarde?", a: "Voor bezorging hanteren we een minimale bestelwaarde van €15. Voor afhalen is er geen minimum." },
  { cat: "Betalen", q: "Welke betaalmethoden accepteren jullie?", a: "iDEAL, Apple Pay, Google Pay, creditcard (Visa/Mastercard), Bancontact, contant en PIN bij bezorging of afhalen." },
  { cat: "Betalen", q: "Kan ik met een cadeaubon of coupon betalen?", a: "Ja, voer je couponcode in tijdens het afrekenen bij stap 'bestelling'. De korting wordt direct verrekend." },
  { cat: "Allergenen", q: "Houden jullie rekening met allergieën?", a: "Zeker. Bij elk product vind je de allergenen vermeld. Heb je een ernstige allergie, vermeld dit dan ook in het notitieveld bij checkout — onze keuken houdt hier extra rekening mee." },
  { cat: "Allergenen", q: "Hebben jullie glutenvrije opties?", a: "Ja, voor pizza's en burgers kun je kiezen voor een glutenvrije bodem/broodje. Let op: onze keuken is niet 100% glutenvrij." },
  { cat: "Openingstijden", q: "Wat zijn de openingstijden?", a: "Dinsdag t/m zondag 16:00–22:30. Op maandag zijn we gesloten. Op feestdagen kunnen tijden afwijken, check de homepage voor actuele info." },
  { cat: "Afhalen", q: "Kan ik mijn bestelling afhalen?", a: "Ja, kies 'Afhalen' bij checkout. Gemiddelde afhaaltijd is 15–20 minuten. Je ontvangt een melding zodra je bestelling klaarstaat." },
  { cat: "Afhalen", q: "Is er parkeergelegenheid?", a: "Voor de deur zijn 4 kortparkeerplekken (max. 15 minuten) speciaal voor afhaalklanten. Ook is er een openbare parkeergarage op 100 meter." },
];

/* ---------- Gallery ---------- */
const GALLERY = [
  { img: img("pizza", 0, 900), alt: "Verse Margherita pizza" },
  { img: img("pasta", 1, 900), alt: "Vers bereide pasta" },
  { img: img("pizza", 3, 900), alt: "Pizza uit de steenoven" },
  { img: img("desserts", 0, 900), alt: "Tiramisu" },
  { img: img("burgers", 2, 900), alt: "Handgemaakte burger" },
  { img: img("pizza", 5, 900), alt: "Diavola pizza" },
  { img: img("schotels", 0, 900), alt: "Shoarmaschotel" },
  { img: img("salades", 1, 900), alt: "Caprese salade" },
  { img: img("pizza", 8, 900), alt: "Calabrese pizza" },
  { img: img("dranken", 6, 900), alt: "Italiaans biertje" },
  { img: img("desserts", 3, 900), alt: "Chocolate lava cake" },
  { img: img("pasta", 4, 900), alt: "Lasagne della casa" },
];

/* ---------- Opening hours (also used by admin) ---------- */
const DEFAULT_HOURS = [
  { day: "Maandag", open: null, close: null },
  { day: "Dinsdag", open: "16:00", close: "22:30" },
  { day: "Woensdag", open: "16:00", close: "22:30" },
  { day: "Donderdag", open: "16:00", close: "22:30" },
  { day: "Vrijdag", open: "16:00", close: "23:00" },
  { day: "Zaterdag", open: "13:00", close: "23:00" },
  { day: "Zondag", open: "13:00", close: "22:00" },
];
