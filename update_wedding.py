#!/usr/bin/env python3
import json
import re
import os
import sys
from html import escape as html_escape


def html_text(value):
    return html_escape(str(value or ""), quote=False).replace("\r\n", "<br>").replace("\n", "<br>")


def group_replacement(value, attribute=False):
    encoded = html_escape(str(value or ""), quote=attribute)
    return lambda match: match.group(1) + encoded + match.group(2)


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
    invitation = config.get("invitation", {})
    invitation_title = invitation.get("title", "Invite")
    events_heading = invitation.get("events_heading", "On the following events")
    blessing_subtitle = invitation.get("blessing_subtitle", "")

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
    html = re.sub(r'<title>[^<]*</title>', lambda _: f'<title>{html_text(site_title)}</title>', html, flags=re.I)
    html = re.sub(r'<meta property="og:title" content="[^"]*">', lambda _: f'<meta property="og:title" content="{html_escape(site_title, quote=True)}">', html, flags=re.I)
    html = re.sub(r'<meta name="twitter:title" content="[^"]*">', lambda _: f'<meta name="twitter:title" content="{html_escape(site_title, quote=True)}">', html, flags=re.I)

    # Page 1: Hero Bride & Groom
    html = re.sub(
        r'(data-framer-name="BRIDE NAME"[^>]*><p[^>]*><span[^>]*>)[^<]*(</span>)',
        group_replacement(bride),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(data-framer-name="GROOM NAME"[^>]*><p[^>]*><span[^>]*>)[^<]*(</span>)',
        group_replacement(groom),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(data-framer-name="WEDS"[^>]*><foreignobject[^>]*><p[^>]*class="framer-text">)[^<]*(</p>)',
        group_replacement(connector),
        html,
        flags=re.I
    )

    # Page 2: Names
    html = re.sub(
        r'(data-framer-name="KIRAN"[^>]*><h1[^>]*class="framer-text">)[^<]*(</h1>)',
        group_replacement(bride),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(data-framer-name="GROOM NAME "[^>]*><h1[^>]*class="framer-text">)[^<]*(</h1>)',
        group_replacement(groom),
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
        group_replacement(mantra),
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
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:16px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">{html_text(g_blessing)}</p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:16px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">Son of<br class=\"framer-text\"><strong class=\"framer-text\">{g_f} &amp; {g_m}</strong><br class=\"framer-text\">and Grandson of<br class=\"framer-text\"><strong class=\"framer-text\">{g_gf} &amp; {g_gm}</strong></p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:15px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">{html_text(g_conn)}</p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:16px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">{html_text(b_note or 'Daughter of')}<br class=\"framer-text\"><strong class=\"framer-text\">{html_text(b_f)} &amp; {html_text(b_m)}</strong><br class=\"framer-text\">and Granddaughter of<br class=\"framer-text\"><strong class=\"framer-text\">{html_text(b_gf)} &amp; {html_text(b_gm)}</strong></p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:16px;--framer-line-height:1.4em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">{html_text(g_note)}</p>"
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
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:13px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">{html_text(g_blessing)}</p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:13px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">Son of<br class=\"framer-text\"><strong class=\"framer-text\">{g_f} &amp; {g_m}</strong><br class=\"framer-text\">and Grandson of<br class=\"framer-text\"><strong class=\"framer-text\">{g_gf} &amp; {g_gm}</strong></p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:12.5px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">{html_text(g_conn)}</p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:13px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">{html_text(b_note or 'Daughter of')}<br class=\"framer-text\"><strong class=\"framer-text\">{html_text(b_f)} &amp; {html_text(b_m)}</strong><br class=\"framer-text\">and Granddaughter of<br class=\"framer-text\"><strong class=\"framer-text\">{html_text(b_gf)} &amp; {html_text(b_gm)}</strong></p>"
        f"<p dir=\"auto\" style=\"--font-selector:R0Y7QWJoYXlhIExpYnJlLXJlZ3VsYXI=;--framer-font-family:&quot;Abhaya Libre&quot;, &quot;Abhaya Libre Placeholder&quot;, serif;--framer-font-size:12.5px;--framer-font-weight:400;--framer-line-height:1.35em;--framer-text-alignment:center;--framer-text-color:rgb(94, 94, 92)\" class=\"framer-text\">{html_text(g_note)}</p>"
        r"\g<2>"
    )
    html = re.sub(mobile_groom_fam_pattern, mobile_groom_fam_replacement, html, flags=re.DOTALL | re.I)

# Page 2: Unified Responsive Invitation Stage
    wis_stage_html = f'''<!-- UNIFIED RESPONSIVE INVITATION STAGE -->
            <div class="wedding-invitation-stage" id="weddingInvitationStage">
              <div class="wis-deity-wrap">
                <img class="wis-deity-img" src="{html_escape(str(deity_img_src), quote=True)}" alt="Lord Murugan" />
                <div class="wis-mantra" id="wisMantra">{html_text(mantra)}</div>
              </div>
              <div class="wis-invite-wrap">
                <h1 class="wis-invite-title">{html_text(invitation_title)}</h1>
              </div>
              <div class="wis-family-block" id="wisFamilyBlock">
                <p class="wis-blessings">{html_text(g_blessing)}</p>
                <p class="wis-lineage wis-groom-lineage">
                  Son of<br>
                  <strong class="wis-parents">{html_text(g_f)} &amp; {html_text(g_m)}</strong><br>
                  and Grandson of<br>
                  <strong class="wis-grandparents">{html_text(g_gf)} &amp; {html_text(g_gm)}</strong>
                </p>
                {f'<p class="wis-connector">{html_text(blessing_subtitle)}</p>' if blessing_subtitle else ''}
                <p class="wis-connector">{html_text(g_conn)}</p>
                <p class="wis-lineage wis-bride-lineage">
                  {html_text(b_note or "Daughter of")}<br>
                  <strong class="wis-parents">{html_text(b_f)} &amp; {html_text(b_m)}</strong><br>
                  and Granddaughter of<br>
                  <strong class="wis-grandparents">{html_text(b_gf)} &amp; {html_text(b_gm)}</strong>
                </p>
                <p class="wis-invite-text">{html_text(g_note)}</p>
              </div>
              <div class="wis-couple-wrap">
                <h2 class="wis-name wis-groom" id="wisGroomName">{html_text(groom)}</h2>
                <span class="wis-amp">&amp;</span>
                <h2 class="wis-name wis-bride" id="wisBrideName">{html_text(bride)}</h2>
              </div>
              <div class="wis-events-badge" id="wisEventsBadge">
                <p>{html_text(events_heading)}</p>
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
    def hide_family_svg(match):
        style = re.sub(r"(?:display:none\s*!important;)+", "", match.group(2), flags=re.I)
        return match.group(1) + "display:none !important;" + style + match.group(3)

    html = re.sub(
        r'(<svg[^>]*class="[^"]*framer-(?:1jawtcx|19me4mh)[^"]*"[^>]*style=")(.*?)(")',
        hide_family_svg,
        html,
        flags=re.I | re.DOTALL
    )

    # Page 3: Event Slideshow
    html = re.sub(
        r'(<span style="color:rgb\(7, 95, 203\);opacity:0\.9;font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</span>)',
        group_replacement(f"{groom} & {bride}"),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(<div class="wedding-fade-up"[^>]*><h2[^>]*>)[^<]*(</h2>)',
        group_replacement(ev_title),
        html,
        flags=re.I
    )
    # Event details spans
    html = re.sub(
        r'(stroke-width="1\.8"></path></svg></span><span style="font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</span></div><div style="display:inline-flex;align-items:center;gap:8px;color:rgb\(47, 36, 23\);opacity:0\.9"><span aria-hidden="true" style="display:inline-flex;color:rgb\(7, 95, 203\)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9")',
        group_replacement(ev_date),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(stroke-linecap="round"></path></svg></span><span style="font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</span></div><div style="display:inline-flex;align-items:center;gap:8px;color:rgb\(47, 36, 23\);opacity:0\.9"><span aria-hidden="true" style="display:inline-flex;color:rgb\(7, 95, 203\)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21C12 21 19 14\.5)',
        group_replacement(ev_time),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(stroke-width="1\.8"></circle></svg></span><span style="font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</span></div></div><p style="margin:0;color:rgb\(47, 36, 23\);opacity:0\.85;)',
        group_replacement(ev_venue),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(<p style="margin:0;color:rgb\(47, 36, 23\);opacity:0\.85;font-size:15px;line-height:1\.35em;letter-spacing:0em;font-family:&quot;Jost-Medium&quot;, sans-serif">)[^<]*(</p><div style="display:flex;justify-content:flex-start;margin-top:6px">)',
        group_replacement(ev_desc),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(<a class="wedding-cta-btn" href=")[^"]*(")',
        group_replacement(ev_url, attribute=True),
        html,
        flags=re.I
    )

    # Page 5: Story
    if story_text:
        html = re.sub(
            r'(data-framer-name="PARAGRAPH STORY"[^>]*><p[^>]*class="framer-text"><br class="framer-text trailing-break"></p><p[^>]*class="framer-text">).*?(</p></div>)',
            group_replacement(story_text),
            html,
            flags=re.DOTALL | re.I
        )

    # Page 6: RSVP Note
    if rsvp_note:
        html = re.sub(
            r'(data-framer-name="RSVP Note"[^>]*><p[^>]*class="framer-text">).*?(</p></div>)',
            group_replacement(rsvp_note),
            html,
            flags=re.DOTALL | re.I
        )
        html = re.sub(
            r'(<p[^>]*class="[^"]*wedding-rsvp-note[^"]*"[^>]*>).*?(</p>)',
            group_replacement(rsvp_note),
            html,
            flags=re.DOTALL | re.I
        )

    # Page 7: Hashtag & Handle
    html = re.sub(
        r'(data-framer-name="#"[^>]*><p[^>]*class="framer-text">)[^<]*(</p>)',
        group_replacement(hashtag),
        html,
        flags=re.I
    )
    html = re.sub(
        r'(data-framer-name="THE ARTFUL INVITES"[^>]*><p[^>]*class="framer-text">)[^<]*(</p>)',
        group_replacement(insta_handle),
        html,
        flags=re.I
    )

    # Audio element replacement (Music)
    music = config.get("music", {})
    playlist = music.get("playlist", [])
    first_track = playlist[0] if playlist else {}
    music_file = first_track.get("file") or music.get("file", "./music/Insecurities.mp3")
    html = re.sub(
        r'(<audio\s+[^>]*src=")[^"]*(")',
        group_replacement(music_file, attribute=True),
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
              <div class="wedding-venue-title">{html_text(wedding_ev.get("venue", "Sivagiri Velayuthaswamy Temple"))}</div>
              <div class="wedding-venue-row datetime">
                <span class="wedding-venue-icon">📅</span>
                <span>{html_text(wedding_ev.get("date", "25 October 2026"))} • {html_text(wedding_ev.get("time", "06:30 AM"))}</span>
              </div>
              <div class="wedding-venue-row place">
                <span class="wedding-venue-icon">📍</span>
                <span>{html_text(wedding_ev.get("venue", "Sivagiri Velayuthaswamy Temple"))}</span>
              </div>
              <a href="{html_escape(wedding_ev.get("location_url", "https://maps.app.goo.gl/WvQtLPBUnHoazgyu8"), quote=True)}" target="_blank" rel="noopener noreferrer" class="wedding-venue-map-link">
                {map_svg}
                <span>View on Google Maps</span>
              </a>
            </div>
            <div class="wedding-venue-card reception-card">
              <div class="wedding-venue-badge">Reception</div>
              <div class="wedding-venue-title">{html_text(reception_ev.get("venue", "Uthami Ponnusamy Thirumana Mandapam"))}</div>
              <div class="wedding-venue-row datetime">
                <span class="wedding-venue-icon">📅</span>
                <span>{html_text(reception_ev.get("date", "24 October 2026"))} • {html_text(reception_ev.get("time", "7:30 PM"))}</span>
              </div>
              <div class="wedding-venue-row place">
                <span class="wedding-venue-icon">📍</span>
                <span>{html_text(reception_ev.get("venue", "Uthami Ponnusamy Thirumana Mandapam"))}</span>
              </div>
              <a href="{html_escape(reception_ev.get("location_url", "https://maps.app.goo.gl/YREAxuKnh2MqcZ3P7"), quote=True)}" target="_blank" rel="noopener noreferrer" class="wedding-venue-map-link">
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
        print(f"Warning: Could not calculate initial countdown: {e}", file=sys.stderr)

    # Layout CSS lives statically in index.html. Updater handles content and data injection only.

    # Layout CSS lives in index.html. Updater changes content/assets only.
    runtime_assets = (
        '\t<link rel="stylesheet" href="./assets/css/wedding_rsvp.css">\n'
        '\t<script src="./wedding_config.js"></script>\n'
        '\t<script src="./assets/js/wedding_loader.js?v=24"></script>\n'
    )
    if './wedding_config.js' not in html:
        head_pos = html.find('</head>')
        if head_pos != -1:
            html = html[:head_pos] + runtime_assets + html[head_pos:]
    else:
        # Add missing runtime assets without touching existing layout styles.
        js_marker = '<script src="./wedding_config.js">'
        idx = html.find(js_marker)
        if idx != -1 and './assets/css/wedding_rsvp.css' not in html:
            html = html[:idx] + '\t<link rel="stylesheet" href="./assets/css/wedding_rsvp.css">\n\t' + html[idx:]
        if 'assets/js/wedding_loader.js' not in html and idx != -1:
            end_idx = html.find('</script>', idx)
            if end_idx != -1:
                end_idx += len('</script>')
                html = html[:end_idx] + '\n\t<script src="./assets/js/wedding_loader.js?v=24"></script>' + html[end_idx:]

    html = re.sub(
        r'(<script src="\./assets/js/wedding_loader\.js)(?:\?v=\d+)?(")',
        r'\1?v=24\2',
        html
    )

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
    print("[OK] Synchronized wedding_config.js")

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
    playlist = music.get("playlist", [])
    first_track = playlist[0] if playlist else {}
    music_title = first_track.get("title") or music.get("title", "Insecurities")
    music_file = first_track.get("file") or music.get("file", "./music/Insecurities.mp3")
    playlist_info = f" ({len(playlist)} tracks)" if playlist else ""

    print("\n[OK] Successfully updated templates:")
    for uf in updated_files:
        print(f"  - {uf}")

    print(f"\nAll details from wedding_config.json have been applied across all templates:")
    print(f"  - Couple: {groom} & {bride}")
    print(f"  - Title: {site_title}")
    print(f"  - Hashtag: {hashtag}")
    print(f"  - Music: {music_title} ({music_file}){playlist_info}")
    print(f"  - Primary Event: {ev_title} on {ev_date} at {ev_venue}")

if __name__ == "__main__":
    main()
