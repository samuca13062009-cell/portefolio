# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences weighed equally (confirmed by the owner):
- Companies and recruiters who could offer an internship or a first junior role in software, web design or cybersecurity.
- Teachers assessing the site as a school project (portfolio assignment submitted on Moodle: information architecture, wireframes, UI, prototype, working site, backoffice).
- Potential freelance clients looking for someone to build a website or app.

They arrive from a link (LinkedIn, CV, Moodle, a message), usually on a phone or a laptop, and decide in a few minutes whether to read further, download the CV or get in touch.

## Product Purpose

The personal portfolio of Samuel Camargo: who he is, what he has built, his CV (on the page and as a PDF) and a contact form. Success is a visitor who leaves convinced and either downloads the CV, opens a project's code or sends a message. The owner updates content through a backoffice without touching code.

## Positioning

Two things a visitor must remember (confirmed): he makes real things that work, not just exercises (web, Android, Arduino over Bluetooth, a 3D browser game, a restaurant booking system), and he is reliable at work, proven by his job as a waiter at restaurant O Polvo (pressure, customers, teamwork). A student who ships working software and already holds down a real job.

## Operating Context

- Server-rendered pages in plain Node.js (`lib/render.js`), PT and EN routes, data in `data/content.json` edited through the backoffice (`/admin`).
- Hosted on Netlify (function + Netlify Blobs) or locally with `node server.js`.
- Visitors may choose one of four visual themes (Cobalto, Terminal, Editorial, Atlântico) and light/dark mode; the site default is set in the backoffice.

## Capabilities and Constraints

- Strict CSP: only same-origin resources. Fonts are self-hosted (`public/fonts`, OFL). No third-party scripts, embeds, analytics or trackers.
- Must stay light and fast on phones (owner's explicit limit).
- Must keep the four themes and dark mode (owner's explicit limit).
- WCAG 2.1 AA: contrast checked per theme and mode, keyboard-friendly forms, screen-reader labels.
- Legal pages (privacy, cookies, terms) and a consent box on the contact form must remain.
- Real screenshots exist for O Polvo and Saltaplanetas (public/img/projetos, captured from the running projects). SkillConnect and the Arduino project have no images yet. A photo of the owner (from his LinkedIn) is wanted but not yet in the project; content.site.photo shows it when added.

## Brand Commitments

- Tone: professional and confident, never childish (owner's explicit limit).
- Visual (owner's explicit steer, 22 Oct 2026): serious and human, led by real images of the work; no illustrative metaphors or diagram costumes (a datasheet/chip direction was rejected as "too cartoonish").
- Name: Samuel Camargo. Location: Torres Vedras, Portugal.

## Evidence on Hand

- Projects (all real, from LinkedIn and GitHub): O Polvo (restaurant site with bookings and admin), SkillConnect (web platform and Android app), Saltaplanetas (3D browser game, Three.js), Arduino control over Bluetooth (Android app in Java, internship at LabCenter, Jul–Sep 2026).
- Experience: waiter at Restaurante O Polvo since July 2025; programming intern (work placement) at LabCenter, Jul–Sep 2026.
- Education: ESCO, Vocational Diploma in IT Systems Management and Programming, 2024–2027.
- Languages: Portuguese (native), English (C1).
- Not available, never to be invented: testimonials, client logos, metrics, screenshots of SkillConnect or the Arduino project.

## Product Principles

1. Show the work, not adjectives: every claim on the page points at a real project, job or document.
2. Serious enough for a recruiter, interesting enough to be remembered.
3. Fast and accessible for everyone, on any phone.
4. Content stays editable from the backoffice; design never hard-codes facts.

## Accessibility & Inclusion

WCAG 2.1 AA across all four themes in light and dark mode; respect reduced motion.
