/* Bellinaya — core: state, actions, event infrastructure. */
'use strict';

/* ---------- event registry ---------- */
let REG = [];
const hnd = (fn) => (REG.push(fn) - 1);

document.addEventListener('click', e => {
  const el = e.target.closest('[data-c]');
  if (el && REG[+el.dataset.c]) REG[+el.dataset.c](e, el);
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-in]');
  if (el && REG[+el.dataset.in]) REG[+el.dataset.in](e, el);
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-chg]');
  if (el && REG[+el.dataset.chg]) REG[+el.dataset.chg](e, el);
});
document.addEventListener('keydown', e => {
  const el = e.target.closest('[data-kd]');
  if (el && REG[+el.dataset.kd]) REG[+el.dataset.kd](e, el);
});
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-pd]');
  if (el && REG[+el.dataset.pd]) REG[+el.dataset.pd](e, el);
});

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- style shorthands ---------- */
const F_MONO = "font-family:'IBM Plex Mono',ui-monospace,Consolas,monospace";
const F_SERIF = "font-family:'Libre Caslon Display','Playfair Display',Georgia,serif";
const LBL = F_MONO + ";font-size:9.5px;letter-spacing:.14em;color:#8D8677;text-transform:uppercase";
const LBL9 = F_MONO + ";font-size:9px;letter-spacing:.14em;color:#8D8677;text-transform:uppercase";
const SH = 48; // journal: pixels per 30 min

/* ---------- state ---------- */
const KEY = 'bellinaya.proto.v3';
const PINS = { owner: '2024', reception: '1010' };
const SMS_CODE = '5417';

function nowMin() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

function seedHist() {
  let z = 20260820;
  const R = () => { z = (z * 1103515245 + 12345) & 0x7fffffff; return z / 0x7fffffff; };
  const out = [];
  for (let d = -7; d <= -1; d++) {
    MASTERS.forEach(m => {
      const pool = SVCS.filter(x => m.c.includes(x.c));
      const n = 2 + Math.floor(R() * 4);
      let mn = 540 + Math.floor(R() * 3) * 30;
      for (let i = 0; i < n; i++) {
        const sv = pool[Math.floor(R() * pool.length)];
        if (mn + sv.d > 1260) break;
        out.push({ id: 'h' + d + '_' + m.id + '_' + i, b: m.b, m: m.id, s: sv.id,
          cl: CLIENTS[Math.floor(R() * CLIENTS.length)].id,
          t: s2m(mn), d, st: 'done', on: R() < .34, extra: [], pr: null });
        mn += sv.d + 30 + Math.floor(R() * 2) * 30;
      }
    });
  }
  return out;
}

function defaults() {
  const narrow = window.innerWidth < 880;
  return {
    lang: 'az', view: narrow ? 'phone' : 'both', pv: 'over', b: 'b1', day: 0,
    cls: CLIENTS.map(c => ({ ...c })),
    auth: { staff: null, client: null },
    login: { role: 'owner', pin: '', err: '' },
    clog: { step: 'phone', phone: '', code: '', err: '', name: '' },
    notif: [], notifOpen: false, zrep: null,
    appts: [...seedHist(), ...seedAppts()],
    tx: [
      { id: 1041, b: 'b1', t: '09:52', cl: 'c1', sum: 60, m: 'cash', items: 'Boyama — kök' },
      { id: 1042, b: 'b1', t: '10:14', cl: 'c3', sum: 20, m: 'cash', items: 'Saç kəsimi (kişi)' },
      { id: 1043, b: 'b1', t: '10:40', cl: 'c10', sum: 78, m: 'card', items: 'Kirpik uzatma 2D · Kirpik serum' },
      { id: 1044, b: 'b1', t: '11:48', cl: 'c7', sum: 38, m: 'card', items: 'Saç kəsimi (kişi) · Saç spreyi' },
      { id: 1045, b: 'b2', t: '09:35', cl: 'c3', sum: 20, m: 'cash', items: 'Saç kəsimi (kişi)' },
      { id: 1046, b: 'b3', t: '10:50', cl: 'c9', sum: 37, m: 'card', items: 'Manikür · Dırnaq üstü yağ' }
    ],
    prodQ: null, prices: null, drawer: null, co: null, quick: null, resc: null,
    cSel: 'c1', cq: '', svcCat: 'hair', toast: null, fresh: [], dayClosed: false,
    ph: { sc: 'home', step: 1, b: 'b1', cat: null, s: null, m: 'any', d: 0, t: null, cart: [], done: null, ordered: false, resc: null, after: null },
    railOpen: !narrow && window.innerWidth >= 1240,
    phDev: 'mobile', nowMin: nowMin(), hintOff: false
  };
}

function boot() {
  let sv = null;
  try { sv = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  const d = defaults();
  if (!sv || sv.v !== 3) return d;
  return { ...d,
    appts: sv.appts || d.appts, tx: sv.tx || d.tx, cls: sv.cls || d.cls,
    prodQ: sv.prodQ || null, prices: sv.prices || null, auth: sv.auth || d.auth,
    notif: sv.notif || [], dayClosed: !!sv.dayClosed, hintOff: !!sv.hintOff,
    ph: { ...d.ph, b: sv.phB || d.ph.b, cart: sv.cart || [] } };
}

let S = boot();
let saveT = null;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 3,
      appts: S.appts, tx: S.tx, cls: S.cls, prodQ: S.prodQ, prices: S.prices,
      auth: S.auth, notif: S.notif, dayClosed: S.dayClosed, hintOff: S.hintOff,
      phB: S.ph.b, cart: S.ph.cart }));
  } catch (e) {}
}
function commit() {
  render();
  if (saveT) clearTimeout(saveT);
  saveT = setTimeout(save, 260);
}
function resetDemo() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  S = defaults();
  render();
}

/* ---------- domain helpers ---------- */
function L(o) { if (!o) return ''; return o[S.lang] !== undefined ? o[S.lang] : (o.az || ''); }
function svc(id) { return SVCS.find(s => s.id === id); }
function price(id) { const o = S.prices; return (o && o[id] != null) ? o[id] : svc(id).p; }
function qty(id) { const o = S.prodQ; const p = PRODS.find(x => x.id === id); return (o && o[id] != null) ? o[id] : p.q; }
function mst(id) { return MASTERS.find(m => m.id === id); }
function cliOf(id) { return (S.cls || CLIENTS).find(c => c.id === id) || S.cls[0]; }
function catOf(id) { return CATS.find(c => c.id === id); }
function ini(n) { return n.split(' ').map(x => x[0]).slice(0, 2).join(''); }
function m2s(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function s2m(v) { const h = Math.floor(v / 60), m = v % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
function dateOf(off) { const d = new Date(); d.setDate(d.getDate() + off); return d; }
function fmtDate(off) { const d = dateOf(off); return d.getDate() + ' ' + MONTHS[S.lang][d.getMonth()]; }
function stLabel(st) { const t = I18N[S.lang]; return { new: t.stNew, conf: t.stConf, here: t.stHere, done: t.stDone, unpaid: t.stUnpaid, cancel: t.stCancel }[st]; }
function stColor(st) { return { new: '#B4552D', conf: '#3B2E5A', here: '#2F6B5E', done: '#8D8677', unpaid: '#C0392B', cancel: '#A8A29A' }[st]; }
function money(v) { return (Math.round(v * 100) / 100).toLocaleString('az-AZ'); }
function T() { return I18N[S.lang]; }
function colIds() { return MASTERS.filter(m => m.b === S.b).map(m => m.id); }
function apptTotal(a) { let s = price(a.s); (a.extra || []).forEach(e => { s += PRODS.find(p => p.id === e.id).p * e.n; }); return s; }

/* ---------- toast / notifications ---------- */
let toastT = null;
function toast(k) {
  S.toast = T()[k] || k;
  if (toastT) clearTimeout(toastT);
  toastT = setTimeout(() => { S.toast = null; render(); }, 2600);
}
function note(kind, txt, goTo) {
  S.notif = [{ id: Date.now() + Math.random(), kind, txt, t: s2m(nowMin()), go: goTo || null, read: false }, ...S.notif].slice(0, 24);
}

/* ---------- panel actions ---------- */
function go(v) { S.pv = v; S.drawer = null; commit(); }

function staffIn() {
  const l = S.login;
  if (l.pin !== PINS[l.role]) { S.login = { ...l, err: 'bad', pin: '' }; commit(); return; }
  S.auth.staff = l.role === 'owner'
    ? { role: 'owner', n: 'Nərgiz Abbasova', b: 'b1' }
    : { role: 'reception', n: 'Aygün Səmədova', b: 'b1' };
  S.login = { ...l, pin: '', err: '' };
  S.pv = l.role === 'owner' ? 'over' : 'jour';
  toast('tWelcome'); commit();
}
function staffOut() { S.auth.staff = null; S.notifOpen = false; S.drawer = null; S.co = null; S.quick = null; commit(); }

function createAppt() {
  const q = S.quick;
  if (!q || !q.s || !q.name.trim() || !validTime(q.t)) return;
  const id = 'n' + Date.now();
  const known = S.cls.find(c => c.n.toLowerCase() === q.name.trim().toLowerCase() || (q.phone && c.t === q.phone.trim()));
  const cid = known ? known.id : 'c' + Date.now();
  if (!known) {
    S.cls = [{ id: cid, n: q.name.trim(), t: q.phone.trim() || '—', v: 0, s: 0,
      last: { az: 'ilk yazılış', ru: 'первая запись' }, tag: 'new', note: { az: '', ru: '' }, fav: q.m }, ...S.cls];
  }
  S.appts = [...S.appts, { id, b: S.b, m: q.m, s: q.s, cl: cid, t: normTime(q.t), d: q.d, st: 'conf', on: false, extra: [], pr: null }];
  S.quick = null; S.cSel = cid; S.fresh = [...S.fresh, id];
  toast('tCreate'); commit();
  setTimeout(() => { S.fresh = S.fresh.filter(x => x !== id); render(); }, 2600);
}
function validTime(t) { return /^\d{1,2}:\d{2}$/.test(t || '') && m2s(normTime(t)) >= 540 && m2s(normTime(t)) <= 1230; }
function normTime(t) { const [h, m] = t.split(':'); return String(+h).padStart(2, '0') + ':' + m; }

function cancelAppt(id) {
  S.appts = S.appts.map(a => a.id === id ? { ...a, st: 'cancel' } : a);
  S.drawer = null; toast('tCanc'); commit();
}
function markHere(id) { S.appts = S.appts.map(a => a.id === id ? { ...a, st: 'here' } : a); toast('tHere'); commit(); }
function confirmAppt(id) { S.appts = S.appts.map(a => a.id === id ? { ...a, st: 'conf' } : a); commit(); }
function moveAppt(id, t) { S.appts = S.appts.map(a => a.id === id ? { ...a, t } : a); S.resc = null; toast('tMove'); commit(); }

/* checkout */
function openCo(id) {
  const a = S.appts.find(x => x.id === id);
  S.co = { id, items: [...(a.extra || [])], disc: 0, meth: 'cash', done: false };
  S.drawer = null; commit();
}
function coAdd(pid) {
  const it = [...S.co.items]; const i = it.findIndex(x => x.id === pid);
  if (i >= 0) it[i] = { ...it[i], n: it[i].n + 1 }; else it.push({ id: pid, n: 1 });
  S.co = { ...S.co, items: it }; commit();
}
function coDel(pid) { S.co = { ...S.co, items: S.co.items.filter(x => x.id !== pid) }; commit(); }
function coDisc(v) { S.co = { ...S.co, disc: Math.max(0, Math.min(50, parseInt(v || 0, 10) || 0)) }; commit(); }
function coTotals() {
  const co = S.co; const a = S.appts.find(x => x.id === co.id);
  const sv = price(a.s);
  const pr = co.items.reduce((s, i) => s + PRODS.find(p => p.id === i.id).p * i.n, 0);
  const sub = sv + pr; const d = Math.round(sub * co.disc) / 100;
  return { sv, pr, sub, d, tot: sub - d };
}
function coDone() {
  const co = S.co; const a = S.appts.find(x => x.id === co.id); const TT = coTotals();
  const q = { ...(S.prodQ || {}) };
  co.items.forEach(i => { q[i.id] = qty(i.id) - i.n; });
  const id = 1047 + S.tx.filter(t => t.id >= 1047).length;
  const names = [L(svc(a.s)), ...co.items.map(i => L(PRODS.find(p => p.id === i.id)))].join(' · ');
  S.prodQ = q;
  S.appts = S.appts.map(x => x.id === co.id ? { ...x, st: 'done', extra: co.items, pr: TT.tot } : x);
  S.tx = [...S.tx, { id, b: a.b, t: s2m(nowMin()), cl: a.cl, sum: TT.tot, m: co.meth, items: names }];
  if (a.cl) S.cls = S.cls.map(c => c.id === a.cl ? { ...c, v: c.v + 1, s: c.s + TT.tot, last: { az: 'bu gün', ru: 'сегодня' } } : c);
  S.co = { ...S.co, done: true, no: id, tot: TT.tot };
  toast('tPaid'); commit();
}

function setPrice(id, v) { const n = parseFloat(v); if (isNaN(n) || n < 0) return; S.prices = { ...(S.prices || {}), [id]: n }; commit(); }
function stockIn(id) { S.prodQ = { ...(S.prodQ || {}), [id]: qty(id) + 10 }; toast('tStock'); commit(); }

/* cash day close */
function zData() {
  const b = S.b;
  const tx = S.tx.filter(x => x.b === b);
  const cash = tx.filter(x => x.m === 'cash').reduce((a, x) => a + x.sum, 0);
  const card = tx.filter(x => x.m !== 'cash').reduce((a, x) => a + x.sum, 0);
  const svcRev = S.appts.filter(a => a.d === 0 && a.b === b && a.st === 'done').reduce((a, x) => a + (x.pr || price(x.s)), 0);
  const prodRev = Math.max(0, cash + card - svcRev);
  const mrs = MASTERS.filter(m => m.b === b);
  const pay = mrs.map(m => {
    const list = S.appts.filter(a => a.d === 0 && a.b === b && a.m === m.id && a.st === 'done');
    const turn = list.reduce((y, x) => y + (x.pr || price(x.s)), 0);
    return { id: m.id, n: m.n, cnt: list.length, turn, sal: Math.round(turn * m.pct) / 100 };
  }).filter(x => x.cnt > 0);
  return { cash, card, svcRev, prodRev, tx: tx.length, open: 200, out: 45,
    bal: 200 + cash - 45, total: cash + card, pay, payTotal: pay.reduce((a, x) => a + x.sal, 0) };
}
function closeDay() { S.zrep = zData(); commit(); }
function confirmClose() { S.dayClosed = true; S.zrep = null; toast('tClosed'); commit(); }

/* ---------- client auth ---------- */
function sendCode() {
  const c = S.clog; const d = (c.phone || '').replace(/\D/g, '');
  if (d.length < 9) { S.clog = { ...c, err: 'phone' }; commit(); return; }
  S.clog = { ...c, step: 'code', err: '', code: '' };
  toast('tSms'); commit();
}
function afterAuth() {
  const after = S.ph.after;
  if (after === 'book') S.ph = { ...S.ph, sc: 'book', step: S.ph.step === 4 ? 5 : S.ph.step, after: null };
  else S.ph = { ...S.ph, sc: after || 'my', after: null };
}
function verifyCode() {
  const c = S.clog;
  if (c.code.replace(/\D/g, '') !== SMS_CODE) { S.clog = { ...c, err: 'code' }; commit(); return; }
  const d = c.phone.replace(/\D/g, '');
  const found = S.cls.find(x => x.t.replace(/\D/g, '').slice(-7) === d.slice(-7));
  if (found) {
    S.auth.client = found.id;
    S.clog = { step: 'phone', phone: '', code: '', err: '', name: '' };
    afterAuth(); toast('tHi'); commit(); return;
  }
  S.clog = { ...c, step: 'name', err: '' }; commit();
}
function finishSignup() {
  const c = S.clog;
  if (!c.name.trim()) { S.clog = { ...c, err: 'name' }; commit(); return; }
  const id = 'c' + Date.now();
  S.cls = [{ id, n: c.name.trim(), t: c.phone.trim(), v: 0, s: 0, last: { az: 'yeni', ru: 'новый' },
    tag: 'new', note: { az: '', ru: '' }, fav: 'm1' }, ...S.cls];
  S.auth.client = id;
  S.clog = { step: 'phone', phone: '', code: '', err: '', name: '' };
  afterAuth();
  note('client', c.name.trim() + ' · ' + c.phone.trim(), 'cli');
  toast('tHi'); commit();
}
function clientOut() {
  S.auth.client = null;
  S.ph = { ...S.ph, sc: 'home', step: 1, cart: [] };
  commit();
}

/* ---------- client (phone) actions ---------- */
function P(o) { S.ph = { ...S.ph, ...o }; commit(); }

function freeSlots(mid, dOff, dur, br) {
  const busy = S.appts.filter(a => a.d === dOff && a.st !== 'cancel' && (mid === 'any' ? a.b === br : a.m === mid));
  const out = [];
  for (let mn = 540; mn <= 1230; mn += 30) {
    const end = mn + dur; if (end > 1260) continue;
    let ok = true;
    if (mid === 'any') {
      const cands = MASTERS.filter(m => m.b === br && (!S.ph.s || m.c.includes(svc(S.ph.s).c)));
      ok = cands.some(m => !busy.some(a => a.m === m.id && mn < m2s(a.t) + svc(a.s).d && end > m2s(a.t)));
    } else {
      busy.forEach(a => { const s0 = m2s(a.t), e0 = s0 + svc(a.s).d; if (mn < e0 && end > s0) ok = false; });
    }
    if (dOff === 0 && mn < S.nowMin + 30) ok = false;
    out.push({ t: s2m(mn), ok });
  }
  return out;
}

function phConfirm() {
  const p = S.ph;
  if (!p.s || !p.t) return;
  const br = p.b; const sv = svc(p.s);
  let mid = p.m;
  if (mid === 'any') {
    const c = MASTERS.filter(m => m.b === br && m.c.includes(sv.c));
    mid = (c.find(m => !S.appts.some(a => a.d === p.d && a.m === m.id && a.st !== 'cancel' &&
      m2s(a.t) < m2s(p.t) + sv.d && m2s(a.t) + svc(a.s).d > m2s(p.t))) || c[0]).id;
  }
  const id = 'o' + Date.now();
  S.appts = [...S.appts, { id, b: br, m: mid, s: p.s, cl: S.auth.client, t: p.t, d: p.d, st: 'new', on: true, extra: [], pr: null }];
  S.fresh = [...S.fresh, id];
  S.b = br; S.pv = S.auth.staff ? 'jour' : S.pv; S.day = p.d;
  S.ph = { ...S.ph, sc: 'ok', done: { id, m: mid } };
  note('book', L(svc(p.s)) + ' · ' + p.t, 'jour');
  toast('tNew'); commit();
  setTimeout(() => { S.fresh = S.fresh.filter(x => x !== id); render(); }, 3200);
}
function phCancel(id) {
  const a = S.appts.find(x => x.id === id);
  S.appts = S.appts.map(x => x.id === id ? { ...x, st: 'cancel' } : x);
  note('cancel', L(svc(a.s)) + ' · ' + a.t, 'jour');
  toast('tCanc'); commit();
}
function phResc(id, t) {
  S.appts = S.appts.map(a => a.id === id ? { ...a, t } : a);
  S.ph = { ...S.ph, resc: null };
  toast('tMove'); commit();
}
function setMeName(v) { const me = S.auth.client; if (!me || !v.trim()) return; S.cls = S.cls.map(c => c.id === me ? { ...c, n: v } : c); commit(); }
function setMePhone(v) { const me = S.auth.client; if (!me) return; S.cls = S.cls.map(c => c.id === me ? { ...c, t: v } : c); commit(); }

function cartAdd(id) {
  const c = [...S.ph.cart]; const i = c.findIndex(x => x.id === id);
  if (i >= 0) c[i] = { ...c[i], n: c[i].n + 1 }; else c.push({ id, n: 1 });
  S.ph = { ...S.ph, cart: c }; commit();
}
function cartDel(id) { S.ph = { ...S.ph, cart: S.ph.cart.filter(x => x.id !== id) }; commit(); }
function orderCart() {
  const tot = S.ph.cart.reduce((s, i) => s + PRODS.find(p => p.id === i.id).p * i.n, 0);
  const q = { ...(S.prodQ || {}) };
  S.ph.cart.forEach(i => { q[i.id] = qty(i.id) - i.n; });
  const id = 1047 + S.tx.filter(t => t.id >= 1047).length;
  const names = S.ph.cart.map(i => L(PRODS.find(p => p.id === i.id))).join(' · ');
  const me = S.auth.client;
  S.prodQ = q;
  S.tx = [...S.tx, { id, b: S.ph.b, t: s2m(nowMin()), cl: me || null, cn: me ? null : 'Onlayn', sum: tot, m: 'card', items: names, online: true }];
  S.ph = { ...S.ph, cart: [], ordered: true };
  note('order', names + ' · ' + money(tot) + ' ₼', 'stock');
  toast('tOrder'); commit();
}

/* ---------- journal drag & column click ---------- */
function cardDragStart(a, e, el) {
  if (e.button !== undefined && e.button !== 0) return;
  const grid = document.getElementById('jgrid');
  if (!grid) return;
  e.preventDefault();
  const cols = colIds();
  const cw = (grid.clientWidth - 64) / Math.max(cols.length, 1);
  const sx = e.clientX, sy = e.clientY;
  let moved = false;
  const mv = (ev) => {
    const dx = ev.clientX - sx, dy = ev.clientY - sy;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    moved = true;
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(.6deg)';
    el.style.boxShadow = '0 14px 30px rgba(23,20,31,.22)';
    el.style.zIndex = 60; el.style.transition = 'none';
  };
  const up = (ev) => {
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    if (!moved) { S.drawer = a.id; S.resc = null; commit(); return; }
    const dx = ev.clientX - sx, dy = ev.clientY - sy;
    const dSlot = Math.round(dy / (SH / 2)), dCol = Math.round(dx / cw);
    const ci = Math.min(Math.max(cols.indexOf(a.m) + dCol, 0), cols.length - 1);
    let nm = m2s(a.t) + dSlot * 15;
    nm = Math.max(540, Math.min(1260 - 15, Math.round(nm / 15) * 15));
    S.appts = S.appts.map(x => x.id === a.id ? { ...x, t: s2m(nm), m: cols[ci] } : x);
    toast('tMove'); commit();
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
}
function colClick(mid, e, el) {
  if (!e.target.dataset || e.target.dataset.col !== '1') return;
  const y = e.clientY - el.getBoundingClientRect().top;
  let mn = 540 + Math.floor(y / (SH / 2)) * 30;
  mn = Math.max(540, Math.min(1230, mn));
  S.quick = { m: mid, t: s2m(mn), s: null, name: '', phone: '', d: S.day };
  commit();
}
