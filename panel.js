/* Bellinaya — views: header, login, admin panel screens. */
'use strict';

/* ---------- header ---------- */
function vHeader() {
  const t = T();
  const pill = (on) => 'padding:5px 12px;border-radius:8px;border:none;background:' + (on ? '#F2F0EA' : 'transparent') +
    ';color:' + (on ? '#17141F' : '#8B839B') + ';font-size:11.5px;font-weight:' + (on ? 700 : 500) + ';letter-spacing:.02em;transition:all .16s';
  const viewTabs = [['panel', t.vPanel], ['client', t.vPhone]].map(([id, label]) =>
    '<button data-c="' + hnd(() => { S.view = id; commit(); }) + '" style="' + pill(S.view === id) + '">' + label + '</button>').join('');
  const langTabs = [['az', 'AZ'], ['ru', 'RU']].map(([id, label]) =>
    '<button data-c="' + hnd(() => { S.lang = id; commit(); }) + '" style="' + pill(S.lang === id) + ';' + F_MONO + ';font-size:10.5px;letter-spacing:.08em">' + label + '</button>').join('');
  const staff = S.auth.staff;
  const unread = S.notif.filter(n => !n.read).length;
  const staffChip = staff ? `
    <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;padding-left:14px;border-left:1px solid #322C40">
      <button data-c="${hnd(() => { S.notifOpen = !S.notifOpen; commit(); })}" style="position:relative;width:30px;height:30px;border-radius:9px;border:1px solid #3A3348;background:#221E2C;color:#B4ADC4;font-size:13px">◗
        ${unread ? '<span style="position:absolute;top:-3px;right:-3px;min-width:15px;height:15px;border-radius:8px;background:#B4552D;color:#fff;font-size:9px;font-weight:700;display:grid;place-items:center;padding:0 3px">' + unread + '</span>' : ''}
      </button>
      <div style="display:flex;align-items:center;gap:9px">
        <div style="width:28px;height:28px;border-radius:50%;background:#3B2E5A;color:#F2F0EA;display:grid;place-items:center;font-size:11px;font-weight:600">${ini(staff.n)}</div>
        <div style="line-height:1.25" class="hide-narrow">
          <div style="font-size:12px;font-weight:600">${staff.n}</div>
          <div style="font-size:9.5px;color:#8B839B">${staff.role === 'owner' ? t.rOwner : t.rRec}</div>
        </div>
      </div>
      <button data-c="${hnd(staffOut)}" style="padding:5px 11px;border-radius:8px;border:1px solid #3A3348;background:transparent;color:#8B839B;font-size:10.5px">${t.logout}</button>
    </div>` : '';
  return `
  <header style="min-height:58px;flex-shrink:0;display:flex;align-items:center;flex-wrap:wrap;column-gap:min(22px,2vw);row-gap:8px;padding:9px 20px;background:#17141F;color:#F2F0EA;border-bottom:1px solid #000">
    <div style="display:flex;align-items:baseline;gap:9px;flex-shrink:0">
      <span style="${F_SERIF};font-size:21px;letter-spacing:.16em;color:#F2F0EA">BELLINAYA</span>
      <span class="hide-narrow" style="${F_MONO};font-size:9.5px;letter-spacing:.12em;color:#7E7690;text-transform:uppercase;white-space:nowrap">${t.tag}</span>
    </div>
    <div style="display:flex;gap:2px;padding:3px;background:#221E2C;border-radius:11px">${viewTabs}</div>
    <div style="flex:1;min-width:0"></div>
    <div class="hide-narrow" style="display:flex;align-items:center;gap:7px;flex-shrink:0;${F_MONO};font-size:10.5px;letter-spacing:.08em">
      <span style="width:6px;height:6px;border-radius:50%;background:#5FA88C;animation:bl-blink 2.4s infinite"></span>
      <span style="color:#8B839B;text-transform:uppercase">${t.live}</span>
    </div>
    <div style="display:flex;gap:2px;padding:3px;background:#221E2C;border-radius:11px">${langTabs}</div>
    ${staffChip}
  </header>`;
}

/* ---------- login ---------- */
function vLogin() {
  const t = T(); const l = S.login;
  const roles = [['owner', t.rOwner], ['reception', t.rRec]].map(([id, label]) => `
    <button data-c="${hnd(() => { S.login = { ...S.login, role: id, err: '', pin: '' }; commit(); })}"
      style="flex:1;padding:14px 10px;border-radius:12px;text-align:left;border:1px solid ${l.role === id ? '#3B2E5A' : '#DED9CD'};background:${l.role === id ? '#EDE9F3' : '#FBFAF8'}">
      <span style="display:block;font-size:13.5px;font-weight:650">${label}</span>
      <span style="display:block;font-size:11px;color:#8D8677;margin-top:3px">${t.demoPin} ${id === 'owner' ? '2024' : '1010'}</span>
    </button>`).join('');
  return `
  <div style="flex:1;min-width:0;display:grid;place-items:center;padding:30px;background:#F2F0EA;overflow:auto">
    <div style="width:100%;max-width:392px">
      <div style="${F_SERIF};font-size:21px;letter-spacing:.16em;margin-bottom:26px">BELLINAYA</div>
      <div style="${F_SERIF};font-size:29px;margin-bottom:5px">${t.loginT}</div>
      <div style="font-size:12.5px;color:#8D8677;margin-bottom:22px">${t.loginS}</div>
      <div style="display:flex;gap:9px;margin-bottom:16px">${roles}</div>
      <div style="${LBL9};margin-bottom:7px">${t.pin}</div>
      <input data-f="pin" value="${esc(l.pin)}" inputmode="numeric" autocomplete="off"
        data-in="${hnd((e) => { S.login = { ...S.login, pin: e.target.value.replace(/\D/g, '').slice(0, 4), err: '' }; commit(); })}"
        data-kd="${hnd((e) => { if (e.key === 'Enter') staffIn(); })}"
        placeholder="••••" style="width:100%;padding:14px 16px;border-radius:12px;border:1px solid #DED9CD;background:#FBFAF8;${F_MONO};font-size:20px;letter-spacing:.4em;text-align:center" />
      ${l.err ? '<div style="margin-top:9px;font-size:12px;color:#C0392B">' + t.errPin + '</div>' : ''}
      <button data-c="${hnd(staffIn)}" style="width:100%;margin-top:14px;padding:15px 0;border-radius:12px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:14px;font-weight:700">${t.enter}</button>
      <button data-c="${hnd(resetDemo)}" style="width:100%;margin-top:9px;padding:11px 0;border-radius:11px;border:1px solid #E4E0D6;background:transparent;color:#8D8677;font-size:11.5px">${t.reset}</button>
    </div>
  </div>`;
}

/* ---------- panel shell (nav + active view) ---------- */
function vPanel() {
  const t = T();
  const low = PRODS.filter(p => qty(p.id) <= p.min);
  const pending = S.appts.filter(a => a.st === 'new');
  const isOwner = !S.auth.staff || S.auth.staff.role === 'owner';
  const navDefs = [['over', t.over, 0], ['jour', t.jour, pending.length], ['cli', t.cli, 0], ['svc', t.svc, 0],
    ['stock', t.stock, low.length], ['cash', t.cash, 0], ['anal', t.anal, 0]].filter(([id]) => isOwner || id !== 'anal');
  const nav = navDefs.map(([id, label, badge]) => `
    <button data-c="${hnd(() => go(id))}" style="display:flex;align-items:center;gap:9px;width:100%;padding:8px 16px;border:none;background:${S.pv === id ? '#F2F0EA' : 'transparent'};color:${S.pv === id ? '#17141F' : '#5F5849'};font-size:13px;font-weight:${S.pv === id ? 650 : 500};text-align:left;transition:background .14s">
      <span style="width:2px;height:14px;border-radius:2px;background:${S.pv === id ? '#3B2E5A' : 'transparent'};flex-shrink:0"></span>
      <span>${label}</span><span style="flex:1"></span>
      ${badge ? '<span style="min-width:17px;height:17px;padding:0 5px;border-radius:9px;background:#B4552D;color:#fff;font-size:10px;font-weight:700;display:grid;place-items:center;' + F_MONO + '">' + badge + '</span>' : ''}
    </button>`).join('');
  const branchNav = BRANCHES.map(b => `
    <button data-c="${hnd(() => { S.b = b.id; S.drawer = null; commit(); })}" style="display:flex;align-items:center;gap:9px;width:100%;padding:7px 16px;border:none;background:${S.b === b.id ? '#E1DDD2' : 'transparent'};color:${S.b === b.id ? '#17141F' : '#6B6455'};font-size:12px;font-weight:${S.b === b.id ? 650 : 500}">
      <span style="width:6px;height:6px;border-radius:50%;background:${S.b === b.id ? '#3B2E5A' : '#C6C0B3'};flex-shrink:0"></span>
      <span style="flex:1;min-width:0;text-align:left;line-height:1.3">${b.short}<br /><span style="display:block;font-size:9.5px;color:#918A7C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${L(b.addr)}</span></span>
    </button>`).join('');
  const views = { over: vOver, jour: vJour, cli: vCli, svc: vSvc, stock: vStock, cash: vCash, anal: vAnal };
  const main = (views[S.pv] || vOver)();
  return `
  <div style="flex:1;min-width:0;display:flex;background:#F2F0EA">
    <nav style="width:186px;flex-shrink:0;display:flex;flex-direction:column;padding:16px 0;background:#EAE7DF;border-right:1px solid #DAD5C9">
      <div style="padding:0 16px 10px;${LBL9}">${t.navHead}</div>
      ${nav}
      <div style="flex:1"></div>
      <button data-c="${hnd(resetDemo)}" style="margin:0 16px 12px;padding:8px 0;border-radius:9px;border:1px solid #DED9CD;background:transparent;color:#8D8677;font-size:10.5px">${t.reset}</button>
      <div style="padding:0 16px 8px;${LBL9}">${t.branch}</div>
      ${branchNav}
    </nav>
    <main style="flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden">${main}</main>
  </div>`;
}

/* ---------- overview ---------- */
function vOver() {
  const t = T();
  const dayA = S.appts.filter(a => a.d === 0 && a.b === S.b && a.st !== 'cancel');
  const unpaid = S.appts.filter(a => a.d === 0 && a.st === 'unpaid');
  const low = PRODS.filter(p => qty(p.id) <= p.min);
  const pending = S.appts.filter(a => a.st === 'new');
  const txB = S.tx.filter(x => x.b === S.b);
  const rev = txB.reduce((a, x) => a + x.sum, 0);
  const doneN = dayA.filter(a => a.st === 'done').length;
  const bookedMin = dayA.reduce((a, x) => a + svc(x.s).d, 0);
  const mrs = MASTERS.filter(m => m.b === S.b);
  const occ = Math.round(bookedMin / (mrs.length * 720) * 100);
  const card = 'background:#FBFAF8;border-radius:14px;padding:18px 20px';
  const kpis = [
    { label: t.dRev, val: money(rev) + ' ₼', sub: txB.length + ' ' + t.csNo.toLowerCase(), accent: '#3B2E5A' },
    { label: t.dCnt, val: String(dayA.length), sub: doneN + '/' + dayA.length + ' ' + t.stDone.toLowerCase(), accent: '#2F6B5E' },
    { label: t.dAvg, val: (txB.length ? money(Math.round(rev / txB.length)) : '0') + ' ₼', sub: '', accent: '#A8501F' },
    { label: t.dOcc, val: occ + '%', sub: Math.round(bookedMin / 60) + ' / ' + (mrs.length * 12) + ' saat', accent: '#8A4A6B' }
  ].map(x => `
    <div style="${card};min-width:0;display:flex;flex-direction:column;gap:6px">
      <div style="${LBL};overflow-wrap:anywhere">${x.label}</div>
      <div style="font-size:28px;font-weight:300;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:${x.accent}">${x.val}</div>
      <div style="font-size:11px;color:#8D8677">${x.sub}</div>
    </div>`).join('');
  const attention = [
    { n: unpaid.length, label: t.attU, c: '#C0392B', go: 'jour' },
    { n: low.length, label: t.attL, c: '#A8501F', go: 'stock' },
    { n: pending.length, label: t.attP, c: '#3B2E5A', go: 'jour' }
  ].filter(x => x.n > 0).map(x => `
    <button data-c="${hnd(() => go(x.go))}" style="display:flex;align-items:center;gap:12px;width:100%;padding:13px 16px;border:none;border-left:2px solid ${x.c};background:#FBFAF8;border-radius:0 10px 10px 0;text-align:left;margin-bottom:6px">
      <span style="${F_MONO};font-size:19px;font-weight:500;color:${x.c};min-width:22px">${x.n}</span>
      <span style="flex:1;font-size:12.5px;color:#3F3A32">${x.label}</span>
      <span style="${LBL9};color:${x.c}">${t.goto} →</span>
    </button>`).join('');
  const nextUp = dayA.filter(a => m2s(a.t) >= S.nowMin - 30).sort((a, b) => m2s(a.t) - m2s(b.t)).slice(0, 5).map(a => {
    const c = catOf(svc(a.s).c);
    return `
    <button data-c="${hnd(() => { S.pv = 'jour'; S.drawer = a.id; commit(); })}" style="display:flex;align-items:center;gap:14px;width:100%;padding:11px 4px;border:none;border-bottom:1px solid #EDEAE1;background:transparent;text-align:left">
      <span style="${F_MONO};font-size:13px;color:#17141F;min-width:40px">${a.t}</span>
      <span style="width:8px;height:8px;border-radius:2px;background:${c.fg};flex-shrink:0"></span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:12.5px;font-weight:600">${esc(cliOf(a.cl).n)}</span>
        <span style="display:block;font-size:11px;color:#8D8677">${L(svc(a.s))}</span>
      </span>
      <span style="font-size:11px;color:#5F5849">${mst(a.m).n}</span>
    </button>`;
  }).join('');
  const byMaster = mrs.map(m => {
    const list = dayA.filter(a => a.m === m.id);
    const mn = list.reduce((a, x) => a + svc(x.s).d, 0);
    const turn = list.reduce((a, x) => a + (x.pr || price(x.s)), 0);
    const c0 = catOf(m.c[0]);
    return `
    <div style="display:flex;align-items:center;gap:12px">
      <span style="width:30px;height:30px;border-radius:50%;background:${c0.bg};color:${c0.fg};display:grid;place-items:center;font-size:11px;font-weight:700;flex-shrink:0">${ini(m.n)}</span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:12.5px;font-weight:600">${m.n}</span>
        <span style="display:block;font-size:10.5px;color:#8D8677;margin-bottom:5px">${L(ROLES[m.r])}</span>
        <span style="display:block;height:4px;border-radius:3px;background:#EDEAE1"><span style="display:block;height:4px;border-radius:3px;background:#3B2E5A;width:${Math.min(100, Math.round(mn / 720 * 100))}%"></span></span>
      </span>
      <span style="text-align:right;min-width:58px">
        <span style="display:block;${F_MONO};font-size:12.5px">${money(turn)} ₼</span>
        <span style="display:block;font-size:10px;color:#8D8677">${list.length} · ${Math.round(mn / 720 * 100)}%</span>
      </span>
    </div>`;
  }).join('');
  const br = BRANCHES.find(b => b.id === S.b);
  return `
  <div style="flex:1;min-height:0;overflow:auto;padding:24px 28px 34px">
    <div style="display:flex;align-items:flex-end;gap:14px;margin-bottom:18px">
      <h1 style="${F_SERIF};font-size:27px;font-weight:400;margin:0;letter-spacing:-.015em">${t.over}</h1>
      <span style="${F_MONO};font-size:10px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;padding-bottom:5px">${fmtDate(S.day)}</span>
      <div style="flex:1"></div>
      <div style="text-align:right;line-height:1.35">
        <div style="font-size:13px;font-weight:650">${L(br)}</div>
        <div style="font-size:11px;color:#8D8677">${L(br.addr)}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:12px;margin-bottom:22px">${kpis}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:22px;align-items:start">
      <div>
        ${attention ? '<div style="margin-bottom:26px"><div style="' + LBL + ';margin-bottom:10px">' + t.att + '</div>' + attention + '</div>' : ''}
        <div style="${LBL};margin-bottom:10px">${t.nextUp}</div>
        <div style="background:#FBFAF8;border-radius:14px;padding:6px 18px 10px">${nextUp || '<div style="padding:14px 0;font-size:12px;color:#9A9284">' + t.phNoUp + '</div>'}</div>
      </div>
      <div>
        <div style="${LBL};margin-bottom:10px">${t.byMaster}</div>
        <div style="background:#FBFAF8;border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:14px">${byMaster}</div>
      </div>
    </div>
  </div>`;
}

/* ---------- journal ---------- */
function vJour() {
  const t = T();
  const mrs = MASTERS.filter(m => m.b === S.b);
  const gridH = (1260 - 540) / 30 * SH;
  const times = [];
  for (let mn = 540; mn <= 1260; mn += 60)
    times.push('<div style="position:absolute;top:' + ((mn - 540) / 30 * SH - 7) + 'px;right:10px;' + F_MONO + ';font-size:10.5px;color:#9A9284">' + s2m(mn) + '</div>');
  let anyCard = false;
  const cols = mrs.map(m => {
    const list = S.appts.filter(a => a.d === S.day && a.b === S.b && a.m === m.id);
    if (list.some(a => a.st !== 'cancel')) anyCard = true;
    const cards = list.map(a => {
      const sv = svc(a.s), c = catOf(sv.c), cl = cliOf(a.cl);
      const top = (m2s(a.t) - 540) / 30 * SH, h = Math.max(sv.d / 30 * SH - 3, 30);
      const canc = a.st === 'cancel', fr = S.fresh.includes(a.id);
      const small = h < 62;
      return `
      <div data-pd="${hnd((e, el) => cardDragStart(a, e, el))}" style="position:absolute;left:3px;right:4px;top:${top}px;height:${h}px;border-radius:9px;padding:6px 8px;background:${canc ? '#F1EFE9' : c.bg};border-left:3px solid ${canc ? '#C6C0B3' : stColor(a.st)};overflow:hidden;cursor:grab;touch-action:none;opacity:${canc ? .55 : 1};user-select:none;${fr ? 'animation:bl-pulse 1.3s ease-out 2;' : ''}${canc ? 'text-decoration:line-through;' : ''}transition:box-shadow .15s">
        <div style="display:flex;align-items:center;gap:5px">
          <span style="${F_MONO};font-size:9.5px;color:${c.fg};opacity:.8">${a.t}–${s2m(m2s(a.t) + sv.d)}</span>
          ${a.on ? '<span style="' + F_MONO + ';font-size:7.5px;letter-spacing:.1em;padding:1px 4px;border-radius:3px;background:' + c.fg + ';color:#FBFAF8">ONLINE</span>' : ''}
          ${small ? '<span style="margin-left:auto;' + F_MONO + ';font-size:10px;color:' + c.fg + ';flex-shrink:0">' + money(a.pr || price(a.s)) + ' ₼</span>' : ''}
        </div>
        <div style="font-size:12px;font-weight:650;color:#17141F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(cl.n)}</div>
        ${small ? '' : '<div style="font-size:10.5px;color:#5F5849;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + L(sv) + '</div>' +
          '<div style="' + F_MONO + ';font-size:10px;color:' + c.fg + '">' + money(a.pr || price(a.s)) + ' ₼</div>'}
      </div>`;
    }).join('');
    return `
    <div data-col="1" data-c="${hnd((e, el) => colClick(m.id, e, el))}" style="flex:1;min-width:0;position:relative;height:${gridH}px;border-right:1px solid #E4E0D6;cursor:copy;background-image:repeating-linear-gradient(to bottom,#E6E2D8 0,#E6E2D8 1px,transparent 1px,transparent ${SH * 2}px),repeating-linear-gradient(to bottom,#F0EDE4 0,#F0EDE4 1px,transparent 1px,transparent ${SH}px)">${cards}</div>`;
  }).join('');
  const heads = mrs.map(m => {
    const c0 = catOf(m.c[0]);
    const cnt = S.appts.filter(a => a.d === S.day && a.b === S.b && a.m === m.id && a.st !== 'cancel').length;
    return `
    <div style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;padding:10px 8px;border-right:1px solid #E4E0D6">
      <span style="width:26px;height:26px;border-radius:50%;background:${c0.bg};color:${c0.fg};display:grid;place-items:center;font-size:10px;font-weight:700;flex-shrink:0">${ini(m.n)}</span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:12px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.n}</span>
        <span style="display:block;font-size:10px;color:#8D8677;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${L(ROLES[m.r])}</span>
      </span>
      <span style="${F_MONO};font-size:10px;color:#9A9284">${cnt}</span>
    </div>`;
  }).join('');
  const showNow = S.day === 0 && S.nowMin >= 540 && S.nowMin <= 1260;
  const nowLine = showNow ? `
    <div style="position:absolute;left:56px;right:0;top:${(S.nowMin - 540) / 30 * SH + 12}px;height:1px;background:#C0392B;z-index:40;pointer-events:none">
      <span style="position:absolute;left:0;top:-8px;${F_MONO};font-size:9px;color:#C0392B;background:#F2F0EA;padding:0 4px">${s2m(S.nowMin)}</span>
    </div>` : '';
  const empty = !anyCard ? `
    <div style="position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:30">
      <span style="font-size:13px;color:#9A9284;background:#F2F0EAcc;padding:10px 18px;border-radius:12px">${t.emptyJ}</span>
    </div>` : '';
  const wdName = WD[S.lang][dateOf(S.day).getDay()];
  const jDayLabel = S.day === 0 ? t.today : S.day === 1 ? t.tom : S.day === -1 ? t.yest : wdName;
  const nm = S.nowMin;
  return `
  <div style="flex:1;min-height:0;display:flex;flex-direction:column">
    <div style="flex-shrink:0;display:flex;align-items:center;gap:14px;padding:16px 24px 13px;border-bottom:1px solid #DAD5C9;flex-wrap:wrap">
      <h1 style="${F_SERIF};font-size:24px;font-weight:400;margin:0">${t.jour}</h1>
      <div style="display:flex;align-items:center;gap:3px;margin-left:6px">
        <button data-c="${hnd(() => { if (S.day > -7) { S.day--; S.drawer = null; commit(); } })}" style="width:28px;height:28px;border-radius:8px;border:1px solid #DED9CD;background:#FBFAF8;font-size:13px;color:#5F5849">‹</button>
        <button data-c="${hnd(() => { S.day = 0; commit(); })}" style="padding:6px 12px;border-radius:8px;border:1px solid #DED9CD;background:#FBFAF8;font-size:12px;font-weight:600">${fmtDate(S.day)}</button>
        <button data-c="${hnd(() => { if (S.day < 7) { S.day++; S.drawer = null; commit(); } })}" style="width:28px;height:28px;border-radius:8px;border:1px solid #DED9CD;background:#FBFAF8;font-size:13px;color:#5F5849">›</button>
      </div>
      <span style="${F_MONO};font-size:9.5px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase">${jDayLabel}</span>
      <div style="flex:1"></div>
      <span class="hide-narrow" style="font-size:11px;color:#9A9284;max-width:340px;text-align:right;line-height:1.4">${t.tip}</span>
      <button data-c="${hnd(() => { S.quick = { m: mrs[0].id, t: s2m(Math.max(540, Math.min(1230, Math.round(nm / 30) * 30))), s: null, name: '', phone: '', d: S.day }; commit(); })}" style="padding:9px 16px;border-radius:10px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:12.5px;font-weight:650">+ ${t.newA}</button>
    </div>
    <div id="jgrid" style="flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;background:#F2F0EA">
      <div style="position:sticky;top:0;z-index:50;display:flex;background:#F2F0EA;border-bottom:1px solid #DAD5C9">
        <div style="width:64px;flex-shrink:0"></div>${heads}
      </div>
      <div style="display:flex;min-height:${gridH + 12}px;padding-top:12px;position:relative">
        <div style="width:64px;flex-shrink:0;position:relative">${times.join('')}</div>
        ${cols}
        ${nowLine}
        ${empty}
      </div>
    </div>
  </div>`;
}

/* ---------- clients ---------- */
function vCli() {
  const t = T();
  const q = S.cq.toLowerCase();
  const rows = S.cls.filter(c => !q || c.n.toLowerCase().includes(q) || c.t.includes(q)).map(c => `
    <button data-c="${hnd(() => { S.cSel = c.id; commit(); })}" style="display:flex;align-items:center;gap:11px;width:100%;padding:10px 14px;border:none;background:${S.cSel === c.id ? '#EFEBE0' : 'transparent'};text-align:left;border-bottom:1px solid #EDEAE1">
      <span style="width:32px;height:32px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:11px;font-weight:700;background:${c.tag === 'vip' ? '#3B2E5A' : '#E4E0D6'};color:${c.tag === 'vip' ? '#F2F0EA' : '#6B6455'}">${esc(ini(c.n))}</span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:12.5px;font-weight:600">${esc(c.n)}</span>
        <span style="display:block;${F_MONO};font-size:10.5px;color:#8D8677">${esc(c.t)}</span>
      </span>
      ${c.tag ? '<span style="' + F_MONO + ';font-size:8px;letter-spacing:.1em;padding:2px 5px;border-radius:4px;background:' + (c.tag === 'vip' ? '#EDE9F3' : '#E7EFEA') + ';color:' + (c.tag === 'vip' ? '#3B2E5A' : '#2F6B5E') + '">' + (c.tag === 'vip' ? t.cVip : t.cNew) + '</span>' : ''}
      <span style="text-align:right">
        <span style="display:block;${F_MONO};font-size:12px">${money(c.s)} ₼</span>
        <span style="display:block;font-size:10px;color:#8D8677">${c.v}×</span>
      </span>
    </button>`).join('');
  const cs = cliOf(S.cSel);
  const hist = S.appts.filter(a => a.cl === S.cSel).sort((a, b) => a.d - b.d || m2s(a.t) - m2s(b.t)).map(a => `
    <div style="display:flex;align-items:center;gap:14px;padding:11px 0;border-bottom:1px solid #EDEAE1">
      <span style="${F_MONO};font-size:11.5px;color:#5F5849;min-width:84px">${fmtDate(a.d)} · ${a.t}</span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:12.5px;font-weight:600">${L(svc(a.s))}</span>
        <span style="display:block;font-size:10.5px;color:#8D8677">${mst(a.m).n}</span>
      </span>
      <span style="font-size:10px;color:${stColor(a.st)}">${stLabel(a.st)}</span>
      <span style="${F_MONO};font-size:12.5px;min-width:56px;text-align:right">${money(a.pr || price(a.s))} ₼</span>
    </div>`);
  const mrs = MASTERS.filter(m => m.b === S.b);
  const fav = mst(cs.fav) || MASTERS[0];
  return `
  <div style="flex:1;min-height:0;display:flex">
    <div style="width:328px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid #DAD5C9;background:#F5F3ED">
      <div style="padding:18px 16px 12px">
        <h1 style="${F_SERIF};font-size:22px;font-weight:400;margin:0 0 12px">${t.cliT}</h1>
        <input data-f="cq" value="${esc(S.cq)}" data-in="${hnd((e) => { S.cq = e.target.value; commit(); })}" placeholder="${t.search}" style="width:100%;padding:9px 12px;border-radius:10px;border:1px solid #DED9CD;background:#FBFAF8;font-size:12.5px" />
      </div>
      <div style="flex:1;min-height:0;overflow:auto">${rows}</div>
    </div>
    <div style="flex:1;min-width:0;overflow:auto;padding:24px 28px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap">
        <div style="width:52px;height:52px;border-radius:50%;background:#3B2E5A;color:#F2F0EA;display:grid;place-items:center;font-size:17px;font-weight:600;flex-shrink:0">${esc(ini(cs.n))}</div>
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <h2 style="${F_SERIF};font-size:25px;font-weight:400;margin:0">${esc(cs.n)}</h2>
            ${cs.tag ? '<span style="' + F_MONO + ';font-size:8.5px;letter-spacing:.1em;padding:3px 7px;border-radius:5px;background:' + (cs.tag === 'vip' ? '#3B2E5A' : '#E7EFEA') + ';color:' + (cs.tag === 'vip' ? '#F2F0EA' : '#2F6B5E') + '">' + (cs.tag === 'vip' ? t.cVip : t.cNew) + '</span>' : ''}
          </div>
          <div style="${F_MONO};font-size:12px;color:#8D8677;margin-top:3px">${esc(cs.t)}</div>
        </div>
        <div style="flex:1"></div>
        <button data-c="${hnd(() => { S.pv = 'jour'; S.quick = { m: mrs[0].id, t: '12:00', s: null, name: cs.n, phone: cs.t, d: S.day }; commit(); })}" style="padding:9px 16px;border-radius:10px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:12.5px;font-weight:650">+ ${t.cBook}</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px">
        <div style="background:#FBFAF8;border-radius:14px;padding:15px 17px"><div style="${LBL9}">${t.cVis}</div><div style="font-size:23px;font-weight:300;margin-top:5px">${cs.v}</div></div>
        <div style="background:#FBFAF8;border-radius:14px;padding:15px 17px"><div style="${LBL9}">${t.cSpend}</div><div style="font-size:23px;font-weight:300;margin-top:5px;color:#3B2E5A">${money(cs.s)} ₼</div></div>
        <div style="background:#FBFAF8;border-radius:14px;padding:15px 17px"><div style="${LBL9}">${t.cLast}</div><div style="font-size:14px;margin-top:9px">${L(cs.last)}</div></div>
        <div style="background:#FBFAF8;border-radius:14px;padding:15px 17px"><div style="${LBL9}">${t.cFav}</div><div style="font-size:14px;margin-top:9px">${fav.n}</div><div style="font-size:10.5px;color:#8D8677">${L(ROLES[fav.r])}</div></div>
      </div>
      ${L(cs.note) ? '<div style="background:#EDE9F3;border-radius:12px;padding:13px 16px;margin-bottom:24px"><div style="' + LBL9 + ';color:#6F5C9E;margin-bottom:4px">' + t.cNote + '</div><div style="font-size:13px;color:#2E2740">' + esc(L(cs.note)) + '</div></div>' : ''}
      <div style="${LBL};margin-bottom:10px">${t.cHist}</div>
      <div style="background:#FBFAF8;border-radius:14px;padding:4px 18px 12px">
        ${hist.join('')}
        <div style="padding:11px 0 4px;font-size:11.5px;color:#9A9284">+ ${Math.max(0, cs.v - hist.length)} ×</div>
      </div>
    </div>
  </div>`;
}

/* ---------- services ---------- */
function vSvc() {
  const t = T();
  const tabs = CATS.map(c => `
    <button data-c="${hnd(() => { S.svcCat = c.id; commit(); })}" style="padding:7px 14px;border-radius:9px;border:none;font-size:12px;font-weight:${S.svcCat === c.id ? 650 : 500};background:${S.svcCat === c.id ? c.fg : '#EAE7DF'};color:${S.svcCat === c.id ? '#FBFAF8' : '#5F5849'}">${L(c)}</button>`).join('');
  const rows = SVCS.filter(x => x.c === S.svcCat).map(x => {
    const changed = S.prices && S.prices[x.id] != null;
    return `
    <div style="display:flex;align-items:center;gap:14px;padding:9px 0;border-bottom:1px solid #EDEAE1">
      <span style="flex:1;font-size:13px">${L(x)}</span>
      <span style="width:90px;${F_MONO};font-size:11.5px;color:#8D8677">${x.d} ${t.min}</span>
      <span style="width:70px;${F_MONO};font-size:11.5px;color:#8D8677">${MASTERS.filter(m => m.c.includes(x.c)).length}</span>
      <span style="width:90px;text-align:right">
        <input data-f="pr-${x.id}" type="number" value="${price(x.id)}" min="0"
          data-chg="${hnd((e) => { setPrice(x.id, e.target.value); toast('tPrice'); })}"
          style="width:78px;padding:5px 8px;border-radius:7px;border:1px solid ${changed ? '#3B2E5A' : '#DED9CD'};background:#FBFAF8;${F_MONO};font-size:12.5px;text-align:right" />
      </span>
    </div>`;
  }).join('');
  return `
  <div style="flex:1;min-height:0;overflow:auto;padding:24px 28px 34px">
    <h1 style="${F_SERIF};font-size:27px;font-weight:400;margin:0 0 4px">${t.svcT}</h1>
    <div style="font-size:11.5px;color:#9A9284;margin-bottom:18px">${t.svcNote}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px">${tabs}</div>
    <div style="background:#FBFAF8;border-radius:14px;padding:8px 22px 16px;max-width:820px">
      <div style="display:flex;gap:14px;padding:12px 0 9px;border-bottom:1px solid #E4E0D6;${LBL9}">
        <span style="flex:1">${t.fSvc}</span><span style="width:90px">${t.svcD}</span>
        <span style="width:70px">${t.svcM}</span><span style="width:90px;text-align:right">${t.svcP}</span>
      </div>
      ${rows}
    </div>
  </div>`;
}

/* ---------- stock ---------- */
function vStock() {
  const t = T();
  const rows = PRODS.map(p => {
    const qv = qty(p.id), lowf = qv <= p.min;
    return `
    <div style="display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid #EDEAE1">
      <span style="flex:1;font-size:13px">${L(p)}</span>
      <span style="width:80px;text-align:right;${F_MONO};font-size:12px">${money(p.p)} ₼</span>
      <span style="width:150px;display:flex;align-items:center;gap:9px">
        <span style="${F_MONO};font-size:13px;color:${lowf ? '#C0392B' : '#17141F'};min-width:26px">${qv}</span>
        <span style="height:4px;border-radius:3px;background:#E4E0D6;width:90px"><span style="display:block;height:4px;border-radius:3px;background:${lowf ? '#C0392B' : '#2F6B5E'};width:${Math.min(100, qv / 25 * 100)}%"></span></span>
        ${lowf ? '<span style="' + F_MONO + ';font-size:8.5px;letter-spacing:.08em;padding:2px 6px;border-radius:4px;background:#F7E3E0;color:#C0392B">' + t.stkLow + '</span>' : ''}
      </span>
      <span style="width:90px;text-align:right;${F_MONO};font-size:11.5px;color:#8D8677">${p.sold}</span>
      <span style="width:82px;text-align:right">
        <button data-c="${hnd(() => stockIn(p.id))}" style="padding:5px 11px;border-radius:8px;border:1px solid #DED9CD;background:#F5F3ED;font-size:11px;font-weight:600">+10</button>
      </span>
    </div>`;
  }).join('');
  const stkVal = money(PRODS.reduce((a, p) => a + p.p * qty(p.id), 0));
  return `
  <div style="flex:1;min-height:0;overflow:auto;padding:24px 28px 34px">
    <div style="display:flex;align-items:flex-end;gap:14px;margin-bottom:18px">
      <h1 style="${F_SERIF};font-size:27px;font-weight:400;margin:0">${t.stkT}</h1>
      <div style="flex:1"></div>
      <div style="text-align:right">
        <div style="${LBL9}">${t.stkVal}</div>
        <div style="font-size:19px;font-weight:300;color:#3B2E5A">${stkVal} ₼</div>
      </div>
    </div>
    <div style="background:#FBFAF8;border-radius:14px;padding:8px 22px 16px;max-width:940px">
      <div style="display:flex;gap:14px;padding:12px 0 9px;border-bottom:1px solid #E4E0D6;${LBL9}">
        <span style="flex:1">${t.stkP}</span><span style="width:80px;text-align:right">${t.stkPr}</span>
        <span style="width:150px">${t.stkQ}</span><span style="width:90px;text-align:right">${t.stkSold}</span><span style="width:82px"></span>
      </div>
      ${rows}
    </div>
  </div>`;
}

/* ---------- cash ---------- */
function vCash() {
  const t = T();
  const txB = S.tx.filter(x => x.b === S.b);
  const cash = txB.filter(x => x.m === 'cash').reduce((a, x) => a + x.sum, 0);
  const cardS = txB.filter(x => x.m !== 'cash').reduce((a, x) => a + x.sum, 0);
  const isOwner = !S.auth.staff || S.auth.staff.role === 'owner';
  const kpis = [
    { label: t.csOpen, val: '200 ₼' }, { label: t.csCash, val: '+' + money(cash) + ' ₼' },
    { label: t.csCard, val: '+' + money(cardS) + ' ₼' }, { label: t.csOut, val: '−45 ₼' },
    { label: t.csBal, val: money(200 + cash - 45) + ' ₼', big: true }
  ].map(x => `
    <div style="background:${x.big ? '#3B2E5A' : '#FBFAF8'};color:${x.big ? '#F2F0EA' : '#17141F'};border-radius:14px;padding:18px 20px;min-width:0">
      <div style="${LBL};color:${x.big ? '#B0A6C8' : '#8D8677'}">${x.label}</div>
      <div style="font-size:${x.big ? 24 : 20}px;font-weight:300;font-variant-numeric:tabular-nums;margin-top:6px;letter-spacing:-.01em">${x.val}</div>
    </div>`).join('');
  const txRows = txB.slice().reverse().map(x => `
    <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #EDEAE1">
      <span style="${F_MONO};font-size:10.5px;color:#9A9284;min-width:38px">#${x.id}</span>
      <span style="${F_MONO};font-size:11.5px;min-width:38px">${x.t}</span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:12.5px;font-weight:600">${esc(x.cl ? cliOf(x.cl).n : (x.cn || '—'))}</span>
        <span style="display:block;font-size:10.5px;color:#8D8677;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.items)}</span>
      </span>
      ${x.online ? '<span style="' + F_MONO + ';font-size:8px;letter-spacing:.1em;color:#A8501F">ONLINE</span>' : ''}
      <span style="${F_MONO};font-size:9px;letter-spacing:.08em;padding:2px 6px;border-radius:4px;background:${x.m === 'cash' ? '#E7EFEA' : '#EDE9F3'};color:${x.m === 'cash' ? '#2F6B5E' : '#3B2E5A'}">${x.m === 'cash' ? t.coCash : x.m === 'card' ? t.coCard : t.coSplit}</span>
      <span style="${F_MONO};font-size:13px;min-width:58px;text-align:right">${money(x.sum)} ₼</span>
    </div>`).join('');
  const mrs = MASTERS.filter(m => m.b === S.b);
  let payTotal = 0;
  const payRows = mrs.map(m => {
    const list = S.appts.filter(a => a.d === 0 && a.b === S.b && a.m === m.id && a.st === 'done');
    const turn = list.reduce((a, x) => a + (x.pr || price(x.s)), 0);
    const sal = Math.round(turn * m.pct) / 100;
    payTotal += sal;
    return `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #EDEAE1">
      <span style="flex:1;min-width:0;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.n}</span>
      <span style="width:34px;text-align:right;${F_MONO};font-size:11.5px;color:#8D8677">${list.length}</span>
      <span style="width:62px;text-align:right;${F_MONO};font-size:11.5px">${money(turn)} ₼</span>
      <span style="width:34px;text-align:right;${F_MONO};font-size:11.5px;color:#8D8677">${m.pct}%</span>
      <span style="width:62px;text-align:right;${F_MONO};font-size:12.5px;color:#3B2E5A">${money(sal)} ₼</span>
    </div>`;
  }).join('');
  const payBlock = isOwner ? `
    <div>
      <div style="${LBL};margin-bottom:10px">${t.csPay}</div>
      <div style="background:#FBFAF8;border-radius:14px;padding:6px 18px 14px">
        <div style="display:flex;gap:10px;padding:10px 0 8px;border-bottom:1px solid #E4E0D6;${LBL9};letter-spacing:.12em">
          <span style="flex:1">${t.pMst}</span><span style="width:34px;text-align:right">${t.pCnt}</span>
          <span style="width:62px;text-align:right">${t.pTurn}</span><span style="width:34px;text-align:right">${t.pPct}</span>
          <span style="width:62px;text-align:right">${t.pSal}</span>
        </div>
        ${payRows}
        <div style="display:flex;align-items:center;padding:12px 0 2px">
          <span style="flex:1;font-size:12px;font-weight:650">${t.pTotal}</span>
          <span style="${F_MONO};font-size:15px;color:#3B2E5A">${money(payTotal)} ₼</span>
        </div>
      </div>
    </div>` : '';
  return `
  <div style="flex:1;min-height:0;overflow:auto;padding:24px 28px 34px">
    <div style="display:flex;align-items:flex-end;gap:14px;margin-bottom:18px">
      <h1 style="${F_SERIF};font-size:27px;font-weight:400;margin:0">${t.csT}</h1>
      <span style="${F_MONO};font-size:10px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;padding-bottom:5px">${fmtDate(0)}</span>
      <div style="flex:1"></div>
      <button data-c="${hnd(closeDay)}" style="padding:9px 16px;border-radius:10px;border:1px solid #DED9CD;background:#FBFAF8;font-size:12.5px;font-weight:600">${t.csClose}</button>
    </div>
    ${S.dayClosed ? '<div style="background:#E7EFEA;color:#2F6B5E;border-radius:12px;padding:11px 16px;font-size:12.5px;margin-bottom:18px">' + t.csClosed + '</div>' : ''}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:12px;margin-bottom:24px">${kpis}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:22px;align-items:start">
      <div>
        <div style="${LBL};margin-bottom:10px">${t.csTx}</div>
        <div style="background:#FBFAF8;border-radius:14px;padding:6px 18px 12px">${txRows}</div>
      </div>
      ${payBlock}
    </div>
  </div>`;
}

/* ---------- analytics ---------- */
function vAnal() {
  const t = T();
  const wk = [-6, -5, -4, -3, -2, -1, 0].map(off => S.appts
    .filter(a => a.d === off && a.b === S.b && a.st === 'done')
    .reduce((x, a) => x + (a.pr || price(a.s)), 0));
  const wmax = Math.max(1, ...wk);
  const weekBars = wk.map((v, i) => {
    const d = dateOf(i - 6);
    return `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;justify-content:flex-end;height:100%">
      <span style="${F_MONO};font-size:10px;color:#5F5849">${money(v)}</span>
      <span style="width:100%;border-radius:5px 5px 0 0;background:${i === 6 ? '#3B2E5A' : '#CFC7DE'};height:${Math.max(3, Math.round(v / wmax * 150))}px"></span>
      <span style="font-size:11px;color:#8D8677">${WD[S.lang][d.getDay()]}</span>
    </div>`;
  }).join('');
  const catSums = CATS.map(c => ({ c, v: S.appts.filter(a => a.b === S.b && a.st !== 'cancel' && svc(a.s).c === c.id)
    .reduce((a, x) => a + price(x.s), 0) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
  const cmax = Math.max(1, ...catSums.map(x => x.v));
  const catBars = catSums.map(x => barRow(L(x.c), money(x.v) + ' ₼', x.c.fg, Math.round(x.v / cmax * 100))).join('');
  const brSums = BRANCHES.map(b => ({ b, v: S.appts.filter(a => a.b === b.id && a.st !== 'cancel').reduce((a, x) => a + price(x.s), 0) }));
  const bmax = Math.max(1, ...brSums.map(x => x.v));
  const brBars = brSums.map(x => barRow(x.b.short, money(x.v) + ' ₼', x.b.id === S.b ? '#3B2E5A' : '#CFC7DE', Math.round(x.v / bmax * 100))).join('');
  const dayA = S.appts.filter(a => a.d === 0 && a.b === S.b && a.st !== 'cancel');
  const occBars = MASTERS.filter(m => m.b === S.b).map(m => {
    const mn = dayA.filter(a => a.m === m.id).reduce((a, x) => a + svc(x.s).d, 0);
    const pct = Math.round(mn / 720 * 100);
    return barRow(m.n, pct + '%', '#3B2E5A', Math.min(100, pct));
  }).join('');
  return `
  <div style="flex:1;min-height:0;overflow:auto;padding:24px 28px 34px">
    <h1 style="${F_SERIF};font-size:27px;font-weight:400;margin:0 0 20px">${t.anT}</h1>
    <div style="background:#FBFAF8;border-radius:14px;padding:18px 22px 14px;margin-bottom:20px">
      <div style="${LBL};margin-bottom:20px">${t.anWeek}</div>
      <div style="display:flex;align-items:flex-end;gap:14px;height:172px">${weekBars}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
      <div style="background:#FBFAF8;border-radius:14px;padding:18px 20px"><div style="${LBL};margin-bottom:14px">${t.anCat}</div>${catBars}</div>
      <div style="background:#FBFAF8;border-radius:14px;padding:18px 20px"><div style="${LBL};margin-bottom:14px">${t.anBr}</div>${brBars}</div>
      <div style="background:#FBFAF8;border-radius:14px;padding:18px 20px"><div style="${LBL};margin-bottom:14px">${t.anOcc}</div>${occBars}</div>
    </div>
  </div>`;
}
function barRow(label, val, color, pct) {
  return `
  <div style="margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:5px">
      <span>${label}</span><span style="${F_MONO};color:#5F5849">${val}</span>
    </div>
    <div style="height:8px;border-radius:4px;background:#EDEAE1"><div style="height:8px;border-radius:4px;background:${color};width:${pct}%"></div></div>
  </div>`;
}
