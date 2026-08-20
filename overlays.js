/* Bellinaya — views: overlays (drawer, checkout, quick create, notifications, Z-report, toast) + app root. */
'use strict';

/* ---------- appointment drawer ---------- */
function vDrawer() {
  if (!S.drawer) return '';
  const a = S.appts.find(x => x.id === S.drawer);
  if (!a) return '';
  const t = T();
  const sv = svc(a.s), c = catOf(sv.c), cl = cliOf(a.cl);
  const payable = a.st !== 'done' && a.st !== 'cancel';
  const canHere = a.st === 'conf' || a.st === 'new';
  const rescOpen = S.resc === a.id;
  const rescSlots = rescOpen ? freeSlots(a.m, a.d, sv.d, a.b).map(x => `
    <button ${x.ok ? 'data-c="' + hnd(() => moveAppt(a.id, x.t)) + '"' : 'disabled'} style="padding:8px 0;border-radius:9px;border:1px solid ${x.ok ? '#DED9CD' : 'transparent'};background:${x.ok ? '#F5F3ED' : '#EDEAE1'};color:${x.ok ? '#17141F' : '#B5AFA3'};${F_MONO};font-size:11.5px;text-align:center;${x.ok ? '' : 'cursor:default'}">${x.t}</button>`).join('') : '';
  const row = (k, v) => `
    <div style="display:flex;gap:12px;padding:12px 15px;background:#FBFAF8">
      <span style="${F_MONO};font-size:9px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;width:82px">${k}</span>
      <span style="flex:1;font-size:13px">${v}</span>
    </div>`;
  return `
  <div style="position:fixed;top:58px;right:0;bottom:0;width:min(392px,100vw);background:#FBFAF8;border-left:1px solid #DAD5C9;box-shadow:-22px 0 50px rgba(23,20,31,.13);z-index:200;display:flex;flex-direction:column;animation:bl-slide .22s ease-out">
    <div style="display:flex;align-items:center;gap:10px;padding:16px 20px 13px;border-bottom:1px solid #E4E0D6">
      <span style="${F_SERIF};font-size:20px">${t.dwT}</span>
      <span style="${F_MONO};font-size:9px;letter-spacing:.1em;padding:4px 9px;border-radius:6px;background:${c.bg};color:${stColor(a.st)}">${stLabel(a.st)}</span>
      <span style="flex:1"></span>
      <button data-c="${hnd(() => { S.drawer = null; S.resc = null; commit(); })}" style="width:28px;height:28px;border-radius:8px;border:1px solid #DED9CD;background:#F5F3ED;font-size:14px;color:#5F5849">×</button>
    </div>
    <div style="flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:18px 20px 22px">
      <div style="${F_SERIF};font-size:26px;line-height:1.15;margin-bottom:3px">${esc(cl.n)}</div>
      <div style="${F_MONO};font-size:12px;color:#8D8677;margin-bottom:20px">${esc(cl.t)}</div>
      <div style="display:flex;flex-direction:column;gap:1px;background:#EDEAE1;border-radius:12px;overflow:hidden">
        ${row(t.fSvc, '<span style="font-weight:600">' + L(sv) + '</span>')}
        ${row(t.fMaster, mst(a.m).n + ' <span style="color:#8D8677;font-size:11.5px">· ' + L(ROLES[mst(a.m).r]) + '</span>')}
        ${row(t.fTime, '<span style="' + F_MONO + '">' + a.t + ' – ' + s2m(m2s(a.t) + sv.d) + ' <span style="color:#8D8677">· ' + fmtDate(a.d) + '</span></span>')}
        ${row(t.fBranch, L(BRANCHES.find(b => b.id === a.b)))}
        ${row(t.fSrc, a.on ? t.srcOn : t.srcRec)}
        ${row(t.fPrice, '<span style="' + F_MONO + ';font-size:16px;color:#3B2E5A">' + money(a.pr || price(a.s)) + ' ₼</span>')}
      </div>
      ${a.st === 'new' ? '<button data-c="' + hnd(() => confirmAppt(a.id)) + '" style="width:100%;margin-top:14px;padding:12px 0;border-radius:11px;border:none;background:#E7EFEA;color:#2F6B5E;font-size:12.5px;font-weight:700">✓ ' + t.stConf + '</button>' : ''}
      ${canHere ? '<button data-c="' + hnd(() => markHere(a.id)) + '" style="width:100%;margin-top:9px;padding:12px 0;border-radius:11px;border:1px solid #CBDDD3;background:#F2F7F4;color:#2F6B5E;font-size:12.5px;font-weight:700">' + t.dwHere + '</button>' : ''}
      ${rescOpen ? `
      <div style="margin-top:16px">
        <div style="${LBL9};letter-spacing:.12em;margin-bottom:8px">${t.resc}</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px">${rescSlots}</div>
      </div>` : ''}
    </div>
    <div style="flex-shrink:0;padding:14px 20px 18px;border-top:1px solid #E4E0D6;display:flex;flex-direction:column;gap:7px">
      ${payable ? '<button data-c="' + hnd(() => openCo(a.id)) + '" style="width:100%;padding:13px 0;border-radius:11px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:13.5px;font-weight:700">' + t.dwPay + ' · ' + money(a.pr || price(a.s)) + ' ₼</button>' : ''}
      <div style="display:flex;gap:7px">
        <button data-c="${hnd(() => { S.resc = rescOpen ? null : a.id; commit(); })}" style="flex:1;padding:10px 0;border-radius:10px;border:1px solid #DED9CD;background:#F5F3ED;font-size:12px;font-weight:600">${t.dwResc}</button>
        <button data-c="${hnd(() => { S.pv = 'cli'; S.cSel = a.cl || S.cSel; S.drawer = null; commit(); })}" style="flex:1;padding:10px 0;border-radius:10px;border:1px solid #DED9CD;background:#F5F3ED;font-size:12px;font-weight:600">${t.dwCard}</button>
        <button data-c="${hnd(() => cancelAppt(a.id))}" style="flex:1;padding:10px 0;border-radius:10px;border:1px solid #EFD9D5;background:#FBF2F0;color:#C0392B;font-size:12px;font-weight:600">${t.dwCanc}</button>
      </div>
    </div>
  </div>`;
}

/* ---------- checkout modal ---------- */
function vCo() {
  if (!S.co) return '';
  const t = T();
  const a = S.appts.find(x => x.id === S.co.id);
  const cl = cliOf(a.cl);
  const TT = coTotals();
  if (S.co.done) {
    const items = S.co.items.map(i => {
      const pr = PRODS.find(x => x.id === i.id);
      return '<div style="display:flex;justify-content:space-between;margin-top:6px"><span>' + i.n + '× ' + L(pr) + '</span><span>' + money(pr.p * i.n) + ' ₼</span></div>';
    }).join('');
    const methL = S.co.meth === 'cash' ? t.coCash : S.co.meth === 'card' ? t.coCard : t.coSplit;
    return `
    <div style="position:fixed;inset:0;background:rgba(23,20,31,.42);z-index:300;display:grid;place-items:center;padding:min(40px,4vw);animation:bl-in .16s">
      <div style="width:100%;max-width:700px;background:#F5F3ED;border-radius:20px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.35);animation:bl-up .24s ease-out">
        <div style="display:flex;align-items:center;gap:10px;padding:17px 22px;background:#FBFAF8;border-bottom:1px solid #E4E0D6">
          <span style="${F_SERIF};font-size:21px">${t.coT}</span>
          <span style="font-size:12.5px;color:#8D8677">— ${esc(cl.n)}</span>
          <span style="flex:1"></span>
          <button data-c="${hnd(() => { S.co = null; commit(); })}" style="width:28px;height:28px;border-radius:8px;border:1px solid #DED9CD;background:#F5F3ED;font-size:14px;color:#5F5849">×</button>
        </div>
        <div style="padding:28px 22px 24px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <div style="width:46px;height:46px;border-radius:50%;background:#E7EFEA;color:#2F6B5E;display:grid;place-items:center;font-size:21px;margin-bottom:13px">✓</div>
            <div style="${F_SERIF};font-size:23px;margin-bottom:6px">${t.coOk}</div>
            <div style="font-size:12.5px;color:#8D8677;line-height:1.5">${methL} · ${money(S.co.tot)} ₼</div>
            <button data-c="${hnd(() => { S.co = null; commit(); })}" style="margin-top:20px;padding:12px 22px;border-radius:11px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:13px;font-weight:700">${t.coFin}</button>
          </div>
          <div style="width:246px;background:#FBFAF8;border-radius:12px;padding:18px 18px 20px;${F_MONO};font-size:11px;color:#3F3A32">
            <div style="text-align:center;letter-spacing:.18em;font-size:11px;margin-bottom:3px">BELLINAYA</div>
            <div style="text-align:center;font-size:9px;color:#8D8677;letter-spacing:.1em;margin-bottom:12px">${t.coRec} #${S.co.no}</div>
            <div style="border-top:1px dashed #CFC9BC;padding-top:10px;display:flex;justify-content:space-between">
              <span>${L(svc(a.s))}</span><span>${money(TT.sv)} ₼</span>
            </div>
            ${items}
            <div style="border-top:1px dashed #CFC9BC;margin-top:11px;padding-top:10px;display:flex;justify-content:space-between;font-size:13px">
              <span>${t.total}</span><span>${money(S.co.tot)} ₼</span>
            </div>
            <div style="margin-top:12px;font-size:9px;color:#8D8677;text-align:center;letter-spacing:.08em">${fmtDate(0)} · ${s2m(S.nowMin)} · ${methL}</div>
          </div>
        </div>
      </div>
    </div>`;
  }
  const items = S.co.items.map(i => {
    const pr = PRODS.find(x => x.id === i.id);
    return `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #EDEAE1">
      <span style="${F_MONO};font-size:11px;color:#8D8677;min-width:22px">${i.n}×</span>
      <span style="flex:1;font-size:12.5px">${L(pr)}</span>
      <span style="${F_MONO};font-size:12.5px">${money(pr.p * i.n)} ₼</span>
      <button data-c="${hnd(() => coDel(i.id))}" style="border:none;background:transparent;color:#B5AFA3;font-size:15px;padding:0 2px">×</button>
    </div>`;
  }).join('');
  const picker = PRODS.filter(p => qty(p.id) > 0).map(p => `
    <button data-c="${hnd(() => coAdd(p.id))}" style="display:flex;align-items:center;gap:9px;width:100%;padding:9px 11px;border:none;border-bottom:1px solid #EDEAE1;background:transparent;text-align:left">
      <span style="flex:1;min-width:0;font-size:12px">${L(p)}</span>
      <span style="font-size:10px;color:#9A9284">${qty(p.id)}</span>
      <span style="${F_MONO};font-size:12px;min-width:44px;text-align:right">${p.p} ₼</span>
      <span style="width:19px;height:19px;border-radius:6px;background:#EDE9F3;color:#3B2E5A;font-size:12px;display:grid;place-items:center">+</span>
    </button>`).join('');
  const meths = [['cash', t.coCash], ['card', t.coCard], ['split', t.coSplit]].map(([id, label]) => `
    <button data-c="${hnd(() => { S.co = { ...S.co, meth: id }; commit(); })}" style="flex:1;padding:11px 0;border-radius:10px;border:1px solid ${S.co.meth === id ? '#3B2E5A' : '#DED9CD'};background:${S.co.meth === id ? '#EDE9F3' : '#FBFAF8'};color:#17141F;font-size:12.5px;font-weight:${S.co.meth === id ? 700 : 500}">${label}</button>`).join('');
  return `
  <div style="position:fixed;inset:0;background:rgba(23,20,31,.42);z-index:300;display:grid;place-items:center;padding:min(40px,4vw);animation:bl-in .16s">
    <div style="width:100%;max-width:700px;max-height:92vh;overflow:auto;background:#F5F3ED;border-radius:20px;box-shadow:0 40px 90px rgba(0,0,0,.35);animation:bl-up .24s ease-out">
      <div style="display:flex;align-items:center;gap:10px;padding:17px 22px;background:#FBFAF8;border-bottom:1px solid #E4E0D6">
        <span style="${F_SERIF};font-size:21px">${t.coT}</span>
        <span style="font-size:12.5px;color:#8D8677">— ${esc(cl.n)}</span>
        <span style="flex:1"></span>
        <button data-c="${hnd(() => { S.co = null; commit(); })}" style="width:28px;height:28px;border-radius:8px;border:1px solid #DED9CD;background:#F5F3ED;font-size:14px;color:#5F5849">×</button>
      </div>
      <div style="display:grid;grid-template-columns:1.28fr 1fr;gap:0">
        <div style="padding:20px 22px 22px;min-width:0">
          <div style="${LBL9};margin-bottom:9px">${t.coSum}</div>
          <div style="background:#FBFAF8;border-radius:12px;padding:4px 15px 10px">
            <div style="display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #EDEAE1">
              <span style="flex:1;font-size:13px;font-weight:600">${L(svc(a.s))}</span>
              <span style="${F_MONO};font-size:13px">${money(TT.sv)} ₼</span>
            </div>
            ${items}
            <div style="display:flex;align-items:center;gap:10px;padding:11px 0 3px">
              <span style="flex:1;font-size:12px;color:#5F5849">${t.coDisc}</span>
              <input data-f="codisc" type="number" value="${S.co.disc}" min="0" max="50" data-in="${hnd((e) => coDisc(e.target.value))}" style="width:58px;padding:5px 8px;border-radius:8px;border:1px solid #DED9CD;background:#F5F3ED;${F_MONO};font-size:12px;text-align:right" />
              <span style="font-size:11px;color:#8D8677">%</span>
              <span style="${F_MONO};font-size:12.5px;color:#C0392B;min-width:62px;text-align:right">−${money(TT.d)} ₼</span>
            </div>
          </div>
          <div style="display:flex;align-items:baseline;gap:10px;margin:18px 0 14px">
            <span style="${LBL9}">${t.total}</span>
            <span style="flex:1"></span>
            <span style="font-size:30px;font-weight:300;color:#3B2E5A;font-variant-numeric:tabular-nums">${money(TT.tot)} ₼</span>
          </div>
          <div style="${LBL9};margin-bottom:8px">${t.coMeth}</div>
          <div style="display:flex;gap:6px;margin-bottom:14px">${meths}</div>
          <button data-c="${hnd(coDone)}" style="width:100%;padding:14px 0;border-radius:12px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:14px;font-weight:700">${t.coDo} · ${money(TT.tot)} ₼</button>
        </div>
        <div style="border-left:1px solid #E4E0D6;background:#FBFAF8;display:flex;flex-direction:column;max-height:470px;min-width:0">
          <div style="padding:20px 18px 8px;${LBL9}">${t.coAdd}</div>
          <div style="flex:1;min-height:0;overflow:auto;padding:0 8px 14px">${picker}</div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- quick create modal ---------- */
function vQc() {
  if (!S.quick) return '';
  const t = T(); const q = S.quick;
  const opts = MASTERS.filter(m => m.b === S.b).map(m =>
    '<option value="' + m.id + '"' + (q.m === m.id ? ' selected' : '') + '>' + m.n + '</option>').join('');
  const cats = CATS.map(c => `
    <div style="margin-bottom:8px">
      <div style="font-size:10.5px;color:#9A9284;padding:5px 10px">${L(c)}</div>
      ${SVCS.filter(x => x.c === c.id).map(x => `
      <button data-c="${hnd(() => { S.quick = { ...S.quick, s: x.id }; commit(); })}" style="display:flex;align-items:center;gap:7px;width:100%;padding:7px 10px;border-radius:8px;text-align:left;border:1px solid ${q.s === x.id ? '#3B2E5A' : 'transparent'};background:${q.s === x.id ? '#EDE9F3' : 'transparent'};font-size:12px">
        <span style="flex:1">${L(x)}</span>
        <span style="${F_MONO};font-size:11.5px;color:#5F5849">${price(x.id)} ₼</span>
      </button>`).join('')}
    </div>`).join('');
  const can = !!(q.s && q.name.trim() && validTime(q.t));
  const timeOk = validTime(q.t);
  return `
  <div style="position:fixed;inset:0;background:rgba(23,20,31,.42);z-index:300;display:grid;place-items:center;padding:min(40px,4vw);animation:bl-in .16s">
    <div style="width:100%;max-width:470px;max-height:92vh;overflow:auto;background:#F5F3ED;border-radius:20px;box-shadow:0 40px 90px rgba(0,0,0,.35);animation:bl-up .24s ease-out">
      <div style="display:flex;align-items:center;gap:10px;padding:17px 22px;background:#FBFAF8;border-bottom:1px solid #E4E0D6">
        <span style="${F_SERIF};font-size:21px">${t.qcT}</span>
        <span style="font-size:12px;color:#8D8677">${fmtDate(q.d)}</span>
        <span style="flex:1"></span>
        <button data-c="${hnd(() => { S.quick = null; commit(); })}" style="width:28px;height:28px;border-radius:8px;border:1px solid #DED9CD;background:#F5F3ED;font-size:14px;color:#5F5849">×</button>
      </div>
      <div style="padding:18px 22px 8px;display:flex;gap:9px">
        <div style="flex:1">
          <div style="${F_MONO};font-size:9px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;margin-bottom:5px">${t.qcName}</div>
          <input data-f="qcname" value="${esc(q.name)}" data-in="${hnd((e) => { S.quick = { ...S.quick, name: e.target.value }; commit(); })}" style="width:100%;padding:9px 11px;border-radius:10px;border:1px solid #DED9CD;background:#FBFAF8;font-size:13px" />
        </div>
        <div style="width:132px">
          <div style="${F_MONO};font-size:9px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;margin-bottom:5px">${t.qcPhone}</div>
          <input data-f="qcphone" value="${esc(q.phone)}" inputmode="tel" data-in="${hnd((e) => { S.quick = { ...S.quick, phone: e.target.value }; commit(); })}" placeholder="050 000 00 00" style="width:100%;padding:9px 11px;border-radius:10px;border:1px solid #DED9CD;background:#FBFAF8;${F_MONO};font-size:12px" />
        </div>
      </div>
      <div style="padding:10px 22px 8px;display:flex;gap:9px">
        <div style="flex:1">
          <div style="${F_MONO};font-size:9px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;margin-bottom:5px">${t.fMaster}</div>
          <select data-chg="${hnd((e) => { S.quick = { ...S.quick, m: e.target.value }; commit(); })}" style="width:100%;padding:9px 11px;border-radius:10px;border:1px solid #DED9CD;background:#FBFAF8;font-size:13px">${opts}</select>
        </div>
        <div style="width:132px">
          <div style="${F_MONO};font-size:9px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase;margin-bottom:5px">${t.fTime}</div>
          <input data-f="qctime" value="${esc(q.t)}" data-in="${hnd((e) => { S.quick = { ...S.quick, t: e.target.value }; commit(); })}" style="width:100%;padding:9px 11px;border-radius:10px;border:1px solid ${timeOk ? '#DED9CD' : '#C0392B'};background:#FBFAF8;${F_MONO};font-size:13px" />
        </div>
      </div>
      <div style="padding:12px 22px 4px;${F_MONO};font-size:9px;letter-spacing:.12em;color:#8D8677;text-transform:uppercase">${t.qcPick}</div>
      <div style="max-height:206px;overflow:auto;padding:0 16px 8px">${cats}</div>
      <div style="padding:14px 22px 20px;display:flex;gap:8px;border-top:1px solid #E4E0D6">
        <button data-c="${hnd(() => { S.quick = null; commit(); })}" style="width:104px;padding:12px 0;border-radius:11px;border:1px solid #DED9CD;background:#FBFAF8;font-size:13px;font-weight:600">${t.cancelBtn}</button>
        <button data-c="${hnd(createAppt)}" style="flex:1;padding:12px 0;border-radius:11px;border:none;font-size:13px;font-weight:700;background:${can ? '#3B2E5A' : '#DED9CD'};color:${can ? '#F2F0EA' : '#9A9284'}">${t.qcMake}</button>
      </div>
    </div>
  </div>`;
}

/* ---------- notifications popover ---------- */
function vNotif() {
  if (!S.notifOpen) return '';
  const t = T();
  const nIcon = { book: '#3B2E5A', cancel: '#C0392B', order: '#A8501F', client: '#2F6B5E' };
  const nLabel = { book: t.nBook, cancel: t.nCancel, order: t.nOrder, client: t.nClient };
  const list = S.notif.length ? S.notif.map(n => `
    <button data-c="${hnd(() => { if (n.go) S.pv = n.go; S.notifOpen = false; S.notif = S.notif.map(y => y.id === n.id ? { ...y, read: true } : y); commit(); })}" style="display:flex;gap:11px;width:100%;padding:11px 14px;border:none;text-align:left;background:${n.read ? 'transparent' : '#F5F3ED'};border-bottom:1px solid #EDEAE1">
      <span style="width:7px;height:7px;border-radius:50%;margin-top:5px;flex-shrink:0;background:${n.read ? '#D8D3C6' : nIcon[n.kind]}"></span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:12px;font-weight:650">${nLabel[n.kind]}</span>
        <span style="display:block;font-size:11px;color:#8D8677;line-height:1.4">${esc(n.txt)}</span>
      </span>
      <span style="${F_MONO};font-size:10px;color:#9A9284">${n.t}</span>
    </button>`).join('')
    : '<div style="padding:22px 16px;font-size:12px;color:#9A9284;text-align:center">' + t.noNotif + '</div>';
  return `
  <div style="position:fixed;top:62px;right:14px;width:330px;max-width:calc(100vw - 28px);max-height:420px;z-index:260;background:#FBFAF8;border:1px solid #DAD5C9;border-radius:15px;box-shadow:0 26px 60px rgba(23,20,31,.24);display:flex;flex-direction:column;overflow:hidden;animation:bl-up .18s ease-out">
    <div style="display:flex;align-items:center;gap:10px;padding:13px 15px;border-bottom:1px solid #E4E0D6">
      <span style="${LBL}">${t.notif}</span>
      <span style="flex:1"></span>
      <button data-c="${hnd(() => { S.notif = S.notif.map(n => ({ ...n, read: true })); commit(); })}" style="border:none;background:transparent;color:#3B2E5A;font-size:11px;font-weight:600">${t.markAll}</button>
    </div>
    <div style="flex:1;min-height:0;overflow:auto">${list}</div>
  </div>`;
}

/* ---------- Z-report modal ---------- */
function vZr() {
  if (!S.zrep) return '';
  const t = T(); const z = S.zrep;
  const rows = [
    [t.zSvc, money(z.svcRev) + ' ₼'], [t.zProd, money(z.prodRev) + ' ₼'],
    [t.csCash, money(z.cash) + ' ₼'], [t.csCard, money(z.card) + ' ₼'],
    [t.zTx, z.tx + ''], [t.csOpen, money(z.open) + ' ₼'], [t.csOut, '−' + money(z.out) + ' ₼']
  ].map(([k, v]) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #EDEAE1">
      <span style="flex:1;font-size:12.5px;color:#5F5849">${k}</span>
      <span style="${F_MONO};font-size:13px">${v}</span>
    </div>`).join('');
  const pay = z.pay.map(p => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #EDEAE1">
      <span style="flex:1;min-width:0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.n}</span>
      <span style="${F_MONO};font-size:10.5px;color:#8D8677">${p.cnt}</span>
      <span style="${F_MONO};font-size:12px;color:#3B2E5A;min-width:56px;text-align:right">${money(p.sal)} ₼</span>
    </div>`).join('');
  return `
  <div style="position:fixed;inset:0;background:rgba(23,20,31,.42);z-index:320;display:grid;place-items:center;padding:min(40px,4vw);animation:bl-in .16s">
    <div style="width:100%;max-width:660px;max-height:92vh;overflow:auto;background:#F5F3ED;border-radius:20px;box-shadow:0 40px 90px rgba(0,0,0,.35);animation:bl-up .24s ease-out">
      <div style="display:flex;align-items:center;gap:10px;padding:17px 22px;background:#FBFAF8;border-bottom:1px solid #E4E0D6">
        <span style="${F_SERIF};font-size:21px">${t.zT}</span>
        <span style="flex:1"></span>
        <button data-c="${hnd(() => { S.zrep = null; commit(); })}" style="width:28px;height:28px;border-radius:8px;border:1px solid #DED9CD;background:#F5F3ED;font-size:14px;color:#5F5849">×</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:0">
        <div style="padding:18px 22px 20px">
          <div style="background:#FBFAF8;border-radius:13px;padding:4px 16px 10px">
            ${rows}
            <div style="display:flex;align-items:center;gap:10px;padding:12px 0 3px">
              <span style="flex:1;font-size:12.5px;font-weight:650">${t.total}</span>
              <span style="${F_MONO};font-size:17px;color:#3B2E5A">${money(z.total)} ₼</span>
            </div>
          </div>
          <div style="background:#3B2E5A;color:#F2F0EA;border-radius:13px;padding:15px 17px;margin-top:12px">
            <div style="${F_MONO};font-size:9px;letter-spacing:.14em;color:#B0A6C8;text-transform:uppercase">${t.csBal}</div>
            <div style="font-size:25px;font-weight:300;margin-top:5px">${money(z.bal)} ₼</div>
          </div>
          <div style="font-size:11.5px;color:#8D8677;line-height:1.5;margin-top:12px">${t.zNote}</div>
        </div>
        <div style="border-left:1px solid #E4E0D6;background:#FBFAF8;padding:18px 20px 20px">
          <div style="${LBL9};margin-bottom:9px">${t.csPay}</div>
          ${pay}
          <div style="display:flex;align-items:center;padding:12px 0 0">
            <span style="flex:1;font-size:12px;font-weight:650">${t.pTotal}</span>
            <span style="${F_MONO};font-size:15px;color:#3B2E5A">${money(z.payTotal)} ₼</span>
          </div>
          <button data-c="${hnd(confirmClose)}" style="width:100%;margin-top:20px;padding:14px 0;border-radius:12px;border:none;background:#3B2E5A;color:#F2F0EA;font-size:13.5px;font-weight:700">${t.zConfirm}</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- toast ---------- */
function vToast() {
  if (!S.toast) return '';
  const pos = S.view === 'panel' && S.auth.staff ? 'left:206px' : 'left:50%;transform:translateX(-50%)';
  return `
  <div style="position:fixed;${pos};bottom:22px;z-index:400;display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:12px;background:#17141F;color:#F2F0EA;box-shadow:0 18px 40px rgba(0,0,0,.3);animation:bl-up .22s ease-out;max-width:min(420px,90vw)">
    <span style="width:7px;height:7px;border-radius:50%;background:#5FA88C;flex-shrink:0"></span>
    <span style="font-size:12.5px;font-weight:500">${esc(S.toast)}</span>
  </div>`;
}

/* ---------- app root ---------- */
function App() {
  const staff = S.auth.staff;
  const main = S.view === 'client' ? vDeskSite() : (staff ? vPanel() : vLogin());
  const inPanel = S.view === 'panel' && staff;
  return `
  <div style="height:100vh;height:100dvh;display:flex;flex-direction:column;background:#F2F0EA;overflow:hidden">
    ${vHeader()}
    <div style="flex:1;min-height:0;display:flex">
      ${main}
    </div>
    ${inPanel ? vDrawer() : ''}
    ${inPanel ? vCo() : ''}
    ${inPanel ? vQc() : ''}
    ${inPanel ? vNotif() : ''}
    ${inPanel ? vZr() : ''}
    ${vToast()}
  </div>`;
}

function render() {
  REG = [];
  const root = document.getElementById('app');
  const ae = document.activeElement;
  const fkey = ae && ae.dataset ? ae.dataset.f : null;
  let selS = null, selE = null;
  if (fkey && ae.setSelectionRange) { try { selS = ae.selectionStart; selE = ae.selectionEnd; } catch (e) {} }
  root.innerHTML = App();
  if (fkey) {
    const el = root.querySelector('[data-f="' + fkey + '"]');
    if (el) {
      el.focus({ preventScroll: true });
      if (selS != null && el.setSelectionRange) { try { el.setSelectionRange(selS, selE); } catch (e) {} }
    }
  }
}

/* ---------- init ---------- */
setInterval(() => {
  const nm = nowMin();
  if (nm !== S.nowMin) { S.nowMin = nm; render(); }
}, 30000);

let rsT = null;
window.addEventListener('resize', () => {
  if (rsT) clearTimeout(rsT);
  rsT = setTimeout(render, 180);
});

/* Cross-window live sync: open the panel in one window and the client site in
   another — a booking made in one appears in the other instantly. */
window.addEventListener('storage', (e) => {
  if (e.key !== KEY || !e.newValue) return;
  try {
    const sv = JSON.parse(e.newValue);
    if (!sv || sv.v !== 3) return;
    S.appts = sv.appts || S.appts;
    S.tx = sv.tx || S.tx;
    S.cls = sv.cls || S.cls;
    S.prodQ = sv.prodQ || null;
    S.prices = sv.prices || null;
    S.notif = sv.notif || [];
    S.dayClosed = !!sv.dayClosed;
    render();
  } catch (err) {}
});

document.addEventListener('DOMContentLoaded', render);
if (document.readyState !== 'loading') render();
