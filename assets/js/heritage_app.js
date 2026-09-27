/**
 * Heritage Wedding Application Engine
 * Replicating the exact presentation, parallax kinematics, and interactions
 * of lovesolutions.in/heritage for Rajkumar & Rubitha
 */

(function () {
  'use strict';

  // Helper clamp functions matching reference math
  const clamp = (val, min = 0, max = 1) => Math.min(max, Math.max(min, val));

  // State
  let weddingConfig = null;
  let audioPlayer = null;
  let isPlaying = false;
  let isExpanded = false;
  let currentSlide = 0;
  let galleryTimer = null;
  let celebrationTimer = null;

  // Auto-scroll state
  const scrollRates = { '0.5': 24, '1': 84, '2': 180 };
  let currentScrollRate = scrollRates['1'];
  let isAutoScrolling = false;
  let scrollAnimFrame = 0;
  let prevScrollTime = 0;
  let targetScrollPos = 0;

  // DOM Elements
  const DOM = {};

  function initElements() {
    DOM.musicPlayer = document.getElementById('musicPlayer');
    DOM.audio = document.getElementById('weddingAudio');
    DOM.playBtn = document.getElementById('musicPlayBtn');
    DOM.expandBtn = document.getElementById('musicExpandBtn');
    DOM.trackTitle = document.getElementById('musicTrackTitle');
    DOM.trackArtist = document.getElementById('musicTrackArtist');

    DOM.scrollControls = document.getElementById('scrollControls');
    DOM.scrollToggle = document.getElementById('scrollToggle');
    DOM.scrollSpeedBtns = document.querySelectorAll('.heritage-scroll-speed');

    DOM.daysEl = document.getElementById('countDays');
    DOM.hoursEl = document.getElementById('countHours');
    DOM.minutesEl = document.getElementById('countMinutes');
    DOM.secondsEl = document.getElementById('countSeconds');

    DOM.magicBtn = document.getElementById('magicCelebrationBtn');
    DOM.countdownSection = document.getElementById('countdownSection');
    DOM.celebrationOverlay = document.getElementById('celebrationOverlay');

    DOM.gallerySlides = document.querySelectorAll('.story-photo-slide');
    DOM.lightbox = document.getElementById('galleryLightbox');
    DOM.lightboxImg = document.getElementById('lightboxImg');
    DOM.lightboxClose = document.getElementById('lightboxClose');

    DOM.rsvpOpenBtn = document.getElementById('rsvpOpenBtn');
    DOM.rsvpModal = document.getElementById('rsvpModal');
    DOM.rsvpCloseBtn = document.getElementById('rsvpCloseBtn');
    DOM.rsvpForm = document.getElementById('rsvpForm');
    DOM.rsvpSuccess = document.getElementById('rsvpSuccess');
    DOM.rsvpWhatsAppBtn = document.getElementById('rsvpWhatsAppBtn');

    DOM.motionElements = document.querySelectorAll('[data-scroll-motion]');
  }

  // --- Dynamic Configuration Binding ---
  function applyConfig(cfg) {
    if (!cfg) return;
    weddingConfig = cfg;

    const couple = cfg.couple || {};
    const groomName = couple.groom_name || 'Rajkumar';
    const brideName = couple.bride_name || 'Rubitha';
    const connector = couple.connector || 'WEDS';
    const tagline = couple.tagline || 'ARE GETTING MARRIED';
    const hashtag = couple.hashtag || `#${groomName}And${brideName}`;
    const instaHandle = couple.instagram_handle || '@kaliyappan_rajkumar';
    const mantra = couple.mantra || '॥ ஸ்ரீ முருகன் துணை ॥';

    document.title = `${groomName} & ${brideName} | Wedding Invitation`;

    // Hero names
    const heroGroom = document.getElementById('heroGroomName');
    const heroConnector = document.getElementById('heroConnector');
    const heroBride = document.getElementById('heroBrideName');
    const heroTagline = document.getElementById('heroTagline');
    if (heroGroom) heroGroom.textContent = groomName;
    if (heroConnector) heroConnector.textContent = connector;
    if (heroBride) heroBride.textContent = brideName;
    if (heroTagline) heroTagline.textContent = tagline;

    // Blessing & Invitation section
    const blessingEl = document.getElementById('invitationBlessing');
    if (blessingEl) blessingEl.textContent = mantra;

    const groomInvName = document.getElementById('invGroomName');
    const brideInvName = document.getElementById('invBrideName');
    if (groomInvName) groomInvName.textContent = groomName;
    if (brideInvName) brideInvName.textContent = brideName;

    // Lineage details
    const groomFather = cfg.groom_family?.father_name || '';
    const groomMother = cfg.groom_family?.mother_name || '';
    const groomGrandfather = cfg.groom_family?.grandfather_name || '';
    const groomGrandmother = cfg.groom_family?.grandmother_name || '';

    const brideFather = cfg.bride_family?.father_name || '';
    const brideMother = cfg.bride_family?.mother_name || '';
    const brideGrandfather = cfg.bride_family?.grandfather_name || '';
    const brideGrandmother = cfg.bride_family?.grandmother_name || '';

    const groomParentsEl = document.getElementById('groomParentsLine');
    const groomGrandparentsEl = document.getElementById('groomGrandparentsLine');
    if (groomParentsEl && (groomFather || groomMother)) {
      groomParentsEl.textContent = `(S/o ${groomFather} & ${groomMother})`;
    }
    if (groomGrandparentsEl && (groomGrandfather || groomGrandmother)) {
      groomGrandparentsEl.textContent = `(Grand S/o ${groomGrandfather} & ${groomGrandmother})`;
    }

    const brideParentsEl = document.getElementById('brideParentsLine');
    const brideGrandparentsEl = document.getElementById('brideGrandparentsLine');
    if (brideParentsEl && (brideFather || brideMother)) {
      brideParentsEl.textContent = `(D/o ${brideFather} & ${brideMother})`;
    }
    if (brideGrandparentsEl && (brideGrandfather || brideGrandmother)) {
      brideGrandparentsEl.textContent = `(Grand D/o ${brideGrandfather} & ${brideGrandmother})`;
    }

    // Social hashtag
    const hashtagLink = document.getElementById('socialHashtagLink');
    if (hashtagLink) {
      hashtagLink.textContent = hashtag;
      hashtagLink.href = `https://instagram.com/${instaHandle.replace('@', '')}`;
    }

    // Music setup
    if (cfg.music) {
      if (DOM.audio && cfg.music.file) {
        DOM.audio.src = cfg.music.file;
      }
      if (DOM.trackTitle && cfg.music.title) {
        DOM.trackTitle.textContent = cfg.music.title;
      }
    }
  }

  // --- Parallax & Scroll Motion Engine ---
  // Calculates linear interpolation and viewport offsets exactly as extracted from reference
  function getElementPageOffsetTop(el) {
    let top = 0;
    let curr = el;
    while (curr) {
      top += curr.offsetTop || 0;
      curr = curr.offsetParent;
    }
    return top;
  }

  function handleScrollMotion() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    DOM.motionElements.forEach((el) => {
      if (isReducedMotion) {
        el.style.setProperty('--motion-y', '0px');
        el.style.setProperty('--motion-opacity', '1');
        el.style.setProperty('--motion-scale', '1');
        el.style.setProperty('--motion-blur', '0px');
        return;
      }

      const motionType = el.dataset.scrollMotion;
      const scene = el.closest('.scene');
      if (!scene) return;

      if (motionType.startsWith('hero-')) {
        const Dl = clamp(scrollY / scene.offsetHeight);
        const bl = clamp((1 - Dl) / 0.14);
        const speed = motionType === 'hero-copy' ? 0.92 : motionType === 'hero-temple' ? 0.38 : 0.12;
        const scale = motionType === 'hero-temple' ? 1 + Dl * 0.025 : 1;

        el.style.setProperty('--motion-y', `${scrollY * speed}px`);
        el.style.setProperty('--motion-opacity', motionType === 'hero-copy' ? `${bl}` : '1');
        el.style.setProperty('--motion-scale', `${scale}`);
        if (motionType === 'hero-copy') {
          el.style.zIndex = Dl > 0.045 ? '1' : '4';
        }
        return;
      }

      if (motionType === 'event-card') {
        const top = getElementPageOffsetTop(el);
        const progress = clamp((scrollY + vh * 0.86 - top) / (vh * 0.62));
        el.style.setProperty('--motion-y', `${(1 - progress) * 88}px`);
        el.style.setProperty('--motion-opacity', `${progress}`);
        el.style.setProperty('--motion-scale', `${0.955 + progress * 0.045}`);
        el.style.setProperty('--motion-blur', `${(1 - progress) * 14}px`);
        el.style.setProperty('--text-y', `${(1 - progress) * 34}px`);
        return;
      }

      if (motionType === 'couple-scene') {
        const top = getElementPageOffsetTop(el);
        const bl = clamp((scrollY + vh * 0.95 - top) / (vh * 0.55));
        const _l = clamp((scrollY + vh - top) / (el.offsetHeight + vh));
        el.style.setProperty('--motion-y', `${(1 - bl) * 76}px`);
        el.style.setProperty('--motion-opacity', `${bl}`);
        el.style.setProperty('--motion-scale', `${0.97 + bl * 0.03}`);
        el.style.setProperty('--temple-y', `${_l * 24}px`);
        const coupleYRange = window.innerWidth <= 700 ? 170 : 600;
        el.style.setProperty('--couple-y', `${_l * coupleYRange}px`);
        return;
      }

      // Default section reveal
      const offset = Number(el.dataset.motionOffset || 0);
      const speed = Number(el.dataset.motionSpeed || 42);
      const top = getElementPageOffsetTop(el) + offset;
      const q = clamp((scrollY + vh * 0.92 - top) / (vh * 0.48));
      const Tl = (0.5 - clamp((scrollY + vh * 0.5 - scene.offsetTop) / (scene.offsetHeight + vh * 0.5))) * speed;
      el.style.setProperty('--motion-y', `${(1 - q) * 64 + Tl}px`);
      el.style.setProperty('--motion-opacity', `${q}`);
      el.style.setProperty('--motion-scale', `${0.968 + q * 0.032}`);
    });
  }

  let scrollReqPending = false;
  function onScrollOrResize() {
    if (!scrollReqPending) {
      scrollReqPending = true;
      window.requestAnimationFrame(() => {
        handleScrollMotion();
        scrollReqPending = false;
      });
    }
  }

  // --- Smart Auto-Scroll Engine ---
  function setAutoScrolling(active) {
    isAutoScrolling = active;
    document.documentElement.classList.toggle('heritage-autoscrolling', active);
    if (DOM.scrollToggle) {
      DOM.scrollToggle.setAttribute('aria-pressed', String(active));
      DOM.scrollToggle.setAttribute('aria-label', active ? 'Pause auto scroll' : 'Start auto scroll');
    }
    prevScrollTime = 0;
    if (active) targetScrollPos = window.scrollY;
    if (!active && scrollAnimFrame) {
      window.cancelAnimationFrame(scrollAnimFrame);
      scrollAnimFrame = 0;
    }
    if (active && !scrollAnimFrame) {
      scrollAnimFrame = window.requestAnimationFrame(autoScrollTick);
    }
  }

  function autoScrollTick(time) {
    scrollAnimFrame = 0;
    if (!isAutoScrolling) return;

    if (prevScrollTime) {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (window.scrollY >= maxScroll - 2) {
        setAutoScrolling(false);
        return;
      }
      const elapsed = Math.min(64, time - prevScrollTime);
      targetScrollPos += (currentScrollRate * elapsed) / 1000;
      window.scrollTo(0, targetScrollPos);
    }
    prevScrollTime = time;
    scrollAnimFrame = window.requestAnimationFrame(autoScrollTick);
  }

  function initAutoScrollControls() {
    if (DOM.scrollToggle) {
      DOM.scrollToggle.addEventListener('click', () => {
        setAutoScrolling(!isAutoScrolling);
      });
    }

    DOM.scrollSpeedBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const speedKey = btn.dataset.speed;
        currentScrollRate = scrollRates[speedKey] || scrollRates['1'];
        DOM.scrollSpeedBtns.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      });
    });

    // Touch & wheel interruptions
    window.addEventListener('wheel', () => {
      if (isAutoScrolling) setAutoScrolling(false);
    }, { passive: true });

    window.addEventListener('touchstart', (event) => {
      if (isAutoScrolling && !DOM.scrollControls?.contains(event.target)) {
        setAutoScrolling(false);
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isAutoScrolling) setAutoScrolling(false);
    });
  }

  // --- Music Player Controller ---
  function initMusicPlayer() {
    if (!DOM.playBtn || !DOM.audio) return;

    async function togglePlay() {
      if (isPlaying) {
        DOM.audio.pause();
        isPlaying = false;
        DOM.musicPlayer?.classList.remove('playing');
        DOM.playBtn?.setAttribute('aria-label', 'Play wedding music');
      } else {
        try {
          await DOM.audio.play();
          isPlaying = true;
          DOM.musicPlayer?.classList.add('playing');
          DOM.playBtn?.setAttribute('aria-label', 'Pause wedding music');
        } catch (err) {
          console.warn('Audio autoplay requires user interaction:', err);
        }
      }
    }

    DOM.playBtn.addEventListener('click', togglePlay);

    if (DOM.expandBtn) {
      DOM.expandBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        DOM.musicPlayer?.classList.toggle('expanded', isExpanded);
        DOM.expandBtn.setAttribute('aria-label', isExpanded ? 'Collapse music player' : 'Expand music player');
      });
    }
  }

  // --- Live Countdown Timer ---
  function initCountdown() {
    const targetIso = weddingConfig?.countdown?.target_date || '2026-10-25T06:30:00+05:30';
    const targetTime = new Date(targetIso).getTime();

    function update() {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (DOM.daysEl) DOM.daysEl.textContent = String(days).padStart(2, '0');
      if (DOM.hoursEl) DOM.hoursEl.textContent = String(hours).padStart(2, '0');
      if (DOM.minutesEl) DOM.minutesEl.textContent = String(minutes).padStart(2, '0');
      if (DOM.secondsEl) DOM.secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // --- Magic Celebration Confetti & Petals ---
  function initMagicCelebration() {
    if (!DOM.magicBtn) return;

    DOM.magicBtn.addEventListener('click', () => {
      window.clearTimeout(celebrationTimer);

      DOM.countdownSection?.classList.add('magic');
      if (DOM.celebrationOverlay) {
        DOM.celebrationOverlay.style.display = 'block';
      }

      // 7.8 seconds duration matching reference
      celebrationTimer = window.setTimeout(() => {
        DOM.countdownSection?.classList.remove('magic');
        if (DOM.celebrationOverlay) {
          DOM.celebrationOverlay.style.display = 'none';
        }
      }, 7800);
    });
  }

  // --- Story Gallery Carousel & Lightbox ---
  function initGallery() {
    if (!DOM.gallerySlides.length) return;

    function nextSlide() {
      DOM.gallerySlides[currentSlide]?.classList.remove('active');
      currentSlide = (currentSlide + 1) % DOM.gallerySlides.length;
      DOM.gallerySlides[currentSlide]?.classList.add('active');
    }

    galleryTimer = setInterval(nextSlide, 3600);

    DOM.gallerySlides.forEach((slide) => {
      slide.addEventListener('click', () => {
        const img = slide.querySelector('img');
        if (img && DOM.lightboxImg && DOM.lightbox) {
          DOM.lightboxImg.src = img.src;
          DOM.lightbox.style.display = 'grid';
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeLightbox() {
      if (DOM.lightbox) DOM.lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (DOM.lightbox) {
      DOM.lightbox.addEventListener('click', (e) => {
        if (e.target === DOM.lightbox || e.target === DOM.lightboxClose) {
          closeLightbox();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // --- RSVP Modal Dialog & WhatsApp Integration ---
  function initRSVP() {
    function openModal() {
      if (!DOM.rsvpModal) return;
      DOM.rsvpModal.style.display = 'grid';
      document.body.style.overflow = 'hidden';
      const nameInput = document.getElementById('rsvpGuestName');
      if (nameInput) nameInput.focus();
    }

    function closeModal() {
      if (!DOM.rsvpModal) return;
      DOM.rsvpModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (DOM.rsvpOpenBtn) DOM.rsvpOpenBtn.addEventListener('click', openModal);
    if (DOM.rsvpCloseBtn) DOM.rsvpCloseBtn.addEventListener('click', closeModal);

    if (DOM.rsvpModal) {
      DOM.rsvpModal.addEventListener('click', (e) => {
        if (e.target === DOM.rsvpModal) closeModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Form submit -> WhatsApp redirect with pre-filled message
    if (DOM.rsvpForm) {
      DOM.rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(DOM.rsvpForm);
        const name = formData.get('guestName') || 'Guest';
        const phone = formData.get('mobileNumber') || '';
        const attendance = formData.get('attendance') || 'Attending';
        const guests = formData.get('familyGuestCount') || '1';
        const food = formData.get('foodNotes') || 'None';
        const message = formData.get('message') || '';

        const groom = weddingConfig?.couple?.groom_name || 'Rajkumar';
        const bride = weddingConfig?.couple?.bride_name || 'Rubitha';
        const waNumber = weddingConfig?.rsvp?.whatsapp_number?.replace(/[^\d]/g, '') || '918825822508';

        const text = `*RSVP for ${groom} & ${bride}'s Wedding*\n\n` +
          `• *Name:* ${name}\n` +
          `• *Phone:* ${phone}\n` +
          `• *Attendance:* ${attendance}\n` +
          `• *Guests:* ${guests}\n` +
          (food && food !== 'None' ? `• *Dietary Notes:* ${food}\n` : '') +
          (message ? `• *Message:* "${message}"\n` : '') +
          `\nLooking forward to celebrating with you! ✨`;

        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');

        if (DOM.rsvpSuccess) DOM.rsvpSuccess.style.display = 'grid';
        if (DOM.rsvpForm) DOM.rsvpForm.style.display = 'none';
      });
    }
  }

  // --- Initializer ---
  async function boot() {
    initElements();

    try {
      const res = await fetch('./wedding_config.json', { cache: 'no-store' });
      if (res.ok) {
        const config = await res.json();
        applyConfig(config);
      } else if (window.WEDDING_CONFIG) {
        applyConfig(window.WEDDING_CONFIG);
      }
    } catch (e) {
      if (window.WEDDING_CONFIG) applyConfig(window.WEDDING_CONFIG);
    }

    initAutoScrollControls();
    initMusicPlayer();
    initCountdown();
    initMagicCelebration();
    initGallery();
    initRSVP();

    // Initial scroll motion calculation
    handleScrollMotion();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    // Initial text reveal triggers on hero
    window.setTimeout(handleScrollMotion, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
