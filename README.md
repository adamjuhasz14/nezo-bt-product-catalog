# Nezo – tapéta termékkatalógus

Statikus termékkatalógus a Nezo Bt. számára. Nincs adatbázis és nincs belépés: a termékek a `data/products.json` fájlban, a képek az `images/` mappában élnek. Az oldalt a Cloudflare Pages szolgálja ki ingyen.

## Fájlok

- `index.html`, `style.css`, `app.js` – a böngészhető ügyféloldal (szűrők, kereső, képnézegető)
- `data/products.json` – a termékek adatai
- `images/` – a termékképek
- `admin.html` – **helyi** feltöltő segéd (a saját gépeden nyisd meg böngészőben), ami legenerálja a `products.json`-t és a tömörített képeket
- `robots.txt` – a keresők kizárása (az oldal így csak linkkel érhető el a gyakorlatban)

## Új termék felvitele

1. Nyisd meg az `admin.html`-t a saját gépeden (dupla kattintás).
2. Tölts be a meglévő `data/products.json`-t, hogy hozzá tudj adni az eddigiekhez.
3. Töltsd ki az űrlapot, válaszd ki a kép(ek)et, „Hozzáadás a listához”.
4. Töltsd le az új képeket és a `products.json`-t a gombokkal.
5. A GitHubon töltsd fel a képeket az `images/` mappába, a `products.json`-t pedig a `data/` mappába (felülírva a régit).
6. A Cloudflare pár perc múlva automatikusan frissíti az élő oldalt.

## Beállítandó

- Kapcsolati adatok (e-mail, telefon, cégnév): az `app.js` tetején, a `CONFIG` blokkban – egy helyen, és mindenhol frissül.
