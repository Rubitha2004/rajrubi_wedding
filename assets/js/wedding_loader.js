// Wedding Dynamic Loader
(function () {
  var currentEventIndex = 0;
  var currentRenderedEventIdx = -1;
  var isApplyingConfig = false;
  var countdownInterval = null;
  var taglineFlowSyncInitialized = false;
  var taglineFlowSyncFrame = 0;

  function formatTitle(format, bride, groom) {
    if (!format) return bride + ' WEDS ' + groom;
    return format.replace('{bride}', bride).replace('{groom}', groom);
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object || {}, key);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function textToHtml(value) {
    return escapeHtml(value).replace(/\r?\n/g, '<br class="framer-text">');
  }

  function setTextContent(element, value) {
    if (!element) return;
    var text = String(value == null ? '' : value);
    if (element.textContent !== text) element.textContent = text;
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
          setTextContent(characterSpans[characterIndex], character);
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
    if (isApplyingConfig) return;
    isApplyingConfig = true;
    try {
      var couple = config.couple || {};
    var brideName = couple.bride_name || 'BRIDE';
    var groomName = couple.groom_name || 'GROOM';
    var invitation = config.invitation || {};
    var brideFamily = config.bride_family || {};
    var groomFamily = config.groom_family || {};

    // 1. Page Title & Meta Tags
    var siteTitle = formatTitle(couple.title_format, brideName, groomName);
    if (document.title !== siteTitle) document.title = siteTitle;
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content !== siteTitle) ogTitle.content = siteTitle;
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && twTitle.content !== siteTitle) twTitle.content = siteTitle;

    // 2. Page 1: Hero Names & Details
    document.querySelectorAll('[data-framer-name="BRIDE NAME"] p span').forEach(function (brideEl) {
      setTextContent(brideEl, brideName);
    });

    document.querySelectorAll('[data-framer-name="GROOM NAME"] p span').forEach(function (groomEl) {
      setTextContent(groomEl, groomName);
    });

    if (couple.connector) {
      document.querySelectorAll('[data-framer-name="WEDS"] p').forEach(function (connectorEl) {
        setTextContent(connectorEl, couple.connector);
      });
    }

    var tagline = couple.tagline || 'are getting married';
    document.querySelectorAll('[data-framer-name="TAG LINE"] p').forEach(function (taglineEl) {
      updateTaglineText(taglineEl, tagline);
    });

    // 3. Page 2: Invitation Details & Names
    document.querySelectorAll('[data-framer-name="INVITE"] h1').forEach(function (titleEl) {
      if (hasOwn(invitation, 'title')) setTextContent(titleEl, invitation.title);
    });

    document.querySelectorAll('[data-framer-name="KIRAN"] h1').forEach(function (brideEl) {
      setTextContent(brideEl, brideName);
    });

    document.querySelectorAll('[data-framer-name="GROOM NAME "] h1').forEach(function (groomEl) {
      setTextContent(groomEl, groomName);
    });

    var mantraSvg = document.querySelector('.framer-101gh07');
    if (mantraSvg) {
      mantraSvg.setAttribute('viewBox', '0 0 500 32');
    }
    var mantraEl = document.querySelector('.framer-101gh07 p');
    if (mantraEl) {
      if (couple.mantra) setTextContent(mantraEl, couple.mantra);
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
      setTextContent(eventsHdr, config.invitation.events_heading);
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
    var bGf = brideFamily.grandfather_name || "Arunachalam";
    var bGm = brideFamily.grandmother_name || "Papaathi";
    var bF = brideFamily.father_name || "Duraisamy";
    var bM = brideFamily.mother_name || "Dhanalakshimi";

    var gGf = groomFamily.grandfather_name || "Muthusamy Velaphagounder";
    var gGm = groomFamily.grandmother_name || "Aarukani";
    var gF = groomFamily.father_name || "Kaliyappan";
    var gM = groomFamily.mother_name || "Susheela";
    var blessingLead = groomFamily.blessing_lead || "With the blessings of the Almighty\nand our beloved elders,";
    var familyConnector = groomFamily.connector || "and";
    var inviteNote = groomFamily.invite_note || "cordially invite you to grace the auspicious wedding ceremony of their beloved";
    var blessingSubtitle = invitation.blessing_subtitle || "";
    var brideInviteNote = brideFamily.invite_note || "Daughter of";

    var invitationStage = document.getElementById('weddingInvitationStage');
    var pageTwo = document.querySelector('.framer-gj6wzl');
    if (pageTwo) {
      if (!invitationStage || invitationStage.parentElement !== pageTwo) {
        if (!invitationStage) {
          invitationStage = document.createElement('div');
          invitationStage.className = 'wedding-invitation-stage';
          invitationStage.id = 'weddingInvitationStage';
          invitationStage.innerHTML =
            '<div class="wis-deity-wrap"><img class="wis-deity-img" alt="Lord Murugan"><div class="wis-mantra" id="wisMantra"></div></div>' +
            '<div class="wis-invite-wrap"><h1 class="wis-invite-title"></h1></div>' +
            '<div class="wis-family-block" id="wisFamilyBlock"></div>' +
            '<div class="wis-couple-wrap"><h2 class="wis-name wis-groom" id="wisGroomName"></h2><span class="wis-amp">&amp;</span><h2 class="wis-name wis-bride" id="wisBrideName"></h2></div>' +
            '<div class="wis-events-badge" id="wisEventsBadge"><p></p></div>';
        }
        pageTwo.appendChild(invitationStage);
      }
    }
    if (invitationStage) {
      invitationStage.style.opacity = '1';
      invitationStage.style.visibility = 'visible';
      invitationStage.style.transform = 'none';
      invitationStage.style.pointerEvents = 'auto';
    }
    var stageImage = invitationStage && invitationStage.querySelector('.wis-deity-img');
    if (stageImage) stageImage.src = couple.deity_image || './murugan_image.png';

    var wisMantra = document.getElementById('wisMantra');
    var wisInviteTitle = document.querySelector('.wis-invite-title');
    var wisFamilyBlock = document.getElementById('wisFamilyBlock');
    var wisGroomName = document.getElementById('wisGroomName');
    var wisBrideName = document.getElementById('wisBrideName');
    var wisEventsHeading = document.querySelector('.wis-events-badge p');
    if (wisMantra) {
      var mantraHtml = textToHtml(couple.mantra || "॥ ஸ்ரீ முருகன் துணை ॥");
      if (wisMantra.innerHTML !== mantraHtml) wisMantra.innerHTML = mantraHtml;
    }
    if (wisInviteTitle && hasOwn(invitation, 'title')) setTextContent(wisInviteTitle, invitation.title);
    if (wisGroomName) setTextContent(wisGroomName, groomName);
    if (wisBrideName) setTextContent(wisBrideName, brideName);
    if (wisEventsHeading && hasOwn(invitation, 'events_heading')) setTextContent(wisEventsHeading, invitation.events_heading);
    document.querySelectorAll('[data-framer-name="INVITE TAG LINE"] p').forEach(function (taglineEl) {
      if (hasOwn(invitation, 'blessing_lead')) {
        setTextContent(taglineEl, invitation.blessing_lead + (blessingSubtitle ? '\n' + blessingSubtitle : ''));
      }
    });
    if (wisFamilyBlock) {
      var wisFamilySignature = [blessingLead, familyConnector, inviteNote, brideInviteNote, gF, gM, gGf, gGm, bF, bM, bGf, bGm, blessingSubtitle].join('\u0001');
      if (wisFamilyBlock.getAttribute('data-family-signature') !== wisFamilySignature) {
        wisFamilyBlock.innerHTML =
        '<p class="wis-blessings">' + textToHtml(blessingLead) + '</p>' +
        '<p class="wis-lineage wis-groom-lineage">Son of<br><strong class="wis-parents">' + escapeHtml(gF) + ' &amp; ' + escapeHtml(gM) + '</strong><br>and Grandson of<br><strong class="wis-grandparents">' + escapeHtml(gGf) + ' &amp; ' + escapeHtml(gGm) + '</strong></p>' +
        (blessingSubtitle ? '<p class="wis-connector">' + textToHtml(blessingSubtitle) + '</p>' : '') +
        '<p class="wis-connector">' + textToHtml(familyConnector) + '</p>' +
        '<p class="wis-lineage wis-bride-lineage">' + textToHtml(brideInviteNote) + '<br><strong class="wis-parents">' + escapeHtml(bF) + ' &amp; ' + escapeHtml(bM) + '</strong><br>and Granddaughter of<br><strong class="wis-grandparents">' + escapeHtml(bGf) + ' &amp; ' + escapeHtml(bGm) + '</strong></p>' +
        '<p class="wis-invite-text">' + textToHtml(inviteNote) + '</p>';
        wisFamilyBlock.setAttribute('data-family-signature', wisFamilySignature);
      }
    }

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
        var unifiedHtml = '<p dir="auto" class="framer-text">' + textToHtml(blessingLead) + '</p>' +
          '<p dir="auto" class="framer-text">Son of<br class="framer-text"><strong class="framer-text">' + escapeHtml(gF) + ' &amp; ' + escapeHtml(gM) + '</strong><br class="framer-text">and Grandson of<br class="framer-text"><strong class="framer-text">' + escapeHtml(gGf) + ' &amp; ' + escapeHtml(gGm) + '</strong></p>' +
          (blessingSubtitle ? '<p dir="auto" class="framer-text">' + textToHtml(blessingSubtitle) + '</p>' : '') +
          '<p dir="auto" class="framer-text">' + textToHtml(familyConnector) + '</p>' +
          '<p dir="auto" class="framer-text">' + textToHtml(brideInviteNote) + '<br class="framer-text"><strong class="framer-text">' + escapeHtml(bF) + ' &amp; ' + escapeHtml(bM) + '</strong><br class="framer-text">and Granddaughter of<br class="framer-text"><strong class="framer-text">' + escapeHtml(bGf) + ' &amp; ' + escapeHtml(bGm) + '</strong></p>' +
          '<p dir="auto" class="framer-text">' + textToHtml(inviteNote) + '</p>';

        var familySignature = [blessingLead, familyConnector, inviteNote, brideInviteNote, gF, gM, gGf, gGm, bF, bM, bGf, bGm, blessingSubtitle].join('\u0001');
        if (target.getAttribute('data-family-signature') !== familySignature) {
          target.innerHTML = unifiedHtml;
          target.setAttribute('data-unified-family', 'true');
          target.setAttribute('data-family-signature', familySignature);
        }
      }
    });

    // 4. Page 3: Event Slideshow
    var eventsList = config.events || [];
    document.querySelectorAll('.wedding-event-grid').forEach(function (grid) {
      var sp = grid.parentElement && grid.parentElement.querySelector('span');
      if (sp) sp.textContent = groomName + ' & ' + brideName;
    });

    function resolveEventImage(ev) {
      if (ev && ev.image) return ev.image;
      var t = (ev && ev.title ? ev.title : '').toLowerCase();
      if (t.indexOf('engagement') !== -1) return './assets/images/heritage/event-engagement.jpg';
      if (t.indexOf('reception') !== -1) return './assets/images/heritage/event-reception.jpg';
      if (t.indexOf('wedding') !== -1) return './assets/images/heritage/event-wedding.webp';
      return './assets/images/heritage/event-engagement.jpg';
    }

    function renderSlide(idx, force) {
      if (!eventsList.length) return;
      var activeSlideIdx = ((idx % eventsList.length) + eventsList.length) % eventsList.length;
      var ev = eventsList[activeSlideIdx];
      var targetImg = resolveEventImage(ev);
      var isFirstRender = (currentRenderedEventIdx === -1);
      var isSameSlide = (currentRenderedEventIdx === activeSlideIdx && !force);

      currentRenderedEventIdx = activeSlideIdx;

      // Update dot buttons in each photo shell
      document.querySelectorAll('.wedding-photo-shell').forEach(function (shell) {
        var dots = shell.querySelectorAll('.wedding-dot-btn');
        dots.forEach(function (dot, dIdx) {
          if (dIdx < eventsList.length) {
            dot.hidden = false;
            dot.style.display = 'inline-block';
            if (dIdx === activeSlideIdx) {
              dot.style.width = '24px';
              dot.style.background = 'rgb(215, 162, 42)';
              dot.style.boxShadow = '0 0 8px rgba(215, 162, 42, 0.6)';
              dot.setAttribute('aria-current', 'true');
            } else {
              dot.style.width = '10px';
              dot.style.background = 'rgba(255,255,255,0.75)';
              dot.style.boxShadow = 'none';
              dot.removeAttribute('aria-current');
            }
          } else {
            dot.hidden = true;
            dot.style.display = 'none';
          }
        });
      });

      function updateCardContent(fadeUp) {
        var eventH2 = fadeUp.querySelector('h2');
        if (eventH2 && ev.title) setTextContent(eventH2, ev.title);

        var eventSpans = fadeUp.querySelectorAll('div div span:last-child');
        if (eventSpans.length >= 3) {
          if (hasOwn(ev, 'date')) setTextContent(eventSpans[0], ev.date || '');
          if (hasOwn(ev, 'time')) setTextContent(eventSpans[1], ev.time || '');
          if (hasOwn(ev, 'venue')) setTextContent(eventSpans[2], ev.venue || '');
        }

        var eventDesc = fadeUp.querySelector('p');
        if (eventDesc && hasOwn(ev, 'description')) setTextContent(eventDesc, ev.description || '');

        var ctaBtn = fadeUp.querySelector('.wedding-cta-btn');
        if (ctaBtn && hasOwn(ev, 'location_url')) {
          ctaBtn.href = ev.location_url || '#';
          ctaBtn.target = '_blank';
        }
      }

      function updatePhoto(img, animate) {
        img.removeAttribute('srcset');
        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.setProperty('object-position', 'center', 'important');
        img.alt = (ev.title || 'Wedding event') + ' photo';

        var currentSrc = img.getAttribute('src');
        if (!animate || currentSrc === targetImg) {
          if (currentSrc !== targetImg) img.src = targetImg;
          img.style.opacity = '1';
          return;
        }

        img.style.transition = 'opacity 200ms ease';
        img.style.opacity = '0.75';
        setTimeout(function () {
          img.src = targetImg;
          img.style.opacity = '1';
        }, 120);
      }

      if (isFirstRender || isSameSlide) {
        document.querySelectorAll('.wedding-fade-up').forEach(function (fadeUp) {
          fadeUp.style.opacity = '1';
          updateCardContent(fadeUp);
        });
        document.querySelectorAll('.wedding-photo').forEach(function (img) {
          updatePhoto(img, false);
        });
        return;
      }

      // Smooth, gentle crossfade for actual slide change
      // IMPORTANT: re-query DOM inside the setTimeout rather than using captured
      // fadeUp references — Framer may re-hydrate the element in those 120ms,
      // making the captured reference point to a detached (stale) node.
      document.querySelectorAll('.wedding-fade-up').forEach(function (el) {
        el.style.transition = 'opacity 180ms ease';
        el.style.opacity = '0.75';
      });
      setTimeout(function () {
        document.querySelectorAll('.wedding-fade-up').forEach(function (el) {
          updateCardContent(el);
          el.style.opacity = '1';
        });
      }, 120);

      document.querySelectorAll('.wedding-photo').forEach(function (img) {
        updatePhoto(img, true);
      });
    }

    // Expose event slide helpers globally
    window.__weddingRenderEventSlide = renderSlide;
    window.__weddingGetEventsCount = function () {
      return eventsList.length;
    };
    window.__weddingGetCurrentEventIndex = function () {
      return currentEventIndex;
    };
    window.__weddingSetCurrentEventIndex = function (idx) {
      if (!eventsList.length) return;
      currentEventIndex = ((idx % eventsList.length) + eventsList.length) % eventsList.length;
      renderSlide(currentEventIndex, true);
      pauseEventAutoScrollTemporarily(6000);
    };

    renderSlide(currentEventIndex);

    // 4.1 Dedicated, Independent Auto-Scroll of Event Slides
    var isEventCarouselPaused = false;
    var eventConfig = (config && config.events_auto_scroll) ? config.events_auto_scroll : {};
    var eventAutoScrollEnabled = (eventConfig.enabled !== false);
    var eventIntervalSeconds = 4;
    if (eventConfig.interval_seconds !== undefined) {
      eventIntervalSeconds = eventConfig.interval_seconds;
    } else if (config.auto_scroll && config.auto_scroll.event_slide_seconds !== undefined) {
      eventIntervalSeconds = config.auto_scroll.event_slide_seconds;
    }

    function advanceEventSlide() {
      if (eventsList.length <= 1) return;
      currentEventIndex = (currentEventIndex + 1) % eventsList.length;
      renderSlide(currentEventIndex);
      // Safety net: silently re-apply content at 400ms in case Framer re-hydrated
      // the component between now and the first render. No force = isSameSlide path
      // = no second crossfade, just a quiet content re-check.
      setTimeout(function () {
        renderSlide(currentEventIndex);
      }, 400);
    }

    function startEventAutoScroll() {
      if (window.__weddingEventAutoScrollTimer) {
        clearInterval(window.__weddingEventAutoScrollTimer);
        window.__weddingEventAutoScrollTimer = null;
      }
      if (window.__weddingEventAutoScrollStartTimer) {
        clearTimeout(window.__weddingEventAutoScrollStartTimer);
        window.__weddingEventAutoScrollStartTimer = null;
      }
      if (!eventAutoScrollEnabled || eventsList.length <= 1) return;
      var intervalMs = Math.max(2000, Math.round(eventIntervalSeconds * 1000));
      // Delay first tick: Framer may not have fully hydrated .wedding-photo-shell
      // elements yet. Firing too early renders slides into incomplete DOM -> blank events.
      var startDelay = Math.max(3500, intervalMs);
      window.__weddingEventAutoScrollStartTimer = setTimeout(function () {
        window.__weddingEventAutoScrollTimer = setInterval(function () {
          if (!isEventCarouselPaused) {
            advanceEventSlide();
          }
        }, intervalMs);
      }, startDelay);
    }

    function pauseEventAutoScrollTemporarily(delayMs) {
      isEventCarouselPaused = true;
      if (window.__weddingEventAutoScrollResumeTimer) {
        clearTimeout(window.__weddingEventAutoScrollResumeTimer);
      }
      window.__weddingEventAutoScrollResumeTimer = setTimeout(function () {
        isEventCarouselPaused = false;
      }, delayMs || 5000);
    }

    if (eventAutoScrollEnabled && !window.__weddingEventAutoScrollTimer && !window.__weddingEventAutoScrollStartTimer) {
      startEventAutoScroll();
    }

    // Setup arrow buttons and dots across all photo shells (desktop & mobile)
    document.querySelectorAll('.wedding-photo-shell').forEach(function (shell) {
      var prevBtn = shell.querySelector('.wedding-arrow-btn[aria-label="Previous slide"]');
      var nextBtn = shell.querySelector('.wedding-arrow-btn[aria-label="Next slide"]');
      if (prevBtn && !prevBtn.dataset.wired) {
        prevBtn.dataset.wired = 'true';
        prevBtn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          currentEventIndex = (currentEventIndex - 1 + eventsList.length) % eventsList.length;
          renderSlide(currentEventIndex);
          pauseEventAutoScrollTemporarily(6000);
        };
      }
      if (nextBtn && !nextBtn.dataset.wired) {
        nextBtn.dataset.wired = 'true';
        nextBtn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          currentEventIndex = (currentEventIndex + 1) % eventsList.length;
          renderSlide(currentEventIndex);
          pauseEventAutoScrollTemporarily(6000);
        };
      }

      var shellDots = shell.querySelectorAll('.wedding-dot-btn');
      shellDots.forEach(function (dot, dIdx) {
        if (dIdx < eventsList.length && !dot.dataset.wired) {
          dot.dataset.wired = 'true';
          dot.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            currentEventIndex = dIdx % eventsList.length;
            renderSlide(currentEventIndex);
            pauseEventAutoScrollTemporarily(6000);
          };
        }
      });

      // Touch swipe support for smooth mobile interaction
      if (!shell.dataset.swipeWired) {
        shell.dataset.swipeWired = 'true';
        var touchStartX = 0;
        var touchStartY = 0;
        shell.addEventListener('touchstart', function (e) {
          if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }, { passive: true });
        shell.addEventListener('touchend', function (e) {
          if (e.changedTouches && e.changedTouches[0]) {
            var diffX = e.changedTouches[0].clientX - touchStartX;
            var diffY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
              if (diffX < 0) {
                currentEventIndex = (currentEventIndex + 1) % eventsList.length;
              } else {
                currentEventIndex = (currentEventIndex - 1 + eventsList.length) % eventsList.length;
              }
              renderSlide(currentEventIndex);
              pauseEventAutoScrollTemporarily(6000);
            }
          }
        }, { passive: true });
      }
    });

    // Pause events auto-scroll on hover or touch so user can comfortably read details
    document.querySelectorAll('.wedding-event-grid, .wedding-photo-shell, .wedding-fade-up').forEach(function (elem) {
      if (elem.dataset.hoverWired) return;
      elem.dataset.hoverWired = 'true';
      elem.addEventListener('mouseenter', function () {
        if (eventConfig.pause_on_hover !== false) {
          isEventCarouselPaused = true;
        }
      }, { passive: true });
      elem.addEventListener('mouseleave', function () {
        isEventCarouselPaused = false;
      }, { passive: true });
      elem.addEventListener('touchstart', function () {
        pauseEventAutoScrollTemporarily(6000);
      }, { passive: true });
    });

    // 5. Page 5: Our Story removed per user request (hidden completely via CSS)

    // 6. Page 6: RSVP Self-Healing Stage & Config
    ensureRSVPStage(config, siteTitle);

    // 7. Page 7: Instagram Self-Healing Stage & Config
    ensureInstagramStage(config);

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
          var timerWrap = document.getElementById('weddingCountdownTimerWrap');
          if (!timerWrap || timerWrap.parentElement !== timerContainer) {
            if (!timerWrap) {
              timerWrap = document.createElement('div');
              timerWrap.id = 'weddingCountdownTimerWrap';
              timerWrap.className = 'wedding-countdown-timer-wrap';
              timerWrap.innerHTML =
                '<div class="wedding-timer-unit"><span class="wedding-timer-val" id="timerDays">00</span><span class="wedding-timer-lbl">DAYS</span></div>' +
                '<span class="wedding-timer-sep">:</span>' +
                '<div class="wedding-timer-unit"><span class="wedding-timer-val" id="timerHours">00</span><span class="wedding-timer-lbl">HOURS</span></div>' +
                '<span class="wedding-timer-sep">:</span>' +
                '<div class="wedding-timer-unit"><span class="wedding-timer-val" id="timerMins">00</span><span class="wedding-timer-lbl">MINUTES</span></div>' +
                '<span class="wedding-timer-sep">:</span>' +
                '<div class="wedding-timer-unit"><span class="wedding-timer-val" id="timerSecs">00</span><span class="wedding-timer-lbl">SECONDS</span></div>';
            }
            timerContainer.innerHTML = '';
            timerContainer.appendChild(timerWrap);
          }
          var dEl = document.getElementById('timerDays');
          var hEl = document.getElementById('timerHours');
          var mEl = document.getElementById('timerMins');
          var sEl = document.getElementById('timerSecs');
          if (dEl) dEl.textContent = String(days).padStart(2, '0');
          if (hEl) hEl.textContent = String(hours).padStart(2, '0');
          if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
          if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
        }
        document.querySelectorAll('[data-framer-name="COUNTING THE DAYS"] p').forEach(function (titleEl) {
          if (config.countdown && hasOwn(config.countdown, 'title')) setTextContent(titleEl, config.countdown.title);
        });
      }

      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 1000);
    }

    // 8. In Countdown Page: Add 2 Venue Locations (Wedding Ceremony & Reception) with Dates & Map links
    renderCountdownVenues(config);

    // 10. Custom Dedicated Wedding Music Player (decoupled from Framer React hydration)
    setupWeddingMusicPlayer(config);

    // 11. Slow Cinematic Auto-Scroll (stops at Countdown Page)
    setupAutoScroll(config);
    setupCinematicStageReveals(config);
    initializeTaglineFlowSync();
    scheduleTaglineFlowSync();

    // 12. Auspicious Loading Screen Coordinator
    setupWeddingLoadingScreen(config);
    } finally {
      setTimeout(function () {
        isApplyingConfig = false;
      }, 150);
    }
  }

  function ensureRSVPStage(config, siteTitle) {
    var p6 = document.querySelector('.framer-2ws2lg') || document.querySelector('.framer-iobn9w');
    if (!p6) return;
    var card = document.getElementById('weddingRSVPPresentationCard');
    var rsvpCfg = (config && config.rsvp) ? config.rsvp : {};
    var heading = rsvpCfg.heading || "Will you Join Us?";
    var note = rsvpCfg.note || "We would be truly honoured to celebrate this day with you. Please let us know if you'll be joining the festivities — your presence is the only gift we need.";
    var btnText = rsvpCfg.button_text || "RSVP on WhatsApp";

    if (!card || card.parentElement !== p6) {
      if (!card) {
        card = document.createElement('div');
        card.className = 'wedding-rsvp-presentation-card';
        card.id = 'weddingRSVPPresentationCard';
        card.innerHTML =
          '<h2 class="wedding-rsvp-title">' + heading + '</h2>' +
          '<p class="wedding-rsvp-note">' + note + '</p>' +
          '<button type="button" class="wedding-rsvp-action-btn" id="weddingRSVPActionBtn" aria-haspopup="dialog" aria-controls="weddingRSVPModal">' +
          '<svg class="wedding-rsvp-wa-icon" viewBox="0 0 24 24" fill="currentColor">' +
          '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>' +
          '</svg>' +
          '<span>' + btnText + '</span>' +
          '</button>';
      }
      p6.appendChild(card);
    }
    var titleEl = card.querySelector('.wedding-rsvp-title');
    var noteEl = card.querySelector('.wedding-rsvp-note');
    var btnSpan = card.querySelector('.wedding-rsvp-action-btn span');
    if (titleEl && heading) titleEl.textContent = heading;
    if (noteEl && note) noteEl.textContent = note;
    if (btnSpan && btnText) btnSpan.textContent = btnText;

    card.style.opacity = '1';
    card.style.visibility = 'visible';
    card.style.display = 'flex';

    var btn = card.querySelector('#weddingRSVPActionBtn');
    if (btn && !btn.onclick) {
      btn.onclick = function (e) {
        if (window.__weddingTriggerRSVP) window.__weddingTriggerRSVP(e);
      };
    }

    setupRSVP(config, siteTitle);
  }

  function ensureInstagramStage(config) {
    var p7 = document.querySelector('.framer-j3fgqj') || document.querySelector('.framer-131l9v1');
    if (!p7) return;
    var stage = document.getElementById('weddingInstagramStage');
    var coupleCfg = (config && config.couple) ? config.couple : {};
    var hashtag = coupleCfg.hashtag || "#RajkumarRubitha";
    var handle = coupleCfg.instagram_handle || "@kaliyappan_rajkumar";
    var cleanHandle = handle.replace(/^@/, '');
    var instaUrl = "https://www.instagram.com/" + cleanHandle + "/";

    if (!stage || stage.parentElement !== p7) {
      if (!stage) {
        stage = document.createElement('div');
        stage.className = 'wedding-instagram-stage';
        stage.id = 'weddingInstagramStage';
        stage.innerHTML =
          '<h2 class="wedding-instagram-title">Instagram</h2>' +
          '<div class="wedding-instagram-hashtag" data-framer-name="#">' + hashtag + '</div>' +
          '<a class="wedding-instagram-action-btn" id="weddingInstagramActionBtn" data-framer-name="Instagram" href="' + instaUrl + '" target="_blank" rel="noopener noreferrer">' +
          '<span>instagram</span>' +
          '</a>';
      }
      p7.appendChild(stage);
    }
    var tagEl = stage.querySelector('.wedding-instagram-hashtag');
    var linkEl = stage.querySelector('#weddingInstagramActionBtn');
    if (tagEl && hashtag) tagEl.textContent = hashtag;
    if (linkEl) linkEl.href = instaUrl;

    stage.style.opacity = '1';
    stage.style.visibility = 'visible';
    stage.style.display = 'flex';

    var extraInsta = document.querySelectorAll('.wedding-instagram-action-btn, #weddingInstagramActionBtn, .framer-131l9v1 a[data-framer-name="Instagram"]');
    extraInsta.forEach(function (b) {
      b.href = instaUrl;
      b.target = '_blank';
      b.rel = 'noopener noreferrer';
    });
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
      var configuredMessage = rsvpConfig.whatsapp_message;
      var messageInput = document.getElementById('rsvpMessage');
      if (messageInput && configuredMessage && !messageInput.value) {
        messageInput.value = configuredMessage;
      }
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

    // In-place update to prevent destroying DOM elements and stopping blinking completely
    if (venueContainer && venueContainer.children.length > 0) {
      var weddingCard = venueContainer.querySelector('.wedding-venue-card.wedding-card');
      if (weddingCard) {
        var wTitle = weddingCard.querySelector('.wedding-venue-title');
        if (wTitle) wTitle.textContent = weddingEv.venue || 'Sivagiri Velayuthaswamy Temple';
        var wDate = weddingCard.querySelector('.datetime span:last-child');
        if (wDate) wDate.textContent = (weddingEv.date || '25 October 2026') + (weddingEv.time ? (' • ' + weddingEv.time) : '');
        var wPlace = weddingCard.querySelector('.place span:last-child');
        if (wPlace) wPlace.textContent = weddingEv.venue || 'Sivagiri Velayuthaswamy Temple';
        var wLink = weddingCard.querySelector('.wedding-venue-map-link');
        if (wLink && weddingEv.location_url) wLink.href = weddingEv.location_url;
      }

      var receptionCard = venueContainer.querySelector('.wedding-venue-card.reception-card');
      if (receptionCard) {
        var rTitle = receptionCard.querySelector('.wedding-venue-title');
        if (rTitle) rTitle.textContent = receptionEv.venue || 'Uthami Ponnusamy Thirumana Mandapam';
        var rDate = receptionCard.querySelector('.datetime span:last-child');
        if (rDate) rDate.textContent = (receptionEv.date || '24 October 2026') + (receptionEv.time ? (' • ' + receptionEv.time) : '');
        var rPlace = receptionCard.querySelector('.place span:last-child');
        if (rPlace) rPlace.textContent = receptionEv.venue || 'Uthami Ponnusamy Thirumana Mandapam';
        var rLink = receptionCard.querySelector('.wedding-venue-map-link');
        if (rLink && receptionEv.location_url) rLink.href = receptionEv.location_url;
      }
      return;
    }

    var mapSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>';

    var html = '\
      <div class="wedding-venue-card wedding-card">\
        <div class="wedding-venue-badge">Wedding Ceremony</div>\
        <div class="wedding-venue-title">' + escapeHtml(weddingEv.venue || 'Sivagiri Velayuthaswamy Temple') + '</div>\
        <div class="wedding-venue-row datetime">\
          <span class="wedding-venue-icon">📅</span>\
          <span>' + escapeHtml(weddingEv.date || '25 October 2026') + (weddingEv.time ? (' • ' + escapeHtml(weddingEv.time)) : '') + '</span>\
        </div>\
        <div class="wedding-venue-row place">\
          <span class="wedding-venue-icon">📍</span>\
          <span>' + escapeHtml(weddingEv.venue || 'Sivagiri Velayuthaswamy Temple') + '</span>\
        </div>\
        <a href="' + escapeHtml(weddingEv.location_url || 'https://maps.app.goo.gl/WvQtLPBUnHoazgyu8') + '" target="_blank" rel="noopener noreferrer" class="wedding-venue-map-link">\
          ' + mapSvg + '\
          <span>View on Google Maps</span>\
        </a>\
      </div>\
      <div class="wedding-venue-card reception-card">\
        <div class="wedding-venue-badge">Reception</div>\
        <div class="wedding-venue-title">' + escapeHtml(receptionEv.venue || 'Uthami Ponnusamy Thirumana Mandapam') + '</div>\
        <div class="wedding-venue-row datetime">\
          <span class="wedding-venue-icon">📅</span>\
          <span>' + escapeHtml(receptionEv.date || '24 October 2026') + (receptionEv.time ? (' • ' + escapeHtml(receptionEv.time)) : '') + '</span>\
        </div>\
        <div class="wedding-venue-row place">\
          <span class="wedding-venue-icon">📍</span>\
          <span>' + escapeHtml(receptionEv.venue || 'Uthami Ponnusamy Thirumana Mandapam') + '</span>\
        </div>\
        <a href="' + escapeHtml(receptionEv.location_url || 'https://maps.app.goo.gl/YREAxuKnh2MqcZ3P7') + '" target="_blank" rel="noopener noreferrer" class="wedding-venue-map-link">\
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
    var musicConfig = (config && config.music) ? config.music : {};

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
        .framer-s1eh8d .framer-1u82y34,\
        .framer-s1eh8d .framer-evcqq4-container {\
          display: none !important;\
          visibility: hidden !important;\
        }\
        .framer-m7ulU .framer-131l9v1 {\
          order: 8 !important;\
          position: relative !important;\
          overflow: hidden !important;\
          width: 100% !important;\
          max-width: min(95vw, 650px) !important;\
          aspect-ratio: 2 / 3 !important;\
          height: auto !important;\
          min-height: 0 !important;\
          max-height: 92vh !important;\
          margin: 0 auto !important;\
          padding: 0 !important;\
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
          bottom: 20px;\
          left: 20px;\
          right: auto;\
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
        #wedding-prev-track,\
        #wedding-next-track,\
        #wedding-shuffle-toggle,\
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
          transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease, color 0.2s ease;\
          outline: none;\
          border-radius: 50%;\
          flex-shrink: 0;\
        }\
        #wedding-prev-track:hover,\
        #wedding-next-track:hover,\
        #wedding-shuffle-toggle:hover,\
        #wedding-mute-toggle:hover {\
          opacity: 1;\
          background: rgba(205, 174, 128, 0.22);\
          transform: scale(1.15);\
        }\
        #wedding-shuffle-toggle.is-active {\
          opacity: 1;\
          color: rgb(185, 120, 45);\
          background: rgba(205, 174, 128, 0.28);\
        }\
        #wedding-music-label {\
          font-size: 13px;\
          font-weight: 600;\
          color: rgb(88, 11, 26);\
          letter-spacing: 0.01em;\
          white-space: nowrap;\
          max-width: 130px;\
          overflow: hidden;\
          text-overflow: ellipsis;\
          display: inline-block;\
          vertical-align: middle;\
          transition: opacity 0.25s ease, transform 0.25s ease;\
        }\
        #wedding-music-label.is-transitioning {\
          opacity: 0;\
          transform: translateY(-4px);\
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
        }\
        @media (max-width: 600px) {\
          #wedding-music-widget {\
            bottom: 12px;\
            left: 10px;\
            right: auto;\
            max-width: calc(100vw - 20px);\
            padding: 0 4px 0 0;\
          }\
          #wedding-play-toggle {\
            width: 44px;\
            height: 44px;\
            border-radius: 22px;\
          }\
          #wedding-widget-body {\
            gap: 2px;\
          }\
          #wedding-music-label {\
            max-width: 75px;\
            font-size: 11px;\
          }\
          .wedding-speed-label {\
            display: none;\
          }\
          #wedding-prev-track,\
          #wedding-next-track,\
          #wedding-shuffle-toggle,\
          #wedding-mute-toggle {\
            padding: 4px;\
          }\
        }\
      ';
      document.head.appendChild(st);
    }

    // 3. Normalize playlist from configuration
    function parsePlaylist(cfg) {
      var list = [];
      if (cfg && Array.isArray(cfg.playlist) && cfg.playlist.length > 0) {
        list = cfg.playlist.filter(function (it) {
          return it && (it.file || it.url || it.src);
        }).map(function (it) {
          return {
            title: it.title || 'Wedding Music',
            file: it.file || it.url || it.src
          };
        });
      } else if (cfg && cfg.file) {
        list = [{
          title: cfg.title || 'Insecurities',
          file: cfg.file
        }];
      }
      if (list.length === 0) {
        list = [{
          title: 'Insecurities',
          file: './music/Insecurities.mp3'
        }];
      }
      return list;
    }

    var playlist = parsePlaylist(musicConfig);
    var crossfadeSec = (typeof musicConfig.crossfade_seconds === 'number' && musicConfig.crossfade_seconds >= 0)
      ? musicConfig.crossfade_seconds
      : 3;
    var shuffleEnabled = (musicConfig.shuffle !== false);

    // If player singleton already exists, update config and return
    if (window.__weddingMusicPlayer) {
      window.__weddingMusicPlayer.updateConfig({
        playlist: playlist,
        crossfade_seconds: crossfadeSec,
        shuffle: shuffleEnabled,
        autoplay: musicConfig.autoplay,
        delay_seconds: musicConfig.delay_seconds
      });
      return;
    }

    // 4. Dual-Deck Audio Elements (Deck A & Deck B for seamless crossfading)
    var deckA = document.getElementById('wedding-custom-audio');
    if (!deckA) {
      deckA = document.createElement('audio');
      deckA.id = 'wedding-custom-audio';
      deckA.preload = 'auto';
      document.body.appendChild(deckA);
    }
    deckA.loop = false;

    var deckB = document.getElementById('wedding-custom-audio-b');
    if (!deckB) {
      deckB = document.createElement('audio');
      deckB.id = 'wedding-custom-audio-b';
      deckB.preload = 'auto';
      document.body.appendChild(deckB);
    }
    deckB.loop = false;
    deckB.volume = 0;

    var activeDeck = deckA;
    var standbyDeck = deckB;
    var isPlaying = false;
    var isMuted = false;
    var masterVolume = 1.0;
    var isCrossfading = false;
    var crossfadeTriggered = false;
    var crossfadeRaf = null;

    // Queue management with Fisher-Yates shuffle
    function buildQueue(shuffle, firstIdx) {
      var arr = [];
      for (var i = 0; i < playlist.length; i++) {
        arr.push(i);
      }
      if (!shuffle || arr.length <= 1) {
        return arr;
      }
      for (var j = arr.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = arr[j];
        arr[j] = arr[k];
        arr[k] = tmp;
      }
      if (typeof firstIdx === 'number') {
        var pos = arr.indexOf(firstIdx);
        if (pos > 0) {
          arr.splice(pos, 1);
          arr.unshift(firstIdx);
        }
      }
      return arr;
    }

    var playbackQueue = buildQueue(shuffleEnabled);
    var currentQueueIndex = 0;

    function getNextQueueIndex(cur) {
      if (cur + 1 < playbackQueue.length) {
        return cur + 1;
      }
      if (shuffleEnabled) {
        var lastSongIdx = playbackQueue[cur];
        playbackQueue = buildQueue(true, null);
        if (playbackQueue.length > 1 && playbackQueue[0] === lastSongIdx) {
          var swapIdx = Math.floor(Math.random() * (playbackQueue.length - 1)) + 1;
          var t = playbackQueue[0];
          playbackQueue[0] = playbackQueue[swapIdx];
          playbackQueue[swapIdx] = t;
        }
      }
      return 0;
    }

    function getPrevQueueIndex(cur) {
      if (cur - 1 >= 0) {
        return cur - 1;
      }
      return playbackQueue.length - 1;
    }

    function getCurrentTrack() {
      return playlist[playbackQueue[currentQueueIndex]] || playlist[0];
    }

    // 5. SVG Icons
    var playSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style="margin-left:2px"><path d="M8 5v14l11-7z"/></svg>';
    var pauseSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    var soundOnSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
    var soundOffSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
    var prevSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>';
    var nextSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>';
    var shuffleSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>';

    // 6. Create UI Widget
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

      var curTrack = getCurrentTrack();
      widget.innerHTML = '\
        <button id="wedding-play-toggle" aria-label="Play Music" title="Play Music">\
          ' + playSvg + '\
        </button>\
        <div id="wedding-widget-body">\
          <button id="wedding-prev-track" aria-label="Previous Song" title="Previous Song">\
            ' + prevSvg + '\
          </button>\
          <div id="wedding-music-info" title="Toggle Play / Pause">\
            <span id="wedding-music-label" title="' + escapeHtml(curTrack.title) + '">🎵 ' + escapeHtml(curTrack.title) + '</span>\
            <div id="wedding-music-bars">\
              <span class="eq-bar b1"></span>\
              <span class="eq-bar b2"></span>\
              <span class="eq-bar b3"></span>\
            </div>\
          </div>\
          <button id="wedding-next-track" aria-label="Next Song" title="Next Song">\
            ' + nextSvg + '\
          </button>\
          <button id="wedding-shuffle-toggle" class="' + (shuffleEnabled ? 'is-active' : '') + '" aria-label="Toggle Shuffle" title="Shuffle: ' + (shuffleEnabled ? 'On' : 'Off') + '">\
            ' + shuffleSvg + '\
          </button>\
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
    }

    // 7. UI State Sync
    function updatePlayState(playing) {
      isPlaying = playing;
      var btn = document.getElementById('wedding-play-toggle');
      if (btn) {
        btn.innerHTML = playing ? pauseSvg : playSvg;
        btn.setAttribute('aria-label', playing ? 'Pause Music & Auto-Scroll' : 'Play Music & Auto-Scroll');
        btn.setAttribute('title', playing ? 'Pause Music & Auto-Scroll' : 'Play Music & Auto-Scroll');
      }
      if (widget) {
        if (playing) {
          widget.classList.add('is-playing');
        } else {
          widget.classList.remove('is-playing');
        }
      }
    }

    function updateMuteState(muted) {
      isMuted = muted;
      deckA.muted = muted;
      deckB.muted = muted;
      var muteBtn = document.getElementById('wedding-mute-toggle');
      if (muteBtn) {
        muteBtn.innerHTML = muted ? soundOffSvg : soundOnSvg;
        muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
        muteBtn.setAttribute('title', muted ? 'Unmute' : 'Mute');
      }
    }

    function updateTrackLabel(title) {
      var label = document.getElementById('wedding-music-label');
      if (!label) return;
      label.classList.add('is-transitioning');
      setTimeout(function () {
        label.textContent = '🎵 ' + title;
        label.title = title;
        label.classList.remove('is-transitioning');
      }, 150);
    }

    function updateShuffleBtn() {
      var sBtn = document.getElementById('wedding-shuffle-toggle');
      if (!sBtn) return;
      if (shuffleEnabled) {
        sBtn.classList.add('is-active');
        sBtn.title = 'Shuffle: On';
        sBtn.setAttribute('aria-label', 'Shuffle: On');
      } else {
        sBtn.classList.remove('is-active');
        sBtn.title = 'Shuffle: Off';
        sBtn.setAttribute('aria-label', 'Shuffle: Off');
      }
    }

    // Preload standby deck
    function preloadStandby() {
      var nextIdx = getNextQueueIndex(currentQueueIndex);
      var nextTrack = playlist[playbackQueue[nextIdx]];
      if (nextTrack && standbyDeck) {
        if (standbyDeck.getAttribute('src') !== nextTrack.file) {
          standbyDeck.src = nextTrack.file;
        }
        standbyDeck.preload = 'auto';
        standbyDeck.volume = 0;
      }
    }

    // Set initial active deck source
    var initTrack = getCurrentTrack();
    if (activeDeck.getAttribute('src') !== initTrack.file) {
      activeDeck.src = initTrack.file;
      activeDeck.volume = isMuted ? 0 : masterVolume;
    }
    preloadStandby();

    // 8. Equal-Power Crossfade Engine
    function crossfadeTo(nextQIndex, durationSec) {
      if (isCrossfading) {
        if (crossfadeRaf) cancelAnimationFrame(crossfadeRaf);
        isCrossfading = false;
        try {
          standbyDeck.pause();
          standbyDeck.currentTime = 0;
          standbyDeck.volume = 0;
        } catch (e) { }
      }

      var nextTrack = playlist[playbackQueue[nextQIndex]];
      if (!nextTrack) return;

      var dur = (typeof durationSec === 'number' && durationSec > 0) ? durationSec : crossfadeSec;

      if (dur <= 0.05 || !isPlaying) {
        currentQueueIndex = nextQIndex;
        activeDeck.src = nextTrack.file;
        activeDeck.currentTime = 0;
        activeDeck.volume = isMuted ? 0 : masterVolume;
        updateTrackLabel(nextTrack.title);
        if (isPlaying) {
          activeDeck.play().catch(function () { });
        }
        crossfadeTriggered = false;
        preloadStandby();
        return;
      }

      isCrossfading = true;
      crossfadeTriggered = true;

      var outgoing = activeDeck;
      var incoming = standbyDeck;

      if (incoming.getAttribute('src') !== nextTrack.file) {
        incoming.src = nextTrack.file;
      }
      incoming.currentTime = 0;
      incoming.volume = 0;
      incoming.muted = isMuted;

      var playProm = incoming.play();
      if (playProm !== undefined) {
        playProm.catch(function (err) {
          console.warn('Crossfade incoming play error:', err);
        });
      }

      updateTrackLabel(nextTrack.title);

      var startTime = performance.now();
      var durMs = dur * 1000;

      function step(now) {
        var elapsed = now - startTime;
        var progress = Math.min(1, Math.max(0, elapsed / durMs));

        // Equal-power crossfade curve: cos(t * pi/2) and sin(t * pi/2)
        var outGain = Math.cos(progress * 0.5 * Math.PI);
        var inGain = Math.sin(progress * 0.5 * Math.PI);

        var base = isMuted ? 0 : masterVolume;
        try {
          outgoing.volume = Math.max(0, Math.min(1, base * outGain));
        } catch (e) { }
        try {
          incoming.volume = Math.max(0, Math.min(1, base * inGain));
        } catch (e) { }

        if (progress < 1) {
          crossfadeRaf = requestAnimationFrame(step);
        } else {
          isCrossfading = false;
          try {
            outgoing.pause();
            outgoing.currentTime = 0;
            outgoing.volume = 0;
          } catch (e) { }
          incoming.volume = isMuted ? 0 : masterVolume;

          // Swap active & standby decks
          activeDeck = incoming;
          standbyDeck = outgoing;
          currentQueueIndex = nextQIndex;
          crossfadeTriggered = false;

          preloadStandby();
        }
      }

      crossfadeRaf = requestAnimationFrame(step);
    }

    // Natural end & crossfade monitoring
    function checkAutoCrossfade() {
      if (!isPlaying || isCrossfading || crossfadeTriggered) return;
      if (!activeDeck.duration || isNaN(activeDeck.duration)) return;

      var remaining = activeDeck.duration - activeDeck.currentTime;
      if (remaining <= crossfadeSec && remaining > 0) {
        crossfadeTriggered = true;
        var nextIdx = getNextQueueIndex(currentQueueIndex);
        var dur = (remaining >= 1) ? Math.min(crossfadeSec, remaining) : remaining;
        crossfadeTo(nextIdx, dur);
      }
    }

    deckA.addEventListener('timeupdate', checkAutoCrossfade);
    deckB.addEventListener('timeupdate', checkAutoCrossfade);

    setInterval(checkAutoCrossfade, 250);

    function onDeckEnded() {
      if (!isCrossfading) {
        var nextIdx = getNextQueueIndex(currentQueueIndex);
        crossfadeTo(nextIdx, 1);
      }
    }
    deckA.addEventListener('ended', onDeckEnded);
    deckB.addEventListener('ended', onDeckEnded);

    function onDeckError(e) {
      var d = e.target;
      console.warn('Audio deck load error:', d ? d.src : '');
      if (d === activeDeck && isPlaying) {
        setTimeout(function () {
          var nextIdx = getNextQueueIndex(currentQueueIndex);
          crossfadeTo(nextIdx, 0.5);
        }, 500);
      }
    }
    deckA.addEventListener('error', onDeckError);
    deckB.addEventListener('error', onDeckError);

    // 9. Player Controller API
    var player = {
      play: function () {
        var p = activeDeck.play();
        if (p !== undefined) {
          p.then(function () {
            updatePlayState(true);
            if (isCrossfading) {
              standbyDeck.play().catch(function () { });
            }
          }).catch(function (err) {
            console.warn('Audio play prevented:', err);
            updatePlayState(false);
          });
        } else {
          updatePlayState(true);
        }
        if (window.__weddingResumeAutoScroll) {
          window.__weddingResumeAutoScroll();
        }
      },
      pause: function () {
        activeDeck.pause();
        if (isCrossfading) {
          standbyDeck.pause();
        }
        updatePlayState(false);
        if (window.__weddingPauseAutoScroll) {
          window.__weddingPauseAutoScroll();
        }
      },
      togglePlay: function () {
        if (isPlaying) {
          player.pause();
        } else {
          player.play();
        }
      },
      next: function () {
        if (playlist.length <= 1 && !isPlaying) return;
        var nextIdx = getNextQueueIndex(currentQueueIndex);
        if (isPlaying) {
          crossfadeTo(nextIdx, Math.min(1.5, crossfadeSec));
        } else {
          crossfadeTo(nextIdx, 0);
        }
      },
      prev: function () {
        if (activeDeck.currentTime > 3) {
          activeDeck.currentTime = 0;
          return;
        }
        var prevIdx = getPrevQueueIndex(currentQueueIndex);
        if (isPlaying) {
          crossfadeTo(prevIdx, Math.min(1.5, crossfadeSec));
        } else {
          crossfadeTo(prevIdx, 0);
        }
      },
      toggleShuffle: function () {
        shuffleEnabled = !shuffleEnabled;
        updateShuffleBtn();
        var curSongIdx = playbackQueue[currentQueueIndex];
        if (shuffleEnabled) {
          playbackQueue = buildQueue(true, curSongIdx);
          currentQueueIndex = 0;
        } else {
          playbackQueue = buildQueue(false);
          currentQueueIndex = playbackQueue.indexOf(curSongIdx);
          if (currentQueueIndex === -1) currentQueueIndex = 0;
        }
        preloadStandby();
      },
      toggleMute: function () {
        updateMuteState(!isMuted);
      },
      updateConfig: function (newCfg) {
        if (!newCfg) return;
        if (newCfg.playlist && Array.isArray(newCfg.playlist) && newCfg.playlist.length > 0) {
          playlist = parsePlaylist(newCfg);
          var curSongIdx = playbackQueue[currentQueueIndex] || 0;
          playbackQueue = buildQueue(shuffleEnabled, curSongIdx);
          currentQueueIndex = 0;
          preloadStandby();
        }
        if (typeof newCfg.crossfade_seconds === 'number') {
          crossfadeSec = newCfg.crossfade_seconds;
        }
        if (typeof newCfg.shuffle === 'boolean') {
          shuffleEnabled = newCfg.shuffle;
          updateShuffleBtn();
        }
      }
    };

    window.__weddingMusicPlayer = player;

    // 10. Wire UI Click Handlers
    var playBtn = document.getElementById('wedding-play-toggle');
    if (playBtn) {
      playBtn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        player.togglePlay();
      };
    }

    var infoDiv = document.getElementById('wedding-music-info');
    if (infoDiv) {
      infoDiv.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        player.togglePlay();
      };
    }

    var prevBtn = document.getElementById('wedding-prev-track');
    if (prevBtn) {
      prevBtn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        player.prev();
      };
    }

    var nextBtn = document.getElementById('wedding-next-track');
    if (nextBtn) {
      nextBtn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        player.next();
      };
    }

    var shuffleBtn = document.getElementById('wedding-shuffle-toggle');
    if (shuffleBtn) {
      shuffleBtn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        player.toggleShuffle();
      };
    }

    var muteBtn = document.getElementById('wedding-mute-toggle');
    if (muteBtn) {
      muteBtn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        player.toggleMute();
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
        try { sessionStorage.removeItem('wedding_widget_expanded'); } catch (err) { }
      };
    }
    if (expBtn) {
      expBtn.onclick = function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        widget.classList.remove('is-minimized');
        try { sessionStorage.setItem('wedding_widget_expanded', '1'); } catch (err) { }
      };
    }

    // Start minimized by default on every load.
    // Only expand if the user explicitly expanded during this session.
    try {
      if (sessionStorage.getItem('wedding_widget_expanded') === '1') {
        // User previously expanded — keep it expanded
      } else {
        widget.classList.add('is-minimized');
      }
    } catch (err) {
      widget.classList.add('is-minimized');
    }

    // Prevent any interactions on the floating menu from bubbling and pausing auto-scroll
    ['pointerdown', 'pointerup', 'pointermove', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'click'].forEach(function (ev) {
      widget.addEventListener(ev, function (e) {
        e.stopPropagation();
      });
    });

    // Initial mute and play states
    updateMuteState(isMuted);
    updatePlayState(false);

    // 11. Music Playback Controller & Autoplay Handling
    var triggerMusicPlayback = function () {
      if (!isPlaying) {
        player.play();
      }
    };
    window.__weddingStartMusic = triggerMusicPlayback;

    // Only genuine user-gesture events unlock audio autoplay on browsers.
    // 'scroll' and 'wheel' do NOT satisfy autoplay policy — removed intentionally.
    var _gestureEvents = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
    var gestureUnlock = function () {
      triggerMusicPlayback();
      _gestureEvents.forEach(function (ev) {
        window.removeEventListener(ev, gestureUnlock);
      });
    };
    _gestureEvents.forEach(function (ev) {
      window.addEventListener(ev, gestureUnlock, { passive: true });
    });

    // Fallback: If loading screen is disabled in config, trigger after delay
    if (musicConfig.autoplay !== false && !window.__weddingMusicAutoplayInitiated) {
      window.__weddingMusicAutoplayInitiated = true;
      var loadCfg = (config && config.loading_screen) ? config.loading_screen : {};
      if (loadCfg.enabled === false) {
        var autoPlayDelay = (musicConfig.delay_seconds !== undefined) ? (musicConfig.delay_seconds * 1000) : 2000;
        setTimeout(triggerMusicPlayback, autoPlayDelay);
      }
    }
  }

  // 9. Smooth Cinematic Page Auto-Scroll with Dynamic 1x / 2x Speed Controls
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
    var isManuallyPaused = false;
    var hasReachedTarget = false;

    function getTargetStop() {
      var docH = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      var winH = window.innerHeight || 0;
      var maxScroll = Math.max(0, docH - winH);
      var currentY = window.scrollY || window.pageYOffset || 0;
      var isMobile = window.innerWidth < 768;

      if (isMobile) {
        // On mobile, section stacks vertically — target the timer/venues directly
        // so the scroll stops when they are actually visible, not just at section top.
        var timerEl = document.getElementById('weddingCountdownTimerWrap') ||
                      document.querySelector('.wedding-countdown-timer-wrap') ||
                      document.getElementById('wedding-countdown-venues');
        if (timerEl) {
          var rect = timerEl.getBoundingClientRect();
          var elTop = rect.top + currentY;
          // Stop with timer roughly 15% from the top of the viewport
          return Math.min(maxScroll, Math.max(0, Math.round(elTop - winH * 0.15)));
        }
      }

      // Desktop: stop at the top of the countdown section container
      var countdownEl = document.querySelector('.framer-s1eh8d') ||
                        document.getElementById('wedding-countdown-venues') ||
                        document.querySelector('[data-framer-name="COUNTING THE DAYS"]');
      if (countdownEl) {
        var rect = countdownEl.getBoundingClientRect();
        var countdownTop = rect.top + currentY;
        return Math.min(maxScroll, Math.max(0, Math.round(countdownTop)));
      }
      return maxScroll;
    }

    window.__weddingPauseAutoScroll = function () {
      isManuallyPaused = true;
      autoScrollActive = false;
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    window.__weddingResumeAutoScroll = function () {
      isManuallyPaused = false;
      userInteracting = false;
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      scrollPos = window.scrollY || window.pageYOffset || 0;
      var targetStop = getTargetStop();
      // Only resume if we have NOT yet arrived at the countdown section
      if (!hasReachedTarget && scrollPos < targetStop - 15) {
        autoScrollActive = true;
        if (!isLoopRunning) {
          isLoopRunning = true;
          lastTime = null;
          requestAnimationFrame(step);
        }
      }
    };

    window.__weddingIsAutoScrollActive = function () {
      return autoScrollActive && !isManuallyPaused && !hasReachedTarget;
    };

    window.__weddingSetScrollSpeed = function (multiplier) {
      currentMultiplier = multiplier;
      userInteracting = false;
      if (resumeTimer) clearTimeout(resumeTimer);

      var currentY = window.scrollY || window.pageYOffset || 0;
      var targetStop = getTargetStop();

      // Only auto-scroll if user is currently above the countdown section
      if (currentY < targetStop - 25) {
        hasReachedTarget = false;
        isManuallyPaused = false;
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

      scrollPos = window.scrollY || window.pageYOffset || 0;
      var currentTarget = getTargetStop();

      // If user manually scrolls significantly back UP towards the top, allow auto-scroll down to countdown again
      if (scrollPos < currentTarget - 120) {
        hasReachedTarget = false;
      } else if (scrollPos >= currentTarget - 15) {
        // User has reached or passed the countdown section; keep auto-scroll stopped permanently
        hasReachedTarget = true;
        autoScrollActive = false;
        if (resumeTimer) {
          clearTimeout(resumeTimer);
          resumeTimer = null;
        }
        return;
      }

      if (isManuallyPaused) {
        userInteracting = true;
        if (resumeTimer) {
          clearTimeout(resumeTimer);
          resumeTimer = null;
        }
        return;
      }

      userInteracting = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () {
        if (isManuallyPaused) return;
        scrollPos = window.scrollY || window.pageYOffset || 0;
        userInteracting = false;
        var targetStop = getTargetStop();
        if (!hasReachedTarget && scrollPos < targetStop - 15 && !isLoopRunning) {
          autoScrollActive = true;
          isLoopRunning = true;
          lastTime = null;
          requestAnimationFrame(step);
        }
      }, resumeDelay);
    }

    // Genuine user interactions that pause page auto-scroll
    ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, handleUserInput, { passive: true });
    });

    function step(timestamp) {
      if (isManuallyPaused) {
        autoScrollActive = false;
        isLoopRunning = false;
        return;
      }

      if (!lastTime) lastTime = timestamp;
      var dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      // Prevent sudden jump if tab was backgrounded
      if (dt > 0.2) dt = 0.016;

      var targetStop = getTargetStop();

      if (!userInteracting) {
        var effectiveSpeed = baseSpeed * currentMultiplier;
        if (scrollPos < targetStop - 1) {
          scrollPos = Math.min(targetStop, scrollPos + effectiveSpeed * dt);
          window.scrollTo(0, scrollPos);
          if (window.__weddingScanCinematicReveals) {
            window.__weddingScanCinematicReveals();
          }
        } else {
          // Arrived precisely at the Countdown & Locations section
          scrollPos = targetStop;
          window.scrollTo(0, scrollPos);
          autoScrollActive = false; // Stop permanently at countdown
          hasReachedTarget = true;
          isLoopRunning = false;
          if (resumeTimer) {
            clearTimeout(resumeTimer);
            resumeTimer = null;
          }
          if (window.__weddingScanCinematicReveals) {
            window.__weddingScanCinematicReveals();
          }
        }
      } else {
        // User is manually scrolling
        scrollPos = window.scrollY || window.pageYOffset || 0;
        if (window.__weddingScanCinematicReveals) {
          window.__weddingScanCinematicReveals();
        }
      }

      if (autoScrollActive && !isManuallyPaused && !hasReachedTarget) {
        requestAnimationFrame(step);
      } else {
        isLoopRunning = false;
      }
    }

    // Start auto-scroll after delay once site has loaded and revealed
    window.__weddingStartAutoScroll = function () {
      if (window.__weddingAutoScrollStarted) return;
      window.__weddingAutoScrollStarted = true;
      setTimeout(function () {
        if (isManuallyPaused) return;
        scrollPos = window.scrollY || window.pageYOffset || 0;
        var targetStop = getTargetStop();
        if (scrollPos < targetStop - 15 && !isLoopRunning) {
          hasReachedTarget = false;
          isLoopRunning = true;
          lastTime = null;
          requestAnimationFrame(step);
        }
      }, delaySec * 1000);
    };

    // Fallback: If loading screen is disabled in config, start after delaySec
    var loadCfg = (config && config.loading_screen) ? config.loading_screen : {};
    if (loadCfg.enabled === false) {
      window.__weddingStartAutoScroll();
    }
  }

  // 10. Individual Element Cinematic Entrance Scroll Reveals (Triple-Layer Fail-Safe)
  function setupCinematicStageReveals(config) {
    var revealCfg = (config && (config.cinematic_reveals || config.cinematic || config.appearance)) || {};
    if (revealCfg.enabled === false) {
      document.body.classList.remove('cinematic-active');
      return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.remove('cinematic-active');
      return;
    }

    var durationSec = (revealCfg.duration_seconds !== undefined) ? revealCfg.duration_seconds : 1.35;
    var distPx = (revealCfg.distance_pixels !== undefined) ? revealCfg.distance_pixels : 28;
    var staggerSec = (revealCfg.stagger_seconds !== undefined) ? revealCfg.stagger_seconds : 0.14;

    document.documentElement.style.setProperty('--cinematic-duration', durationSec + 's');
    document.documentElement.style.setProperty('--cinematic-distance', distPx + 'px');

    var targetsList = [
      // Page 2: Invitation elements with staggered delays
      { sel: '.wis-deity-wrap', delay: '0.04s' },
      { sel: '.wis-invite-wrap', delay: (0.04 + staggerSec) + 's' },
      { sel: '.wis-family-block', delay: (0.04 + staggerSec * 2) + 's' },
      { sel: '.wis-couple-wrap', delay: (0.04 + staggerSec * 3) + 's' },
      { sel: '.wis-events-badge', delay: (0.04 + staggerSec * 4) + 's' },
      // Page 6: RSVP Stage Text Elements (Staggered Cinematic Entrance)
      { sel: '.wedding-rsvp-title', delay: '0.06s' },
      { sel: '.wedding-rsvp-note', delay: (0.06 + staggerSec) + 's' },
      { sel: '.wedding-rsvp-action-btn', delay: (0.06 + staggerSec * 2) + 's' },
      // Page 7: Countdown and Venues
      { sel: '.framer-s1eh8d [data-framer-name="COUNTING THE DAYS"]', delay: '0.05s' },
      { sel: '.wedding-countdown-timer-wrap', delay: '0.15s' },
      { sel: '#weddingCountdownTimerWrap', delay: '0.15s' },
      { sel: '.wedding-venue-card:first-child', delay: '0.22s' },
      { sel: '.wedding-venue-card:last-child', delay: '0.36s' },
      // Page 8: Instagram
      { sel: '.wedding-instagram-stage', delay: '0.15s' }
    ];

    window.__weddingElementsToObserve = window.__weddingElementsToObserve || [];
    var elementsToObserve = window.__weddingElementsToObserve;

    targetsList.forEach(function (item) {
      var found = document.querySelectorAll(item.sel);
      found.forEach(function (el) {
        if (!el.classList.contains('is-revealed')) {
          el.classList.add('cinematic-entry');
          el.style.setProperty('--item-delay', item.delay);
          if (elementsToObserve.indexOf(el) === -1) {
            elementsToObserve.push(el);
            if (window.__weddingCinematicObserver) {
              window.__weddingCinematicObserver.observe(el);
            }
          }
        }
      });
    });

    if (!elementsToObserve.length) return;

    // Arm the cinematic active mode on body
    document.documentElement.classList.add('cinematic-ready');
    document.body.classList.add('cinematic-active');

    function revealTarget(el) {
      if (!el || el.classList.contains('is-revealed')) return;
      el.classList.add('is-revealed');

      var cleanup = function () {
        el.classList.add('is-static');
        el.removeEventListener('transitionend', onEnd);
      };

      var onEnd = function (e) {
        if (e.target === el && (e.propertyName === 'transform' || e.propertyName === 'opacity')) {
          cleanup();
        }
      };
      el.addEventListener('transitionend', onEnd);
      setTimeout(cleanup, 2200);
    }

    var winH = window.innerHeight || document.documentElement.clientHeight || 800;

    // Layer 1: Immediate Viewport Check (ONLY elements currently on screen reveal on initial load)
    elementsToObserve.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.height > 0 && rect.top < winH * 0.92 && rect.bottom > 0) {
        revealTarget(el);
      }
    });

    // Layer 2: Viewport Scanner on Scroll / Touch / Wheel / Auto-Scroll
    function scanVisibleElements() {
      var currentWinH = window.innerHeight || document.documentElement.clientHeight || 800;
      var remaining = 0;
      elementsToObserve.forEach(function (el) {
        if (!el.classList.contains('is-revealed')) {
          var rect = el.getBoundingClientRect();
          if (rect.height > 0 && rect.top < currentWinH * 0.95 && rect.bottom > 0) {
            revealTarget(el);
          } else if (!el.classList.contains('is-revealed')) {
            remaining++;
          }
        }
      });
      return remaining;
    }

    window.__weddingScanCinematicReveals = scanVisibleElements;

    // Attach scan to scroll, touch, wheel, resize
    if (!window.__weddingCinematicListenersAttached) {
      window.__weddingCinematicListenersAttached = true;

      var scrollScanHandler = function () {
        scanVisibleElements();
      };
      ['scroll', 'wheel', 'touchmove', 'resize'].forEach(function (ev) {
        window.addEventListener(ev, scrollScanHandler, { passive: true });
      });

      // Layer 3: IntersectionObserver (fires only when an element crosses into the screen)
      if ('IntersectionObserver' in window) {
        window.__weddingCinematicObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealTarget(entry.target);
              if (window.__weddingCinematicObserver) {
                window.__weddingCinematicObserver.unobserve(entry.target);
              }
            }
          });
        }, {
          threshold: [0, 0.08],
          rootMargin: '0px 0px -20px 0px'
        });

        elementsToObserve.forEach(function (el) {
          if (!el.classList.contains('is-revealed')) {
            window.__weddingCinematicObserver.observe(el);
          }
        });
      } else {
        // Fallback for browsers without IntersectionObserver
        elementsToObserve.forEach(function (el) {
          el.classList.add('is-revealed', 'is-static');
        });
      }
    }
  }

  // 12. Auspicious South Indian Heritage Loading Screen Coordinator
  function setupWeddingLoadingScreen(config) {
    if (window.__weddingLoadingScreenInitialized) {
      if (config && config.couple) {
        var groom = config.couple.groom_name || 'Rajkumar';
        var bride = config.couple.bride_name || 'Rubitha';
        var mantra = config.couple.mantra || '॥ ஸ்ரீ முருகன் துணை ॥';
        var gEl = document.getElementById('wlsGroomName');
        var bEl = document.getElementById('wlsBrideName');
        var mEl = document.getElementById('wlsMantraText');
        if (gEl) setTextContent(gEl, groom);
        if (bEl) setTextContent(bEl, bride);
        if (mEl) setTextContent(mEl, mantra);
      }
      return;
    }
    window.__weddingLoadingScreenInitialized = true;

    var loadCfg = (config && config.loading_screen) ? config.loading_screen : {};
    if (loadCfg.enabled === false) {
      var existingEl = document.getElementById('weddingLoadingScreen');
      if (existingEl) existingEl.style.display = 'none';
      if (window.__weddingStartMusic) window.__weddingStartMusic();
      if (window.__weddingStartAutoScroll) window.__weddingStartAutoScroll();
      return;
    }

    var minDurationMs = (loadCfg.min_duration_seconds !== undefined ? loadCfg.min_duration_seconds : 1.2) * 1000;
    var maxTimeoutMs = (loadCfg.max_duration_seconds !== undefined ? loadCfg.max_duration_seconds : 5.0) * 1000;
    var autoDismissDelayMs = loadCfg.auto_dismiss_delay_ms !== undefined ? loadCfg.auto_dismiss_delay_ms : 600;

    var loadingEl = document.getElementById('weddingLoadingScreen');
    if (!loadingEl) {
      loadingEl = document.createElement('div');
      loadingEl.id = 'weddingLoadingScreen';
      loadingEl.className = 'wedding-loading-screen';
      loadingEl.setAttribute('role', 'progressbar');
      loadingEl.setAttribute('aria-valuemin', '0');
      loadingEl.setAttribute('aria-valuemax', '100');
      loadingEl.setAttribute('aria-valuenow', '0');
      loadingEl.setAttribute('aria-label', 'Loading Invitation');
      loadingEl.innerHTML = '\
        <div class="wls-frame-border" aria-hidden="true"></div>\
        <div class="wls-ornament-corner wls-corner-tl" aria-hidden="true"></div>\
        <div class="wls-ornament-corner wls-corner-tr" aria-hidden="true"></div>\
        <div class="wls-ornament-corner wls-corner-bl" aria-hidden="true"></div>\
        <div class="wls-ornament-corner wls-corner-br" aria-hidden="true"></div>\
        <div class="wls-content">\
          <div class="wls-lamp-wrap">\
            <svg class="wls-diya-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\
              <defs>\
                <radialGradient id="wlsFlameGrad" cx="50%" cy="50%" r="50%">\
                  <stop offset="0%" stop-color="#FFF8D6"/>\
                  <stop offset="30%" stop-color="#FFC107"/>\
                  <stop offset="70%" stop-color="#FF6D00"/>\
                  <stop offset="100%" stop-color="#DD2C00"/>\
                </radialGradient>\
                <linearGradient id="wlsBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">\
                  <stop offset="0%" stop-color="#F5D77F"/>\
                  <stop offset="45%" stop-color="#D4A359"/>\
                  <stop offset="100%" stop-color="#9C7226"/>\
                </linearGradient>\
                <filter id="wlsGlowFilter" x="-20%" y="-20%" width="140%" height="140%">\
                  <feGaussianBlur stdDeviation="2" result="blur"/>\
                  <feComposite in="SourceGraphic" in2="blur" operator="over"/>\
                </filter>\
              </defs>\
              <path d="M19 38 L29 38 L32 43 L16 43 Z" fill="url(#wlsBrassGrad)"/>\
              <path d="M11 27 C11 27 14 36 24 36 C34 36 37 27 37 27 C37 31 33 38 24 38 C15 38 11 31 11 27 Z" fill="url(#wlsBrassGrad)"/>\
              <ellipse cx="24" cy="27" rx="13" ry="3.5" fill="#C5933A"/>\
              <g class="wls-flame-glow" filter="url(#wlsGlowFilter)">\
                <path d="M24 5 C24 5, 17 15, 17 21 C17 25.5 20.1 29 24 29 C27.9 29 31 25.5 31 21 C31 15 24 5 24 5 Z" fill="url(#wlsFlameGrad)"/>\
                <path d="M24 12 C24 12, 20 18, 20 22 C20 24.5 21.8 27 24 27 C26.2 27 28 24.5 28 22 C28 18 24 12 24 12 Z" fill="#FFFCE6"/>\
              </g>\
            </svg>\
          </div>\
          <p class="wls-mantra" id="wlsMantraText">॥ ஸ்ரீ முருகன் துணை ॥</p>\
          <div class="wls-names-heading">\
            <span class="wls-name-groom" id="wlsGroomName">Rajkumar</span>\
            <span class="wls-name-amp">&amp;</span>\
            <span class="wls-name-bride" id="wlsBrideName">Rubitha</span>\
          </div>\
          <div class="wls-divider">\
            <span class="wls-divider-line"></span>\
            <span class="wls-divider-gem">✦</span>\
            <span class="wls-divider-line"></span>\
          </div>\
          <p class="wls-subtitle">WEDDING INVITATION</p>\
          <div class="wls-progress-box">\
            <div class="wls-track">\
              <div class="wls-fill" id="wlsBarFill"></div>\
            </div>\
            <div class="wls-details">\
              <span class="wls-status-msg" id="wlsStatusMsg">Welcoming you to our celebration...</span>\
              <span class="wls-percentage" id="wlsPercentage">0%</span>\
            </div>\
          </div>\
          <div class="wls-action-area">\
            <button type="button" class="wls-enter-btn" id="wlsEnterBtn" aria-label="Open Invitation">\
              <span>Open Invitation ✦</span>\
            </button>\
          </div>\
        </div>';
      document.body.insertBefore(loadingEl, document.body.firstChild);
    }

    if (config && config.couple) {
      var groomName = config.couple.groom_name || 'Rajkumar';
      var brideName = config.couple.bride_name || 'Rubitha';
      var mantra = config.couple.mantra || '॥ ஸ்ரீ முருகன் துணை ॥';
      var gEl = document.getElementById('wlsGroomName');
      var bEl = document.getElementById('wlsBrideName');
      var mEl = document.getElementById('wlsMantraText');
      if (gEl) setTextContent(gEl, groomName);
      if (bEl) setTextContent(bEl, brideName);
      if (mEl) setTextContent(mEl, mantra);
    }

    var barFill = document.getElementById('wlsBarFill');
    var statusMsg = document.getElementById('wlsStatusMsg');
    var percentageEl = document.getElementById('wlsPercentage');
    var enterBtn = document.getElementById('wlsEnterBtn');

    var startTime = performance.now();
    var isDismissed = false;
    var targetProgress = 20;
    var currentProgress = 0;
    var rafId = null;

    // Trackers
    var domReady = (document.readyState === 'interactive' || document.readyState === 'complete');
    var windowReady = (document.readyState === 'complete');
    var fontsReady = false;
    var imagesRatio = 0;
    var audioReady = false;

    function updateTargetProgress() {
      var p = 0;
      if (domReady) p += 25;
      if (windowReady) p += 20;
      if (fontsReady) p += 20;
      p += Math.round(imagesRatio * 35);
      // Audio intentionally excluded: mobile browsers block audio preload without gesture

      targetProgress = Math.max(targetProgress, Math.min(100, p));
    }

    // 1. DOM & Window Load
    if (document.readyState === 'complete') {
      domReady = true;
      windowReady = true;
      updateTargetProgress();
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        domReady = true;
        updateTargetProgress();
      });
      window.addEventListener('load', function () {
        domReady = true;
        windowReady = true;
        updateTargetProgress();
      });
    }

    // 2. Fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        fontsReady = true;
        updateTargetProgress();
      }).catch(function () {
        fontsReady = true;
        updateTargetProgress();
      });
    } else {
      fontsReady = true;
      updateTargetProgress();
    }

    // 3. Images
    function monitorImages() {
      var imgs = Array.from(document.images || []);
      if (imgs.length === 0) {
        imagesRatio = 1;
        updateTargetProgress();
        return;
      }
      var loadedCount = 0;
      function checkImg() {
        loadedCount++;
        imagesRatio = Math.min(1, loadedCount / imgs.length);
        updateTargetProgress();
      }
      imgs.forEach(function (img) {
        if (img.complete && img.naturalWidth !== 0) {
          checkImg();
        } else {
          img.addEventListener('load', checkImg, { once: true });
          img.addEventListener('error', checkImg, { once: true });
        }
      });
      setTimeout(function () {
        imagesRatio = 1;
        updateTargetProgress();
      }, 3500);
    }
    monitorImages();

    // 4. Songs / Background Audio Deck
    // NOTE: On iOS/Android, audio does not preload without a user gesture.
    // We must NOT block progress on audio readiness — use a very short timeout.
    function monitorAudio() {
      audioReady = true; // Never block loading progress on audio
      updateTargetProgress();
    }
    monitorAudio();

    // 5. Dismissal Execution
    function executeDismissal() {
      if (isDismissed) return;
      isDismissed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (autoDismissTimer) {
        clearTimeout(autoDismissTimer);
        autoDismissTimer = null;
      }

      if (loadingEl) {
        loadingEl.classList.add('is-loaded');
        setTimeout(function () {
          loadingEl.classList.add('is-hidden');
        }, 900);
      }

      // 1. Start music playback
      if (window.__weddingStartMusic) {
        window.__weddingStartMusic();
      } else if (window.__weddingMusicPlayer) {
        window.__weddingMusicPlayer.play();
      }

      // 2. Start auto-scroll once website is fully revealed
      if (window.__weddingStartAutoScroll) {
        window.__weddingStartAutoScroll();
      }
    }

    // Tap / Click handling (gesture unlock for iOS & Chrome)
    var autoDismissTimer = null;
    function setupDismissInteractions() {
      if (enterBtn) {
        enterBtn.classList.add('is-ready');
        enterBtn.onclick = function (e) {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          // Play music immediately within the user gesture — browser allows this
          if (window.__weddingStartMusic) window.__weddingStartMusic();
          executeDismissal();
        };
      }
      loadingEl.onclick = function (e) {
        if (currentProgress >= 90) {
          // Play music immediately within the user gesture — browser allows this
          if (window.__weddingStartMusic) window.__weddingStartMusic();
          executeDismissal();
        }
      };
      // No auto-dismiss — user must explicitly click "Open Invitation".
      // This ensures music play() is always called within a real user gesture,
      // which is required for browser autoplay policy on production HTTPS sites.
    }

    // 6. Animation Step Loop
    function renderStep() {
      var elapsed = performance.now() - startTime;
      var timeMinRatio = Math.min(1, elapsed / minDurationMs);

      // Force 100% if maximum timeout reached
      if (elapsed >= maxTimeoutMs) {
        targetProgress = 100;
        timeMinRatio = 1;
      }

      // Constrain progress by min duration so animation doesn't vanish too fast
      var effectiveTarget = (targetProgress === 100) ? (timeMinRatio >= 1 ? 100 : Math.min(96, targetProgress * timeMinRatio)) : Math.min(95, targetProgress);

      var diff = effectiveTarget - currentProgress;
      if (diff > 0) {
        currentProgress += Math.max(0.4, diff * 0.14);
      }
      if (currentProgress > 100) currentProgress = 100;

      var roundP = Math.round(currentProgress);
      if (barFill) barFill.style.width = currentProgress.toFixed(1) + '%';
      if (percentageEl) percentageEl.textContent = roundP + '%';
      if (loadingEl) loadingEl.setAttribute('aria-valuenow', roundP);

      // Dynamic Auspicious Status Messages
      if (statusMsg) {
        if (roundP < 30) {
          statusMsg.textContent = 'Welcoming you to our celebration...';
        } else if (roundP < 60) {
          statusMsg.textContent = 'Harmonizing auspicious melodies...';
        } else if (roundP < 90) {
          statusMsg.textContent = 'Gathering sacred blessings...';
        } else if (roundP < 100) {
          statusMsg.textContent = 'Unveiling the celebration...';
        } else {
          statusMsg.textContent = 'Auspicious Beginnings ✨';
        }
      }

      if (roundP >= 100 && timeMinRatio >= 1 && (windowReady || elapsed > 2000)) {
        if (barFill) barFill.style.width = '100%';
        if (percentageEl) percentageEl.textContent = '100%';
        setupDismissInteractions();
      } else {
        rafId = requestAnimationFrame(renderStep);
      }
    }

    rafId = requestAnimationFrame(renderStep);
  }

  function init() {
    if (window.WEDDING_CONFIG) {
      setupWeddingLoadingScreen(window.WEDDING_CONFIG);
      applyWeddingConfig(window.WEDDING_CONFIG);
    } else {
      fetch('./wedding_config.json')
        .then(function (res) { return res.json(); })
        .then(function (cfg) {
          window.WEDDING_CONFIG = cfg;
          setupWeddingLoadingScreen(cfg);
          applyWeddingConfig(cfg);
        })
        .catch(function (err) {
          console.warn('Wedding config could not be fetched:', err);
        });
    }

    // Keep applied even if Framer hydrates, but skip live clock ticking mutations and our own custom UI
    var debounceTimer = null;
    var ignoreSelector = '.framer-1q8leab, .framer-hofxkl-container, .wedding-inner-card, .wedding-card-bg-texture, .wedding-card-bg-gradient, .wedding-event-grid, .wedding-photo-shell, .wedding-fade-up, .wedding-fade, .wedding-invitation-stage, .framer-uuu3on-container, #weddingCountdownTimerWrap, #wedding-countdown-venues, #wedding-music-widget, #weddingRSVPModal, #weddingRSVPStage, #weddingInstagramStage, #weddingAutoScrollFab, #weddingLoadingScreen';

    var observer = new MutationObserver(function (mutations) {
      if (isApplyingConfig) return;

      var shouldApply = false;
      for (var m = 0; m < mutations.length; m++) {
        var t = mutations[m].target;
        if (t && t.closest && t.closest(ignoreSelector)) {
          continue;
        }
        shouldApply = true;
        break;
      }
      if (!shouldApply) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (window.WEDDING_CONFIG && !isApplyingConfig) {
          applyWeddingConfig(window.WEDDING_CONFIG);
        }
      }, 300);
    });

    var mainEl = document.getElementById('main');
    if (mainEl) {
      observer.observe(mainEl, { childList: true, subtree: true });
    }

    // Framer finishes initial hydration in ~1-2 seconds. Disconnect observer after 6s to eliminate any possible loop.
    setTimeout(function () {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }, 6000);

    // Guaranteed hydration re-attachment checkpoints
    [400, 1000, 2000, 3500].forEach(function (delay) {
      setTimeout(function () {
        if (window.WEDDING_CONFIG) {
          applyWeddingConfig(window.WEDDING_CONFIG);
        }
      }, delay);
    });
  }

  window.addEventListener('load', function () {
    if (window.WEDDING_CONFIG) {
      applyWeddingConfig(window.WEDDING_CONFIG);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
