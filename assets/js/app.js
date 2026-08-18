/* ==========================================================================
   Bellinaya — bootstrap: modes, theme, command palette, cross-side wiring
   ========================================================================== */
(function () {
  var el = B.dom.el, clear = B.dom.clear, $ = B.dom.$;
  var U = B.util, st = B.store, icon = B.icon;

  /* -------------------------------------------------------------- brand -- */
  /** Compact monogram: the logo's B bowl + a hair swirl. Theme-aware by build. */
  B.mark = function (size) {
    return '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"' +
      (size ? ' width="' + size + '" height="' + size + '"' : '') + '>' +
      '<defs><linearGradient id="bmark" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#E4A89C"/><stop offset="52%" stop-color="#C08478"/>' +
      '<stop offset="100%" stop-color="#9C5448"/></linearGradient></defs>' +
      '<rect x="1" y="1" width="38" height="38" rx="11" fill="url(#bmark)"/>' +
      '<path d="M14.6 28.4V11.8h5.9c2.7 0 4.4 1.3 4.4 3.6 0 1.7-1 2.9-2.6 3.3 2 .3 3.3 1.7 3.3 3.8 0 2.6-2 4.3-5.1 4.3h-5.9Z" ' +
      'fill="none" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"/>' +
      '<path d="M27.2 9.6c2.6 2.3 3.4 5.4 2 8.2" stroke="#fff" stroke-width="1.7" stroke-linecap="round" opacity=".92"/>' +
      '<path d="M29.9 8.2c3.5 3 4.5 7.3 2.6 11" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>' +
      '</svg>';
  };

  /* -------------------------------------------------------------- theme -- */
  B.setTheme = function (mode) {
    st.state.settings.theme = mode;
    if (mode === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
    st.persist();
  };
  function initTheme() {
    var m = st.state.settings.theme || 'auto';
    if (m !== 'auto') document.documentElement.setAttribute('data-theme', m);
  }
  function cycleTheme() {
    var cur = st.state.settings.theme || 'auto';
    var next = cur === 'auto' ? 'light' : (cur === 'light' ? 'dark' : 'auto');
    B.setTheme(next);
    B.ui.toast({ kind: 'info', title: 'Tema: ' + { auto: 'Sistem', light: 'İşıqlı', dark: 'Qaranlıq' }[next], duration: 1800 });
    paintThemeBtn();
  }
  var themeBtn;
  function paintThemeBtn() {
    if (!themeBtn) return;
    var m = st.state.settings.theme || 'auto';
    themeBtn.innerHTML = icon(m === 'dark' ? 'moon' : (m === 'light' ? 'sun' : 'globe'));
    themeBtn.title = 'Tema: ' + { auto: 'Sistem', light: 'İşıqlı', dark: 'Qaranlıq' }[m];
  }

  /* ---------------------------------------------------------- app modes -- */
  var mode = 'admin';   /* admin | client | split */
  var viewport, stageAdmin, stageClient, adminApi, clientApi, clientMounted = false;

  function setMode(m) {
    mode = m;
    viewport.setAttribute('data-mode', m);
    try { localStorage.setItem('bellinaya.mode', m); } catch (e) { }
    B.dom.$$('.modebar .seg__btn').forEach(function (b) {
      b.setAttribute('aria-selected', b.getAttribute('data-mode') === m ? 'true' : 'false');
    });
    if ((m === 'client' || m === 'split') && !clientMounted) {
      clientMounted = true;
      clientApi = B.client.mount(stageClient, { intro: true });
    }
    if (m !== 'client') setTimeout(function () { adminApi && adminApi.render(); }, 30);
  }

  /* ------------------------------------------------------ command palette */
  B.cmdk = (function () {
    var node, input, list, items = [], sel = 0;
    function build() {
      input = el('input', { placeholder: B.i18n.t('search.placeholder'), 'aria-label': B.i18n.t('common.search') });
      list = el('div', { class: 'cmdk__list', role: 'listbox' });
      node = el('div', { class: 'cmdk' }, el('div', { class: 'cmdk__box' }, [
        el('div', { class: 'cmdk__input' }, [el('span', { html: icon('search') }), input, el('span', { class: 'kbd', text: 'Esc' })]),
        list
      ]));
      node.addEventListener('click', function (e) { if (e.target === node) close(); });
      input.addEventListener('input', paint);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); mark(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
        else if (e.key === 'Enter') { e.preventDefault(); if (items[sel]) { items[sel].run(); close(); } }
        else if (e.key === 'Escape') close();
      });
      document.body.appendChild(node);
    }
    function paint() {
      var q = U.fold(input.value);
      items = [];
      B.admin.PAGES.forEach(function (p) {
        var label = B.i18n.t(p.key);
        if (!q || U.fold(label).indexOf(q) >= 0) items.push({ group: 'Ekranlar', icon: p.icon, label: label, run: function () { adminApi.go(p.id); } });
      });
      if (q) {
        st.state.clients.filter(function (c) { return U.fold(c.name).indexOf(q) >= 0 || c.phone.indexOf(input.value.replace(/\D/g, '')) >= 0; })
          .slice(0, 6).forEach(function (c) {
            items.push({ group: 'Müştərilər', icon: 'user', label: c.name, hint: U.phoneFmt(c.phone), run: function () { adminApi.go('clients'); } });
          });
        st.state.services.filter(function (s) { return U.fold(st.nameOf(s)).indexOf(q) >= 0; })
          .slice(0, 5).forEach(function (s) {
            items.push({ group: 'Xidmətlər', icon: 'services', label: st.nameOf(s), hint: U.money(s.price), run: function () { adminApi.go('services'); } });
          });
      }
      items.push({ group: 'Əməliyyatlar', icon: 'plus', label: 'Yeni yazılış yarat', run: function () { adminApi.openQuickBook(); } });
      items.push({ group: 'Əməliyyatlar', icon: 'cart', label: 'Məhsul sat', run: function () { adminApi.go('products'); } });
      items.push({ group: 'Əməliyyatlar', icon: 'moon', label: 'Temanı dəyiş', run: cycleTheme });
      items.push({ group: 'Əməliyyatlar', icon: 'phone', label: 'Müştəri səhifəsinə keç', run: function () { setMode('client'); } });

      clear(list);
      var lastGroup = null;
      items.forEach(function (it, i) {
        if (it.group !== lastGroup) { lastGroup = it.group; list.appendChild(el('div', { class: 'cmdk__group', text: it.group })); }
        list.appendChild(el('button', {
          class: 'cmdk__item', role: 'option', 'data-i': i,
          onclick: function () { it.run(); close(); }
        }, [el('span', { html: icon(it.icon) }), el('span', { text: it.label }), it.hint ? el('small', { text: it.hint }) : null]));
      });
      sel = 0; mark();
    }
    function mark() {
      B.dom.$$('.cmdk__item', list).forEach(function (n, i) {
        n.setAttribute('aria-selected', i === sel ? 'true' : 'false');
        if (i === sel) n.scrollIntoView({ block: 'nearest' });
      });
    }
    function open() {
      if (!node) build();
      input.value = ''; paint();
      node.style.display = 'grid';
      requestAnimationFrame(function () { node.setAttribute('data-open', ''); input.focus(); });
    }
    function close() {
      if (!node) return;
      node.removeAttribute('data-open');
      setTimeout(function () { node.style.display = 'none'; }, 200);
    }
    return { open: open, close: close };
  })();

  /* ------------------------------------------------------------- welcome -- */
  function welcome() {
    var seen;
    try { seen = localStorage.getItem('bellinaya.welcome'); } catch (e) { }
    if (seen) return;
    try { localStorage.setItem('bellinaya.welcome', '1'); } catch (e) { }
    var steps = [
      ['calendarDay', 'Müştəri kimi yazılın', 'Yuxarıdan «Müştəri səhifəsi»nə keçin, xidmət və vaxt seçib yazılış edin.'],
      ['journal', 'Salon panelində görün', '«Salon paneli»nə qayıdın — həmin yazılış jurnalda dərhal görünəcək.'],
      ['wallet', 'Ödəniş alın', 'Yazılışa toxunun, «Gəldi» edin, sonra «Ödəniş al» — xidmətə kosmetika məhsulu da əlavə edin.'],
      ['zap', 'Boş yeri doldurun', 'Bir yazılışı ləğv edin — sistem gözləmə siyahısına təklif göndərib yeri özü dolduracaq.'],
      ['analytics', 'Nəticəni izləyin', 'Anbar qalığı, kassa, ustanın faizi və analitika — hamısı həmin an yenilənir.']
    ];
    B.ui.modal({
      eyebrow: 'Nümayiş versiyası',
      title: 'Bellinaya-nı beş addımda sınayın',
      body: [
        el('p', { class: 'muted', style: { fontSize: 'var(--t-sm)' }, text: 'Hər şey işləkdir. Daxil etdiyiniz məlumat brauzerinizdə saxlanılır — istədiyiniz kimi sınaya bilərsiniz.' }),
        el('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' } }, steps.map(function (s, i) {
          return el('div', { style: { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start' } }, [
            el('span', {
              style: {
                width: '2rem', height: '2rem', borderRadius: 'var(--r-sm)', flex: 'none', display: 'grid',
                placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent-text)'
              }, html: icon(s[0])
            }),
            el('div', {}, [
              el('div', { style: { fontWeight: '600', fontSize: 'var(--t-base)' }, text: (i + 1) + '. ' + s[1] }),
              el('div', { class: 'dim', style: { fontSize: 'var(--t-sm)', lineHeight: '1.45' }, text: s[2] })
            ])
          ]);
        }))
      ],
      footer: [
        el('button', { class: 'btn btn--secondary', text: 'Salon panelindən başla', onclick: function () { B.ui.closeModal(); } }),
        el('button', { class: 'btn btn--primary', text: 'Müştəri kimi başla', onclick: function () { B.ui.closeModal(); setMode('client'); } })
      ]
    });
  }

  /* ---------------------------------------------------------------- boot -- */
  function boot() {
    initTheme();

    var modebar = el('div', { class: 'modebar' }, [
      el('div', { class: 'modebar__brand' }, [
        el('span', { html: B.mark() }),
        el('span', { text: 'Bellinaya' }),
        el('span', { class: 'badge badge--neutral', style: { background: 'rgba(255,255,255,.14)', color: 'rgba(255,255,255,.9)', borderColor: 'transparent' }, text: 'DEMO' })
      ]),
      el('div', { class: 'seg', role: 'tablist', 'aria-label': 'Rejim' }, [
        modeBtn('admin', 'mode.admin'), modeBtn('client', 'mode.client'), modeBtn('split', 'mode.split')
      ]),
      el('div', { class: 'modebar__right' }, [
        themeBtn = el('button', { class: 'btn btn--ghost btn--icon btn--sm', onclick: cycleTheme, 'aria-label': 'Tema' }),
        el('button', { class: 'btn btn--ghost btn--icon btn--sm', 'aria-label': 'Kömək', html: icon('info'), onclick: function () { try { localStorage.removeItem('bellinaya.welcome'); } catch (e) { } welcome(); } })
      ])
    ]);
    paintThemeBtn();

    /* admin shell */
    var titleEl = el('h1', { text: '' }), subEl = el('p', { text: '' }), toolsEl = el('div', { class: 'topbar__tools' });
    var contentHost = el('div', { style: { flex: '1', minHeight: 0, display: 'flex', flexDirection: 'column' } });
    var rail = el('aside', { class: 'rail' }, [
      el('div', { class: 'rail__brand' }, [
        el('span', { class: 'rail__mark', html: B.mark() }),
        el('div', { class: 'rail__word' }, ['Bellinaya', el('small', { text: 'salon manager' })])
      ])
    ]);
    var topbar = el('header', { class: 'topbar' }, [
      el('div', { class: 'topbar__title' }, [titleEl, subEl]), toolsEl
    ]);
    var tabbar = el('nav', { class: 'tabbar', 'aria-label': 'Naviqasiya' });
    var main = el('div', { class: 'main' }, [topbar, contentHost, tabbar]);
    var app = el('div', { class: 'app' }, [rail, main]);
    stageAdmin = el('div', { class: 'stage__admin' }, app);
    stageClient = el('div', { class: 'stage__client' });

    viewport = el('div', { class: 'viewport', 'data-mode': 'admin' }, [
      modebar, el('div', { class: 'stage' }, [stageClient, stageAdmin])
    ]);
    document.body.appendChild(viewport);

    adminApi = B.admin.mount({ host: contentHost, titleEl: titleEl, subEl: subEl, toolsEl: toolsEl });
    B.__adminApi = adminApi;          /* handle for tests and console debugging */
    rail.appendChild(adminApi.buildRail());
    rail.appendChild(el('div', { class: 'rail__foot' }, [
      el('button', {
        class: 'navlink', onclick: function () { setMode('client'); }
      }, [el('span', { html: icon('phone') }), el('span', { class: 'navlink__label', text: 'Müştəri görünüşü' })])
    ]));
    adminApi.paintTabbar(tabbar);

    /* restore mode */
    var saved;
    try { saved = localStorage.getItem('bellinaya.mode'); } catch (e) { }
    setMode(saved && ['admin', 'client', 'split'].indexOf(saved) >= 0 ? saved : 'admin');

    /* keyboard */
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); B.cmdk.open(); }
    });
    window.addEventListener('hashchange', function () {
      var h = (location.hash || '').replace('#', '');
      if (h && h !== adminApi.page && B.admin.PAGES.some(function (p) { return p.id === h; })) adminApi.go(h);
    });

    /* ---- the live link: client actions surface on the panel immediately ---- */
    st.sub(function (ev) {
      if (ev.type === 'book' && ev.appointment && ev.appointment.source === 'online') {
        var a = ev.appointment, c = st.S.client(a.clientId);
        if (mode !== 'client') {
          B.ui.toast({
            kind: 'info', duration: 7000,
            title: 'Yeni onlayn yazılış',
            text: c.name + ' — ' + st.serviceNames(a.serviceIds) + ', ' +
              B.i18n.dateLabel(U.fromKey(a.date), { plain: true }) + ' ' + U.hhmm(a.start),
            action: {
              label: 'Jurnalda göstər', run: function () {
                adminApi.go('journal');
                setTimeout(function () {
                  var n = document.querySelector('.appt[data-id="' + a.id + '"]');
                  if (n) { n.setAttribute('data-new', ''); n.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
                }, 120);
              }
            }
          });
        }
        adminApi.refreshRail();
      }
      if (ev.type === 'cancel' && ev.appointment && ev.appointment.cancelledBy === 'client' && mode !== 'client') {
        var ap = ev.appointment, cl = st.S.client(ap.clientId);
        B.ui.toast({
          kind: 'warn', duration: 8000,
          title: 'Müştəri yazılışı ləğv etdi',
          text: cl.name + ' — ' + U.hhmm(ap.start) + '. Yer boş qaldı.',
          action: {
            label: 'Yeri doldur', run: function () {
              adminApi.go('journal');
              setTimeout(function () { adminApi.offerGapFill(ap); }, 150);
            }
          }
        });
      }
      if (ev.type === 'product-order' && mode !== 'client') {
        B.ui.toast({ kind: 'info', title: 'Yeni məhsul sifarişi', text: 'Müştəri onlayn sifariş verdi.', action: { label: 'Bax', run: function () { adminApi.go('products'); } } });
      }
      if (['book', 'cancel', 'checkout', 'status', 'reschedule', 'reset'].indexOf(ev.type) >= 0 && mode !== 'client') {
        adminApi.refreshRail();
      }
    });
    setTimeout(welcome, 500);
    var boot0 = document.getElementById('boot');
    if (boot0) boot0.parentNode.removeChild(boot0);
  }

  function modeBtn(m, key) {
    /* two labels: the long one reads better, the short one keeps the bar on one
       line on a narrow phone — Azerbaijani mode names are long. */
    return el('button', {
      class: 'seg__btn', role: 'tab', 'data-mode': m,
      'aria-selected': m === 'admin' ? 'true' : 'false',
      'aria-label': B.i18n.t(key), onclick: function () { setMode(m); }
    }, [
      el('span', { class: 'mode-long', text: B.i18n.t(key) }),
      el('span', { class: 'mode-short', text: B.i18n.t(key + '.s') })
    ]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
