/* ==========================================================================
   Bellinaya — salon panel
   ========================================================================== */
(function () {
  var el = B.dom.el, clear = B.dom.clear, $ = B.dom.$, $$ = B.dom.$$;
  var U = B.util, st = B.store, icon = B.icon;

  var page = 'overview';
  var host, titleEl, subEl, toolsEl;
  var jstate = { date: U.dkey(new Date()), view: 'day' };

  var PAGES = [
    { id: 'overview', key: 'nav.overview', icon: 'overview', group: 'work' },
    { id: 'journal', key: 'nav.journal', icon: 'journal', group: 'work' },
    { id: 'clients', key: 'nav.clients', icon: 'clients', group: 'work' },
    { id: 'services', key: 'nav.services', icon: 'services', group: 'work' },
    { id: 'products', key: 'nav.products', icon: 'products', group: 'money' },
    { id: 'cash', key: 'nav.cash', icon: 'cash', group: 'money' },
    { id: 'payroll', key: 'nav.payroll', icon: 'payroll', group: 'money' },
    { id: 'marketing', key: 'nav.marketing', icon: 'marketing', group: 'grow' },
    { id: 'analytics', key: 'nav.analytics', icon: 'analytics', group: 'grow' },
    { id: 'staff', key: 'nav.staff', icon: 'staff', group: 'setup' },
    { id: 'settings', key: 'nav.settings', icon: 'settings', group: 'setup' }
  ];

  /* =============================================================== chrome */
  function bid() { return st.branchId; }
  function branchLabel() {
    return bid() === 'all' ? B.i18n.t('branch.all') : st.S.branch(bid()).short;
  }

  function buildRail() {
    var nav = el('nav', { class: 'rail__nav', 'aria-label': 'Əsas menyu' });
    var groups = [['work', 'nav.group.work'], ['money', 'nav.group.money'], ['grow', 'nav.group.grow'], ['setup', 'nav.group.setup']];
    groups.forEach(function (g) {
      nav.appendChild(el('div', { class: 'rail__section', text: B.i18n.t(g[1]) }));
      PAGES.filter(function (p) { return p.group === g[0]; }).forEach(function (p) {
        var count = null;
        if (p.id === 'journal') {
          count = st.appointmentsOn(U.dkey(new Date()), bid()).filter(function (a) { return a.status === 'pending'; }).length || null;
        }
        if (p.id === 'products') {
          count = st.lowStock(bid()).length || null;
        }
        nav.appendChild(el('a', {
          class: 'navlink', href: '#' + p.id, 'aria-current': page === p.id ? 'page' : null,
          onclick: function (e) { e.preventDefault(); go(p.id); }
        }, [
          el('span', { html: icon(p.icon) }),
          el('span', { class: 'navlink__label', text: B.i18n.t(p.key) }),
          count ? el('span', { class: 'navlink__count', text: count + '' }) : null
        ]));
      });
    });
    return nav;
  }

  function refreshRail() {
    var rail = $('.rail'); if (!rail) return;
    var old = rail.querySelector('.rail__nav');
    if (old) rail.replaceChild(buildRail(), old);
  }

  function branchMenu(anchor) {
    var items = [{ id: 'all', name: B.i18n.t('branch.all'), color: 'var(--ink-3)' }]
      .concat(st.state.branches.map(function (b) { return { id: b.id, name: b.short, color: b.color, addr: b.address }; }));
    var m = B.ui.modal({
      title: 'Filial seçin',
      body: el('div', { class: 'picker' }, items.map(function (it) {
        return el('button', {
          class: 'picker__row', onclick: function () {
            st.setBranch(it.id); m.close();
          }
        }, [
          el('span', { style: { width: '.625rem', height: '.625rem', borderRadius: '99px', background: it.color, flex: 'none' } }),
          el('span', { style: { flex: 1, minWidth: 0 } }, [
            el('b', { text: it.name }),
            it.addr ? el('small', { text: it.addr }) : null
          ]),
          bid() === it.id ? el('span', { style: { color: 'var(--accent)' }, html: icon('check') }) : null
        ]);
      }))
    });
  }

  /* ============================================================ page shell */
  function go(id) {
    page = id;
    location.hash = id;
    render();
    refreshRail();
    var tb = $('.tabbar'); if (tb) paintTabbar(tb);
  }

  function paintTabbar(tb) {
    var inner = tb.querySelector('.tabbar__inner') || el('div', { class: 'tabbar__inner' });
    clear(inner);
    ['overview', 'journal', 'clients', 'products', 'analytics'].forEach(function (id) {
      var p = PAGES.filter(function (x) { return x.id === id; })[0];
      inner.appendChild(el('a', {
        href: '#' + id, 'aria-current': page === id ? 'page' : null,
        onclick: function (e) { e.preventDefault(); go(id); }
      }, [el('span', { html: icon(p.icon) }), el('span', { text: B.i18n.t(p.key) })]));
    });
    if (!inner.parentNode) tb.appendChild(inner);
  }

  function setTitle(t, s) { titleEl.textContent = t; subEl.textContent = s || ''; }

  function render() {
    clear(host); clear(toolsEl);
    var p = PAGES.filter(function (x) { return x.id === page; })[0] || PAGES[0];
    setTitle(B.i18n.t(p.key), branchLabel());

    toolsEl.appendChild(el('button', {
      class: 'branchsel', onclick: branchMenu, title: 'Filial'
    }, [
      el('span', { class: 'branchsel__dot', style: { background: bid() === 'all' ? 'var(--ink-3)' : st.S.branch(bid()).color } }),
      el('span', { text: branchLabel() }),
      el('span', { style: { width: '.75rem', height: '.75rem', color: 'var(--ink-3)' }, html: icon('chevronD') })
    ]));
    toolsEl.appendChild(el('button', {
      class: 'searchbtn', onclick: B.cmdk.open
    }, [el('span', { html: icon('search') }), el('span', { text: B.i18n.t('search.placeholder') }), el('span', { class: 'kbd', text: 'Ctrl K' })]));
    toolsEl.appendChild(el('button', {
      class: 'btn btn--primary btn--sm', onclick: function () { openQuickBook(); }
    }, [el('span', { html: icon('plus') }), el('span', { class: 'hide-sm', text: 'Yazılış' })]));

    var fn = {
      overview: pageOverview, journal: pageJournal, clients: pageClients, services: pageServices,
      products: pageProducts, cash: pageCash, payroll: pagePayroll, marketing: pageMarketing,
      analytics: pageAnalytics, staff: pageStaff, settings: pageSettings
    }[page] || pageOverview;
    host.appendChild(fn());
  }

  /* ============================================================== OVERVIEW */
  function pageOverview() {
    var k = st.kpis(bid());
    var wrap = el('div', { class: 'page' });
    var today = U.dkey(new Date());

    var earned = k.revenue > 0;
    var line = k.appointments === 0
      ? 'Bu gün üçün hələ yazılış yoxdur.'
      : (earned
        ? 'Bu gün ' + k.appointments + ' yazılış var, ' + k.done + '-i tamamlanıb. Doluluq ' + k.occupancy + '%.'
        : 'Gün yenicə başlayır: ' + k.appointments + ' yazılış gözlənilir. Doluluq ' + k.occupancy + '%.');

    var brief = el('div', { class: 'daybrief' }, [
      el('div', { class: 'daybrief__main' }, [
        el('div', { class: 'eyebrow', text: B.i18n.dateLabel(new Date()) }),
        el('div', { class: 'daybrief__line' }, [
          earned ? 'Bu gün ' : 'Bu gün gözlənilir ',
          el('b', { text: U.money(earned ? k.revenue : k.expected) }),
          earned ? ' gəlir. ' : '. ',
          el('span', { class: 'muted', style: { fontSize: 'var(--t-md)', fontWeight: '400' }, text: line })
        ]),
        el('div', { class: 'daybrief__stats' }, [
          stat('Yazılış', k.appointments + '', k.pending ? k.pending + ' təsdiq gözləyir' : 'hamısı təsdiqlidir'),
          earned ? stat('Orta çek', U.money(k.avgCheck), k.done + ' ödəniş')
            : stat('Gözlənilən', U.money(k.expected), 'bugünkü yazılışlara görə'),
          stat('Doluluq', k.occupancy + '%', 'ustaların iş vaxtına görə'),
          /* the day-over-day figure only means something once money has come in */
          earned
            ? stat('Dünənlə fərq', (k.revenueDelta >= 0 ? '+' : '') + k.revenueDelta + '%', 'gəlir üzrə', k.revenueDelta >= 0)
            : stat('Dünən', U.money(st.revenueOn(U.dkey(U.addDays(new Date(), -1)), bid())), 'müqayisə üçün')
        ])
      ]),
      el('div', { class: 'daybrief__chart' }, [
        el('div', { class: 'eyebrow', text: 'Son 14 gün' }),
        areaChart(st.revenueSeries(14, bid()), { height: 132 })
      ])
    ]);
    wrap.appendChild(brief);

    /* alerts that actually need a decision */
    var alerts = [];
    var pend = st.appointmentsOn(today, bid()).filter(function (a) { return a.status === 'pending'; });
    if (pend.length) alerts.push(alertRow('accent', 'bell', pend.length + ' yazılış təsdiq gözləyir',
      'Onlayn gələn müraciətlər. Təsdiqləyin ki, müştəriyə bildiriş getsin.', 'Jurnala keç', function () { go('journal'); }));

    var low = st.lowStock(bid());
    if (low.length) alerts.push(alertRow(low[0].qty === 0 ? 'danger' : 'warn', 'box', low.length + ' məhsulun qalığı azdır',
      low.slice(0, 3).map(function (r) { return r.product.name + ' (' + r.qty + ')'; }).join(', '), 'Anbara keç', function () { go('products'); }));

    var bdays = st.birthdaysSoon(5);
    if (bdays.length) alerts.push(alertRow('info', 'gift', bdays.length + ' müştərinin ad günü yaxınlaşır',
      bdays.slice(0, 3).map(function (b) { return b.client.name + (b.inDays === 0 ? ' (bu gün)' : ' (' + b.inDays + ' gün)'); }).join(', '),
      'Təbrik göndər', function () { go('marketing'); }));

    var lapsed = st.lapsedClients(60);
    if (lapsed.length) alerts.push(alertRow('warn', 'refresh', lapsed.length + ' müştəri 60 gündən çoxdur gəlmir',
      'Avtomatik geri qaytarma mesajı ilə bir hissəsini qaytarmaq olar.', 'Kampaniyaya bax', function () { go('marketing'); }));

    var orders = st.state.productOrders.filter(function (o) { return o.status === 'new'; });
    if (orders.length) alerts.push(alertRow('accent', 'cart', orders.length + ' yeni məhsul sifarişi',
      'Müştəri onlayn sifariş verib, salondan götürəcək.', 'Sifarişlərə bax', function () { go('products'); }));

    if (alerts.length) {
      wrap.appendChild(el('div', { class: 'sec' }, [
        el('div', { class: 'sec__head' }, el('div', { class: 'sec__title', text: 'Diqqət tələb edir' })),
        el('div', { class: 'alerts' }, alerts)
      ]));
    }

    /* up next + today's team */
    var now = U.nowMin();
    var next = st.appointmentsOn(today, bid())
      .filter(function (a) { return a.status !== 'cancelled' && a.start + a.duration >= now; })
      .sort(function (a, b) { return a.start - b.start; }).slice(0, 7);

    wrap.appendChild(el('div', { class: 'grid grid--sidebar' }, [
      el('div', { class: 'panel' }, [
        el('div', { class: 'panel__head' }, [
          el('div', { class: 'panel__title', text: 'Növbəti müştərilər' }),
          el('button', { class: 'btn btn--ghost btn--sm', text: 'Jurnal', onclick: function () { go('journal'); } })
        ]),
        el('div', { class: 'panel__body panel__body--flush' },
          next.length ? el('div', { class: 'upnext' }, next.map(function (a) {
            var c = st.S.client(a.clientId);
            return el('div', { class: 'upnext__row', onclick: function () { openAppointment(a.id); } }, [
              el('div', { class: 'upnext__time num', text: U.hhmm(a.start) }),
              el('div', { class: 'upnext__rail', style: { background: st.catVarOfService(a.serviceIds[0]) } }),
              el('div', { class: 'upnext__who' }, [
                el('div', { class: 'upnext__name', text: c ? c.name : '—' }),
                el('div', { class: 'upnext__svc', text: st.serviceNames(a.serviceIds) + ' · ' + st.S.staff(a.staffId).name })
              ]),
              statusBadge(a.status)
            ]);
          })) : el('div', { class: 'empty', text: 'Bu gün üçün başqa yazılış yoxdur' })
        )
      ]),
      el('div', { class: 'panel' }, [
        el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Bugünkü komanda' })),
        el('div', { class: 'panel__body', style: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' } },
          st.staffOfBranch(bid()).filter(function (s) { return st.staffWorksOn(s, new Date()); }).slice(0, 8).map(function (s) {
            var cnt = st.appointmentsOn(today, bid()).filter(function (a) { return a.staffId === s.id && a.status !== 'cancelled'; }).length;
            var occ = Math.min(100, Math.round(cnt / 8 * 100));
            return el('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--s3)' } }, [
              el('span', { class: 'avatar avatar--sm', text: U.initials(s.name) }),
              el('span', { style: { flex: 1, minWidth: 0 } }, [
                el('span', { class: 'truncate', style: { display: 'block', fontSize: 'var(--t-sm)', fontWeight: '550' }, text: s.name }),
                el('span', { class: 'dim', style: { fontSize: 'var(--t-xs)' }, text: s.role })
              ]),
              el('span', { class: 'badge badge--neutral num', text: cnt + '' })
            ]);
          })
        )
      ])
    ]));
    return wrap;
  }

  function stat(label, value, sub, up) {
    return el('div', { class: 'stat' }, [
      el('div', { class: 'stat__label', text: label }),
      el('div', { class: 'stat__value', text: value }),
      el('div', { class: sub && up !== undefined ? ('stat__delta ' + (up ? 'stat__delta--up' : 'stat__delta--down')) : 'stat__label', text: sub || '' })
    ]);
  }
  function alertRow(kind, ic, title, text, action, run) {
    return el('div', { class: 'alert alert--' + kind }, [
      el('div', { class: 'alert__icon', html: icon(ic) }),
      el('div', { class: 'alert__body' }, [
        el('div', { class: 'alert__title', text: title }),
        el('div', { class: 'alert__text', text: text })
      ]),
      el('button', { class: 'btn btn--sm btn--secondary', text: action, onclick: run })
    ]);
  }
  function statusBadge(s) {
    var map = {
      pending: ['warn', 'st.pending'], confirmed: ['ok', 'st.confirmed'], arrived: ['info', 'st.arrived'],
      paid: ['neutral', 'st.paid'], cancelled: ['danger', 'st.cancelled'], noshow: ['danger', 'st.noshow']
    }[s] || ['neutral', 'st.confirmed'];
    return el('span', { class: 'badge badge--' + map[0], text: B.i18n.t(map[1]) });
  }

  /* =============================================================== JOURNAL */
  function pageJournal() {
    var wrap = el('div', { class: 'page page--flush journal' });
    var date = U.fromKey(jstate.date);

    var bar = el('div', { class: 'journal__bar' }, [
      el('div', { class: 'datenav' }, [
        el('button', { class: 'btn btn--ghost btn--icon btn--sm', 'aria-label': 'Əvvəlki', html: icon('chevronL'), onclick: function () { shift(-1); } }),
        el('div', { class: 'datenav__label', text: B.i18n.dateLabel(date) }),
        el('button', { class: 'btn btn--ghost btn--icon btn--sm', 'aria-label': 'Növbəti', html: icon('chevronR'), onclick: function () { shift(1); } })
      ]),
      el('button', { class: 'btn btn--secondary btn--sm', text: B.i18n.t('common.today'), onclick: function () { jstate.date = U.dkey(new Date()); render(); } }),
      el('div', { class: 'toolbar__spacer' }),
      el('div', { class: 'seg', role: 'tablist' }, [
        segBtn('day', 'Gün'), segBtn('week', 'Həftə'), segBtn('list', 'Siyahı')
      ])
    ]);
    wrap.appendChild(bar);

    if (jstate.view === 'day') {
      wrap.appendChild(dayStrip());
      wrap.appendChild(calendarDay());
    } else if (jstate.view === 'week') {
      wrap.appendChild(calendarWeek());
    } else {
      wrap.appendChild(calendarList());
    }
    return wrap;

    function shift(n) {
      var step = jstate.view === 'week' ? 7 : 1;
      jstate.date = U.dkey(U.addDays(U.fromKey(jstate.date), n * step));
      render();
    }
    function segBtn(v, label) {
      return el('button', {
        class: 'seg__btn', role: 'tab', 'aria-selected': jstate.view === v ? 'true' : 'false',
        text: label, onclick: function () { jstate.view = v; render(); }
      });
    }
  }

  function dayStrip() {
    var strip = el('div', { class: 'daystrip' });
    var base = U.startOfWeek(U.fromKey(jstate.date));
    for (var i = -7; i < 21; i++) {
      (function (d) {
        var key = U.dkey(d);
        var appts = st.appointmentsOn(key, bid()).filter(function (a) { return a.status !== 'cancelled'; });
        var occ = st.occupancy(key, bid());
        strip.appendChild(el('button', {
          class: 'daystrip__day', 'aria-pressed': key === jstate.date ? 'true' : 'false',
          'data-today': U.sameDay(d, new Date()) ? '' : null,
          onclick: function () { jstate.date = key; render(); }
        }, [
          el('span', { text: B.i18n.dow((d.getDay() + 6) % 7) }),
          el('b', { text: d.getDate() + '' }),
          el('span', { class: 'daystrip__load' }, el('i', { style: { width: Math.min(100, occ) + '%' } }))
        ]));
      })(U.addDays(base, i));
    }
    setTimeout(function () {
      var sel = strip.querySelector('[aria-pressed="true"]');
      if (sel) strip.scrollLeft = sel.offsetLeft - strip.clientWidth / 2 + sel.clientWidth / 2;
    }, 0);
    return strip;
  }

  function calendarDay() {
    var dateKey = jstate.date;
    var date = U.fromKey(dateKey);
    var staff = st.staffOfBranch(bid()).filter(function (s) { return st.staffWorksOn(s, date); });
    if (!staff.length) {
      return el('div', { class: 'empty' }, [
        el('div', { class: 'empty__icon', html: icon('clock') }),
        el('div', { class: 'empty__title', text: 'Bu gün salon bağlıdır' }),
        el('div', { class: 'dim', text: 'Bazar günü işləmirik.' })
      ]);
    }
    var openM = 9 * 60, closeM = 21 * 60;
    st.state.branches.forEach(function (b) {
      if (bid() !== 'all' && b.id !== bid()) return;
      openM = Math.min(openM, U.minOf(b.open)); closeM = Math.max(closeM, U.minOf(b.close));
    });
    var rows = (closeM - openM) / 15;

    var scroll = el('div', { class: 'cal__scroll' });
    var inner = el('div', {
      class: 'cal__inner',
      /* repeat() needs a literal count — a CSS variable is not allowed there */
      style: { gridTemplateColumns: '3.75rem repeat(' + staff.length + ', minmax(var(--calendar-col-min), 1fr))' }
    });

    inner.appendChild(el('div', { class: 'cal__corner' }));
    staff.forEach(function (s) {
      var cnt = st.appointmentsOn(dateKey, bid()).filter(function (a) { return a.staffId === s.id && a.status !== 'cancelled'; }).length;
      inner.appendChild(el('div', { class: 'cal__head' }, [
        el('span', { class: 'avatar avatar--sm', text: U.initials(s.name) }),
        el('span', { style: { minWidth: 0 } }, [
          el('span', { class: 'cal__head-name truncate', style: { display: 'block' }, text: s.name }),
          el('span', { class: 'cal__head-role truncate', style: { display: 'block' }, text: s.role })
        ]),
        el('span', { class: 'cal__head-badge num', text: cnt + '' })
      ]));
    });

    /* time gutter */
    var gutter = el('div', { class: 'cal__gutter' });
    for (var m = openM; m < closeM; m += 60) {
      gutter.appendChild(el('div', { class: 'cal__hour' }, el('span', { text: U.hhmm(m) })));
    }
    inner.appendChild(gutter);

    /* columns */
    staff.forEach(function (s) {
      var col = el('div', {
        class: 'cal__col', 'data-staff': s.id,
        style: { '--branch-tint': st.S.branch(s.branchId).color }
      });
      col.setAttribute('data-branch', s.branchId);
      var shiftS = U.minOf(s.shift.start), shiftE = U.minOf(s.shift.end);
      for (var t = openM; t < closeM; t += 15) {
        (function (tt) {
          var off = tt < shiftS || tt >= shiftE;
          col.appendChild(el('div', {
            class: 'cal__cell', 'data-hour': tt % 60 === 0 ? '' : null, 'data-off': off ? '' : null,
            onclick: off ? null : function () { openQuickBook({ staffId: s.id, date: dateKey, start: tt }); }
          }));
        })(t);
      }
      /* appointments */
      st.appointmentsOn(dateKey, bid()).filter(function (a) { return a.staffId === s.id; }).forEach(function (a) {
        col.appendChild(apptNode(a, openM));
      });
      /* now line */
      if (U.sameDay(date, new Date())) {
        var nm = U.nowMin();
        if (nm >= openM && nm <= closeM) {
          col.appendChild(el('div', { class: 'cal__now', style: { top: ((nm - openM) / 15 * 2.75) + 'rem' } }));
        }
      }
      inner.appendChild(col);
    });

    scroll.appendChild(inner);
    var calNode = el('div', { class: 'cal' }, scroll);
    enableDrag(inner, openM, dateKey);
    setTimeout(function () {
      var target = U.sameDay(date, new Date()) ? U.nowMin() - 90 : 9 * 60;
      scroll.scrollTop = Math.max(0, (target - openM) / 15 * 44 - 40);
    }, 0);
    return calNode;
  }

  function apptNode(a, openM) {
    var c = st.S.client(a.clientId);
    var col = st.catVarOfService(a.serviceIds[0]);
    var top = (a.start - openM) / 15 * 2.75;
    var h = a.duration / 15 * 2.75;
    var isNew = a.isNew; if (isNew) delete a.isNew;
    var node = el('div', {
      class: 'appt', 'data-id': a.id, 'data-status': a.status,
      'data-short': h < 3.4 ? '' : null, 'data-tiny': h < 2.2 ? '' : null,
      'data-new': isNew ? '' : null,
      style: {
        top: top + 'rem', height: (h - .15) + 'rem',
        '--appt-rail': col,
        '--appt-bg': 'color-mix(in oklab, ' + col + ' var(--cat-tint), var(--surface))',
        '--appt-line': 'color-mix(in oklab, ' + col + ' 32%, transparent)',
        '--appt-ink': col
      },
      onclick: function (e) { if (!node.hasAttribute('data-moved')) openAppointment(a.id); }
    }, [
      el('div', { class: 'appt__time' }, [
        a.source === 'online' ? el('span', { class: 'appt__src', title: 'Müştəri özü yazılıb' }) : null,
        U.hhmm(a.start) + '–' + U.hhmm(a.start + a.duration)
      ]),
      el('div', { class: 'appt__name', text: c ? c.name : '—' }),
      el('div', { class: 'appt__svc', text: st.serviceNames(a.serviceIds) })
    ]);
    return node;
  }

  /* drag to move an appointment between times / specialists */
  function enableDrag(inner, openM, dateKey) {
    var drag = null;
    inner.addEventListener('pointerdown', function (e) {
      var node = e.target.closest ? e.target.closest('.appt') : null;
      if (!node) return;
      var a = st.S.appointment(node.getAttribute('data-id'));
      if (!a || a.status === 'paid' || a.status === 'cancelled') return;
      drag = { node: node, a: a, x0: e.clientX, y0: e.clientY, moved: false, ghost: null };
      node.setPointerCapture(e.pointerId);
    });
    inner.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        drag.node.setAttribute('data-dragging', '');
        drag.node.setAttribute('data-moved', '');
        drag.ghost = el('div', { class: 'appt-ghost', style: { height: drag.node.style.height } });
      }
      var target = document.elementFromPoint(e.clientX, e.clientY);
      var cell = target && target.closest ? target.closest('.cal__cell') : null;
      var col = target && target.closest ? target.closest('.cal__col') : null;
      if (!cell || !col || cell.hasAttribute('data-off')) return;
      var idx = Array.prototype.indexOf.call(col.querySelectorAll('.cal__cell'), cell);
      drag.newStart = openM + idx * 15;
      drag.newStaff = col.getAttribute('data-staff');
      col.appendChild(drag.ghost);
      drag.ghost.style.top = (idx * 2.75) + 'rem';
    });
    inner.addEventListener('pointerup', function (e) {
      if (!drag) return;
      var d = drag; drag = null;
      d.node.removeAttribute('data-dragging');
      if (d.ghost && d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
      setTimeout(function () { d.node.removeAttribute('data-moved'); }, 60);
      if (!d.moved || d.newStart == null) return;
      if (d.newStart === d.a.start && d.newStaff === d.a.staffId) return;
      var r = st.reschedule(d.a.id, { date: dateKey, start: d.newStart, staffId: d.newStaff });
      if (!r.ok) { B.ui.toast({ kind: 'warn', title: 'Bu vaxt tutulub', text: 'Yazılış köçürülmədi.' }); render(); return; }
      B.ui.toast({
        kind: 'ok', title: 'Vaxt dəyişdirildi',
        text: st.S.client(d.a.clientId).name + ' — ' + U.hhmm(d.newStart) + ', ' + st.S.staff(d.newStaff).name + '. Müştəriyə bildiriş getdi.'
      });
      render();
    });
    inner.addEventListener('pointercancel', function () { if (drag && drag.ghost && drag.ghost.parentNode) drag.ghost.parentNode.removeChild(drag.ghost); drag = null; });
  }

  function calendarWeek() {
    var start = U.startOfWeek(U.fromKey(jstate.date));
    var grid = el('div', { class: 'calweek' });
    for (var i = 0; i < 7; i++) {
      (function (d) {
        var key = U.dkey(d);
        var list = st.appointmentsOn(key, bid()).filter(function (a) { return a.status !== 'cancelled'; })
          .sort(function (a, b) { return a.start - b.start; });
        var sum = list.reduce(function (acc, a) { return acc + a.price; }, 0);
        grid.appendChild(el('div', { class: 'calweek__day', 'data-today': U.sameDay(d, new Date()) ? '' : null }, [
          el('div', { class: 'calweek__head' }, [
            el('span', { class: 'calweek__dow', text: B.i18n.dow((d.getDay() + 6) % 7) }),
            el('span', { class: 'calweek__num', text: d.getDate() + '' }),
            el('span', { class: 'calweek__sum', text: list.length ? U.money(sum) : '' })
          ]),
          el('div', { class: 'calweek__list' }, list.length ? list.map(function (a) {
            var c = st.S.client(a.clientId), col = st.catVarOfService(a.serviceIds[0]);
            return el('div', {
              class: 'wappt', style: { '--appt-rail': col, '--appt-bg': 'color-mix(in oklab,' + col + ' var(--cat-tint),var(--surface))' },
              onclick: function () { openAppointment(a.id); }
            }, [el('b', { text: U.hhmm(a.start) }), el('span', { text: c ? c.name : '' })]);
          }) : el('div', { class: 'dim', style: { fontSize: 'var(--t-xs)', padding: 'var(--s2)' }, text: d.getDay() === 0 ? 'Bağlıdır' : '—' }))
        ]));
      })(U.addDays(start, i));
    }
    return grid;
  }

  function calendarList() {
    var box = el('div', { class: 'callist' });
    var from = U.fromKey(jstate.date);
    var any = false;
    for (var i = 0; i < 10; i++) {
      var d = U.addDays(from, i), key = U.dkey(d);
      var list = st.appointmentsOn(key, bid()).sort(function (a, b) { return a.start - b.start; });
      if (!list.length) continue;
      any = true;
      box.appendChild(el('div', { class: 'callist__group', text: B.i18n.dateLabel(d) }));
      list.forEach(function (a) {
        var c = st.S.client(a.clientId);
        box.appendChild(el('div', { class: 'listrow', onclick: function () { openAppointment(a.id); } }, [
          el('div', { class: 'upnext__time num', text: U.hhmm(a.start) }),
          el('div', { class: 'upnext__rail', style: { background: st.catVarOfService(a.serviceIds[0]) } }),
          el('div', { class: 'listrow__main' }, [
            el('div', { class: 'listrow__title', text: c ? c.name : '—' }),
            el('div', { class: 'listrow__sub', text: st.serviceNames(a.serviceIds) + ' · ' + st.S.staff(a.staffId).name + ' · ' + st.S.branch(a.branchId).short })
          ]),
          el('div', { class: 'listrow__end' }, [
            el('div', { class: 'listrow__amt', text: U.money(a.price) }),
            statusBadge(a.status)
          ])
        ]));
      });
    }
    if (!any) box.appendChild(el('div', { class: 'empty', text: 'Bu dövrdə yazılış yoxdur' }));
    return box;
  }

  /* ================================================= appointment inspector */
  function openAppointment(id) {
    var a = st.S.appointment(id); if (!a) return;
    var c = st.S.client(a.clientId), s = st.S.staff(a.staffId), br = st.S.branch(a.branchId);

    var statusRow = el('div', { class: 'statusflow' }, [
      ['pending', 'Gözləyir'], ['confirmed', 'Təsdiq'], ['arrived', 'Gəldi'], ['noshow', 'Gəlmədi']
    ].map(function (p) {
      return el('button', {
        'aria-pressed': a.status === p[0] ? 'true' : 'false', text: p[1],
        onclick: function () {
          st.setStatus(a.id, p[0]);
          B.ui.closeDrawer();
          B.ui.toast({ kind: p[0] === 'noshow' ? 'warn' : 'ok', title: 'Status: ' + B.i18n.t('st.' + p[0]) });
          render();
        }
      });
    }));

    var msgText = 'Salam, ' + (c ? c.name.split(' ')[0] : '') + '! Sabahkı yazılışınızı xatırladırıq: ' +
      st.serviceNames(a.serviceIds) + ' — ' + B.i18n.dateLabel(U.fromKey(a.date), { plain: true }) +
      ', saat ' + U.hhmm(a.start) + '. ' + br.name + '. Gələ bilməyəcəksinizsə xəbər verin.';

    B.ui.drawer({
      eyebrow: B.i18n.dateLabel(U.fromKey(a.date)) + ' · ' + U.hhmm(a.start),
      title: c ? c.name : '—',
      subtitle: st.serviceNames(a.serviceIds),
      body: [
        el('div', { class: 'insp__hero' }, [
          el('span', { class: 'avatar avatar--lg', text: U.initials(c ? c.name : '?') }),
          el('div', { style: { flex: 1, minWidth: 0 } }, [
            el('div', { style: { display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', marginBottom: '.25rem' } }, [
              statusBadge(a.status),
              el('span', { class: 'badge badge--neutral', text: B.i18n.t('src.' + a.source) }),
              c && c.noShows ? el('span', { class: 'badge badge--danger' }, [el('span', { html: icon('warning') }), c.noShows + ' dəfə gəlməyib']) : null
            ]),
            el('div', { class: 'dim', style: { fontSize: 'var(--t-sm)' }, text: c ? U.phoneFmt(c.phone) : '' }),
            el('div', { class: 'dim', style: { fontSize: 'var(--t-xs)' }, text: c ? (c.visits + ' səfər · ' + U.money(c.totalSpend) + ' ümumi · bonus ' + U.money(c.bonus)) : '' })
          ])
        ]),
        statusRow,
        el('dl', { class: 'insp__rows' }, [
          irow('Xidmət', st.serviceNames(a.serviceIds)),
          irow('Usta', s.name + ' · ' + s.role),
          irow('Filial', br.short),
          irow('Müddət', a.duration + ' dəq'),
          irow('Məbləğ', U.money(a.price)),
          a.note ? irow('Qeyd', a.note) : null
        ]),
        c && c.note ? el('div', { class: 'card card--pad', style: { background: 'var(--warn-soft)', borderColor: 'var(--warn-line)' } }, [
          el('div', { class: 'eyebrow', style: { color: 'var(--warn)' }, text: 'Müştəri haqqında qeyd' }),
          el('div', { style: { fontSize: 'var(--t-sm)', marginTop: '.25rem' }, text: c.note })
        ]) : null,
        el('div', {}, [
          el('div', { class: 'eyebrow', style: { marginBottom: 'var(--s2)' }, text: 'Müştəriyə gedəcək mesaj' }),
          el('div', { class: 'msgprev' }, [
            el('div', { class: 'msgprev__head' }, [el('span', { html: icon('whatsapp') }), 'WhatsApp · ' + (c ? U.phoneFmt(c.phone) : '')]),
            el('div', { class: 'msgprev__bubble', text: msgText }),
            el('div', { class: 'msgprev__meta', text: 'Xatırlatma avtomatik olaraq görüşdən 24 və 3 saat əvvəl gedir.' })
          ]),
          el('button', {
            class: 'btn btn--secondary btn--sm', style: { marginTop: 'var(--s2)' },
            onclick: function () {
              st.logMessage({ channel: 'whatsapp', to: c.phone, name: c.name, kind: 'reminder', text: msgText });
              st.emit({ type: 'message' });
              B.ui.toast({ kind: 'ok', title: 'Mesaj göndərildi', text: c.name + ' — WhatsApp' });
            }
          }, [el('span', { html: icon('send') }), 'İndi göndər'])
        ])
      ],
      footer: [
        a.status !== 'paid' && a.status !== 'cancelled'
          ? el('button', { class: 'btn btn--primary', onclick: function () { B.ui.closeDrawer(); openCheckout(a); } }, [el('span', { html: icon('wallet') }), 'Ödəniş al'])
          : null,
        a.status !== 'cancelled' && a.status !== 'paid'
          ? el('button', {
            class: 'btn btn--danger', text: 'Ləğv et',
            onclick: function () {
              B.ui.closeDrawer();
              B.ui.confirm({ title: 'Yazılışı ləğv edək?', text: (c ? c.name : '') + ' — ' + U.hhmm(a.start), danger: true, confirmLabel: 'Ləğv et' })
                .then(function (ok) { if (ok) { st.cancel(a.id, { by: 'salon' }); render(); offerGapFill(a); } });
            }
          }) : null,
        a.status === 'paid' ? el('button', { class: 'btn btn--secondary', text: 'Çekə bax', onclick: function () { showReceipt(a); } }) : null
      ].filter(Boolean)
    });
  }
  function irow(k, v) { return el('div', { class: 'insp__row' }, [el('dt', { text: k }), el('dd', { text: v })]); }

  /* --------------------------------------------------- the gap-fill moment */
  function offerGapFill(a) {
    var cands = st.gapCandidates(a);
    if (!cands.length) return;
    var m = B.ui.modal({
      eyebrow: 'Boş qalan yer',
      title: U.hhmm(a.start) + ' — ' + st.S.staff(a.staffId).name,
      body: [
        el('div', { class: 'gapcard' }, [
          el('div', { class: 'gapcard__title', text: cands.length + ' nəfər gözləmə siyahısındadır' }),
          el('p', { class: 'muted', style: { fontSize: 'var(--t-sm)' }, text: 'Bu yer boş qalmasın deyə hamısına eyni anda təklif göndərək. İlk cavab verən yeri tutur.' }),
          el('div', { style: { marginTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' } },
            cands.slice(0, 4).map(function (w) {
              var c = st.S.client(w.clientId);
              return el('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--s2)' } }, [
                el('span', { class: 'avatar avatar--sm', text: U.initials(c.name) }),
                el('span', { style: { flex: 1, minWidth: 0, fontSize: 'var(--t-sm)' } }, [
                  el('b', { text: c.name }),
                  el('span', { class: 'dim', style: { display: 'block', fontSize: 'var(--t-xs)' }, text: st.nameOf(st.S.service(w.serviceId)) + ' · ' + w.note })
                ])
              ]);
            })
          )
        ])
      ],
      footer: [
        el('button', { class: 'btn btn--secondary', text: 'İndi yox', onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--primary pulse', onclick: function (e) {
            var btn = e.currentTarget;
            btn.textContent = 'Göndərilir…'; btn.setAttribute('aria-disabled', 'true');
            st.fillGap(a, function (res) {
              m.close();
              if (!res) { B.ui.toast({ kind: 'warn', title: 'Cavab gəlmədi', text: 'Yer boş qaldı.' }); return; }
              B.ui.toast({
                kind: 'ok', duration: 7000,
                title: 'Boşluq dolduruldu — ' + U.money(res.saved) + ' xilas edildi',
                text: res.client.name + ' təklifi qəbul etdi və yazılış təsdiqləndi.',
                action: { label: 'Bax', run: function () { go('journal'); } }
              });
              render();
            });
          }
        }, [el('span', { html: icon('zap') }), 'Boşluğu doldur'])
      ]
    });
  }

  /* ============================================================== CHECKOUT */
  function openCheckout(a, opts) {
    opts = opts || {};
    var branchId = a ? a.branchId : (bid() === 'all' ? st.state.branches[0].id : bid());
    var lines = [];      /* products */
    var method = 'cash';
    var discount = 0, useBonus = 0;
    var client = a ? st.S.client(a.clientId) : (opts.clientId ? st.S.client(opts.clientId) : null);
    var body = el('div', { class: 'co' });

    function total() {
      var svc = a ? st.servicesPrice(a.serviceIds) : 0;
      var prod = lines.reduce(function (x, l) { return x + st.S.product(l.id).price * l.qty; }, 0);
      var gross = svc + prod;
      return { svc: svc, prod: prod, gross: gross, net: Math.max(0, gross - discount - useBonus) };
    }

    function paint() {
      clear(body);
      var t = total();

      var lineBox = el('div', { class: 'co__lines' });
      if (a) {
        lineBox.appendChild(el('div', { class: 'co__line' }, [
          el('span', { style: { width: '3px', alignSelf: 'stretch', borderRadius: '2px', background: st.catVarOfService(a.serviceIds[0]) } }),
          el('span', { class: 'co__line-name' }, [
            st.serviceNames(a.serviceIds),
            el('small', { text: st.S.staff(a.staffId).name + ' · ' + a.duration + ' dəq' })
          ]),
          el('span', { class: 'co__line-amt', text: U.money(t.svc) })
        ]));
      }
      lines.forEach(function (l, i) {
        var p = st.S.product(l.id);
        lineBox.appendChild(el('div', { class: 'co__line' }, [
          el('span', { style: { color: 'var(--ink-4)', width: '1rem' }, html: icon('box') }),
          el('span', { class: 'co__line-name' }, [p.name, el('small', { text: p.brand + ' · qalıq ' + st.stockOf(p.id, branchId) })]),
          el('span', { class: 'qty' }, [
            el('button', { html: icon('minus'), onclick: function () { l.qty--; if (l.qty <= 0) lines.splice(i, 1); paint(); } }),
            el('span', { text: l.qty + '' }),
            el('button', {
              html: icon('plus'), onclick: function () {
                if (l.qty >= st.stockOf(p.id, branchId)) { B.ui.toast({ kind: 'warn', title: 'Anbarda kifayət qədər yoxdur' }); return; }
                l.qty++; paint();
              }
            })
          ]),
          el('span', { class: 'co__line-amt', text: U.money(p.price * l.qty) })
        ]));
      });
      body.appendChild(lineBox);

      body.appendChild(el('button', {
        class: 'btn btn--secondary btn--block', onclick: function () { pickProduct(branchId, function (p) { addLine(p); }); }
      }, [el('span', { html: icon('plus') }), 'Kosmetika məhsulu əlavə et']));

      /* discount + bonus */
      var dInput = el('input', { class: 'input', type: 'number', min: '0', value: discount + '', style: { maxWidth: '7rem' } });
      dInput.addEventListener('input', function () { discount = Math.max(0, +dInput.value || 0); paintTotals(); });
      var maxBonus = client ? Math.min(client.bonus, t.gross - discount) : 0;
      var bBtn = el('button', {
        class: 'btn btn--soft btn--sm', 'aria-disabled': maxBonus > 0 ? null : 'true',
        text: useBonus ? 'Bonus ləğv et' : 'Bonusu işlət (' + U.money(maxBonus) + ')',
        onclick: function () { useBonus = useBonus ? 0 : maxBonus; paint(); }
      });
      body.appendChild(el('div', { style: { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-end', flexWrap: 'wrap' } }, [
        el('div', { class: 'field', style: { flex: '0 0 auto' } }, [el('label', { class: 'field__label', text: 'Endirim (₼)' }), dInput]),
        el('div', { style: { flex: 1, minWidth: '10rem' } }, bBtn)
      ]));

      var totalsBox = el('div', {});
      body.appendChild(totalsBox);
      function paintTotals() {
        clear(totalsBox);
        var tt = total();
        totalsBox.appendChild(el('div', { class: 'co__total' }, [
          el('span', {}, [
            el('div', { style: { fontSize: 'var(--t-sm)', fontWeight: '600' }, text: B.i18n.t('common.total') }),
            (discount || useBonus) ? el('div', { class: 'dim', style: { fontSize: 'var(--t-xs)' }, text: U.money(tt.gross) + ' − endirim ' + U.money(discount) + (useBonus ? ' − bonus ' + U.money(useBonus) : '') }) : null
          ]),
          el('b', { text: U.money(tt.net) })
        ]));
      }
      paintTotals();

      body.appendChild(el('div', {}, [
        el('div', { class: 'eyebrow', style: { marginBottom: 'var(--s2)' }, text: 'Ödəniş üsulu' }),
        el('div', { class: 'co__methods' }, [
          ['cash', 'Nağd', 'cash'], ['card', 'Kart', 'wallet'], ['bonus', 'Bonus', 'gift'], ['debt', 'Borc', 'receipt']
        ].map(function (mm) {
          return el('button', {
            class: 'co__method', 'aria-pressed': method === mm[0] ? 'true' : 'false',
            onclick: function () { method = mm[0]; paint(); }
          }, [el('span', { html: icon(mm[2]) }), mm[1]]);
        }))
      ]));

      body.appendChild(el('p', { class: 'dim', style: { fontSize: 'var(--t-xs)', lineHeight: '1.45' }, text: 'Rəsmi fiskal çek salonun kassa aparatından verilir. Bellinaya ödənişi qeyd edir və hesabatlara yazır.' }));
    }

    function addLine(p) {
      var ex = lines.filter(function (l) { return l.id === p.id; })[0];
      if (ex) ex.qty++; else lines.push({ id: p.id, qty: 1 });
      paint();
    }
    paint();

    var m = B.ui.modal({
      eyebrow: a ? (st.S.client(a.clientId).name + ' · ' + U.hhmm(a.start)) : 'Məhsul satışı',
      title: a ? 'Ödəniş' : 'Kassa — satış',
      body: body,
      footer: [
        el('button', { class: 'btn btn--secondary', text: B.i18n.t('common.cancel'), onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--primary', onclick: function () {
            var t = total();
            if (!a && !lines.length) { B.ui.toast({ kind: 'warn', title: 'Məhsul seçilməyib' }); return; }
            var tx = st.checkout({
              appointmentId: a ? a.id : null, branchId: branchId, products: lines,
              method: method, discount: discount, bonusUsed: useBonus,
              clientId: client ? client.id : null, staffId: a ? a.staffId : (opts.staffId || null)
            });
            m.close();
            B.ui.toast({
              kind: 'ok', duration: 6000, title: B.i18n.t('t.paid') + ' — ' + U.money(tx.amount),
              text: (lines.length ? 'Anbar qalığı azaldı. ' : '') + 'Ustanın faizi və kassa yeniləndi.',
              action: { label: 'Çek', run: function () { showReceipt(a, tx); } }
            });
            render();
          }
        }, [el('span', { html: icon('check') }), 'Ödənişi təsdiqlə'])
      ]
    });
  }

  function pickProduct(branchId, onPick) {
    var search = el('input', { class: 'input', placeholder: 'Məhsul axtar…' });
    var list = el('div', { class: 'picker' });
    function paint() {
      clear(list);
      var q = U.fold(search.value);
      st.state.products.filter(function (p) {
        return !q || U.fold(p.name + ' ' + p.brand).indexOf(q) >= 0;
      }).forEach(function (p) {
        var qty = st.stockOf(p.id, branchId);
        list.appendChild(el('button', {
          class: 'picker__row', disabled: qty <= 0 ? true : null,
          onclick: function () { onPick(p); m.close(); }
        }, [
          el('span', { style: { color: 'var(--ink-4)' }, html: icon('box') }),
          el('span', { style: { flex: 1, minWidth: 0 } }, [
            el('b', { text: p.name }), el('small', { text: p.brand + ' · qalıq ' + qty })
          ]),
          el('span', { class: 'amt', text: U.money(p.price) })
        ]));
      });
    }
    search.addEventListener('input', paint); paint();
    var m = B.ui.modal({ title: 'Məhsul seç', body: [search, list] });
    setTimeout(function () { search.focus(); }, 60);
  }

  function showReceipt(a, tx) {
    if (!tx) {
      tx = st.state.transactions.filter(function (t) { return a && t.appointmentId === a.id; }).pop();
    }
    if (!tx) return;
    var br = st.S.branch(tx.branchId);
    var rows = [];
    (tx.items || []).forEach(function (it) {
      rows.push(el('div', { class: 'receipt__row' }, [
        el('span', { text: it.label || (it.kind === 'product' ? st.S.product(it.id).name : st.serviceNames(it.ids)) }),
        el('span', { text: U.money(it.amount) })
      ]));
    });
    B.ui.modal({
      eyebrow: br.name, title: 'Ödəniş qəbzi',
      body: el('div', { class: 'receipt' }, [
        el('div', { class: 'receipt__row' }, [el('span', { text: 'Bellinaya' }), el('span', { text: B.i18n.dateLabel(new Date(), { plain: true }) })]),
        el('div', { class: 'receipt__row' }, [el('span', { text: br.short }), el('span', { text: U.hhmm(new Date().getHours() * 60 + new Date().getMinutes()) })]),
        el('div', { class: 'receipt__sep' }),
        rows,
        tx.discount ? el('div', { class: 'receipt__row' }, [el('span', { text: 'Endirim' }), el('span', { text: '−' + U.money(tx.discount) })]) : null,
        tx.bonusUsed ? el('div', { class: 'receipt__row' }, [el('span', { text: 'Bonus' }), el('span', { text: '−' + U.money(tx.bonusUsed) })]) : null,
        el('div', { class: 'receipt__sep' }),
        el('div', { class: 'receipt__row receipt__total' }, [el('span', { text: 'CƏMİ' }), el('span', { text: U.money(tx.amount) })]),
        el('div', { class: 'receipt__row' }, [el('span', { text: 'Üsul' }), el('span', { text: { cash: 'Nağd', card: 'Kart', bonus: 'Bonus', debt: 'Borc' }[tx.method] || tx.method })]),
        el('div', { class: 'receipt__sep' }),
        el('div', { style: { textAlign: 'center', color: 'var(--ink-3)' }, text: 'Fiskal çek kassa aparatından verilir' })
      ])
    });
  }

  /* ============================================================ QUICK BOOK */
  function openQuickBook(pre) {
    pre = pre || {};
    var branchId = pre.staffId ? st.S.staff(pre.staffId).branchId : (bid() === 'all' ? st.state.branches[0].id : bid());
    var sel = { clientId: null, serviceIds: [], staffId: pre.staffId || null, date: pre.date || jstate.date, start: pre.start != null ? pre.start : null };
    var body = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' } });

    function paint() {
      clear(body);
      /* client */
      var cl = sel.clientId ? st.S.client(sel.clientId) : null;
      body.appendChild(el('div', { class: 'field' }, [
        el('label', { class: 'field__label', text: 'Müştəri' }),
        el('button', { class: 'btn btn--secondary btn--block', style: { justifyContent: 'flex-start' }, onclick: pickClient }, [
          el('span', { html: icon('user') }), cl ? cl.name + ' · ' + U.phoneFmt(cl.phone) : 'Müştəri seçin və ya yeni əlavə edin'
        ])
      ]));
      /* services */
      body.appendChild(el('div', { class: 'field' }, [
        el('label', { class: 'field__label', text: 'Xidmət' }),
        el('button', { class: 'btn btn--secondary btn--block', style: { justifyContent: 'flex-start' }, onclick: pickServices }, [
          el('span', { html: icon('services') }),
          sel.serviceIds.length ? st.serviceNames(sel.serviceIds) + ' · ' + st.servicesDuration(sel.serviceIds) + ' dəq · ' + U.money(st.servicesPrice(sel.serviceIds)) : 'Xidmət seçin'
        ])
      ]));
      if (!sel.serviceIds.length) return;

      /* staff */
      var pool = st.staffForService(branchId, sel.serviceIds[0]);
      var staffSel = el('select', { class: 'select' }, [el('option', { value: '', text: '— usta seçin —' })].concat(
        pool.map(function (s) { return el('option', { value: s.id, text: s.name + ' · ' + s.role }); })
      ));
      if (sel.staffId) staffSel.value = sel.staffId;
      staffSel.addEventListener('change', function () { sel.staffId = staffSel.value; sel.start = null; paint(); });
      body.appendChild(el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Usta' }), staffSel]));
      if (!sel.staffId) return;

      /* date + slots */
      var days = [];
      for (var i = 0; i < 10; i++) days.push(U.addDays(new Date(), i));
      body.appendChild(el('div', { class: 'datepick' }, days.map(function (d) {
        var key = U.dkey(d);
        return el('button', {
          class: 'datepick__d', 'aria-pressed': sel.date === key ? 'true' : 'false',
          onclick: function () { sel.date = key; sel.start = null; paint(); }
        }, [el('span', { text: B.i18n.dow((d.getDay() + 6) % 7) }), el('b', { text: d.getDate() + '' })]);
      })));
      var dur = st.servicesDuration(sel.serviceIds);
      var slots = st.slotsFor({ branchId: branchId, dateKey: sel.date, duration: dur, staffId: sel.staffId });
      if (pre.start != null && sel.start == null && sel.date === pre.date) sel.start = pre.start;
      if (!slots.length) body.appendChild(el('div', { class: 'empty', text: 'Boş vaxt yoxdur' }));
      else body.appendChild(el('div', { class: 'slots' }, slots.map(function (s) {
        return el('button', {
          class: 'slot', 'aria-pressed': sel.start === s.start ? 'true' : 'false', text: U.hhmm(s.start),
          onclick: function () { sel.start = s.start; paint(); }
        });
      })));
    }

    function pickClient() {
      var search = el('input', { class: 'input', placeholder: 'Ad və ya telefon…' });
      var list = el('div', { class: 'picker' });
      function paintList() {
        clear(list);
        var q = U.fold(search.value);
        var res = st.state.clients.filter(function (c) {
          return !q || U.fold(c.name).indexOf(q) >= 0 || c.phone.indexOf(search.value.replace(/\D/g, '')) >= 0;
        }).slice(0, 40);
        if (search.value.trim() && !res.length) {
          list.appendChild(el('button', {
            class: 'picker__row', onclick: function () {
              var nc = {
                id: U.uid('cl'), name: search.value.trim(), phone: '+994', email: '', birthday: '',
                gender: 'f', bonus: 0, visits: 0, totalSpend: 0, lastVisit: U.dkey(new Date()),
                noShows: 0, branchId: branchId, note: '', tags: [], consent: true, blocked: false
              };
              st.state.clients.unshift(nc); sel.clientId = nc.id; mm.close(); paint();
            }
          }, [el('span', { style: { color: 'var(--accent)' }, html: icon('plus') }), el('span', { style: { flex: 1 } }, el('b', { text: '«' + search.value.trim() + '» adlı yeni müştəri yarat' }))]));
        }
        res.forEach(function (c) {
          list.appendChild(el('button', {
            class: 'picker__row', onclick: function () { sel.clientId = c.id; mm.close(); paint(); }
          }, [
            el('span', { class: 'avatar avatar--sm', text: U.initials(c.name) }),
            el('span', { style: { flex: 1, minWidth: 0 } }, [el('b', { text: c.name }), el('small', { text: U.phoneFmt(c.phone) + ' · ' + c.visits + ' səfər' })]),
            c.noShows ? el('span', { class: 'badge badge--danger', text: c.noShows + '×' }) : null
          ]));
        });
      }
      search.addEventListener('input', paintList); paintList();
      var mm = B.ui.modal({ title: 'Müştəri seç', body: [search, list] });
      setTimeout(function () { search.focus(); }, 60);
    }

    function pickServices() {
      var box = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s2)' } });
      function paintS() {
        clear(box);
        st.state.categories.forEach(function (c) {
          var list = st.state.services.filter(function (s) { return s.catId === c.id; });
          box.appendChild(el('div', { class: 'slots__group', style: { display: 'flex', gap: '.375rem', alignItems: 'center' } },
            [el('span', { class: 'catchip__dot', style: { background: st.catVar(c.id) } }), st.nameOf(c)]));
          list.forEach(function (sv) {
            var on = sel.serviceIds.indexOf(sv.id) >= 0;
            box.appendChild(el('button', {
              class: 'svcrow', 'aria-pressed': on ? 'true' : 'false',
              onclick: function () {
                var i = sel.serviceIds.indexOf(sv.id);
                if (i >= 0) sel.serviceIds.splice(i, 1); else sel.serviceIds.push(sv.id);
                sel.start = null; paintS();
              }
            }, [
              el('span', { class: 'svcrow__body' }, [
                el('span', { class: 'svcrow__name', text: st.nameOf(sv) }),
                el('span', { class: 'svcrow__meta', text: sv.duration + ' dəq' })
              ]),
              el('span', { class: 'svcrow__price', text: U.money(sv.price) }),
              el('span', { class: 'svcrow__pick', html: icon('check') })
            ]));
          });
        });
      }
      paintS();
      var mm = B.ui.modal({
        title: 'Xidmət seç', body: box,
        footer: [el('button', { class: 'btn btn--primary', text: 'Hazırdır', onclick: function () { mm.close(); paint(); } })]
      });
    }

    paint();
    var m = B.ui.modal({
      eyebrow: 'Salondan yazılış', title: 'Yeni yazılış', body: body,
      footer: [
        el('button', { class: 'btn btn--secondary', text: B.i18n.t('common.cancel'), onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--primary', text: 'Yazılışı yarat', onclick: function () {
            if (!sel.clientId || !sel.serviceIds.length || !sel.staffId || sel.start == null) {
              B.ui.toast({ kind: 'warn', title: 'Bütün sahələri doldurun' }); return;
            }
            var r = st.quickBook({
              branchId: branchId, staffId: sel.staffId, clientId: sel.clientId,
              serviceIds: sel.serviceIds, date: sel.date, start: sel.start, source: 'salon'
            });
            m.close();
            if (!r.ok) { B.ui.toast({ kind: 'warn', title: 'Bu vaxt tutulub' }); return; }
            B.ui.toast({ kind: 'ok', title: 'Yazılış yaradıldı', text: st.S.client(sel.clientId).name + ' — ' + U.hhmm(sel.start) });
            jstate.date = sel.date; go('journal');
          }
        })
      ]
    });
  }

  /* =============================================================== CLIENTS */
  var clientQuery = '';
  function pageClients() {
    var wrap = el('div', { class: 'page' });
    var search = el('input', { class: 'input', placeholder: 'Ad və ya telefon üzrə axtar…', value: clientQuery });
    var listBox = el('div', { class: 'panel panel__body--flush' });

    function paint() {
      clear(listBox);
      var q = U.fold(clientQuery);
      var res = st.state.clients.filter(function (c) {
        if (bid() !== 'all' && c.branchId !== bid()) return false;
        return !q || U.fold(c.name).indexOf(q) >= 0 || c.phone.indexOf(clientQuery.replace(/\D/g, '')) >= 0;
      });
      listBox.appendChild(el('div', { class: 'panel__head' }, [
        el('div', { class: 'panel__title', text: res.length + ' müştəri' }),
        el('button', { class: 'btn btn--sm btn--soft', onclick: function () { openQuickBook(); } }, [el('span', { html: icon('plus') }), 'Yazılış'])
      ]));
      if (!res.length) { listBox.appendChild(el('div', { class: 'empty', text: 'Nəticə yoxdur' })); return; }
      res.slice(0, 60).forEach(function (c) {
        var days = U.daysBetween(c.lastVisit, U.dkey(new Date()));
        listBox.appendChild(el('div', { class: 'listrow', onclick: function () { openClient(c.id); } }, [
          el('span', { class: 'avatar', text: U.initials(c.name) }),
          el('div', { class: 'listrow__main' }, [
            el('div', { class: 'listrow__title' }, [
              c.name,
              c.tags.indexOf('VIP') >= 0 ? el('span', { class: 'badge badge--accent', text: 'VIP' }) : null,
              c.noShows ? el('span', { class: 'badge badge--danger', text: c.noShows + '× gəlməyib' }) : null
            ]),
            el('div', { class: 'listrow__sub', text: U.phoneFmt(c.phone) + ' · ' + c.visits + ' səfər · son səfər ' + (days === 0 ? 'bu gün' : days + ' gün əvvəl') })
          ]),
          el('div', { class: 'listrow__end' }, [
            el('div', { class: 'listrow__amt', text: U.money(c.totalSpend) }),
            el('div', { class: 'dim', style: { fontSize: 'var(--t-xs)' }, text: 'bonus ' + U.money(c.bonus) })
          ])
        ]));
      });
    }
    search.addEventListener('input', U.debounce(function () { clientQuery = search.value; paint(); }, 140));
    paint();

    wrap.appendChild(el('div', { class: 'toolbar' }, [
      el('div', { class: 'input-group', style: { flex: 1, maxWidth: '26rem' } }, [el('span', { html: icon('search') }), search])
    ]));
    wrap.appendChild(listBox);
    return wrap;
  }

  function openClient(id) {
    var c = st.S.client(id);
    var hist = st.state.appointments.filter(function (a) { return a.clientId === id; })
      .sort(function (a, b) { return (b.date + b.start).localeCompare(a.date + a.start); });
    B.ui.drawer({
      eyebrow: 'Müştəri kartı', title: c.name, subtitle: U.phoneFmt(c.phone),
      body: [
        el('div', { class: 'insp__hero' }, [
          el('span', { class: 'avatar avatar--xl', text: U.initials(c.name) }),
          el('div', { style: { flex: 1 } }, [
            el('div', { style: { display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap' } }, [
              c.tags.indexOf('VIP') >= 0 ? el('span', { class: 'badge badge--accent', text: 'VIP' }) : null,
              el('span', { class: 'badge badge--neutral', text: c.visits + ' səfər' }),
              c.noShows ? el('span', { class: 'badge badge--danger', text: c.noShows + '× gəlməyib' }) : null
            ])
          ])
        ]),
        el('div', { class: 'grid grid--3' }, [
          statCard('Ümumi xərc', U.money(c.totalSpend)),
          statCard('Bonus', U.money(c.bonus)),
          statCard('Orta çek', U.money(c.visits ? Math.round(c.totalSpend / c.visits) : 0))
        ]),
        el('dl', { class: 'insp__rows' }, [
          irow('Telefon', U.phoneFmt(c.phone)),
          c.email ? irow('E-poçt', c.email) : null,
          c.birthday ? irow('Ad günü', B.i18n.dateLabel(U.fromKey(c.birthday), { plain: true })) : null,
          irow('Son səfər', B.i18n.dateLabel(U.fromKey(c.lastVisit), { plain: true })),
          irow('Filial', st.S.branch(c.branchId).short),
          irow('Razılıq', c.consent ? 'Verilib' : 'Yoxdur')
        ]),
        c.note ? el('div', { class: 'card card--pad', style: { background: 'var(--warn-soft)', borderColor: 'var(--warn-line)' } }, [
          el('div', { class: 'eyebrow', style: { color: 'var(--warn)' }, text: 'Qeyd' }),
          el('div', { style: { fontSize: 'var(--t-sm)', marginTop: '.25rem' }, text: c.note })
        ]) : null,
        el('div', {}, [
          el('div', { class: 'eyebrow', style: { marginBottom: 'var(--s2)' }, text: 'Səfər tarixçəsi' }),
          el('div', { class: 'panel panel__body--flush' }, hist.slice(0, 12).map(function (a) {
            return el('div', { class: 'listrow', onclick: function () { B.ui.closeDrawer(); openAppointment(a.id); } }, [
              el('div', { class: 'upnext__rail', style: { background: st.catVarOfService(a.serviceIds[0]) } }),
              el('div', { class: 'listrow__main' }, [
                el('div', { class: 'listrow__title', text: st.serviceNames(a.serviceIds) }),
                el('div', { class: 'listrow__sub', text: B.i18n.dateLabel(U.fromKey(a.date), { plain: true }) + ' · ' + st.S.staff(a.staffId).name })
              ]),
              el('div', { class: 'listrow__end' }, [el('div', { class: 'listrow__amt', text: U.money(a.price) }), statusBadge(a.status)])
            ]);
          }))
        ])
      ],
      footer: [
        el('button', { class: 'btn btn--primary', onclick: function () { B.ui.closeDrawer(); openQuickBook(); } }, [el('span', { html: icon('plus') }), 'Yazılış yarat']),
        el('button', {
          class: 'btn btn--secondary', onclick: function () {
            st.logMessage({ channel: 'whatsapp', to: c.phone, name: c.name, kind: 'manual', text: 'Salam ' + c.name.split(' ')[0] + '! Sizi Bellinaya-da görməyi çox istərdik.' });
            st.emit({ type: 'message' });
            B.ui.toast({ kind: 'ok', title: 'Mesaj göndərildi' });
          }
        }, [el('span', { html: icon('whatsapp') }), 'Mesaj yaz'])
      ]
    });
  }
  function statCard(label, value) {
    return el('div', { class: 'card card--pad' }, el('div', { class: 'stat' }, [
      el('div', { class: 'stat__label', text: label }),
      el('div', { class: 'stat__value', style: { fontSize: 'var(--t-xl)' }, text: value })
    ]));
  }

  /* ============================================================== SERVICES */
  function pageServices() {
    var wrap = el('div', { class: 'page' });
    st.state.categories.forEach(function (c) {
      var list = st.state.services.filter(function (s) { return s.catId === c.id; });
      wrap.appendChild(el('div', { class: 'panel' }, [
        el('div', { class: 'panel__head' }, [
          el('div', { class: 'panel__title', style: { display: 'flex', alignItems: 'center', gap: '.5rem' } }, [
            el('span', { style: { width: '.625rem', height: '.625rem', borderRadius: '3px', background: st.catVar(c.id) } }),
            st.nameOf(c)
          ]),
          el('span', { class: 'badge badge--neutral', text: list.length + ' xidmət' })
        ]),
        el('div', { class: 'panel__body panel__body--flush' }, el('div', { class: 'scroll-x' }, el('table', { class: 'tbl' }, [
          el('thead', {}, el('tr', {}, [
            el('th', { text: 'Xidmət' }), el('th', { text: 'Müddət' }),
            el('th', { class: 'ta-r', text: 'Qiymət' }), el('th', { class: 'ta-r', text: 'Onlayn' })
          ])),
          el('tbody', {}, list.map(function (s) {
            return el('tr', {}, [
              el('td', { text: st.nameOf(s) }),
              el('td', { class: 'num', text: s.duration + ' dəq' }),
              el('td', { class: 'num ta-r', style: { fontWeight: '600' }, text: U.money(s.price) }),
              el('td', { class: 'ta-r' }, el('span', { class: 'badge badge--' + (s.online ? 'ok' : 'neutral'), text: s.online ? 'Açıq' : 'Bağlı' }))
            ]);
          }))
        ])))
      ]));
    });
    return wrap;
  }

  /* ============================================================== PRODUCTS */
  function pageProducts() {
    var wrap = el('div', { class: 'page' });
    var orders = st.state.productOrders.filter(function (o) { return o.status === 'new'; });

    if (orders.length) {
      wrap.appendChild(el('div', { class: 'panel' }, [
        el('div', { class: 'panel__head' }, [
          el('div', { class: 'panel__title', text: 'Onlayn sifarişlər' }),
          el('span', { class: 'badge badge--accent', text: orders.length + ' yeni' })
        ]),
        el('div', { class: 'panel__body panel__body--flush' }, orders.map(function (o) {
          var c = st.S.client(o.clientId);
          var p = st.S.product(o.items[0].id);
          return el('div', { class: 'listrow' }, [
            el('span', { class: 'avatar avatar--sm', text: U.initials(c ? c.name : '?') }),
            el('div', { class: 'listrow__main' }, [
              el('div', { class: 'listrow__title', text: p.name }),
              el('div', { class: 'listrow__sub', text: (c ? c.name : '') + ' · ' + st.S.branch(o.branchId).short + ' filialından götürəcək' })
            ]),
            el('div', { style: { display: 'flex', gap: 'var(--s2)', alignItems: 'center' } }, [
              el('span', { class: 'listrow__amt', text: U.money(o.items[0].price) }),
              el('button', {
                class: 'btn btn--sm btn--primary', text: 'Satışı bağla',
                onclick: function () {
                  st.sellProducts({ branchId: o.branchId, products: [{ id: p.id, qty: 1 }], method: 'cash', clientId: o.clientId });
                  o.status = 'done';
                  st.emit({ type: 'order-done' });
                  B.ui.toast({ kind: 'ok', title: 'Satış qeydə alındı', text: 'Qalıq azaldı, kassa artdı.' });
                  render();
                }
              })
            ])
          ]);
        }))
      ]));
    }

    var low = st.lowStock(bid());
    if (low.length) {
      wrap.appendChild(el('div', { class: 'alerts' }, low.slice(0, 4).map(function (r) {
        return alertRow(r.qty === 0 ? 'danger' : 'warn', 'box',
          r.product.name + ' — qalıq ' + r.qty,
          r.product.brand + ' · minimum ' + r.product.minStock + ' ədəd olmalıdır', 'Mədaxil et', function () { receiveModal(r.product); });
      })));
    }

    wrap.appendChild(el('div', { class: 'sec__head' }, [
      el('div', {}, [
        el('div', { class: 'sec__title', text: 'Kosmetika kataloqu' }),
        el('div', { class: 'sec__sub', text: 'Qalıqlar ' + branchLabel().toLowerCase() + ' üzrə göstərilir' })
      ]),
      el('button', { class: 'btn btn--primary btn--sm', onclick: function () { openCheckout(null); } }, [el('span', { html: icon('cart') }), 'Məhsul sat'])
    ]));

    wrap.appendChild(el('div', { class: 'pgrid' }, st.state.products.map(function (p) {
      var qty = st.stockOf(p.id, bid());
      var pct = U.clamp(qty / 20 * 100, 3, 100);
      return el('button', { class: 'pcard', onclick: function () { receiveModal(p); } }, [
        el('div', { class: 'pcard__thumb', html: icon('box') }),
        el('div', { class: 'pcard__brand', text: p.brand }),
        el('div', { class: 'pcard__name', text: p.name }),
        el('div', { class: 'pcard__foot' }, [
          el('span', { class: 'pcard__price', text: U.money(p.price) }),
          el('span', { style: { display: 'flex', alignItems: 'center', gap: '.375rem' } }, [
            el('span', { class: 'stockbar', 'data-low': qty <= p.minStock && qty > 0 ? '' : null, 'data-out': qty === 0 ? '' : null },
              el('i', { style: { width: pct + '%' } })),
            el('span', { class: 'num dim', style: { fontSize: 'var(--t-xs)', minWidth: '1.5rem', textAlign: 'right' }, text: qty + '' })
          ])
        ])
      ]);
    })));

    var top = st.topProducts(bid(), 30);
    if (top.length) {
      wrap.appendChild(el('div', { class: 'panel' }, [
        el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Son 30 gündə ən çox satılanlar' })),
        el('div', { class: 'panel__body' }, el('div', { class: 'bars' }, top.slice(0, 6).map(function (r, i) {
          var max = top[0].amount;
          return el('div', { class: 'bars__row' }, [
            el('div', { class: 'truncate', title: r.product.name, text: r.product.name }),
            el('div', { class: 'bars__track' }, el('div', { class: 'bars__fill', style: { width: (r.amount / max * 100) + '%', background: 'var(--cat-' + ((i % 7) + 1) + ')' } })),
            el('div', { class: 'bars__val', text: U.money(r.amount) })
          ]);
        })))
      ]));
    }
    return wrap;
  }

  function receiveModal(p) {
    var branchSel = el('select', { class: 'select' }, st.state.branches.map(function (b) {
      return el('option', { value: b.id, text: b.short + ' — qalıq ' + st.stockOf(p.id, b.id) });
    }));
    if (bid() !== 'all') branchSel.value = bid();
    var qty = el('input', { class: 'input', type: 'number', min: '1', value: '10' });
    var m = B.ui.modal({
      eyebrow: p.brand, title: p.name,
      body: [
        el('div', { class: 'grid grid--2' }, [
          statCard('Satış qiyməti', U.money(p.price)),
          statCard('Maya dəyəri', U.money(p.cost))
        ]),
        el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Filial' }), branchSel]),
        el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Mədaxil miqdarı' }), qty])
      ],
      footer: [
        el('button', { class: 'btn btn--secondary', text: B.i18n.t('common.cancel'), onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--primary', text: 'Mədaxil et', onclick: function () {
            st.receiveStock(p.id, branchSel.value, Math.max(1, +qty.value || 1));
            m.close(); B.ui.toast({ kind: 'ok', title: 'Anbara mədaxil edildi' }); render();
          }
        })
      ]
    });
  }

  /* ================================================================== CASH */
  function pageCash() {
    var wrap = el('div', { class: 'page' });
    var today = U.dkey(new Date());
    var inc = st.revenueOn(today, bid()), exp = st.expenseOn(today, bid());
    var txs = st.state.transactions.filter(function (t) {
      return t.date === today && (bid() === 'all' || t.branchId === bid());
    }).sort(function (a, b) { return b.at - a.at; });

    var byMethod = { cash: 0, card: 0, bonus: 0, debt: 0 };
    txs.forEach(function (t) { if (t.type === 'income') byMethod[t.method] = (byMethod[t.method] || 0) + t.amount; });

    wrap.appendChild(el('div', { class: 'grid grid--4' }, [
      statCard('Bugünkü gəlir', U.money(inc)),
      statCard('Xərc', U.money(exp)),
      statCard('Nağd', U.money(byMethod.cash || 0)),
      statCard('Kart', U.money(byMethod.card || 0))
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, [
        el('div', { class: 'panel__title', text: 'Bugünkü əməliyyatlar' }),
        el('div', { style: { display: 'flex', gap: 'var(--s2)' } }, [
          el('button', { class: 'btn btn--sm btn--secondary', onclick: function () { expenseModal(); } }, [el('span', { html: icon('minus') }), 'Xərc']),
          el('button', { class: 'btn btn--sm btn--primary', onclick: function () { openCheckout(null); } }, [el('span', { html: icon('cart') }), 'Satış'])
        ])
      ]),
      el('div', { class: 'panel__body panel__body--flush' },
        txs.length ? el('div', {}, txs.map(function (t) {
          var c = t.clientId ? st.S.client(t.clientId) : null;
          var label = (t.items || []).map(function (it) { return it.label || (it.kind === 'product' ? (st.S.product(it.id) || {}).name : st.serviceNames(it.ids)); }).filter(Boolean).join(', ');
          return el('div', { class: 'listrow', onclick: t.appointmentId ? function () { openAppointment(t.appointmentId); } : null }, [
            el('span', {
              class: 'alert__icon', style: {
                background: t.type === 'income' ? 'var(--ok-soft)' : 'var(--danger-soft)',
                color: t.type === 'income' ? 'var(--ok)' : 'var(--danger)'
              }, html: icon(t.type === 'income' ? 'arrowDown' : 'arrowUp')
            }),
            el('div', { class: 'listrow__main' }, [
              el('div', { class: 'listrow__title', text: label || t.category }),
              el('div', { class: 'listrow__sub', text: (c ? c.name + ' · ' : '') + st.S.branch(t.branchId).short + ' · ' + ({ cash: 'Nağd', card: 'Kart', bonus: 'Bonus', debt: 'Borc' }[t.method] || '—') })
            ]),
            el('div', { class: 'listrow__end' }, el('div', {
              class: 'listrow__amt', style: { color: t.type === 'income' ? 'var(--ok)' : 'var(--danger)' },
              text: (t.type === 'income' ? '+' : '−') + U.money(t.amount)
            }))
          ]);
        })) : el('div', { class: 'empty', text: 'Bu gün əməliyyat yoxdur' })
      )
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Gün bağlanışı' })),
      el('div', { class: 'panel__body', style: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' } }, [
        el('div', { class: 'receipt' }, [
          el('div', { class: 'receipt__row' }, [el('span', { text: 'Nağd' }), el('span', { text: U.money(byMethod.cash || 0) })]),
          el('div', { class: 'receipt__row' }, [el('span', { text: 'Kart' }), el('span', { text: U.money(byMethod.card || 0) })]),
          el('div', { class: 'receipt__row' }, [el('span', { text: 'Bonusla' }), el('span', { text: U.money(byMethod.bonus || 0) })]),
          el('div', { class: 'receipt__row' }, [el('span', { text: 'Borc' }), el('span', { text: U.money(byMethod.debt || 0) })]),
          el('div', { class: 'receipt__sep' }),
          el('div', { class: 'receipt__row' }, [el('span', { text: 'Xərc' }), el('span', { text: '−' + U.money(exp) })]),
          el('div', { class: 'receipt__row receipt__total' }, [el('span', { text: 'QALIQ' }), el('span', { text: U.money(inc - exp) })])
        ]),
        el('button', {
          class: 'btn btn--secondary', onclick: function () {
            B.ui.toast({ kind: 'ok', title: 'Gün bağlandı', text: U.money(inc - exp) + ' — hesabat arxivə yazıldı.' });
          }
        }, [el('span', { html: icon('lock') }), 'Günü bağla'])
      ])
    ]));
    return wrap;
  }

  function expenseModal() {
    var cat = el('select', { class: 'select' }, ['Sərfiyyat alışı', 'Mal alışı', 'İcarə', 'Kommunal', 'Reklam', 'Əməkhaqqı', 'Sair xərclər']
      .map(function (c) { return el('option', { value: c, text: c }); }));
    var amt = el('input', { class: 'input', type: 'number', min: '0', placeholder: '0' });
    var m = B.ui.modal({
      title: 'Xərc əlavə et',
      body: [
        el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Kateqoriya' }), cat]),
        el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Məbləğ (₼)' }), amt])
      ],
      footer: [
        el('button', { class: 'btn btn--secondary', text: B.i18n.t('common.cancel'), onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--primary', text: B.i18n.t('common.save'), onclick: function () {
            var v = +amt.value || 0; if (v <= 0) { B.ui.toast({ kind: 'warn', title: 'Məbləğ daxil edin' }); return; }
            st.state.transactions.push({
              id: U.uid('tx'), branchId: bid() === 'all' ? st.state.branches[0].id : bid(), type: 'expense',
              category: cat.value, amount: v, method: 'cash', items: [], date: U.dkey(new Date()), at: Date.now()
            });
            st.emit({ type: 'expense' }); m.close(); B.ui.toast({ kind: 'ok', title: 'Xərc yazıldı' }); render();
          }
        })
      ]
    });
  }

  /* =============================================================== PAYROLL */
  function pagePayroll() {
    var wrap = el('div', { class: 'page' });
    var from = U.dkey(U.addDays(new Date(), -30));
    var rows = st.payroll(bid(), from, U.dkey(new Date()));
    var totalPay = rows.reduce(function (a, r) { return a + r.pay; }, 0);

    wrap.appendChild(el('div', { class: 'grid grid--3' }, [
      statCard('Son 30 gün — ödəniləcək', U.money(totalPay)),
      statCard('Usta sayı', rows.length + ''),
      statCard('Orta', U.money(rows.length ? Math.round(totalPay / rows.length) : 0))
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, [
        el('div', { class: 'panel__title', text: 'Əməkhaqqı hesablanması' }),
        el('div', { class: 'sec__sub', text: 'Son 30 gün · yalnız ödənilmiş səfərlər' })
      ]),
      el('div', { class: 'panel__body panel__body--flush' }, el('div', { class: 'scroll-x' }, el('table', { class: 'tbl' }, [
        el('thead', {}, el('tr', {}, [
          el('th', { text: 'Usta' }), el('th', { class: 'ta-r', text: 'Səfər' }),
          el('th', { class: 'ta-r', text: 'Xidmət geliri' }), el('th', { class: 'ta-r', text: 'Məhsul satışı' }),
          el('th', { class: 'ta-r', text: 'Faiz' }), el('th', { class: 'ta-r', text: 'Ödəniləcək' })
        ])),
        el('tbody', {}, rows.map(function (r) {
          return el('tr', {}, [
            el('td', {}, el('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--s2)' } }, [
              el('span', { class: 'avatar avatar--sm', text: U.initials(r.staff.name) }),
              el('span', {}, [el('div', { style: { fontWeight: '550' }, text: r.staff.name }),
              el('div', { class: 'dim', style: { fontSize: 'var(--t-xs)' }, text: r.staff.role })])
            ])),
            el('td', { class: 'num ta-r', text: r.visits + '' }),
            el('td', { class: 'num ta-r', text: U.money(r.serviceRevenue) }),
            el('td', { class: 'num ta-r', text: U.money(r.productRevenue) }),
            el('td', { class: 'num ta-r', text: r.commission + '% / ' + r.productCommission + '%' }),
            el('td', { class: 'num ta-r', style: { fontWeight: '700', color: 'var(--accent-text)' }, text: U.money(r.pay) })
          ]);
        }))
      ])))
    ]));
    return wrap;
  }

  /* ============================================================= MARKETING */
  function pageMarketing() {
    var wrap = el('div', { class: 'page' });
    var lapsed = st.lapsedClients(60);
    var bdays = st.birthdaysSoon(7);

    wrap.appendChild(el('div', { class: 'grid grid--2' }, [
      el('div', { class: 'gapcard' }, [
        el('div', { class: 'eyebrow', text: 'Gəlir gətirən kampaniya' }),
        el('div', { class: 'gapcard__title', text: lapsed.length + ' müştəri 60+ gündür gəlmir' }),
        el('p', { class: 'muted', style: { fontSize: 'var(--t-sm)', maxWidth: '40ch' }, text: 'Onlara şəxsi təklif göndərək. Təcrübə göstərir ki, belə kampaniyalar itirilmiş müştərilərin bir hissəsini geri qaytarır.' }),
        el('button', {
          class: 'btn btn--primary', style: { marginTop: 'var(--s4)' }, onclick: function () {
            var text = '{ad}, çoxdandır sizi görmürük! Bu həftə istənilən xidmətə 15% endirim sizin üçün keçərlidir. Bellinaya';
            B.ui.confirm({ title: 'Kampaniyanı göndərək?', text: lapsed.length + ' nəfərə WhatsApp mesajı gedəcək.', confirmLabel: 'Göndər' })
              .then(function (ok) {
                if (!ok) return;
                var n = st.runCampaign('winback', lapsed, text);
                B.ui.toast({ kind: 'ok', duration: 6000, title: n + ' mesaj göndərildi', text: 'Cavablar jurnalda yeni yazılış kimi görünəcək.' });
                render();
              });
          }
        }, [el('span', { html: icon('send') }), 'Kampaniyanı başlat'])
      ]),
      el('div', { class: 'panel' }, [
        el('div', { class: 'panel__head' }, [
          el('div', { class: 'panel__title', text: 'Yaxın ad günləri' }),
          el('span', { class: 'badge badge--accent', text: bdays.length + '' })
        ]),
        el('div', { class: 'panel__body panel__body--flush' },
          bdays.length ? el('div', {}, bdays.slice(0, 6).map(function (b) {
            return el('div', { class: 'listrow' }, [
              el('span', { class: 'avatar avatar--sm', text: U.initials(b.client.name) }),
              el('div', { class: 'listrow__main' }, [
                el('div', { class: 'listrow__title', text: b.client.name }),
                el('div', { class: 'listrow__sub', text: b.inDays === 0 ? 'Bu gün!' : b.inDays + ' gün sonra' })
              ]),
              el('button', {
                class: 'btn btn--sm btn--soft', text: 'Təbrik et', onclick: function () {
                  st.runCampaign('birthday', [b.client], '{ad}, ad gününüz mübarək! Hədiyyə olaraq hesabınıza 20 ₼ bonus əlavə etdik. Bellinaya');
                  b.client.bonus += 20;
                  B.ui.toast({ kind: 'ok', title: 'Təbrik göndərildi', text: '20 ₼ bonus əlavə olundu.' });
                  render();
                }
              })
            ]);
          })) : el('div', { class: 'empty', text: 'Yaxın günlərdə ad günü yoxdur' })
        )
      ])
    ]));

    wrap.appendChild(el('div', { class: 'sec' }, [
      el('div', { class: 'sec__head' }, [
        el('div', {}, [
          el('div', { class: 'sec__title', text: 'Avtomatlaşdırma' }),
          el('div', { class: 'sec__sub', text: 'Bir dəfə qurulur, sonra özü işləyir' })
        ])
      ]),
      el('div', { class: 'grid grid--2' }, st.state.automations.map(function (au) {
        var input = el('input', { type: 'checkbox' });
        input.checked = au.enabled;
        input.addEventListener('change', function () {
          au.enabled = input.checked; st.emit({ type: 'automation' });
          B.ui.toast({ kind: au.enabled ? 'ok' : 'info', title: au.name + (au.enabled ? ' açıldı' : ' söndürüldü') });
          render();
        });
        return el('div', { class: 'autocard', 'data-off': au.enabled ? null : '' }, [
          el('div', { class: 'autocard__icon', html: icon(au.icon) }),
          el('div', { class: 'autocard__body' }, [
            el('div', { class: 'autocard__name', text: au.name }),
            el('div', { class: 'autocard__desc', text: au.desc }),
            el('div', { class: 'autocard__meta' }, [
              el('span', { class: 'badge badge--neutral' }, [el('span', { html: icon(au.channel === 'sms' ? 'phone' : 'whatsapp') }), au.channel === 'sms' ? 'SMS' : 'WhatsApp']),
              el('span', { text: au.sent + ' mesaj göndərilib' })
            ])
          ]),
          el('label', { class: 'switch' }, [input, el('span', { class: 'switch__track' })])
        ]);
      }))
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, [
        el('div', { class: 'panel__title', text: 'Göndərilən mesajlar' }),
        el('span', { class: 'badge badge--neutral', text: st.state.messages.length + '' })
      ]),
      el('div', { class: 'panel__body' },
        st.state.messages.length ? el('div', { class: 'msglog' }, st.state.messages.slice(0, 30).map(function (msg) {
          return el('div', { class: 'msglog__item' }, [
            el('div', { class: 'msglog__ch', 'data-ch': msg.channel, html: icon(msg.channel === 'sms' ? 'phone' : 'whatsapp') }),
            el('div', { class: 'msglog__body' }, [
              el('div', { class: 'msglog__to', text: msg.name + ' · ' + U.phoneFmt(msg.to) }),
              el('div', { class: 'msglog__text', text: msg.text })
            ]),
            el('div', { class: 'msglog__time', text: new Date(msg.at).getHours() + ':' + U.pad(new Date(msg.at).getMinutes()) })
          ]);
        })) : el('div', { class: 'empty', text: 'Hələ mesaj göndərilməyib' })
      )
    ]));
    return wrap;
  }

  /* ============================================================= ANALYTICS */
  function pageAnalytics() {
    var wrap = el('div', { class: 'page' });
    var k = st.kpis(bid());
    var ret = st.retention(bid());
    var series = st.revenueSeries(30, bid());
    var total30 = series.reduce(function (a, r) { return a + r.value; }, 0);

    wrap.appendChild(el('div', { class: 'grid grid--4' }, [
      statCard('Son 30 gün gəlir', U.money(total30)),
      statCard('Orta çek', U.money(k.avgCheck)),
      statCard('Bugünkü doluluq', k.occupancy + '%'),
      statCard('Təkrar müştəri', ret.rate + '%')
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, [
        el('div', { class: 'panel__title', text: 'Gəlir trendi — son 30 gün' }),
        el('div', { class: 'sec__sub', text: branchLabel() })
      ]),
      el('div', { class: 'panel__body' }, areaChart(series, { height: 220, labels: true }))
    ]));

    wrap.appendChild(el('div', { class: 'grid grid--2' }, [
      el('div', { class: 'panel' }, [
        el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Filiallar üzrə gəlir — 30 gün' })),
        el('div', { class: 'panel__body' }, (function () {
          var rows = st.branchCompare(30);
          var max = Math.max.apply(null, rows.map(function (r) { return r.value; })) || 1;
          return el('div', { class: 'bars' }, rows.map(function (r) {
            return el('div', { class: 'bars__row' }, [
              el('div', { class: 'truncate', text: r.branch.short }),
              el('div', { class: 'bars__track' }, el('div', { class: 'bars__fill', style: { width: (r.value / max * 100) + '%', background: r.branch.color } })),
              el('div', { class: 'bars__val', text: U.money(r.value) })
            ]);
          }));
        })())
      ]),
      el('div', { class: 'panel' }, [
        el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Xidmət növləri üzrə pay — 30 gün' })),
        el('div', { class: 'panel__body' }, (function () {
          var rows = st.serviceMix(bid(), 30);
          var max = rows.length ? rows[0].value : 1;
          return el('div', { class: 'bars' }, rows.map(function (r) {
            return el('div', { class: 'bars__row' }, [
              el('div', { class: 'truncate', style: { display: 'flex', alignItems: 'center', gap: '.375rem' } }, [
                el('span', { class: 'legend__swatch', style: { background: st.catVar(r.cat.id) } }),
                el('span', { class: 'truncate', text: st.nameOf(r.cat) })
              ]),
              el('div', { class: 'bars__track' }, el('div', { class: 'bars__fill', style: { width: (r.value / max * 100) + '%', background: st.catVar(r.cat.id) } })),
              el('div', { class: 'bars__val', text: U.money(r.value) })
            ]);
          }));
        })())
      ])
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Ustaların səmərəliliyi — son 30 gün' })),
      el('div', { class: 'panel__body panel__body--flush' }, el('div', { class: 'scroll-x' }, el('table', { class: 'tbl' }, [
        el('thead', {}, el('tr', {}, [
          el('th', { text: 'Usta' }), el('th', { text: 'Filial' }), el('th', { class: 'ta-r', text: 'Səfər' }),
          el('th', { class: 'ta-r', text: 'Xidmət' }), el('th', { class: 'ta-r', text: 'Məhsul' }), el('th', { class: 'ta-r', text: 'Cəmi gəlir' })
        ])),
        el('tbody', {}, st.payroll(bid(), U.dkey(U.addDays(new Date(), -30)), U.dkey(new Date())).map(function (r) {
          return el('tr', {}, [
            el('td', { text: r.staff.name }),
            el('td', { class: 'dim', text: st.S.branch(r.staff.branchId).short }),
            el('td', { class: 'num ta-r', text: r.visits + '' }),
            el('td', { class: 'num ta-r', text: U.money(r.serviceRevenue) }),
            el('td', { class: 'num ta-r', text: U.money(r.productRevenue) }),
            el('td', { class: 'num ta-r', style: { fontWeight: '600' }, text: U.money(r.serviceRevenue + r.productRevenue) })
          ]);
        }))
      ])))
    ]));
    return wrap;
  }

  /* ---------------------------------------------------------- area chart -- */
  function areaChart(series, opts) {
    opts = opts || {};
    var W = 640, H = opts.height || 180, padL = 8, padR = 8, padT = 12, padB = opts.labels ? 22 : 8;
    var max = Math.max.apply(null, series.map(function (r) { return r.value; })) || 1;
    var n = series.length;
    var x = function (i) { return padL + (W - padL - padR) * (n === 1 ? .5 : i / (n - 1)); };
    var y = function (v) { return padT + (H - padT - padB) * (1 - v / max); };

    var line = '', area = '';
    series.forEach(function (r, i) {
      line += (i ? ' L' : 'M') + x(i).toFixed(1) + ',' + y(r.value).toFixed(1);
    });
    area = line + ' L' + x(n - 1).toFixed(1) + ',' + (H - padB) + ' L' + x(0).toFixed(1) + ',' + (H - padB) + ' Z';

    var gridLines = '';
    for (var g = 0; g <= 2; g++) {
      var gy = padT + (H - padT - padB) * (g / 2);
      gridLines += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '"/>';
    }
    var lastI = n - 1;
    var svg =
      '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" ' +
      'aria-label="Gəlir trendi">' +
      '<defs><linearGradient id="bgrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--accent)" stop-opacity=".26"/>' +
      '<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<g class="chart__grid">' + gridLines + '</g>' +
      '<path class="chart__area" d="' + area + '"/>' +
      '<path class="chart__line" d="' + line + '" vector-effect="non-scaling-stroke"/>' +
      '<circle class="chart__dot" cx="' + x(lastI).toFixed(1) + '" cy="' + y(series[lastI].value).toFixed(1) + '" r="4" vector-effect="non-scaling-stroke"/>' +
      '</svg>';

    var wrap = el('div', { class: 'chartwrap' });
    wrap.innerHTML = svg;
    var tip = el('div', { class: 'charttip' });
    wrap.appendChild(tip);

    /* hover layer: an HTML strip per point keeps hit targets comfortable */
    var hit = el('div', { style: { position: 'absolute', inset: 0, display: 'flex' } });
    series.forEach(function (r, i) {
      hit.appendChild(el('div', {
        style: { flex: '1' },
        onmouseenter: function (e) {
          tip.innerHTML = '<b>' + U.money(r.value) + '</b><br>' + r.label;
          tip.style.left = ((i + .5) / n * 100) + '%';
          tip.style.top = (y(r.value) / H * 100) + '%';
          tip.setAttribute('data-show', '');
        },
        onmouseleave: function () { tip.removeAttribute('data-show'); }
      }));
    });
    wrap.appendChild(hit);

    if (opts.labels) {
      wrap.appendChild(el('div', {
        style: { display: 'flex', justifyContent: 'space-between', marginTop: '.375rem', fontSize: 'var(--t-2xs)', color: 'var(--ink-4)' }
      }, [
        el('span', { text: series[0].label }),
        el('span', { text: series[Math.floor(n / 2)].label }),
        el('span', { text: series[n - 1].label })
      ]));
    }
    return wrap;
  }

  /* ================================================================= STAFF */
  function pageStaff() {
    var wrap = el('div', { class: 'page' });
    wrap.appendChild(el('div', { class: 'grid grid--3' }, st.staffOfBranch(bid()).map(function (s) {
      var cnt = st.state.appointments.filter(function (a) { return a.staffId === s.id && a.status === 'paid'; }).length;
      return el('div', { class: 'card card--pad', style: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' } }, [
        el('div', { style: { display: 'flex', gap: 'var(--s3)', alignItems: 'center' } }, [
          el('span', { class: 'avatar avatar--lg', text: U.initials(s.name) }),
          el('div', { style: { minWidth: 0 } }, [
            el('div', { style: { fontWeight: '600', fontSize: 'var(--t-md)' }, text: s.name }),
            el('div', { class: 'dim', style: { fontSize: 'var(--t-sm)' }, text: s.role }),
            el('div', { class: 'mastercard__rate' }, [el('span', { html: icon('star') }), s.rating.toFixed(1)])
          ])
        ]),
        el('dl', { class: 'insp__rows' }, [
          irow('Filial', st.S.branch(s.branchId).short),
          irow('İş vaxtı', s.shift.start + ' – ' + s.shift.end),
          irow('Xidmət faizi', s.commission + '%'),
          irow('Məhsul faizi', s.productCommission + '%'),
          irow('Tamamlanmış', cnt + ' səfər')
        ]),
        el('div', { style: { display: 'flex', gap: '.375rem', flexWrap: 'wrap' } }, s.cats.map(function (cid) {
          return el('span', { class: 'badge badge--neutral' }, [
            el('span', { class: 'legend__swatch', style: { background: st.catVar(cid) } }), st.nameOf(st.S.category(cid))
          ]);
        }))
      ]);
    })));
    return wrap;
  }

  /* ============================================================== SETTINGS */
  function pageSettings() {
    var wrap = el('div', { class: 'page' });

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Salon' })),
      el('div', { class: 'panel__body', style: { display: 'flex', gap: 'var(--s5)', alignItems: 'center', flexWrap: 'wrap' } }, [
        el('div', { class: 'brandplate' }, el('img', { src: 'assets/img/logo-540.webp', alt: 'Bellinaya', width: '540', height: '336' })),
        el('div', { style: { flex: 1, minWidth: '14rem' } }, [
          el('div', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--t-xl)', fontWeight: '600' }, text: st.state.salon.legalName }),
          el('div', { class: 'dim', style: { fontSize: 'var(--t-sm)' }, text: st.state.salon.instagram + ' · ' + U.phoneFmt(st.state.salon.phone) }),
          el('div', { class: 'dim', style: { fontSize: 'var(--t-sm)', marginTop: '.25rem' }, text: st.state.branches.length + ' filial · ' + st.state.staff.length + ' usta · ' + st.state.clients.length + ' müştəri' })
        ])
      ])
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Filiallar' })),
      el('div', { class: 'panel__body panel__body--flush' }, st.state.branches.map(function (b) {
        return el('div', { class: 'setrow' }, [
          el('span', { style: { width: '.75rem', height: '.75rem', borderRadius: '99px', background: b.color, flex: 'none' } }),
          el('div', { class: 'setrow__body' }, [
            el('div', { class: 'setrow__title', text: b.name }),
            el('div', { class: 'setrow__desc', text: b.address + ' · ' + b.open + '–' + b.close + ' · ' + U.phoneFmt(b.phone) })
          ]),
          el('span', { class: 'badge badge--neutral', text: st.staffOfBranch(b.id).length + ' usta' })
        ]);
      }))
    ]));

    var themeSel = el('div', { class: 'seg' }, [['auto', 'Sistem'], ['light', 'İşıqlı'], ['dark', 'Qaranlıq']].map(function (t) {
      return el('button', {
        class: 'seg__btn', 'aria-selected': (st.state.settings.theme || 'auto') === t[0] ? 'true' : 'false', text: t[1],
        onclick: function () { B.setTheme(t[0]); render(); }
      });
    }));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Görünüş və dil' })),
      el('div', { class: 'panel__body panel__body--flush' }, [
        el('div', { class: 'setrow' }, [
          el('div', { class: 'setrow__body' }, [
            el('div', { class: 'setrow__title', text: 'Tema' }),
            el('div', { class: 'setrow__desc', text: 'İşıqlı və qaranlıq rejim. «Sistem» seçilsə, cihazın parametrinə uyğunlaşır.' })
          ]), themeSel
        ]),
        el('div', { class: 'setrow' }, [
          el('div', { class: 'setrow__body' }, [
            el('div', { class: 'setrow__title', text: 'İnterfeys dili' }),
            el('div', { class: 'setrow__desc', text: 'Azərbaycan, rus və ingilis dilləri. Hər işçi özü üçün seçə bilər.' })
          ]),
          el('div', { class: 'seg' }, B.i18n.langs.map(function (l) {
            return el('button', {
              class: 'seg__btn', 'aria-selected': B.i18n.get() === l ? 'true' : 'false',
              text: { az: 'AZ', ru: 'RU', en: 'EN' }[l],
              onclick: function () { B.i18n.set(l); st.emit({ type: 'lang' }); render(); refreshRail(); }
            });
          }))
        ])
      ])
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Kassa və qanunvericilik' })),
      el('div', { class: 'panel__body panel__body--flush' }, [
        el('div', { class: 'setrow' }, [
          el('div', { class: 'setrow__body' }, [
            el('div', { class: 'setrow__title', text: 'Fiskal çek' }),
            el('div', { class: 'setrow__desc', text: 'Bellinaya ödənişi qeyd edir və hesabatlara yazır. Rəsmi fiskal çek salonun mövcud kassa aparatından verilir. Kassa aparatı ilə birbaşa inteqrasiya növbəti mərhələdə əlavə olunacaq.' })
          ]),
          el('span', { class: 'badge badge--info', text: 'Yanaşı işləyir' })
        ]),
        el('div', { class: 'setrow' }, [
          el('div', { class: 'setrow__body' }, [
            el('div', { class: 'setrow__title', text: 'Fərdi məlumatların emalı' }),
            el('div', { class: 'setrow__desc', text: 'Onlayn yazılışda müştəridən açıq razılıq alınır: məqsəd, toplanan məlumatlar və saxlanma müddəti göstərilir. Razılıq verilməsə yazılış tamamlanmır.' })
          ]),
          el('span', { class: 'badge badge--ok', text: 'Aktiv' })
        ])
      ])
    ]));

    wrap.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'panel__head' }, el('div', { class: 'panel__title', text: 'Nümayiş' })),
      el('div', { class: 'panel__body', style: { display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', alignItems: 'center' } }, [
        el('p', { class: 'muted', style: { flex: 1, minWidth: '16rem', fontSize: 'var(--t-sm)' }, text: 'Bu, nümayiş versiyasıdır. Bütün məlumat yalnız bu brauzerdə saxlanılır. İstədiyiniz vaxt ilkin vəziyyətə qaytara bilərsiniz.' }),
        el('button', {
          class: 'btn btn--secondary', onclick: function () {
            B.ui.confirm({ title: 'Demonu sıfırlayaq?', text: 'Bütün dəyişikliklər silinəcək və ilkin nümunə məlumat qayıdacaq.', danger: true, confirmLabel: 'Sıfırla' })
              .then(function (ok) { if (ok) { st.reset(); B.ui.toast({ kind: 'ok', title: 'Demo sıfırlandı' }); render(); } });
          }
        }, [el('span', { html: icon('refresh') }), 'Demonu sıfırla'])
      ])
    ]));
    return wrap;
  }

  /* ================================================================= mount */
  function mount(opts) {
    host = opts.host; titleEl = opts.titleEl; subEl = opts.subEl; toolsEl = opts.toolsEl;
    var hash = (location.hash || '').replace('#', '');
    if (PAGES.some(function (p) { return p.id === hash; })) page = hash;
    render();
    return {
      render: render, go: go, refreshRail: refreshRail, buildRail: buildRail,
      openAppointment: openAppointment, openQuickBook: openQuickBook, paintTabbar: paintTabbar,
      openCheckout: openCheckout, offerGapFill: offerGapFill,
      get page() { return page; }
    };
  }

  B.admin = { mount: mount, PAGES: PAGES };
})();
