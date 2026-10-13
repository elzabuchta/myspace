// Theme Engine, I18n & Core State

const STORAGE_KEY_THEME = 'knihovnicek_theme';
const STORAGE_KEY_LANG = 'knihovnicek_lang';
const STORAGE_KEY_BOOKS = 'knihovnicek_books';
const STORAGE_KEY_REVIEWS = 'knihovnicek_reviews';
const STORAGE_KEY_FOLLOWS = 'knihovnicek_follows';
const STORAGE_KEY_USER = 'knihovnicek_user';

let html5QrCode = null;
let isScannerRunning = false;
let isProcessingScan = false;
let currentScannedBook = null;

// Czech alphabet sequence for jump navigation
const CZECH_ALPHABET = ['A','B','C','Č','D','E','F','G','H','CH','I','J','K','L','M','N','O','P','R','Ř','S','Š','T','U','V','W','X','Y','Z','Ž'];

// Translation Dictionary (Czech, Polish, English)
const TRANSLATIONS = {
  cs: {
    quote_text: "„Kniha musí být sekerou na zamrzlé moře v nás.“",
    quote_author: "— Franz Kafka",
    not_logged_in: "Nejste přihlášeni",
    logged_in_as: "Přihlášen jako",
    login_btn: "Přihlásit se",
    logout_btn: "Odhlásit",
    menu_scan_title: "Skenovat / Zadat ISBN",
    menu_scan_desc: "Naskenujte kód fotoaparátem nebo zadejte ručně",
    menu_library_title: "Moje Knihovna",
    menu_library_desc: "Prohlížet a vyhledávat uložené knihy",
    menu_recommended_title: "Doporučené knihy",
    menu_recommended_desc: "Doporučené tituly, hodnocení a recenze",
    menu_social_title: "Sledování & Přátelé",
    menu_social_desc: "Sledování účtů a pozvánky do aplikace",
    menu_settings_title: "Nastavení",
    menu_settings_desc: "Vzhled, jazyk a možnosti aplikace",
    btn_back: "ZPĚT",
    scanner_header: "Skener & Zadání ISBN",
    camera_loading: "Načítám fotoaparát...",
    toggle_camera: "Vypnout / Zapnout kameru",
    or_manual: "nebo zadejte ručně",
    isbn_label: "Číslo ISBN nebo EAN kód:",
    search_btn: "Hledat",
    isbn_hint: "Podporuje ISBN-10 i ISBN-13 (i s pomlčkami)",
    library_header: "Moje Knihovna",
    search_placeholder: "Hledat knihu dle názvu...",
    books_count_label: "knih",
    copy_link_btn: "Kopírovat odkaz",
    recommended_header: "Doporučené knihy",
    recommended_card_title: "Vybraná doporučená literatura",
    recommended_card_desc: "Prohlédněte si výběr klasik, ohodnoťte je 1-5 hvězdičkami a přidejte svůj slovní komentář!",
    social_header: "Sledování & Přátelé",
    invite_card_title: "Pozvat přátele do aplikace",
    invite_card_desc: "Sdílejte odkaz na aplikaci se svými kolegy knihovníky a přáteli.",
    invite_btn: "Pozvat přátele (Kopírovat odkaz)",
    follow_card_title: "Doporučené knihovnické účty k sledování",
    follow_card_desc: "Sledujte ostatní čtenáře a inspirujte se jejich knihovnou.",
    settings_header: "Nastavení",
    setting_theme_title: "Režim zobrazení",
    setting_lang_title: "Jazyk aplikace",
    setting_lang_desc: "Vyberte preferovaný jazyk rozhraní",
    setting_security_title: "Google Přihlášení & Zabezpečení",
    setting_security_desc: "Pro běh Google OAuth na vaší doméně GitHub Pages přidejte URL vaší stránky (např. https://username.github.io) do Google Cloud Console -> Credentials -> Authorized JavaScript origins.",
    setting_app_info: "Informace o aplikaci",
    theme_dark: "Tmavý režim",
    theme_light: "Světlý režim",
    login_modal_title: "Přihlášení do aplikace",
    login_modal_desc: "Přihlaste se pomocí svého Google účtu pro synchronizaci a správu knihovny.",
    or_quick_demo: "nebo demo přihlášení",
    btn_close: "Zavřít",
    book_found_title: "Nalezená kniha",
    duplicate_warning_text: "Tato kniha už je ve vaší knihovně!",
    loading_text: "Vyhledávám knihu v databázích...",
    error_title: "Vyskytl se problém",
    error_unfound: "Vyskytl se problém a nelze knihu načíst.",
    error_return_btn: "Rozumím - Návrat na Hlavní menu",
    add_review_label: "Přidat hodnocení a komentář:",
    write_comment_placeholder: "Napište svůj slovní komentář...",
    submit_review_btn: "Odeslat hodnocení",
    user_reviews_label: "Uživatelská hodnocení:",
    no_reviews_yet: "Zatím žádná hodnocení. Buďte první!",
    empty_library_title: "Vaše knihovna je zatím prázdná",
    empty_library_desc: "Přidejte první knihy naskenováním čárového kódu nebo zadáním ISBN.",
    scan_first_book_btn: "Skenovat knihu",
    no_search_results: "Žádné výsledky"
  },
  pl: {
    quote_text: "„Książka musi być siekierą na zamarznięte morze w nas.”",
    quote_author: "— Franz Kafka",
    not_logged_in: "Nie jesteś zalogowany",
    logged_in_as: "Zalogowany jako",
    login_btn: "Zaloguj się",
    logout_btn: "Wyloguj",
    menu_scan_title: "Skanuj / Wpisz ISBN",
    menu_scan_desc: "Zeskanuj kod aparatem lub wpisz ręcznie",
    menu_library_title: "Moja Biblioteka",
    menu_library_desc: "Przeglądaj i wyszukuj zapisane książki",
    menu_recommended_title: "Polecane książki",
    menu_recommended_desc: "Polecane tytuły, oceny i recenzje",
    menu_social_title: "Obserwowani i Znajomi",
    menu_social_desc: "Obserwowanie kont i zapraszanie znajomych",
    menu_settings_title: "Ustawienia",
    menu_settings_desc: "Wygląd, język i opcje aplikacji",
    btn_back: "POWRÓT",
    scanner_header: "Skaner i Wprowadzanie ISBN",
    camera_loading: "Ładowanie aparatu...",
    toggle_camera: "Włącz / Wyłącz aparat",
    or_manual: "lub wpisz ręcznie",
    isbn_label: "Numer ISBN lub kod EAN:",
    search_btn: "Szukaj",
    isbn_hint: "Obsługuje ISBN-10 oraz ISBN-13",
    library_header: "Moja Biblioteka",
    search_placeholder: "Szukaj książki po tytule...",
    books_count_label: "książek",
    copy_link_btn: "Kopiuj link",
    recommended_header: "Polecane książki",
    recommended_card_title: "Wybrana literatura polecana",
    recommended_card_desc: "Przejrzyj klasykę, oceń w skali 1-5 gwiazdek i dodaj komentarz!",
    social_header: "Obserwowani i Znajomi",
    invite_card_title: "Zaproś znajomych do aplikacji",
    invite_card_desc: "Udostępnij link do aplikacji bibliotekarzom i znajomym.",
    invite_btn: "Zaproś znajomych (Kopiuj link)",
    follow_card_title: "Polecane konta biblioteczne",
    follow_card_desc: "Obserwuj innych czytelników i inspiruj się ich biblioteką.",
    settings_header: "Ustawienia",
    setting_theme_title: "Tryb wyświetlania",
    setting_lang_title: "Język aplikacji",
    setting_lang_desc: "Wybierz preferowany język interfejsu",
    setting_security_title: "Google Logowanie i Bezpieczeństwo",
    setting_security_desc: "Aby Google OAuth działało na GitHub Pages, dodaj URL strony w Google Cloud Console -> Credentials -> Authorized JavaScript origins.",
    setting_app_info: "Informacje o aplikacji",
    theme_dark: "Tryb ciemny",
    theme_light: "Tryb jasny",
    login_modal_title: "Logowanie do aplikacji",
    login_modal_desc: "Zaloguj się kontem Google, aby synchronizować bibliotekę.",
    or_quick_demo: "lub logowanie demo",
    btn_close: "Zamknij",
    book_found_title: "Znaleziona książka",
    duplicate_warning_text: "Ta książka jest już w Twojej bibliotece!",
    loading_text: "Wyszukiwanie książki w bazach...",
    error_title: "Wystąpił problem",
    error_unfound: "Wystąpił problem i nie można wczytać książki.",
    error_return_btn: "Rozumiem - Powrót do menu głównego",
    add_review_label: "Dodaj ocenę i komentarz:",
    write_comment_placeholder: "Napisz swój komentarz...",
    submit_review_btn: "Wyślij ocenę",
    user_reviews_label: "Oceny użytkowników:",
    no_reviews_yet: "Brak ocen. Bądź pierwszy!",
    empty_library_title: "Twoja biblioteka jest pusta",
    empty_library_desc: "Dodaj pierwsze książki, skanując kod kreskowy lub wpisując ISBN.",
    scan_first_book_btn: "Zeskanuj książkę",
    no_search_results: "Brak wyników"
  },
  en: {
    quote_text: "“A book must be the axe for the frozen sea within us.”",
    quote_author: "— Franz Kafka",
    not_logged_in: "Not logged in",
    logged_in_as: "Logged in as",
    login_btn: "Log in",
    logout_btn: "Log out",
    menu_scan_title: "Scan / Enter ISBN",
    menu_scan_desc: "Scan barcode with camera or enter manually",
    menu_library_title: "My Library",
    menu_library_desc: "Browse and search saved books",
    menu_recommended_title: "Recommended Books",
    menu_recommended_desc: "Featured titles, ratings and reviews",
    menu_social_title: "Following & Friends",
    menu_social_desc: "Follow accounts and invite friends",
    menu_settings_title: "Settings",
    menu_settings_desc: "Appearance, language, and app options",
    btn_back: "BACK",
    scanner_header: "Scanner & ISBN Input",
    camera_loading: "Loading camera...",
    toggle_camera: "Turn Camera Off / On",
    or_manual: "or enter manually",
    isbn_label: "ISBN or EAN barcode number:",
    search_btn: "Search",
    isbn_hint: "Supports ISBN-10 and ISBN-13 (with hyphens)",
    library_header: "My Library",
    search_placeholder: "Search book by title...",
    books_count_label: "books",
    copy_link_btn: "Copy link",
    recommended_header: "Recommended Books",
    recommended_card_title: "Curated Classics",
    recommended_card_desc: "Explore classics, rate them 1-5 stars, and leave a written review!",
    social_header: "Following & Friends",
    invite_card_title: "Invite friends to the app",
    invite_card_desc: "Share the app link with librarians and fellow readers.",
    invite_btn: "Invite friends (Copy link)",
    follow_card_title: "Recommended Library Accounts",
    follow_card_desc: "Follow fellow readers and get inspired by their collection.",
    settings_header: "Settings",
    setting_theme_title: "Display Mode",
    setting_lang_title: "App Language",
    setting_lang_desc: "Select preferred interface language",
    setting_security_title: "Google Sign-In & Security",
    setting_security_desc: "To run Google OAuth on GitHub Pages, add your URL (e.g. https://username.github.io) in Google Cloud Console -> Credentials -> Authorized JavaScript origins.",
    setting_app_info: "App Information",
    theme_dark: "Dark mode",
    theme_light: "Light mode",
    login_modal_title: "Sign in to App",
    login_modal_desc: "Sign in with your Google account to manage your library.",
    or_quick_demo: "or quick demo login",
    btn_close: "Close",
    book_found_title: "Book Found",
    duplicate_warning_text: "This book is already in your library!",
    loading_text: "Searching catalog databases...",
    error_title: "A problem occurred",
    error_unfound: "Could not retrieve book details.",
    error_return_btn: "Understood - Return to Main Menu",
    add_review_label: "Add rating and review:",
    write_comment_placeholder: "Write your written review...",
    submit_review_btn: "Submit Review",
    user_reviews_label: "User Reviews:",
    no_reviews_yet: "No reviews yet. Be the first!",
    empty_library_title: "Your library is empty",
    empty_library_desc: "Add your first books by scanning barcodes or typing ISBN.",
    scan_first_book_btn: "Scan a book",
    no_search_results: "No results"
  }
};

// Recommended Featured Books (Sourced metadata from Knihovny.cz)
const RECOMMENDED_BOOKS = [
  {
    id: "rec_1",
    isbn: "9788020718501",
    title: "Farma zvířat",
    author: "George Orwell",
    publisher: "Odeon",
    year: "2015",
    cover: "https://www.knihovny.cz/Cover/Show?id=SVK_ST-0000001&size=medium",
    description: "Alegorický satirický román ukazující formou bajky formy totalitní diktatury."
  },
  {
    id: "rec_2",
    isbn: "9788073356070",
    title: "Obraz Doriana Graye",
    author: "Oscar Wilde",
    publisher: "Leda",
    year: "2019",
    cover: "https://www.knihovny.cz/Cover/Show?id=SVK_ST-0000002&size=medium",
    description: "Příběh mladého muže, jehož krása nevadne, zatímco jeho portrét zachycuje stopy hříchů."
  },
  {
    id: "rec_3",
    isbn: "9788000035048",
    title: "Malý princ",
    author: "Antoine de Saint-Exupéry",
    publisher: "Albatros",
    year: "2014",
    cover: "https://www.knihovny.cz/Cover/Show?id=SVK_ST-0000003&size=medium",
    description: "Světoznámé filozofické dílo o přátelství, lásce a lidských hodnotách."
  }
];

const RECOMMENDED_ACCOUNTS = [
  { id: "acc_1", name: "Knihovna Národní", handle: "@nkp_cz", desc: "Oficiální účet Národní knihovny ČR" },
  { id: "acc_2", name: "Městská knihovna Praha", handle: "@mlp_praha", desc: "Inspirace pro čtenáře a milovníky knih" },
  { id: "acc_3", name: "Knihovník Pavel", handle: "@pavel_knihy", desc: "Recenze, tipy na čtení a novinky" }
];


// --- I18N & LANGUAGE ENGINE ---

function getCurrentLang() {
  return localStorage.getItem(STORAGE_KEY_LANG) || 'cs';
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = 'cs';
  localStorage.setItem(STORAGE_KEY_LANG, lang);
  document.documentElement.setAttribute('lang', lang);

  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = lang;

  // Apply translations to data-i18n elements
  const t = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (t[key]) {
      elem.innerText = t[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      elem.placeholder = t[key];
    }
  });

  // Update theme text in settings
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(currentTheme);

  // Update quote in banner
  const quoteTextElem = document.querySelector('.quote-text');
  const quoteAuthorElem = document.querySelector('.quote-author');
  if (quoteTextElem) quoteTextElem.innerText = t.quote_text;
  if (quoteAuthorElem) quoteAuthorElem.innerText = t.quote_author;

  updateUserAuthBar();
}

function handleLanguageChange(event) {
  const selectedLang = event.target.value;
  setLanguage(selectedLang);
  renderLibrary();
  renderMonthlyBooks();
  renderSocialAccounts();
}


// --- THEME ENGINE ---

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY_THEME, theme);

  const switchElem = document.getElementById('theme-toggle-switch');
  const statusText = document.getElementById('theme-status-text');

  const lang = getCurrentLang();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.cs;

  if (theme === 'dark') {
    if (switchElem) switchElem.checked = false;
    if (statusText) statusText.innerText = t.theme_dark;
  } else {
    if (switchElem) switchElem.checked = true;
    if (statusText) statusText.innerText = t.theme_light;
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

function handleThemeToggleChange(event) {
  const newTheme = event.target.checked ? 'light' : 'dark';
  setTheme(newTheme);
}


// --- NAVIGATION ENGINE ---

function navigateTo(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  if (screenId === 'screen-scanner') {
    startCameraScanner();
  } else {
    stopCameraScanner();
  }

  if (screenId === 'screen-library') {
    renderLibrary();
  } else if (screenId === 'screen-monthly-books') {
    renderMonthlyBooks();
  } else if (screenId === 'screen-social') {
    renderSocialAccounts();
  }

  updateMenuBookCount();
  window.scrollTo(0, 0);
}

function stopScannerAndGoHome() {
  stopCameraScanner();
  navigateTo('screen-main-menu');
}


// --- BARCODE CAMERA SCANNER ---

function startCameraScanner() {
  const statusElem = document.getElementById('camera-status');
  if (typeof Html5Qrcode === 'undefined') {
    if (statusElem) statusElem.innerText = 'Načítám skener...';
    setTimeout(startCameraScanner, 500);
    return;
  }

  if (isScannerRunning) return;

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  const config = {
    fps: 10,
    qrbox: { width: 260, height: 160 },
    aspectRatio: 1.33333
  };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    onBarcodeScanned,
    onBarcodeScanError
  ).then(() => {
    isScannerRunning = true;
    if (statusElem) statusElem.innerText = 'Namiřte fotoaparát na čárový kód (ISBN)';
  }).catch(err => {
    console.warn("Camera start failed:", err);
    isScannerRunning = false;
    if (statusElem) statusElem.innerText = 'Fotoaparát nedostupný. Použijte ruční zadání ISBN.';
  });
}

function stopCameraScanner() {
  if (html5QrCode && isScannerRunning) {
    html5QrCode.stop().then(() => {
      isScannerRunning = false;
      const statusElem = document.getElementById('camera-status');
      if (statusElem) statusElem.innerText = 'Fotoaparát vypnut.';
    }).catch(err => {
      isScannerRunning = false;
    });
  }
}

function toggleCamera() {
  if (isScannerRunning) {
    stopCameraScanner();
  } else {
    startCameraScanner();
  }
}

function onBarcodeScanned(decodedText, decodedResult) {
  if (isProcessingScan) return;
  const cleanIsbn = normalizeIsbn(decodedText);
  if (isValidIsbn(cleanIsbn)) {
    isProcessingScan = true;
    if (navigator.vibrate) navigator.vibrate(100);
    processIsbnSearch(cleanIsbn);
  }
}

function onBarcodeScanError(errorMessage) {}

function normalizeIsbn(inputStr) {
  if (!inputStr) return '';
  return inputStr.replace(/[^0-9Xx]/g, '').toUpperCase();
}

function isValidIsbn(isbn) {
  const clean = normalizeIsbn(isbn);
  return clean.length === 10 || clean.length === 13;
}

function handleManualIsbnSubmit(event) {
  event.preventDefault();
  const inputElem = document.getElementById('isbn-input');
  const cleanIsbn = normalizeIsbn(inputElem.value);

  if (!cleanIsbn || !isValidIsbn(cleanIsbn)) {
    alert("Zadané číslo neni platné ISBN.");
    return;
  }

  processIsbnSearch(cleanIsbn);
}


// --- BOOK LOOKUP ENGINE ---

async function processIsbnSearch(isbn) {
  const lang = getCurrentLang();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.cs;
  showLoadingModal(t.loading_text);

  try {
    let book = await fetchBookFromKnihovnyCz(isbn);

    if (!book || !book.title) {
      const fallbackBook = await fetchBookFromGoogleBooks(isbn);
      if (fallbackBook && fallbackBook.title) {
        book = mergeBookData(book, fallbackBook);
      }
    }

    if (!book || !book.title) {
      const openLibBook = await fetchBookFromOpenLibrary(isbn);
      if (openLibBook && openLibBook.title) {
        book = mergeBookData(book, openLibBook);
      }
    }

    hideLoadingModal();

    if (book && book.title) {
      currentScannedBook = book;
      showBookResultModal(book);
    } else {
      showErrorModal(t.error_unfound);
    }
  } catch (error) {
    hideLoadingModal();
    showErrorModal(t.error_unfound);
  }
}

function mergeBookData(primary, fallback) {
  if (!primary) return fallback;
  if (!fallback) return primary;

  return {
    isbn: primary.isbn || fallback.isbn,
    title: primary.title || fallback.title || 'Neznámý název',
    author: primary.author || fallback.author || 'Neznámý autor',
    year: primary.year || fallback.year || 'Neuvedeno',
    publisher: primary.publisher || fallback.publisher || 'Neuvedeno',
    cover: primary.cover || fallback.cover || ''
  };
}

async function fetchBookFromKnihovnyCz(isbn) {
  try {
    const url = `https://www.knihovny.cz/api/v1/search?lookfor=${encodeURIComponent(isbn)}&type=Isbn`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.records && data.records.length > 0) {
      const rec = data.records[0];

      let title = rec.title || rec.shortTitle || '';
      if (rec.subTitle) title += `: ${rec.subTitle}`;

      let author = '';
      if (rec.authors) {
        if (rec.authors.primary) {
          author = Object.keys(rec.authors.primary).join(', ');
        } else if (Array.isArray(rec.authors)) {
          author = rec.authors.join(', ');
        }
      }

      let year = rec.publishDate || (rec.publicationDates ? rec.publicationDates[0] : '');
      let publisher = rec.publisher || (rec.publishers ? rec.publishers[0] : '');

      let cover = rec.cover || '';
      if (!cover && rec.id) {
        cover = `https://www.knihovny.cz/Cover/Show?id=${encodeURIComponent(rec.id)}&size=medium`;
      }

      return {
        isbn: isbn,
        title: title.trim(),
        author: author.trim(),
        year: year ? String(year).trim() : '',
        publisher: publisher ? String(publisher).trim() : '',
        cover: cover
      };
    }
  } catch (err) {
    console.warn("Knihovny.cz fetch failed:", err);
  }
  return null;
}

async function fetchBookFromGoogleBooks(isbn) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.items && data.items.length > 0) {
      const info = data.items[0].volumeInfo;
      let cover = info.imageLinks ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '').replace('http://', 'https://') : '';

      return {
        isbn: isbn,
        title: info.title || '',
        author: info.authors ? info.authors.join(', ') : '',
        year: info.publishedDate ? info.publishedDate.substring(0, 4) : '',
        publisher: info.publisher || '',
        cover: cover
      };
    }
  } catch (err) {
    console.warn("Google Books fetch failed:", err);
  }
  return null;
}

async function fetchBookFromOpenLibrary(isbn) {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const key = `ISBN:${isbn}`;
    if (data && data[key]) {
      const bookData = data[key];
      return {
        isbn: isbn,
        title: bookData.title || '',
        author: bookData.authors ? bookData.authors.map(a => a.name).join(', ') : '',
        year: bookData.publish_date || '',
        publisher: bookData.publishers ? bookData.publishers.map(p => p.name).join(', ') : '',
        cover: bookData.cover ? (bookData.cover.medium || bookData.cover.small || '') : ''
      };
    }
  } catch (err) {
    console.warn("OpenLibrary fetch failed:", err);
  }
  return null;
}


// --- MODAL & UI HANDLERS ---

function showLoadingModal(text) {
  const modal = document.getElementById('modal-loading');
  const textElem = document.getElementById('loading-text');
  if (textElem) textElem.innerText = text || 'Vyhledávám...';
  if (modal) modal.classList.remove('hidden');
}

function hideLoadingModal() {
  const modal = document.getElementById('modal-loading');
  if (modal) modal.classList.add('hidden');
}

function showErrorModal(message) {
  const modal = document.getElementById('modal-error');
  const msgElem = document.getElementById('error-message');
  if (msgElem) msgElem.innerText = message || 'Vyskytl se problém.';
  if (modal) modal.classList.remove('hidden');
}

function closeErrorAndGoHome() {
  const modal = document.getElementById('modal-error');
  if (modal) modal.classList.add('hidden');
  isProcessingScan = false;
  stopScannerAndGoHome();
}

function showBookResultModal(book) {
  const modal = document.getElementById('modal-book-result');
  const detailsElem = document.getElementById('modal-book-details');
  const warningElem = document.getElementById('duplicate-warning');
  const actionsElem = document.getElementById('modal-actions-container');

  const existingBooks = getStoredBooks();
  const isDuplicate = existingBooks.some(b => normalizeIsbn(b.isbn) === normalizeIsbn(book.isbn));

  const coverSrc = book.cover ? book.cover : '';
  const bookSvgPlaceholder = `<div class="book-cover-placeholder"><svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg></div>`;
  const coverHtml = coverSrc
    ? `<img src="${escapeHtml(coverSrc)}" alt="Obálka" class="preview-book-cover" onerror="this.onerror=null; this.outerHTML='${bookSvgPlaceholder}';" />`
    : bookSvgPlaceholder;

  detailsElem.innerHTML = `
    <div class="preview-book-card">
      ${coverHtml}
      <div class="preview-book-details">
        <h4 class="preview-title">${escapeHtml(book.title || 'Neznámý název')}</h4>
        <div class="preview-author">${escapeHtml(book.author || 'Neznámý autor')}</div>
        <div class="preview-meta">
          ${book.year ? `<span>Rok: <strong>${escapeHtml(book.year)}</strong></span>` : ''}
          ${book.publisher ? `<span> • ${escapeHtml(book.publisher)}</span>` : ''}
        </div>
        <div class="preview-meta" style="margin-top: 4px;">
          <span>ISBN: ${escapeHtml(book.isbn)}</span>
        </div>
      </div>
    </div>
  `;

  if (isDuplicate) {
    warningElem.classList.remove('hidden');
    actionsElem.innerHTML = `
      <button class="chunky-btn primary-btn" onclick="saveCurrentBook(true)">
        ➕ Duplikovat
      </button>
      <button class="chunky-btn outline-btn" onclick="discardCurrentBook()">
        🗑️ Zahodit
      </button>
    `;
  } else {
    warningElem.classList.add('hidden');
    actionsElem.innerHTML = `
      <button class="chunky-btn primary-btn" onclick="saveCurrentBook(false)">
        📥 Přidat do knihovny
      </button>
      <button class="chunky-btn outline-btn" onclick="discardCurrentBook()">
        🗑️ Zahodit
      </button>
    `;
  }

  modal.classList.remove('hidden');
}

function discardCurrentBook() {
  const modal = document.getElementById('modal-book-result');
  if (modal) modal.classList.add('hidden');
  currentScannedBook = null;
  isProcessingScan = false;
}


// --- USER AUTH & GOOGLE SIGN-IN ---

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveUser(userObj) {
  if (userObj) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userObj));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
  updateUserAuthBar();
}

function updateUserAuthBar() {
  const user = getStoredUser();
  const displayElem = document.getElementById('user-info-display');
  const triggerBtn = document.getElementById('login-trigger-btn');

  const lang = getCurrentLang();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.cs;

  if (user && user.email) {
    displayElem.innerHTML = `<span class="user-logged-in-name">👤 ${escapeHtml(user.name || user.email)}</span>`;
    if (triggerBtn) {
      triggerBtn.innerText = t.logout_btn;
      triggerBtn.onclick = handleLogout;
    }
  } else {
    displayElem.innerHTML = `<span class="user-status-text">${t.not_logged_in}</span>`;
    if (triggerBtn) {
      triggerBtn.innerText = t.login_btn;
      triggerBtn.onclick = openLoginModal;
    }
  }
}

function openLoginModal() {
  const modal = document.getElementById('modal-login');
  if (modal) modal.classList.remove('hidden');
}

function closeLoginModal() {
  const modal = document.getElementById('modal-login');
  if (modal) modal.classList.add('hidden');
}

function handleDemoLoginSubmit(event) {
  event.preventDefault();
  const emailElem = document.getElementById('demo-email-input');
  if (!emailElem || !emailElem.value) return;

  saveUser({
    email: emailElem.value,
    name: emailElem.value.split('@')[0]
  });

  closeLoginModal();
}

function handleGoogleSignInResponse(response) {
  try {
    // Decode Google JWT credential payload
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const payload = JSON.parse(jsonPayload);

    saveUser({
      email: payload.email,
      name: payload.name || payload.given_name || payload.email
    });

    closeLoginModal();
  } catch (e) {
    console.error("Google sign-in parse error:", e);
  }
}

function handleLogout() {
  saveUser(null);
}


// --- LOCAL STORAGE & BOOK MANAGEMENT ---

function getStoredBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoredBooks(books) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    updateMenuBookCount();
  } catch (e) {
    console.error("Error saving books:", e);
  }
}

function saveCurrentBook(isDuplicateAllowed = false) {
  if (!currentScannedBook) return;

  const books = getStoredBooks();
  const newEntry = {
    ...currentScannedBook,
    id: 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    addedAt: new Date().toISOString()
  };

  books.push(newEntry);
  saveStoredBooks(books);

  discardCurrentBook();
  navigateTo('screen-library');
}

function deleteBookById(bookId) {
  if (confirm("Opravdu chcete tuto knihu odebrat z knihovny?")) {
    let books = getStoredBooks();
    books = books.filter(b => b.id !== bookId);
    saveStoredBooks(books);
    renderLibrary();
  }
}

function confirmClearLibrary() {
  const books = getStoredBooks();
  if (books.length === 0) return;

  if (confirm("Opravdu chcete vymazat celou svou knihovnu? Tato akce je nevratná.")) {
    saveStoredBooks([]);
    renderLibrary();
  }
}

function updateMenuBookCount() {
  const books = getStoredBooks();
  const countElem = document.getElementById('menu-book-count');
  const libCountElem = document.getElementById('library-count');
  if (countElem) countElem.innerText = books.length;
  if (libCountElem) libCountElem.innerText = books.length;
}


// --- LIBRARY RENDER, ALPHABET SIDEBAR & SEARCH ---

function getFirstLetter(str) {
  if (!str) return '#';
  const cleanStr = str.trim().toUpperCase();
  if (cleanStr.startsWith('CH')) return 'CH';
  const first = cleanStr.charAt(0);
  return first.match(/[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/i) ? normalizeCzechLetter(first) : '#';
}

function normalizeCzechLetter(char) {
  const map = {
    'Á':'A', 'Ä':'A',
    'Č':'Č',
    'Ď':'D',
    'É':'E', 'Ě':'E',
    'Í':'I',
    'Ň':'N',
    'Ó':'O', 'Ö':'O',
    'Ř':'Ř',
    'Š':'Š',
    'Ť':'T',
    'Ú':'U', 'Ů':'U', 'Ü':'U',
    'Ý':'Y',
    'Ž':'Ž'
  };
  return map[char] || char;
}

function renderLibrary() {
  const booksListElem = document.getElementById('books-list');
  const searchInput = document.getElementById('library-search-input');

  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let books = getStoredBooks();

  const lang = getCurrentLang();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.cs;

  books.sort((a, b) => (a.title || '').localeCompare(b.title || '', lang, { sensitivity: 'base' }));

  if (query) {
    books = books.filter(b =>
      (b.title && b.title.toLowerCase().includes(query)) ||
      (b.author && b.author.toLowerCase().includes(query)) ||
      (b.isbn && b.isbn.toLowerCase().includes(query))
    );
  }

  updateMenuBookCount();
  renderAlphabetSidebar(books);

  if (books.length === 0) {
    if (query) {
      booksListElem.innerHTML = `
        <div class="empty-library">
          <h3>${t.no_search_results}</h3>
          <p>Nenalezena žádná kniha odpovídající "<strong>${escapeHtml(query)}</strong>".</p>
        </div>
      `;
    } else {
      booksListElem.innerHTML = `
        <div class="empty-library">
          <h3>${t.empty_library_title}</h3>
          <p>${t.empty_library_desc}</p>
          <button class="chunky-btn primary-btn" onclick="navigateTo('screen-scanner')" style="margin-top: 16px;">
            ${t.scan_first_book_btn}
          </button>
        </div>
      `;
    }
    return;
  }

  let html = '';
  let currentLetterGroup = '';

  books.forEach(book => {
    const letter = getFirstLetter(book.title);
    const idAnchor = `letter-group-${letter}`;

    let anchorAttr = '';
    if (letter !== currentLetterGroup) {
      currentLetterGroup = letter;
      anchorAttr = `id="${idAnchor}"`;
    }

    const coverSrc = book.cover ? book.cover : '';
    const bookSvgPlaceholder = `<div class="book-cover-placeholder"><svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg></div>`;
    const coverHtml = coverSrc
      ? `<img src="${escapeHtml(coverSrc)}" alt="Obálka" class="book-cover" onerror="this.onerror=null; this.outerHTML='${bookSvgPlaceholder}';" />`
      : bookSvgPlaceholder;

    html += `
      <div class="book-card" ${anchorAttr}>
        ${coverHtml}
        <div class="book-info">
          <div class="book-title">${escapeHtml(book.title || 'Neznámý název')}</div>
          <div class="book-author">${escapeHtml(book.author || 'Neznámý autor')}</div>
          <div class="book-meta">
            ${book.year ? `<span>Rok: ${escapeHtml(book.year)}</span>` : ''}
            ${book.publisher ? `<span>${book.year ? '• ' : ''}${escapeHtml(book.publisher)}</span>` : ''}
          </div>
        </div>
        <div class="book-actions">
          <button class="delete-book-btn" onclick="deleteBookById('${book.id}')" title="Odebrat knihu">
            <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    `;
  });

  booksListElem.innerHTML = html;
}

function renderAlphabetSidebar(books) {
  const sidebarElem = document.getElementById('alphabet-sidebar');
  if (!sidebarElem) return;

  const presentLetters = new Set();
  books.forEach(b => {
    presentLetters.add(getFirstLetter(b.title));
  });

  let html = '';
  CZECH_ALPHABET.forEach(lettr => {
    const isPresent = presentLetters.has(lettr);
    const activeClass = isPresent ? 'active' : '';
    html += `
      <button class="alpha-letter ${activeClass}" onclick="scrollToLetter('${lettr}')" ${!isPresent ? 'disabled style="opacity: 0.3;"' : ''}>
        ${lettr}
      </button>
    `;
  });

  sidebarElem.innerHTML = html;
}

function scrollToLetter(letter) {
  const targetElem = document.getElementById(`letter-group-${letter}`);
  if (targetElem) {
    targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function filterLibraryBooks() {
  const searchInput = document.getElementById('library-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  if (clearBtn) {
    if (searchInput.value.length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }
  renderLibrary();
}

function clearLibrarySearch() {
  const searchInput = document.getElementById('library-search-input');
  if (searchInput) searchInput.value = '';
  filterLibraryBooks();
}

function copyLibraryShareLink() {
  const appUrl = window.location.href.split('#')[0];
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(appUrl).then(() => {
      alert("Odkaz byl zkopírován do schránky!");
    }).catch(() => {
      prompt("Kopírujte odkaz:", appUrl);
    });
  } else {
    prompt("Kopírujte odkaz:", appUrl);
  }
}


// --- RECOMMENDED BOOKS & REVIEWS ---

function getStoredReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveReview(bookId, stars, comment) {
  const reviewsMap = getStoredReviews();
  if (!reviewsMap[bookId]) {
    reviewsMap[bookId] = [];
  }

  reviewsMap[bookId].unshift({
    stars: stars,
    comment: comment,
    date: new Date().toLocaleDateString('cs-CZ')
  });

  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviewsMap));
  } catch (e) {
    console.error("Error saving review:", e);
  }
}

function renderMonthlyBooks() {
  const listContainer = document.getElementById('monthly-books-list');
  if (!listContainer) return;

  const lang = getCurrentLang();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.cs;

  const reviewsMap = getStoredReviews();

  let html = '';
  RECOMMENDED_BOOKS.forEach(book => {
    const bookReviews = reviewsMap[book.id] || [];

    let reviewsHtml = '';
    if (bookReviews.length > 0) {
      bookReviews.forEach(r => {
        let starsSvg = '';
        for (let i = 1; i <= 5; i++) {
          starsSvg += i <= r.stars ? '★' : '☆';
        }
        reviewsHtml += `
          <div class="review-item">
            <div class="review-item-header">
              <span class="review-stars">${starsSvg}</span>
              <span>${escapeHtml(r.date)}</span>
            </div>
            <div class="review-text">${escapeHtml(r.comment)}</div>
          </div>
        `;
      });
    } else {
      reviewsHtml = `<div class="input-hint" style="font-style: italic;">${t.no_reviews_yet}</div>`;
    }

    const coverSrc = book.cover ? book.cover : '';
    const bookSvgPlaceholder = `<div class="book-cover-placeholder"><svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg></div>`;
    const coverHtml = coverSrc
      ? `<img src="${escapeHtml(coverSrc)}" alt="Obálka" class="book-cover" onerror="this.onerror=null; this.outerHTML='${bookSvgPlaceholder}';" />`
      : bookSvgPlaceholder;

    html += `
      <div class="monthly-book-card">
        <div class="monthly-book-main">
          ${coverHtml}
          <div class="book-info">
            <div class="book-title">${escapeHtml(book.title)}</div>
            <div class="book-author">${escapeHtml(book.author)}</div>
            <div class="book-meta"><span>${escapeHtml(book.publisher)} (${escapeHtml(book.year)})</span></div>
            <p style="font-size: 12px; margin-top: 6px; color: var(--text-muted);">${escapeHtml(book.description)}</p>
          </div>
        </div>

        <!-- Star Rating Input -->
        <div class="comment-input-area">
          <label class="input-label">${t.add_review_label}</label>
          <div class="star-rating-picker" id="stars-picker-${book.id}">
            ${[1,2,3,4,5].map(star => `
              <button class="star-btn" data-star="${star}" onclick="selectStarRating('${book.id}', ${star})">
                <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </button>
            `).join('')}
          </div>

          <textarea id="comment-text-${book.id}" class="comment-textarea" placeholder="${t.write_comment_placeholder}"></textarea>
          <button class="chunky-btn primary-btn small-btn" onclick="submitBookReview('${book.id}')">
            ${t.submit_review_btn}
          </button>
        </div>

        <!-- Reviews List -->
        <div class="reviews-list">
          <label class="input-label">${t.user_reviews_label}</label>
          ${reviewsHtml}
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

const activeRatings = {};

function selectStarRating(bookId, stars) {
  activeRatings[bookId] = stars;
  const pickerElem = document.getElementById(`stars-picker-${bookId}`);
  if (!pickerElem) return;

  const btns = pickerElem.querySelectorAll('.star-btn');
  btns.forEach((btn, idx) => {
    if (idx < stars) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function submitBookReview(bookId) {
  const stars = activeRatings[bookId] || 5;
  const textElem = document.getElementById(`comment-text-${bookId}`);
  const commentText = textElem ? textElem.value.trim() : '';

  if (!commentText) {
    alert("Napište prosím k hodnocení i slovní komentář.");
    return;
  }

  saveReview(bookId, stars, commentText);
  if (textElem) textElem.value = '';
  renderMonthlyBooks();
}


// --- SOCIAL: FOLLOW ACCOUNTS & INVITE FRIENDS ---

function getStoredFollows() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLLOWS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function toggleFollowAccount(accId) {
  let follows = getStoredFollows();
  if (follows.includes(accId)) {
    follows = follows.filter(id => id !== accId);
  } else {
    follows.push(accId);
  }

  try {
    localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(follows));
  } catch (e) {
    console.error("Error saving follow state:", e);
  }

  renderSocialAccounts();
}

function renderSocialAccounts() {
  const listContainer = document.getElementById('accounts-list');
  if (!listContainer) return;

  const follows = getStoredFollows();

  let html = '';
  RECOMMENDED_ACCOUNTS.forEach(acc => {
    const isFollowing = follows.includes(acc.id);
    html += `
      <div class="account-item">
        <div class="account-info">
          <span class="account-name">${escapeHtml(acc.name)}</span>
          <span class="account-handle">${escapeHtml(acc.handle)} • ${escapeHtml(acc.desc)}</span>
        </div>
        <button class="chunky-btn ${isFollowing ? 'outline-btn' : 'primary-btn'} small-btn" onclick="toggleFollowAccount('${acc.id}')">
          ${isFollowing ? 'Sledováno ✓' : '+ Sledovat'}
        </button>
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

function inviteFriends() {
  copyLibraryShareLink();
}


// Helper to escape HTML strings
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  const currentLang = getCurrentLang();
  initTheme();
  setLanguage(currentLang);

  const quickBtn = document.getElementById('theme-toggle-quick');
  if (quickBtn) {
    quickBtn.addEventListener('click', toggleTheme);
  }
});
