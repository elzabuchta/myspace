# 1knihovna (Knihovníček) 📚

Aplikace **1knihovna / Knihovníček** je mobilní i webová PWA aplikace navržená pro knihovníky a vášnivé čtenáře. Umožňuje rychlé skenování čárových kódů a ISBN čísel z knih pomocí fotoaparátu mobilního telefonu (iPhone, Android) i manuální zadávání ISBN.

## 🚀 Hlavní funkce

- **Skenování čárových kódů & ISBN:** Fotoaparátem telefonu nebo ručním zadáním číselného kódů.
- **Automatické vyhledání dat o knize:** Primárně vyhledává v databázi [Knihovny.cz](https://www.knihovny.cz/), s automatickým záložním vyhledáváním přes Google Books API a Open Library.
- **Abecedně řazená Knihovna:**
  - Automatické řazení knih dle abecedy.
  - **A-Z rychlá lišta** na boku pro přeskakování mezi písmeny české abecedy (A, B, C, Č, D, E, ..., Z, Ž).
  - Vyhledávací lišta podle názvu knihy.
  - Správné české/polské/anglické skloňování poctu knih (1 kniha, 2–4 knihy, 5+ knih).
- **Detailní informace o knize:** Zobrazení obálky, autora, roku vydání a nakladatelství.
- **Interaktivní citáty čtenářů:** Měnící se citáty slavných autorů (Kafka, Komenský, Čapek, King, Cicero) po kliknutí na lištu v hlavičce.
- **Sdílení knih:** Generování a kopírování přímého odkazu na vybranou knihu (Spotify-style sdílení).
- **Sociální síť & Doporučení:**
  - Sledování knihovnických profilů ostatních čtenářů a prohlížení jejich knihovny.
  - Tlačítko pro obnovení a načtení dalších profilů.
- **Světlý a Tmavý režim (Theme Switcher):**
  - Přepínání pomocí ikonky žárovky/lampy.
  - "Chunky" design s vyhrazenou barevnou paletou (tmavý: černá/šedá/červenooranžová, světlý: bílá/světle šedá/červenooranžová).
- **Fungování bez internetu (Offline mode):**
  - Uložené knihy v knihovně fungují plně offline v prohlížeči (`localStorage`).
  - Pro vyhledání nových ISBN kódů je vyžadováno připojení k internetu.

## 🌐 Hostování na GitHub Pages

Aplikace nepotřebuje žádnou databázi ani serverový backend. Běží 100% v prohlížeči čtenáře.

### Jak zapnout na GitHubu:
1. Jděte do nastavení repozitáře na GitHubu (**Settings**).
2. V levém menu vyberte **Pages**.
3. V sekci **Build and deployment** nastavte **Source** na `Deploy from a branch`.
4. Vyberte větev `main` (nebo `feat/...`) a složku `/ (root)`.
5. Klikněte na **Save**. Web bude dostupný na adrese `https://<vase-jmeno>.github.io/1knihovna/`.
