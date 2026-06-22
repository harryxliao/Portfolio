/* =========================================
   GSAP + Three.js 動畫控制器
   Portfolio of Xian-Hao (Harry) Liao
   =========================================
   依賴：GSAP 3.12+, ScrollTrigger, Three.js
   ========================================= */

(function () {
  'use strict';

  // ── 前置檢查 ──────────────────────────────────
  if (typeof gsap === 'undefined') {
    console.warn('[animations.js] GSAP not loaded — skipping animations.');
    return;
  }

  // 尊重使用者「減少動態效果」的系統偏好
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('gsap-active');

  const mobile = () => window.innerWidth <= 768;

  // ── 工具函式 ──────────────────────────────────

  /**
   * 將元素內已被 splitTextToChars / wrapWordsInSpans 拆分的
   * <span class="char"> 或 <span class="anim-word"> 還原回純文字，
   * 同時清除 GSAP 殘留的 inline style，確保重複初始化時乾淨。
   */
  function unwrapAnimSpans(el) {
    const spans = el.querySelectorAll('.char, .anim-word');
    if (!spans.length) return;
    // 取得 aria-label（splitTextToChars 設定的原始文字）
    const ariaText = el.getAttribute('aria-label');
    if (ariaText) {
      // 還原整段原始文字，保留 <br> 等
      // 先收集非 span 子元素（如 <br>）的位置
      const brs = el.querySelectorAll('br');
      if (brs.length > 0) {
        el.innerHTML = '';
        const parts = ariaText.split('\n');
        parts.forEach((part, i) => {
          el.appendChild(document.createTextNode(part));
          if (i < brs.length) el.appendChild(document.createElement('br'));
        });
      } else {
        el.textContent = ariaText;
      }
      el.removeAttribute('aria-label');
      el.style.cssText = '';
      return;
    }
    // For wrapWordsInSpans: reconstruct from existing spans
    const fragment = document.createDocumentFragment();
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 1 && (node.classList.contains('anim-word') || node.classList.contains('char'))) {
        fragment.appendChild(document.createTextNode(node.textContent));
      } else {
        fragment.appendChild(node.cloneNode(true));
      }
    });
    el.innerHTML = '';
    el.appendChild(fragment);
    el.style.cssText = '';
  }

  /**
   * 將元素文字拆分成單獨的 <span class="char">，
   * 讓每個字母都能獨立做 transform 動畫。
   */
  function splitTextToChars(el) {
    // 清除前次殘留
    unwrapAnimSpans(el);
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    text.split('').forEach(c => {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = c === ' ' ? '\u00A0' : c;
      el.appendChild(span);
    });
    return el.querySelectorAll('.char');
  }

  /**
   * 將元素的文字節點拆成 <span class="anim-word">，
   * 保留 <br> 等既有子元素不變。
   */
  function wrapWordsInSpans(el) {
    // 清除前次殘留
    unwrapAnimSpans(el);
    const fragment = document.createDocumentFragment();
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3) { // 文字節點
        node.textContent.split(/(\s+)/).forEach(part => {
          if (part.trim()) {
            const span = document.createElement('span');
            span.className = 'anim-word';
            span.textContent = part;
            fragment.appendChild(span);
          } else if (part) {
            fragment.appendChild(document.createTextNode(part));
          }
        });
      } else {
        fragment.appendChild(node.cloneNode(true));
      }
    });
    el.innerHTML = '';
    el.appendChild(fragment);
    return el.querySelectorAll('.anim-word');
  }


  // ═══════════════════════════════════════════
  //  GSAP 動畫效果
  // ═══════════════════════════════════════════

  // ── 1. Hero 標題逐字飛入 ──────────────────────
  function initHeroTitle() {
    const title = document.querySelector('.hero-title');
    if (!title) return;

    // 關閉既有 CSS 動畫，改由 GSAP 完整接管
    title.style.animation = 'none';
    title.style.opacity = '0'; // 保持隱藏直到 chars 就位

    const chars = splitTextToChars(title);

    gsap.set(chars, {
      opacity: 0,
      y: mobile() ? 30 : 60,
      rotateX: -90,
      transformPerspective: 600
    });

    // 父容器設為可見（子 chars 仍各自隱藏）
    title.style.opacity = '1';

    // 逐字飛入動畫
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: mobile() ? 0.6 : 0.9,
      stagger: 0.04,
      ease: 'back.out(1.4)',
      delay: 0.5,
      onComplete: function () {
        // 飛入完成後加上持續呼吸光暈
        gsap.to(chars, {
          textShadow: '0 0 12px rgba(255,255,255,0.25)',
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: { each: 0.08, from: 'center' }
        });
      }
    });
  }

  // ── 2. Hero 底部資訊左右滑入 ──────────────────
  function initHeroBottomInfo() {
    const bottomInfo = document.querySelector('.hero-bottom-info');
    if (!bottomInfo) return;

    bottomInfo.style.animation = 'none';
    bottomInfo.style.opacity = '1';

    const left = bottomInfo.querySelector('.bottom-left');
    const right = bottomInfo.querySelector('.bottom-right');

    if (left) {
      gsap.fromTo(left,
        { opacity: 0, x: -40 },
        { opacity: 0.8, x: 0, duration: 0.8, ease: 'power2.out', delay: 1.4 }
      );
    }
    if (right) {
      gsap.fromTo(right,
        { opacity: 0, x: 40 },
        { opacity: 0.8, x: 0, duration: 0.8, ease: 'power2.out', delay: 1.6 }
      );
    }
  }

  // ── 3. Description strip 文字展開 ─────────────
  function initDescriptionStrip() {
    const strip = document.querySelector('.description-strip');
    if (!strip) return;

    const content = strip.querySelector('.description-content p');
    if (!content) return;

    gsap.fromTo(content,
      { opacity: 0, y: 25, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: strip,
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // ── 4. Section headers 滑入 + 模糊 → 清晰 ────
  function initSectionHeaders() {
    const headers = document.querySelectorAll('.clients-header');

    headers.forEach(header => {
      const solid = header.querySelector('.title-solid');
      const outline = header.querySelector('.title-outline');

      if (solid) {
        gsap.fromTo(solid,
          { opacity: 0, x: mobile() ? -30 : -80, filter: 'blur(10px)' },
          {
            opacity: 1, x: 0, filter: 'blur(0px)',
            duration: mobile() ? 0.6 : 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (outline) {
        gsap.fromTo(outline,
          { opacity: 0, x: mobile() ? 30 : 80, filter: 'blur(10px)' },
          {
            opacity: 1, x: 0, filter: 'blur(0px)',
            duration: mobile() ? 0.6 : 1,
            ease: 'power3.out',
            delay: 0.15,
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });
  }

  // ── 5. Project cards 視差揭露 ─────────────────
  function initProjectCards() {
    const cards = document.querySelectorAll('.simple-media .project-info');

    cards.forEach(card => {
      const title = card.querySelector('.project-title');
      const desc = card.querySelector('.project-desc');
      const link = card.querySelector('.view-project');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card.closest('.simple-media'),
          start: 'top 55%',
          toggleActions: 'play none none reverse'
        }
      });

      if (title) {
        tl.fromTo(title,
          { opacity: 0, y: 45 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        );
      }
      if (desc) {
        tl.fromTo(desc,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.4'
        );
      }
      if (link) {
        tl.fromTo(link,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        );
      }
    });
  }

  // ── 6. Career accordion 交錯入場 ──────────────
  function initCareerAccordion() {
    const containers = document.querySelectorAll('.accordion-container');

    containers.forEach(container => {
      const items = container.querySelectorAll('.accordion-item');
      if (!items.length) return;

      gsap.fromTo(items,
        { opacity: 0, x: mobile() ? 20 : 50 },
        {
          opacity: 1, x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  // ── 7. Impact cards 縮放 + 淡入 ───────────────
  function initImpactCards() {
    const cards = document.querySelectorAll('.impact-card');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 40, scale: 0.88 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.65,
        stagger: 0.12,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '.impact-grid',
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // ── 8. Parallax section 文字揭露 ──────────────
  function initParallaxText() {
    const title = document.querySelector('.parallax-title');
    const smallLabel = document.querySelector('.parallax-content .small-label');
    const techBox = document.querySelector('.tech-text-box');
    if (!title) return;

    // 清除任何殘留 inline style 與 anim spans
    unwrapAnimSpans(title);
    gsap.set(title, { clearProps: 'all' });
    if (smallLabel) gsap.set(smallLabel, { clearProps: 'all' });
    if (techBox) gsap.set(techBox, { clearProps: 'all' });

    // 先隱藏等待觸發
    gsap.set(title, { opacity: 0, y: 30, filter: 'blur(6px)' });
    if (smallLabel) gsap.set(smallLabel, { opacity: 0, y: 15 });
    if (techBox) gsap.set(techBox, { opacity: 0, y: 20 });

    // 用 IntersectionObserver 取代 ScrollTrigger —
    // 因為 main.js updateParallax 動態 transform 周圍區塊，
    // ScrollTrigger 的位置計算會被干擾。
    let played = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !played) {
          played = true;
          const tl = gsap.timeline();

          if (smallLabel) {
            tl.to(smallLabel,
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
          }

          tl.to(title,
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' },
            smallLabel ? '-=0.2' : 0
          );

          if (techBox) {
            tl.to(techBox,
              { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
              '-=0.3'
            );
          }

          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });

    observer.observe(document.querySelector('.parallax-section'));
  }


  // ── 10. Portfolio button 脈動光暈 ─────────────
  function initPortfolioButton() {
    const btn = document.querySelector('.portfolio-button');
    if (!btn) return;

    // 持續發光脈動
    gsap.to(btn, {
      boxShadow: '0 0 25px rgba(255,255,255,0.2), 0 0 60px rgba(255,255,255,0.06)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // 滾動進場
    gsap.fromTo(btn,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: btn,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // ── 11. Learn More 區塊 ───────────────────────
  function initLearnMore() {
    const section = document.querySelector('.learn-more-section');
    if (!section) return;

    const title = section.querySelector('.learn-more-title');
    const btn = section.querySelector('.learn-more-btn');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });

    if (title) {
      tl.fromTo(title,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      );
    }
    if (btn) {
      tl.fromTo(btn,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      );
    }
  }

  // ── 12. Bottom showcase 圖片條入場 ────────────
  function initBottomShowcase() {
    const items = document.querySelectorAll('.strip-item');
    if (!items.length) return;

    gsap.fromTo(items,
      { opacity: 0, y: 30, scale: 0.94 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.image-strip',
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }



  // ═══════════════════════════════════════════
  //  About 頁面動畫
  // ═══════════════════════════════════════════

  function initAboutAnimations() {
    // ── About Hero: 標題逐字飛入 ──
    const aboutTitle = document.querySelector('.about-page .about-title');
    if (aboutTitle) {
      const chars = splitTextToChars(aboutTitle);
      gsap.set(chars, {
        opacity: 0,
        y: mobile() ? 20 : 40,
        rotateX: -60,
        transformPerspective: 500
      });
      aboutTitle.style.opacity = '1';
      gsap.to(chars, {
        opacity: 1, y: 0, rotateX: 0,
        duration: mobile() ? 0.5 : 0.7,
        stagger: 0.025,
        ease: 'back.out(1.2)',
        delay: 0.2,
        onComplete() {
          gsap.to(chars, {
            textShadow: '0 0 8px rgba(255,255,255,0.15)',
            duration: 2.5, repeat: -1, yoyo: true,
            ease: 'sine.inOut',
            stagger: { each: 0.06, from: 'center' }
          });
        }
      });
    }

    // ── About 副標題滑入 ──
    const aboutSub = document.querySelector('.about-page .about-sub');
    if (aboutSub) {
      gsap.fromTo(aboutSub,
        { opacity: 0, y: 30, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out', delay: 0.4 }
      );
    }

    // ── Resume 按鈕 ──
    const resumeBtn = document.querySelector('.about-page .resume-btn');
    if (resumeBtn) {
      gsap.fromTo(resumeBtn,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.45 }
      );
    }

    // ── Portrait 照片框 ──
    const portrait = document.querySelector('.about-page .portrait-frame');
    if (portrait) {
      gsap.fromTo(portrait,
        {
          opacity: 0,
          scale: 1.1,
          filter: 'blur(12px)',
          rotationY: -20,
          rotationX: 5,
          x: -40,
          y: 20,
          transformPerspective: 1000,
          transformOrigin: 'center left'
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          rotationY: 0,
          rotationX: 0,
          x: 0,
          y: 0,
          duration: 1.5,
          ease: 'power3.out',
          delay: 1.2
        }
      );
    }

    // ── Skill blocks 交錯浮現 ──
    const skillBlocks = document.querySelectorAll('.about-page .skill-block');
    if (skillBlocks.length) {
      gsap.fromTo(skillBlocks,
        { opacity: 0, y: 35, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6, stagger: 0.15,
          ease: 'back.out(1.1)',
          scrollTrigger: {
            trigger: '.about-page .skill-row',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // ── Moments 標題 + 卡片 ──
    const momentsTitle = document.querySelector('.about-page .moments-title');
    if (momentsTitle) {
      const words = wrapWordsInSpans(momentsTitle);
      gsap.fromTo(words,
        { opacity: 0, y: 20, filter: 'blur(4px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.5, stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.about-page .moments',
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    const momentCards = document.querySelectorAll('.about-page .moment-card');
    if (momentCards.length) {
      gsap.fromTo(momentCards,
        { opacity: 0, y: 40, scale: 0.88 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6, stagger: 0.12,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.about-page .moments-row',
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // ── Thesis card 揭露 ──
    const thesisCard = document.querySelector('.about-page .thesis-card');
    if (thesisCard) {
      const thesisText = thesisCard.querySelector('.thesis-text');
      const thesisImage = thesisCard.querySelector('.thesis-image');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.about-page .thesis-cta',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
      if (thesisText) {
        tl.fromTo(thesisText,
          { opacity: 0, x: mobile() ? 0 : -50 },
          { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }
        );
      }
      if (thesisImage) {
        tl.fromTo(thesisImage,
          { opacity: 0, x: mobile() ? 0 : 50, scale: 0.92 },
          { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.4'
        );
      }
    }

    // ── Projects invite ──
    const inviteInner = document.querySelector('.about-page .invite-inner');
    if (inviteInner) {
      gsap.fromTo(inviteInner,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: '.about-page .projects-invite',
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // ── About Learn More ──
    initLearnMore();
  }


  // ═══════════════════════════════════════════
  //  Work 頁面動畫
  // ═══════════════════════════════════════════

  function initWorkAnimations() {
    // ── Featured card 揭露 ──
    const featuredCard = document.querySelector('.work-page .work-featured-card');
    if (featuredCard) {
      const overlay = featuredCard.querySelector('.work-overlay');
      gsap.fromTo(featuredCard,
        { opacity: 0, y: 50, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6, ease: 'power2.out', delay: 0.6 }
      );
      if (overlay) {
        gsap.fromTo(overlay,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.2 }
        );
      }
    }

    // ── Work grid cards 交錯入場 ──
    const workCards = document.querySelectorAll('.work-page .work-grid .work-card');
    if (workCards.length) {
      // On mobile all cards are stacked and the grid is already in-viewport
      // when the page loads, so ScrollTrigger fires immediately — making the
      // second card appear before the first (featured) card has finished its
      // 1.6s animation. Use a fixed delay on mobile so the grid cards always
      // start AFTER the featured card has appeared.
      const isMob = mobile();
      gsap.set(workCards, { opacity: 0, y: 50, filter: 'blur(6px)' });

      if (isMob) {
        // Featured card delay=0.6 + duration=1.6 → visible ~1.0s in.
        // Start grid at 1.1s so it cleanly follows the featured card.
        gsap.to(workCards, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.7, stagger: 0.18,
          ease: 'power2.out',
          delay: 1.1
        });
      } else {
        gsap.fromTo(workCards,
          { opacity: 0, y: 50, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.6, stagger: 0.18,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.work-page .work-grid',
              start: 'top 95%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true
            }
          }
        );
      }
    }

    // ── Work Index Section header ──
    const workIndexHead = document.querySelector('.work-page .work-index-head');
    if (workIndexHead) {
      const kicker = workIndexHead.querySelector('.work-kicker');
      const heading = workIndexHead.querySelector('h2');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.work-page .work-index-section',
          start: 'top 95%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true
        }
      });

      if (kicker) {
        tl.fromTo(kicker,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
      if (heading) {
        const chars = splitTextToChars(heading);
        tl.fromTo(chars,
          { opacity: 0, y: 20, rotateX: -45, transformPerspective: 400 },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 0.4, stagger: 0.02,
            ease: 'back.out(1.1)'
          },
          '-=0.2'
        );
      }
    }

    // ── Work table rows 交錯滑入 ──
    const tableRows = document.querySelectorAll('.work-page .work-table-row:not(.work-table-row--head)');
    if (tableRows.length) {
      gsap.fromTo(tableRows,
        { opacity: 0, x: mobile() ? 20 : 60 },
        {
          opacity: 1, x: 0,
          duration: 0.45, stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.work-page .work-table',
            start: 'top 95%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true
          }
        }
      );
    }

    // ── Work Learn More ──
    initLearnMore();
  }


  // ═══════════════════════════════════════════
  //  Contact 頁面動畫
  // ═══════════════════════════════════════════

  function initContactAnimations() {
    // ── Kicker text 逐字揭露 ──
    const kicker = document.querySelector('.contact-page .contact-kicker');
    if (kicker) {
      const chars = splitTextToChars(kicker);
      gsap.set(chars, { opacity: 0, y: 15 });
      kicker.style.opacity = '1';
      gsap.to(chars, {
        opacity: 1, y: 0,
        duration: 0.4, stagger: 0.04,
        ease: 'power2.out', delay: 0.2
      });
    }

    // ── Email button 閃爍揭露 ──
    const emailBtn = document.querySelector('.contact-page .contact-email');
    if (emailBtn) {
      gsap.fromTo(emailBtn,
        { opacity: 0, scale: 0.9, filter: 'blur(8px)' },
        {
          opacity: 1, scale: 1, filter: 'blur(0px)',
          duration: 0.7, ease: 'power3.out', delay: 0.5,
          onComplete() {
            gsap.to(emailBtn, {
              textShadow: '0 0 16px rgba(255,255,255,0.2)',
              duration: 2, repeat: -1, yoyo: true,
              ease: 'sine.inOut'
            });
          }
        }
      );
    }

    // ── Send email link ──
    const sendLink = document.querySelector('.contact-page .contact-send');
    if (sendLink) {
      gsap.fromTo(sendLink,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.8 }
      );
    }

    // ── Contact video wrap ──
    const videoWrap = document.querySelector('.contact-page .contact-video-wrap');
    if (videoWrap) {
      gsap.fromTo(videoWrap,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
      );
    }

    // ── Video caption ──
    const caption = document.querySelector('.contact-page .contact-video-caption span');
    if (caption) {
      const chars = splitTextToChars(caption);
      gsap.set(chars, { opacity: 0 });
      caption.style.opacity = '1';
      gsap.to(chars, {
        opacity: 1,
        duration: 0.02, stagger: 0.03,
        ease: 'none', delay: 0.9
      });
    }
  }


  function initProjectDetailReveals() {
    const reveals = document.querySelectorAll('.pd-reveal');
    if (!reveals.length) return;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { observer.observe(el); });
  }

  // ═══════════════════════════════════════════
  //  SPA 頁面動畫入口（供 about.js 調用）
  // ═══════════════════════════════════════════

  function initSpaPageAnimations(pageName) {
    // Kill existing ScrollTriggers to prevent stale references
    ScrollTrigger.getAll().forEach(st => st.kill());

    if (pageName === 'about') {
      initAboutAnimations();
    } else if (pageName === 'work') {
      initWorkAnimations();
    } else if (pageName === 'contact') {
      initContactAnimations();
    } else if (pageName.startsWith('work/')) {
      initProjectDetailReveals();
    }

    // Recalculate positions after DOM settles AND after the page-enter
    // CSS animation finishes (800ms). On mobile the cards are already
    // in-viewport, but ScrollTrigger miscalculates positions while
    // the container still has translateY from the slide animation.
    requestAnimationFrame(() => ScrollTrigger.refresh());
    // Refresh again after the pageSlideUp animation completes (800ms)
    setTimeout(() => ScrollTrigger.refresh(), 850);
    // One more safety refresh for slow devices
    setTimeout(() => ScrollTrigger.refresh(), 1400);
  }

  // Expose globally so SPA loader can call it
  window.initSpaPageAnimations = initSpaPageAnimations;


  // ═══════════════════════════════════════════
  //  啟動所有首頁動畫
  // ═══════════════════════════════════════════
  function initAllHomeAnimations() {
    initHeroTitle();
    initHeroBottomInfo();
    initDescriptionStrip();
    initSectionHeaders();
    initProjectCards();
    initCareerAccordion();
    initImpactCards();
    initParallaxText();
    initPortfolioButton();
    initLearnMore();
    initBottomShowcase();
  }

  // Expose for restoring home animations after SPA close
  window.initHomeAnimations = function () {
    ScrollTrigger.getAll().forEach(st => st.kill());
    initAllHomeAnimations();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  // Initial run
  initAllHomeAnimations();

  // 語言切換後重新計算 ScrollTrigger 位置
  window.addEventListener('site-language-changed', () => {
    ScrollTrigger.refresh();
  });

})();
