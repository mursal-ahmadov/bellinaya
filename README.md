# Bellinaya — gözəllik salonu idarəetmə sistemi

İnteraktiv nümayiş versiyası. Brauzerdə açılır, server tələb etmir.

**Canlı link:** https://mursal-ahmadov.github.io/bellinaya/

---

## Bu nədir

Gözəllik salonları üçün onlayn yazılış və idarəetmə sistemi. Nümayişdə iki tərəf var
və onlar **canlı bağlıdır**:

- **Müştəri tərəfi** — salonun veb-saytı: yazılış (5 addım), SMS ilə giriş,
  yazılışa baxış, vaxt dəyişmə, ləğv, kosmetika mağazası və səbət.
- **Salon paneli** — icmal, jurnal (sürüklə-burax təqvim), müştəri bazası,
  xidmətlər və qiymətlər, anbar, kassa (ödəniş + çek + gün bağlanışı Z-hesabatı),
  əməkhaqqı, analitika.

Müştəri tərəfdə edilən hər əməliyyat həmin an salon panelində görünür:
jurnalda yeni kart işıqlanır, bildiriş zəngi yanır.

---

## Nümayiş ssenarisi

Yuxarıdakı zolaqdan **Panel / Müştəri** görünüşləri arasında keçid edin.
Ən təsirli variant: linki **iki ayrı pəncərədə** açın — birində panel, o birində
müştəri saytı. Bir pəncərədə edilən əməliyyat o birində dərhal görünür.

1. **Panelə daxil olun.** Rol seçin — Salon sahibi (PIN `2024`) və ya Resepşn (PIN `1010`).
2. **Müştəri kimi yazılın.** «Müştəri» görünüşündə «Yazılış et» → nömrə `051 220 66 15` →
   SMS kodu `5417` → filial, xidmət, usta, vaxt seçin → təsdiqləyin.
3. **Panelə baxın.** Jurnalda yeni ONLINE yazılış pulsasiya ilə görünür,
   zəngdə bildiriş yanır, «Jurnal» menyusunda sayğac artır.
4. **Ödəniş alın.** Yazılış kartına klikləyin → «Təsdiqlə» → «Gəldi qeyd et» →
   «Ödəniş al» → kosmetika məhsulu əlavə edin → endirim → ödəniş üsulu → çek.
5. **Nəticəni yoxlayın.** Ödənişdən sonra Anbar (qalıq azalıb), Kassa (əməliyyat),
   Əməkhaqqı (ustanın faizi) və Analitika birdən yenilənir.
6. **Jurnalda işləyin.** Boş yerə klik — yeni yazılış; kartı sürüşdürün — vaxt dəyişir;
   kartı başqa sütuna atın — usta dəyişir.
7. **Günü bağlayın.** Kassa → «Günü bağla» → Z-hesabat və ustaların əməkhaqqısı.

Yeni müştəri qeydiyyatı da işləyir: istənilən başqa nömrə yazın — ad soruşulacaq,
panelin müştəri bazasına düşəcək.

---

## Nələr nəzərə alınıb

- **Üç filial** — panel və müştəri tərəfində ayrıca seçilir, rəqəmlər filial üzrə hesablanır.
- **Kosmetika satışı** — həm xidmətlə birlikdə (ödəniş pəncərəsində), həm ayrıca
  (müştəri mağazası). Qalıq izlənir, az qalıq xəbərdarlığı verilir.
- **Rollar** — Salon sahibi hər şeyi görür; Resepşn analitika və əməkhaqqını görmür.
- **Dil** — Azərbaycanca əsas, rus dilinə tam keçid.
- **Yaddaş** — bütün dəyişikliklər brauzerin yaddaşında qalır;
  «Demo məlumatı sıfırla» ilkin vəziyyətə qaytarır.
- **İki pəncərə sinxronu** — eyni brauzerdə iki pəncərə açanda (panel + müştəri)
  əməliyyatlar canlı ötürülür.
- **Responsivlik** — telefonda açanda müştəri görünüşü avtomatik seçilir,
  sayt mobil ekrana tam uyğunlaşır.

---

## Texniki

Çərçivəsiz (vanilla) JavaScript, xarici kitabxana yoxdur. Şriftlər Google Fonts-dan
(azərbaycan hərfləri, ₼ işarəsi və kiril üçün ehtiyat şrift yoxlanılıb).

```
index.html    giriş səhifəsi
app.css       baza stillər və animasiyalar
data.js       demo məlumat + AZ/RU tərcümə lüğətləri
core.js       vəziyyət, əməliyyatlar, hadisə mexanizmi
panel.js      salon paneli ekranları
client.js     müştəri tərəfi (responsiv veb-sayt)
overlays.js   pəncərələr (yazılış kartı, ödəniş, Z-hesabat) və işə salma
dizayn/       ilkin dizayn faylı (istinad üçün)
```

Yerli işə salmaq üçün:

```bash
python -m http.server 8000
# sonra brauzerdə http://localhost:8000
```

---

*Bu nümayiş versiyasıdır. Məlumatlar nümunə üçün uydurulmuşdur.*
