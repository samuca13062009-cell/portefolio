---
name: Samuel Camargo, Portefólio
description: A serious, human portfolio where real screenshots of real projects lead, framed by deep bands dressed in the colours of the projects themselves.
colors:
  night-navy: "#16224D"
  accent-ink: "#FFFFFF"
  paper-ground: "#F6F0E6"
  cream-surface: "#FFFAF3"
  night-ink: "#1A1930"
  dusk-muted: "#524D60"
  sand-hairline: "#E2D7C5"
  driftwood-line: "#8A7A63"
  linen-wash: "#EFE6D8"
  brick-error: "#A3261B"
  deep-night: "#0A1024"
  deep-night-raised: "#121A35"
  moon-ink: "#EEF0F8"
  moon-muted: "#B3BAD2"
  deep-line: "#1A2445"
  deep-line-strong: "#6F7BA8"
  lamp-gold: "#F6C765"
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
    letterSpacing: "-0.03em"
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
    backgroundColor: "{colors.night-navy}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.corner}"
    padding: "0 26px"
    height: "52px"
  button-primary-on-deep:
    backgroundColor: "{colors.lamp-gold}"
    textColor: "{colors.deep-night}"
    rounded: "{rounded.corner}"
    padding: "0 26px"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.corner}"
    padding: "0 26px"
    height: "52px"
  button-secondary-hover:
    backgroundColor: "{colors.linen-wash}"
  button-cta:
    backgroundColor: "{colors.lamp-gold}"
    textColor: "{colors.deep-night}"
    rounded: "{rounded.corner}"
    padding: "0 30px"
    height: "56px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.corner}"
    padding: "0 20px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.paper-ground}"
  input:
    backgroundColor: "{colors.cream-surface}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "50px"
  screenshot-frame:
    backgroundColor: "{colors.cream-surface}"
    rounded: "{rounded.corner}"
  panel:
    backgroundColor: "{colors.cream-surface}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 4vw, 44px)"
  deep-band:
    backgroundColor: "{colors.deep-night}"
    textColor: "{colors.moon-ink}"
    padding: "{spacing.band-head}"
  tint-band:
    backgroundColor: "{colors.linen-wash}"
    textColor: "{colors.night-ink}"
    padding: "{spacing.section}"
  social-button:
    backgroundColor: "{colors.deep-night-raised}"
    textColor: "{colors.moon-ink}"
    rounded: "{rounded.corner}"
    size: "68px"
  social-button-hover:
    backgroundColor: "{colors.lamp-gold}"
    textColor: "{colors.deep-night}"
---

# Design System: Samuel Camargo, Portefólio

## Overview

**Creative North Star: "The Work on the Table, in Its Own Colours"**

The site is the category standard for a developer portfolio, executed straight and at full craft. Real screenshots of shipped projects, framed and lifted, carry almost all of the colour on a plain ground. Around them, full-width deep bands open every page and close the home page, drawn over with fine contour lines and lit by a single bright "sun" tone. The palette is not invented: every theme is lifted from one of the owner's own projects, and the default, O Polvo, wears the restaurant site's night navy, lamp gold and warm paper. No illustrative costume, no diagrams: the contours are a quiet chart texture confined to the bands, never a picture. The owner rejected a datasheet/chip world as cartoonish, and the build holds that line.

Density is relaxed and editorial. Content sits in a centred 1240px column while bands run edge to edge, padded by the same margin token so their content aligns with the column. Between bands, sections breathe (88px vertical padding) and are separated by single hairlines; experience, skills and "more projects" are quiet hairline rows rather than cards. "Além do código" sits on a light tint band with faint contours. Corners are nearly straight (6px). Motion is real but restrained: view transitions between pages, a shared-element cover morph, a circular reveal on theme or mode change, and a one-time word-focus on the home headline, all instant under reduced motion.

The system is themeable by colour only. O Polvo is the site default (documented as the frontmatter tokens) and one of four themes (O Polvo, Saltaplanetas, SkillConnect, Arduino), each with light and dark variants and its own deep-band palette. Themes swap colour values only; type, radius, layout, spacing, components and motion are shared by all four.

**Key Characteristics:**
- Plain flat ground, one accent per theme, colour carried by screenshots.
- Every theme's palette comes from a real project of the owner's; nothing is a stock palette.
- Full-width deep bands with contour lines for every page header, the home hero and the closing call to action.
- Wide, heavy display (Archivo 800 at 118% width) over a calm grotesque body (Hanken Grotesk), in every theme.
- Nearly straight corners (6px) on every control and frame; 44px minimum targets.
- Hairline rows for lists; framed, softly lifted screenshots for work.
- Motion as continuity (page, cover, theme), always with an instant fallback.

## Colors

O Polvo is a warm paper ground with night-navy ink and accent, and a deep night band lit by one lamp-gold tone.

### Primary
- **Night Navy** (night-navy): primary button fill on the ground, link hover colour, focus ring, text selection, caret, the active-nav underline, list bullets, the success badge. It sits close to the ink in value, so on the ground the accent reads as weight and fill more than as hue. In dark mode the accent becomes lamp gold (#F6C765) with near-black text (#1A1405) on it.

### Secondary
- **Lamp Gold** (lamp-gold): the sun inside deep bands. Inside a band the accent role is remapped to it, so the primary button, the focus ring, link hover and selection turn gold there. It also colours the last word of the home headline, the hero role line, the closing CTA button and hovered social buttons.

### Neutral
- **Paper Ground** (paper-ground): the page ground. Flat, never textured or gradiented outside bands.
- **Cream Surface** (cream-surface): raised containers on the ground: screenshot frames, the contact panel, the CV sheet, the pager, inputs, the theme menu.
- **Night Ink** (night-ink): body text, headings, secondary button borders, selected chip and selected theme fill, the brand mark.
- **Dusk Muted** (dusk-muted): secondary text: leads, summaries, metadata, dates, labels, prose paragraphs.
- **Sand Hairline** (sand-hairline): the default 1px divider between rows, sections, header and footer.
- **Driftwood Line** (driftwood-line): borders on interactive controls and the top rule that opens a list; also the colour of the faint contours on the tint band (22% opacity).
- **Linen Wash** (linen-wash): hover fill for secondary buttons, header tools and menu items, the fallback cover panel, and the ground of the tint band.
- **Brick Error** (brick-error): field error text and invalid borders (dark: #FF9D85).

### Deep band
- **Deep Night** (deep-night): the band ground. **Deep Night Raised** (deep-night-raised) is the surface and soft fill inside a band (facts card, social buttons). **Moon Ink** (moon-ink) and **Moon Muted** (moon-muted) are band text and leads. **Deep Line** and **Deep Line Strong** are band hairlines and control borders; deep-line-strong also draws the contour lines at 55% opacity. In dark mode the band lifts one step (deep #121A35, raised #1A2445) so it still separates from the dark ground.

### Theme palettes (same roles, swapped values)
Defined in tools/make-themes.js (mirrored to tools/themes-data.json), generated into public/css/themes.css as `:root[data-skin="…"]`; names and menu swatches in lib/themes.js; the site default is `site.theme` in data/content.json.

| Theme | Source project | Ground / ink (light) | Accent light / dark | Deep / raised | Sun |
|---|---|---|---|---|---|
| **O Polvo** (default) | O Polvo restaurant site | #F6F0E6 / #1A1930 | #16224D / #F6C765 | #0A1024 / #121A35 | #F6C765 |
| **Saltaplanetas** | Saltaplanetas game | #F4F1FF / #1A1230 | #7A43C8 / #FFD34D | #0B0820 / #1A1230 | #FFD34D |
| **SkillConnect** | SkillConnect Android app | #F2F2F2 / #0D0D0D | #1B7F0A / #39FF14 | #000000 / #0D0D0D | #39FF14 |
| **Arduino** | Arduino boards and brand | #EEF5F5 / #0F2A2B | #00797C / #3FC6CA | #003234 / #00494C | #F5964E |

Dark grounds: O Polvo #0A1024, Saltaplanetas #0B0820, SkillConnect #0D0D0D, Arduino #071B1C. Every pair (ink, muted and accent on ground, accent-ink on accent, sun on deep, band muted on deep) passes WCAG AA in both modes; line-strong and deep-line-strong clear 3:1 against their grounds.

### Named Rules
**The Screenshots Carry the Colour Rule.** The interface stays near-neutral; saturated colour belongs to the real project screenshots, one accent, and the sun inside bands. Nothing else competes with the work.

**The Borrowed Palette Rule.** A theme's colours come from a real project of the owner's, named in its source comment and description. A new theme starts from a shipped project's own palette, never from an invented one.

**The One Accent Per Ground Rule.** The ground has exactly one accent; a deep band has exactly one (the sun), applied by remapping the accent role inside the band. Neither fills large surfaces except the CTA button and hovered social buttons.

**The Same Roles Rule.** A theme may only reassign values to the existing colour roles (bg, surface, ink, muted, line, line-strong, accent, accent-ink, inv-bg, inv-ink, soft, err, deep, deep-2, deep-ink, deep-muted, deep-line, deep-line-strong, sun). Fonts and radii are not theme properties. Every theme ships a light and a dark variant that pass WCAG AA.

## Typography

**Display Font:** Archivo, variable width 62–125% (with system-ui, sans-serif)
**Body Font:** Hanken Grotesk 400–700 (with system-ui, sans-serif)
**Mono Font:** JetBrains Mono 400–500 (code in legal pages only)

**Character:** A wide, heavy display (Archivo at weight 800, stretched to 118%) set tight, against a calm, legible grotesque body. It reads like a chart title: broad, sure and plain. The pairing is the same in every theme. All fonts are self-hosted woff2 (public/css/fonts.css, fetched once by tools/fetch-fonts.js) with `font-display: swap`.

### Hierarchy
- **Display XL** (800, 118% width, clamp(2.75rem, 6.4vw, 5.5rem), 0.96, -0.02em): the home greeting and the Projects/CV page titles. On phones clamp(2.75rem, 13vw, 3.5rem).
- **Display LG** (800, 118% width, clamp(2.4rem, 5vw, 4.25rem), 1.02, -0.03em): page titles for About, a project, Contact, legal and error pages.
- **Headline** (800, 118% width, 2.5rem, 1.08): section headings; the CTA heading scales to clamp(2rem, 4vw, 3.25rem).
- **Title** (800, 112% width, clamp(1.625rem, 2.6vw, 2.25rem), 1.1, -0.01em): featured project names; card titles and pager names at 1.5rem, the CV name at 2rem, CV and legal headings at 1.625rem and 1.5rem; the brand name at 1.1875rem.
- **Lead** (400, 1.25rem, 1.55, muted, max 40rem): the paragraph under each page title.
- **Body** (400, 1rem, 1.55): running text; prose blocks at 1.1875rem (max 42rem), the human paragraph at 1.375rem (max 40rem).
- **Label** (500, 0.8125rem, muted, sentence case): definition-list terms in facts and project meta. Values below are 1.0625rem at 600.

### Named Rules
**The Wide Heavy Display Rule.** Display text is Archivo 800 at 118% width with tight negative tracking and `text-wrap: balance`; titles, card names, CV headings and the brand use 800 at 112% width. Headings never use the body family at display sizes.

**The Sentence Case Rule.** Labels, metadata and navigation are sentence case in the body family. The hero role line sits below the headline, not above it.

## Layout

The wrapper is full width. Header, footer and every non-band block are inset by the margin token (`gut`: the larger of 32px or the space that centres a 1240px column; 16px on phones). Full-width bands (`bleed`) run edge to edge and pad their content inline by the same token, so band content and column content share one left edge.

Pages are a vertical sequence: a deep band (hero on Home, page header elsewhere), then sections each opening with a 1px hairline and 88px vertical padding (64px on phones). Band headers pad clamp(64px, 8vw, 112px) top, clamp(56px, 7vw, 96px) bottom, with 48px below; the home hero pads clamp(72px, 10vw, 136px) / clamp(64px, 8vw, 112px); the closing CTA band clamp(64px, 9vw, 120px). A section after a band or after the tint band drops its top hairline.

The header is its own stacking layer (position relative, z-index 20) so the theme popover (z-index 30) opens over the bands below it.

Two-column grids are asymmetric and collapse to one column at 960px: the hero (1.55fr text / 1fr facts card or photo, bottom-aligned), featured projects (1.65fr screenshot / 1fr text, alternating sides), split sections (1fr heading / 2fr content). Contact is a single centred column (max 760px) under its band. The project list is a two-up grid (56px row gap) that becomes one column at 640px. Skills use an auto-fit grid of 170px minimum columns.

Rhythm: 28px stack gap, 20px row padding, 72px between featured projects (56px on phones), 80px before the "more projects" list. At 640px the header becomes a two-row grid and the hero facts card is hidden so the first screenshot appears sooner.

## Elevation & Depth

Mostly flat with one soft, deep lift, plus tonal depth from the bands. Shadow is reserved for objects that sit on the page: screenshot frames, the facts card, the hero photo, the contact panel, the CV sheet and the theme menu. Rows, lists, sections and buttons are flat and separated by hairlines. Bands add depth by tone and by the contour mask (public/img/contours.svg, generated by tools/make-contours.js, applied as a CSS mask so its colour comes from the theme).

### Shadow Vocabulary
- **Soft lift** (`box-shadow: 0 22px 48px -24px rgba(16,19,14,0.38), 0 2px 6px rgba(16,19,14,0.06)`): the ground shadow. Dark mode: `0 22px 48px -24px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.3)`.
- **Band lift** (`box-shadow: 0 24px 48px -24px rgba(0,0,0,0.6)`): the same role inside a deep band.

### Named Rules
**The One Shadow Rule.** One shadow role, soft and diffuse, swapped per context (ground, dark, band). Hover adds movement (a 4px lift on screenshot frames, 3px on social buttons), never a heavier shadow.

**The Contours Stay in the Water Rule.** Contour lines appear only on bands: deep-line-strong at 55% on deep bands, line-strong at 22% on the tint band. The ground between bands stays plain.

## Shapes

Nearly straight corners throughout. Two radius tokens, frame (`--r`) and control (`--rc`), are both 6px in every theme. Screenshot frames, the facts card, the hero photo, the pager, the empty state and the theme menu take the frame radius; buttons, chips, header tools, social buttons and the success badge take the control radius. There are no pills. Inputs, the brand mark and the focus ring are 4px; contact panel and CV sheet 8px; theme menu items 3px; the active-nav mark 2px. Bands are square, full-bleed rectangles. Borders are 1px hairlines; the secondary button uses a 1.5px ink border; the empty state a 1px dashed line-strong border. Bullets are 6px accent dots.

## Components

### Buttons
Tactile, plain and generous.
- **Shape:** control radius (6px), 52px tall (48px in the phone hero), 0 26px padding, body family 600 at 1rem, 10px gap to an 18px stroke icon.
- **Primary:** accent fill, accent-ink text; inside a deep band that is lamp gold with deep-night text. Hover darkens via `brightness(0.93)`.
- **Secondary:** transparent with a 1.5px ink border (moon ink in a band); hover fills with the soft wash (deep-night-raised in a band).
- **CTA:** the closing band's 56px "big" button, sun fill with deep text.
- **Press:** 1px downward nudge. The trailing icon is pushed in the direction of the action on hover (arrow right 4px, download down 3px, external up-right 3px).

### Chips (project filters)
- **Style:** transparent, 1px line-strong border, control radius, 44px tall, 0 20px padding, 0.9375rem 500.
- **State:** hover darkens the border to ink; selected (`aria-pressed`) fills with ink and switches text to the ground colour at 600. Press scales to 0.96.

### Cards / Containers
- **Screenshot frame (signature):** 16:10, frame radius, clipped, surface fill, soft lift; the image is top-anchored `object-fit: cover`. Without a screenshot it becomes a soft-wash panel with the category and the project name set large in Archivo 700, never a fake image.
- **Project card:** no box. Screenshot, then title (title role at 1.5rem, turns accent on hover), summary, metadata. Cards without images get a line-strong top rule instead.
- **Panel / CV sheet:** surface fill, 1px hairline, 8px radius, soft lift, fluid padding.
- **Rows:** a line-strong top rule, then 20px rows divided by hairlines; a 170px date column in muted tabular numerals.

### Inputs / Fields
- **Style:** surface fill, 1px line-strong border, 4px radius, 50px tall, 0 14px padding; labels above at 0.9375rem 600.
- **Focus:** border turns accent with the 3px accent outline at zero offset. Hover darkens the border to ink.
- **Error:** border and message in the error colour; the message slides in 4px.

### Navigation
- **Header:** brand (34px ink square mark at 4px radius plus name in the title face) left, five text links and square-cornered tools (theme menu, language, light/dark) right, hairline below. Links are 0.9375rem 500, 44px targets. Tools are 44px, 1px line-strong border, control radius, soft-wash hover.
- **Active:** weight 600 plus a 2px accent underline (`nav-mark`) that slides between pages as a shared view-transition element.
- **Theme menu:** a surface popover at frame radius with a line-strong border and soft lift, opening from the button (scale 0.97 and 6px rise via `@starting-style`). Lists the four themes; the selected option is filled with ink.
- **Mobile:** header splits into two rows; the nav becomes a five-column grid at 0.875rem; the theme label is visually hidden.

### Deep band (signature)
A full-width deep block with contour lines, used for the home hero, every page header, the contact header and the closing CTA. Inside it the colour roles are remapped (ink to deep-ink, accent to the sun, surface and soft to deep-2) so every component placed in it adapts without variants. Links are deep-ink, sun on hover.

### Tint band
A full-width soft-wash band with faint contours, used once on Home for "Além do código". It carries ordinary section content and drops the hairlines on either side.

### Social buttons (contact)
68px square icon buttons (60px on phones) in the contact band: deep-2 fill, deep-line-strong border, control radius, 28px stroke icons for email, LinkedIn and GitHub, each with an accessible label. Hover and focus fill with the sun, switch the icon to the deep colour and lift 3px. A muted location line with a pin icon sits below.

### Motion
Easing is one curve, `cubic-bezier(0.16, 1, 0.3, 1)`. Cross-document view transitions keep the header still, fade the old page out (0.14s) and lift the new one in 14px (0.45s). The project screenshot morphs from card to project page (0.62s). Theme and mode changes reveal the new look with a growing circle from the toggle. The home headline focuses in word by word (0.8s, 70ms stagger, blur 8px to 0) once. `prefers-reduced-motion` removes all of it.

## Do's and Don'ts

### Do:
- **Do** let real project screenshots be the largest and most colourful things on the page, in the 16:10 frame with the soft lift.
- **Do** open every page with a full-width deep band and pad band content by the same margin token as the column.
- **Do** rely on the role remapping inside bands (accent becomes the sun) rather than writing band-specific component variants.
- **Do** build a new theme from a real project's own colours, add it to tools/make-themes.js and lib/themes.js, and regenerate themes.css rather than editing it by hand.
- **Do** keep every theme to the shared colour roles, including the deep-band roles and sun, and ship both light and dark, checked to WCAG AA.
- **Do** use hairline rows (1px, line-strong rule on top) for experience, skills and secondary project lists.
- **Do** keep controls at the 6px control radius with at least 44px targets (52px for buttons).
- **Do** give every motion an instant fallback under `prefers-reduced-motion`.

### Don't:
- **Don't** add illustrative metaphors, diagrams, datasheet or chip costumes; the owner rejected that world as cartoonish. Contour lines are a chart texture, not an illustration.
- **Don't** invent imagery: a project without a real screenshot gets the named soft-wash panel, never a mock or stock image.
- **Don't** put contours, textures or gradients on the plain ground between bands.
- **Don't** make fonts or radius a per-theme choice; Archivo, Hanken Grotesk, JetBrains Mono and 6px corners are shared by every theme.
- **Don't** reintroduce pill (999px) shapes; corners come from the radius tokens.
- **Don't** add uppercase tracked eyebrows or kickers above headings.
- **Don't** use the sun as a fill or text colour on the light ground; on the ground it appears only where a theme's dark-mode accent shares its value.
- **Don't** load fonts or assets from third-party origins at runtime; everything is self-hosted under a strict CSP.
