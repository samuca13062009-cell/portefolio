---
name: Samuel Camargo, Portefólio
description: A serious, human portfolio where real screenshots of real projects lead, framed by deep Atlantic bands.
colors:
  teal-accent: "#0A6C78"
  accent-ink: "#FFFFFF"
  mist-ground: "#EEF4F5"
  surface-white: "#FFFFFF"
  abyss-ink: "#0A2230"
  slate-muted: "#486270"
  hairline: "#CCDCE0"
  hairline-strong: "#6A8590"
  soft-wash: "#DAE7EA"
  error-red: "#A8201A"
  deep-ocean: "#0A2230"
  deep-ocean-raised: "#103245"
  foam-ink: "#EAF3F4"
  foam-muted: "#A9C3CB"
  deep-line: "#1E4255"
  deep-line-strong: "#4F7A8A"
  sunset: "#FF9A6B"
typography:
  display-xl:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6.4vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 118"
  display-lg:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 118"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 118"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 2.6vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 112"
  lead:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875em"
    fontWeight: 400
rounded:
  nav-mark: "2px"
  menu-item: "3px"
  field: "4px"
  focus: "4px"
  corner: "6px"
  panel: "8px"
spacing:
  gut-mobile: "16px"
  gut: "max(32px, calc((100% - 1176px) / 2))"
  column: "1240px"
  stack: "28px"
  row: "20px"
  feature-gap: "72px"
  section-mobile: "64px"
  section: "88px"
  band-head: "clamp(64px, 8vw, 112px)"
  band-hero: "clamp(72px, 10vw, 136px)"
  band-cta: "clamp(64px, 9vw, 120px)"
components:
  button-primary:
    backgroundColor: "{colors.teal-accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.corner}"
    padding: "0 26px"
    height: "52px"
  button-primary-on-deep:
    backgroundColor: "{colors.sunset}"
    textColor: "{colors.deep-ocean}"
    rounded: "{rounded.corner}"
    padding: "0 26px"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.abyss-ink}"
    rounded: "{rounded.corner}"
    padding: "0 26px"
    height: "52px"
  button-secondary-hover:
    backgroundColor: "{colors.soft-wash}"
  button-cta:
    backgroundColor: "{colors.sunset}"
    textColor: "{colors.deep-ocean}"
    rounded: "{rounded.corner}"
    padding: "0 30px"
    height: "56px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.abyss-ink}"
    rounded: "{rounded.corner}"
    padding: "0 20px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.abyss-ink}"
    textColor: "{colors.mist-ground}"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.abyss-ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "50px"
  screenshot-frame:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.corner}"
  panel:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 4vw, 44px)"
  deep-band:
    backgroundColor: "{colors.deep-ocean}"
    textColor: "{colors.foam-ink}"
    padding: "{spacing.band-head}"
  tint-band:
    backgroundColor: "{colors.soft-wash}"
    textColor: "{colors.abyss-ink}"
    padding: "{spacing.section}"
  social-button:
    backgroundColor: "{colors.deep-ocean-raised}"
    textColor: "{colors.foam-ink}"
    rounded: "{rounded.corner}"
    size: "68px"
  social-button-hover:
    backgroundColor: "{colors.sunset}"
    textColor: "{colors.deep-ocean}"
---

# Design System: Samuel Camargo, Portefólio

## Overview

**Creative North Star: "The Work on the Table, by the Atlantic"**

The site is the category standard for a developer portfolio, executed straight and at full craft, now set on the west-coast Atlantic at the end of the day. Real screenshots of shipped projects, framed and lifted, still carry almost all of the colour on a plain mist ground. Around them, full-width deep-ocean bands open every page and close the home page, drawn over with fine bathymetric contour lines and lit by a single sunset tone. No illustrative costume, no diagrams: the contours are a quiet chart texture confined to the bands, never a picture. The owner rejected a datasheet/chip world as cartoonish, and the build holds that line.

Density is relaxed and editorial. Content sits in a centred 1240px column while bands run edge to edge, padded by the same margin token so their content aligns with the column. Between bands, sections breathe (88px vertical padding) and are separated by single hairlines; experience, skills and "more projects" are quiet hairline rows rather than cards. "Além do código" sits on a light mist tint band with faint contours. Corners are nearly straight (6px). Motion is real but restrained: view transitions between pages, a shared-element cover morph, a circular reveal on theme or mode change, and a one-time word-focus on the home headline, all instant under reduced motion.

The system is themeable by design. Atlântico is the site default (documented as the frontmatter tokens) and one of four themes (Cobalto, Terminal, Editorial, Atlântico), each with light and dark variants. Themes swap colours, the deep-band palette and sun, the three font roles and the corner radius; layout, spacing, components and motion never change between themes.

**Key Characteristics:**
- Plain flat mist ground, one accent per theme, colour carried by screenshots.
- Full-width deep-ocean bands with contour lines for every page header, the home hero and the closing call to action.
- Wide, heavy display (Archivo 800 at 118% width) over a calm grotesque body (Hanken Grotesk).
- Nearly straight corners (6px) on every control and frame; 44px minimum targets.
- Hairline rows for lists; framed, softly lifted screenshots for work.
- Motion as continuity (page, cover, theme), always with an instant fallback.

## Colors

A restrained, cool near-neutral palette tinted toward the sea, one saturated teal accent on the ground, and a deep-ocean band palette with one warm sunset tone.

### Primary
- **Atlantic Teal** (teal-accent): primary button fill on the ground, link hover colour, focus ring, text selection, caret, the active-nav underline, list bullets, the success badge. In dark mode it becomes aqua (#5FD4DE) with deep text on it.

### Secondary
- **Sunset** (sunset): the accent inside deep bands. Inside a band the accent role is remapped to it, so the primary button, the focus ring, link hover and selection turn sunset there. It also colours the last word of the home headline, the hero role line, the closing CTA button and hovered social buttons.

### Neutral
- **Mist Ground** (mist-ground): the page ground. Flat, never textured or gradiented outside bands.
- **Surface White** (surface-white): raised containers on the ground: screenshot frames, the contact panel, the CV sheet, the pager, inputs, the theme menu.
- **Abyss Ink** (abyss-ink): body text, headings, secondary button borders, selected chip and selected theme fill.
- **Slate Muted** (slate-muted): secondary text: leads, summaries, metadata, dates, labels, prose paragraphs.
- **Hairline** (hairline): the default 1px divider between rows, sections, header and footer.
- **Hairline Strong** (hairline-strong): borders on interactive controls and the top rule that opens a list; also the colour of the faint contours on the tint band (22% opacity).
- **Soft Wash** (soft-wash): hover fill for secondary buttons and menu items, the fallback cover panel, and the ground of the tint band.
- **Error Red** (error-red): field error text and invalid borders (dark: #FF9C93).

### Deep band
- **Deep Ocean** (deep-ocean): the band ground. **Deep Ocean Raised** (deep-ocean-raised) is the surface and soft fill inside a band (facts card, social buttons). **Foam Ink** (foam-ink) and **Foam Muted** (foam-muted) are band text and leads. **Deep Line** and **Deep Line Strong** are band hairlines and control borders; deep-line-strong also draws the contour lines at 55% opacity. Bands keep their palette in both light and dark mode.

### Theme palettes (same roles, swapped values)
- **Atlântico dark:** ground #071A24, surface #0D2531, ink #E6F2F4, muted #9DB7C0, accent aqua #5FD4DE.
- **Cobalto:** ground #EEF0EA, ink #10130E, accent cobalt #2B4BFF (dark #9DADFF); deep #121A3A, sun lime #C9F26B. Bricolage Grotesque 700 over IBM Plex Sans.
- **Terminal:** ground #F1F5EE, ink #0B1A10, accent forest #0B6B34 (dark phosphor #4ADE80); deep #07120B, sun #FFD23F. JetBrains Mono display.
- **Editorial:** ground warm paper #F6F1E7, ink #1E1A16, accent brick #B3371A (dark coral #FF8A66); deep #241A14, sun #E8C24A. Fraunces 600 over Source Sans 3.

### Named Rules
**The Screenshots Carry the Colour Rule.** The interface stays near-neutral; saturated colour belongs to the real project screenshots, one accent, and the sunset inside bands. Nothing else competes with the work.

**The One Accent Per Ground Rule.** The ground has exactly one accent (teal); a deep band has exactly one (sunset), applied by remapping the accent role inside the band. Neither fills large surfaces except the CTA button and hovered social buttons.

**The Same Roles Rule.** A theme may only reassign values to the existing roles (bg, surface, ink, muted, line, line-strong, accent, accent-ink, inv-bg, inv-ink, soft, err, deep, deep-2, deep-ink, deep-muted, deep-line, deep-line-strong, sun), plus the display/body/mono families and the corner radius. Every theme ships a light and a dark variant that pass WCAG AA.

## Typography

**Display Font:** Archivo, variable width (with system-ui, sans-serif)
**Body Font:** Hanken Grotesk (with system-ui, sans-serif)
**Mono Font:** JetBrains Mono (code in legal pages only)

**Character:** A wide, heavy display (Archivo at weight 800, stretched to 118%) set tight, against a calm, legible grotesque body. It reads like a chart title: broad, sure and plain. Per theme the pairing changes: Cobalto Bricolage Grotesque 700 over IBM Plex Sans, Terminal JetBrains Mono display over IBM Plex Sans, Editorial Fraunces 600 over Source Sans 3 at a 17px base. All fonts are self-hosted woff2 with `font-display: swap`.

### Hierarchy
- **Display XL** (800, 118% width, clamp(2.75rem, 6.4vw, 5.5rem), 0.96): the home greeting and the Projects/CV page titles. On phones clamp(2.75rem, 13vw, 3.5rem).
- **Display LG** (800, 118% width, clamp(2.4rem, 5vw, 4.25rem), 1.02): page titles for About, a project, Contact, legal and error pages.
- **Headline** (800, 118% width, 2.5rem, 1.08): section headings; the CTA heading scales to clamp(2rem, 4vw, 3.25rem).
- **Title** (800, 112% width, clamp(1.625rem, 2.6vw, 2.25rem), 1.1, -0.01em): featured project names; card titles and pager names at 1.5rem; the brand name.
- **Lead** (400, 1.25rem, 1.55, muted, max 40rem): the paragraph under each page title.
- **Body** (400, 1rem, 1.55): running text; prose blocks at 1.1875rem (max 42rem), the human paragraph at 1.375rem (max 40rem).
- **Label** (500, 0.8125rem, muted, sentence case): definition-list terms in facts and project meta. Values below are 1.0625rem at 600.

### Named Rules
**The Wide Heavy Display Rule.** In Atlântico, display text is Archivo 800 at 118% width with -0.02em tracking and `text-wrap: balance`; titles, card names and the brand use 112% width. Headings never use the body family at display sizes.

**The Sentence Case Rule.** Labels, metadata and navigation are sentence case in the body family. The hero role line sits below the headline, not above it.

## Layout

The wrapper is full width. Header, footer and every non-band block are inset by the margin token (`gut`: the larger of 32px or the space that centres a 1240px column; 16px on phones). Full-width bands (`bleed`) run edge to edge and pad their content inline by the same token, so band content and column content share one left edge.

Pages are a vertical sequence: a deep band (hero on Home, page header elsewhere), then sections each opening with a 1px hairline and 88px vertical padding (64px on phones). Band headers pad clamp(64px, 8vw, 112px) top, clamp(56px, 7vw, 96px) bottom, with 48px below; the home hero pads clamp(72px, 10vw, 136px) / clamp(64px, 8vw, 112px); the closing CTA band clamp(64px, 9vw, 120px). A section after a band or after the tint band drops its top hairline.

Two-column grids are asymmetric and collapse to one column at 960px: the hero (1.55fr text / 1fr facts card or photo, bottom-aligned), featured projects (1.65fr screenshot / 1fr text, alternating sides), split sections (1fr heading / 2fr content). Contact is a single centred column (max 760px) under its band. The project list is a two-up grid (56px row gap) that becomes one column at 640px. Skills use an auto-fit grid of 170px minimum columns.

Rhythm: 28px stack gap, 20px row padding, 72px between featured projects (56px on phones), 80px before the "more projects" list. At 640px the header becomes a two-row grid and the hero facts card is hidden so the first screenshot appears sooner.

## Elevation & Depth

Mostly flat with one soft, deep lift, plus tonal depth from the bands. Shadow is reserved for objects that sit on the page: screenshot frames, the facts card, the hero photo, the contact panel, the CV sheet and the theme menu. Rows, lists, sections and buttons are flat and separated by hairlines. Bands add depth by tone and by the contour mask (public/img/contours.svg, generated by tools/make-contours.js, applied as a CSS mask so its colour comes from the theme).

### Shadow Vocabulary
- **Soft lift** (`box-shadow: 0 22px 48px -24px rgba(16,19,14,0.38), 0 2px 6px rgba(16,19,14,0.06)`): the ground shadow. Dark mode: `0 22px 48px -24px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.3)`.
- **Band lift** (`box-shadow: 0 24px 48px -24px rgba(0,0,0,0.6)`): the same role inside a deep band.

### Named Rules
**The One Shadow Rule.** One shadow role, soft and diffuse, swapped per context (ground, dark, band). Hover adds movement (a 4px lift on screenshot frames, 3px on social buttons), never a heavier shadow.

**The Contours Stay in the Water Rule.** Contour lines appear only on bands: deep-line-strong at 55% on deep bands, hairline-strong at 22% on the tint band. The mist ground between bands stays plain.

## Shapes

Nearly straight corners throughout. Two radius tokens, frame (`--r`) and control (`--rc`), are both 6px in Atlântico (Cobalto 6px, Editorial 4px, Terminal 3px). Screenshot frames, the facts card, the hero photo, the pager, the empty state and the theme menu take the frame radius; buttons, chips, header tools, social buttons and the success badge take the control radius. There are no pills. Inputs, the brand mark and the focus ring are 4px; contact panel and CV sheet 8px; theme menu items 3px; the active-nav mark 2px. Bands are square, full-bleed rectangles. Borders are 1px hairlines; the secondary button uses a 1.5px ink border. Bullets are 6px accent dots.

## Components

### Buttons
Tactile, plain and generous.
- **Shape:** control radius (6px), 52px tall, 0 26px padding, body family 600 at 1rem, 10px gap to an 18px stroke icon.
- **Primary:** accent fill, accent-ink text; inside a deep band that is sunset with deep-ocean text. Hover darkens via `brightness(0.93)`.
- **Secondary:** transparent with a 1.5px ink border (foam ink in a band); hover fills with soft wash (deep-ocean-raised in a band).
- **CTA:** the closing band's 56px "big" button, sunset fill with deep-ocean text.
- **Press:** 1px downward nudge. The trailing icon is pushed in the direction of the action on hover (arrow right 4px, download down 3px, external up-right 3px).

### Chips (project filters)
- **Style:** transparent, 1px strong-hairline border, control radius, 44px tall, 0 20px padding, 0.9375rem 500.
- **State:** hover darkens the border to ink; selected (`aria-pressed`) fills with ink and switches text to the ground colour at 600. Press scales to 0.96.

### Cards / Containers
- **Screenshot frame (signature):** 16:10, frame radius, clipped, surface fill, soft lift; the image is top-anchored `object-fit: cover`. Without a screenshot it becomes a soft-wash panel with the category and the project name set large in the display face, never a fake image.
- **Project card:** no box. Screenshot, then title (display 1.5rem, turns accent on hover), summary, metadata. Cards without images get a strong-hairline top rule instead.
- **Panel / CV sheet:** surface fill, 1px hairline, 8px radius, soft lift, fluid padding.
- **Rows:** a strong top rule, then 20px rows divided by hairlines; a 170px date column in muted tabular numerals.

### Inputs / Fields
- **Style:** surface fill, 1px strong-hairline border, 4px radius, 50px tall, 0 14px padding; labels above at 0.9375rem 600.
- **Focus:** border turns accent with the 3px accent outline at zero offset. Hover darkens the border to ink.
- **Error:** border and message in error red; the message slides in 4px.

### Navigation
- **Header:** brand (34px ink square mark at 4px radius plus name in display) left, five text links and square-cornered tools (theme menu, language, light/dark) right, hairline below. Links are 0.9375rem 500, 44px targets.
- **Active:** weight 600 plus a 2px accent underline (`nav-mark`) that slides between pages as a shared view-transition element.
- **Theme menu:** a surface popover at frame radius with soft lift, opening from the button (scale 0.97 and 6px rise via `@starting-style`). Selected option filled with ink.
- **Mobile:** header splits into two rows; the nav becomes a five-column grid at 0.875rem; the theme label is visually hidden.

### Deep band (signature)
A full-width deep-ocean block with contour lines, used for the home hero, every page header, the contact header and the closing CTA. Inside it the colour roles are remapped (ink to foam, accent to sunset, surface to deep-ocean-raised) so every component placed in it adapts without variants. Links are foam ink, sunset on hover.

### Tint band
A full-width soft-wash band with faint contours, used once on Home for "Além do código". It carries ordinary section content and drops the hairlines on either side.

### Social buttons (contact)
68px square icon buttons (60px on phones) in the contact band: deep-ocean-raised fill, deep-line-strong border, control radius, 28px stroke icons for email, LinkedIn and GitHub, each with an accessible label. Hover and focus fill with sunset, switch the icon to deep ocean and lift 3px. A muted location line with a pin icon sits below.

### Motion
Easing is one curve, `cubic-bezier(0.16, 1, 0.3, 1)`. Cross-document view transitions keep the header still, fade the old page out (0.14s) and lift the new one in 14px (0.45s). The project screenshot morphs from card to project page (0.62s). Theme and mode changes reveal the new look with a growing circle from the toggle (620ms). The home headline focuses in word by word (0.8s, 70ms stagger, blur 8px to 0) once. `prefers-reduced-motion` removes all of it.

## Do's and Don'ts

### Do:
- **Do** let real project screenshots be the largest and most colourful things on the page, in the 16:10 frame with the soft lift.
- **Do** open every page with a full-width deep band and pad band content by the same margin token as the column.
- **Do** rely on the role remapping inside bands (accent becomes sunset) rather than writing band-specific component variants.
- **Do** keep every theme to the shared role set, including the deep-band roles and sun, and ship both light and dark, checked to WCAG AA.
- **Do** use hairline rows (1px, strong rule on top) for experience, skills and secondary project lists.
- **Do** keep controls at the theme control radius with at least 44px targets (52px for buttons).
- **Do** give every motion an instant fallback under `prefers-reduced-motion`.

### Don't:
- **Don't** add illustrative metaphors, diagrams, datasheet or chip costumes; the owner rejected that world as cartoonish. Contour lines are a chart texture, not an illustration.
- **Don't** invent imagery: a project without a real screenshot gets the named soft-wash panel, never a mock or stock image.
- **Don't** put contours, textures or gradients on the plain ground between bands.
- **Don't** reintroduce pill (999px) shapes; corners come from the radius tokens.
- **Don't** add uppercase tracked eyebrows or kickers above headings.
- **Don't** use the sunset tone outside deep bands, or the accent as a large fill.
- **Don't** load fonts or assets from third-party origins; everything is self-hosted under a strict CSP.
