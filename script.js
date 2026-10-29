'use strict';
/* ===== Decimal-ID arithmetic: IDs are STRINGS end to end. Number()/parseInt are never used on an ID. ===== */
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
/** Trim, map Arabic-Indic digits, require digits only, strip leading zeros. "0"/"000" -> null (not positive). */
function normId(raw) {
  const s = String(raw).trim().replace(/[٠-٩]/g, d => AR_DIGITS.indexOf(d));
  if (!/^[0-9]+$/.test(s)) return null;
  return s.replace(/^0+/, '') || null;
}
/** Decimal-string +1 (carry propagation), exact at any length. */
function incId(s) {
  let i = s.length - 1;
  while (i >= 0 && s[i] === '9') i--;
  if (i < 0) return '1' + '0'.repeat(s.length);
  return s.slice(0, i) + (s.charCodeAt(i) - 47) + '0'.repeat(s.length - 1 - i);
}
/** FNV-1a over the digit string: O(length), no conversion to a number type. Drives all deterministic art/text choices. */
function seed(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(a) { // mulberry32
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/* ===== Bilingual content (Arabic is the source language; English mirrors it) ===== */
const ENV = [
 {k:'EmeraldGarden',ar:'الحديقة الزمردية',en:'Emerald Garden',dar:'حديقة واسعة تجري فيها المياه بين الأشجار.',den:'A vast garden with water flowing between trees.',c:['#bfe9d6','#2fa57a','#0b4d3a']},
 {k:'PalaceCourt',ar:'فناء القصر',en:'Palace Courtyard',dar:'فناء رحب بزخارف هندسية دقيقة.',den:'A spacious courtyard with fine geometric ornament.',c:['#d9efe9','#5fb9b0','#14544f']},
 {k:'LuminousGate',ar:'البوابة المضيئة',en:'Luminous Gate',dar:'قوس مهيب يرحّب بالسلام.',den:'A majestic arch of welcome and peace.',c:['#f3ecd9','#8fd1c4','#17695c']},
 {k:'LongCorridor',ar:'الرواق الممتد',en:'Long Corridor',dar:'رواق طويل يمتد في البعيد.',den:'A long corridor fading into the distance.',c:['#cfe3f0','#4f8fb0','#12384f']},
 {k:'RiverOrchard',ar:'ضفة النهر',en:'Riverbank Orchard',dar:'أشجار مثمرة على ضفة نهر صافٍ.',den:'Fruit trees on the bank of a clear river.',c:['#d5f0e8','#3fb3a6','#1b6b4a']},
 {k:'PillarHall',ar:'قاعة الأعمدة',en:'Hall of Columns',dar:'قاعة أنيقة بأعمدة وسقف مزخرف.',den:'An elegant hall of columns and ornate ceiling.',c:['#e9e4f4','#8b7fc0','#2b2a5c']},
 {k:'FountainTerrace',ar:'شرفة النوافير',en:'Fountain Terrace',dar:'نوافير متتالية في شرفة هادئة.',den:'Cascading fountains on a quiet terrace.',c:['#dff4f5','#58c3d4','#12607a']},
 {k:'MistHills',ar:'التلال الضبابية',en:'Misty Hills',dar:'تلال خضراء متدرجة يكسوها الضباب.',den:'Layered green hills veiled in mist.',c:['#e6f2ea','#7fc3a0','#2f6b52']},
 {k:'PearlCourt',ar:'الفناء اللؤلؤي',en:'Pearl Court',dar:'عمارة بيضاء بتفاصيل فضية رقيقة.',den:'Pearl-white architecture with delicate silver detail.',c:['#f6f6f2','#c9d3dc','#6a7f93']},
 {k:'StarlitDream',ar:'الليل المرصّع',en:'Starlit Dream',dar:'سماء مرصعة بالنجوم، مشهد فنّي خيالي.',den:'A star-filled sky, an imaginative artistic scene.',c:['#2b2f6b','#14305a','#08201f']}];
const FIG = [
 {ar:'بورتريه هادئ بملامح مشرقة.',en:'A calm portrait with a bright expression.'},
 {ar:'شخصٌ يقف في سكينة.',en:'A person standing in stillness.'},
 {ar:'شخصٌ جالسٌ في طمأنينة.',en:'A person seated in tranquility.'},
 {ar:'شخصٌ يمشي بهدوء.',en:'A person walking gently.'},
 {ar:'شخصٌ بجانب الماء الجاري.',en:'A person beside flowing water.'},
 {ar:'شخصان في لقاء هادئ.',en:'Two adults in a quiet meeting.'}];
const SRC = [
 ['Quran 47:15','أنهار من ماء ولبن وشراب وعسل مصفّى، وثمرات ومغفرة.','Rivers of water, milk, drink and purified honey; fruits and forgiveness.'],
 ['Quran 55:46–78','جنّات وعيون وفاكهة ونِعَم متتابعة.','Gardens, springs, fruits and successive blessings.'],
 ['Quran 76:12–22','ظلال دانية وثمار مذلَّلة وثياب خضر من سندس.','Close shade, fruit within reach, green garments of fine silk.'],
 ['Quran 18:31','جنات عدن تجري من تحتها الأنهار، وحُلِيّ وثياب خضر.','Gardens of Eden with rivers beneath, ornaments and green garments.'],
 ['Quran 39:73','أبواب تُفتح وتحية سلام.','Gates opened and a greeting of peace.'],
 ['Sahih Muslim 2824a, 2825','نعيم لم تره عين ولم تسمعه أذن ولم يخطر على قلب بشر.','Blessings no eye has seen, no ear has heard, no mind has imagined.'],
 ['Sahih Muslim 2826a','شجرة يسير الراكب في ظلها مئة عام.','A tree in whose shade a rider travels a hundred years.']];
const STR = {
 ar:{t1:'فِرْدَوْسَانْث',t2:'عَالَمٌ مُتَجَدِّدٌ مِنْ مَشَاهِدِ الْجَنَّةِ',ph:'ابحث برقم المعرّف…',go:'بحث',clear:'مسح',info:'عن المشاهد والمصادر',close:'إغلاق',id:'المعرّف',
  bad:'أدخل رقمًا عشريًّا موجبًا فقط (الأرقام 0–9).',res:'نتيجة البحث',srcH:'مصادر دينية (ملخّص للمعنى وليس نصًّا قرآنيًّا)',
  note:'المشاهد والوجوه رسوم فنّية تخيّلية، وليست صورًا حقيقية للجنة أو لأهلها. العمارة والأشخاص من خيال الفنّ ولا يُنسب إلى المصادر إلا ما ورد أدناه. راجِع المصدر الأصلي.'},
 en:{t1:'FIRDAUSANTH',t2:'An Infinite Jannah-Inspired Profile Universe',ph:'Search by profile ID…',go:'Search',clear:'Clear',info:'About scenes & sources',close:'Close',id:'ID',
  bad:'Enter a positive decimal number only (digits 0–9).',res:'Search result',srcH:'Religious sources (summary of meaning, not Quranic text)',
  note:'Scenes and figures are imaginative artwork, not real depictions of Paradise or its inhabitants. Architecture and people are artistic invention; only the items below are attributed to sources. Please verify against the original.'}};

/* ===== Procedural art (inline SVG, deterministic from the ID) ===== */
const SK = ['#f1d2b6','#d9a77c','#b97b55','#8a5a3b','#5e3b27','#e8bf9a'];
const GM = ['#0f8a5f','#13694a','#eef2ea','#e4e9e2','#2a6f94','#8a78b5'];
const HR = ['#1b1410','#3a2a1c','#6b4a2b','#2a2a30'];
function scene(t, c, k) {
  const [a, b, d] = c;
  let s = `<defs><linearGradient id="g${k}" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="260" fill="url(#g${k})"/>`;
  if (t === 9) for (let i = 0; i < 14; i++) s += `<circle cx="${(i * 47 + 13) % 300}" cy="${(i * 29 + 9) % 110}" r="1.4" fill="#fff"/>`;
  s += `<path d="M0 150Q70 110 150 140T300 125V260H0Z" fill="${d}" opacity=".35"/>`;
  if (t === 0 || t === 4 || t === 7) for (let i = 0; i < 5; i++) s += `<circle cx="${30 + i * 60}" cy="${135 + i % 2 * 12}" r="${22 - i % 3 * 3}" fill="${d}" opacity=".7"/>`;
  if (t === 1 || t === 8) s += `<path d="M80 170V105Q150 30 220 105V170Z" fill="${d}" opacity=".5"/><circle cx="150" cy="62" r="13" fill="${d}" opacity=".6"/>`;
  if (t === 2) s += `<path d="M60 200V90Q150 -10 240 90V200H215V95Q150 15 85 95V200Z" fill="${d}"/>`;
  if (t === 3) s += `<path d="M0 0L110 90V170L0 260ZM300 0L190 90V170L300 260Z" fill="${d}" opacity=".8"/><rect x="110" y="90" width="80" height="80" fill="${a}" opacity=".6"/>`;
  if (t === 5) for (let i = 0; i < 5; i++) s += `<rect x="${20 + i * 58}" y="40" width="14" height="170" fill="${d}" opacity=".7"/>`;
  if (t === 6) s += `<path d="M150 190V120M150 120Q120 110 110 150M150 120Q180 110 190 150" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`;
  return s + `<path d="M0 200Q150 180 300 205V260H0Z" fill="${d}" opacity=".85"/><path class="sh" d="M0 225Q75 213 150 225T300 225V260H0Z" fill="${a}" opacity=".4"/>`;
}
function fig(cx, by, sc, rot, h, w, sk, gm, hr, veil) {
  const H = h + 13;
  return `<g transform="translate(${cx} ${by}) rotate(${rot}) scale(${sc})"><path d="M-${w} 0Q-${w * .8} -${h * .7} -9 -${h}H9Q${w * .8} -${h * .7} ${w} 0Z" fill="${gm}"/>` +
    (veil ? `<path d="M-17 -${H - 3}Q0 -${H + 30} 17 -${H - 3}L20 -${h - 6}Q0 -${h - 14} -20 -${h - 6}Z" fill="${veil}"/>` : '') +
    `<circle cy="-${H}" r="12.5" fill="${sk}"/>` +
    (veil ? '' : `<path d="M-13 -${H}Q0 -${H + 24} 13 -${H}Q0 -${H + 10} -13 -${H}Z" fill="${hr}"/>`) +
    `<circle cx="-4.5" cy="-${H + 1}" r="1.2" fill="#2a1a12"/><circle cx="4.5" cy="-${H + 1}" r="1.2" fill="#2a1a12"/><path d="M-4 -${H - 5}Q0 -${H - 8} 4 -${H - 5}" stroke="#7a3b2b" fill="none"/></g>`;
}
function artSvg(p) {
  const r = rng(p.s ^ 0x9e3779b9), pick = a => a[r() * a.length | 0], t = p.ei;
  const sk = pick(SK), gm = pick(GM), hr = pick(HR), veil = r() < .5 ? pick(GM) : '';
  const sk2 = pick(SK), gm2 = pick(GM), hr2 = pick(HR);
  let f;
  switch (p.fi) {
    case 0: f = fig(150, 335, 1.9, 0, 92, 40, sk, gm, hr, veil); break;
    case 1: f = fig(150, 250, 1.1, 0, 92, 28, sk, gm, hr, veil); break;
    case 2: f = fig(150, 250, 1.2, 0, 62, 38, sk, gm, hr, veil); break;
    case 3: f = fig(125, 250, 1.1, 6, 92, 28, sk, gm, hr, veil); break;
    case 4: f = fig(95, 248, 1, 0, 92, 28, sk, gm, hr, veil); break;
    default: f = fig(100, 250, .95, 0, 92, 28, sk, gm, hr, veil) + fig(200, 250, .95, 0, 92, 28, sk2, gm2, hr2, '');
  }
  return `<svg viewBox="0 0 300 260" aria-hidden="true" preserveAspectRatio="xMidYMid slice">${scene(t, ENV[t].c, p.id.slice(-8) + 'x')}${f}</svg>`;
}
function profile(id) {
  const s = seed(id), r = rng(s), ei = r() * 10 | 0, fi = r() * 6 | 0;
  return { id, s, ei, fi, e: ENV[ei], f: FIG[fi], u: ENV[ei].k + '_' + id.slice(-6).padStart(6, '0') };
}

/* ===== Feed engine ===== */
const ids = [], RUNWAY = 260, BATCH = 300, GAP = 10;
let last = '0', pend = 0, busy = false, cur = 0, lang = 'ar', cols = 1, cw = 300, H = 400, hid = false, ly = 0, tick = false, dlgMode = null;
let feed, q, sw, dlg, dc, lb, msgEl; const live = new Map();
function gen(n) { for (let k = 0; k < n; k++) { last = incId(last); ids.push(last); } }
/** Keep >= RUNWAY ready records ahead of the reader (counting queued ones). Starting at ~profile 100 (360-260) this queues 300 more. */
function runway() { if (ids.length + pend - cur < RUNWAY) { pend += BATCH; queue(); } }
function queue() { // single worker: batches are strictly ordered and cannot overlap or duplicate
  if (busy) return; busy = true;
  const step = () => {
    try {
      if (pend <= 0) { busy = false; runway(); return; }
      const n = Math.min(100, pend); gen(n); pend -= n; grow();
      (self.requestIdleCallback || setTimeout)(step);
    } catch (e) { busy = false; pend = 0; setTimeout(runway, 1000); } // self-recover
  };
  step();
}
const T = () => STR[lang];
function cardHTML(p) {
  const L = lang;
  return `<div class="art" role="img" aria-label="${p.e[L]} — ${p.f[L]}">${artSvg(p)}</div><div class="tx"><h3>${p.e[L]}</h3><p>${p.e['d' + L]} ${p.f[L]}</p><div class="u" dir="ltr">@${p.u}</div><div class="id">${T().id} <bdi dir="ltr">${p.id}</bdi></div></div>`;
}
function mkCard(i) {
  const n = document.createElement('article'); n.className = 'card'; n.innerHTML = cardHTML(profile(ids[i]));
  n.style.top = (Math.floor(i / cols) * H + GAP) + 'px';
  n.style[lang === 'ar' ? 'right' : 'left'] = (GAP + (i % cols) * (cw + GAP)) + 'px';
  return n;
}
/** Fixed-height cells => O(1) geometry. Only rows near the viewport exist in the DOM; the rest is just spacer height. */
function paint(force) {
  if (force) { live.forEach(n => n.remove()); live.clear(); }
  const y = scrollY - feed.offsetTop, r0 = Math.max(0, Math.floor(y / H) - 3), r1 = Math.floor((y + innerHeight) / H) + 3;
  const i0 = r0 * cols, i1 = Math.min(ids.length - 1, (r1 + 1) * cols - 1);
  live.forEach((n, i) => { if (i < i0 || i > i1) { n.remove(); live.delete(i); } });
  const fr = document.createDocumentFragment();
  for (let i = i0; i <= i1; i++) if (!live.has(i)) { const n = mkCard(i); live.set(i, n); fr.appendChild(n); }
  feed.appendChild(fr);
  cur = Math.max(cur, Math.floor((y + innerHeight) / H) * cols);
}
function grow() { feed.style.height = Math.ceil(ids.length / cols) * H + GAP + 'px'; } // appending below never moves the viewport
function layout() {
  const W = feed.clientWidth; cols = Math.max(1, Math.min(4, W / 340 | 0));
  cw = (W - GAP * (cols + 1)) / cols; H = Math.round(cw * .8667) + 172 + GAP;
  feed.style.setProperty('--cw', cw + 'px'); feed.style.setProperty('--h', (H - GAP) + 'px'); grow(); paint(true);
}
function setHid(h) { if (h !== hid) { hid = h; sw.classList.toggle('h', h); sw.inert = h; } }
function onScroll() { // direction sampling with a 6px dead-zone; never touches scroll position
  tick = false; const y = scrollY, d = y - ly;
  if (y <= 4) setHid(false);
  else if (Math.abs(d) > 6) { if (document.activeElement !== q) setHid(d > 0); }
  if (Math.abs(d) > 6) ly = y;
  paint(); runway();
}
/* ===== Language, search, dialog ===== */
function setLang(l) {
  lang = l; try { localStorage.setItem('fz-lang', l); } catch (e) {}
  const h = document.documentElement; h.lang = l; h.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(n => n.textContent = T()[n.dataset.i18n]);
  document.querySelectorAll('[data-i18n-ph]').forEach(n => n.placeholder = T()[n.dataset.i18nPh]);
  document.querySelectorAll('[data-i18n-aria]').forEach(n => n.setAttribute('aria-label', T()[n.dataset.i18nAria]));
  lb.textContent = l === 'ar' ? 'English' : 'العربية'; lb.lang = l === 'ar' ? 'en' : 'ar';
  paint(true); if (dlg.open) openDlg(dlgMode); // same ids, same scroll offset, no reload
}
function openDlg(m) {
  dlgMode = m; const t = T(), L = lang;
  dc.innerHTML = m.t === 'res'
    ? `<h2>${t.res}</h2><article class="card s">${cardHTML(profile(m.id))}</article>`
    : `<h2>${t.t1}</h2><p>${t.note}</p><h3>${t.srcH}</h3><ul>${SRC.map(s => `<li><b dir="ltr">${s[0]}</b> — ${s[L === 'ar' ? 1 : 2]}</li>`).join('')}</ul>`;
  if (!dlg.open) dlg.showModal();
}
function boot() {
  feed = document.getElementById('feed'); q = document.getElementById('q'); sw = document.getElementById('sw');
  dlg = document.getElementById('dlg'); dc = document.getElementById('dc'); lb = document.getElementById('lang'); msgEl = document.getElementById('msg');
  gen(360); ly = scrollY;
  let l = 'ar'; try { l = localStorage.getItem('fz-lang') === 'en' ? 'en' : 'ar'; } catch (e) {}
  layout(); setLang(l);
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(layout));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { paint(); runway(); } });
  lb.onclick = () => setLang(lang === 'ar' ? 'en' : 'ar');
  document.getElementById('info').onclick = () => openDlg({ t: 'info' });
  document.getElementById('dx').onclick = () => dlg.close();
  const cl = document.getElementById('cl');
  q.oninput = () => { cl.hidden = !q.value; msgEl.textContent = ''; };
  cl.onclick = () => { q.value = ''; cl.hidden = true; msgEl.textContent = ''; q.focus(); };
  document.getElementById('sf').onsubmit = e => {
    e.preventDefault(); const id = normId(q.value);
    if (!id) { msgEl.textContent = T().bad; return; }
    msgEl.textContent = ''; openDlg({ t: 'res', id }); // resolved directly from the ID; smaller IDs are never generated
  };
  runway();
}
if (typeof document !== 'undefined') boot(); else module.exports = { normId, incId, seed, profile };
