/* ==========================================================================
   Bellinaya — seeded demo data
   Deterministic: the same first load every time, so a demo never surprises you.
   Prices are at real Baku market level (women's cut 35–60 AZN, styling from 20).
   ========================================================================== */
(function () {
  var U = B.util;

  var BRANCHES = [
    { id: 'br1', name: 'Bellinaya Nizami', short: 'Nizami', district: 'Səbail', address: 'Nizami küç. 118, Səbail', phone: '+994125050101', open: '09:00', close: '21:00', color: '#A25948' },
    { id: 'br2', name: 'Bellinaya Nərimanov', short: 'Nərimanov', district: 'Nərimanov', address: 'Ə. Səlimzadə 42, Nərimanov', phone: '+994125050102', open: '09:00', close: '21:00', color: '#3A6FD0' },
    { id: 'br3', name: 'Bellinaya Xətai', short: 'Xətai', district: 'Xətai', address: 'Babək pr. 24, Xətai', phone: '+994125050103', open: '10:00', close: '20:00', color: '#0F8F7E' }
  ];

  /* seven categories -> the seven validated palette slots, fixed order */
  var CATEGORIES = [
    { id: 'c1', slot: 1, name: 'Saç', nameRu: 'Волосы', nameEn: 'Hair' },
    { id: 'c2', slot: 2, name: 'Boyama', nameRu: 'Окрашивание', nameEn: 'Colouring' },
    { id: 'c3', slot: 3, name: 'Dırnaq', nameRu: 'Ногти', nameEn: 'Nails' },
    { id: 'c4', slot: 4, name: 'Kirpik və qaş', nameRu: 'Ресницы и брови', nameEn: 'Lashes & brows' },
    { id: 'c5', slot: 5, name: 'Kosmetologiya', nameRu: 'Косметология', nameEn: 'Skin care' },
    { id: 'c6', slot: 6, name: 'Makiyaj', nameRu: 'Макияж', nameEn: 'Make-up' },
    { id: 'c7', slot: 7, name: 'Epilyasiya', nameRu: 'Эпиляция', nameEn: 'Hair removal' }
  ];

  var SERVICES = [
    ['s01', 'c1', 'Qadın saç kəsimi', 'Женская стрижка', "Women's haircut", 45, 45],
    ['s02', 'c1', 'Kişi saç kəsimi', 'Мужская стрижка', "Men's haircut", 25, 30],
    ['s03', 'c1', 'Uşaq saç kəsimi', 'Детская стрижка', "Kids' haircut", 20, 30],
    ['s04', 'c1', 'Fen ilə ştamplama', 'Укладка феном', 'Blow-dry styling', 25, 40],
    ['s05', 'c1', 'Saç yığımı', 'Причёска', 'Updo styling', 60, 60],
    ['s06', 'c1', 'Keratin düzləşdirmə', 'Кератин', 'Keratin treatment', 180, 150],
    ['s07', 'c1', 'Saç maskası və qulluq', 'Уход и маска', 'Hair mask & care', 35, 30],
    ['s08', 'c2', 'Kök boyası', 'Окрашивание корней', 'Root colour', 55, 75],
    ['s09', 'c2', 'Tam boyama', 'Полное окрашивание', 'Full colour', 90, 105],
    ['s10', 'c2', 'Ombre', 'Омбре', 'Ombré', 160, 165],
    ['s11', 'c2', 'Balayaj', 'Балаяж', 'Balayage', 190, 180],
    ['s12', 'c2', 'Melirovanie', 'Мелирование', 'Highlights', 140, 150],
    ['s13', 'c2', 'Ton verici', 'Тонирование', 'Toner', 45, 45],
    ['s14', 'c3', 'Manikür', 'Маникюр', 'Manicure', 25, 45],
    ['s15', 'c3', 'Gel-lak örtük', 'Гель-лак', 'Gel polish', 40, 60],
    ['s16', 'c3', 'Pedikür', 'Педикюр', 'Pedicure', 35, 60],
    ['s17', 'c3', 'Dırnaq uzatma', 'Наращивание ногтей', 'Nail extensions', 70, 90],
    ['s18', 'c3', 'Dırnaq dizaynı', 'Дизайн ногтей', 'Nail art', 15, 20],
    ['s19', 'c4', 'Kirpik uzatma — klassik', 'Классика ресниц', 'Classic lash extensions', 60, 90],
    ['s20', 'c4', 'Kirpik uzatma — 2D/3D', 'Объём 2D/3D', 'Volume lashes 2D/3D', 85, 120],
    ['s21', 'c4', 'Kirpik laminasiyası', 'Ламинирование ресниц', 'Lash lamination', 45, 60],
    ['s22', 'c4', 'Qaş korreksiyası', 'Коррекция бровей', 'Brow shaping', 20, 30],
    ['s23', 'c4', 'Qaş boyama', 'Окрашивание бровей', 'Brow tint', 25, 30],
    ['s24', 'c5', 'Üz təmizləmə', 'Чистка лица', 'Facial cleansing', 70, 75],
    ['s25', 'c5', 'Pilinq', 'Пилинг', 'Peeling', 60, 45],
    ['s26', 'c5', 'Mezoterapiya', 'Мезотерапия', 'Mesotherapy', 120, 60],
    ['s27', 'c5', 'Maska və üz masajı', 'Маска и массаж лица', 'Mask & face massage', 50, 45],
    ['s28', 'c6', 'Gündüz makiyajı', 'Дневной макияж', 'Day make-up', 50, 45],
    ['s29', 'c6', 'Axşam makiyajı', 'Вечерний макияж', 'Evening make-up', 80, 60],
    ['s30', 'c6', 'Gəlin makiyajı', 'Свадебный макияж', 'Bridal make-up', 200, 120],
    ['s31', 'c7', 'Ayaq epilyasiyası', 'Эпиляция ног', 'Leg waxing', 45, 45],
    ['s32', 'c7', 'Qol epilyasiyası', 'Эпиляция рук', 'Arm waxing', 25, 30],
    ['s33', 'c7', 'Lazer — kiçik zona', 'Лазер — малая зона', 'Laser — small area', 40, 30]
  ].map(function (r) {
    return { id: r[0], catId: r[1], name: r[2], nameRu: r[3], nameEn: r[4], price: r[5], duration: r[6], online: true };
  });

  var STAFF = [
    ['st01', 'Nigar Əliyeva', 'Kolorist', ['c2', 'c1'], 'br1', 4.9, 45, 10],
    ['st02', 'Aysel Hüseynova', 'Saç ustası', ['c1', 'c2'], 'br1', 4.8, 40, 10],
    ['st03', 'Günel Məmmədova', 'Dırnaq ustası', ['c3'], 'br1', 4.9, 45, 12],
    ['st04', 'Leyla Quliyeva', 'Kirpik və qaş ustası', ['c4'], 'br1', 5.0, 45, 10],
    ['st05', 'Səbinə Rzayeva', 'Kosmetoloq', ['c5', 'c7'], 'br2', 4.7, 40, 12],
    ['st06', 'Türkan İsmayılova', 'Vizajist', ['c6', 'c4'], 'br2', 4.8, 45, 10],
    ['st07', 'Elnarə Cəfərova', 'Saç ustası', ['c1'], 'br2', 4.6, 40, 8],
    ['st08', 'Ülviyyə Həsənova', 'Dırnaq ustası', ['c3'], 'br2', 4.9, 45, 12],
    ['st09', 'Fidan Abbasova', 'Epilyasiya ustası', ['c7', 'c5'], 'br3', 4.7, 40, 10],
    ['st10', 'Kamran Əliyev', 'Barber', ['c1'], 'br3', 4.9, 45, 8],
    ['st11', 'Rəşad Məmmədov', 'Barber', ['c1'], 'br3', 4.8, 45, 8],
    ['st12', 'Xəyalə Nəbiyeva', 'Kolorist', ['c2', 'c1'], 'br3', 4.8, 45, 10]
  ].map(function (r) {
    return {
      id: r[0], name: r[1], role: r[2], cats: r[3], branchId: r[4], rating: r[5],
      commission: r[6], productCommission: r[7], active: true,
      shift: { start: '10:00', end: '20:00' }, off: [0]   /* 0 = Sunday off */
    };
  });

  var PRODUCTS = [
    ['p01', 'Olaplex No.3 Hair Perfector', 'Olaplex', 'Saç qulluğu', 65, 38],
    ['p02', 'Olaplex No.4 Bond Şampun', 'Olaplex', 'Şampun', 55, 32],
    ['p03', 'Olaplex No.5 Kondisioner', 'Olaplex', 'Kondisioner', 55, 32],
    ['p04', 'Kérastase Nutritive maska', 'Kérastase', 'Saç maskası', 78, 46],
    ['p05', 'Kérastase Elixir Ultime yağı', 'Kérastase', 'Saç yağı', 92, 55],
    ['p06', 'Moroccanoil Treatment 100 ml', 'Moroccanoil', 'Saç yağı', 95, 58],
    ['p07', 'L’Oréal Absolut Repair şampun', 'L’Oréal Pro', 'Şampun', 42, 24],
    ['p08', 'L’Oréal Vitamino Color maska', 'L’Oréal Pro', 'Saç maskası', 48, 27],
    ['p09', 'Wella Invigo Blonde şampun', 'Wella', 'Şampun', 38, 21],
    ['p10', 'Matrix Total Results serum', 'Matrix', 'Serum', 34, 19],
    ['p11', 'Schwarzkopf BC Bonacure sprey', 'Schwarzkopf', 'Sprey', 36, 20],
    ['p12', 'CHI Silk Infusion', 'CHI', 'Serum', 58, 34],
    ['p13', 'Termo-qoruyucu sprey', 'Bellinaya', 'Sprey', 28, 13],
    ['p14', 'Dırnaq yağı — badam', 'Bellinaya', 'Dırnaq qulluğu', 14, 6],
    ['p15', 'Kutikula həlledicisi', 'Bellinaya', 'Dırnaq qulluğu', 12, 5],
    ['p16', 'Gel-lak — 12 rəng dəsti', 'Kodi', 'Dırnaq materialı', 130, 82],
    ['p17', 'Kirpik qulluq serumu', 'Lash Pro', 'Kirpik qulluğu', 45, 24],
    ['p18', 'Qaş boyası — qəhvəyi', 'RefectoCil', 'Qaş boyası', 26, 13],
    ['p19', 'Hialuron serumu 30 ml', 'Bioaqua', 'Üz qulluğu', 52, 29],
    ['p20', 'Üz təmizləyici gel', 'La Roche', 'Üz qulluğu', 46, 26],
    ['p21', 'SPF 50 gündüz kremi', 'La Roche', 'Üz qulluğu', 68, 40],
    ['p22', 'Şəkərli epilyasiya pastası', 'SugarPro', 'Epilyasiya', 32, 16],
    ['p23', 'Epilyasiyadan sonra losyon', 'SugarPro', 'Epilyasiya', 24, 11],
    ['p24', 'Hədiyyə dəsti — Saç qulluğu', 'Bellinaya', 'Hədiyyə', 145, 88]
  ].map(function (r) {
    return { id: r[0], name: r[1], brand: r[2], group: r[3], price: r[4], cost: r[5], minStock: 4 };
  });

  var FIRST_F = ['Aygün', 'Nərmin', 'Lalə', 'Sevinc', 'Gülnar', 'Aynur', 'Şəbnəm', 'Ruhiyyə', 'Zeynəb', 'Aytac',
    'Mələk', 'Nurlana', 'Günay', 'Ayan', 'Fatimə', 'Xədicə', 'Səidə', 'Vüsalə', 'Röya', 'Aysu',
    'Nigar', 'Elmira', 'Sona', 'Aygül', 'Türkan', 'Pərvanə', 'Aynurə', 'Gülşən', 'Sevil', 'Nailə',
    'Arzu', 'Kəmalə', 'Rəna', 'Səbinə', 'Ülkər', 'Günel', 'Mehriban', 'Afaq', 'Şəfiqə', 'Leyla'];
  var FIRST_M = ['Elvin', 'Rəşad', 'Kamran', 'Orxan', 'Tural', 'Nicat', 'Emil', 'Anar', 'Fərid', 'Ramil',
    'Murad', 'Elçin', 'Vüqar', 'Samir', 'Ceyhun'];
  var LAST = ['Əliyeva', 'Məmmədova', 'Hüseynova', 'Quliyeva', 'Rzayeva', 'İsmayılova', 'Cəfərova', 'Həsənova',
    'Abbasova', 'Nəbiyeva', 'Kərimova', 'Səfərova', 'Vəliyeva', 'Axundova', 'Bağırova', 'Sultanova',
    'Mustafayeva', 'Orucova', 'Salmanova', 'Tağıyeva'];
  var LAST_M = ['Əliyev', 'Məmmədov', 'Hüseynov', 'Quliyev', 'Rzayev', 'İsmayılov', 'Cəfərov', 'Həsənov',
    'Abbasov', 'Nəbiyev', 'Kərimov', 'Səfərov'];

  var CLIENT_NOTES = ['Boyada ammiaksız məhsul istəyir.', 'Həssas dəri — güclü pilinq olmaz.',
    'Həmişə eyni ustaya yazılır.', 'Səhər saatlarını üstün tutur.', 'Fındıq allergiyası var.',
    'Kofe sevir, gələndə təklif edin.', 'Uzun saç — əlavə vaxt lazımdır.', ''];

  function seed() {
    var rand = U.rng(20260818);
    var today = new Date(); today.setHours(0, 0, 0, 0);

    /* ---------- stock per branch ---------- */
    var stock = {};
    PRODUCTS.forEach(function (p) {
      stock[p.id] = {};
      BRANCHES.forEach(function (b, i) {
        var base = U.int(rand, 2, 18);
        if (i === 2) base = Math.max(1, base - 4);
        stock[p.id][b.id] = base;
      });
    });
    /* a few deliberately low so the low-stock warning has something to show */
    stock.p01.br1 = 2; stock.p06.br2 = 1; stock.p16.br3 = 0; stock.p21.br1 = 3;

    /* ---------- clients ---------- */
    var clients = [];
    for (var i = 0; i < 138; i++) {
      var male = rand() < 0.16;
      var name = male
        ? U.pick(rand, FIRST_M) + ' ' + U.pick(rand, LAST_M)
        : U.pick(rand, FIRST_F) + ' ' + U.pick(rand, LAST);
      var visits = U.int(rand, 1, 34);
      var lastVisitAgo = rand() < 0.22 ? U.int(rand, 62, 210) : U.int(rand, 0, 55);
      var bd = new Date(1975 + U.int(rand, 0, 30), U.int(rand, 0, 11), U.int(rand, 1, 28));
      /* a handful of birthdays land in the next few days so the reminder card is alive */
      if (i < 4) { bd.setMonth(today.getMonth()); bd.setDate(today.getDate() + i); }
      clients.push({
        id: 'cl' + U.pad(i + 1),
        name: name,
        phone: '+9945' + U.int(rand, 0, 5) + U.int(rand, 1000000, 9999999),
        email: rand() < 0.45 ? U.fold(name).replace(/\s+/g, '.') + '@mail.az' : '',
        birthday: U.dkey(bd),
        gender: male ? 'm' : 'f',
        bonus: Math.round(U.int(rand, 0, 90) / 5) * 5,
        visits: visits,
        totalSpend: visits * U.int(rand, 35, 130),
        lastVisit: U.dkey(U.addDays(today, -lastVisitAgo)),
        noShows: rand() < 0.13 ? U.int(rand, 1, 3) : 0,
        branchId: U.pick(rand, BRANCHES).id,
        note: rand() < 0.3 ? U.pick(rand, CLIENT_NOTES) : '',
        tags: rand() < 0.18 ? ['VIP'] : [],
        consent: true,
        blocked: false
      });
    }

    /* ---------- appointments: -24 .. +16 days ---------- */
    var appointments = [];
    var STATUS_PAST = ['paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'noshow', 'cancelled'];
    var n = 0;
    /* busy[staffId][dateKey] = [[start,end], …] so seeded rows never overlap */
    var busy = {};
    function fits(staffId, key, s, e) {
      var list = (busy[staffId] || {})[key] || [];
      for (var i = 0; i < list.length; i++) if (s < list[i][1] && e > list[i][0]) return false;
      return true;
    }
    function claim(staffId, key, s, e) {
      (busy[staffId] || (busy[staffId] = {}));
      (busy[staffId][key] || (busy[staffId][key] = [])).push([s, e]);
    }
    for (var d = -24; d <= 16; d++) {
      var day = U.addDays(today, d);
      var dow = day.getDay();
      if (dow === 0) continue;                       /* closed Sunday */
      var dayKey = U.dkey(day);
      var load = d < 0 ? U.int(rand, 16, 30) : (d === 0 ? 26 : U.int(rand, 7, 20));
      for (var k = 0; k < load; k++) {
        var staff = U.pick(rand, STAFF);
        var branch = staff.branchId;
        var catId = U.pick(rand, staff.cats);
        var pool = SERVICES.filter(function (s) { return s.catId === catId; });
        var svc = U.pick(rand, pool);
        var svcIds = [svc.id];
        if (rand() < 0.22) {                          /* combo booking */
          var extra = U.pick(rand, SERVICES.filter(function (s) { return s.catId === catId && s.id !== svc.id; }));
          if (extra) svcIds.push(extra.id);
        }
        var dur = svcIds.reduce(function (a, id) { return a + svcById(id).duration; }, 0);
        /* 10:00 – 20:00 on a 15-minute grid, retried a few times to dodge clashes */
        var start = null;
        for (var attempt = 0; attempt < 8; attempt++) {
          var cand = 600 + U.int(rand, 0, 39) * 15;
          if (cand + dur > 1200) continue;
          if (fits(staff.id, dayKey, cand, cand + dur)) { start = cand; break; }
        }
        if (start === null) continue;
        claim(staff.id, dayKey, start, start + dur);
        var client = U.pick(rand, clients);
        var status;
        if (d < 0) status = U.pick(rand, STATUS_PAST);
        else if (d === 0) {
          var nowM = new Date().getHours() * 60 + new Date().getMinutes();
          status = start + dur < nowM ? 'paid' : (start < nowM ? 'arrived' : (rand() < 0.25 ? 'pending' : 'confirmed'));
        } else status = rand() < 0.18 ? 'pending' : 'confirmed';

        var price = svcIds.reduce(function (a, id) { return a + svcById(id).price; }, 0);
        appointments.push({
          id: 'ap' + (++n),
          branchId: branch, staffId: staff.id, clientId: client.id,
          serviceIds: svcIds, date: U.dkey(day), start: start, duration: dur,
          status: status, source: rand() < 0.42 ? 'online' : (rand() < 0.6 ? 'salon' : 'phone'),
          price: price, note: '', products: [], discount: 0, bonusUsed: 0,
          method: null, createdAt: Date.now() - (24 - d) * 86400000
        });
      }
    }

    /* ---------- transactions from paid appointments + some expenses ---------- */
    var transactions = [];
    appointments.filter(function (a) { return a.status === 'paid'; }).forEach(function (a) {
      var method = rand() < 0.55 ? 'card' : 'cash';
      a.method = method;
      var items = [{ kind: 'service', ids: a.serviceIds, amount: a.price }];
      var total = a.price;
      if (rand() < 0.23) {                       /* upsold a product at checkout */
        var prod = U.pick(rand, PRODUCTS);
        items.push({ kind: 'product', id: prod.id, qty: 1, amount: prod.price });
        total += prod.price;
        a.products = [{ id: prod.id, qty: 1, price: prod.price }];
      }
      transactions.push({
        id: U.uid('tx'), branchId: a.branchId, type: 'income', category: 'Xidmət haqqı',
        amount: total, method: method, appointmentId: a.id, staffId: a.staffId,
        clientId: a.clientId, items: items, date: a.date, at: U.fromKey(a.date).getTime() + a.start * 60000
      });
    });
    var EXPENSES = [['Sərfiyyat alışı', 380], ['Mal alışı', 940], ['İcarə', 2200], ['Kommunal', 260], ['Reklam', 300]];
    for (var e = -24; e <= 0; e += 3) {
      var ed = U.addDays(today, e);
      var ex = U.pick(rand, EXPENSES);
      transactions.push({
        id: U.uid('tx'), branchId: U.pick(rand, BRANCHES).id, type: 'expense', category: ex[0],
        amount: Math.round(ex[1] * (0.7 + rand() * 0.6)), method: 'cash', items: [],
        date: U.dkey(ed), at: ed.getTime() + 18 * 3600000
      });
    }

    /* ---------- waitlist: people who want an earlier slot ---------- */
    var waitlist = [];
    for (var w = 0; w < 9; w++) {
      var wc = U.pick(rand, clients);
      var ws = U.pick(rand, SERVICES);
      waitlist.push({
        id: U.uid('wl'), clientId: wc.id, branchId: U.pick(rand, BRANCHES).id,
        serviceId: ws.id, from: U.dkey(today), to: U.dkey(U.addDays(today, 3)),
        note: U.pick(rand, ['İstənilən vaxt olar', 'Səhər saatları', 'Axşamdan sonra', 'Bu həftə istəyir'])
      });
    }

    /* ---------- reviews ---------- */
    var REVIEW_TEXT = [
      'Çox razı qaldım, rəng dəqiq istədiyim kimi alındı.',
      'Salon çox təmiz və rahatdır, usta işini əla bilir.',
      'Onlayn yazıldım, gözləmədim. Belə rahat olduğunu bilmirdim.',
      'Manikür bir aya qədər gözəl qaldı.',
      'Kirpiklərim təbii göründü, çox bəyəndim.',
      'Qiymətlər münasibdir, xidmət keyfiyyətlidir.',
      'Xatırlatma mesajı gəldi, unutmadım — çox rahatdır.'
    ];
    var reviews = [];
    for (var r = 0; r < 24; r++) {
      var rc = U.pick(rand, clients);
      reviews.push({
        id: U.uid('rv'), clientId: rc.id, staffId: U.pick(rand, STAFF).id,
        rating: rand() < 0.82 ? 5 : 4, text: U.pick(rand, REVIEW_TEXT),
        date: U.dkey(U.addDays(today, -U.int(rand, 1, 60)))
      });
    }

    var automations = [
      { id: 'au1', key: 'reminder', name: 'Yazılış xatırlatması', desc: 'Görüşdən 24 saat və 3 saat əvvəl avtomatik mesaj.', enabled: true, channel: 'whatsapp', sent: 412, icon: 'bell' },
      { id: 'au2', key: 'winback', name: 'Geri qaytarma kampaniyası', desc: '60 gündən çox gəlməyən müştəriyə şəxsi təklif.', enabled: true, channel: 'whatsapp', sent: 88, icon: 'refresh' },
      { id: 'au3', key: 'birthday', name: 'Ad günü təbriki', desc: 'Ad günündən 2 gün əvvəl bonus hədiyyəsi ilə təbrik.', enabled: true, channel: 'whatsapp', sent: 63, icon: 'gift' },
      { id: 'au4', key: 'review', name: 'Rəy sorğusu', desc: 'Səfərdən 3 saat sonra qiymətləndirmə linki.', enabled: true, channel: 'sms', sent: 209, icon: 'star' },
      { id: 'au5', key: 'gapfill', name: 'Boş yerin doldurulması', desc: 'Ləğv olan anda gözləmə siyahısına dərhal təklif gedir.', enabled: true, channel: 'whatsapp', sent: 37, icon: 'zap' },
      { id: 'au6', key: 'noshow', name: 'Gəlməyən müştəri', desc: 'Gəlmədikdə növbəti gün nəzakətli xatırlatma.', enabled: false, channel: 'sms', sent: 0, icon: 'warning' }
    ];

    return {
      salon: {
        name: 'Bellinaya', legalName: 'Bellinaya Beauty MMC',
        tagline: 'Gözəllik salonu idarəetməsi',
        heroTitle: 'Saçınız, vaxtınız, seçiminiz',
        heroText: 'Üç filial, seçdiyiniz usta, telefonunuzdan bir dəqiqəyə yazılış. Zəng etməyə ehtiyac yoxdur.',
        instagram: '@bellinaya.baku', phone: '+994125050101'
      },
      branches: BRANCHES, categories: CATEGORIES, services: SERVICES, staff: STAFF,
      products: PRODUCTS, stock: stock, clients: clients, appointments: appointments,
      transactions: transactions, waitlist: waitlist, reviews: reviews,
      automations: automations, messages: [], productOrders: [],
      /* the person "using" the client side of the demo */
      me: { clientId: clients[0].id, name: clients[0].name, phone: clients[0].phone },
      settings: { branchId: 'all', theme: 'auto', seededAt: Date.now() }
    };
  }

  function svcById(id) { for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i]; return null; }

  B.seed = seed;
  B.SEED_VERSION = 7;
})();
