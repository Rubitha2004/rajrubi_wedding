#!/usr/bin/env python3
import json
import re
import os
import sys

def update_html_file(html_path, config):
    if not os.path.exists(html_path):
        return False

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    couple = config.get("couple", {})
    bride = couple.get("bride_name", "BRIDE")
    groom = couple.get("groom_name", "GROOM")
    title_fmt = couple.get("title_format", "{bride} WEDS {groom}")
    site_title = title_fmt.replace("{bride}", bride).replace("{groom}", groom)
    tagline = couple.get("tagline", "are getting married")
    connector = couple.get("connector", "WEDS")
    mantra = couple.get("mantra", "||ॐ श्री गणेशाय नमः||")
    hashtag = couple.get("hashtag", f"#{groom}ki{bride}")
    insta_handle = couple.get("instagram_handle", f"@{groom}_{bride}")

    b_fam = config.get("bride_family", {})
    b_gf = b_fam.get("grandfather_name", "[Bride's Grandfather Name]")
    b_gm = b_fam.get("grandmother_name", "[Bride's Grandmother Name]")
    b_f = b_fam.get("father_name", "[Bride's Father Name]")
    b_m = b_fam.get("mother_name", "[Bride's Mother Name]")
    b_note = b_fam.get("invite_note", "and beloved daughter of")

    g_fam = config.get("groom_family", {})
    g_gf = g_fam.get("grandfather_name", "[Grandfather's Name]")
    g_gm = g_fam.get("grandmother_name", "[Grandmother's Name]")
    g_f = g_fam.get("father_name", "[Father's Name]")
    g_m = g_fam.get("mother_name", "[Mother's Name]")
    g_blessing = g_fam.get("blessing_lead", "With the blessings of the Almighty and our beloved elders,")
    g_conn = g_fam.get("connector", "together with")
    g_note = g_fam.get("invite_note", "cordially invite you to grace the auspicious wedding ceremony of their beloved son")

    events = config.get("events", [])
    first_event = events[0] if events else {}
    ev_title = first_event.get("title", "Wedding Ceremony")
    ev_date = first_event.get("date", "15 December 2026")
    ev_time = first_event.get("time", "7:00 PM")
    ev_venue = first_event.get("venue", "TAJ HOTEL")
    ev_desc = first_event.get("description", "An evening of artistry, music, and family celebration.")
    ev_url = first_event.get("location_url", "https://maps.google.com/")

    story = config.get("our_story", {})
    story_text = story.get("text", "")

    rsvp = config.get("rsvp", {})
    rsvp_note = rsvp.get("note", "")

    # Heritage Template Handler
    if "heritage.css" in html:
        html = re.sub(r'<title>[^<]*</title>', f'<title>{site_title}</title>', html, flags=re.I)
        html = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{site_title}">', html, flags=re.I)
        html = re.sub(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{site_title}">', html, flags=re.I)
        html = re.sub(r'<h1 id="heroGroomName">[^<]*</h1>', f'<h1 id="heroGroomName">{groom}</h1>', html, flags=re.I)
        html = re.sub(r'<span id="heroConnector">[^<]*</span>', f'<span id="heroConnector">{connector}</span>', html, flags=re.I)
        html = re.sub(r'<h1 id="heroBrideName">[^<]*</h1>', f'<h1 id="heroBrideName">{bride}</h1>', html, flags=re.I)
        html = re.sub(r'<p id="heroTagline">[^<]*</p>', f'<p id="heroTagline">{tagline.upper()}</p>', html, flags=re.I)
        html = re.sub(r'<p class="blessing" id="invitationBlessing">[^<]*</p>', f'<p class="blessing" id="invitationBlessing">{mantra}</p>', html, flags=re.I)
        html = re.sub(r'<h3 class="invitation-person-name" id="invGroomName">[^<]*</h3>', f'<h3 class="invitation-person-name" id="invGroomName">{groom}</h3>', html, flags=re.I)
        html = re.sub(r'<h3 class="invitation-person-name" id="invBrideName">[^<]*</h3>', f'<h3 class="invitation-person-name" id="invBrideName">{bride}</h3>', html, flags=re.I)
        clean_handle = insta_handle.replace("@", "")
        html = re.sub(r'<a class="social-hashtag" id="socialHashtagLink"[^>]*>[^<]*</a>', f'<a class="social-hashtag" id="socialHashtagLink" href="https://instagram.com/{clean_handle}" target="_blank" rel="noreferrer">{hashtag}</a>', html, flags=re.I)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        return True

    # Static HTML replacements
    # Title & meta
    html = re.sub(r'<title>[^<]*</title>', f'<title>{site_title}</title>', html, flags=re.I)
    html = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{site_title}">', html, flags=re.I)
    html = re.sub(r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{site_title}">', html, flags=re.I)

    # Page 1: Hero Bride & Groom
    html = re.sub(
        r'(data-framer-name="BRIDE NAME"[^>]*><p[^>]*><span[^>]*>)[^<]*(</span>)',
        r'\g<1>' + bride + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(data-framer-name="GROOM NAME"[^>]*><p[^>]*><span[^>]*>)[^<]*(</span>)',
        r'\g<1>' + groom + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(data-framer-name="WEDS"[^>]*><foreignobject[^>]*><p[^>]*class="framer-text">)[^<]*(</p>)',
        r'\g<1>' + connector + r'\g<2>',
        html,
        flags=re.I
    )

    # Page 2: Names
    html = re.sub(
        r'(data-framer-name="KIRAN"[^>]*><h1[^>]*class="framer-text">)[^<]*(</h1>)',
        r'\g<1>' + bride + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(data-framer-name="GROOM NAME "[^>]*><h1[^>]*class="framer-text">)[^<]*(</h1>)',
        r'\g<1>' + groom + r'\g<2>',
        html,
        flags=re.I
    )

    # Page 2: Deity Image (Murugan)
    deity_img_src = couple.get("deity_image", "./murugan_image.png")
    def sub_deity(m):
        block = m.group(0)
        block = re.sub(r'src="[^"]+"', f'src="{deity_img_src}"', block)
        block = re.sub(r'srcset="[^"]+"', '', block)
        block = block.replace('data-framer-name="Ganesh ji"', 'data-framer-name="Murugan ji"')
        return block
    html = re.sub(r'<div[^>]*class="framer-uf450a"[^>]*>.*?</div>\s*</div>', sub_deity, html, flags=re.DOTALL)

    # Page 2: Mantra & SVG ViewBox
    html = re.sub(
        r'(<svg[^>]*class="framer-101gh07"[^>]*?)viewBox="[^"]*"',
        r'\g<1>viewBox="0 0 500 32"',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(class="framer-101gh07"[^>]*><foreignobject[^>]*><p[^>]*class="framer-text">)[^<]*(</p>)',
        r'\g<1>' + mantra + r'\g<2>',
        html,
        flags=re.I
    )

    # Page 2: Unified Family Invitation SVG (Desktop .framer-qq17fj)
    html = re.sub(
        r'(<svg[^>]*class="[^"]*framer-qq17fj[^"]*"[^>]*?)viewBox="[^"]*"',
        r'\g<1>viewBox="0 0 650 260"',
        html,
        flags=re.I
    )
    groom_fam_pattern = r"(<svg[^>]*class=\"[^\"]*framer-qq17fj[^\"]*\"[^>]*>\s*<foreignObject[^>]*>).*?(</foreignObject>)"
    groom_fam_replacement = (
        r"\g<1>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:16px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">With the blessings of the Almighty<br class=\"framer-text\">and our beloved elders,</p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:16px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">Son of<br class=\"framer-text\"><strong class=\"framer-text\">{g_f} &amp; {g_m}</strong><br class=\"framer-text\">and Grandson of<br class=\"framer-text\"><strong class=\"framer-text\">{g_gf} &amp; {g_gm}</strong></p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:15px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">and</p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:16px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">Daughter of<br class=\"framer-text\"><strong class=\"framer-text\">{b_f} &amp; {b_m}</strong><br class=\"framer-text\">and Granddaughter of<br class=\"framer-text\"><strong class=\"framer-text\">{b_gf} &amp; {b_gm}</strong></p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:16px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">cordially invite you to grace the auspicious wedding ceremony of their beloved</p>"
        r"\g<2>"
    )
    html = re.sub(groom_fam_pattern, groom_fam_replacement, html, flags=re.DOTALL | re.I)

    # Page 2: Mobile Unified Family Invitation SVG (.framer-o31tru)
    html = re.sub(
        r'(<svg[^>]*class="[^"]*framer-o31tru[^"]*"[^>]*?)viewBox="[^"]*"',
        r'\g<1>viewBox="0 0 477 240"',
        html,
        flags=re.I
    )
    mobile_groom_fam_pattern = r"(<svg[^>]*class=\"[^\"]*framer-o31tru[^\"]*\"[^>]*>\s*<foreignObject[^>]*>).*?(</foreignObject>)"
    mobile_groom_fam_replacement = (
        r"\g<1>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:13px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">With the blessings of the Almighty<br class=\"framer-text\">and our beloved elders,</p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:13px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">Son of<br class=\"framer-text\"><strong class=\"framer-text\">{g_f} &amp; {g_m}</strong><br class=\"framer-text\">and Grandson of<br class=\"framer-text\"><strong class=\"framer-text\">{g_gf} &amp; {g_gm}</strong></p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:12.5px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">and</p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:13px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">Daughter of<br class=\"framer-text\"><strong class=\"framer-text\">{b_f} &amp; {b_m}</strong><br class=\"framer-text\">and Granddaughter of<br class=\"framer-text\"><strong class=\"framer-text\">{b_gf} &amp; {b_gm}</strong></p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:12.5px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">cordially invite you to grace the auspicious wedding ceremony of their beloved</p>"
        r"\g<2>"
    )
    html = re.sub(mobile_groom_fam_pattern, mobile_groom_fam_replacement, html, flags=re.DOTALL | re.I)

# Page 2: Unified Responsive Invitation Stage
    wis_stage_html = f'''<!-- UNIFIED RESPONSIVE INVITATION STAGE -->
            <div class="wedding-invitation-stage" id="weddingInvitationStage">
              <div class="wis-deity-wrap">
                <img class="wis-deity-img" src="{deity_img_src}" alt="Lord Murugan" />
                <div class="wis-mantra" id="wisMantra">{mantra}</div>
              </div>
              <div class="wis-invite-wrap">
                <h1 class="wis-invite-title">Invite</h1>
              </div>
              <div class="wis-family-block" id="wisFamilyBlock">
                <p class="wis-blessings">With the blessings of the Almighty<br>and our beloved elders,</p>
                <p class="wis-lineage wis-groom-lineage">
                  Son of<br>
                  <strong class="wis-parents">{g_f} &amp; {g_m}</strong><br>
                  and Grandson of<br>
                  <strong class="wis-grandparents">{g_gf} &amp; {g_gm}</strong>
                </p>
                <p class="wis-connector">and</p>
                <p class="wis-lineage wis-bride-lineage">
                  Daughter of<br>
                  <strong class="wis-parents">{b_f} &amp; {b_m}</strong><br>
                  and Granddaughter of<br>
                  <strong class="wis-grandparents">{b_gf} &amp; {b_gm}</strong>
                </p>
                <p class="wis-invite-text">cordially invite you to grace the auspicious wedding ceremony of their beloved</p>
              </div>
              <div class="wis-couple-wrap">
                <h2 class="wis-name wis-groom" id="wisGroomName">{groom}</h2>
                <span class="wis-amp">&amp;</span>
                <h2 class="wis-name wis-bride" id="wisBrideName">{bride}</h2>
              </div>
              <div class="wis-events-badge" id="wisEventsBadge">
                <p>On the following events</p>
              </div>
            </div>'''

    if "weddingInvitationStage" in html:
        content_pattern = r'<!-- UNIFIED RESPONSIVE INVITATION STAGE -->.*?</div>\s*</div>\s*(?=<div class="framer-uf450a")'
        html = re.sub(content_pattern, wis_stage_html + '\n            ', html, flags=re.DOTALL)
    else:
        # Insert right before framer-uf450a inside framer-gj6wzl
        uf_marker = '<div class="framer-uf450a"'
        idx = html.find(uf_marker)
        if idx != -1:
            html = html[:idx] + wis_stage_html + '\n            ' + html[idx:]

    # Hide redundant bottom bride family SVGs
    html = re.sub(r"(<svg[^>]*class=\"[^\"]*framer-1jawtcx[^\"]*\"[^>]*style=\")", r"\g<1>display:none !important;", html, flags=re.I)
    html = re.sub(r"(<svg[^>]*class=\"[^\"]*framer-19me4mh[^\"]*\"[^>]*style=\")", r"\g<1>display:none !important;", html, flags=re.I)

    # Page 3: Event Slideshow
    html = re.sub(
        r'(<span style="color:rgb\(7, 95, 203\);opacity:0\.9;font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</span>)',
        r'\g<1>' + f"{groom} &amp; {bride}" + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(<div class="wedding-fade-up"[^>]*><h2[^>]*>)[^<]*(</h2>)',
        r'\g<1>' + ev_title + r'\g<2>',
        html,
        flags=re.I
    )
    # Event details spans
    html = re.sub(
        r'(stroke-width="1\.8"></path></svg></span><span style="font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</span></div><div style="display:inline-flex;align-items:center;gap:8px;color:rgb\(47, 36, 23\);opacity:0\.9"><span aria-hidden="true" style="display:inline-flex;color:rgb\(7, 95, 203\)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9")',
        r'\g<1>' + ev_date + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(stroke-linecap="round"></path></svg></span><span style="font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</span></div><div style="display:inline-flex;align-items:center;gap:8px;color:rgb\(47, 36, 23\);opacity:0\.9"><span aria-hidden="true" style="display:inline-flex;color:rgb\(7, 95, 203\)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21C12 21 19 14\.5)',
        r'\g<1>' + ev_time + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(stroke-width="1\.8"></circle></svg></span><span style="font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</span></div></div><p style="margin:0;color:rgb\(47, 36, 23\);opacity:0\.85;)',
        r'\g<1>' + ev_venue + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(<p style="margin:0;color:rgb\(47, 36, 23\);opacity:0\.85;font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</p><div style="display:flex;justify-content:flex-start;margin-top:6px">)',
        r'\g<1>' + ev_desc + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(<a class="wedding-cta-btn" href=")[^"]*(")',
        r'\g<1>' + ev_url + r'\g<2>',
        html,
        flags=re.I
    )

    # Page 5: Story
    if story_text:
        html = re.sub(
            r'(data-framer-name="PARAGRAPH STORY"[^>]*><p[^>]*class="framer-text"><br class="framer-text trailing-break"></p><p[^>]*class="framer-text">).*?(</p></div>)',
            r'\g<1>' + story_text + r'\g<2>',
            html,
            flags=re.DOTALL | re.I
        )

    # Page 6: RSVP Note
    if rsvp_note:
        html = re.sub(
            r'(data-framer-name="RSVP Note"[^>]*><p[^>]*class="framer-text">).*?(</p></div>)',
            r'\g<1>' + rsvp_note + r'\g<2>',
            html,
            flags=re.DOTALL | re.I
        )
        html = re.sub(
            r'(<p[^>]*class="[^"]*wedding-rsvp-note[^"]*"[^>]*>).*?(</p>)',
            r'\g<1>' + rsvp_note + r'\g<2>',
            html,
            flags=re.DOTALL | re.I
        )

    # Page 7: Hashtag & Handle
    html = re.sub(
        r'(data-framer-name="#"[^>]*><p[^>]*class="framer-text">)[^<]*(</p>)',
        r'\g<1>' + hashtag + r'\g<2>',
        html,
        flags=re.I
    )
    html = re.sub(
        r'(data-framer-name="THE ARTFUL INVITES"[^>]*><p[^>]*class="framer-text">)[^<]*(</p>)',
        r'\g<1>' + insta_handle + r'\g<2>',
        html,
        flags=re.I
    )

    # Audio element replacement (Music)
    music = config.get("music", {})
    music_file = music.get("file", "./Insecurities.mp3")
    html = re.sub(
        r'(<audio\s+[^>]*src=")[^"]*(")',
        r'\g<1>' + music_file + r'\g<2>',
        html,
        flags=re.I
    )

    # Page 6: RSVP Button wiring (Desktop & Mobile)
    def wire_rsvp_container(match):
        cont = match.group(0)
        # Add onclick to any button lacking it
        def wire_btn(bm):
            b_tag = bm.group(0)
            if 'onclick=' not in b_tag:
                b_tag = re.sub(r'<button\s+', '<button onclick="window.__weddingTriggerRSVP &amp;&amp; window.__weddingTriggerRSVP(event)" ', b_tag)
            return b_tag
        cont = re.sub(r'<button[^>]*>', wire_btn, cont)
        # Add span text to mobile button if it has empty text after SVG
        cont = re.sub(r'(</svg>)\s*(</button>)', r'\g<1><span style="margin-left:8px">RSVP on WhatsApp</span>\g<2>', cont)
        return cont

    html = re.sub(r'<div class="framer-1i3op6x-container"[^>]*>.*?</div><!--/\$-->\s*</div>', wire_rsvp_container, html, flags=re.DOTALL | re.I)

    # Page 7: In Countdown Page, add 2 Venue Locations (Wedding Ceremony & Reception)
    wedding_ev = next((e for e in events if "wedding" in e.get("title", "").lower()), None)
    if not wedding_ev:
        wedding_ev = {
            "title": "Wedding Ceremony",
            "date": "25 October 2026",
            "time": "06:30 AM",
            "venue": "Sivagiri Velayuthaswamy Temple",
            "location_url": "https://maps.app.goo.gl/WvQtLPBUnHoazgyu8"
        }
    reception_ev = next((e for e in events if "reception" in e.get("title", "").lower()), None)
    if not reception_ev:
        reception_ev = {
            "title": "Reception",
            "date": "24 October 2026",
            "time": "7:30 PM",
            "venue": "Uthami Ponnusamy Thirumana Mandapam",
            "location_url": "https://maps.app.goo.gl/YREAxuKnh2MqcZ3P7"
        }

    map_svg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>'
    venues_html = f'''<!-- WEDDING_COUNTDOWN_VENUES_START -->
          <div id="wedding-countdown-venues">
            <div class="wedding-venue-card wedding-card">
              <div class="wedding-venue-badge">Wedding Ceremony</div>
              <div class="wedding-venue-title">{wedding_ev.get("venue", "Sivagiri Velayuthaswamy Temple")}</div>
              <div class="wedding-venue-row datetime">
                <span class="wedding-venue-icon">📅</span>
                <span>{wedding_ev.get("date", "25 October 2026")} • {wedding_ev.get("time", "06:30 AM")}</span>
              </div>
              <div class="wedding-venue-row place">
                <span class="wedding-venue-icon">📍</span>
                <span>{wedding_ev.get("venue", "Sivagiri Velayuthaswamy Temple")}</span>
              </div>
              <a href="{wedding_ev.get("location_url", "https://maps.app.goo.gl/WvQtLPBUnHoazgyu8")}" target="_blank" rel="noopener noreferrer" class="wedding-venue-map-link">
                {map_svg}
                <span>View on Google Maps</span>
              </a>
            </div>
            <div class="wedding-venue-card reception-card">
              <div class="wedding-venue-badge">Reception</div>
              <div class="wedding-venue-title">{reception_ev.get("venue", "Uthami Ponnusamy Thirumana Mandapam")}</div>
              <div class="wedding-venue-row datetime">
                <span class="wedding-venue-icon">📅</span>
                <span>{reception_ev.get("date", "24 October 2026")} • {reception_ev.get("time", "7:30 PM")}</span>
              </div>
              <div class="wedding-venue-row place">
                <span class="wedding-venue-icon">📍</span>
                <span>{reception_ev.get("venue", "Uthami Ponnusamy Thirumana Mandapam")}</span>
              </div>
              <a href="{reception_ev.get("location_url", "https://maps.app.goo.gl/YREAxuKnh2MqcZ3P7")}" target="_blank" rel="noopener noreferrer" class="wedding-venue-map-link">
                {map_svg}
                <span>View on Google Maps</span>
              </a>
            </div>
          </div>
<!-- WEDDING_COUNTDOWN_VENUES_END -->'''

    # Ensure venue cards are located inside the Countdown section (.framer-s1eh8d)
    # Remove any misplaced venue cards from Page 7
    html = re.sub(r'<!-- WEDDING_COUNTDOWN_VENUES_START -->.*?<!-- WEDDING_COUNTDOWN_VENUES_END -->\s*', '', html, flags=re.DOTALL)
    html = re.sub(r'<div id="wedding-countdown-venues">.*?</div>\s*(?=<div class="framer-1d48xr8|<div class="ssr-variant hidden-1lmndnn">\s*<div class="framer-1d48xr8)', '', html, flags=re.DOTALL)

    # Insert venues_html right after framer-uuu3on-container inside framer-s1eh8d
    uuu_marker = '<div class="framer-uuu3on-container" data-code-component-plugin-id="84d4c1"'
    if uuu_marker in html:
        target_idx = html.find(uuu_marker)
        end_marker = '</div><!--/$-->\n          </div>'
        idx = html.find(end_marker, target_idx)
        if idx != -1:
            insert_pos = idx + len(end_marker)
            html = html[:insert_pos] + '\n          ' + venues_html + html[insert_pos:]
    elif 'data-framer-name="COUNTING THE DAYS"' in html:
        cd_marker = 'data-framer-name="COUNTING THE DAYS"'
        idx = html.find(cd_marker)
        close_idx = html.find('</div>', idx)
        if close_idx != -1:
            insert_pos = close_idx + len('</div>')
            html = html[:insert_pos] + '\n          ' + venues_html + html[insert_pos:]

    # Replace static "NaN" in countdown timer with computed initial values
    from datetime import datetime, timezone, timedelta
    try:
        target_dt = datetime(2026, 10, 25, 6, 30, tzinfo=timezone(timedelta(hours=5, minutes=30)))
        now_dt = datetime.now(timezone.utc)
        diff_sec = max(0, int((target_dt - now_dt).total_seconds()))
        init_days = diff_sec // 86400
        init_hours = (diff_sec % 86400) // 3600
        init_mins = (diff_sec % 3600) // 60
        init_secs = diff_sec % 60
        # In framer-uuu3on-container:
        def replace_nan_timer(match):
            block = match.group(0)
            parts = [f"{init_days:02d}", f"{init_hours:02d}", f"{init_mins:02d}", f"{init_secs:02d}"]
            p_idx = 0
            def sub_nan(nm):
                nonlocal p_idx
                if p_idx < len(parts):
                    val = parts[p_idx]
                    p_idx += 1
                    return f'>{val}<'
                return '>00<'
            block = re.sub(r'>NaN<', sub_nan, block)
            return block
        html = re.sub(r'<div class="framer-uuu3on-container".*?<!--/\$-->\s*</div>', replace_nan_timer, html, flags=re.DOTALL)
    except Exception as e:
        pass

    # Ensure scripts and container hiding styles are injected in <head>
    head_override_style = '''<style id="wedding-head-overrides">
	/* 1. Universal Fluid Responsiveness & Box Model */
	*, *::before, *::after {
		box-sizing: border-box;
	}
	html, body {
		width: 100% !important;
		max-width: 100vw !important;
		height: auto !important;
		min-height: 100% !important;
		overflow-x: hidden !important;
		margin: 0 !important;
		padding: 0 !important;
	}
	#main,
	.framer-m7ulU,
	.framer-m7ulU.framer-72rtr7,
	.framer-m7ulU.framer-8l4zif,
	.framer-m7ulU.framer-1lmndnn,
	.framer-m7ulU.framer-ayqnlw,
	.framer-m7ulU.framer-1fqmtcv,
	.framer-m7ulU .framer-ji2yub,
	.framer-ji2yub {
		width: 100% !important;
		max-width: 100% !important;
		min-width: 0 !important;
		height: auto !important;
		min-height: auto !important;
		max-height: none !important;
		aspect-ratio: auto !important;
		padding-bottom: 0 !important;
		margin-bottom: 0 !important;
		overflow-x: hidden !important;
	}
	.framer-ji2yub {
		display: flex !important;
		flex-direction: column !important;
	}

	/* Hidden Template Components */
	.framer-fwz7u-container,
	[data-framer-name="PAGE 5"], .framer-jc4od1,
	[data-framer-name="TOUCH HERE FOR MAGIC"], .framer-sdzv9p,
	.framer-evcqq4-container,
	.framer-s1eh8d .framer-1u82y34,
	.framer-s1eh8d .framer-evcqq4-container,
	.framer-1k8xm2k,
	.framer-1byyuno,
	.framer-1jawtcx,
	.framer-19me4mh,
	.framer-m7ulU .framer-1jawtcx,
	.framer-m7ulU .framer-19me4mh {
		display: none !important;
		height: 0 !important;
		min-height: 0 !important;
		max-height: 0 !important;
		overflow: hidden !important;
		visibility: hidden !important;
		pointer-events: none !important;
		margin: 0 !important;
		padding: 0 !important;
	}

	/* 2. PAGE 2: Unified Responsive Invitation Stage */
	.framer-m7ulU .framer-djxj6a,
	.framer-m7ulU .framer-gj6wzl {
		width: 100% !important;
		max-width: 100% !important;
	}
	@media (max-width: 809.98px) {
		.framer-m7ulU .framer-djxj6a,
		.framer-m7ulU .framer-gj6wzl {
			height: 844px !important;
		}
	}

	/* Completely hide all legacy Framer Page 2 elements so they never collide */
	.framer-gj6wzl > *:not([data-framer-background-image-wrapper="true"]):not(.wedding-invitation-stage):not(#weddingInvitationStage) {
		display: none !important;
		opacity: 0 !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}
	.framer-gj6wzl .framer-uf450a,
	.framer-gj6wzl .framer-101gh07,
	.framer-gj6wzl .framer-z74mwu,
	.framer-gj6wzl .framer-iyex8o,
	.framer-gj6wzl .framer-qq17fj,
	.framer-gj6wzl .framer-o31tru,
	.framer-gj6wzl .framer-1jawtcx,
	.framer-gj6wzl .framer-19me4mh,
	.framer-gj6wzl .framer-1k8xm2k,
	.framer-gj6wzl .framer-1byyuno,
	.framer-gj6wzl .framer-kjvwux,
	.framer-gj6wzl .framer-f0n6ls,
	.framer-gj6wzl .framer-wuej87,
	.framer-gj6wzl .framer-1jsww7o {
		display: none !important;
		opacity: 0 !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}

	.wedding-invitation-stage {
		position: absolute !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
		width: min(84%, 520px) !important;
		height: 76% !important;
		max-height: 80% !important;
		display: flex !important;
		flex-direction: column !important;
		align-items: center !important;
		justify-content: space-between !important;
		box-sizing: border-box !important;
		padding: clamp(6px, 1.2vh, 18px) clamp(8px, 2vw, 20px) !important;
		z-index: 15 !important;
		pointer-events: auto !important;
		text-align: center !important;
	}

	/* Deity & Mantra */
	.wis-deity-wrap {
		display: flex !important;
		flex-direction: column !important;
		align-items: center !important;
		justify-content: center !important;
		gap: clamp(2px, 0.3vh, 5px) !important;
		margin: 0 !important;
	}
	.wis-deity-img {
		width: clamp(32px, 4.2vh, 52px) !important;
		height: clamp(32px, 4.2vh, 52px) !important;
		object-fit: contain !important;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15)) !important;
	}
	.wis-mantra {
		font-family: "Philosopher", sans-serif !important;
		font-size: clamp(10px, 1.3vh, 13.5px) !important;
		font-weight: 700 !important;
		letter-spacing: 0.12em !important;
		color: rgb(211, 127, 165) !important;
		white-space: nowrap !important;
		text-align: center !important;
	}

	/* Luxurious Script "Invite" */
	.wis-invite-wrap {
		margin: 0 !important;
		padding: 0 !important;
		line-height: 1 !important;
	}
	.wis-invite-title {
		font-family: "Luxurious Script", cursive, sans-serif !important;
		font-size: clamp(42px, 6.8vh, 88px) !important;
		line-height: 0.95 !important;
		color: rgb(41, 134, 196) !important;
		margin: 0 !important;
		padding: 0 !important;
		font-weight: 400 !important;
		text-align: center !important;
	}

	/* Unified 5-part Family Lineage Block */
	.wis-family-block {
		font-family: "Abhaya Libre", serif !important;
		color: rgb(94, 94, 92) !important;
		line-height: 1.34 !important;
		width: 100% !important;
		max-width: 460px !important;
		margin: 0 auto !important;
		text-align: center !important;
	}
	.wis-family-block .wis-blessings {
		font-size: clamp(11px, 1.4vh, 14.5px) !important;
		line-height: 1.32 !important;
		margin: 0 0 clamp(3px, 0.6vh, 6px) 0 !important;
	}
	.wis-family-block .wis-lineage {
		font-size: clamp(11px, 1.4vh, 14.5px) !important;
		line-height: 1.3 !important;
		margin: 0 !important;
	}
	.wis-family-block .wis-parents {
		font-size: clamp(12.5px, 1.6vh, 16.5px) !important;
		font-weight: 700 !important;
		color: rgb(60, 60, 58) !important;
	}
	.wis-family-block .wis-grandparents {
		font-size: clamp(12px, 1.55vh, 16px) !important;
		font-weight: 700 !important;
		color: rgb(75, 75, 73) !important;
	}
	.wis-family-block .wis-connector {
		font-size: clamp(10.5px, 1.3vh, 13.5px) !important;
		font-style: italic !important;
		margin: clamp(2px, 0.3vh, 5px) 0 !important;
	}
	.wis-family-block .wis-invite-text {
		font-size: clamp(11px, 1.4vh, 14.5px) !important;
		line-height: 1.3 !important;
		margin: clamp(3px, 0.6vh, 7px) auto 0 auto !important;
		max-width: 420px !important;
	}

	/* Couple Names (Rajkumar & Rubitha) */
	.wis-couple-wrap {
		display: flex !important;
		flex-direction: column !important;
		align-items: center !important;
		justify-content: center !important;
		gap: clamp(0px, 0.2vh, 3px) !important;
		margin: clamp(2px, 0.5vh, 8px) 0 !important;
	}
	.wis-couple-wrap .wis-name {
		font-family: "Junge", serif !important;
		font-size: clamp(30px, 4.8vh, 64px) !important;
		line-height: 1 !important;
		letter-spacing: -0.04em !important;
		color: rgb(232, 190, 116) !important;
		margin: 0 !important;
		font-weight: 400 !important;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08) !important;
	}
	.wis-couple-wrap .wis-amp {
		font-family: "Amethysta", serif !important;
		font-size: clamp(16px, 2.3vh, 28px) !important;
		line-height: 1 !important;
		color: rgb(42, 134, 196) !important;
		margin: clamp(-2px, -0.3vh, 0px) 0 !important;
	}

	/* "On the following events" */
	.wis-events-badge {
		margin: clamp(2px, 0.3vh, 6px) 0 0 0 !important;
	}
	.wis-events-badge p {
		font-family: "EB Garamond", serif !important;
		font-weight: 700 !important;
		font-size: clamp(16px, 2.4vh, 28px) !important;
		color: rgb(42, 134, 196) !important;
		margin: 0 !important;
		text-align: center !important;
		letter-spacing: 0.02em !important;
	}

	/* 3. Visual Order: Countdown & Locations page (order 7), Instagram page (order 8) */
	.framer-m7ulU .framer-s1eh8d {
		order: 7 !important;
		height: auto !important;
		min-height: 980px !important;
		max-height: none !important;
		overflow: visible !important;
		position: relative !important;
		display: flex !important;
		flex-direction: column !important;
		align-items: center !important;
		justify-content: flex-start !important;
		padding-top: clamp(30px, 5vw, 60px) !important;
		padding-bottom: clamp(60px, 8vw, 100px) !important;
		box-sizing: border-box !important;
	}
	.framer-s1eh8d [data-framer-name="COUNTING THE DAYS"] {
		position: relative !important;
		top: auto !important;
		left: auto !important;
		transform: none !important;
		z-index: 20 !important;
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		width: 90% !important;
		max-width: 520px !important;
		height: auto !important;
		margin: 0 auto clamp(16px, 2.5vh, 26px) auto !important;
	}
	.framer-s1eh8d [data-framer-name="COUNTING THE DAYS"] p {
		font-family: "Luxurious Script", cursive, serif !important;
		font-size: clamp(44px, 6vw, 68px) !important;
		line-height: 1.1 !important;
		color: rgb(88, 11, 26) !important;
		text-align: center !important;
		margin: 0 !important;
	}
	.framer-s1eh8d .framer-uuu3on-container {
		position: relative !important;
		top: auto !important;
		left: auto !important;
		transform: none !important;
		z-index: 20 !important;
		width: 90% !important;
		max-width: 520px !important;
		height: auto !important;
		margin: 0 auto clamp(20px, 3vh, 36px) auto !important;
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
	}
	.framer-uuu3on-container,
	.framer-uuu3on-container > div,
	.framer-uuu3on-container > div > div,
	.framer-uuu3on-container [style*="display: flex"],
	.framer-uuu3on-container div {
		justify-content: center !important;
		text-align: center !important;
	}
	.framer-uuu3on-container > div {
		margin-left: auto !important;
		margin-right: auto !important;
		display: flex !important;
		justify-content: center !important;
	}
	.framer-uuu3on-container > div > div {
		justify-content: center !important;
		margin-left: auto !important;
		margin-right: auto !important;
	}
	.framer-s1eh8d #wedding-countdown-venues {
		position: relative !important;
		top: auto !important;
		left: auto !important;
		transform: none !important;
		width: 92% !important;
		max-width: 760px !important;
		display: flex !important;
		flex-direction: row !important;
		justify-content: center !important;
		align-items: stretch !important;
		gap: clamp(14px, 2vw, 24px) !important;
		margin: 0 auto !important;
		z-index: 30 !important;
		box-sizing: border-box !important;
		pointer-events: auto !important;
		isolation: isolate !important;
	}
	@media (max-width: 768px) {
		.framer-m7ulU .framer-s1eh8d {
			min-height: 1050px !important;
			padding-bottom: 80px !important;
		}
		.framer-s1eh8d #wedding-countdown-venues {
			flex-direction: column !important;
			max-width: 360px !important;
			width: 90% !important;
			gap: 16px !important;
		}
	}

	/* 4. PAGE 6: RSVP Section Responsiveness */
	.framer-m7ulU .framer-iobn9w,
	.framer-m7ulU .framer-2ws2lg {
		height: auto !important;
		min-height: clamp(520px, 60vh, 750px) !important;
		max-height: none !important;
		position: relative !important;
	}
	.framer-18d2840,
	.framer-m7ulU .framer-18d2840 {
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
		text-align: center !important;
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		width: 90% !important;
		max-width: 520px !important;
	}
	.framer-18d2840 p,
	.framer-m7ulU .framer-18d2840 p {
		text-align: center !important;
		width: 100% !important;
	}
	.framer-1i3op6x-container {
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
	}
	.framer-1i3op6x-container button {
		min-width: 220px !important;
		height: 48px !important;
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		padding: 10px 24px !important;
		border-radius: 999px !important;
		font-size: 15px !important;
		font-weight: 600 !important;
		letter-spacing: 0.02em !important;
		background: rgb(88, 11, 26) !important;
		color: #ffffff !important;
		cursor: pointer !important;
		box-shadow: 0 4px 14px rgba(88, 11, 26, 0.35) !important;
		transition: transform 0.2s ease, box-shadow 0.2s ease !important;
	}
	.framer-1i3op6x-container button:hover {
		transform: scale(1.03) !important;
		box-shadow: 0 6px 20px rgba(88, 11, 26, 0.45) !important;
	}

	/* 5. PAGE 7: Instagram / Hashtag Section */
	.framer-m7ulU .framer-131l9v1 {
		order: 8 !important;
		position: relative !important;
		overflow: hidden !important;
		height: 580px !important;
		min-height: 460px !important;
		max-height: 700px !important;
		margin-bottom: 0 !important;
		padding-bottom: 0 !important;
	}
	@media (max-width: 768px) {
		.framer-m7ulU .framer-131l9v1 {
			height: 480px !important;
			min-height: 420px !important;
			max-height: 550px !important;
		}
	}

	/* 6. Floating Music Player */
	#wedding-music-widget {
		max-width: calc(100vw - 24px) !important;
		left: 50% !important;
		transform: translateX(-50%) !important;
		bottom: 16px !important;
		z-index: 9999 !important;
	}
  </style>'''

    scripts_to_inject = head_override_style + '\n\t<link rel="stylesheet" href="./assets/css/wedding_rsvp.css">\n\t<script src="./wedding_config.js"></script>\n\t<script src="./assets/js/wedding_loader.js"></script>\n'
    
    # Remove old style tag if present
    html = re.sub(r'<style>\.framer-fwz7u-container\{display:none!important;\}</style>\s*', '', html)
    html = re.sub(r'<style id="wedding-head-overrides">.*?</style>\s*', '', html, flags=re.DOTALL)
    html = re.sub(r'<link rel="stylesheet" href="\.?/assets/css/wedding_rsvp\.css">\s*', '', html)
    
    if './wedding_config.js' not in html:
        head_pos = html.find('</head>')
        if head_pos != -1:
            html = html[:head_pos] + '\t' + scripts_to_inject + html[head_pos:]
    else:
        # Re-inject latest style and rsvp css right before wedding_config.js script
        js_marker = '<script src="./wedding_config.js">'
        idx = html.find(js_marker)
        if idx != -1:
            html = html[:idx] + head_override_style + '\n\t<link rel="stylesheet" href="./assets/css/wedding_rsvp.css">\n\t' + html[idx:]

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    return True

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, "wedding_config.json")
    js_path = os.path.join(base_dir, "wedding_config.js")

    if not os.path.exists(json_path):
        print(f"Error: Could not find {json_path}")
        sys.exit(1)

    print("Loading wedding_config.json...")
    with open(json_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    # 1. Update wedding_config.js
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("window.WEDDING_CONFIG = " + json.dumps(config, indent=2, ensure_ascii=False) + ";\n")
    print("✓ Synchronized wedding_config.js")

    # 2. Update HTML templates
    target_files = ["index.html"]
    updated_files = []
    for tf in target_files:
        full_path = os.path.join(base_dir, tf)
        if os.path.exists(full_path):
            if update_html_file(full_path, config):
                updated_files.append(tf)

    couple = config.get("couple", {})
    bride = couple.get("bride_name", "BRIDE")
    groom = couple.get("groom_name", "GROOM")
    title_fmt = couple.get("title_format", "{bride} WEDS {groom}")
    site_title = title_fmt.replace("{bride}", bride).replace("{groom}", groom)
    hashtag = couple.get("hashtag", f"#{groom}Weds{bride}")

    events = config.get("events", [])
    first_event = events[0] if events else {}
    ev_title = first_event.get("title", "Wedding Ceremony")
    ev_date = first_event.get("date", "15 December 2026")
    ev_venue = first_event.get("venue", "TAJ HOTEL")

    music = config.get("music", {})
    music_title = music.get("title", "Insecurities")
    music_file = music.get("file", "./Insecurities.mp3")

    print("\n✓ Successfully updated templates:")
    for uf in updated_files:
        print(f"  • {uf}")

    print(f"\nAll details from wedding_config.json have been applied across all templates:")
    print(f"  • Couple: {groom} & {bride}")
    print(f"  • Title: {site_title}")
    print(f"  • Hashtag: {hashtag}")
    print(f"  • Music: {music_title} ({music_file})")
    print(f"  • Primary Event: {ev_title} on {ev_date} at {ev_venue}")

if __name__ == "__main__":
    main()
