/* =======================================================================
   NEZO – ügyféloldal logika
   --------------------------------------------------------------------
   ⚙️  ITT ÁLLÍTSD BE A KAPCSOLATI ADATOKAT (egy helyen, automatikusan
       frissül a fejlécben, a láblécben és a termék-ablakban is):
   ======================================================================= */
const CONFIG = {
  company: "Nezo Bt.",
  email: "juhaszakos@nezobt.hu",
  telDisplay: "+36 30 309 1116",
  tel: "+36303091116" // szóköz nélkül, a tárcsázáshoz
};
/* ===================================================================== */

const IMG_BASE = "./images/";
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="#E3E1D8"/><text x="50%" y="50%" fill="#9A998E" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">nincs kép</text></svg>'
  );

/* Tartalék adatok: ha az oldalt fájlként (dupla kattintással) nyitod meg,
   a böngésző nem tudja beolvasni a products.json-t – ilyenkor ezek látszanak.
   Élesben (Cloudflare Pages) mindig a data/products.json a forrás. */
const FALLBACK_PRODUCTS = [
  { id:"nz-1042", cikkszam:"NZ-1042", nev:"Lenvászon csíkos", kollekcio:"Naturel", szin:"Bézs", meret:"0,53 × 10,05 m", anyag:"Vlies", mintazat:"Csíkos", ar:8900, arEgyseg:"Ft / tekercs", elerhetoseg:"Raktáron", leiras:"Finom lenszövet-hatású, függőleges csíkozással.", images:["nz-1042-1.jpg"] },
  { id:"nz-2310", cikkszam:"NZ-2310", nev:"Botanika levél", kollekcio:"Verde", szin:"Zöld", meret:"0,53 × 10,05 m", anyag:"Vlies", mintazat:"Botanikus", ar:12400, arEgyseg:"Ft / tekercs", elerhetoseg:"Raktáron", leiras:"Kézzel rajzolt hatású levélmintázat.", images:["nz-2310-1.jpg"] },
  { id:"nz-0775", cikkszam:"NZ-0775", nev:"Apró pötty", kollekcio:"Maison", szin:"Krém", meret:"0,53 × 10,05 m", anyag:"Papír", mintazat:"Pöttyös", ar:6500, arEgyseg:"Ft / tekercs", elerhetoseg:"Rendelésre", leiras:"Visszafogott pöttymintázat.", images:["nz-0775-1.jpg"] },
  { id:"nz-3120", cikkszam:"NZ-3120", nev:"Geometria rács", kollekcio:"Urban", szin:"Antracit", meret:"0,70 × 10,05 m", anyag:"Vinyl", mintazat:"Geometrikus", ar:14900, arEgyseg:"Ft / tekercs", elerhetoseg:"Raktáron", leiras:"Letisztult rácsmintázat mosható felülettel.", images:["nz-3120-1.jpg"] },
  { id:"nz-5008", cikkszam:"NZ-5008", nev:"Damaszt klasszik", kollekcio:"Heritage", szin:"Mályva", meret:"0,53 × 10,05 m", anyag:"Vlies", mintazat:"Damaszt", ar:16800, arEgyseg:"Ft / tekercs", elerhetoseg:"Rendelésre", leiras:"Hagyományos damaszt modern színvilágban.", images:["nz-5008-1.jpg"] },
  { id:"nz-4411", cikkszam:"NZ-4411", nev:"Vakolat hatású", kollekcio:"Beton", szin:"Szürke", meret:"1,06 × 10,05 m", anyag:"Vlies", mintazat:"Egyszínű", ar:11200, arEgyseg:"Ft / tekercs", elerhetoseg:"Raktáron", leiras:"Finom vakolat- és betonhatású felület.", images:["nz-4411-1.jpg"] }
];

let ALL = [];
const state = { search:"", szin:"", sort:"default" };

const $ = (s) => document.querySelector(s);
const grid = $("#grid");

/* ---------- Kapcsolati adatok beillesztése ---------- */
function applyContact(){
  document.querySelectorAll('[data-contact="email"]').forEach(a=>{
    a.href = "mailto:" + CONFIG.email; a.textContent = CONFIG.email;
  });
  document.querySelectorAll('[data-contact="tel"]').forEach(a=>{
    a.href = "tel:" + CONFIG.tel; a.textContent = CONFIG.telDisplay;
  });
}

/* ---------- Segédek ---------- */
function fmtPrice(p){
  if(p.ar === "" || p.ar === null || p.ar === undefined){
    return '<span class="card-price ask">Ár: kérésre</span>';
  }
  const n = Number(p.ar).toLocaleString("hu-HU");
  const unit = p.arEgyseg ? ` <span class="unit">${escapeHtml(p.arEgyseg)}</span>` : "";
  return `<span class="card-price">${n} Ft${unit}</span>`;
}
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function imgSrc(file){ return file ? IMG_BASE + file : PLACEHOLDER; }

/* ---------- Szűrő legördülők feltöltése ---------- */
function uniqueSorted(key){
  return [...new Set(ALL.map(p=>p[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"hu"));
}
function fillSelect(id, key){
  const sel = $(id);
  uniqueSorted(key).forEach(v=>{
    const o = document.createElement("option");
    o.value = v; o.textContent = v; sel.appendChild(o);
  });
}

/* ---------- Szűrés + rendezés ---------- */
function apply(){
  let list = ALL.filter(p=>{
    const q = state.search.trim().toLowerCase();
    const hitQ = !q || (p.nev+" "+p.cikkszam).toLowerCase().includes(q);
    return hitQ && (!state.szin || p.szin===state.szin);
  });
  const priceVal = p => (p.ar===""||p.ar==null) ? Infinity : Number(p.ar);
  if(state.sort==="price-asc") list.sort((a,b)=>priceVal(a)-priceVal(b));
  else if(state.sort==="price-desc") list.sort((a,b)=>priceVal(b)-priceVal(a));
  else if(state.sort==="name-asc") list.sort((a,b)=>a.nev.localeCompare(b.nev,"hu"));

  render(list);
  const c = $("#count");
  c.textContent = list.length === ALL.length
    ? `${ALL.length} termék`
    : `${list.length} / ${ALL.length} termék`;
  const anyFilter = state.search||state.szin;
  $("#reset").hidden = !anyFilter;
}

/* ---------- Rács kirajzolása ---------- */
function render(list){
  if(!list.length){
    grid.innerHTML = '<p class="state">Nincs a szűrésnek megfelelő termék. Próbálj meg lazítani a szűrőkön.</p>';
    return;
  }
  grid.innerHTML = "";
  list.forEach(p=>{
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.setAttribute("aria-label", p.nev + " megtekintése");
    const order = (p.elerhetoseg||"").toLowerCase().includes("rendel");
    card.innerHTML = `
      <div class="card-figure">
        <span class="card-tag">${escapeHtml(p.cikkszam)}</span>
        ${p.elerhetoseg ? `<span class="card-stock ${order?"order":""}">${escapeHtml(p.elerhetoseg)}</span>` : ""}
        <img loading="lazy" src="${imgSrc(p.images?.[0])}" alt="${escapeHtml(p.nev)}" />
      </div>
      <div class="card-info">
        ${p.kollekcio ? `<p class="card-coll">${escapeHtml(p.kollekcio)}</p>` : ""}
        <h3 class="card-name">${escapeHtml(p.nev)}</h3>
        <div class="card-meta">
          ${p.szin ? `<span class="chip">${escapeHtml(p.szin)}</span>`:""}
          ${p.anyag ? `<span class="chip">${escapeHtml(p.anyag)}</span>`:""}
        </div>
        ${fmtPrice(p)}
      </div>`;
    card.querySelector("img").addEventListener("error", e=>{ e.target.onerror=null; e.target.src=PLACEHOLDER; });
    card.addEventListener("click", ()=>openModal(p));
    grid.appendChild(card);
  });
}

/* ---------- Modal ---------- */
const modal = $("#modal");
const modalBody = $("#modal-body");
let lastFocus = null;

function openModal(p){
  lastFocus = document.activeElement;
  const imgs = (p.images && p.images.length) ? p.images : [null];
  const order = (p.elerhetoseg||"").toLowerCase().includes("rendel");
  const price = (p.ar===""||p.ar==null)
    ? '<p class="modal-price ask">Ár: kérésre</p>'
    : `<p class="modal-price">${Number(p.ar).toLocaleString("hu-HU")} Ft${p.arEgyseg?` <span class="unit">${escapeHtml(p.arEgyseg)}</span>`:""}</p>`;

  const rows = [
    ["Cikkszám", p.cikkszam],
    ["Kollekció", p.kollekcio],
    ["Szín", p.szin],
    ["Méret", p.meret],
    ["Anyag", p.anyag],
    ["Mintázat", p.mintazat],
    ["Elérhetőség", p.elerhetoseg],
  ].filter(r=>r[1]).map(r=>`<div><dt>${escapeHtml(r[0])}</dt><dd>${escapeHtml(r[1])}</dd></div>`).join("");

  const thumbs = imgs.length>1
    ? `<div class="thumbs">${imgs.map((f,i)=>`<button data-i="${i}" class="${i===0?"active":""}"><img src="${imgSrc(f)}" alt=""></button>`).join("")}</div>`
    : "";

  modalBody.innerHTML = `
    <div class="modal-gallery">
      <div class="gallery-main"><img class="main" id="modal-main" src="${imgSrc(imgs[0])}" alt="${escapeHtml(p.nev)}" /></div>
      ${thumbs}
    </div>
    <div class="modal-detail">
      ${p.kollekcio?`<p class="card-coll">${escapeHtml(p.kollekcio)}</p>`:""}
      <h2 id="modal-title">${escapeHtml(p.nev)}</h2>
      ${order?'<p class="modal-tag">Rendelésre elérhető</p>':'<p class="modal-tag">Raktárról szállítható</p>'}
      ${price}
      <dl class="specs">${rows}</dl>
      ${p.leiras?`<p class="modal-desc">${escapeHtml(p.leiras)}</p>`:""}
      <div class="modal-cta">
        <p class="cta-label">Rendelés &amp; nagyker árak</p>
        <p>${escapeHtml(CONFIG.company)}</p>
        <p><a href="mailto:${CONFIG.email}?subject=${encodeURIComponent("Ajánlatkérés – "+p.cikkszam+" "+p.nev)}">${escapeHtml(CONFIG.email)}</a></p>
        <p><a href="tel:${CONFIG.tel}">${escapeHtml(CONFIG.telDisplay)}</a></p>
      </div>
    </div>`;

  const mainImg = $("#modal-main");
  mainImg.addEventListener("error", e=>{ e.target.onerror=null; e.target.src=PLACEHOLDER; });
  modalBody.querySelectorAll(".thumbs button").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = +b.dataset.i;
      mainImg.src = imgSrc(imgs[i]);
      modalBody.querySelectorAll(".thumbs button").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
    });
  });

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  $(".modal-close").focus();
}

function closeModal(){
  modal.hidden = true;
  document.body.style.overflow = "";
  if(lastFocus) lastFocus.focus();
}
modal.querySelectorAll("[data-close]").forEach(el=>el.addEventListener("click", closeModal));
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !modal.hidden) closeModal(); });

/* ---------- Események ---------- */
function bind(){
  $("#search").addEventListener("input", e=>{ state.search=e.target.value; apply(); });
  $("#f-szin").addEventListener("change", e=>{ state.szin=e.target.value; apply(); });
  $("#sort").addEventListener("change", e=>{ state.sort=e.target.value; apply(); });
  $("#reset").addEventListener("click", ()=>{
    Object.assign(state,{search:"",szin:""});
    $("#search").value=""; $("#f-szin").value="";
    apply();
  });
}

/* ---------- Indítás ---------- */
async function init(){
  applyContact();
  try{
    const res = await fetch("./data/products.json", { cache:"no-store" });
    if(!res.ok) throw new Error("HTTP "+res.status);
    ALL = await res.json();
  }catch(err){
    console.warn("A products.json nem tölthető be (valószínűleg helyi fájlként nyitottad meg). Tartalék mintaadatok jelennek meg.", err);
    ALL = FALLBACK_PRODUCTS;
  }
  if(!Array.isArray(ALL)) ALL = [];
  fillSelect("#f-szin","szin");
  bind();
  apply();
}
init();
