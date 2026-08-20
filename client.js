/* Bellinaya — views: client side (phone frame + desktop customer site). */
'use strict';

/* ---------- shared client blocks ---------- */
function cBrList(compact) {
  const p = S.ph;
  return BRANCHES.map(b => `
    <button data-c="${hnd(() => P({ b: b.id }))}" style="display:flex;align-items:center;gap:11px;width:100%;padding:13px 14px;border-radius:13px;text-align:left;border:1px solid ${p.b === b.id ? '#3B2E5A' : '#E4E0D6'};background:${p.b === b.id ? '#EDE9F3' : '#FBFAF8'};margin-bottom:8px">
      <span style="width:9px;height:9px;border-radius:50%;flex-shrink:0;background:${p.b === b.id ? '#3B2E5A' : '#D8D3C6'}"></span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:${compact ? 12.5 : 13}px;font-weight:650">${L(b)}</span>
        <span style="display:block;font-size:${compact ? 11 : 11.5}px;color:#8D8677">${L(b.addr)}</span>
      </span>
      <span style="${F_MONO};font-size:${compact ? 10 : 10.5}px;color:#9A9284">${b.tel}</span>
    </button>`).join('');
}

function cCatList(compact) {
  const t = T(); const p = S.ph;
  return CATS.map(c => {
    const mn = Math.min(...SVCS.filter(x => x.c === c.id).map(x => price(x.id)));
    const open = p.cat === c.id;
    const items = SVCS.filter(x => x.c === c.id).map(x => `
      <button data-c="${hnd(() => P({ sc: 'book', step: 2, cat: c.id, s: x.id, m: 'any', t: null }))}" style="display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;border:none;border-bottom:1px solid #EFECE3;background:#FBFAF8;text-align:left">
        <span style="flex:1;font-size:${compact ? 12 : 12.5}px">${L(x)}</span>
        <span style="font-size:${compact ? 10.5 : 11}px;color:#9A9284">${x.d} ${t.min}</span>
        <span style="${F_MONO};font-size:${compact ? 12 : 12.5}px;font-weight:600;min-width:${compact ? 46 : 50}px;text-align:right">${price(x.id)} ₼</span>
      </button>`).join('');
    return `
    <div>
      <button data-c="${hnd(() => P({ cat: open ? null : c.id }))}" style="display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border:none;background:${open ? c.bg : '#FBFAF8'};border-radius:${open ? '12px 12px 0 0' : '12px'};text-align:left;margin-top:6px">
        <span style="width:8px;height:8px;border-radius:2px;background:${c.fg};flex-shrink:0"></span>
        <span style="flex:1;font-size:${compact ? 13 : 13.5}px;font-weight:600">${L(c)}</span>
        <span style="${F_MONO};font-size:${compact ? 11 : 11.5}px;color:#8D8677">${t.phFrom} ${mn} ₼</span>
      </button>
      <div style="background:#FBFAF8;border-radius:0 0 12px 12px;overflow:hidden;display:${open ? 'block' : 'none'}">${items}</div>
    </div>`;
  }).join('');
}

function cRevs(compact) {
  return REVIEWS.map(r => `
  <div style="background:#FBFAF8;border-radius:${compact ? 13 : 14}px;padding:${compact ? '13px 14px' : '16px 18px'};margin-bottom:${compact ? 8 : 9}px">
    <div style="display:flex;align-items:center;gap:${compact ? 7 : 8}px;margin-bottom:${compact ? 5 : 6}px">
      <span style="font-size:${compact ? 12 : 12.5}px;font-weight:650">${r.n}</span>
      <span style="font-size:${compact ? 10.5 : 11}px;color:#B4552D;letter-spacing:.06em">${'★★★★★'.slice(0, r.r) + '☆☆☆☆☆'.slice(0, 5 - r.r)}</span>
    </div>
    <div style="font-size:${compact ? 11.5 : 12.5}px;color:#5F5849;line-height:1.5;text-wrap:pretty">${L(r)}</div>
  </div>`).join('');
}

function cSteps() {
  const p = S.ph;
  return [0, 1, 2, 3, 4].map(i =>
    '<span style="flex:1;height:3px;border-radius:2px;background:' + (p.step > i ? '#3B2E5A' : '#E4E0D6') + '"></span>').join('');
}

function cStepBody(compact) {
  const t = T(); const p = S.ph;
  const svSel = p.s ? svc(p.s) : null;
  if (p.step === 1) {
    return compact ? cBrList(true)
      : '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(236px,1fr));gap:0 12px">' + cBrList(false) + '</div>';
  }
  if (p.step === 2) {
    const cats = [{ id: null, label: t.all }, ...CATS.map(c => ({ id: c.id, label: L(c) }))].map(c => `
      <button data-c="${hnd(() => P({ cat: c.id }))}" style="padding:6px 12px;border-radius:20px;border:none;font-size:11px;font-weight:${p.cat === c.id ? 700 : 500};flex-shrink:0;background:${p.cat === c.id ? '#3B2E5A' : '#EAE7DF'};color:${p.cat === c.id ? '#F2F0EA' : '#5F5849'}">${c.label}</button>`).join('');
    const list = (p.cat ? SVCS.filter(x => x.c === p.cat) : SVCS).map(x => `
      <button data-c="${hnd(() => P({ s: x.id, m: 'any', t: null }))}" style="display:flex;align-items:center;gap:9px;width:100%;padding:12px 14px;border-radius:12px;text-align:left;border:1px solid ${p.s === x.id ? '#3B2E5A' : '#E4E0D6'};background:${p.s === x.id ? '#EDE9F3' : '#FBFAF8'};margin-bottom:7px">
        <span style="flex:1;font-size:${compact ? 12.5 : 13}px">${L(x)}</span>
        <span style="font-size:${compact ? 10.5 : 11}px;color:#9A9284">${x.d} ${t.min}</span>
        <span style="${F_MONO};font-size:${compact ? 12.5 : 13}px;font-weight:600">${price(x.id)} ₼</span>
      </button>`).join('');
    return compact
      ? '<div><div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:11px">' + cats + '</div>' + list + '</div>'
      : '<div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' + cats + '</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(268px,1fr));gap:0 12px">' + list + '</div></div>';
  }
  if (p.step === 3) {
    const list = [{ id: 'any', n: t.phAny, r: null }, ...MASTERS.filter(m => m.b === p.b && (!svSel || m.c.includes(svSel.c)))].map(m => `
      <button data-c="${hnd(() => P({ m: m.id, t: null }))}" style="display:flex;align-items:center;gap:11px;width:100%;padding:12px 14px;border-radius:12px;text-align:left;border:1px solid ${p.m === m.id ? '#3B2E5A' : '#E4E0D6'};background:${p.m === m.id ? '#EDE9F3' : '#FBFAF8'};margin-bottom:7px">
        <span style="width:34px;height:34px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:11px;font-weight:700;background:${m.r ? catOf(m.c[0]).bg : '#EAE7DF'};color:${m.r ? catOf(m.c[0]).fg : '#8D8677'}">${m.r ? ini(m.n) : '—'}</span>
        <span style="flex:1;min-width:0">
          <span style="display:block;font-size:${compact ? 12.5 : 13}px;font-weight:650">${m.n}</span>
          <span style="display:block;font-size:${compact ? 10.5 : 11}px;color:#8D8677">${m.r ? L(ROLES[m.r]) : ''}</span>
        </span>
      </button>`).join('');
    return compact ? list : '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(236px,1fr));gap:0 12px">' + list + '</div>';
  }
  if (p.step === 4) {
    const days = [0, 1, 2, 3, 4, 5, 6].map(o => {
      const d = dateOf(o);
      return `
      <button data-c="${hnd(() => P({ d: o, t: null }))}" style="width:44px;flex-shrink:0;padding:8px 0;border-radius:11px;border:1px solid ${p.d === o ? '#3B2E5A' : '#E4E0D6'};background:${p.d === o ? '#3B2E5A' : '#FBFAF8'};color:${p.d === o ? '#F2F0EA' : '#17141F'};text-align:center">
        <span style="display:block;font-size:${compact ? 10 : 10.5}px;opacity:.7">${WD[S.lang][d.getDay()]}</span>
        <span style="display:block;${F_MONO};font-size:${compact ? 15 : 16}px;margin-top:1px">${d.getDate()}</span>
      </button>`;
    }).join('');
    const slots = svSel ? freeSlots(p.m, p.d, svSel.d, p.b) : [];
    const hasFree = slots.some(x => x.ok);
    const slotBtns = slots.map(x => `
      <button ${x.ok ? 'data-c="' + hnd(() => P({ t: x.t })) + '"' : 'disabled'} style="padding:9px 0;border-radius:10px;border:1px solid ${p.t === x.t ? '#3B2E5A' : x.ok ? '#E4E0D6' : 'transparent'};background:${p.t === x.t ? '#3B2E5A' : x.ok ? '#FBFAF8' : '#EDEAE1'};color:${p.t === x.t ? '#F2F0EA' : x.ok ? '#17141F' : '#B5AFA3'};${F_MONO};font-size:12px;text-align:center;${x.ok ? '' : 'text-decoration:line-through;cursor:default'}">${x.t}</button>`).join('');
    return `
    <div>
      <div style="display:flex;gap:${compact ? 6 : 7}px;${compact ? 'overflow-x:auto' : 'flex-wrap:wrap'};padding-bottom:${compact ? 14 : 18}px">${days}</div>
      ${hasFree
        ? '<div style="display:grid;grid-template-columns:' + (compact ? 'repeat(4,1fr)' : 'repeat(auto-fill,minmax(82px,1fr))') + ';gap:' + (compact ? 6 : 7) + 'px">' + slotBtns + '</div>'
        : '<div style="background:#FBF2F0;color:#C0392B;border-radius:12px;padding:13px 15px;font-size:12px">' + t.phNoFree + '</div>'}
    </div>`;
  }
  /* step 5 — confirmation */
  if (compact) return '<div style="background:#FBFAF8;border-radius:14px;padding:6px 15px 12px">' + cSumRows() + '</div>';
  const me = S.auth.client ? cliOf(S.auth.client) : null;
  const brSel = BRANCHES.find(b => b.id === p.b);
  return `
  <div>
    <div style="background:#FBFAF8;border-radius:16px;padding:20px 22px;margin-bottom:12px">
      <div style="${LBL9};margin-bottom:10px">${t.qcName}</div>
      <input data-f="mename" value="${esc(me ? me.n : '')}" data-in="${hnd((e) => setMeName(e.target.value))}" style="width:100%;padding:11px 13px;border-radius:11px;border:1px solid #DED9CD;background:#F5F3ED;font-size:13.5px;margin-bottom:10px" />
      <div style="${LBL9};margin-bottom:10px">${t.qcPhone}</div>
      <input data-f="mephone" value="${esc(me ? me.t : '')}" data-in="${hnd((e) => setMePhone(e.target.value))}" style="width:100%;padding:11px 13px;border-radius:11px;border:1px solid #DED9CD;background:#F5F3ED;${F_MONO};font-size:13px" />
    </div>
    <div style="background:#FBFAF8;border-radius:16px;padding:20px 22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px;align-items:start">
      <div>
        <div style="${LBL9};margin-bottom:8px">${t.stB}</div>
        <div style="font-size:13.5px;font-weight:650">${L(brSel)}</div>
        <div style="font-size:12px;color:#8D8677;margin-top:3px">${L(brSel.addr)}</div>
        <div style="${F_MONO};font-size:12px;color:#5F5849;margin-top:8px">${brSel.tel}</div>
      </div>
      <div style="min-height:96px;border-radius:12px;display:grid;place-items:center;background-image:repeating-linear-gradient(135deg,#EDE9F3 0 9px,#F7F5F0 9px 10px)">
        <span style="${F_MONO};font-size:9px;letter-spacing:.12em;color:#8A82A0;text-transform:uppercase">${t.phMap}</span>
      </div>
    </div>
    <div style="font-size:12px;color:#8D8677;line-height:1.6;text-wrap:pretty;margin-top:14px">${t.phPolicy}</div>
  </div>`;
}

function cSumRows() {
  const t = T(); const p = S.ph;
  const svSel = p.s ? svc(p.s) : null;
  const brSel = BRANCHES.find(b => b.id === p.b);
  const rows = [
    [t.stB, L(brSel)], [t.stS, svSel ? L(svSel) : '—'],
    [t.stM, p.m === 'any' ? t.phAny : mst(p.m).n],
    [t.stD, fmtDate(p.d) + ', ' + (p.t || '—')],
    [t.fDur, svSel ? svSel.d + ' ' + t.min : '—'], [t.fPrice, svSel ? price(p.s) + ' ₼' : '—']
  ];
  return rows.map(([k, v]) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #EDEAE1">
      <span style="${F_MONO};font-size:9px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;width:78px">${k}</span>
      <span style="flex:1;text-align:right;font-size:12.5px;font-weight:600">${v}</span>
    </div>`).join('');
}

function cCanNext() {
  const p = S.ph;
  return p.step === 1 ? !!p.b : p.step === 2 ? !!p.s : p.step === 3 ? !!p.m : p.step === 4 ? !!p.t : true;
}
function cOnNext() {
  const p = S.ph;
  if (!cCanNext()) return;
  if (p.step === 4 && !S.auth.client) { P({ sc: 'auth', after: 'book' }); return; }
  P({ step: Math.min(5, p.step + 1) });
}
function cOnBack() {
  const p = S.ph;
  if (p.step === 1) P({ sc: 'home' }); else P({ step: p.step - 1 });
}

function cAuth(compact) {
  const t = T(); const c = S.clog;
  const err = c.err === 'phone' ? t.errPhone : c.err === 'code' ? t.errCode : c.err === 'name' ? t.errName : '';
  const errH = err ? '<div style="margin-top:9px;font-size:12px;color:#C0392B">' + err + '</div>' : '';
  const btn = 'width:100%;margin-top:14px;padding:15px 0;border-radius:12px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:14px;font-weight:700';
  let body = '';
  if (c.step === 'phone') body = `
    <div>
      <div style="font-size:${compact ? 13 : 14}px;color:#8D8677;line-height:1.55;margin-bottom:20px">${t.authS}</div>
      <div style="${LBL9};margin-bottom:7px">${t.qcPhone}</div>
      <input data-f="clphone" value="${esc(c.phone)}" inputmode="tel" data-in="${hnd((e) => { S.clog = { ...S.clog, phone: e.target.value, err: '' }; commit(); })}" data-kd="${hnd((e) => { if (e.key === 'Enter') sendCode(); })}" placeholder="050 000 00 00" style="width:100%;padding:14px 16px;border-radius:12px;border:1px solid #DED9CD;background:#FBFAF8;${F_MONO};font-size:16px" />
      ${errH}
      <button data-c="${hnd(sendCode)}" style="${btn}">${t.authSend}</button>
      <div style="font-size:11.5px;color:#9A9284;line-height:1.5;margin-top:14px">${t.authWhy}</div>
      <div style="margin-top:16px;padding:11px 14px;border-radius:11px;background:#F0EDE4;${F_MONO};font-size:10.5px;color:#6F6127">051 220 66 15 — ${t.demoHint}</div>
    </div>`;
  else if (c.step === 'code') body = `
    <div>
      <div style="font-size:${compact ? 13 : 14}px;color:#8D8677;line-height:1.55;margin-bottom:20px"><span style="${F_MONO};color:#17141F">${esc(c.phone)}</span> ${t.authCodeS}</div>
      <div style="${LBL9};margin-bottom:7px">${t.authCode}</div>
      <input data-f="clcode" value="${esc(c.code)}" inputmode="numeric" data-in="${hnd((e) => { S.clog = { ...S.clog, code: e.target.value.replace(/\D/g, '').slice(0, 4), err: '' }; commit(); })}" data-kd="${hnd((e) => { if (e.key === 'Enter') verifyCode(); })}" placeholder="••••" style="width:100%;padding:14px 16px;border-radius:12px;border:1px solid #DED9CD;background:#FBFAF8;${F_MONO};font-size:22px;letter-spacing:.4em;text-align:center" />
      ${errH}
      <button data-c="${hnd(verifyCode)}" style="${btn}">${t.authVerify}</button>
      <button data-c="${hnd(() => { S.clog = { ...S.clog, step: 'phone', err: '', code: '' }; commit(); })}" style="width:100%;margin-top:9px;padding:12px 0;border-radius:11px;border:1px solid #DED9CD;background:transparent;color:#5F5849;font-size:12.5px">${t.authChange}</button>
      <div style="margin-top:16px;padding:11px 14px;border-radius:11px;background:#F0EDE4;${F_MONO};font-size:10.5px;color:#6F6127">${t.demoHint}: ${SMS_CODE}</div>
    </div>`;
  else body = `
    <div>
      <div style="font-size:${compact ? 13 : 14}px;color:#8D8677;line-height:1.55;margin-bottom:20px">${t.authNameS}</div>
      <div style="${LBL9};margin-bottom:7px">${t.authName}</div>
      <input data-f="clname" value="${esc(c.name)}" data-in="${hnd((e) => { S.clog = { ...S.clog, name: e.target.value, err: '' }; commit(); })}" data-kd="${hnd((e) => { if (e.key === 'Enter') finishSignup(); })}" style="width:100%;padding:14px 16px;border-radius:12px;border:1px solid #DED9CD;background:#FBFAF8;font-size:15px" />
      ${errH}
      <button data-c="${hnd(finishSignup)}" style="${btn}">${t.authSignup}</button>
    </div>`;
  return `
  <div style="max-width:440px;margin:0 auto;padding:${compact ? '26px 18px 30px' : 'min(56px,4.6vw) min(46px,4vw)'};animation:bl-up .28s ease-out">
    <div style="width:44px;height:44px;border-radius:13px;background:#EDE9F3;color:#3B2E5A;display:grid;place-items:center;font-size:19px;margin-bottom:16px">◍</div>
    <h2 style="${F_SERIF};font-size:${compact ? '23px' : 'clamp(26px,2.6vw,34px)'};font-weight:400;margin:0 0 6px">${t.authT}</h2>
    ${body}
  </div>`;
}

function cOk(compact) {
  const t = T(); const p = S.ph;
  const a = p.done ? S.appts.find(x => x.id === p.done.id) : null;
  if (!a) return '';
  return `
  <div style="${compact ? 'padding:34px 20px' : 'max-width:560px;margin:0 auto;padding:min(62px,5vw) min(46px,4vw)'};text-align:center;animation:bl-up .35s ease-out">
    <div style="width:${compact ? 58 : 66}px;height:${compact ? 58 : 66}px;border-radius:50%;background:#E7EFEA;color:#2F6B5E;display:grid;place-items:center;font-size:${compact ? 26 : 30}px;margin:0 auto ${compact ? 16 : 20}px">✓</div>
    <h2 style="${F_SERIF};font-size:${compact ? '24px' : 'clamp(26px,2.6vw,34px)'};font-weight:400;margin:0 0 ${compact ? 8 : 10}px">${t.phDone}</h2>
    <div style="font-size:${compact ? 12 : 13}px;color:#8D8677;line-height:1.55;text-wrap:pretty;margin-bottom:${compact ? 20 : 24}px">${t.phDoneS}</div>
    <div style="background:#FBFAF8;border-radius:${compact ? 14 : 16}px;padding:${compact ? '15px 16px' : '20px 22px'};text-align:left">
      <div style="font-size:${compact ? 14 : 16}px;font-weight:650;margin-bottom:${compact ? 3 : 4}px">${L(svc(a.s))}</div>
      <div style="font-size:${compact ? 11.5 : 12.5}px;color:#8D8677;margin-bottom:${compact ? 11 : 14}px">${mst(a.m).n} · ${L(BRANCHES.find(b => b.id === a.b))}</div>
      <div style="display:flex;align-items:baseline;gap:${compact ? 8 : 10}px">
        <span style="${F_MONO};font-size:${compact ? 17 : 20}px">${a.t}</span>
        <span style="font-size:${compact ? 12 : 13}px;color:#5F5849">${fmtDate(a.d)}</span>
        <span style="flex:1"></span>
        <span style="${F_MONO};font-size:${compact ? 14 : 16}px;color:#3B2E5A">${price(a.s)} ₼</span>
      </div>
    </div>
    <button data-c="${hnd(() => P({ sc: 'my', step: 1, s: null, t: null, done: null }))}" style="width:100%;margin-top:${compact ? 14 : 16}px;padding:${compact ? 13 : 14}px 0;border-radius:12px;border:1px solid #DED9CD;background:#FBFAF8;font-size:${compact ? 13 : 13.5}px;font-weight:650">${t.phMy}</button>
  </div>`;
}

function cMy(compact) {
  const t = T(); const p = S.ph; const ME = S.auth.client;
  const mine = ME ? S.appts.filter(a => a.cl === ME) : [];
  const mkCard = (a) => {
    const c = catOf(svc(a.s).c);
    const rescOpen = p.resc === a.id;
    const slots = rescOpen ? freeSlots(a.m, a.d, svc(a.s).d, a.b).map(x => `
      <button ${x.ok ? 'data-c="' + hnd(() => phResc(a.id, x.t)) + '"' : 'disabled'} style="padding:8px 0;border-radius:9px;border:1px solid ${x.ok ? '#DED9CD' : 'transparent'};background:${x.ok ? '#F5F3ED' : '#EDEAE1'};color:${x.ok ? '#17141F' : '#B5AFA3'};${F_MONO};font-size:11.5px;text-align:center;${x.ok ? '' : 'cursor:default'}">${x.t}</button>`).join('') : '';
    const active = a.st !== 'cancel' && a.st !== 'done';
    return `
    <div style="background:#FBFAF8;border-radius:14px;padding:14px 15px;margin-bottom:9px;border-left:3px solid ${stColor(a.st)};opacity:${a.st === 'cancel' ? .6 : 1}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
        <span style="${F_MONO};font-size:15px">${a.t}</span>
        <span style="font-size:11.5px;color:#5F5849">${fmtDate(a.d)}</span>
        <span style="flex:1"></span>
        <span style="${F_MONO};font-size:8.5px;letter-spacing:.08em;padding:3px 7px;border-radius:5px;background:${a.st === 'cancel' ? '#EDEAE1' : c.bg};color:${a.st === 'cancel' ? '#9A9284' : c.fg}">${stLabel(a.st)}</span>
      </div>
      <div style="font-size:13px;font-weight:650">${L(svc(a.s))}</div>
      <div style="font-size:11px;color:#8D8677;margin-bottom:10px">${mst(a.m).n} · ${BRANCHES.find(b => b.id === a.b).short} · ${a.pr || price(a.s)} ₼</div>
      ${active ? `
      <div style="display:flex;gap:7px">
        <button data-c="${hnd(() => P({ resc: rescOpen ? null : a.id }))}" style="flex:1;padding:9px 0;border-radius:10px;border:1px solid #DED9CD;background:#F5F3ED;font-size:11.5px;font-weight:600">${t.phMyResc}</button>
        <button data-c="${hnd(() => phCancel(a.id))}" style="flex:1;padding:9px 0;border-radius:10px;border:1px solid #EFD9D5;background:#FBF2F0;color:#C0392B;font-size:11.5px;font-weight:600">${t.phMyCanc}</button>
      </div>` : ''}
      ${rescOpen ? `
      <div style="margin-top:11px">
        <div style="${F_MONO};font-size:8.5px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;margin-bottom:7px">${t.resc}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">${slots}</div>
      </div>` : ''}
    </div>`;
  };
  const up = mine.filter(a => a.st !== 'done').map(mkCard).join('');
  const past = mine.filter(a => a.st === 'done').map(a => `
    <div style="display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid #E4E0D6">
      <span style="${F_MONO};font-size:11px;color:#8D8677;min-width:58px">${fmtDate(a.d)}</span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:12px;font-weight:600">${L(svc(a.s))}</span>
        <span style="display:block;font-size:10.5px;color:#8D8677">${mst(a.m).n}</span>
      </span>
      <span style="${F_MONO};font-size:12px">${a.pr || price(a.s)} ₼</span>
    </div>`).join('');
  const inner = `
    <div style="${LBL9};letter-spacing:.16em;margin-bottom:9px">${t.phUp}</div>
    ${compact ? up : '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:0 12px">' + up + '</div>'}
    ${up ? '' : '<div style="font-size:12px;color:#9A9284;padding:6px 0 12px">' + t.phNoUp + '</div>'}
    <div style="${LBL9};letter-spacing:.16em;margin:18px 0 9px">${t.phPast}</div>
    ${past}`;
  return compact
    ? '<div style="padding:14px 16px 22px"><h2 style="' + F_SERIF + ';font-size:23px;font-weight:400;margin:0 0 14px">' + t.phMy + '</h2>' + inner + '</div>'
    : '<div style="max-width:1000px;margin:0 auto;padding:min(38px,3.2vw) min(46px,4vw) 40px"><h2 style="' + F_SERIF + ';font-size:clamp(26px,2.6vw,34px);font-weight:400;margin:0 0 20px">' + t.phMy + '</h2>' + inner + '</div>';
}

function cShop(compact) {
  const t = T(); const p = S.ph;
  const items = PRODS.map(pr => {
    const soon = qty(pr.id) <= 2;
    return `
    <div style="background:#FBFAF8;border-radius:14px;padding:${compact ? '10px 11px 12px' : '12px 13px 14px'}">
      <div style="height:${compact ? 74 : 96}px;border-radius:10px;margin-bottom:9px;background-image:repeating-linear-gradient(135deg,#EDE9F3 0 7px,#F7F5F0 7px 8px)"></div>
      <div style="font-size:${compact ? 11.5 : 13}px;font-weight:600;line-height:1.3;min-height:${compact ? 30 : 35}px">${L(pr)}</div>
      <div style="display:flex;align-items:center;gap:6px;margin:${compact ? '6px 0 8px' : '8px 0 11px'}">
        <span style="${F_MONO};font-size:${compact ? 13 : 15}px">${pr.p} ₼</span>
        ${soon ? '<span style="' + F_MONO + ';font-size:8px;letter-spacing:.08em;color:#C0392B">' + qty(pr.id) + ' ' + t.phMinLeft + '</span>' : ''}
      </div>
      <button data-c="${hnd(() => cartAdd(pr.id))}" style="width:100%;padding:${compact ? 8 : 10}px 0;border-radius:${compact ? 9 : 10}px;border:none;background:#EDE9F3;color:#3B2E5A;font-size:${compact ? 11 : 12}px;font-weight:700">${t.phAdd}</button>
    </div>`;
  }).join('');
  const cartTot = p.cart.reduce((a, i) => a + PRODS.find(x => x.id === i.id).p * i.n, 0);
  const cartBtn = p.cart.length ? `
    <button data-c="${hnd(() => P({ sc: 'cart' }))}" style="position:sticky;bottom:${compact ? 8 : 14}px;width:100%;${compact ? '' : 'max-width:340px;display:block;margin:22px auto 0;'}margin-top:14px;padding:${compact ? 14 : 15}px 0;border-radius:13px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:${compact ? 13.5 : 14}px;font-weight:700">${t.phCart} · ${cartTot} ₼</button>` : '';
  return compact
    ? '<div style="padding:14px 16px 22px"><h2 style="' + F_SERIF + ';font-size:23px;font-weight:400;margin:0 0 14px">' + t.phShop + '</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">' + items + '</div>' + cartBtn + '</div>'
    : '<div style="max-width:1180px;margin:0 auto;padding:min(38px,3.2vw) min(46px,4vw) 40px"><h2 style="' + F_SERIF + ';font-size:clamp(26px,2.6vw,34px);font-weight:400;margin:0 0 20px">' + t.phShop + '</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(212px,1fr));gap:14px">' + items + '</div>' + cartBtn + '</div>';
}

function cCart(compact) {
  const t = T(); const p = S.ph;
  const items = p.cart.map(i => {
    const pr = PRODS.find(x => x.id === i.id);
    return `
    <div style="display:flex;align-items:center;gap:${compact ? 10 : 12}px;padding:${compact ? 11 : 13}px 0;border-bottom:1px solid #EDEAE1">
      <span style="${F_MONO};font-size:${compact ? 11 : 11.5}px;color:#8D8677;min-width:${compact ? 24 : 26}px">${i.n}×</span>
      <span style="flex:1;font-size:${compact ? 12 : 13}px">${L(pr)}</span>
      <span style="${F_MONO};font-size:${compact ? 12.5 : 13}px">${pr.p * i.n} ₼</span>
      <button data-c="${hnd(() => cartDel(i.id))}" style="border:none;background:transparent;color:#B5AFA3;font-size:${compact ? 14 : 15}px;padding:0 2px">×</button>
    </div>`;
  }).join('');
  const cartTot = p.cart.reduce((a, i) => a + PRODS.find(x => x.id === i.id).p * i.n, 0);
  const orderedH = p.ordered ? `
    <div style="background:#E7EFEA;border-radius:${compact ? 14 : 16}px;padding:${compact ? '18px 16px' : '24px 20px'};text-align:center;animation:bl-up .3s ease-out">
      <div style="font-size:${compact ? 24 : 28}px;color:#2F6B5E;margin-bottom:${compact ? 6 : 8}px">✓</div>
      <div style="font-size:${compact ? 14 : 15}px;font-weight:650;color:#2F6B5E">${t.phOrdered}</div>
      <div style="font-size:${compact ? 11.5 : 12.5}px;color:#4A7A6C;margin-top:5px;line-height:1.5">${t.phPickup}</div>
    </div>` : '';
  const cartH = p.cart.length ? `
    <div>
      <div style="background:#FBFAF8;border-radius:${compact ? 14 : 16}px;padding:4px ${compact ? 15 : 20}px ${compact ? 10 : 12}px;margin-bottom:${compact ? 12 : 14}px">
        ${items}
        <div style="display:flex;align-items:center;padding:${compact ? 12 : 14}px 0 2px">
          <span style="flex:1;font-size:${compact ? 12 : 13}px;font-weight:650">${t.total}</span>
          <span style="${F_MONO};font-size:${compact ? 17 : 20}px;color:#3B2E5A">${cartTot} ₼</span>
        </div>
      </div>
      <button data-c="${hnd(orderCart)}" style="width:100%;padding:${compact ? 14 : 15}px 0;border-radius:13px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:${compact ? 13.5 : 14}px;font-weight:700">${t.phOrder}</button>
    </div>` : '';
  const head = `
    <div style="display:flex;align-items:center;gap:${compact ? 10 : 12}px;margin-bottom:${compact ? 14 : 20}px">
      <button data-c="${hnd(() => P({ sc: 'shop', ordered: false }))}" style="width:${compact ? 30 : 34}px;height:${compact ? 30 : 34}px;border-radius:${compact ? 9 : 10}px;border:1px solid #DED9CD;background:#FBFAF8;font-size:${compact ? 14 : 15}px">←</button>
      <h2 style="${F_SERIF};font-size:${compact ? '22px' : 'clamp(24px,2.4vw,30px)'};font-weight:400;margin:0">${t.phCart}</h2>
    </div>`;
  return compact
    ? '<div style="padding:14px 16px 22px">' + head + orderedH + cartH + '</div>'
    : '<div style="max-width:640px;margin:0 auto;padding:min(38px,3.2vw) min(46px,4vw) 40px">' + head + orderedH + cartH + '</div>';
}

/* ---------- desktop customer site ---------- */
function vDeskSite() {
  const t = T(); const p = S.ph; const ME = S.auth.client;
  const tabOn = (id) => p.sc === id || (id === 'home' && (p.sc === 'book' || p.sc === 'ok' || p.sc === 'auth')) || (id === 'shop' && p.sc === 'cart');
  const dTabs = [['home', t.phHome], ['my', t.phMy], ['shop', t.phShop]].map(([id, label]) => `
    <button data-c="${hnd(() => P((id === 'my' && !S.auth.client) ? { sc: 'auth', after: 'my' } : { sc: id, ordered: false }))}" style="padding:8px 2px;border:none;background:transparent;font-size:13.5px;font-weight:${tabOn(id) ? 700 : 500};color:${tabOn(id) ? '#17141F' : '#8D8677'};border-bottom:2px solid ${tabOn(id) ? '#3B2E5A' : 'transparent'}">${label}</button>`).join('');
  const dBranch = BRANCHES.map(b => `
    <button data-c="${hnd(() => P({ b: b.id }))}" style="padding:6px 12px;border-radius:9px;border:1px solid ${p.b === b.id ? '#3B2E5A' : '#E4E0D6'};background:${p.b === b.id ? '#EDE9F3' : '#FBFAF8'};font-size:12px;font-weight:${p.b === b.id ? 650 : 500}">${b.short}</button>`).join('');
  const me = ME ? cliOf(ME) : null;
  const acct = me ? `
    <div style="display:flex;align-items:center;gap:9px;padding-left:14px;border-left:1px solid #E4E0D6">
      <span style="width:30px;height:30px;border-radius:50%;background:#3B2E5A;color:#F2F0EA;display:grid;place-items:center;font-size:11.5px;font-weight:600">${esc(ini(me.n))}</span>
      <span style="line-height:1.25">
        <span style="display:block;font-size:12.5px;font-weight:650">${esc(me.n)}</span>
        <span style="display:block;font-size:10.5px;color:#8D8677">${me.v} ${t.visitsN}</span>
      </span>
      <button data-c="${hnd(clientOut)}" style="padding:6px 11px;border-radius:9px;border:1px solid #E4E0D6;background:transparent;color:#8D8677;font-size:10.5px">${t.logout}</button>
    </div>`
    : `<button data-c="${hnd(() => ME ? P({ sc: 'book', step: 1, t: null }) : P({ sc: 'auth', after: 'book', step: 1 }))}" style="padding:9px 17px;border-radius:10px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:12.5px;font-weight:700">${t.login}</button>`;
  const brSel = BRANCHES.find(b => b.id === p.b);
  let body = '';
  if (p.sc === 'home') {
    const mstCards = MASTERS.filter(m => m.b === p.b).map(m => {
      const c = catOf(m.c[0]);
      return `
      <div style="background:#FBFAF8;border-radius:15px;padding:20px 16px 22px;text-align:center">
        <div style="width:84px;height:84px;border-radius:50%;margin:0 auto 13px;color:${c.fg};display:grid;place-items:center;font-size:25px;font-weight:600;background-image:repeating-linear-gradient(135deg,${c.bg} 0 8px,#FBFAF8 8px 9px)">${ini(m.n)}</div>
        <div style="font-size:13px;font-weight:650;line-height:1.3">${m.n}</div>
        <div style="font-size:11px;color:#8D8677;margin-top:3px">${L(ROLES[m.r])}</div>
      </div>`;
    }).join('');
    body = `
    <div>
      <div style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0;background-image:repeating-linear-gradient(135deg,#E1DCEA 0 11px,#EFEBF3 11px 12px)">
        <div style="padding:min(62px,5vw) min(46px,4vw)">
          <div style="${F_MONO};font-size:9.5px;letter-spacing:.18em;color:#7C7496;text-transform:uppercase;margin-bottom:16px">${t.tag}</div>
          <div style="${F_SERIF};font-size:clamp(38px,4.6vw,66px);line-height:1.02;letter-spacing:-.01em;color:#17141F">${L(brSel)}</div>
          <div style="font-size:14px;color:#4A4358;margin-top:12px">${L(brSel.addr)}</div>
          <div style="display:flex;align-items:center;gap:9px;font-size:13px;color:#4A4358;margin-top:20px;flex-wrap:wrap">
            <span style="color:#B4552D">★ 4.9</span><span style="color:#B6AECB">·</span>
            <span>320 ${t.phRate}</span><span style="color:#B6AECB">·</span><span>${t.phTeam}</span>
          </div>
          <button data-c="${hnd(() => ME ? P({ sc: 'book', step: 1, t: null }) : P({ sc: 'auth', after: 'book', step: 1 }))}" style="margin-top:28px;padding:16px 34px;border-radius:13px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:15px;font-weight:700">${t.phBook}</button>
        </div>
        <div style="min-height:300px;display:grid;place-items:center">
          <span style="${F_MONO};font-size:10px;letter-spacing:.14em;color:#8A82A0;text-transform:uppercase">${t.phHero}</span>
        </div>
      </div>
      <div style="padding:min(46px,4vw) min(46px,4vw) 0">
        <div style="${LBL};letter-spacing:.16em;margin-bottom:12px">${t.phBr}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(248px,1fr));gap:10px">${cBrList(false)}</div>
      </div>
      <div style="padding:min(40px,3.4vw) min(46px,4vw) 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:min(38px,3.2vw);align-items:start">
        <div><div style="${LBL};letter-spacing:.16em">${t.phSvc}</div>${cCatList(false)}</div>
        <div><div style="${LBL};letter-spacing:.16em;margin-bottom:12px">${t.phRev}</div>${cRevs(false)}</div>
      </div>
      <div style="padding:min(40px,3.4vw) min(46px,4vw) min(56px,4.6vw)">
        <div style="${LBL};letter-spacing:.16em;margin-bottom:12px">${t.phMst}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(164px,1fr));gap:12px">${mstCards}</div>
      </div>
    </div>`;
  } else if (p.sc === 'book') {
    body = `
    <div style="max-width:1120px;margin:0 auto;padding:min(38px,3.2vw) min(46px,4vw) 40px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
        <button data-c="${hnd(cOnBack)}" style="width:34px;height:34px;border-radius:10px;border:1px solid #DED9CD;background:#FBFAF8;font-size:15px">←</button>
        <span style="${LBL};letter-spacing:.14em">${t.phStep} ${p.step}/5</span>
        <div style="flex:1;min-width:120px;display:flex;gap:5px">${cSteps()}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:min(34px,3vw);align-items:start">
        <div>
          <h2 style="${F_SERIF};font-size:clamp(24px,2.4vw,32px);font-weight:400;margin:0 0 18px">${[t.stB, t.stS, t.stM, t.stD, t.stOk][p.step - 1]}</h2>
          ${cStepBody(false)}
        </div>
        <div style="background:#FBFAF8;border-radius:16px;padding:8px 20px 20px;position:sticky;top:0">
          <div style="${LBL};padding:14px 0 4px">${t.stOk}</div>
          ${cSumRows()}
          <div style="display:flex;gap:8px;margin-top:18px">
            ${p.step !== 5
              ? '<button data-c="' + hnd(cOnNext) + '" style="flex:1;padding:13px 0;border-radius:12px;border:none;font-size:13.5px;font-weight:700;background:' + (cCanNext() ? '#3B2E5A' : '#DED9CD') + ';color:' + (cCanNext() ? '#F2F0EA' : '#9A9284') + '">' + t.phNext + '</button>'
              : '<button data-c="' + hnd(phConfirm) + '" style="flex:1;padding:14px 0;border-radius:12px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:14px;font-weight:700">' + t.phConf + '</button>'}
          </div>
        </div>
      </div>
    </div>`;
  } else if (p.sc === 'ok') body = cOk(false);
  else if (p.sc === 'auth') body = cAuth(false);
  else if (p.sc === 'my') body = cMy(false);
  else if (p.sc === 'shop') body = cShop(false);
  else if (p.sc === 'cart') body = cCart(false);
  const cartN = p.cart.length;
  return `
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;background:#F2F0EA">
    <div style="flex-shrink:0;display:flex;align-items:center;gap:min(34px,3vw);flex-wrap:wrap;padding:14px min(46px,4vw);background:#FBFAF8;border-bottom:1px solid #E4E0D6">
      <span style="${F_SERIF};font-size:22px;letter-spacing:.14em">BELLINAYA</span>
      <div style="display:flex;gap:min(26px,2.4vw)">${dTabs}</div>
      <div style="flex:1;min-width:12px"></div>
      <div style="display:flex;gap:5px">${dBranch}</div>
      <button data-c="${hnd(() => P({ sc: 'cart' }))}" style="position:relative;padding:8px 15px;border-radius:10px;border:1px solid #DED9CD;background:#F5F3ED;font-size:12.5px;font-weight:600">
        ${t.phCart}
        ${cartN ? '<span style="position:absolute;top:2px;right:2px;min-width:15px;height:15px;border-radius:8px;background:#B4552D;color:#fff;font-size:9px;font-weight:700;display:grid;place-items:center;padding:0 3px">' + cartN + '</span>' : ''}
      </button>
      ${acct}
    </div>
    <div style="flex:1;min-height:0;overflow:auto">${body}</div>
  </div>`;
}

/* ---------- phone rail (dark strip + iphone frame) ---------- */
function vPhoneRail() {
  const t = T(); const p = S.ph; const ME = S.auth.client;
  const full = S.railOpen || S.view === 'phone';
  const railStyle = 'width:' + (S.view === 'phone' ? '100%' : (S.railOpen ? 'clamp(292px,31%,416px)' : '46px')) +
    ';flex-shrink:0;background:#17141F;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:' +
    (full ? '18px 12px' : '10px 0') + ';min-width:0;transition:width .2s ease';
  if (!full) {
    return `
    <div style="${railStyle}">
      <button data-c="${hnd(() => { S.railOpen = true; commit(); })}" style="flex:1;width:100%;border:none;background:transparent;color:#8B839B;display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0">
        <span style="font-size:15px">‹</span>
        <span style="writing-mode:vertical-rl;${F_MONO};font-size:9.5px;letter-spacing:.2em;text-transform:uppercase">${t.desk}</span>
      </button>
    </div>`;
  }
  /* phone screens */
  let screen = '';
  if (p.sc === 'home') {
    const me = ME ? cliOf(ME) : null;
    const prof = me ? `
      <div style="display:flex;align-items:center;gap:11px;background:#FBFAF8;border-radius:14px;padding:12px 14px;margin-top:13px">
        <span style="width:34px;height:34px;border-radius:50%;background:#3B2E5A;color:#F2F0EA;display:grid;place-items:center;font-size:12px;font-weight:600">${esc(ini(me.n))}</span>
        <span style="flex:1;min-width:0">
          <span style="display:block;font-size:12.5px;font-weight:650">${esc(me.n)}</span>
          <span style="display:block;font-size:10.5px;color:#8D8677">${me.v} ${t.visitsN} · ${esc(me.t)}</span>
        </span>
        <button data-c="${hnd(clientOut)}" style="border:none;background:transparent;color:#8D8677;font-size:10.5px">${t.logout}</button>
      </div>` : '';
    const mstCards = MASTERS.filter(m => m.b === p.b).map(m => {
      const c = catOf(m.c[0]);
      return `
      <div style="width:118px;flex-shrink:0;background:#FBFAF8;border-radius:13px;padding:12px 12px 14px;text-align:center">
        <div style="width:56px;height:56px;border-radius:50%;margin:0 auto 9px;color:${c.fg};display:grid;place-items:center;font-size:17px;font-weight:600;background-image:repeating-linear-gradient(135deg,${c.bg} 0 6px,#FBFAF8 6px 7px)">${ini(m.n)}</div>
        <div style="font-size:11.5px;font-weight:650;line-height:1.25">${m.n}</div>
        <div style="font-size:10px;color:#8D8677;margin-top:2px">${L(ROLES[m.r])}</div>
      </div>`;
    }).join('');
    screen = `
    <div>
      <div style="height:186px;position:relative;background-image:repeating-linear-gradient(135deg,#E1DCEA 0 9px,#EFEBF3 9px 10px);display:flex;align-items:flex-end;padding:16px">
        <span style="position:absolute;top:12px;left:16px;${F_MONO};font-size:9px;letter-spacing:.12em;color:#8A82A0;text-transform:uppercase">${t.phHero}</span>
        <span style="${F_SERIF};font-size:34px;letter-spacing:.06em;color:#17141F">BELLINAYA</span>
      </div>
      <div style="padding:14px 16px 0">
        <div style="display:flex;align-items:center;gap:8px;font-size:11.5px;color:#5F5849">
          <span style="color:#B4552D">★ 4.9</span><span style="color:#C6C0B3">·</span>
          <span>320 ${t.phRate}</span><span style="color:#C6C0B3">·</span><span>${t.phTeam}</span>
        </div>
        ${prof}
        <button data-c="${hnd(() => ME ? P({ sc: 'book', step: 1, t: null }) : P({ sc: 'auth', after: 'book', step: 1 }))}" style="width:100%;margin-top:13px;padding:15px 0;border-radius:13px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:14.5px;font-weight:700">${t.phBook}</button>
      </div>
      <div style="padding:22px 16px 0">
        <div style="${LBL9};letter-spacing:.16em;margin-bottom:9px">${t.phBr}</div>
        ${cBrList(true)}
      </div>
      <div style="padding:20px 16px 0">
        <div style="${LBL9};letter-spacing:.16em">${t.phSvc}</div>
        ${cCatList(true)}
      </div>
      <div style="padding:22px 0 0">
        <div style="${LBL9};letter-spacing:.16em;margin:0 16px 9px">${t.phMst}</div>
        <div style="display:flex;gap:9px;overflow-x:auto;padding:0 16px 4px">${mstCards}</div>
      </div>
      <div style="padding:22px 16px 26px">
        <div style="${LBL9};letter-spacing:.16em;margin-bottom:9px">${t.phRev}</div>
        ${cRevs(true)}
      </div>
    </div>`;
  } else if (p.sc === 'book') {
    screen = `
    <div style="padding:8px 16px 20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <button data-c="${hnd(cOnBack)}" style="width:30px;height:30px;border-radius:9px;border:1px solid #DED9CD;background:#FBFAF8;font-size:14px">←</button>
        <span style="${LBL9};letter-spacing:.14em">${t.phStep} ${p.step}/5</span>
        <span style="flex:1"></span>
      </div>
      <div style="display:flex;gap:4px;margin-bottom:16px">${cSteps()}</div>
      <h2 style="${F_SERIF};font-size:22px;font-weight:400;margin:0 0 14px">${[t.stB, t.stS, t.stM, t.stD, t.stOk][p.step - 1]}</h2>
      ${cStepBody(true)}
    </div>`;
  }
  else if (p.sc === 'ok') screen = cOk(true);
  else if (p.sc === 'auth') screen = cAuth(true);
  else if (p.sc === 'my') screen = cMy(true);
  else if (p.sc === 'shop') screen = cShop(true);
  else if (p.sc === 'cart') screen = cCart(true);
  const tabOn = (id) => p.sc === id || (id === 'home' && (p.sc === 'book' || p.sc === 'ok' || p.sc === 'auth')) || (id === 'shop' && p.sc === 'cart');
  const tabs = [['home', t.phHome], ['my', t.phMy], ['shop', t.phShop]].map(([id, label]) => `
    <button data-c="${hnd(() => P((id === 'my' && !S.auth.client) ? { sc: 'auth', after: 'my' } : { sc: id, ordered: false }))}" style="flex:1;padding:9px 0 7px;border:none;background:transparent;color:${tabOn(id) ? '#17141F' : '#9A9284'};font-size:10.5px;font-weight:${tabOn(id) ? 700 : 500};letter-spacing:.01em;border-top:2px solid ${tabOn(id) ? '#3B2E5A' : 'transparent'}">${label}</button>`).join('');
  const bookNav = p.sc === 'book' ? `
    <div style="width:100%;max-width:352px;display:flex;gap:8px">
      <button data-c="${hnd(cOnBack)}" style="width:96px;padding:13px 0;border-radius:12px;border:1px solid #3A3348;background:#221E2C;color:#B4ADC4;font-size:13px;font-weight:600">${t.phBack}</button>
      ${p.step === 5
        ? '<button data-c="' + hnd(phConfirm) + '" style="flex:1;padding:13px 0;border-radius:12px;border:none;background:#F2F0EA;color:#17141F;font-size:13.5px;font-weight:700">' + t.phConf + '</button>'
        : '<button data-c="' + hnd(cOnNext) + '" style="flex:1;padding:13px 0;border-radius:12px;border:none;font-size:13.5px;font-weight:700;background:' + (cCanNext() ? '#F2F0EA' : '#3A3348') + ';color:' + (cCanNext() ? '#17141F' : '#8B839B') + '">' + t.phNext + '</button>'}
    </div>` : '';
  const collapse = S.view !== 'phone' ? `
    <button data-c="${hnd(() => { S.railOpen = false; commit(); })}" style="width:24px;height:24px;flex-shrink:0;border-radius:7px;border:1px solid #3A3348;background:#221E2C;color:#8B839B;font-size:12px">›</button>` : '<span style="width:24px"></span>';
  return `
  <div style="${railStyle}">
    <div style="flex:1;min-height:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
      <div class="hide-narrow" style="display:flex;align-items:flex-start;gap:8px;width:100%;max-width:352px">
        <div style="flex:1;text-align:center">
          <div style="${F_MONO};font-size:9.5px;letter-spacing:.16em;color:#8B839B;text-transform:uppercase">${t.desk}</div>
          <div style="font-size:11px;color:#615A72;margin-top:4px">${t.deskS}</div>
        </div>
        ${collapse}
      </div>
      <div style="width:100%;max-width:352px;flex:1;min-height:0;max-height:742px;background:#0C0A11;border:8px solid #2A2436;border-radius:44px;padding:0;box-shadow:0 30px 60px rgba(0,0,0,.5);overflow:hidden;display:flex">
        <div style="flex:1;min-width:0;background:#F2F0EA;border-radius:36px;overflow:hidden;display:flex;flex-direction:column">
          <div style="flex-shrink:0;display:flex;align-items:center;gap:6px;padding:11px 20px 5px;background:#F2F0EA">
            <span style="${F_MONO};font-size:11px;font-weight:500">${s2m(S.nowMin)}</span>
            <span style="flex:1"></span>
            <span style="width:16px;height:8px;border-radius:2px;background:#17141F"></span>
            <span style="width:22px;height:9px;border-radius:3px;border:1px solid #17141F"></span>
          </div>
          <div style="flex:1;min-height:0;overflow-y:auto;overflow-x:hidden">${screen}</div>
          <div style="flex-shrink:0;display:flex;background:#FBFAF8;border-top:1px solid #E4E0D6;padding-bottom:6px">${tabs}</div>
        </div>
      </div>
      ${bookNav}
    </div>
  </div>`;
}
