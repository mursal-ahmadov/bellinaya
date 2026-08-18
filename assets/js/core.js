/* ==========================================================================
   Bellinaya — core: dom helpers, formatting, i18n, icons, UI primitives
   Classic script (no modules) so the same files work from GitHub Pages and
   from the inlined single-file build.
   ========================================================================== */
var B = window.B || {};
window.B = B;

/* ---------------------------------------------------------------- DOM ---- */
B.dom = (function () {
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v === true) node.setAttribute(k, '');
      else node.setAttribute(k, v);
    }
    append(node, children);
    return node;
  }
  function append(parent, children) {
    if (children === null || children === undefined || children === false) return parent;
    if (Array.isArray(children)) { children.forEach(function (c) { append(parent, c); }); return parent; }
    parent.appendChild(children.nodeType ? children : document.createTextNode(String(children)));
    return parent;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
  function frag(children) { var f = document.createDocumentFragment(); append(f, children); return f; }
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  /** Escapes text for the few places that must build HTML strings. */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  return { el: el, append: append, clear: clear, frag: frag, $: $, $$: $$, esc: esc };
})();

/* ------------------------------------------------------------ Utility ---- */
B.util = (function () {
  /** Deterministic PRNG so the seeded demo looks identical on every first load. */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }
  function int(rand, a, b) { return a + Math.floor(rand() * (b - a + 1)); }
  function uid(p) { uid.n = (uid.n || 0) + 1; return (p || 'id') + '_' + uid.n.toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

  /* dates — everything is handled as a local 'YYYY-MM-DD' key + minutes-from-midnight */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function startOfWeek(d) { var x = new Date(d.getTime()); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); x.setHours(0, 0, 0, 0); return x; }
  function sameDay(a, b) { return dkey(a) === dkey(b); }
  function hhmm(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }
  function minOf(str) { var p = String(str).split(':'); return (+p[0]) * 60 + (+p[1]); }
  function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function daysBetween(a, b) { return Math.round((fromKey(b) - fromKey(a)) / 86400000); }

  /* money — manat symbol sits AFTER the number, thousands split by a space.
     Grouped by hand rather than via toLocaleString: the az-AZ group separator
     differs between engines (a dot in some, a space in others) and a price must
     not change shape depending on which browser the client opens the demo in. */
  function group(intStr) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function money(v, opts) {
    var n = Math.round(Number(v) || 0);
    var s = (n < 0 ? '−' : '') + group(String(Math.abs(n)));
    return (opts && opts.bare) ? s : s + ' ₼';
  }
  function money2(v) {
    var n = Number(v) || 0, neg = n < 0;
    n = Math.abs(n);
    var whole = Math.floor(n), cents = Math.round((n - whole) * 100);
    return (neg ? '−' : '') + group(String(whole)) + (cents ? ',' + pad(cents) : '') + ' ₼';
  }
  function initials(name) {
    var p = String(name || '').trim().split(/\s+/);
    return ((p[0] || '')[0] || '') + ((p[1] || '')[0] || '');
  }
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 180); };
  }
  /** Normalises Azerbaijani/Turkish letters so search matches however it is typed. */
  function fold(s) {
    return String(s || '').toLowerCase()
      .replace(/ə/g, 'e').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ü/g, 'u');
  }
  function phoneFmt(p) {
    var d = String(p).replace(/\D/g, '');
    if (d.length === 12 && d.slice(0, 3) === '994') d = d.slice(3);
    if (d.length === 9) return '+994 ' + d.slice(0, 2) + ' ' + d.slice(2, 5) + ' ' + d.slice(5, 7) + ' ' + d.slice(7);
    return p;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  return {
    rng: rng, pick: pick, int: int, uid: uid, pad: pad, dkey: dkey, fromKey: fromKey, addDays: addDays,
    startOfWeek: startOfWeek, sameDay: sameDay, hhmm: hhmm, minOf: minOf, nowMin: nowMin,
    daysBetween: daysBetween, money: money, money2: money2, initials: initials, debounce: debounce,
    fold: fold, phoneFmt: phoneFmt, clamp: clamp
  };
})();

/* ---------------------------------------------------------------- i18n --- */
B.i18n = (function () {
  var DICT = {
    az: {
      /* chrome */
      'app.tagline': 'Gözəllik salonu idarəetməsi',
      'mode.admin': 'Salon paneli', 'mode.client': 'Müştəri səhifəsi', 'mode.split': 'Yanaşı nümayiş',
      'nav.overview': 'İcmal', 'nav.journal': 'Jurnal', 'nav.clients': 'Müştərilər',
      'nav.services': 'Xidmətlər', 'nav.products': 'Məhsullar', 'nav.cash': 'Kassa',
      'nav.payroll': 'Əməkhaqqı', 'nav.marketing': 'Marketinq', 'nav.analytics': 'Analitika',
      'nav.staff': 'İşçilər', 'nav.settings': 'Parametrlər',
      'nav.group.work': 'İş', 'nav.group.money': 'Maliyyə', 'nav.group.grow': 'İnkişaf', 'nav.group.setup': 'Quruluş',
      'branch.all': 'Bütün filiallar',
      'search.placeholder': 'Müştəri, xidmət, ekran axtar…',
      'common.today': 'Bu gün', 'common.tomorrow': 'Sabah', 'common.yesterday': 'Dünən',
      'common.save': 'Yadda saxla', 'common.cancel': 'Ləğv et', 'common.close': 'Bağla',
      'common.add': 'Əlavə et', 'common.edit': 'Düzəliş', 'common.delete': 'Sil', 'common.back': 'Geri',
      'common.next': 'Növbəti', 'common.confirm': 'Təsdiqlə', 'common.total': 'Cəmi',
      'common.search': 'Axtar', 'common.all': 'Hamısı', 'common.none': 'Yoxdur', 'common.min': 'dəq',
      'common.from': 'başlayır', 'common.empty': 'Hələ məlumat yoxdur',
      /* statuses */
      'st.pending': 'Təsdiq gözləyir', 'st.confirmed': 'Təsdiqlənib', 'st.arrived': 'Gəldi',
      'st.paid': 'Ödənilib', 'st.cancelled': 'Ləğv olunub', 'st.noshow': 'Gəlmədi',
      'src.online': 'Onlayn', 'src.salon': 'Salondan', 'src.phone': 'Telefonla',
      /* client side */
      'c.book': 'Onlayn yazıl', 'c.myBookings': 'Yazılışlarım', 'c.products': 'Məhsullar',
      'c.profile': 'Profil', 'c.home': 'Salon',
      'c.chooseBranch': 'Filialı seçin', 'c.chooseService': 'Xidməti seçin',
      'c.chooseStaff': 'Ustanı seçin', 'c.chooseTime': 'Tarix və saat',
      'c.yourDetails': 'Məlumatlarınız', 'c.anyStaff': 'Fərqi yoxdur',
      'c.bookNow': 'Yazılışı təsdiqlə', 'c.duration': 'Müddət', 'c.price': 'Qiymət',
      'c.consent': 'Şəxsi məlumatlarımın emalına razıyam',
      'c.reschedule': 'Vaxtı dəyiş', 'c.cancelBooking': 'Ləğv et', 'c.rebook': 'Yenidən yazıl',
      'c.bonus': 'Bonus balansı', 'c.reserve': 'Salondan götürmək üçün sifariş et',
      'c.noSlots': 'Bu gün üçün boş vaxt yoxdur',
      /* toasts */
      't.booked': 'Yazılış qeydə alındı', 't.cancelled': 'Yazılış ləğv olundu',
      't.paid': 'Ödəniş qeydə alındı', 't.saved': 'Yadda saxlanıldı'
    },
    ru: {
      'app.tagline': 'Управление салоном красоты',
      'mode.admin': 'Панель салона', 'mode.client': 'Страница клиента', 'mode.split': 'Рядом',
      'nav.overview': 'Обзор', 'nav.journal': 'Журнал', 'nav.clients': 'Клиенты',
      'nav.services': 'Услуги', 'nav.products': 'Товары', 'nav.cash': 'Касса',
      'nav.payroll': 'Зарплата', 'nav.marketing': 'Маркетинг', 'nav.analytics': 'Аналитика',
      'nav.staff': 'Сотрудники', 'nav.settings': 'Настройки',
      'nav.group.work': 'Работа', 'nav.group.money': 'Финансы', 'nav.group.grow': 'Развитие', 'nav.group.setup': 'Настройка',
      'branch.all': 'Все филиалы',
      'search.placeholder': 'Клиент, услуга, экран…',
      'common.today': 'Сегодня', 'common.tomorrow': 'Завтра', 'common.yesterday': 'Вчера',
      'common.save': 'Сохранить', 'common.cancel': 'Отмена', 'common.close': 'Закрыть',
      'common.add': 'Добавить', 'common.edit': 'Изменить', 'common.delete': 'Удалить', 'common.back': 'Назад',
      'common.next': 'Далее', 'common.confirm': 'Подтвердить', 'common.total': 'Итого',
      'common.search': 'Поиск', 'common.all': 'Все', 'common.none': 'Нет', 'common.min': 'мин',
      'common.from': 'от', 'common.empty': 'Пока нет данных',
      'st.pending': 'Ждёт подтверждения', 'st.confirmed': 'Подтверждено', 'st.arrived': 'Пришёл',
      'st.paid': 'Оплачено', 'st.cancelled': 'Отменено', 'st.noshow': 'Не пришёл',
      'src.online': 'Онлайн', 'src.salon': 'Из салона', 'src.phone': 'По телефону',
      'c.book': 'Записаться', 'c.myBookings': 'Мои записи', 'c.products': 'Товары',
      'c.profile': 'Профиль', 'c.home': 'Салон',
      'c.chooseBranch': 'Выберите филиал', 'c.chooseService': 'Выберите услугу',
      'c.chooseStaff': 'Выберите мастера', 'c.chooseTime': 'Дата и время',
      'c.yourDetails': 'Ваши данные', 'c.anyStaff': 'Не важно',
      'c.bookNow': 'Подтвердить запись', 'c.duration': 'Длительность', 'c.price': 'Цена',
      'c.consent': 'Согласен на обработку персональных данных',
      'c.reschedule': 'Перенести', 'c.cancelBooking': 'Отменить', 'c.rebook': 'Записаться снова',
      'c.bonus': 'Бонусный баланс', 'c.reserve': 'Заказать с самовывозом',
      'c.noSlots': 'На этот день нет свободного времени',
      't.booked': 'Запись создана', 't.cancelled': 'Запись отменена',
      't.paid': 'Оплата принята', 't.saved': 'Сохранено'
    },
    en: {
      'app.tagline': 'Beauty salon management',
      'mode.admin': 'Salon panel', 'mode.client': 'Client page', 'mode.split': 'Side by side',
      'nav.overview': 'Overview', 'nav.journal': 'Journal', 'nav.clients': 'Clients',
      'nav.services': 'Services', 'nav.products': 'Products', 'nav.cash': 'Cash desk',
      'nav.payroll': 'Payroll', 'nav.marketing': 'Marketing', 'nav.analytics': 'Analytics',
      'nav.staff': 'Team', 'nav.settings': 'Settings',
      'nav.group.work': 'Work', 'nav.group.money': 'Money', 'nav.group.grow': 'Grow', 'nav.group.setup': 'Setup',
      'branch.all': 'All branches',
      'search.placeholder': 'Client, service, screen…',
      'common.today': 'Today', 'common.tomorrow': 'Tomorrow', 'common.yesterday': 'Yesterday',
      'common.save': 'Save', 'common.cancel': 'Cancel', 'common.close': 'Close',
      'common.add': 'Add', 'common.edit': 'Edit', 'common.delete': 'Delete', 'common.back': 'Back',
      'common.next': 'Next', 'common.confirm': 'Confirm', 'common.total': 'Total',
      'common.search': 'Search', 'common.all': 'All', 'common.none': 'None', 'common.min': 'min',
      'common.from': 'from', 'common.empty': 'Nothing here yet',
      'st.pending': 'Awaiting confirmation', 'st.confirmed': 'Confirmed', 'st.arrived': 'Arrived',
      'st.paid': 'Paid', 'st.cancelled': 'Cancelled', 'st.noshow': 'No-show',
      'src.online': 'Online', 'src.salon': 'In salon', 'src.phone': 'By phone',
      'c.book': 'Book online', 'c.myBookings': 'My bookings', 'c.products': 'Products',
      'c.profile': 'Profile', 'c.home': 'Salon',
      'c.chooseBranch': 'Choose a branch', 'c.chooseService': 'Choose services',
      'c.chooseStaff': 'Choose a specialist', 'c.chooseTime': 'Date and time',
      'c.yourDetails': 'Your details', 'c.anyStaff': 'No preference',
      'c.bookNow': 'Confirm booking', 'c.duration': 'Duration', 'c.price': 'Price',
      'c.consent': 'I agree to the processing of my personal data',
      'c.reschedule': 'Reschedule', 'c.cancelBooking': 'Cancel', 'c.rebook': 'Book again',
      'c.bonus': 'Bonus balance', 'c.reserve': 'Reserve for pickup',
      'c.noSlots': 'No free time on this day',
      't.booked': 'Booking created', 't.cancelled': 'Booking cancelled',
      't.paid': 'Payment recorded', 't.saved': 'Saved'
    }
  };
  var lang = 'az';
  var MONTHS = {
    az: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };
  var DOWS = {
    az: ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cümə', 'Şən', 'Baz'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };
  var DOWS_LONG = {
    az: ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'],
    ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  };
  function t(key, fallback) {
    var d = DICT[lang] || DICT.az;
    return d[key] || DICT.az[key] || fallback || key;
  }
  function set(l) {
    if (!DICT[l]) return;
    lang = l;
    document.documentElement.setAttribute('lang', l);
    try { localStorage.setItem('bellinaya.lang', l); } catch (e) { }
  }
  function get() { return lang; }
  function month(i) { return (MONTHS[lang] || MONTHS.az)[i]; }
  function dow(i) { return (DOWS[lang] || DOWS.az)[i]; }   /* 0 = Monday */
  function dowLong(i) { return (DOWS_LONG[lang] || DOWS_LONG.az)[i]; }
  /** "14 avqust", plus a relative prefix for today / tomorrow / yesterday. */
  function dateLabel(d, opts) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var x = new Date(d.getTime()); x.setHours(0, 0, 0, 0);
    var diff = Math.round((x - today) / 86400000);
    var base = x.getDate() + ' ' + month(x.getMonth());
    if (opts && opts.withYear) base += ' ' + x.getFullYear();
    if (opts && opts.plain) return base;
    if (diff === 0) return t('common.today') + ', ' + base;
    if (diff === 1) return t('common.tomorrow') + ', ' + base;
    if (diff === -1) return t('common.yesterday') + ', ' + base;
    return dowLong((x.getDay() + 6) % 7) + ', ' + base;
  }
  try {
    var saved = localStorage.getItem('bellinaya.lang');
    if (saved && DICT[saved]) lang = saved;
  } catch (e) { }
  document.documentElement.setAttribute('lang', lang);
  return { t: t, set: set, get: get, month: month, dow: dow, dowLong: dowLong, dateLabel: dateLabel, langs: ['az', 'ru', 'en'] };
})();
var T = function (k, f) { return B.i18n.t(k, f); };

/* --------------------------------------------------------------- icons --- */
B.icon = (function () {
  var P = {
    overview: '<path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/>',
    journal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17.5h6"/>',
    clients: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="3.2"/><path d="M17 11a3 3 0 1 0 0-6M22 20v-1.5a4 4 0 0 0-3-3.8"/>',
    services: '<path d="M4 7h16M4 12h16M4 17h10"/><circle cx="18.5" cy="17" r="2.2"/>',
    products: '<path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z"/><path d="m3 8.5 9 4.5 9-4.5M12 13v7"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 10v4M18 10v4"/>',
    payroll: '<path d="M12 2.5v19M16.5 6.5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H7"/>',
    marketing: '<path d="M3.5 10.5v3a1.5 1.5 0 0 0 1.5 1.5h2l5.5 4V5L7 9H5a1.5 1.5 0 0 0-1.5 1.5Z"/><path d="M17 9.2a4 4 0 0 1 0 5.6M19.8 6.5a8 8 0 0 1 0 11"/>',
    analytics: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    staff: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="m4 12.5 5 5L20 6.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevronR: '<path d="m9 5 7 7-7 7"/>',
    chevronL: '<path d="m15 5-7 7 7 7"/>',
    chevronD: '<path d="m5 9 7 7 7-7"/>',
    arrowR: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    arrowUp: '<path d="M12 20V4M5 11l7-7 7 7"/>',
    arrowDown: '<path d="M12 4v16M5 13l7 7 7-7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    phone: '<path d="M6.5 3.5h3l1.5 4-2 1.5a13 13 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    whatsapp: '<path d="M3.5 20.5 5 16.4A8 8 0 1 1 8 19.3l-4.5 1.2Z"/><path d="M9 9.2c.3 2.4 3.4 5.5 5.8 5.8.5.1 1-.2 1.3-.6l.4-.6-2-1.2-.8.8c-1-.4-2-1.4-2.4-2.4l.8-.8-1.2-2-.6.4c-.4.3-.7.8-.6 1.3"/>',
    bell: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/>',
    map: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    star: '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z"/>',
    scissors: '<circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="M8.2 8 20 18M8.2 16 20 6"/>',
    sparkle: '<path d="M12 3.5c.7 4 1.8 5.1 5.8 5.8-4 .7-5.1 1.8-5.8 5.8-.7-4-1.8-5.1-5.8-5.8 4-.7 5.1-1.8 5.8-5.8Z"/><path d="M18.5 15c.4 1.9.9 2.4 2.8 2.8-1.9.4-2.4.9-2.8 2.8-.4-1.9-.9-2.4-2.8-2.8 1.9-.4 2.4-.9 2.8-2.8Z"/>',
    trend: '<path d="M3 17 9.5 10.5l4 4L21 7"/><path d="M15 7h6v6"/>',
    wallet: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3"/><rect x="3" y="7.5" width="18" height="12" rx="2.5"/><circle cx="16.5" cy="13.5" r="1.3"/>',
    box: '<path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z"/><path d="m3 8.5 9 4.5 9-4.5M12 13v7"/>',
    warning: '<path d="M12 4.5 2.8 20h18.4L12 4.5Z"/><path d="M12 10v4.2M12 17.2v.1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/>',
    trash: '<path d="M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13"/>',
    edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 6.5 3 3"/>',
    filter: '<path d="M3.5 5.5h17l-6.5 8v5.5l-4 2v-7.5l-6.5-8Z"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6v.1M3.5 12v.1M3.5 18v.1"/>',
    calendarDay: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><rect x="6.5" y="12.5" width="5" height="5.5" rx="1"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-1.5 5.5"/><path d="M20 5v6h-6"/>',
    logout: '<path d="M14 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H14"/><path d="M17 8.5 20.5 12 17 15.5M20 12h-9"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
    menu: '<path d="M3.5 6h17M3.5 12h17M3.5 18h17"/>',
    cart: '<circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/><path d="M2.5 3.5h2.2l2.4 11h11l2-8H6"/>',
    tag: '<path d="M3.5 11.2V4.5a1 1 0 0 1 1-1h6.7a1 1 0 0 1 .7.3l8.3 8.3a1 1 0 0 1 0 1.4l-6.7 6.7a1 1 0 0 1-1.4 0L3.8 11.9a1 1 0 0 1-.3-.7Z"/><circle cx="8" cy="8" r="1.4"/>',
    gift: '<rect x="3" y="9" width="18" height="11" rx="1.6"/><path d="M3 13h18M12 9v11"/><path d="M12 9S9.5 4 7.5 4a2.2 2.2 0 0 0 0 5M12 9s2.5-5 4.5-5a2.2 2.2 0 0 1 0 5"/>',
    heart: '<path d="M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.3 12 20 12 20Z"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z"/>',
    send: '<path d="m4 12 16-7.5L15 20l-3.5-6L4 12Z"/>',
    zap: '<path d="M13 3 5 13.5h6L11 21l8-10.5h-6L13 3Z"/>',
    lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    receipt: '<path d="M5 3.5h14v17l-2.3-1.5-2.4 1.5-2.3-1.5L9.7 20.5 7.3 19 5 20.5v-17Z"/><path d="M8.5 8h7M8.5 12h7M8.5 15.5h4"/>'
  };
  return function (name, cls) {
    var p = P[name] || P.info;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (cls ? ' class="' + cls + '"' : '') + '>' + p + '</svg>';
  };
})();

/* --------------------------------------------------------- UI primitives -- */
B.ui = (function () {
  var el = B.dom.el, $ = B.dom.$;

  /* ---- toast ---- */
  var toastHost;
  function toast(opts) {
    if (!toastHost) { toastHost = el('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastHost); }
    var kind = opts.kind || 'info';
    var iconName = { ok: 'check', warn: 'warning', danger: 'warning', info: 'info' }[kind] || 'info';
    var node = el('div', { class: 'toast toast--' + kind }, [
      el('div', { class: 'toast__icon', html: B.icon(iconName) }),
      el('div', { style: { minWidth: 0, flex: '1' } }, [
        el('div', { class: 'toast__title', text: opts.title || '' }),
        opts.text ? el('div', { class: 'toast__text', text: opts.text }) : null
      ]),
      opts.action ? el('button', {
        class: 'btn btn--sm btn--soft', text: opts.action.label,
        onclick: function () { opts.action.run(); dismiss(); }
      }) : null
    ]);
    function dismiss() {
      if (!node.parentNode) return;
      node.setAttribute('data-leaving', '');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 220);
    }
    toastHost.appendChild(node);
    setTimeout(dismiss, opts.duration || 4200);
    return dismiss;
  }

  /* ---- scrim shared by drawer + modal ---- */
  var scrim, openLayers = 0;
  function showScrim(onClick) {
    if (!scrim) { scrim = el('div', { class: 'scrim' }); document.body.appendChild(scrim); }
    scrim.onclick = onClick;
    scrim.style.display = 'block';
    requestAnimationFrame(function () { scrim.setAttribute('data-open', ''); });
    openLayers++;
    document.body.style.overflow = 'hidden';
  }
  function hideScrim() {
    openLayers = Math.max(0, openLayers - 1);
    if (openLayers === 0 && scrim) {
      scrim.removeAttribute('data-open');
      document.body.style.overflow = '';
      setTimeout(function () { if (openLayers === 0 && scrim) scrim.style.display = 'none'; }, 220);
    }
  }

  /* ---- drawer (right inspector; becomes a bottom sheet on small screens) ---- */
  var drawerNode, drawerClose;
  function drawer(opts) {
    closeDrawer(true);
    var body = el('div', { class: 'drawer__body' });
    B.dom.append(body, opts.body);
    drawerNode = el('aside', { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title || '' }, [
      el('div', { class: 'drawer__head' }, [
        el('div', { style: { flex: '1', minWidth: 0 } }, [
          opts.eyebrow ? el('div', { class: 'eyebrow', text: opts.eyebrow }) : null,
          el('div', { class: 'drawer__title', text: opts.title || '' }),
          opts.subtitle ? el('div', { class: 'dim', style: { fontSize: 'var(--t-sm)', marginTop: '2px' }, text: opts.subtitle }) : null
        ]),
        el('button', { class: 'btn btn--ghost btn--icon', 'aria-label': T('common.close'), html: B.icon('x'), onclick: function () { closeDrawer(); } })
      ]),
      body,
      opts.footer ? el('div', { class: 'drawer__foot' }, opts.footer) : null
    ]);
    var node = drawerNode;
    document.body.appendChild(node);
    showScrim(function () { closeDrawer(); });
    /* keep a local handle: the drawer may be closed again before this frame runs */
    requestAnimationFrame(function () { if (node.parentNode) node.setAttribute('data-open', ''); });
    drawerClose = opts.onClose;
    return { close: closeDrawer, body: body };
  }
  function closeDrawer(silent) {
    if (!drawerNode) return;
    var n = drawerNode; drawerNode = null;
    n.removeAttribute('data-open');
    if (!silent) hideScrim(); else openLayers = Math.max(0, openLayers - 1);
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 320);
    if (drawerClose) { var f = drawerClose; drawerClose = null; f(); }
  }

  /* ---- modal ---- */
  var modalNode;
  function modal(opts) {
    closeModal(true);
    var box = el('div', { class: 'modal__box', role: 'dialog', 'aria-modal': 'true' }, [
      el('div', { class: 'modal__head' }, [
        el('div', {}, [
          opts.eyebrow ? el('div', { class: 'eyebrow', text: opts.eyebrow }) : null,
          el('h3', { text: opts.title || '' })
        ]),
        el('button', { class: 'btn btn--ghost btn--icon btn--sm', 'aria-label': T('common.close'), html: B.icon('x'), onclick: function () { closeModal(); } })
      ]),
      el('div', { class: 'modal__body' }, opts.body),
      opts.footer ? el('div', { class: 'modal__foot' }, opts.footer) : null
    ]);
    modalNode = el('div', { class: 'modal' }, box);
    var node = modalNode;
    document.body.appendChild(node);
    showScrim(function () { closeModal(); });
    requestAnimationFrame(function () { if (node.parentNode) node.setAttribute('data-open', ''); });
    return { close: closeModal, box: box };
  }
  function closeModal(silent) {
    if (!modalNode) return;
    var n = modalNode; modalNode = null;
    n.removeAttribute('data-open');
    if (!silent) hideScrim(); else openLayers = Math.max(0, openLayers - 1);
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 260);
  }

  function confirm(opts) {
    return new Promise(function (resolve) {
      var m = modal({
        title: opts.title,
        body: el('p', { class: 'muted', text: opts.text || '' }),
        footer: [
          el('button', { class: 'btn btn--secondary', text: opts.cancelLabel || T('common.cancel'), onclick: function () { m.close(); resolve(false); } }),
          el('button', {
            class: 'btn ' + (opts.danger ? 'btn--danger' : 'btn--primary'), text: opts.confirmLabel || T('common.confirm'),
            onclick: function () { m.close(); resolve(true); }
          })
        ]
      });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (modalNode) closeModal(); else if (drawerNode) closeDrawer(); }
  });

  /* ---- animated number ---- */
  function countUp(node, to, fmt, ms) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    fmt = fmt || function (v) { return Math.round(v); };
    if (reduce) { node.textContent = fmt(to); return; }
    var from = 0, t0 = performance.now(), dur = ms || 620;
    function step(t) {
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return {
    toast: toast, drawer: drawer, closeDrawer: closeDrawer, modal: modal, closeModal: closeModal,
    confirm: confirm, countUp: countUp
  };
})();
