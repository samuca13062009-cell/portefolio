---
name: Samuel Camargo, Portefólio
description: A serious, human portfolio where real screenshots of real projects lead.
colors:
  cobalt-accent: "#2B4BFF"
  accent-ink: "#FFFFFF"
  sage-paper: "#EEF0EA"
  surface-white: "#FFFFFF"
  near-black-ink: "#10130E"
  moss-muted: "#555B50"
  hairline: "#D3D7CC"
  hairline-strong: "#7A8171"
  soft-wash: "#DDE0D6"
  inverse-band: "#10130E"
  inverse-ink: "#EEF0EA"
  error-red: "#A8201A"
typography:
  display-xl:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  display-lg:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 2.6vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  focus: "4px"
  menu-item: "8px"
  field: "10px"
  frame: "12px"
  panel: "16px"
  band: "20px"
  pill: "999px"
spacing:
  gutter-mobile: "16px"
  gutter: "32px"
  stack: "28px"
  row: "20px"
  feature-gap: "72px"
  section-mobile: "64px"
  section: "88px"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "52px"
  button-secondary-hover:
    backgroundColor: "{colors.soft-wash}"
  button-inverse:
    backgroundColor: "{colors.inverse-ink}"
    textColor: "{colors.inverse-band}"
    rounded: "{rounded.pill}"
    padding: "0 30px"
    height: "56px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.near-black-ink}"
    textColor: "{colors.sage-paper}"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "50px"
  screenshot-frame:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.frame}"
  panel:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 4vw, 44px)"
  cta-band:
    backgroundColor: "{colors.inverse-band}"
    textColor: "{colors.inverse-ink}"
    rounded: "{rounded.band}"
    padding: "clamp(36px, 5vw, 64px) clamp(24px, 4vw, 56px)"
---

# Design System: Samuel Camargo, Portefólio

## Overview

**Creative North Star: "The Work on the Table"**

The site is the category standard for a developer portfolio, executed straight and at full craft. A plain, untextured ground; a strong grotesque for headings; calm sans body text; and real screenshots of shipped projects, framed and lifted, carrying almost all of the colour. No illustrative costume, no diagrams, no metaphor. The owner rejected a datasheet/chip world as cartoonish, and the build holds that line: the proof is the screenshots, the job and the words, not decoration.

Density is relaxed and editorial. Sections breathe (88px vertical padding), separated by single hairlines. Experience, skills and "more projects" are quiet hairline rows rather than cards. The one moment of contrast is a single dark band carrying the closing call to action. Motion is real but restrained: view transitions between pages, a shared-element cover morph from card to project page, a circular reveal when the theme or mode changes, and a one-time word-focus on the home headline. Every motion falls back to instant under reduced motion.

The system is themeable by design. Cobalto (documented as the base tokens above) is one of four themes (Cobalto, Terminal, Editorial, Atlântico), each with light and dark variants. Themes swap colours, the three font roles and the frame radius; layout, spacing, components and motion never change between themes.

**Key Characteristics:**
- Plain flat ground, one accent per theme, colour carried by screenshots.
- Grotesque display at 700 with tight negative tracking; neutral sans body.
- Hairline rows for lists; framed, softly lifted screenshots for work.
- Pill-shaped controls with 44px minimum targets throughout.
- One inverse band per page at most, reserved for the closing call to action.
- Motion as continuity (page, cover, theme), always with an instant fallback.

## Colors

A restrained, near-neutral palette tinted toward each theme's hue, with a single saturated accent that is used sparingly.

### Primary
- **Cobalt Accent** (cobalt-accent): the primary button fill, link hover colour, focus ring, text selection, caret, the active-nav underline, list bullets and the success badge. In dark mode it lightens to a soft periwinkle (#9DADFF) with near-black text on it.

### Neutral
- **Sage Paper** (sage-paper): the page ground. Flat, never textured or gradiented.
- **Surface White** (surface-white): raised containers only: screenshot frames, the facts card, the contact panel, the CV sheet, the pager, inputs, the theme menu.
- **Near-Black Ink** (near-black-ink): body text, headings, secondary button borders, selected chip and selected theme fill.
- **Moss Muted** (moss-muted): secondary text: leads, summaries, metadata, dates, labels, prose paragraphs.
- **Hairline** (hairline): the default 1px divider between rows, sections, header and footer, and the resting border of containers.
- **Hairline Strong** (hairline-strong): borders on interactive controls (pills, chips, inputs) and the top rule that opens a list (rows, more-list, channels).
- **Soft Wash** (soft-wash): hover fill for secondary buttons, pills and menu items; fallback fill for a project without a screenshot.
- **Inverse Band / Inverse Ink** (inverse-band, inverse-ink): the closing CTA band and the theme-preview bar; the inverse button swaps the pair.
- **Error Red** (error-red): field error text and invalid-field borders (dark: #FF9C93).

### Theme palettes (same roles, swapped values)
- **Cobalto dark:** ground #10130E, surface #1A1E17, ink #EEF0EA, muted #A9AFA1, accent #9DADFF.
- **Terminal:** ground #F1F5EE, ink #0B1A10, accent forest green #0B6B34; dark ground #0B0F0C, accent phosphor green #4ADE80.
- **Editorial:** ground warm paper #F6F1E7, ink #1E1A16, accent brick #B3371A; dark ground #17130F, accent coral #FF8A66.
- **Atlântico:** ground #EEF4F5, ink #0A2230, accent deep teal #0A6C78; dark ground #071A24, accent aqua #5FD4DE.

### Named Rules
**The Screenshots Carry the Colour Rule.** The interface stays near-neutral; saturated colour belongs to the real project screenshots and to one accent. Nothing else on the page competes with the work.

**The One Accent Rule.** Each theme has exactly one accent, used for the primary action, focus, selection, the active-nav mark and small markers (bullets). It never fills large surfaces.

**The Same Roles Rule.** A theme may only reassign values to the existing roles (bg, surface, ink, muted, line, line-strong, accent, accent-ink, inv-bg, inv-ink, soft, err), plus the display/body/mono families and the frame radius. Every theme ships a light and a dark variant that pass WCAG AA.

## Typography

**Display Font:** Bricolage Grotesque (with system-ui, sans-serif)
**Body Font:** IBM Plex Sans (with system-ui, sans-serif)
**Mono Font:** IBM Plex Mono (code in legal pages only)

**Character:** A characterful, heavy grotesque for headings against a neutral, legible workhorse sans. Confident without being loud. Per theme the pairing changes: Terminal uses JetBrains Mono for display, Editorial uses Fraunces (600) over Source Sans 3 at a 17px base, Atlântico uses Outfit (600) over DM Sans. All fonts are self-hosted woff2 with `font-display: swap`.

### Hierarchy
- **Display XL** (700, clamp(3rem, 7vw, 6rem), 0.96): the home greeting and the Projects/CV page titles. On phones clamp(2.75rem, 13vw, 3.5rem).
- **Display LG** (700, clamp(2.4rem, 5vw, 4.25rem), 1.02): page titles for About, a project, Contact, legal and error pages.
- **Headline** (700, 2.5rem, 1.08): section headings ("Selected work", "Experience"); the CTA heading scales to clamp(2rem, 4vw, 3.25rem).
- **Title** (700, clamp(1.625rem, 2.6vw, 2.25rem), 1.1): featured project names; card titles at 1.5rem; small display at 1.875rem for in-page subsections.
- **Lead** (400, 1.25rem, 1.55, muted, max 40rem): the paragraph under each page title.
- **Body** (400, 1rem, 1.55): running text; prose blocks at 1.1875rem (max 42rem), the human paragraph at 1.375rem (max 40rem).
- **Label** (500, 0.8125rem, muted, sentence case): definition-list terms in facts and project meta. Values below them are 1.0625rem at 600.

### Named Rules
**The Heavy Display Rule.** Display text is always the display family at 700 (600 in Editorial and Atlântico) with negative tracking (-0.02em to -0.035em) and `text-wrap: balance`. Headings never use the body family at display sizes.

**The Sentence Case Rule.** Labels, metadata and navigation are sentence case in the body family. The build carries no uppercase tracked labels or eyebrows above headings.

## Layout

A single centred container (1240px max, 32px gutters, 16px on phones). Pages are a vertical sequence of sections, each opening with a 1px hairline and 88px of vertical padding (64px on phones). Section heads put the heading left and a text link right on a shared baseline.

Two-column grids are asymmetric and collapse to one column at 960px: the hero (1.55fr text / 1fr facts card or photo, bottom-aligned), featured projects (1.65fr screenshot / 1fr text, alternating sides), split sections (1fr heading / 2fr content) and Contact (1fr intro / 1.25fr form panel). The project list is a two-up grid (56px row gap) that becomes one column at 640px. Skills use an auto-fit grid of 170px minimum columns.

Rhythm: 28px stack gap, 20px row padding, 72px between featured projects (56px on phones), 80px before the "more projects" list. At 640px the header becomes a two-row grid (brand + tools, then nav), and the hero facts card is hidden so the first screenshot appears sooner.

## Elevation & Depth

Mostly flat with one soft, deep lift. Depth is reserved for objects that sit on the page: screenshot frames, the facts card, the hero photo, the contact panel, the CV sheet and the theme menu. Rows, lists, sections and buttons are flat and separated by hairlines.

### Shadow Vocabulary
- **Soft lift** (`box-shadow: 0 22px 48px -24px rgba(16,19,14,0.38), 0 2px 6px rgba(16,19,14,0.06)`): the only shadow. A long, negatively spread drop that reads as a sheet lifted off the table, plus a tight contact shadow. Dark mode: `0 22px 48px -24px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.3)`.

### Named Rules
**The One Shadow Rule.** There is a single shadow token and it is soft and diffuse. Hover adds movement (a 4px lift on screenshot frames), never a heavier shadow.

## Shapes

Gently rounded throughout, with pills for every control. Screenshot frames, the facts card, the pager and the empty state share the theme frame radius (12px in Cobalto and Editorial, 6px in Terminal, 18px in Atlântico). Larger containers step up: contact panel and CV sheet at 16px, the CTA band at 20px. Inputs are 10px, theme menu items and the brand mark 8px, the focus ring 4px. Buttons, chips and header pills are fully rounded (999px). Borders are 1px hairlines; the secondary button uses a 1.5px ink border. Bullets are 6px accent dots.

## Components

### Buttons
Tactile, plain and generous.
- **Shape:** full pill (999px), 52px tall, 0 26px padding, body family 600 at 1rem, 10px gap to an 18px stroke icon.
- **Primary:** accent fill, accent-ink text. Hover darkens via `brightness(0.93)`.
- **Secondary:** transparent with a 1.5px ink border; hover fills with soft wash.
- **Inverse:** used on the CTA band; inverse-ink fill with inverse-band text, 56px tall ("big").
- **Press:** 1px downward nudge. The trailing icon is pushed in the direction of the action on hover (arrow right 4px, download down 3px, external up-right 3px).

### Chips (project filters)
- **Style:** transparent, 1px strong-hairline border, pill, 44px tall, 0 20px padding, 0.9375rem 500.
- **State:** hover darkens the border to ink; selected (`aria-pressed`) fills with ink and switches text to the ground colour at 600. Press scales to 0.96.

### Cards / Containers
- **Screenshot frame (signature):** 16:10, theme frame radius, clipped, surface fill, soft lift; the image is top-anchored `object-fit: cover`. Without a screenshot it becomes a soft-wash panel with the category and the project name set large in the display face, never a fake image.
- **Project card:** no box. Screenshot, then title (display 1.5rem, turns accent on hover), summary, metadata. Cards without images get a strong-hairline top rule instead.
- **Panel / CV sheet:** surface fill, 1px hairline, 16px radius, soft lift, fluid padding.
- **Rows:** a strong top rule, then 20px rows divided by hairlines; a 170px date column in muted tabular numerals.

### Inputs / Fields
- **Style:** surface fill, 1px strong-hairline border, 10px radius, 50px tall, 0 14px padding; labels above at 0.9375rem 600.
- **Focus:** border turns accent with the 3px accent outline at zero offset. Hover darkens the border to ink.
- **Error:** border and message in error red; the message slides in 4px.

### Navigation
- **Header:** brand (34px ink square mark plus name in display 700) left, five text links and two pill tools (theme menu, light/dark) right, hairline below. Links are 0.9375rem 500, 44px targets.
- **Active:** weight 600 plus a 2px accent underline (`nav-mark`) that slides between pages as a shared view-transition element.
- **Theme menu:** a surface popover, 12px radius, soft lift, opening from the button (scale 0.97 and 6px rise via `@starting-style`). Selected option filled with ink.
- **Mobile:** header splits into two rows; the nav becomes a five-column grid at 0.875rem; the theme label is visually hidden.

### CTA band (signature)
A single inverse-coloured block, 20px radius, closing the home page with a display heading and the inverse big button. One per page.

### Motion
Easing is one curve, `cubic-bezier(0.16, 1, 0.3, 1)`. Cross-document view transitions keep the header still, fade the old page out (0.14s) and lift the new one in 14px (0.45s). The project screenshot morphs from card to project page (0.62s). Theme and mode changes reveal the new look with a growing circle from the toggle (620ms). The home headline focuses in word by word (0.8s, 70ms stagger, blur 8px to 0) once. `prefers-reduced-motion` removes all of it.

## Do's and Don'ts

### Do:
- **Do** let real project screenshots be the largest and most colourful things on the page, in the 16:10 frame with the soft lift.
- **Do** keep every theme to the shared role set and ship both light and dark for it, checked to WCAG AA.
- **Do** use hairline rows (1px, strong rule on top) for experience, skills, channels and secondary project lists.
- **Do** keep all controls pill-shaped with at least 44px targets (52px for buttons).
- **Do** use the single soft-lift shadow only on objects that sit on the page.
- **Do** give every motion an instant fallback under `prefers-reduced-motion`.

### Don't:
- **Don't** add illustrative metaphors, diagrams, datasheet or chip costumes; the owner rejected that world as cartoonish.
- **Don't** invent imagery: a project without a real screenshot gets the named soft-wash panel, never a mock or stock image.
- **Don't** add textures, gradients or patterns to the page ground.
- **Don't** add uppercase tracked eyebrows or kickers above headings.
- **Don't** use more than one inverse band per page, or use the accent as a large fill.
- **Don't** load fonts or assets from third-party origins; everything is self-hosted under a strict CSP.
