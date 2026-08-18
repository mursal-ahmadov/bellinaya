# Bellinaya — gözəllik salonu idarəetmə sistemi

İnteraktiv nümayiş versiyası. Brauzerdə açılır, server tələb etmir.

**Canlı link:** https://mursal-ahmadov.github.io/bellinaya/

---

## Bu nədir

Gözəllik salonları, bərbərxanalar və dırnaq studiyaları üçün onlayn yazılış və idarəetmə
sistemi. Nümayişdə iki tərəf var və onlar **canlı bağlıdır**:

- **Müştəri səhifəsi** — telefondan yazılış, yazılışa baxış, vaxt dəyişmə, ləğv, kosmetika sifarişi.
- **Salon paneli** — jurnal, müştəri bazası, xidmətlər, anbar, kassa, əməkhaqqı, marketinq, analitika.

Müştəri tərəfdə edilən hər əməliyyat həmin an salon panelində görünür.

---

## Nümayiş ssenarisi — beş dəqiqə

Yuxarıdakı zolaqdan **Salon paneli / Müştəri səhifəsi / Yanaşı nümayiş** arasında keçid edin.
Ən təsirli variant «Yanaşı nümayiş»dir: solda telefon, sağda panel.

1. **Müştəri kimi yazılın.** «Müştəri səhifəsi» → filial, xidmət, usta və vaxt seçin →
   şəxsi məlumat razılığını təsdiqləyin → yazılış tamamlanır.
   *Razılıq qutusu işarələnməsə, yazılış getmir — bu, Azərbaycan qanunvericiliyinin tələbidir.*

2. **Panelə keçin.** Sağ aşağıda bildiriş çıxır, jurnalda yeni yazılış işıqlanır.
   Onlayn gələn yazılışların yanında kiçik nöqtə olur — salonun özü yaratdığından fərqlənir.

3. **Ödəniş alın.** Yazılışa toxunun → «Gəldi» → «Ödəniş al» →
   **kosmetika məhsulu əlavə edin** → endirim və ya bonus tətbiq edin → ödəniş üsulunu seçin.

4. **Nəticəni yoxlayın.** Bir ödənişdən sonra dörd ekran birdən dəyişir:
   *Məhsullar* (qalıq azalıb), *Kassa* (əməliyyat və gün bağlanışı),
   *Əməkhaqqı* (ustanın faizi), *Analitika* (gəlir trendi).

5. **Boş yeri doldurun.** Hər hansı yazılışı ləğv edin → «Boşluğu doldur» →
   sistem gözləmə siyahısına təklif göndərir və bir neçə saniyəyə yer yenidən dolur.

6. **Geri qaytarma kampaniyası.** *Marketinq* → 60 gündən çox gəlməyən müştərilərə
   bir düymə ilə şəxsi təklif göndərilir. Göndərilən mesajların mətni orada görünür.

Sürətli keçid üçün **Ctrl + K** — müştəri, xidmət, ekran və əməliyyat axtarışı.

---

## Nələr nəzərə alınıb

- **Üç filial.** Yuxarıdakı seçicidən filial dəyişir; «Bütün filiallar» ümumi mənzərəni verir.
- **Kosmetika satışı.** Həm xidmətlə birlikdə, həm ayrıca. Qalıq filial üzrə ayrı izlənir,
  az qalıq xəbərdarlığı verilir.
- **Kassa qanunvericiliyi.** Sistem ödənişi qeyd edir və hesabata yazır; rəsmi fiskal çek
  salonun mövcud kassa aparatından verilir. Bu, *Parametrlər* ekranında açıq yazılıb.
- **Fərdi məlumatlar.** Onlayn yazılışda açıq razılıq alınır — məqsəd və istifadə izah olunur.
- **Dil.** Azərbaycanca əsas, rus və ingilis dillərinə keçid var.
- **Tema.** İşıqlı və qaranlıq rejim, sistem parametrinə uyğunlaşma.
- **Responsivlik.** Telefon, planşet və kompüterdə tam işlək. Telefonda açanda müştəri
  səhifəsi tam ekran olur.

---

## Texniki

Çərçivəsiz (vanilla) JavaScript, xarici kitabxana və CDN yoxdur. Şriftlər öz serverimizdə
saxlanılır (Fraunces + Commissioner, azərbaycan hərfləri və ₼ işarəsi yoxlanılıb).
Bütün məlumat brauzerin yaddaşındadır — *Parametrlər → Demonu sıfırla* ilə ilkin vəziyyətə qayıdır.

```
index.html
assets/css/   tokens.css app.css screens.css client.css fonts.css
assets/js/    core.js data.js store.js admin.js client.js app.js
assets/fonts/ öz-serverimizdə saxlanan woff2 faylları
assets/img/   loqo və favicon
build.mjs     tək-fayl versiyasını yaradır (node build.mjs)
```

Yerli işə salmaq üçün:

```bash
python -m http.server 8000
# sonra brauzerdə http://localhost:8000
```

---

*Bu nümayiş versiyasıdır. Məlumatlar nümunə üçün uydurulmuşdur.*
