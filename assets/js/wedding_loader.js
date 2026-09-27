// Wedding Dynamic Loader
(function () {
  var currentEventIndex = 0;
  var countdownInterval = null;
  var taglineFlowSyncInitialized = false;
  var taglineFlowSyncFrame = 0;

  function formatTitle(format, bride, groom) {
    if (!format) return bride + ' WEDS ' + groom;
    return format.replace('{bride}', bride).replace('{groom}', groom);
  }

  function updateTaglineText(taglineEl, tagline) {
    var text = String(tagline || '').trim();
    var words = text ? text.split(/\s+/) : [];
    var characterSpans = taglineEl.querySelectorAll('span > span');
    var characterCount = words.join('').length;

    if (characterSpans.length === characterCount) {
      var characterIndex = 0;
      words.forEach(function (word) {
        Array.from(word).forEach(function (character) {
          characterSpans[characterIndex].textContent = character;
          characterIndex += 1;
        });
      });
      return;
    }

    var template = characterSpans[0];
    taglineEl.textContent = '';
    words.forEach(function (word, wordIndex) {
      var wordEl = document.createElement('span');
      wordEl.style.whiteSpace = 'nowrap';
      Array.from(word).forEach(function (character) {
        var characterEl = template ? template.cloneNode(false) : document.createElement('span');
        characterEl.textContent = character;
        wordEl.appendChild(characterEl);
      });
      taglineEl.appendChild(wordEl);
      if (wordIndex < words.length - 1) {
        taglineEl.appendChild(document.createTextNode(' '));
      }
    });
  }

  function syncDesktopTaglineToBride() {
    if (window.innerWidth < 810) return;

    var tagline = Array.prototype.find.call(
      document.querySelectorAll('[data-framer-name="TAG LINE"]'),
      function (element) {
        return getComputedStyle(element).display !== 'none';
      }
    );
    var bride = Array.prototype.find.call(
      document.querySelectorAll('[data-framer-name="BRIDE NAME"]'),
      function (element) {
        return getComputedStyle(element).display !== 'none';
      }
    );
    if (!tagline || !bride) return;

    var parent = tagline.offsetParent || tagline.parentElement;
    if (!parent) return;

    var brideRect = bride.getBoundingClientRect();
    var parentRect = parent.getBoundingClientRect();
    var gap = 34;
    var top = brideRect.bottom - parentRect.top + gap;

    tagline.style.setProperty('top', top + 'px', 'important');
    tagline.style.setProperty('transform', 'translate(-50%, 0)', 'important');
  }

  function scheduleTaglineFlowSync() {
    if (taglineFlowSyncFrame) return;
    taglineFlowSyncFrame = window.requestAnimationFrame(function () {
      taglineFlowSyncFrame = 0;
      syncDesktopTaglineToBride();
    });
  }

  function initializeTaglineFlowSync() {
    if (taglineFlowSyncInitialized) return;
    taglineFlowSyncInitialized = true;
    window.addEventListener('scroll', scheduleTaglineFlowSync, { passive: true });
    window.addEventListener('resize', scheduleTaglineFlowSync);
  }

  function applyWeddingConfig(config) {
    if (!config) return;

    var couple = config.couple || {};
    var brideName = couple.bride_name || 'BRIDE';
    var groomName = couple.groom_name || 'GROOM';

    // 1. Page Title & Meta Tags
    var siteTitle = formatTitle(couple.title_format, brideName, groomName);
    document.title = siteTitle;
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = siteTitle;
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = siteTitle;

    // 2. Page 1: Hero Names & Details
    document.querySelectorAll('[data-framer-name="BRIDE NAME"] p span').forEach(function (brideEl) {
      brideEl.textContent = brideName;
    });

    document.querySelectorAll('[data-framer-name="GROOM NAME"] p span').forEach(function (groomEl) {
      groomEl.textContent = groomName;
    });

    if (couple.connector) {
      document.querySelectorAll('[data-framer-name="WEDS"] p').forEach(function (connectorEl) {
        connectorEl.textContent = couple.connector;
      });
    }

    var tagline = couple.tagline || 'are getting married';
    document.querySelectorAll('[data-framer-name="TAG LINE"] p').forEach(function (taglineEl) {
      updateTaglineText(taglineEl, tagline);
    });

    // 3. Page 2: Invitation Details & Names
    document.querySelectorAll('[data-framer-name="KIRAN"] h1').forEach(function (brideEl) {
      brideEl.textContent = brideName;
    });

    document.querySelectorAll('[data-framer-name="GROOM NAME "] h1').forEach(function (groomEl) {
      groomEl.textContent = groomName;
    });

    var mantraSvg = document.querySelector('.framer-101gh07');
    if (mantraSvg) {
      mantraSvg.setAttribute('viewBox', '0 0 500 32');
    }
    var mantraEl = document.querySelector('.framer-101gh07 p');
    if (mantraEl) {
      if (couple.mantra) mantraEl.textContent = couple.mantra;
      mantraEl.style.setProperty('white-space', 'nowrap', 'important');
      mantraEl.style.setProperty('text-align', 'center', 'important');
    }

    var deityImg = document.querySelector('.framer-uf450a img');
    if (deityImg) {
      deityImg.src = couple.deity_image || './murugan_image.png';
      deityImg.removeAttribute('srcset');
      deityImg.style.setProperty('object-fit', 'contain', 'important');
    }

    var eventsHdr = document.querySelector('.framer-1jsww7o p');
    if (eventsHdr && config.invitation && config.invitation.events_heading) {
      eventsHdr.textContent = config.invitation.events_heading;
    }

    // Bride Family SVG - both desktop (.framer-1jawtcx) and mobile (.framer-19me4mh)
    // Redundant now that all family lineages are unified above couple names
    var brideFamSelectors = ['.framer-1jawtcx', '.framer-19me4mh'];
    brideFamSelectors.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) {
        el.style.setProperty('display', 'none', 'important');
      }
    });

    // Groom Family SVG (Unified Family Invitation) - both desktop (.framer-qq17fj) and mobile (.framer-o31tru)
    var bFam = config.bride_family || {};
    var bGf = bFam.grandfather_name || "Arunachalam";
    var bGm = bFam.grandmother_name || "Papaathi";
    var bF = bFam.father_name || "Duraisamy";
    var bM = bFam.mother_name || "Dhanalakshimi";

    var gFam = config.groom_family || {};
    var gGf = gFam.grandfather_name || "Muthusamy Velaphagounder";
    var gGm = gFam.grandmother_name || "Aarukani";
    var gF = gFam.father_name || "Kaliyappan";
    var gM = gFam.mother_name || "Susheela";

    var groomFamSelectors = ['.framer-qq17fj', '.framer-o31tru'];
    groomFamSelectors.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) {
        if (el.tagName && el.tagName.toLowerCase() === 'svg') {
          el.setAttribute('viewBox', sel.includes('o31tru') ? '0 0 477 280' : '0 0 650 280');
          el.style.setProperty('overflow', 'visible', 'important');
        }
        var fo = el.querySelector('foreignObject');
        if (fo) {
          fo.style.setProperty('overflow', 'visible', 'important');
          if (fo.getAttribute('transform') && fo.getAttribute('transform').includes('scale(0.')) {
            fo.setAttribute('transform', 'scale(1)');
          }
        }
        var target = fo || el;
        var unifiedHtml = '<p dir="auto" class="framer-text">With the blessings of the Almighty<br class="framer-text">and our beloved elders,</p>' +
          '<p dir="auto" class="framer-text">Son of<br class="framer-text"><strong class="framer-text">' + gF + ' &amp; ' + gM + '</strong><br class="framer-text">and Grandson of<br class="framer-text"><strong class="framer-text">' + gGf + ' &amp; ' + gGm + '</strong></p>' +
          '<p dir="auto" class="framer-text">and</p>' +
          '<p dir="auto" class="framer-text">Daughter of<br class="framer-text"><strong class="framer-text">' + bF + ' &amp; ' + bM + '</strong><br class="framer-text">and Granddaughter of<br class="framer-text"><strong class="framer-text">' + bGf + ' &amp; ' + bGm + '</strong></p>' +
          '<p dir="auto" class="framer-text">cordially invite you to grace the auspicious wedding ceremony of their beloved</p>';

        if (!target.getAttribute('data-unified-family') || target.innerHTML.indexOf(bF) === -1 || target.innerHTML.indexOf(gGf) === -1) {
          target.innerHTML = unifiedHtml;
          target.setAttribute('data-unified-family', 'true');
        }
      }
    });

    // 4. Page 3: Event Slideshow
    var eventsList = config.events || [];
    var slideshowCouple = document.querySelector('.wedding-event-grid')?.parentElement?.querySelector('span');
    if (slideshowCouple) {
      slideshowCouple.textContent = groomName + ' & ' + brideName;
    }

    function renderSlide(idx) {
      if (!eventsList.length) return;
      var ev = eventsList[idx % eventsList.length];
      var eventH2 = document.querySelector('.wedding-fade-up h2');
      if (eventH2 && ev.title) eventH2.textContent = ev.title;

      var eventSpans = document.querySelectorAll('.wedding-fade-up div div span:last-child');
      if (eventSpans.length >= 3) {
        if (ev.date) eventSpans[0].textContent = ev.date;
        if (ev.time) eventSpans[1].textContent = ev.time;
        if (ev.venue) eventSpans[2].textContent = ev.venue;
      }

      var eventDesc = document.querySelector('.wedding-fade-up > p');
      if (eventDesc && ev.description) eventDesc.textContent = ev.description;

      var ctaBtn = document.querySelector('.wedding-cta-btn');
      if (ctaBtn && ev.location_url) {
        ctaBtn.href = ev.location_url;
        ctaBtn.target = '_blank';
      }

      // Update dot buttons
      var dots = document.querySelectorAll('.wedding-dot-btn');
      dots.forEach(function (dot, dIdx) {
        if (dIdx === (idx % eventsList.length)) {
          dot.style.width = '18px';
          dot.style.background = 'rgb(10, 48, 127)';
        } else {
          dot.style.width = '10px';
          dot.style.background = 'rgba(255,255,255,0.75)';
        }
      });
    }

    renderSlide(currentEventIndex);

    // Setup arrow buttons (only attach once)
    var prevBtn = document.querySelector('.wedding-arrow-btn[aria-label="Previous slide"]');
    var nextBtn = document.querySelector('.wedding-arrow-btn[aria-label="Next slide"]');
    if (prevBtn && !prevBtn.dataset.wired) {
      prevBtn.dataset.wired = 'true';
      prevBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        currentEventIndex = (currentEventIndex - 1 + eventsList.length) % eventsList.length;
        renderSlide(currentEventIndex);
      };
    }
    if (nextBtn && !nextBtn.dataset.wired) {
      nextBtn.dataset.wired = 'true';
      nextBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        currentEventIndex = (currentEventIndex + 1) % eventsList.length;
        renderSlide(currentEventIndex);
      };
    }

    // Setup dots
    var dots = document.querySelectorAll('.wedding-dot-btn');
    dots.forEach(function (dot, dIdx) {
      if (!dot.dataset.wired) {
        dot.dataset.wired = 'true';
        dot.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          currentEventIndex = dIdx % eventsList.length;
          renderSlide(currentEventIndex);
        };
      }
    });

    // 5. Page 5: Our Story removed per user request (hidden completely via CSS)

    // 6. Page 6: RSVP
    if (config.rsvp) {
      var rsvpNote = document.querySelector('[data-framer-name="RSVP Note"] p');
      if (rsvpNote && config.rsvp.note) rsvpNote.textContent = config.rsvp.note;

      setupRSVP(config, siteTitle);
    }

    // 7. Page 7: Hashtag, Handle & Live Countdown
    if (couple.hashtag) {
      var hashP = document.querySelector('[data-framer-name="#"] p');
      if (hashP) hashP.textContent = couple.hashtag;
    }
    if (couple.instagram_handle) {
      var handleP = document.querySelector('[data-framer-name="THE ARTFUL INVITES"] p');
      if (handleP) handleP.textContent = couple.instagram_handle;
    }

    // Helper to parse dates robustly across all browser engines
    function parseTargetDate(dateStr) {
      if (!dateStr) return null;
      var d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.getTime();
      var m = String(dateStr).match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
      if (m) {
        var year = parseInt(m[1], 10);
        var month = parseInt(m[2], 10) - 1;
        var day = parseInt(m[3], 10);
        var hour = m[4] ? parseInt(m[4], 10) : 0;
        var min = m[5] ? parseInt(m[5], 10) : 0;
        var sec = m[6] ? parseInt(m[6], 10) : 0;
        return Date.UTC(year, month, day, hour - 5, min - 30, sec);
      }
      return null;
    }

    // Countdown Timer (Live Ticking, no NaNs)
    if (config.countdown && config.countdown.target_date) {
      if (countdownInterval) clearInterval(countdownInterval);
      var targetTime = parseTargetDate(config.countdown.target_date);

      function updateCountdown() {
        if (!targetTime) return;
        var now = Date.now();
        var diff = Math.max(0, targetTime - now);

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        var timerContainer = document.querySelector('.framer-uuu3on-container');
        if (timerContainer) {
          var flexDivs = timerContainer.querySelectorAll('div');
          flexDivs.forEach(function (d) {
            d.style.justifyContent = 'center';
          });
          var spans = timerContainer.querySelectorAll('span');
          // spans layout: [0]=Days, [1]='D', [2]=':', [3]=Hours, [4]='H', [5]=':', [6]=Minutes, [7]='M', [8]=':', [9]=Seconds, [10]='S'
          if (spans.length >= 10) {
            spans[0].textContent = String(days).padStart(2, '0');
            spans[3].textContent = String(hours).padStart(2, '0');
            spans[6].textContent = String(minutes).padStart(2, '0');
            spans[9].textContent = String(seconds).padStart(2, '0');
          }
        }
      }

      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 1000);
    }

    // 8. In Countdown Page: Add 2 Venue Locations (Wedding Ceremony & Reception) with Dates & Map links
    renderCountdownVenues(config);

    // 9. Wire Instagram link
    var instaBtn = document.querySelector('.framer-131l9v1 a[data-framer-name="Instagram"], [data-framer-name="PAGE 7"] a');
    if (instaBtn && !instaBtn.dataset.wired) {
      instaBtn.dataset.wired = 'true';
      var rawHandle = couple.instagram_handle || '@kaliyappan_rajkumar';
      var cleanHandle = rawHandle.replace('@', '');
      instaBtn.href = 'https://www.instagram.com/' + cleanHandle + '/';
      instaBtn.target = '_blank';
      instaBtn.rel = 'noopener noreferrer';
    }

    // 10. Custom Dedicated Wedding Music Player (decoupled from Framer React hydration)
    setupWeddingMusicPlayer(config);

    // 11. Slow Cinematic Auto-Scroll (stops at Countdown Page)
    setupAutoScroll(config);
    initializeTaglineFlowSync();
    scheduleTaglineFlowSync();
  }

  function setupRSVP(config, siteTitle) {
    var rsvpConfig = (config && config.rsvp) ? config.rsvp : {};
    var rawNum = rsvpConfig.whatsapp_number || '+918825822508';
    var cleanNum = rawNum.replace(/[^0-9]/g, '');
    var coupleNames = siteTitle || 'Rajkumar & Rubitha';

    function getModal() {
      return document.getElementById('weddingRSVPModal');
    }

    function openModal() {
      var modal = getModal();
      if (!modal) return;
      modal.classList.add('is-open');
      var formView = document.getElementById('weddingRSVPFormView');
      var confirmView = document.getElementById('weddingRSVPConfirmationView');
      if (formView) formView.style.display = 'block';
      if (confirmView) confirmView.style.display = 'none';
      document.body.style.overflow = 'hidden';
      setTimeout(function () {
        var nameInput = document.getElementById('rsvpGuestName');
        if (nameInput) nameInput.focus();
      }, 100);
    }

    function closeModal() {
      var modal = getModal();
      if (!modal) return;
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      var triggerBtn = document.getElementById('weddingRSVPActionBtn');
      if (triggerBtn) triggerBtn.focus();
    }

    window.__weddingTriggerRSVP = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      openModal();
    };

    window.__weddingCloseRSVP = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeModal();
    };

    // Global capture-phase click listener for 100% reliable event handling
    if (!window.__weddingRSVPGlobalListenersBound) {
      window.__weddingRSVPGlobalListenersBound = true;

      document.addEventListener('click', function (e) {
        // 1. Close or Done button
        var closeTarget = e.target.closest('#weddingRSVPCloseBtn, .wedding-rsvp-close-btn, #weddingRSVPDoneBtn, .wedding-rsvp-done-btn');
        if (closeTarget) {
          e.preventDefault();
          e.stopPropagation();
          closeModal();
          return;
        }

        // 2. Click on backdrop to dismiss
        var modal = getModal();
        if (modal && e.target === modal) {
          e.preventDefault();
          e.stopPropagation();
          closeModal();
          return;
        }

        // 3. Open triggers
        var openTarget = e.target.closest('#weddingRSVPActionBtn, .wedding-rsvp-action-btn, #weddingRSVPTapLabel, .wedding-rsvp-tap-label, [data-framer-name="PAGE 6"] button, .wedding-rsvp-btn');
        if (openTarget) {
          e.preventDefault();
          e.stopPropagation();
          openModal();
          return;
        }
      }, true);

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
          var modal = getModal();
          if (modal && modal.classList.contains('is-open')) {
            closeModal();
          }
        }
      });
    }

    // Attach form handler
    var form = document.getElementById('weddingRSVPForm');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var nameInput = document.getElementById('rsvpGuestName');
        var mobileInput = document.getElementById('rsvpGuestMobile');
        var guestsSelect = document.getElementById('rsvpGuestCount');
        var attendanceSelect = document.getElementById('rsvpAttendance');
        var foodInput = document.getElementById('rsvpFoodNotes');
        var messageInput = document.getElementById('rsvpMessage');
        var whatsappLink = document.getElementById('weddingRSVPWhatsAppDirectLink');
        var formView = document.getElementById('weddingRSVPFormView');
        var confirmView = document.getElementById('weddingRSVPConfirmationView');

        var name = (nameInput && nameInput.value) ? nameInput.value.trim() : '';
        if (!name) {
          if (nameInput) {
            nameInput.focus();
            nameInput.style.borderColor = '#c0392b';
            nameInput.placeholder = 'Please enter your name';
          }
          return;
        }

        var mobile = (mobileInput && mobileInput.value) ? mobileInput.value.trim() : '';
        var guests = (guestsSelect && guestsSelect.value) ? guestsSelect.value : '2';
        var attendance = (attendanceSelect && attendanceSelect.value) ? attendanceSelect.value : 'Joyfully attending';
        var food = (foodInput && foodInput.value) ? foodInput.value.trim() : '';
        var userMsg = (messageInput && messageInput.value) ? messageInput.value.trim() : '';

        // Construct clean, beautifully formatted WhatsApp text
        var textLines = [
          '✨ *Wedding RSVP Confirmation* ✨',
          '*Wedding of:* ' + coupleNames,
          '',
          '👤 *Guest Name:* ' + name,
          '💌 *Attendance:* ' + attendance,
          '👥 *Number of Guests:* ' + guests
        ];
        if (mobile) {
          textLines.push('📱 *Mobile:* ' + mobile);
        }
        if (food) {
          textLines.push('🍽️ *Food / Dietary:* ' + food);
        }
        if (userMsg) {
          textLines.push('💬 *Message:* ' + userMsg);
        }

        var waText = textLines.join('\n');
        var waUrl = 'https://api.whatsapp.com/send?phone=' + cleanNum + '&text=' + encodeURIComponent(waText);

        // Update Confirmation View summary rows
        var sumName = document.getElementById('rsvpSummaryName');
        var sumAtt = document.getElementById('rsvpSummaryAttendance');
        var sumGuests = document.getElementById('rsvpSummaryGuests');
        var sumMobile = document.getElementById('rsvpSummaryMobile');
        var sumMobileRow = document.getElementById('rsvpSummaryMobileRow');
        var sumDiet = document.getElementById('rsvpSummaryDiet');
        var sumDietRow = document.getElementById('rsvpSummaryDietRow');

        if (sumName) sumName.textContent = name;
        if (sumAtt) sumAtt.textContent = attendance;
        if (sumGuests) sumGuests.textContent = guests;

        if (sumMobile && sumMobileRow) {
          if (mobile) {
            sumMobile.textContent = mobile;
            sumMobileRow.style.display = 'flex';
          } else {
            sumMobileRow.style.display = 'none';
          }
        }

        if (sumDiet && sumDietRow) {
          if (food) {
            sumDiet.textContent = food;
            sumDietRow.style.display = 'flex';
          } else {
            sumDietRow.style.display = 'none';
          }
        }

        if (whatsappLink) {
          whatsappLink.href = waUrl;
        }

        // Show confirmation view
        if (formView) formView.style.display = 'none';
        if (confirmView) confirmView.style.display = 'block';

        // Auto dispatch WhatsApp
        var isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = waUrl;
        } else {
          var win = window.open(waUrl, '_blank');
        }
      };
    }
  }

  function renderCountdownVenues(config) {
    // Inject locations inside Countdown page (.framer-s1eh8d)
    var countdownPage = document.querySelector('.framer-s1eh8d');
    if (!countdownPage) {
      countdownPage = document.querySelector('[data-framer-name="PAGE 7"]') || document.querySelector('.framer-131l9v1');
    }
    if (!countdownPage) return;

    var venueContainer = document.getElementById('wedding-countdown-venues');
    // If existing venue container was in wrong parent (e.g. Page 7), move it to countdownPage (.framer-s1eh8d)
    if (venueContainer && venueContainer.parentElement !== countdownPage) {
      countdownPage.appendChild(venueContainer);
    }

    var events = (config && config.events) ? config.events : [];
    var weddingEv = null;
    var receptionEv = null;

    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      var t = (ev.title || '').toLowerCase();
      if (t.indexOf('wedding') !== -1 && !weddingEv) {
        weddingEv = ev;
      } else if (t.indexOf('reception') !== -1 && !receptionEv) {
        receptionEv = ev;
      }
    }

    if (!weddingEv) {
      weddingEv = {
        title: 'Wedding Ceremony',
        date: '25 October 2026',
        time: '06:30 AM',
        venue: 'Sivagiri Velayuthaswamy Temple',
        location_url: 'https://maps.app.goo.gl/WvQtLPBUnHoazgyu8'
      };
    }
    if (!receptionEv) {
      receptionEv = {
        title: 'Reception',
        date: '24 October 2026',
        time: '7:30 PM',
        venue: 'Uthami Ponnusamy Thirumana Mandapam',
        location_url: 'https://maps.app.goo.gl/YREAxuKnh2MqcZ3P7'
      };
    }

    var mapSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>';

    var html = '\
      <div class="wedding-venue-card wedding-card">\
        <div class="wedding-venue-badge">Wedding Ceremony</div>\
        <div class="wedding-venue-title">' + (weddingEv.venue || 'Sivagiri Velayuthaswamy Temple') + '</div>\
        <div class="wedding-venue-row datetime">\
          <span class="wedding-venue-icon">📅</span>\
          <span>' + (weddingEv.date || '25 October 2026') + (weddingEv.time ? (' • ' + weddingEv.time) : '') + '</span>\
        </div>\
        <div class="wedding-venue-row place">\
          <span class="wedding-venue-icon">📍</span>\
          <span>' + (weddingEv.venue || 'Sivagiri Velayuthaswamy Temple') + '</span>\
        </div>\
        <a href="' + (weddingEv.location_url || 'https://maps.app.goo.gl/WvQtLPBUnHoazgyu8') + '" target="_blank" rel="noopener noreferrer" class="wedding-venue-map-link">\
          ' + mapSvg + '\
          <span>View on Google Maps</span>\
        </a>\
      </div>\
      <div class="wedding-venue-card reception-card">\
        <div class="wedding-venue-badge">Reception</div>\
        <div class="wedding-venue-title">' + (receptionEv.venue || 'Uthami Ponnusamy Thirumana Mandapam') + '</div>\
        <div class="wedding-venue-row datetime">\
          <span class="wedding-venue-icon">📅</span>\
          <span>' + (receptionEv.date || '24 October 2026') + (receptionEv.time ? (' • ' + receptionEv.time) : '') + '</span>\
        </div>\
        <div class="wedding-venue-row place">\
          <span class="wedding-venue-icon">📍</span>\
          <span>' + (receptionEv.venue || 'Uthami Ponnusamy Thirumana Mandapam') + '</span>\
        </div>\
        <a href="' + (receptionEv.location_url || 'https://maps.app.goo.gl/YREAxuKnh2MqcZ3P7') + '" target="_blank" rel="noopener noreferrer" class="wedding-venue-map-link">\
          ' + mapSvg + '\
          <span>View on Google Maps</span>\
        </a>\
      </div>\
    ';

    if (!venueContainer) {
      venueContainer = document.createElement('div');
      venueContainer.id = 'wedding-countdown-venues';
      venueContainer.innerHTML = html;
      countdownPage.appendChild(venueContainer);
    } else {
      venueContainer.innerHTML = html;
    }
  }

  function setupWeddingMusicPlayer(config) {
    var musicConfig = (config && config.music) ? config.music : { file: './Insecurities.mp3', title: 'Insecurities' };
    var musicFile = musicConfig.file || './Insecurities.mp3';
    var musicTitle = musicConfig.title || 'Insecurities';

    // 1. Permanently silence and hide Framer's default/SSR music container
    var framerContainers = document.querySelectorAll('.framer-fwz7u-container');
    framerContainers.forEach(function (fc) {
      fc.style.setProperty('display', 'none', 'important');
      fc.style.setProperty('visibility', 'hidden', 'important');
      fc.style.setProperty('pointer-events', 'none', 'important');
      var oldAudios = fc.querySelectorAll('audio');
      oldAudios.forEach(function (oa) {
        try {
          oa.pause();
          oa.src = '';
        } catch (e) { }
      });
    });

    // 2. Inject CSS rules once
    if (!document.getElementById('wedding-music-custom-styles')) {
      var st = document.createElement('style');
      st.id = 'wedding-music-custom-styles';
      st.textContent = '\
        .framer-fwz7u-container { display: none !important; visibility: hidden !important; pointer-events: none !important; opacity: 0 !important; }\
        [data-framer-name="PAGE 5"], .framer-jc4od1,\
        [data-framer-name="TOUCH HERE FOR MAGIC"], .framer-sdzv9p,\
        .framer-evcqq4-container {\
          display: none !important;\
          height: 0 !important;\
          min-height: 0 !important;\
          max-height: 0 !important;\
          overflow: hidden !important;\
          visibility: hidden !important;\
          pointer-events: none !important;\
          margin: 0 !important;\
          padding: 0 !important;\
        }\
        html, body {\
          height: auto !important;\
          min-height: 100% !important;\
          overflow-x: hidden !important;\
        }\
        /* Page 2 Deity & Mantra Styles */\
        .framer-uf450a img {\
          object-fit: contain !important;\
        }\
        .framer-m7ulU .framer-101gh07 {\
          width: 480px !important;\
          max-width: 92vw !important;\
          height: 32px !important;\
          overflow: visible !important;\
          white-space: nowrap !important;\
          display: flex !important;\
          justify-content: center !important;\
          align-items: center !important;\
          pointer-events: none !important;\
        }\
        .framer-m7ulU .framer-101gh07 foreignObject {\
          width: 100% !important;\
          height: 100% !important;\
          overflow: visible !important;\
        }\
        .framer-m7ulU .framer-101gh07 p,\
        .framer-m7ulU .framer-101gh07 .framer-text {\
          width: 100% !important;\
          text-align: center !important;\
          white-space: nowrap !important;\
          word-break: keep-all !important;\
          overflow: visible !important;\
          font-size: 13.5px !important;\
          letter-spacing: 0.08em !important;\
          line-height: 1.2em !important;\
        }\
        #main,\
        .framer-m7ulU,\
        .framer-m7ulU.framer-72rtr7,\
        .framer-m7ulU .framer-ji2yub,\
        .framer-ji2yub {\
          height: auto !important;\
          min-height: auto !important;\
          max-height: none !important;\
          aspect-ratio: auto !important;\
          padding-bottom: 0 !important;\
          margin-bottom: 0 !important;\
        }\
        .framer-ji2yub {\
          display: flex !important;\
          flex-direction: column !important;\
        }\
        /* Visual Order: Countdown & Locations (order 7), Instagram (order 8) */\
        .framer-m7ulU .framer-s1eh8d {\
          order: 7 !important;\
          height: 1050px !important;\
          min-height: 980px !important;\
          max-height: 1200px !important;\
          overflow: hidden !important;\
          position: relative !important;\
        }\
        .framer-m7ulU .framer-131l9v1 {\
          order: 8 !important;\
          position: relative !important;\
          overflow: hidden !important;\
          height: 650px !important;\
          min-height: 550px !important;\
          max-height: 750px !important;\
          margin-bottom: 0 !important;\
          padding-bottom: 0 !important;\
        }\
        .framer-s1eh8d .framer-1u82y34,\
        .framer-s1eh8d .framer-evcqq4-container {\
          display: none !important;\
          visibility: hidden !important;\
        }\
        .framer-s1eh8d [data-framer-name="COUNTING THE DAYS"] {\
          position: absolute !important;\
          top: 40px !important;\
          left: 50% !important;\
          transform: translateX(-50%) !important;\
          z-index: 20 !important;\
          display: flex !important;\
          justify-content: center !important;\
          align-items: center !important;\
          width: 90% !important;\
          max-width: 500px !important;\
          height: 80px !important;\
          margin: 0 !important;\
        }\
        .framer-s1eh8d [data-framer-name="COUNTING THE DAYS"] p {\
          font-family: "Luxurious Script", cursive, serif !important;\
          font-size: 58px !important;\
          line-height: 1.1 !important;\
          color: rgb(88, 11, 26) !important;\
          text-align: center !important;\
          margin: 0 !important;\
        }\
        .framer-s1eh8d .framer-uuu3on-container {\
          position: absolute !important;\
          top: 150px !important;\
          left: 50% !important;\
          transform: translateX(-50%) !important;\
          z-index: 20 !important;\
          width: 90% !important;\
          max-width: 520px !important;\
          height: auto !important;\
          display: flex !important;\
          justify-content: center !important;\
          align-items: center !important;\
          margin: 0 !important;\
        }\
        .framer-uuu3on-container,\
        .framer-uuu3on-container > div,\
        .framer-uuu3on-container > div > div,\
        .framer-uuu3on-container [style*="display: flex"],\
        .framer-uuu3on-container div {\
          justify-content: center !important;\
          text-align: center !important;\
        }\
        .framer-uuu3on-container > div {\
          margin-left: auto !important;\
          margin-right: auto !important;\
          display: flex !important;\
          justify-content: center !important;\
        }\
        .framer-uuu3on-container > div > div {\
          justify-content: center !important;\
          margin-left: auto !important;\
          margin-right: auto !important;\
        }\
        .framer-18d2840,\
        .framer-m7ulU .framer-18d2840 {\
          left: 50% !important;\
          transform: translate(-50%, -50%) !important;\
          text-align: center !important;\
          display: flex !important;\
          justify-content: center !important;\
          align-items: center !important;\
          width: auto !important;\
          max-width: 447px !important;\
        }\
        .framer-18d2840 p,\
        .framer-m7ulU .framer-18d2840 p {\
          text-align: center !important;\
          width: 100% !important;\
        }\
        .framer-s1eh8d #wedding-countdown-venues {\
          position: absolute !important;\
          top: 360px !important;\
          left: 50% !important;\
          transform: translateX(-50%) !important;\
          width: 92% !important;\
          max-width: 720px !important;\
          display: flex !important;\
          flex-direction: row !important;\
          justify-content: center !important;\
          align-items: stretch !important;\
          gap: 20px !important;\
          z-index: 30 !important;\
          box-sizing: border-box !important;\
          pointer-events: auto !important;\
          isolation: isolate !important;\
        }\
        .wedding-venue-card {\
          flex: 1 1 0;\
          min-width: 0;\
          background: rgba(255, 255, 255, 0.96);\
          backdrop-filter: blur(12px);\
          -webkit-backdrop-filter: blur(12px);\
          border: 1.5px solid rgba(205, 174, 128, 0.45);\
          border-top: 4px solid rgb(205, 174, 128);\
          border-radius: 18px;\
          padding: 18px 20px;\
          box-shadow: 0 8px 24px rgba(88, 11, 26, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);\
          display: flex;\
          flex-direction: column;\
          justify-content: space-between;\
          box-sizing: border-box;\
          text-align: left;\
          transition: box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;\
          pointer-events: auto;\
          position: relative;\
          cursor: default;\
        }\
        .wedding-venue-card:hover {\
          border-color: rgba(205, 174, 128, 0.9);\
          background: rgba(255, 255, 255, 1);\
          box-shadow: 0 12px 32px rgba(88, 11, 26, 0.15), 0 4px 14px rgba(205, 174, 128, 0.3);\
        }\
        .wedding-venue-badge {\
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
          font-size: 11px;\
          font-weight: 700;\
          letter-spacing: 0.12em;\
          text-transform: uppercase;\
          color: rgb(185, 140, 75);\
          margin-bottom: 6px;\
        }\
        .wedding-venue-title {\
          font-family: "Instrument Serif", "Abhaya Libre", serif;\
          font-size: 21px;\
          font-weight: 600;\
          color: rgb(88, 11, 26);\
          line-height: 1.25;\
          margin-bottom: 10px;\
        }\
        .wedding-venue-row {\
          display: flex;\
          align-items: flex-start;\
          gap: 8px;\
          margin-bottom: 8px;\
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
          font-size: 13.5px;\
          line-height: 1.35;\
          color: rgb(60, 50, 45);\
        }\
        .wedding-venue-row.datetime {\
          font-weight: 600;\
          color: rgb(88, 11, 26);\
        }\
        .wedding-venue-icon {\
          font-size: 14px;\
          line-height: 1;\
          flex-shrink: 0;\
        }\
        .wedding-venue-map-link {\
          margin-top: 12px;\
          display: inline-flex;\
          align-items: center;\
          justify-content: center;\
          gap: 7px;\
          background: linear-gradient(135deg, rgb(88, 11, 26), rgb(125, 20, 40));\
          color: #ffffff !important;\
          text-decoration: none !important;\
          border-radius: 20px;\
          padding: 9px 16px;\
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
          font-size: 12.5px;\
          font-weight: 600;\
          box-shadow: 0 3px 10px rgba(88, 11, 26, 0.25);\
          transition: background 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;\
          width: fit-content;\
          cursor: pointer;\
          pointer-events: auto;\
          position: relative;\
          z-index: 2;\
        }\
        .wedding-venue-map-link:hover {\
          background: linear-gradient(135deg, rgb(110, 15, 33), rgb(150, 25, 48));\
          box-shadow: 0 6px 18px rgba(88, 11, 26, 0.4);\
          filter: brightness(1.1);\
          color: #ffffff !important;\
        }\
        @media (max-width: 768px) {\
          .framer-m7ulU .framer-s1eh8d {\
            height: 1100px !important;\
            min-height: 1050px !important;\
          }\
          .framer-s1eh8d [data-framer-name="COUNTING THE DAYS"] {\
            top: 25px !important;\
            height: 65px !important;\
          }\
          .framer-s1eh8d [data-framer-name="COUNTING THE DAYS"] p {\
            font-size: 44px !important;\
          }\
          .framer-s1eh8d .framer-uuu3on-container {\
            top: 115px !important;\
          }\
          .framer-s1eh8d #wedding-countdown-venues {\
            top: 275px !important;\
            flex-direction: column !important;\
            max-width: 350px !important;\
            gap: 14px !important;\
          }\
          .framer-m7ulU .framer-131l9v1 {\
            height: 480px !important;\
            min-height: 420px !important;\
            max-height: 550px !important;\
          }\
          .wedding-venue-card {\
            padding: 14px 16px;\
          }\
          .wedding-venue-title {\
            font-size: 19px;\
            margin-bottom: 8px;\
          }\
          .wedding-venue-row {\
            font-size: 13px;\
            margin-bottom: 6px;\
          }\
          #wedding-music-widget {\
            bottom: 16px;\
            left: 16px;\
            max-width: calc(100vw - 32px);\
          }\
          #wedding-play-toggle {\
            width: 46px;\
            height: 46px;\
            border-radius: 23px;\
          }\
          #wedding-music-label {\
            font-size: 12px !important;\
            max-width: 90px;\
            overflow: hidden;\
            text-overflow: ellipsis;\
          }\
          .wedding-speed-label {\
            display: none;\
          }\
          .wedding-speed-btn {\
            padding: 2px 6px;\
            font-size: 11px;\
          }\
        }\
        @keyframes weddingPulseGlow {\
          0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(185, 150, 98, 0.4); }\
          50% { transform: scale(1.05); box-shadow: 0 0 22px rgba(215, 180, 128, 0.7); }\
        }\
        @keyframes eqBounce1 { 0%, 100% { height: 4px; } 50% { height: 16px; } }\
        @keyframes eqBounce2 { 0%, 100% { height: 14px; } 50% { height: 5px; } }\
        @keyframes eqBounce3 { 0%, 100% { height: 6px; } 50% { height: 18px; } }\
        #wedding-music-widget {\
          position: fixed;\
          bottom: 24px;\
          left: 24px;\
          z-index: 999999;\
          display: flex;\
          align-items: center;\
          background: rgba(255, 255, 255, 0.96);\
          backdrop-filter: blur(16px);\
          -webkit-backdrop-filter: blur(16px);\
          border-radius: 32px;\
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(205, 174, 128, 0.35);\
          padding: 0 8px 0 0;\
          transition: transform 0.25s ease, box-shadow 0.25s ease, padding 0.3s ease, border-radius 0.3s ease;\
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\
          user-select: none;\
          -webkit-tap-highlight-color: transparent;\
        }\
        #wedding-music-widget:hover {\
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18), 0 0 0 1.5px rgba(205, 174, 128, 0.5);\
        }\
        #wedding-play-toggle {\
          width: 52px;\
          height: 52px;\
          border-radius: 26px;\
          background: linear-gradient(135deg, rgb(215, 180, 128), rgb(185, 150, 98));\
          border: none;\
          cursor: pointer;\
          display: flex;\
          align-items: center;\
          justify-content: center;\
          flex-shrink: 0;\
          box-shadow: 0 3px 12px rgba(185, 150, 98, 0.35);\
          transition: transform 0.2s ease, box-shadow 0.2s ease;\
          outline: none;\
        }\
        #wedding-music-widget.is-playing #wedding-play-toggle {\
          animation: weddingPulseGlow 2s infinite ease-in-out;\
        }\
        #wedding-widget-body {\
          display: flex;\
          align-items: center;\
          gap: 6px;\
          max-width: 500px;\
          opacity: 1;\
          transition: max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.3s ease, padding 0.3s ease;\
          overflow: hidden;\
          white-space: nowrap;\
        }\
        #wedding-music-info {\
          display: flex;\
          align-items: center;\
          gap: 8px;\
          padding: 0 4px 0 10px;\
          cursor: pointer;\
        }\
        #wedding-music-bars {\
          display: flex;\
          align-items: flex-end;\
          gap: 3px;\
          height: 16px;\
        }\
        #wedding-music-bars .eq-bar {\
          width: 3px;\
          background: rgb(88, 11, 26);\
          border-radius: 2px;\
          height: 4px;\
          transition: height 0.2s ease;\
        }\
        #wedding-music-widget.is-playing #wedding-music-bars .eq-bar.b1 {\
          animation: eqBounce1 0.8s infinite ease-in-out;\
        }\
        #wedding-music-widget.is-playing #wedding-music-bars .eq-bar.b2 {\
          animation: eqBounce2 0.7s infinite ease-in-out;\
        }\
        #wedding-music-widget.is-playing #wedding-music-bars .eq-bar.b3 {\
          animation: eqBounce3 0.9s infinite ease-in-out;\
        }\
        #wedding-mute-toggle {\
          background: transparent;\
          border: none;\
          cursor: pointer;\
          padding: 6px;\
          display: flex;\
          align-items: center;\
          justify-content: center;\
          color: rgb(88, 11, 26);\
          opacity: 0.65;\
          transition: opacity 0.2s ease, transform 0.2s ease;\
          outline: none;\
          border-radius: 50%;\
          flex-shrink: 0;\
        }\
        #wedding-mute-toggle:hover {\
          opacity: 1;\
          transform: scale(1.15);\
        }\
        .wedding-widget-divider {\
          width: 1px;\
          height: 18px;\
          background: rgba(205, 174, 128, 0.45);\
          margin: 0 4px;\
          flex-shrink: 0;\
        }\
        #wedding-scroll-controls {\
          display: flex;\
          align-items: center;\
          gap: 5px;\
          flex-shrink: 0;\
        }\
        .wedding-speed-label {\
          font-size: 11px;\
          font-weight: 700;\
          color: rgb(88, 11, 26);\
          opacity: 0.65;\
          letter-spacing: 0.04em;\
          text-transform: uppercase;\
        }\
        .wedding-speed-group {\
          display: inline-flex;\
          align-items: center;\
          background: rgba(88, 11, 26, 0.05);\
          border: 1px solid rgba(205, 174, 128, 0.45);\
          border-radius: 14px;\
          padding: 2px;\
          gap: 2px;\
        }\
        .wedding-speed-btn {\
          background: transparent;\
          border: none;\
          cursor: pointer;\
          padding: 3px 8px;\
          font-size: 11.5px;\
          font-weight: 600;\
          font-family: inherit;\
          color: rgb(88, 11, 26);\
          border-radius: 12px;\
          transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;\
          line-height: 1.2;\
          outline: none;\
        }\
        .wedding-speed-btn:hover {\
          background: rgba(205, 174, 128, 0.25);\
        }\
        .wedding-speed-btn.is-active {\
          background: linear-gradient(135deg, rgb(215, 180, 128), rgb(185, 150, 98));\
          color: #ffffff;\
          font-weight: 700;\
          box-shadow: 0 1px 4px rgba(185, 150, 98, 0.35);\
        }\
        #wedding-widget-minimize,\
        #wedding-widget-expand {\
          background: transparent;\
          border: none;\
          cursor: pointer;\
          padding: 6px;\
          display: flex;\
          align-items: center;\
          justify-content: center;\
          color: rgb(88, 11, 26);\
          opacity: 0.6;\
          transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;\
          outline: none;\
          border-radius: 50%;\
          flex-shrink: 0;\
          margin-left: 2px;\
        }\
        #wedding-widget-minimize:hover,\
        #wedding-widget-expand:hover {\
          opacity: 1;\
          background: rgba(205, 174, 128, 0.22);\
          transform: scale(1.12);\
        }\
        #wedding-widget-expand {\
          display: none;\
          padding: 6px 10px;\
          border-radius: 16px;\
        }\
        /* Minimized State */\
        #wedding-music-widget.is-minimized {\
          padding: 0 4px 0 0 !important;\
        }\
        #wedding-music-widget.is-minimized #wedding-widget-body {\
          max-width: 0 !important;\
          opacity: 0 !important;\
          margin: 0 !important;\
          padding: 0 !important;\
          pointer-events: none !important;\
        }\
        #wedding-music-widget.is-minimized #wedding-widget-expand {\
          display: flex !important;\
        }\
        #wedding-music-widget.is-minimized #wedding-widget-minimize {\
          display: none !important;\
      ';
      document.head.appendChild(st);
    }

    // 3. Create or retrieve audio element
    var audio = document.getElementById('wedding-custom-audio');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'wedding-custom-audio';
      audio.loop = true;
      audio.preload = 'auto';
      audio.src = musicFile;
      document.body.appendChild(audio);
    } else if (audio.getAttribute('src') !== musicFile) {
      var wasPlaying = !audio.paused;
      audio.src = musicFile;
      if (wasPlaying) {
        audio.play().catch(function () { });
      }
    }

    // 4. Create or update UI widget
    var playSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style="margin-left:2px"><path d="M8 5v14l11-7z"/></svg>';
    var pauseSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    var soundOnSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
    var soundOffSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

    var widget = document.getElementById('wedding-music-widget');
    if (widget && !document.getElementById('wedding-widget-body')) {
      widget.parentNode.removeChild(widget);
      widget = null;
    }

    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'wedding-music-widget';
      widget.setAttribute('role', 'region');
      widget.setAttribute('aria-label', 'Wedding Music & Scroll Controls');

      widget.innerHTML = '\
        <button id="wedding-play-toggle" aria-label="Play Music" title="Play Music">\
          ' + playSvg + '\
        </button>\
        <div id="wedding-widget-body">\
          <div id="wedding-music-info" title="Toggle Play / Pause">\
            <span id="wedding-music-label" style="font-size:13px;font-weight:600;color:rgb(88,11,26);letter-spacing:0.01em;white-space:nowrap;">🎵 ' + musicTitle + '</span>\
            <div id="wedding-music-bars">\
              <span class="eq-bar b1"></span>\
              <span class="eq-bar b2"></span>\
              <span class="eq-bar b3"></span>\
            </div>\
          </div>\
          <button id="wedding-mute-toggle" aria-label="Mute / Unmute" title="Mute / Unmute">\
            ' + soundOnSvg + '\
          </button>\
          <div class="wedding-widget-divider"></div>\
          <div id="wedding-scroll-controls" title="Auto-scroll Speed">\
            <span class="wedding-speed-label">Speed</span>\
            <div class="wedding-speed-group">\
              <button type="button" class="wedding-speed-btn is-active" data-speed="1" title="Normal speed (1x)">1x</button>\
              <button type="button" class="wedding-speed-btn" data-speed="2" title="Double speed (2x)">2x</button>\
            </div>\
          </div>\
          <button id="wedding-widget-minimize" aria-label="Minimize Menu" title="Minimize Menu">\
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>\
          </button>\
        </div>\
        <button id="wedding-widget-expand" aria-label="Expand Menu" title="Expand Menu">\
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>\
        </button>\
      ';
      document.body.appendChild(widget);

      function updatePlayState(isPlaying) {
        var btn = document.getElementById('wedding-play-toggle');
        if (btn) {
          btn.innerHTML = isPlaying ? pauseSvg : playSvg;
          btn.setAttribute('aria-label', isPlaying ? 'Pause Music' : 'Play Music');
          btn.setAttribute('title', isPlaying ? 'Pause Music' : 'Play Music');
        }
        if (isPlaying) {
          widget.classList.add('is-playing');
        } else {
          widget.classList.remove('is-playing');
        }
      }

      function updateMuteState(isMuted) {
        var muteBtn = document.getElementById('wedding-mute-toggle');
        if (muteBtn) {
          muteBtn.innerHTML = isMuted ? soundOffSvg : soundOnSvg;
          muteBtn.setAttribute('aria-label', isMuted ? 'Unmute' : 'Mute');
          muteBtn.setAttribute('title', isMuted ? 'Unmute' : 'Mute');
        }
      }

      function handlePlayToggle(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (audio.paused) {
          var p = audio.play();
          if (p !== undefined) {
            p.then(function () {
              updatePlayState(true);
            }).catch(function (err) {
              console.warn('Audio play prevented:', err);
              updatePlayState(false);
            });
          }
        } else {
          audio.pause();
          updatePlayState(false);
        }
      }

      // Play toggle handlers
      var playBtn = document.getElementById('wedding-play-toggle');
      if (playBtn) playBtn.onclick = handlePlayToggle;

      var infoDiv = document.getElementById('wedding-music-info');
      if (infoDiv) infoDiv.onclick = handlePlayToggle;

      // Mute toggle handler
      var muteBtn = document.getElementById('wedding-mute-toggle');
      if (muteBtn) {
        muteBtn.onclick = function (e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          audio.muted = !audio.muted;
          updateMuteState(audio.muted);
        };
      }

      // Speed buttons handlers
      var speedBtns = widget.querySelectorAll('.wedding-speed-btn');
      speedBtns.forEach(function (btn) {
        btn.onclick = function (e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          var sp = parseFloat(btn.getAttribute('data-speed')) || 1;
          speedBtns.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          if (window.__weddingSetScrollSpeed) {
            window.__weddingSetScrollSpeed(sp);
          }
        };
      });

      // Minimize / Expand handlers
      var minBtn = document.getElementById('wedding-widget-minimize');
      var expBtn = document.getElementById('wedding-widget-expand');
      if (minBtn) {
        minBtn.onclick = function (e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          widget.classList.add('is-minimized');
          try { sessionStorage.setItem('wedding_widget_minimized', '1'); } catch (err) { }
        };
      }
      if (expBtn) {
        expBtn.onclick = function (e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          widget.classList.remove('is-minimized');
          try { sessionStorage.removeItem('wedding_widget_minimized'); } catch (err) { }
        };
      }

      try {
        if (sessionStorage.getItem('wedding_widget_minimized') === '1') {
          widget.classList.add('is-minimized');
        }
      } catch (err) { }

      // Prevent any interactions on the floating menu from bubbling and pausing auto-scroll
      ['pointerdown', 'pointerup', 'pointermove', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'click'].forEach(function (ev) {
        widget.addEventListener(ev, function (e) {
          e.stopPropagation();
        });
      });

      audio.addEventListener('play', function () { updatePlayState(true); });
      audio.addEventListener('pause', function () { updatePlayState(false); });
      audio.addEventListener('ended', function () { updatePlayState(false); });

      updatePlayState(!audio.paused);
      updateMuteState(audio.muted);
    } else {
      var label = document.getElementById('wedding-music-label');
      if (label) label.textContent = '🎵 ' + musicTitle;
    }

    // 5. Autoplay song after 2 seconds (or configured delay)
    if (!window.__weddingMusicAutoplayInitiated) {
      window.__weddingMusicAutoplayInitiated = true;
      var autoPlayDelay = (musicConfig.delay_seconds !== undefined) ? (musicConfig.delay_seconds * 1000) : 2000;

      setTimeout(function () {
        if (audio && audio.paused) {
          var p = audio.play();
          if (p !== undefined) {
            p.then(function () {
              var btn = document.getElementById('wedding-play-toggle');
              if (btn) btn.innerHTML = pauseSvg;
              var w = document.getElementById('wedding-music-widget');
              if (w) w.classList.add('is-playing');
            }).catch(function (err) {
              console.log('Autoplay deferred until first user interaction:', err ? err.message : '');
              var triggerPendingPlay = function () {
                if (audio && audio.paused) {
                  audio.play().then(function () {
                    var btn = document.getElementById('wedding-play-toggle');
                    if (btn) btn.innerHTML = pauseSvg;
                    var w = document.getElementById('wedding-music-widget');
                    if (w) w.classList.add('is-playing');
                  }).catch(function () { });
                }
                ['pointerdown', 'touchstart', 'click', 'wheel', 'keydown', 'scroll'].forEach(function (ev) {
                  window.removeEventListener(ev, triggerPendingPlay);
                });
              };
              ['pointerdown', 'touchstart', 'click', 'wheel', 'keydown', 'scroll'].forEach(function (ev) {
                window.addEventListener(ev, triggerPendingPlay, { passive: true });
              });
            });
          }
        }
      }, autoPlayDelay);
    }
  }

  // 9. Slow Cinematic Auto-Scroll with Dynamic 1x / 2x Speed
  function setupAutoScroll(config) {
    if (window.__weddingAutoScrollInitialized) return;
    window.__weddingAutoScrollInitialized = true;

    var scrollConfig = (config && config.auto_scroll) ? config.auto_scroll : {};
    if (scrollConfig.enabled === false) return;

    var delaySec = (scrollConfig.delay_seconds !== undefined) ? scrollConfig.delay_seconds : 2;
    var baseSpeed = (scrollConfig.speed_pixels_per_second !== undefined) ? scrollConfig.speed_pixels_per_second : 50;
    var resumeDelay = (scrollConfig.resume_delay_seconds !== undefined) ? (scrollConfig.resume_delay_seconds * 1000) : 3500;

    var scrollPos = window.scrollY || window.pageYOffset || 0;
    var userInteracting = false;
    var resumeTimer = null;
    var autoScrollActive = true;
    var lastTime = null;
    var currentMultiplier = 1;
    var isLoopRunning = false;

    window.__weddingSetScrollSpeed = function (multiplier) {
      currentMultiplier = multiplier;
      userInteracting = false;
      if (resumeTimer) clearTimeout(resumeTimer);

      var docH = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      var winH = window.innerHeight || 0;
      var maxScroll = Math.max(0, docH - winH);
      var countdownPage = document.querySelector('.framer-s1eh8d');
      var targetStop = maxScroll;
      if (countdownPage) {
        var rect = countdownPage.getBoundingClientRect();
        targetStop = Math.min(maxScroll, Math.max(0, rect.top + window.scrollY));
      }

      if (window.scrollY < targetStop - 10) {
        autoScrollActive = true;
        if (!isLoopRunning) {
          isLoopRunning = true;
          lastTime = null;
          requestAnimationFrame(step);
        }
      }
    };

    function handleUserInput(e) {
      if (e) {
        var widget = document.getElementById('wedding-music-widget');
        if (widget) {
          if (e.target && (widget === e.target || widget.contains(e.target))) {
            return; // Floating menu clicks must not interrupt or pause auto scroll
          }
          if (typeof e.composedPath === 'function') {
            var path = e.composedPath();
            if (path && path.indexOf(widget) !== -1) {
              return;
            }
          }
        }
      }
      userInteracting = true;
      scrollPos = window.scrollY || window.pageYOffset || 0;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () {
        scrollPos = window.scrollY || window.pageYOffset || 0;
        userInteracting = false;
      }, resumeDelay);
    }

    ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, handleUserInput, { passive: true });
    });

    function step(timestamp) {
      if (!lastTime) lastTime = timestamp;
      var dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      // Prevent sudden jump if tab was backgrounded
      if (dt > 0.2) dt = 0.016;

      if (!userInteracting) {
        var docH = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        var winH = window.innerHeight || 0;
        var maxScroll = Math.max(0, docH - winH);

        // Target stop condition: Stop at Countdown & Locations Page (.framer-s1eh8d)
        var countdownPage = document.querySelector('.framer-s1eh8d');
        var targetStop = maxScroll;
        if (countdownPage) {
          var rect = countdownPage.getBoundingClientRect();
          var currentY = window.scrollY || window.pageYOffset || 0;
          var countdownTop = rect.top + currentY;
          // Stop when Countdown & Locations page is in view
          targetStop = Math.min(maxScroll, Math.max(0, countdownTop));
        }

        if (targetStop > 10) {
          var effectiveSpeed = baseSpeed * currentMultiplier;
          if (scrollPos < targetStop - 1) {
            scrollPos = Math.min(targetStop, scrollPos + effectiveSpeed * dt);
            window.scrollTo(0, scrollPos);
          } else {
            scrollPos = targetStop;
            window.scrollTo(0, scrollPos);
            autoScrollActive = false; // Successfully reached countdown page!
          }
        }
      } else {
        scrollPos = window.scrollY || window.pageYOffset || 0;
      }

      if (autoScrollActive) {
        requestAnimationFrame(step);
      } else {
        isLoopRunning = false;
      }
    }

    // Start auto-scroll after delay
    setTimeout(function () {
      scrollPos = window.scrollY || window.pageYOffset || 0;
      if (!isLoopRunning) {
        isLoopRunning = true;
        lastTime = null;
        requestAnimationFrame(step);
      }
    }, delaySec * 1000);
  }

  function init() {
    if (window.WEDDING_CONFIG) {
      applyWeddingConfig(window.WEDDING_CONFIG);
    } else {
      fetch('./wedding_config.json')
        .then(function (res) { return res.json(); })
        .then(function (cfg) {
          window.WEDDING_CONFIG = cfg;
          applyWeddingConfig(cfg);
        })
        .catch(function (err) {
          console.warn('Wedding config could not be fetched:', err);
        });
    }

    // Keep applied even if Framer hydrates
    var debounceTimer = null;
    var observer = new MutationObserver(function () {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (window.WEDDING_CONFIG) {
          applyWeddingConfig(window.WEDDING_CONFIG);
        }
      }, 150);
    });

    var mainEl = document.getElementById('main');
    if (mainEl) {
      observer.observe(mainEl, { childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
