/* ==========================================================================
   Bellinaya — client-facing page
   Everything written here lands in the same store the salon panel reads,
   so a booking made on this screen appears in the journal immediately.
   ========================================================================== */
(function () {
  var el = B.dom.el, clear = B.dom.clear, U = B.util, st = B.store, icon = B.icon;

  var root, scrollEl, navEl;
  var view = 'home';
  var flow = { branchId: null, serviceIds: [], staffId: 'any', dateKey: null, start: null, step: 1 };
  var lastBooking = null;

  /* ====================================================== opening animation */
  function strandPath(i) {
    var sx = 94 - i * 1.5, sy = 30 + i * 4.5;
    var c1x = 132 + i * 7, c1y = 44 + i * 5;
    var c2x = 152 + i * 3, c2y = 92 + i * 4;
    var mx = 134 - i * 5, my = 122 + i * 5;
    var c3x = 126 - i * 6, c3y = 142 + i * 4;
    var c4x = 112 - i * 6, c4y = 156 + i * 3;
    var ex = 92 - i * 5, ey = 162 + i * 2;
    return 'M' + sx + ',' + sy +
      ' C' + c1x + ',' + c1y + ' ' + c2x + ',' + c2y + ' ' + mx + ',' + my +
      ' C' + c3x + ',' + c3y + ' ' + c4x + ',' + c4y + ' ' + ex + ',' + ey;
  }
  function sparkPath(cx, cy, r) {
    return 'M' + cx + ',' + (cy - r) +
      ' C' + (cx + r * .18) + ',' + (cy - r * .32) + ' ' + (cx + r * .32) + ',' + (cy - r * .18) + ' ' + (cx + r) + ',' + cy +
      ' C' + (cx + r * .32) + ',' + (cy + r * .18) + ' ' + (cx + r * .18) + ',' + (cy + r * .32) + ' ' + cx + ',' + (cy + r) +
      ' C' + (cx - r * .18) + ',' + (cy + r * .32) + ' ' + (cx - r * .32) + ',' + (cy + r * .18) + ' ' + (cx - r) + ',' + cy +
      ' C' + (cx - r * .32) + ',' + (cy - r * .18) + ' ' + (cx - r * .18) + ',' + (cy - r * .32) + ' ' + cx + ',' + (cy - r) + 'Z';
  }

  function buildIntro(onDone) {
    var strands = '';
    for (var i = 0; i < 6; i++) {
      strands += '<path class="intro__hair" d="' + strandPath(i) + '" style="--d:' + (i * 90) + 'ms"/>';
    }
    var svg =
      '<svg viewBox="0 0 200 200" aria-hidden="true">' +
      '<defs><linearGradient id="introGrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="var(--rose-300)"/>' +
      '<stop offset="55%" stop-color="var(--rose-500)"/>' +
      '<stop offset="100%" stop-color="var(--rose-700)"/>' +
      '</linearGradient></defs>' +
      /* head + shoulder suggestion, drawn first */
      '<path class="intro__draw" d="M70,152 C58,134 58,104 72,88 C84,74 100,68 112,72" style="--d:0ms"/>' +
      '<path class="intro__draw" d="M44,180 C50,163 62,152 78,148" style="--d:220ms"/>' +
      strands +
      /* the falling lock */
      '<path class="intro__lock" d="M136,126 C127,136 121,148 123,160"/>' +
      /* scissors */
      '<g class="intro__scissor">' +
      '<g class="intro__blade-a" style="transform-box:view-box;transform-origin:152px 108px">' +
      '<path d="M140,96 L172,120"/><circle cx="136" cy="92" r="6"/></g>' +
      '<g class="intro__blade-b" style="transform-box:view-box;transform-origin:152px 108px">' +
      '<path d="M140,120 L172,96"/><circle cx="136" cy="124" r="6"/></g>' +
      '<circle cx="152" cy="108" r="2.2" fill="currentColor" stroke="none"/>' +
      '</g>' +
      '<path class="intro__spark" d="' + sparkPath(158, 66, 9) + '" style="--d:1880ms"/>' +
      '<path class="intro__spark" d="' + sparkPath(44, 108, 6) + '" style="--d:2010ms"/>' +
      '<path class="intro__spark" d="' + sparkPath(126, 176, 5) + '" style="--d:2120ms"/>' +
      '</svg>';

    var node = el('div', { class: 'intro', role: 'button', tabindex: '0', 'aria-label': 'Keç' }, [
      el('div', { class: 'intro__stage', html: svg }, null),
      el('div', { class: 'intro__skip', text: 'Keçmək üçün toxunun' })
    ]);
    var stage = node.querySelector('.intro__stage');
    stage.appendChild(el('div', { class: 'intro__word' }, [
      el('img', { src: 'assets/img/logo-540.webp', alt: 'Bellinaya', width: '540', height: '336' }),
      el('span', { text: 'Gözəllik salonu' })
    ]));

    /* measure each path so the draw-on animation is exact */
    requestAnimationFrame(function () {
      B.dom.$$('path', node).forEach(function (p) {
        if (!p.classList.contains('intro__draw') && !p.classList.contains('intro__hair')) return;
        var len = 0;
        try { len = p.getTotalLength(); } catch (e) { len = 400; }
        p.style.setProperty('--len', Math.ceil(len));
      });
      node.setAttribute('data-play', '');
    });

    var done = false;
    function finish() {
      if (done) return; done = true;
      node.setAttribute('data-leaving', '');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); onDone && onDone(); }, 640);
    }
    node.addEventListener('click', finish);
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') finish(); });
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(finish, reduce ? 1100 : 2750);
    return node;
  }

  /* ============================================================== helpers */
  function me() { return st.S.client(st.state.me.clientId); }
  function myBookings() {
    var id = st.state.me.clientId;
    return st.state.appointments.filter(function (a) { return a.clientId === id; })
      .sort(function (a, b) { return (a.date + U.pad(a.start)).localeCompare(b.date + U.pad(b.start)); });
  }
  function upcoming() {
    var today = U.dkey(new Date()), now = U.nowMin();
    return myBookings().filter(function (a) {
      if (a.status === 'cancelled' || a.status === 'paid' || a.status === 'noshow') return false;
      return a.date > today || (a.date === today && a.start + a.duration >= now);
    });
  }
  function goto(v, opts) {
    view = v;
    if (v === 'book' && opts && opts.reset !== false) {
      flow = { branchId: flow.branchId || st.state.branches[0].id, serviceIds: [], staffId: 'any', dateKey: U.dkey(new Date()), start: null, step: 1 };
      if (opts && opts.serviceId) { flow.serviceIds = [opts.serviceId]; flow.step = 2; }
    }
    render();
    if (scrollEl) scrollEl.scrollTop = 0;
  }

  /* =============================================================== screens */
  function screenHome() {
    var s = st.state.salon;
    var wrap = el('div', {});

    wrap.appendChild(el('section', { class: 'hero' }, [
      el('div', { class: 'hero__plate' }, el('img', { src: 'assets/img/logo-540.webp', alt: 'Bellinaya', width: '540', height: '336' })),
      el('h1', { class: 'hero__title', text: s.heroTitle }),
      el('p', { class: 'hero__text', text: s.heroText }),
      el('div', { class: 'hero__cta' }, [
        el('button', { class: 'btn btn--primary btn--lg', onclick: function () { goto('book'); } }, [
          el('span', { html: icon('calendarDay') }), 'Onlayn yazıl'
        ]),
        el('a', {
          class: 'btn btn--secondary btn--lg', href: 'tel:' + s.phone,
          onclick: function (e) { e.preventDefault(); B.ui.toast({ kind: 'info', title: 'Nümayiş rejimi', text: 'Zəng demoda aktiv deyil: ' + U.phoneFmt(s.phone) }); }
        }, [el('span', { html: icon('phone') }), 'Zəng et'])
      ]),
      el('div', { class: 'hero__stats' }, [
        el('div', { class: 'hero__stat' }, [el('b', { text: '3' }), el('span', { text: 'filial' })]),
        el('div', { class: 'hero__stat' }, [el('b', { text: st.state.staff.length + '' }), el('span', { text: 'usta' })]),
        el('div', { class: 'hero__stat' }, [el('b', { text: '4.9' }), el('span', { text: 'orta reytinq' })])
      ])
    ]));

    /* branches */
    wrap.appendChild(el('section', { class: 'clsec' }, [
      el('div', { class: 'clsec__head' }, el('h2', { class: 'clsec__title', text: 'Filiallarımız' })),
      el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s2)' } },
        st.state.branches.map(function (b) {
          return el('button', {
            class: 'branchcard', onclick: function () { flow.branchId = b.id; goto('book'); flow.branchId = b.id; render(); }
          }, [
            el('span', { class: 'branchcard__dot', style: { background: b.color } }),
            el('span', { class: 'branchcard__body' }, [
              el('span', { class: 'branchcard__name', text: b.short }),
              el('span', { class: 'branchcard__meta', text: b.address }),
              el('span', { class: 'branchcard__hours' }, [
                el('span', { html: icon('clock') }), b.open + ' – ' + b.close + ' · Bazar günü bağlıdır'
              ])
            ]),
            el('span', { style: { color: 'var(--ink-4)' }, html: icon('chevronR') })
          ]);
        })
      )
    ]));

    /* popular services */
    var popular = ['s01', 's09', 's15', 's19', 's24', 's29'].map(function (id) { return st.S.service(id); }).filter(Boolean);
    wrap.appendChild(el('section', { class: 'clsec' }, [
      el('div', { class: 'clsec__head' }, [
        el('h2', { class: 'clsec__title', text: 'Populyar xidmətlər' }),
        el('button', { class: 'clsec__link', text: 'Hamısı', onclick: function () { goto('book'); } })
      ]),
      el('div', {}, popular.map(function (sv) {
        var c = st.S.category(sv.catId);
        return el('button', { class: 'svcrow', onclick: function () { goto('book', { serviceId: sv.id }); } }, [
          el('span', { class: 'svcrow__body' }, [
            el('span', { class: 'svcrow__name', text: st.nameOf(sv) }),
            el('span', { class: 'svcrow__meta' }, [
              el('span', { class: 'catchip__dot', style: { background: st.catVar(sv.catId) } }),
              st.nameOf(c), ' · ', sv.duration + ' dəq'
            ])
          ]),
          el('span', { class: 'svcrow__price', text: U.money(sv.price) })
        ]);
      }))
    ]));

    /* masters */
    wrap.appendChild(el('section', { class: 'clsec' }, [
      el('div', { class: 'clsec__head' }, el('h2', { class: 'clsec__title', text: 'Ustalarımız' })),
      el('div', { class: 'hscroll' }, st.state.staff.slice(0, 8).map(function (m) {
        return el('div', {
          style: { minWidth: '8.5rem', flex: 'none', textAlign: 'center', padding: 'var(--s3)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)' }
        }, [
          el('div', { class: 'avatar avatar--lg', text: U.initials(m.name), style: { margin: '0 auto var(--s2)' } }),
          el('div', { style: { fontSize: 'var(--t-sm)', fontWeight: '600', lineHeight: '1.25' }, text: m.name }),
          el('div', { class: 'dim', style: { fontSize: 'var(--t-xs)' }, text: m.role }),
          el('div', { class: 'mastercard__rate', style: { justifyContent: 'center', marginTop: '.25rem' } }, [
            el('span', { html: icon('star') }), m.rating.toFixed(1)
          ])
        ]);
      }))
    ]));

    /* gallery + reviews */
    wrap.appendChild(el('section', { class: 'clsec' }, [
      el('div', { class: 'clsec__head' }, el('h2', { class: 'clsec__title', text: 'İşlərimiz' })),
      el('div', { class: 'gallery' }, [0, 1, 2, 3, 4, 5].map(function () { return el('i', {}); }))
    ]));
    wrap.appendChild(el('section', { class: 'clsec' }, [
      el('div', { class: 'clsec__head' }, el('h2', { class: 'clsec__title', text: 'Müştəri rəyləri' })),
      el('div', { class: 'hscroll' }, st.state.reviews.slice(0, 6).map(function (r) {
        var c = st.S.client(r.clientId);
        return el('div', { class: 'revcard' }, [
          el('div', { class: 'revcard__stars' }, [0, 1, 2, 3, 4].slice(0, r.rating).map(function () { return el('span', { html: icon('star') }); })),
          el('p', { class: 'revcard__text', text: r.text }),
          el('div', { class: 'revcard__by', text: (c ? c.name : 'Müştəri') + ' · ' + B.i18n.dateLabel(U.fromKey(r.date), { plain: true }) })
        ]);
      }))
    ]));

    return wrap;
  }

  /* ------------------------------------------------------------- booking -- */
  function screenBook() {
    var wrap = el('div', { class: 'cl__pad' });
    var dur = st.servicesDuration(flow.serviceIds);
    var price = st.servicesPrice(flow.serviceIds);

    wrap.appendChild(el('div', { class: 'steps' }, [
      stepMark(1, 'Xidmət', flow.serviceIds.length > 0),
      el('span', { class: 'steps__bar' }),
      stepMark(2, 'Usta', !!flow.staffId && flow.serviceIds.length > 0),
      el('span', { class: 'steps__bar' }),
      stepMark(3, 'Vaxt', flow.start != null)
    ]));

    /* branch */
    wrap.appendChild(el('div', { class: 'eyebrow', style: { marginBottom: 'var(--s2)' }, text: B.i18n.t('c.chooseBranch') }));
    wrap.appendChild(el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s2)', marginBottom: 'var(--s5)' } },
      st.state.branches.map(function (b) {
        return el('button', {
          class: 'branchcard', 'aria-pressed': flow.branchId === b.id ? 'true' : 'false',
          onclick: function () { flow.branchId = b.id; flow.start = null; flow.staffId = 'any'; render(); }
        }, [
          el('span', { class: 'branchcard__dot', style: { background: b.color } }),
          el('span', { class: 'branchcard__body' }, [
            el('span', { class: 'branchcard__name', text: b.short }),
            el('span', { class: 'branchcard__meta', text: b.address })
          ])
        ]);
      })
    ));

    /* services grouped by category */
    wrap.appendChild(el('div', { class: 'eyebrow', style: { marginBottom: 'var(--s2)' }, text: B.i18n.t('c.chooseService') }));
    var catBox = el('div', { style: { marginBottom: 'var(--s5)' } });
    st.state.categories.forEach(function (c) {
      var list = st.state.services.filter(function (s) { return s.catId === c.id && s.online; });
      if (!list.length) return;
      catBox.appendChild(el('div', {
        class: 'slots__group', style: { display: 'flex', alignItems: 'center', gap: '.375rem' }
      }, [el('span', { class: 'catchip__dot', style: { background: st.catVar(c.id) } }), st.nameOf(c)]));
      list.forEach(function (sv) {
        var on = flow.serviceIds.indexOf(sv.id) >= 0;
        catBox.appendChild(el('button', {
          class: 'svcrow', 'aria-pressed': on ? 'true' : 'false',
          onclick: function () {
            var i = flow.serviceIds.indexOf(sv.id);
            if (i >= 0) flow.serviceIds.splice(i, 1); else flow.serviceIds.push(sv.id);
            flow.start = null;
            if (flow.staffId !== 'any' && flow.serviceIds.length) {
              var ok = st.staffForService(flow.branchId, flow.serviceIds[0])
                .some(function (s) { return s.id === flow.staffId; });
              if (!ok) flow.staffId = 'any';
            }
            render();
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
    wrap.appendChild(catBox);

    if (!flow.serviceIds.length) { wrap.appendChild(spacer()); return wrap; }

    /* staff */
    var pool = st.staffForService(flow.branchId, flow.serviceIds[0]);
    wrap.appendChild(el('div', { class: 'eyebrow', style: { marginBottom: 'var(--s2)' }, text: B.i18n.t('c.chooseStaff') }));
    var staffBox = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s2)', marginBottom: 'var(--s5)' } });
    staffBox.appendChild(el('button', {
      class: 'mastercard', 'aria-pressed': flow.staffId === 'any' ? 'true' : 'false',
      onclick: function () { flow.staffId = 'any'; flow.start = null; render(); }
    }, [
      el('span', { class: 'avatar', style: { background: 'var(--surface-3)', color: 'var(--ink-2)' }, html: icon('sparkle') }),
      el('span', { class: 'mastercard__body' }, [
        el('span', { class: 'mastercard__name', text: B.i18n.t('c.anyStaff') }),
        el('span', { class: 'mastercard__role', text: 'Ən tez boş olan usta təyin olunur' })
      ])
    ]));
    pool.forEach(function (m) {
      staffBox.appendChild(el('button', {
        class: 'mastercard', 'aria-pressed': flow.staffId === m.id ? 'true' : 'false',
        onclick: function () { flow.staffId = m.id; flow.start = null; render(); }
      }, [
        el('span', { class: 'avatar', text: U.initials(m.name) }),
        el('span', { class: 'mastercard__body' }, [
          el('span', { class: 'mastercard__name', text: m.name }),
          el('span', { class: 'mastercard__role', text: m.role })
        ]),
        el('span', { class: 'mastercard__rate' }, [el('span', { html: icon('star') }), m.rating.toFixed(1)])
      ]));
    });
    wrap.appendChild(staffBox);

    /* date + slots */
    wrap.appendChild(el('div', { class: 'eyebrow', style: { marginBottom: 'var(--s2)' }, text: B.i18n.t('c.chooseTime') }));
    var days = [];
    for (var i = 0; i < 14; i++) days.push(U.addDays(new Date(), i));
    wrap.appendChild(el('div', { class: 'datepick' }, days.map(function (d) {
      var key = U.dkey(d);
      var closed = d.getDay() === 0;
      var free = closed ? [] : st.slotsFor({
        branchId: flow.branchId, dateKey: key, duration: dur,
        staffId: flow.staffId, serviceId: flow.serviceIds[0]
      });
      return el('button', {
        class: 'datepick__d', 'aria-pressed': flow.dateKey === key ? 'true' : 'false',
        'data-full': (!free.length) ? '' : null,
        onclick: function () { flow.dateKey = key; flow.start = null; render(); }
      }, [
        el('span', { text: B.i18n.dow((d.getDay() + 6) % 7) }),
        el('b', { text: d.getDate() + '' }),
        el('span', { text: closed ? '—' : (free.length ? free.length + '' : '0') })
      ]);
    })));

    var slots = st.slotsFor({
      branchId: flow.branchId, dateKey: flow.dateKey, duration: dur,
      staffId: flow.staffId, serviceId: flow.serviceIds[0]
    });
    if (!slots.length) {
      wrap.appendChild(el('div', { class: 'empty' }, [
        el('div', { class: 'empty__icon', html: icon('clock') }),
        el('div', { class: 'empty__title', text: B.i18n.t('c.noSlots') }),
        el('div', { class: 'dim', style: { fontSize: 'var(--t-sm)' }, text: 'Başqa günü və ya başqa ustanı seçin.' })
      ]));
    } else {
      var groups = [['Səhər', 0, 720], ['Günorta', 720, 1020], ['Axşam', 1020, 1440]];
      groups.forEach(function (g) {
        var part = slots.filter(function (s) { return s.start >= g[1] && s.start < g[2]; });
        if (!part.length) return;
        wrap.appendChild(el('div', { class: 'slots__group', text: g[0] }));
        wrap.appendChild(el('div', { class: 'slots' }, part.map(function (s, i) {
          return el('button', {
            class: 'slot', 'aria-pressed': flow.start === s.start ? 'true' : 'false',
            style: { animationDelay: Math.min(i * 18, 360) + 'ms' },
            text: U.hhmm(s.start),
            onclick: function () { flow.start = s.start; flow.pickedStaff = s.staffId; render(); }
          });
        })));
      });
    }

    wrap.appendChild(spacer());
    return wrap;
  }
  function stepMark(n, label, done) {
    return el('span', { class: 'steps__s', 'data-done': done ? '' : null, 'data-active': !done ? '' : null }, [
      el('span', { class: 'steps__n', html: done ? icon('check') : String(n) }), label
    ]);
  }
  function spacer() { return el('div', { style: { height: '5rem' } }); }

  function summaryBar() {
    var show = view === 'book' && flow.serviceIds.length > 0;
    var dur = st.servicesDuration(flow.serviceIds);
    var price = st.servicesPrice(flow.serviceIds);
    var ready = flow.start != null;
    return el('div', { class: 'summary', 'data-show': show ? '' : null }, [
      el('div', { class: 'summary__info' }, [
        el('div', { class: 'summary__l1', text: st.serviceNames(flow.serviceIds) || '—' }),
        el('div', { class: 'summary__l2' }, [
          el('span', { html: icon('clock') }), dur + ' dəq',
          ready ? ' · ' + B.i18n.dateLabel(U.fromKey(flow.dateKey), { plain: true }) + ', ' + U.hhmm(flow.start) : ' · vaxt seçilməyib'
        ])
      ]),
      el('div', { class: 'summary__price', text: U.money(price) }),
      el('button', {
        class: 'btn btn--primary', 'aria-disabled': ready ? null : 'true',
        text: ready ? 'Davam et' : 'Vaxt seçin',
        onclick: function () { if (ready) openConfirm(); }
      })
    ]);
  }

  /* --------------------------------------------------- confirm + consent -- */
  function openConfirm() {
    var c = me();
    var nameInput = el('input', { class: 'input', value: c.name, placeholder: 'Ad Soyad' });
    var phoneInput = el('input', { class: 'input', value: U.phoneFmt(c.phone), placeholder: '+994 __ ___ __ __' });
    var noteInput = el('input', { class: 'input', placeholder: 'Ustaya qeyd (istəyə bağlı)' });
    var consent = el('input', { type: 'checkbox' });
    var err = el('div', { class: 'field__err hidden' }, [el('span', { html: icon('warning') }), 'Davam etmək üçün razılıq lazımdır']);

    var staffName = flow.staffId === 'any'
      ? (flow.pickedStaff ? st.S.staff(flow.pickedStaff).name + ' (avtomatik)' : B.i18n.t('c.anyStaff'))
      : st.S.staff(flow.staffId).name;

    var m = B.ui.modal({
      eyebrow: 'Yazılışı təsdiqləyin',
      title: st.serviceNames(flow.serviceIds),
      body: [
        el('dl', { class: 'insp__rows' }, [
          row('Filial', st.S.branch(flow.branchId).short),
          row('Usta', staffName),
          row('Tarix', B.i18n.dateLabel(U.fromKey(flow.dateKey))),
          row('Saat', U.hhmm(flow.start) + ' – ' + U.hhmm(flow.start + st.servicesDuration(flow.serviceIds))),
          row('Qiymət', U.money(st.servicesPrice(flow.serviceIds)))
        ]),
        el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Ad Soyad' }), nameInput]),
        el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Telefon' }), phoneInput]),
        el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Qeyd' }), noteInput]),
        el('label', { class: 'check' }, [
          consent, el('span', { class: 'check__box' }),
          el('span', { style: { fontSize: 'var(--t-sm)', lineHeight: '1.4' } }, [
            B.i18n.t('c.consent'),
            el('span', { class: 'dim', style: { display: 'block', fontSize: 'var(--t-xs)' }, text: 'Məlumatlar yalnız yazılış və xatırlatma üçün istifadə olunur.' })
          ])
        ]),
        err
      ],
      footer: [
        el('button', { class: 'btn btn--secondary', text: B.i18n.t('common.cancel'), onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--primary', text: B.i18n.t('c.bookNow'),
          onclick: function () {
            if (!consent.checked) { err.classList.remove('hidden'); return; }
            var name = nameInput.value.trim() || c.name;
            c.name = name; c.phone = phoneInput.value.trim() || c.phone;
            st.state.me.name = name;
            var res = st.book({
              branchId: flow.branchId, staffId: flow.staffId === 'any' ? (flow.pickedStaff || 'any') : flow.staffId,
              clientId: c.id, serviceIds: flow.serviceIds, date: flow.dateKey,
              start: flow.start, source: 'online', status: 'pending', note: noteInput.value.trim()
            });
            m.close();
            if (!res.ok) {
              B.ui.toast({ kind: 'warn', title: 'Bu vaxt artıq tutulub', text: 'Zəhmət olmasa başqa saat seçin.' });
              flow.start = null; render(); return;
            }
            lastBooking = res.appointment;
            view = 'done'; render();
          }
        })
      ]
    });
  }
  function row(k, v) { return el('div', { class: 'insp__row' }, [el('dt', { text: k }), el('dd', { text: v })]); }

  function screenDone() {
    var a = lastBooking;
    if (!a) { goto('home'); return el('div'); }
    var code = 'BLN-' + String(a.id).slice(-4).toUpperCase();
    return el('div', { class: 'done' }, [
      el('div', { class: 'done__ring', html: icon('check') }),
      el('h2', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--t-2xl)' }, text: 'Yazılışınız qeydə alındı' }),
      el('p', { class: 'muted', style: { maxWidth: '30ch' }, text: 'Salon təsdiqləyəndən sonra WhatsApp-a bildiriş gələcək. Görüşdən əvvəl xatırlatma da göndəriləcək.' }),
      el('div', { class: 'done__code', text: code }),
      el('dl', { class: 'insp__rows', style: { width: '100%', marginTop: 'var(--s3)' } }, [
        row('Xidmət', st.serviceNames(a.serviceIds)),
        row('Usta', st.S.staff(a.staffId).name),
        row('Filial', st.S.branch(a.branchId).short),
        row('Vaxt', B.i18n.dateLabel(U.fromKey(a.date), { plain: true }) + ', ' + U.hhmm(a.start)),
        row('Qiymət', U.money(a.price))
      ]),
      el('div', { style: { display: 'flex', gap: 'var(--s2)', width: '100%', marginTop: 'var(--s3)' } }, [
        el('button', { class: 'btn btn--secondary', style: { flex: '1' }, text: 'Yazılışlarım', onclick: function () { goto('bookings'); } }),
        el('button', { class: 'btn btn--primary', style: { flex: '1' }, text: 'Salona qayıt', onclick: function () { goto('home'); } })
      ])
    ]);
  }

  /* ------------------------------------------------------- my bookings --- */
  function screenBookings() {
    var wrap = el('div', { class: 'cl__pad' });
    var up = upcoming();
    var past = myBookings().filter(function (a) { return up.indexOf(a) < 0; }).reverse();

    wrap.appendChild(el('h2', { class: 'clsec__title', style: { marginBottom: 'var(--s3)' }, text: B.i18n.t('c.myBookings') }));

    if (!up.length) {
      wrap.appendChild(el('div', { class: 'empty' }, [
        el('div', { class: 'empty__icon', html: icon('journal') }),
        el('div', { class: 'empty__title', text: 'Gələcək yazılışınız yoxdur' }),
        el('button', { class: 'btn btn--primary', style: { marginTop: 'var(--s2)' }, text: 'Onlayn yazıl', onclick: function () { goto('book'); } })
      ]));
    } else {
      wrap.appendChild(el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' } },
        up.map(function (a) { return bookingCard(a, true); })));
    }

    if (past.length) {
      wrap.appendChild(el('div', { class: 'slots__group', style: { marginTop: 'var(--s6)' }, text: 'Keçmiş yazılışlar' }));
      wrap.appendChild(el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s2)' } },
        past.slice(0, 8).map(function (a) { return bookingCard(a, false); })));
    }
    wrap.appendChild(spacer());
    return wrap;
  }

  function bookingCard(a, active) {
    var d = U.fromKey(a.date);
    var svc = st.S.service(a.serviceIds[0]);
    var statusBadge = {
      pending: ['badge--warn', B.i18n.t('st.pending')],
      confirmed: ['badge--ok', B.i18n.t('st.confirmed')],
      arrived: ['badge--info', B.i18n.t('st.arrived')],
      paid: ['badge--neutral', B.i18n.t('st.paid')],
      cancelled: ['badge--danger', B.i18n.t('st.cancelled')],
      noshow: ['badge--danger', B.i18n.t('st.noshow')]
    }[a.status] || ['badge--neutral', a.status];

    return el('div', {
      class: 'bkcard', style: { '--bk-rail': st.catVarOfService(a.serviceIds[0]), opacity: active ? 1 : .72 }
    }, [
      el('div', { class: 'bkcard__when' }, [
        el('div', { class: 'bkcard__day', text: d.getDate() + '' }),
        el('div', { class: 'bkcard__mon', text: B.i18n.month(d.getMonth()).slice(0, 3) })
      ]),
      el('div', { class: 'bkcard__body' }, [
        el('div', { class: 'bkcard__svc', text: st.serviceNames(a.serviceIds) }),
        el('div', { class: 'bkcard__meta' }, [
          el('span', { html: icon('clock') }), U.hhmm(a.start),
          el('span', { class: 'dot-sep', text: '·' }),
          el('span', { html: icon('user') }), st.S.staff(a.staffId).name
        ]),
        el('div', { class: 'bkcard__meta' }, [
          el('span', { html: icon('map') }), st.S.branch(a.branchId).short,
          el('span', { class: 'dot-sep', text: '·' }), U.money(a.price)
        ]),
        el('div', { style: { marginTop: '.25rem' } }, el('span', { class: 'badge ' + statusBadge[0], text: statusBadge[1] })),
        active ? el('div', { class: 'bkcard__acts' }, [
          el('button', { class: 'btn btn--sm btn--secondary', text: B.i18n.t('c.reschedule'), onclick: function () { openReschedule(a); } }),
          el('button', {
            class: 'btn btn--sm btn--danger', text: B.i18n.t('c.cancelBooking'),
            onclick: function () {
              B.ui.confirm({
                title: 'Yazılışı ləğv edək?', danger: true,
                text: st.serviceNames(a.serviceIds) + ' — ' + B.i18n.dateLabel(U.fromKey(a.date), { plain: true }) + ', ' + U.hhmm(a.start),
                confirmLabel: 'Bəli, ləğv et'
              }).then(function (ok) {
                if (!ok) return;
                st.cancel(a.id, { by: 'client' });
                B.ui.toast({ kind: 'info', title: B.i18n.t('t.cancelled'), text: 'Salon bu barədə dərhal xəbərdar oldu.' });
                render();
              });
            }
          })
        ]) : (a.status === 'paid' ? el('div', { class: 'bkcard__acts' }, [
          el('button', {
            class: 'btn btn--sm btn--soft', text: B.i18n.t('c.rebook'),
            onclick: function () { goto('book'); flow.serviceIds = a.serviceIds.slice(); flow.branchId = a.branchId; render(); }
          })
        ]) : null)
      ])
    ]);
  }

  function openReschedule(a) {
    var pickDate = a.date, pickStart = null;
    var body = el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' } });
    function paint() {
      clear(body);
      var days = [];
      for (var i = 0; i < 10; i++) days.push(U.addDays(new Date(), i));
      body.appendChild(el('div', { class: 'datepick' }, days.map(function (d) {
        var key = U.dkey(d);
        return el('button', {
          class: 'datepick__d', 'aria-pressed': pickDate === key ? 'true' : 'false',
          onclick: function () { pickDate = key; pickStart = null; paint(); }
        }, [el('span', { text: B.i18n.dow((d.getDay() + 6) % 7) }), el('b', { text: d.getDate() + '' })]);
      })));
      var slots = st.slotsFor({
        branchId: a.branchId, dateKey: pickDate, duration: a.duration,
        staffId: a.staffId, exceptId: a.id
      });
      if (!slots.length) body.appendChild(el('div', { class: 'empty', text: B.i18n.t('c.noSlots') }));
      else body.appendChild(el('div', { class: 'slots' }, slots.map(function (s) {
        return el('button', {
          class: 'slot', 'aria-pressed': pickStart === s.start ? 'true' : 'false', text: U.hhmm(s.start),
          onclick: function () { pickStart = s.start; paint(); }
        });
      })));
    }
    paint();
    var m = B.ui.modal({
      eyebrow: st.serviceNames(a.serviceIds), title: B.i18n.t('c.reschedule'), body: body,
      footer: [
        el('button', { class: 'btn btn--secondary', text: B.i18n.t('common.cancel'), onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--primary', text: B.i18n.t('common.save'),
          onclick: function () {
            if (pickStart == null) { B.ui.toast({ kind: 'warn', title: 'Saat seçilməyib' }); return; }
            var r = st.reschedule(a.id, { date: pickDate, start: pickStart });
            m.close();
            B.ui.toast(r.ok
              ? { kind: 'ok', title: 'Vaxt dəyişdirildi', text: 'Salon panelində də yeniləndi.' }
              : { kind: 'warn', title: 'Bu vaxt tutulub' });
            render();
          }
        })
      ]
    });
  }

  /* ---------------------------------------------------------- products --- */
  function screenProducts() {
    var wrap = el('div', { class: 'cl__pad' });
    wrap.appendChild(el('h2', { class: 'clsec__title', style: { marginBottom: 'var(--s2)' }, text: 'Kosmetika məhsulları' }));
    wrap.appendChild(el('p', { class: 'muted', style: { fontSize: 'var(--t-sm)', marginBottom: 'var(--s4)' }, text: 'Sifariş edin, salondan götürün. Ödəniş salonda edilir.' }));
    wrap.appendChild(el('div', { class: 'clprod' }, st.state.products.map(function (p) {
      var qty = st.stockOf(p.id, flow.branchId || 'all');
      return el('div', { class: 'clprod__c' }, [
        el('div', { class: 'clprod__img', html: icon('box') }),
        el('div', { class: 'clprod__brand', text: p.brand }),
        el('div', { class: 'clprod__name', text: p.name }),
        el('div', { class: 'clprod__row' }, [
          el('span', { class: 'clprod__price', text: U.money(p.price) }),
          qty > 0
            ? el('button', { class: 'btn btn--sm btn--soft', text: 'Sifariş', onclick: function () { orderProduct(p); } })
            : el('span', { class: 'badge badge--neutral', text: 'Bitib' })
        ])
      ]);
    })));
    wrap.appendChild(spacer());
    return wrap;
  }

  function orderProduct(p) {
    var branchSel = el('select', { class: 'select' }, st.state.branches.map(function (b) {
      return el('option', { value: b.id, text: b.short + ' — ' + st.stockOf(p.id, b.id) + ' ədəd' });
    }));
    if (flow.branchId) branchSel.value = flow.branchId;
    var m = B.ui.modal({
      eyebrow: p.brand, title: p.name,
      body: [
        el('div', { class: 'co__total' }, [el('span', { text: 'Qiymət' }), el('b', { text: U.money(p.price) })]),
        el('div', { class: 'field' }, [el('label', { class: 'field__label', text: 'Hansı filialdan götürəcəksiniz?' }), branchSel]),
        el('p', { class: 'muted', style: { fontSize: 'var(--t-sm)' }, text: 'Sifariş salon panelinə düşəcək, məhsul sizin üçün kənara qoyulacaq. Ödəniş salonda nağd və ya kartla edilir.' })
      ],
      footer: [
        el('button', { class: 'btn btn--secondary', text: B.i18n.t('common.cancel'), onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--primary', text: B.i18n.t('c.reserve'),
          onclick: function () {
            st.state.productOrders.unshift({
              id: U.uid('po'), branchId: branchSel.value, clientId: st.state.me.clientId,
              items: [{ id: p.id, qty: 1, price: p.price }], status: 'new', at: Date.now()
            });
            st.logMessage({
              channel: 'whatsapp', to: me().phone, name: me().name, kind: 'order',
              text: 'Sifarişiniz qeydə alındı: ' + p.name + ' — ' + U.money(p.price) +
                '. ' + st.S.branch(branchSel.value).name + ' filialından götürə bilərsiniz.'
            });
            st.emit({ type: 'product-order' });
            m.close();
            B.ui.toast({ kind: 'ok', title: 'Sifariş göndərildi', text: 'Salon paneli bu sifarişi dərhal gördü.' });
          }
        })
      ]
    });
  }

  /* ----------------------------------------------------------- profile --- */
  function screenProfile() {
    var c = me();
    var wrap = el('div', {});
    wrap.appendChild(el('div', { class: 'profhead' }, [
      el('div', { class: 'avatar avatar--xl', text: U.initials(c.name) }),
      el('div', { style: { minWidth: 0 } }, [
        el('div', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--t-xl)', fontWeight: '600' }, text: c.name }),
        el('div', { class: 'dim', style: { fontSize: 'var(--t-sm)' }, text: U.phoneFmt(c.phone) }),
        el('div', { class: 'dim', style: { fontSize: 'var(--t-xs)', marginTop: '.25rem' }, text: c.visits + ' səfər · ' + U.money(c.totalSpend) + ' ümumi' })
      ])
    ]));
    wrap.appendChild(el('div', { class: 'cl__pad', style: { paddingTop: 0 } }, [
      el('div', { class: 'bonuscard' }, [
        el('div', { class: 'bonuscard__label', text: B.i18n.t('c.bonus') }),
        el('div', { class: 'bonuscard__val', text: U.money(c.bonus) }),
        el('div', { class: 'bonuscard__note', text: 'Hər ödənişdən 5% bonus yığılır. Növbəti səfərinizdə istifadə edə bilərsiniz.' })
      ]),
      el('div', { class: 'slots__group', text: 'Parametrlər' }),
      el('div', { class: 'panel' }, [
        settingRow('Bildirişlər', 'WhatsApp ilə xatırlatma və təsdiq', true),
        settingRow('Kampaniya mesajları', 'Endirim və yeni xidmət xəbərləri', true),
        settingRow('Şəxsi məlumatların emalı', 'Razılıq verilib · geri götürmək olar', true)
      ]),
      el('div', { class: 'slots__group', text: 'Dil' }),
      el('div', { style: { display: 'flex', gap: 'var(--s2)' } }, B.i18n.langs.map(function (l) {
        return el('button', {
          class: 'chip', 'aria-pressed': B.i18n.get() === l ? 'true' : 'false',
          text: { az: 'Azərbaycanca', ru: 'Русский', en: 'English' }[l],
          onclick: function () { B.i18n.set(l); st.emit({ type: 'lang' }); }
        });
      })),
      spacer()
    ]));
    return wrap;
  }
  function settingRow(title, desc, on) {
    var input = el('input', { type: 'checkbox' });
    input.checked = on;
    return el('div', { class: 'setrow' }, [
      el('div', { class: 'setrow__body' }, [
        el('div', { class: 'setrow__title', text: title }),
        el('div', { class: 'setrow__desc', text: desc })
      ]),
      el('label', { class: 'switch' }, [input, el('span', { class: 'switch__track' })])
    ]);
  }

  /* ================================================================ shell */
  function navItem(id, key, iconName) {
    var badge = id === 'bookings' ? upcoming().length : 0;
    return el('a', {
      href: '#', 'aria-current': view === id || (id === 'bookings' && view === 'done') ? 'page' : null,
      onclick: function (e) { e.preventDefault(); goto(id); }
    }, [
      el('span', { html: icon(iconName) }),
      el('span', { text: B.i18n.t(key) }),
      badge ? el('span', { class: 'clnav__badge', text: badge + '' }) : null
    ]);
  }

  function render() {
    if (!root) return;
    clear(scrollEl);
    var content =
      view === 'home' ? screenHome() :
        view === 'book' ? screenBook() :
          view === 'done' ? screenDone() :
            view === 'bookings' ? screenBookings() :
              view === 'products' ? screenProducts() :
                screenProfile();
    scrollEl.appendChild(content);

    clear(navEl);
    B.dom.append(navEl, [
      navItem('home', 'c.home', 'home'),
      navItem('book', 'c.book', 'calendarDay'),
      navItem('bookings', 'c.myBookings', 'journal'),
      navItem('products', 'c.products', 'box'),
      navItem('profile', 'c.profile', 'user')
    ]);

    var old = root.querySelector('.summary');
    if (old) old.parentNode.removeChild(old);
    root.insertBefore(summaryBar(), navEl);
  }

  function mount(host, opts) {
    root = el('div', { class: 'cl' });
    scrollEl = el('div', { class: 'cl__scroll' });
    navEl = el('nav', { class: 'clnav', 'aria-label': 'Müştəri naviqasiyası' });

    var top = el('div', { class: 'cl__top' }, [
      el('div', { class: 'cl__logo' }, [
        el('span', { html: B.mark() }),
        el('b', { text: 'Bellinaya' })
      ]),
      el('div', { class: 'langpick' }, B.i18n.langs.map(function (l) {
        return el('button', {
          'aria-pressed': B.i18n.get() === l ? 'true' : 'false', text: l,
          onclick: function () { B.i18n.set(l); st.emit({ type: 'lang' }); }
        });
      }))
    ]);

    root.appendChild(top);
    root.appendChild(scrollEl);
    root.appendChild(navEl);
    host.appendChild(root);

    flow.branchId = st.state.branches[0].id;
    flow.dateKey = U.dkey(new Date());
    render();

    if (opts && opts.intro) {
      root.appendChild(buildIntro(function () { }));
    }

    st.sub(function (ev) {
      if (ev.type === 'lang') { render(); return; }
      if (['book', 'cancel', 'reschedule', 'status', 'checkout', 'reset', 'gapfill-done'].indexOf(ev.type) >= 0) render();
    });
    return { render: render, goto: goto };
  }

  B.client = { mount: mount, render: function () { render(); } };
})();
