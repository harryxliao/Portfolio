(function () {
  // Page text is translated at build time (see src/); this only tracks the
  // current language, keeps nav labels / titles in sync during SPA navigation,
  // and switches between / and /zh/.
  const STORAGE_KEY = 'portfolio-lang';
  const DEFAULT_LANG = 'zh';
  const SUPPORTED_LANGS = new Set(['zh', 'en']);

  const titles = {
    zh: {
      home: 'Xian-Hao (Harry) Liao | 設計作品集',
      about: '關於 Harry | Xian-Hao (Harry) Liao',
      work: '作品總覽 | Xian-Hao (Harry) Liao',
      contact: '聯絡 Harry | Xian-Hao (Harry) Liao',
      'work/gate-mg': 'Gate Motion Graphics | Xian-Hao (Harry) Liao',
      'work/gate-redbull': 'Gate × RedBull F1 NFT | Xian-Hao (Harry) Liao',
      'work/thesisbook': 'Dream Reality — MFA 碩士論文書 | Xian-Hao (Harry) Liao',
      'work/bjs-intern': 'BJ\'s 暑期實習設計 | Xian-Hao (Harry) Liao',
      'work/ABC-Design': 'ABC Design 品牌視覺 | Xian-Hao (Harry) Liao',
      'work/ARCCSRL-Robotic-Limb': 'ARCCSRL 義肢研究 — MIT Media Lab | Xian-Hao (Harry) Liao',
      'work/DMI': 'DMI 網站重新設計 — MassArt | Xian-Hao (Harry) Liao',
    },
    en: {
      home: 'Xian-Hao (Harry) Liao | Design Portfolio',
      about: 'About Harry | Xian-Hao (Harry) Liao',
      work: 'Work | Xian-Hao (Harry) Liao',
      contact: 'Contact | Xian-Hao (Harry) Liao',
      'work/gate-mg': 'Gate Motion Graphics | Xian-Hao (Harry) Liao',
      'work/gate-redbull': 'Gate × RedBull Racing F1 NFT | Xian-Hao (Harry) Liao',
      'work/thesisbook': 'Dream Reality — MFA Thesis Book | Xian-Hao (Harry) Liao',
      'work/bjs-intern': 'BJ\'s Wholesale Club Internship | Xian-Hao (Harry) Liao',
      'work/ABC-Design': 'ABC Design Brand Visual | Xian-Hao (Harry) Liao',
      'work/ARCCSRL-Robotic-Limb': 'ARCCSRL Robotic Limb — MIT Media Lab | Xian-Hao (Harry) Liao',
      'work/DMI': 'DMI Website Redesign — MassArt | Xian-Hao (Harry) Liao',
    },
  };

  const navLabels = {
    zh: {
      home: '首頁',
      about: '關於',
      work: '作品',
      contact: '聯絡',
    },
    en: {
      home: 'HOME',
      about: 'ABOUT',
      work: 'WORK',
      contact: 'CONTACT',
    },
  };

  function getStoredLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED_LANGS.has(stored)) return stored;
    } catch (e) { }
    return DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    if (!SUPPORTED_LANGS.has(lang)) return DEFAULT_LANG;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { }
    return lang;
  }

  function getCurrentLang() {
    // If the URL path contains '/zh', force Chinese. Otherwise force English.
    return window.location.pathname.includes('/zh') ? 'zh' : 'en';
  }

  function setDocumentTitle(pageName, lang) {
    const page = pageName || 'home';
    const pageTitles = titles[lang] || titles.en;
    document.title = pageTitles[page] || pageTitles.home;
  }

  function cacheText(el, useHtml = false) {
    const attr = useHtml ? 'data-i18n-original-html' : 'data-i18n-original-text';
    if (!el.hasAttribute(attr)) {
      el.setAttribute(attr, useHtml ? el.innerHTML : el.textContent);
    }
  }

  function applyNavLabels(scope) {
    const lang = getCurrentLang();
    const labels = navLabels[lang] || navLabels.en;

    const menuLinks = Array.from((scope || document).querySelectorAll('.main-menu-link[data-menu-key], .mobile-link[data-menu-key]'));
    menuLinks.forEach((link) => {
      const key = link.getAttribute('data-menu-key');
      const label = labels[key] || key || '';
      if (link.classList.contains('main-menu-link')) {
        link.textContent = `${link.classList.contains('active') ? '• ' : ''}${label}`;
      } else {
        link.textContent = label;
      }
    });

    const closeButton = (scope || document).querySelector('.close-btn');
    if (closeButton) {
      cacheText(closeButton, false);
      closeButton.textContent = lang === 'zh' ? '♦ 關閉 ♦' : '♦ CLOSE ♦';
    }

    const footer = (scope || document).querySelector('.mobile-footer-text');
    if (footer) {
      cacheText(footer, false);
      footer.textContent = lang === 'zh' ? '// 設計下一個未來。' : '// Designing the next reality.';
    }

    const toggles = Array.from((scope || document).querySelectorAll('[data-lang-toggle]'));
    toggles.forEach((btn) => {
      cacheText(btn, false);
      btn.innerHTML = '<span class="lang-option lang-en">EN</span><span class="lang-sep">/</span><span class="lang-option lang-zh">中</span>';
      btn.classList.remove('lang-zh-active', 'lang-en-active');
      btn.classList.add(lang === 'zh' ? 'lang-zh-active' : 'lang-en-active');
      btn.setAttribute('aria-label', lang === 'zh' ? '目前是中文，切換到 English' : 'Currently English, switch to 中文');
      btn.setAttribute('title', lang === 'zh' ? '目前是中文，點擊切換到 English' : 'Currently English, click to switch to 中文');
      btn.dataset.currentLang = lang;
    });
  }

  function applySiteLanguage(scope = document, pageName) {
    const lang = getCurrentLang();
    const page = pageName || (document.body && document.body.dataset.sitePage) || 'home';
    if (document.documentElement) {
      document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
      document.documentElement.dataset.siteLang = lang;
    }
    if (document.body) {
      document.body.dataset.siteLang = lang;
      document.body.dataset.sitePage = page;
    }

    // Static pages already ship the right <title>; only update it when the SPA swaps content.
    if (scope !== document) setDocumentTitle(page, lang);
    applyNavLabels(scope);

  }

  function setSiteLanguage(lang, scope = document, pageName) {
    const next = setStoredLang(lang);
    applySiteLanguage(scope, pageName);
    // update URL hash for current page without firing hashchange
    try {
      const page = pageName || (document.body && document.body.dataset.sitePage) || 'home';
      if (window.history && window.history.replaceState) {
        try { window.history.replaceState({ spa: page, lang: next }, '', `/#${page}-${next}`); } catch (e) { }
      }
    } catch (e) { }
    // notify other modules the language changed
    try {
      const ev = new CustomEvent('site-language-changed', { detail: { lang: next, page: pageName || (document.body && document.body.dataset.sitePage) || 'home' } });
      window.dispatchEvent(ev);
    } catch (e) { }
    return next;
  }

  function toggleSiteLanguage(scope = document, pageName) {
    const path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
    const isZh = path.startsWith('zh');
    const page = isZh ? path.replace(/^zh\/?/, '') : path;

    if (isZh) {
      // Go to English
      window.location.href = '/' + page;
    } else {
      // Go to Chinese
      window.location.href = '/zh/' + page;
    }
    return isZh ? 'en' : 'zh';
  }

  function getLanguageForToggle() {
    return getCurrentLang();
  }

  window.applySiteLanguage = applySiteLanguage;
  window.setSiteLanguage = setSiteLanguage;
  window.toggleSiteLanguage = toggleSiteLanguage;
  window.getCurrentSiteLanguage = getCurrentLang;
  window.getLanguageForToggle = getLanguageForToggle;
})();
