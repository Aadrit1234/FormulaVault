# Formula Vault ✦

A fast, offline-first study app for **CBSE Class 11/12** and **JEE Main & Advanced**. Vault AI helps you memorise **833 formula cards** — formulas, derivations and laws — across **62 chapters** of Physics, Chemistry and Mathematics, with a typo-tolerant universal search and a specialised, API-key-powered teaching tutor.

Built with zero frameworks and zero build step — open the file and it just works.

## Features

- **🔎 Typo-tolerant universal search** — one search box that works across every formula, derivation and law, in every class and subject. It understands mistakes and near-misses:
  - `gravity` → *Gravitation* (handles *gravitation*↔*gravity*, *molality*↔*molarity*, etc. via light stemming)
  - `resotance capacitor` → *Resonant Angular Frequency* (corrects 2+ skipped letters)
  - Add a one-letter query like `q` → results are capped sensibly instead of flooding
- **✦ Vault AI tutor** — a teaching tutor specialised for CBSE/JEE pedagogy: intuition & analogy first, then the formula and *why each symbol is there*, then JEE-Main-vs-Advanced exam patterns, step-by-step worked numericals and classic misconceptions/traps. Uses **your own free API key** (Groq, Google AI Studio or OpenRouter) — keys never leave your browser.
- **🧾 AI Explanation** — one tap on any formula card for a focused, structured explanation of that single formula.
- **📄 Revision Sheet builder** — pick any combination of chapters and get a clean, printable revision sheet (Save as PDF / Print). Let **AI top-pick 25** choose the 25 highest-yield formulas for your exam.
- **🃏 Study mode** — flashcard sessions with flip, "Again / Got it" tracking and mastery over time.
- **🧮 Smart calculators** — Projectile, Kinematics, Ohm & Power, Ideal Gas, pH & [H⁺], Quadratic roots, Molarity, % Error.
- **⭐ Bookmarks, 📊 progress & 🔥 streaks** — star the formulas you care about, track day streaks, review stats and mastery in the dashboard.
- **💰 Data privacy** — everything (bookmarks, study data, settings, API keys) lives in your browser's `localStorage`. No accounts, no servers, no tracking.
- **🌙 Dark / light themes** and **LaTeX math rendering** (MathJax, loaded on demand).

## Getting started

1. Download or clone this repo.
2. Open **`index.html`** in any modern browser. That's it — no install, no build, no server.

  > `formula-vault.html` is an identical **single-file build** (every script and style inlined). Use it when you want one portable file you can open anywhere, fully offline.

3. (Optional) Enable the AI tutor: click **✦ AI Tutor → ⚙ AI Settings**, paste a free API key from one of:
   - [Groq](https://console.groq.com/keys) (fast, generous free tier — recommended)
   - [Google AI Studio](https://aistudio.google.com/apikey)
   - [OpenRouter](https://openrouter.ai/keys)
   
   Hit **Test** (it verifies the key instantly), then **Save keys**. Auto mode tries every provider you've configured and picks the first that works.

## How the search works

All search is client-side and instant (~50 ms/query after the first query). The engine:

- normalises text (Unicode/NFC, Greek letters → names, `²³⁴` → numbers, `tion/sion` → `shn`, `ph` → `f`, collapses doubles) and splits queries into tokens;
- scores each card with a weighted edit-distance + bitmask prefilter and cache-friendly tricks;
- accepts partial, singular/plural and stemmed matches (`gravity`↔`gravitation`);
- highlights the matched tokens in the results.

## Project structure

```
index.html                  Entry point (modular build)
formula-vault.html          Single-file build (everything inlined)
css/
  base.css                  Design tokens, typography, themes
  cards.css                 Card grids & formula cards
  features.css              Overlays, drawers, tutor, study, sheets, calculators
  layout.css                Layout & responsive rules
js/
  core.js                   Render engine + fuzzy universal search engine
  app.js                    Features: AI tutor, explain, sheets, study, stats, calculators
  data/                     18 content files — formulas, derivations & laws (Class 11/12 × Physics/Chemistry/Math)
```

## Adding content

Content lives in `js/data/*.js` as plain JavaScript arrays. Each entry is a chapter object with a `formulas`, `derivations` or `laws` array; cards carry `t` (title), `eq` (formula, HTML), optional `sym` (symbol glossary) and `tip` (memory hook). Add or edit a file and the app picks it up on reload — no recompilation needed.

## Tech stack

- Vanilla JavaScript (ES2017+), hand-written CSS, HTML
- MathJax 3 (CDN, lazy-loaded) for LaTeX
- `localStorage` for persistence
- No frameworks, no node_modules, no build step

## Privacy

Your API keys are stored **only on your device** and are never uploaded anywhere by this app (requests go directly from your browser to the provider you chose). The old demonstration key that used to be baked into the code has been removed for security.