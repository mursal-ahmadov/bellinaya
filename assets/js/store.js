/* ==========================================================================
   Bellinaya — store
   One state object, one event bus. Both the client page and the salon panel
   read and write here, which is what makes the live link real rather than
   simulated: a booking made on the phone IS the row the journal renders.
   ========================================================================== */
(function () {
  var U = B.util;
  var KEY = 'bellinaya.state.v' + B.SEED_VERSION;

  var state = null;
  var subs = [];

  /* ------------------------------------------------------------ lifecycle -- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); return; }
    } catch (e) { }
    state = B.seed();
    persist();
  }
  var saveTimer;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { }
    }, 120);
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { }
    state = B.seed();
    persist();
    emit({ type: 'reset' });
  }

  function sub(fn) { subs.push(fn); return function () { subs = subs.filter(function (f) { return f !== fn; }); }; }
  function emit(ev) {
    persist();
    subs.slice().forEach(function (f) { try { f(ev || {}); } catch (e) { console.error(e); } });
  }

  /* ------------------------------------------------------------ selectors -- */
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  var S = {
    branch: function (id) { return byId(state.branches, id); },
    staff: function (id) { return byId(state.staff, id); },
    client: function (id) { return byId(state.clients, id); },
    service: function (id) { return byId(state.services, id); },
    product: function (id) { return byId(state.products, id); },
    category: function (id) { return byId(state.categories, id); },
    appointment: function (id) { return byId(state.appointments, id); }
  };

  /** Localised display name for records that carry ru/en variants. */
  function nameOf(rec) {
    if (!rec) return '';
    var l = B.i18n.get();
    if (l === 'ru' && rec.nameRu) return rec.nameRu;
    if (l === 'en' && rec.nameEn) return rec.nameEn;
    return rec.name;
  }
  function catOfService(sid) { var s = S.service(sid); return s ? S.category(s.catId) : null; }
  function catVar(catId) { var c = S.category(catId); return 'var(--cat-' + (c ? c.slot : 1) + ')'; }
  function catVarOfService(sid) { var s = S.service(sid); return catVar(s ? s.catId : 'c1'); }
  function serviceNames(ids) { return (ids || []).map(function (id) { return nameOf(S.service(id)); }).filter(Boolean).join(' + '); }
  function servicesDuration(ids) { return (ids || []).reduce(function (a, id) { var s = S.service(id); return a + (s ? s.duration : 0); }, 0); }
  function servicesPrice(ids) { return (ids || []).reduce(function (a, id) { var s = S.service(id); return a + (s ? s.price : 0); }, 0); }

  function staffOfBranch(branchId) {
    return state.staff.filter(function (s) { return s.active && (branchId === 'all' || s.branchId === branchId); });
  }
  function staffForService(branchId, serviceId) {
    var svc = S.service(serviceId);
    if (!svc) return [];
    return staffOfBranch(branchId).filter(function (s) { return s.cats.indexOf(svc.catId) >= 0; });
  }
  function activeAppointments(pred) {
    return state.appointments.filter(function (a) {
      if (a.status === 'cancelled') return false;
      return pred ? pred(a) : true;
    });
  }
  function appointmentsOn(dateKey, branchId) {
    return state.appointments.filter(function (a) {
      return a.date === dateKey && (branchId === 'all' || a.branchId === branchId);
    });
  }
  function stockOf(productId, branchId) {
    var m = state.stock[productId] || {};
    if (branchId === 'all') return Object.keys(m).reduce(function (a, k) { return a + m[k]; }, 0);
    return m[branchId] || 0;
  }
  function lowStock(branchId) {
    return state.products.filter(function (p) { return stockOf(p.id, branchId) <= p.minStock; })
      .map(function (p) { return { product: p, qty: stockOf(p.id, branchId) }; })
      .sort(function (a, b) { return a.qty - b.qty; });
  }

  /* ---------------------------------------------------------- availability -- */
  var STEP = 15;

  function staffWorksOn(staff, date) {
    var dow = date.getDay();
    return (staff.off || []).indexOf(dow) < 0;
  }
  /** Busy intervals for one specialist on one day, as [startMin, endMin) pairs. */
  function busyOf(staffId, dateKey, exceptId) {
    return state.appointments.filter(function (a) {
      return a.staffId === staffId && a.date === dateKey &&
        a.status !== 'cancelled' && a.status !== 'noshow' && a.id !== exceptId;
    }).map(function (a) { return [a.start, a.start + a.duration]; });
  }
  function overlaps(s, e, list) {
    for (var i = 0; i < list.length; i++) if (s < list[i][1] && e > list[i][0]) return true;
    return false;
  }
  /**
   * Free start times for a given duration.
   * staffId may be 'any' — then a slot counts as free if ANY qualified
   * specialist can take it, and the caller resolves who.
   */
  function slotsFor(opts) {
    var branch = S.branch(opts.branchId);
    if (!branch) return [];
    var date = U.fromKey(opts.dateKey);
    var openM = U.minOf(branch.open), closeM = U.minOf(branch.close);
    var dur = opts.duration || 30;
    var pool = opts.staffId && opts.staffId !== 'any'
      ? [S.staff(opts.staffId)].filter(Boolean)
      : (opts.serviceId ? staffForService(opts.branchId, opts.serviceId) : staffOfBranch(opts.branchId));
    pool = pool.filter(function (s) { return staffWorksOn(s, date); });
    if (!pool.length) return [];

    var todayKey = U.dkey(new Date());
    var minStart = opts.dateKey === todayKey ? U.nowMin() + 30 : 0;

    var cache = {};
    pool.forEach(function (s) {
      var shiftS = Math.max(openM, U.minOf(s.shift.start));
      var shiftE = Math.min(closeM, U.minOf(s.shift.end));
      cache[s.id] = { busy: busyOf(s.id, opts.dateKey, opts.exceptId), s: shiftS, e: shiftE };
    });

    var out = [];
    for (var t = Math.ceil(openM / STEP) * STEP; t + dur <= closeM; t += STEP) {
      if (t < minStart) continue;
      var who = null;
      for (var i = 0; i < pool.length; i++) {
        var c = cache[pool[i].id];
        if (t < c.s || t + dur > c.e) continue;
        if (overlaps(t, t + dur, c.busy)) continue;
        who = pool[i].id; break;
      }
      if (who) out.push({ start: t, staffId: who });
    }
    return out;
  }
  function isFree(staffId, dateKey, start, duration, exceptId) {
    var st = S.staff(staffId); if (!st) return false;
    var date = U.fromKey(dateKey);
    if (!staffWorksOn(st, date)) return false;
    var br = S.branch(st.branchId);
    if (start < Math.max(U.minOf(br.open), U.minOf(st.shift.start))) return false;
    if (start + duration > Math.min(U.minOf(br.close), U.minOf(st.shift.end))) return false;
    return !overlaps(start, start + duration, busyOf(staffId, dateKey, exceptId));
  }

  /* ----------------------------------------------------------- mutations --- */
  function logMessage(m) {
    state.messages.unshift({
      id: U.uid('ms'), at: Date.now(), channel: m.channel || 'whatsapp',
      to: m.to || '', name: m.name || '', text: m.text || '', kind: m.kind || 'info'
    });
    if (state.messages.length > 200) state.messages.length = 200;
  }

  function book(input) {
    var dur = input.duration || servicesDuration(input.serviceIds);
    var staffId = input.staffId;
    if (!staffId || staffId === 'any') {
      var free = slotsFor({
        branchId: input.branchId, dateKey: input.date, duration: dur,
        serviceId: input.serviceIds[0]
      }).filter(function (s) { return s.start === input.start; });
      staffId = free.length ? free[0].staffId : null;
    }
    if (!staffId || !isFree(staffId, input.date, input.start, dur)) return { ok: false, reason: 'busy' };

    var ap = {
      id: U.uid('ap'), branchId: input.branchId, staffId: staffId, clientId: input.clientId,
      serviceIds: input.serviceIds.slice(), date: input.date, start: input.start, duration: dur,
      status: input.status || 'pending', source: input.source || 'online',
      price: servicesPrice(input.serviceIds), note: input.note || '', products: [],
      discount: 0, bonusUsed: 0, method: null, createdAt: Date.now(), isNew: true
    };
    state.appointments.push(ap);
    var cl = S.client(ap.clientId);
    logMessage({
      channel: 'whatsapp', to: cl ? cl.phone : '', name: cl ? cl.name : '', kind: 'booked',
      text: 'Salam' + (cl ? ', ' + cl.name.split(' ')[0] : '') + '! Yazılışınız qeydə alındı: ' +
        serviceNames(ap.serviceIds) + ' — ' + B.i18n.dateLabel(U.fromKey(ap.date), { plain: true }) +
        ', saat ' + U.hhmm(ap.start) + '. ' + S.branch(ap.branchId).name + '.'
    });
    emit({ type: 'book', id: ap.id, appointment: ap });
    return { ok: true, appointment: ap };
  }

  function setStatus(id, status) {
    var a = S.appointment(id); if (!a) return;
    a.status = status;
    if (status === 'confirmed') {
      var cl = S.client(a.clientId);
      logMessage({
        channel: 'whatsapp', to: cl ? cl.phone : '', name: cl ? cl.name : '', kind: 'confirmed',
        text: 'Yazılışınız təsdiqləndi: ' + serviceNames(a.serviceIds) + ' — ' +
          B.i18n.dateLabel(U.fromKey(a.date), { plain: true }) + ', saat ' + U.hhmm(a.start) + '.'
      });
    }
    if (status === 'noshow') {
      var c2 = S.client(a.clientId); if (c2) c2.noShows = (c2.noShows || 0) + 1;
    }
    emit({ type: 'status', id: id, status: status });
  }

  function cancel(id, opts) {
    var a = S.appointment(id); if (!a) return null;
    a.status = 'cancelled';
    a.cancelledBy = (opts && opts.by) || 'salon';
    var cl = S.client(a.clientId);
    logMessage({
      channel: 'whatsapp', to: cl ? cl.phone : '', name: cl ? cl.name : '', kind: 'cancelled',
      text: 'Yazılışınız ləğv olundu: ' + serviceNames(a.serviceIds) + ' — ' +
        B.i18n.dateLabel(U.fromKey(a.date), { plain: true }) + ', saat ' + U.hhmm(a.start) + '.'
    });
    emit({ type: 'cancel', id: id, appointment: a });
    return a;
  }

  function reschedule(id, patch) {
    var a = S.appointment(id); if (!a) return { ok: false };
    var staffId = patch.staffId || a.staffId;
    var date = patch.date || a.date;
    var start = patch.start != null ? patch.start : a.start;
    if (!isFree(staffId, date, start, a.duration, a.id)) return { ok: false, reason: 'busy' };
    var was = { date: a.date, start: a.start, staffId: a.staffId };
    a.staffId = staffId; a.date = date; a.start = start;
    a.branchId = S.staff(staffId).branchId;
    var cl = S.client(a.clientId);
    logMessage({
      channel: 'whatsapp', to: cl ? cl.phone : '', name: cl ? cl.name : '', kind: 'moved',
      text: 'Yazılışınızın vaxtı dəyişdi: ' + B.i18n.dateLabel(U.fromKey(a.date), { plain: true }) +
        ', saat ' + U.hhmm(a.start) + '. Usta: ' + S.staff(a.staffId).name + '.'
    });
    emit({ type: 'reschedule', id: id, was: was, appointment: a });
    return { ok: true };
  }

  /** Books a walk-in / phone appointment straight from the panel. */
  function quickBook(input) {
    input.source = input.source || 'salon';
    input.status = input.status || 'confirmed';
    return book(input);
  }

  /**
   * Checkout: services + products in one receipt.
   * Decrements stock, writes the cash transaction, accrues commission,
   * adds bonus, and marks the appointment paid — everything the other
   * screens then read back.
   */
  function checkout(opts) {
    var a = opts.appointmentId ? S.appointment(opts.appointmentId) : null;
    var branchId = a ? a.branchId : opts.branchId;
    var items = [];
    var serviceTotal = 0, productTotal = 0;

    if (a) {
      serviceTotal = servicesPrice(a.serviceIds);
      items.push({ kind: 'service', ids: a.serviceIds.slice(), amount: serviceTotal, label: serviceNames(a.serviceIds) });
    }
    (opts.products || []).forEach(function (line) {
      var p = S.product(line.id); if (!p) return;
      var amount = p.price * line.qty;
      productTotal += amount;
      items.push({ kind: 'product', id: p.id, qty: line.qty, amount: amount, label: p.name });
      var m = state.stock[p.id] || (state.stock[p.id] = {});
      m[branchId] = Math.max(0, (m[branchId] || 0) - line.qty);
    });

    var gross = serviceTotal + productTotal;
    var discount = Math.min(opts.discount || 0, gross);
    var bonusUsed = Math.min(opts.bonusUsed || 0, gross - discount);
    var total = Math.max(0, gross - discount - bonusUsed);

    var tx = {
      id: U.uid('tx'), branchId: branchId, type: 'income', category: productTotal && !serviceTotal ? 'Mal satışı' : 'Xidmət haqqı',
      amount: total, method: opts.method || 'cash', appointmentId: a ? a.id : null,
      staffId: opts.staffId || (a ? a.staffId : null), clientId: opts.clientId || (a ? a.clientId : null),
      items: items, discount: discount, bonusUsed: bonusUsed, gross: gross,
      date: U.dkey(new Date()), at: Date.now()
    };
    state.transactions.push(tx);

    if (a) {
      a.status = 'paid'; a.method = tx.method; a.discount = discount;
      a.bonusUsed = bonusUsed; a.paidTotal = total;
      a.products = (opts.products || []).map(function (l) {
        return { id: l.id, qty: l.qty, price: S.product(l.id).price };
      });
    }
    var cl = S.client(tx.clientId);
    if (cl) {
      cl.bonus = Math.max(0, (cl.bonus || 0) - bonusUsed) + Math.floor(total * 0.05);
      cl.totalSpend = (cl.totalSpend || 0) + total;
      cl.visits = (cl.visits || 0) + 1;
      cl.lastVisit = U.dkey(new Date());
    }
    emit({ type: 'checkout', tx: tx, appointment: a });
    return tx;
  }

  /** Retail sale with no appointment attached. */
  function sellProducts(opts) {
    return checkout({
      branchId: opts.branchId, products: opts.products, method: opts.method,
      clientId: opts.clientId, staffId: opts.staffId, discount: opts.discount || 0
    });
  }

  function receiveStock(productId, branchId, qty) {
    var m = state.stock[productId] || (state.stock[productId] = {});
    m[branchId] = (m[branchId] || 0) + qty;
    var p = S.product(productId);
    state.transactions.push({
      id: U.uid('tx'), branchId: branchId, type: 'expense', category: 'Mal alışı',
      amount: p.cost * qty, method: 'cash', items: [{ kind: 'product', id: productId, qty: qty, amount: p.cost * qty }],
      date: U.dkey(new Date()), at: Date.now()
    });
    emit({ type: 'stock', productId: productId });
  }

  /* --------------------------------------------------- the gap-fill moment -- */
  /** Candidates from the waiting list who fit a freed slot. */
  function gapCandidates(ap) {
    return state.waitlist.filter(function (w) {
      if (w.branchId !== ap.branchId) return false;
      var svc = S.service(w.serviceId);
      var st = S.staff(ap.staffId);
      return svc && st && st.cats.indexOf(svc.catId) >= 0 && svc.duration <= ap.duration + 15;
    });
  }
  /** Sends the offers; one candidate accepts, which re-books the freed slot. */
  function fillGap(ap, onDone) {
    var cands = gapCandidates(ap);
    if (!cands.length) { onDone && onDone(null); return 0; }
    cands.forEach(function (w) {
      var cl = S.client(w.clientId);
      logMessage({
        channel: 'whatsapp', to: cl ? cl.phone : '', name: cl ? cl.name : '', kind: 'gapfill',
        text: (cl ? cl.name.split(' ')[0] + ', ' : '') + 'yer boşaldı! ' +
          B.i18n.dateLabel(U.fromKey(ap.date), { plain: true }) + ', saat ' + U.hhmm(ap.start) +
          ' — ' + nameOf(S.service(w.serviceId)) + ', ' + S.branch(ap.branchId).name +
          '. Qəbul etmək üçün cavab yazın.'
      });
    });
    emit({ type: 'gapfill-sent', count: cands.length });
    var winner = cands[0];
    setTimeout(function () {
      var svc = S.service(winner.serviceId);
      var res = book({
        branchId: ap.branchId, staffId: ap.staffId, clientId: winner.clientId,
        serviceIds: [winner.serviceId], date: ap.date, start: ap.start,
        duration: svc.duration, status: 'confirmed', source: 'online', note: 'Gözləmə siyahısından dolduruldu'
      });
      if (res.ok) {
        state.waitlist = state.waitlist.filter(function (w) { return w.id !== winner.id; });
        var au = state.automations.filter(function (x) { return x.key === 'gapfill'; })[0];
        if (au) au.sent += cands.length;
        emit({ type: 'gapfill-done', appointment: res.appointment, saved: svc.price });
        onDone && onDone({ appointment: res.appointment, saved: svc.price, client: S.client(winner.clientId) });
      } else { onDone && onDone(null); }
    }, 2100);
    return cands.length;
  }

  /* ------------------------------------------------------------- campaigns -- */
  function lapsedClients(days) {
    var today = U.dkey(new Date());
    return state.clients.filter(function (c) {
      return !c.blocked && U.daysBetween(c.lastVisit, today) >= (days || 60);
    });
  }
  function birthdaysSoon(days) {
    var now = new Date(); var out = [];
    state.clients.forEach(function (c) {
      if (!c.birthday) return;
      var b = U.fromKey(c.birthday);
      var next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
      var diff = Math.round((next - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
      if (diff <= (days || 7)) out.push({ client: c, inDays: diff });
    });
    return out.sort(function (a, b) { return a.inDays - b.inDays; });
  }
  function runCampaign(key, list, text) {
    list.forEach(function (c) {
      logMessage({ channel: 'whatsapp', to: c.phone, name: c.name, kind: key, text: text.replace('{ad}', c.name.split(' ')[0]) });
    });
    var au = state.automations.filter(function (x) { return x.key === key; })[0];
    if (au) au.sent += list.length;
    emit({ type: 'campaign', key: key, count: list.length });
    return list.length;
  }

  /* ------------------------------------------------------------ analytics -- */
  function inBranch(rec, branchId) { return branchId === 'all' || rec.branchId === branchId; }

  function revenueOn(dateKey, branchId) {
    return state.transactions.reduce(function (a, t) {
      return (t.type === 'income' && t.date === dateKey && inBranch(t, branchId)) ? a + t.amount : a;
    }, 0);
  }
  function expenseOn(dateKey, branchId) {
    return state.transactions.reduce(function (a, t) {
      return (t.type === 'expense' && t.date === dateKey && inBranch(t, branchId)) ? a + t.amount : a;
    }, 0);
  }
  function revenueSeries(days, branchId) {
    var out = [], today = new Date();
    for (var i = days - 1; i >= 0; i--) {
      var d = U.addDays(today, -i);
      out.push({ date: U.dkey(d), label: d.getDate() + ' ' + B.i18n.month(d.getMonth()).slice(0, 3), value: revenueOn(U.dkey(d), branchId) });
    }
    return out;
  }
  function occupancy(dateKey, branchId) {
    var staff = staffOfBranch(branchId).filter(function (s) { return staffWorksOn(s, U.fromKey(dateKey)); });
    if (!staff.length) return 0;
    var capacity = staff.reduce(function (a, s) { return a + (U.minOf(s.shift.end) - U.minOf(s.shift.start)); }, 0);
    var booked = appointmentsOn(dateKey, branchId).reduce(function (a, ap) {
      return (ap.status === 'cancelled' || ap.status === 'noshow') ? a : a + ap.duration;
    }, 0);
    return capacity ? Math.min(100, Math.round(booked / capacity * 100)) : 0;
  }
  function kpis(branchId) {
    var today = U.dkey(new Date());
    var todays = appointmentsOn(today, branchId);
    var paid = todays.filter(function (a) { return a.status === 'paid'; });
    var rev = revenueOn(today, branchId);
    var yesterday = U.dkey(U.addDays(new Date(), -1));
    var revY = revenueOn(yesterday, branchId);
    var avg = paid.length ? Math.round(rev / paid.length) : 0;
    return {
      revenue: rev,
      revenueDelta: revY ? Math.round((rev - revY) / revY * 100) : 0,
      appointments: todays.filter(function (a) { return a.status !== 'cancelled'; }).length,
      pending: todays.filter(function (a) { return a.status === 'pending'; }).length,
      done: paid.length,
      avgCheck: avg,
      occupancy: occupancy(today, branchId),
      newClients: state.clients.filter(function (c) { return c.lastVisit === today && c.visits <= 1; }).length
    };
  }
  function payroll(branchId, fromKey, toKey) {
    var staff = staffOfBranch(branchId);
    return staff.map(function (s) {
      var svcRevenue = 0, prodRevenue = 0, count = 0;
      state.transactions.forEach(function (t) {
        if (t.type !== 'income' || t.staffId !== s.id) return;
        if (fromKey && t.date < fromKey) return;
        if (toKey && t.date > toKey) return;
        count++;
        (t.items || []).forEach(function (it) {
          if (it.kind === 'product') prodRevenue += it.amount; else svcRevenue += it.amount;
        });
      });
      var pay = Math.round(svcRevenue * s.commission / 100 + prodRevenue * s.productCommission / 100);
      return {
        staff: s, visits: count, serviceRevenue: svcRevenue, productRevenue: prodRevenue,
        commission: s.commission, productCommission: s.productCommission, pay: pay
      };
    }).sort(function (a, b) { return b.pay - a.pay; });
  }
  function serviceMix(branchId, days) {
    var from = U.dkey(U.addDays(new Date(), -(days || 30)));
    var map = {};
    state.appointments.forEach(function (a) {
      if (a.status !== 'paid' || !inBranch(a, branchId) || a.date < from) return;
      a.serviceIds.forEach(function (sid) {
        var c = catOfService(sid); if (!c) return;
        map[c.id] = (map[c.id] || 0) + (S.service(sid).price || 0);
      });
    });
    return state.categories.map(function (c) { return { cat: c, value: map[c.id] || 0 }; })
      .filter(function (r) { return r.value > 0; })
      .sort(function (a, b) { return b.value - a.value; });
  }
  function branchCompare(days) {
    var from = U.dkey(U.addDays(new Date(), -(days || 30)));
    return state.branches.map(function (b) {
      var rev = state.transactions.reduce(function (a, t) {
        return (t.type === 'income' && t.branchId === b.id && t.date >= from) ? a + t.amount : a;
      }, 0);
      return { branch: b, value: rev, occupancy: occupancy(U.dkey(new Date()), b.id) };
    });
  }
  function retention(branchId) {
    var pool = state.clients.filter(function (c) { return branchId === 'all' || c.branchId === branchId; });
    var repeat = pool.filter(function (c) { return c.visits > 1; }).length;
    return { total: pool.length, repeat: repeat, rate: pool.length ? Math.round(repeat / pool.length * 100) : 0 };
  }
  function topProducts(branchId, days) {
    var from = U.dkey(U.addDays(new Date(), -(days || 30)));
    var map = {};
    state.transactions.forEach(function (t) {
      if (t.type !== 'income' || !inBranch(t, branchId) || t.date < from) return;
      (t.items || []).forEach(function (it) {
        if (it.kind !== 'product') return;
        var r = map[it.id] || (map[it.id] = { qty: 0, amount: 0 });
        r.qty += it.qty || 1; r.amount += it.amount;
      });
    });
    return Object.keys(map).map(function (id) { return { product: S.product(id), qty: map[id].qty, amount: map[id].amount }; })
      .filter(function (r) { return r.product; })
      .sort(function (a, b) { return b.amount - a.amount; });
  }

  /* --------------------------------------------------------------- expose -- */
  load();

  B.store = {
    get state() { return state; },
    sub: sub, emit: emit, reset: reset, persist: persist,
    S: S, nameOf: nameOf, catOfService: catOfService, catVar: catVar, catVarOfService: catVarOfService,
    serviceNames: serviceNames, servicesDuration: servicesDuration, servicesPrice: servicesPrice,
    staffOfBranch: staffOfBranch, staffForService: staffForService, staffWorksOn: staffWorksOn,
    appointmentsOn: appointmentsOn, activeAppointments: activeAppointments,
    stockOf: stockOf, lowStock: lowStock,
    slotsFor: slotsFor, isFree: isFree, busyOf: busyOf,
    book: book, quickBook: quickBook, setStatus: setStatus, cancel: cancel, reschedule: reschedule,
    checkout: checkout, sellProducts: sellProducts, receiveStock: receiveStock,
    gapCandidates: gapCandidates, fillGap: fillGap,
    lapsedClients: lapsedClients, birthdaysSoon: birthdaysSoon, runCampaign: runCampaign, logMessage: logMessage,
    revenueOn: revenueOn, expenseOn: expenseOn, revenueSeries: revenueSeries, occupancy: occupancy,
    kpis: kpis, payroll: payroll, serviceMix: serviceMix, branchCompare: branchCompare,
    retention: retention, topProducts: topProducts,
    get branchId() { return state.settings.branchId; },
    setBranch: function (id) { state.settings.branchId = id; emit({ type: 'branch', id: id }); }
  };
})();
