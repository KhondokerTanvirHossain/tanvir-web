# Tanvir Portfolio

The portfolio of Tanvir Hossain, Engineering Lead, at tanvir.eliooo.org. The site is a black stage. Tanvir's own story is told in black, white and grey; each of his four products (Bolo, Medioo, Finioo, IntelliDrugs) then gets a full-width chapter in its own colours and type, with a film made in Remotion. A recruiter should leave knowing three things: he leads teams, he ships whole products, and how to reach him.

## Principles

1. **The stage stays quiet so the products can be loud.** Outside a chapter there is no colour but `link`. Inside a chapter there is only that product's colour. Never mix two products' colours in one view.
2. **The recruiter has 40 seconds.** Title, seniority and the résumé button are in the first screen. Every section answers one question a recruiter has (What does he do? What has he shipped? At what scale? How do I contact him?).
3. **Show, then tell.** A film, a live link and a number beat a paragraph. Every chapter has a live product link; every client card has a headline number.
4. **Apple's restraint.** System type, large confident headlines, long quiet spacing, one filled button per view, motion that follows the reader's scroll and never performs on its own.
5. **Each product is shown as its own design system defines it.** Chapter colours, fonts and wordmarks are copied from that product's system, never approximated.

## Content fundamentals

- **Voice.** First person, plain and specific. Short sentences. Numbers before adjectives: "583,000 customers", not "a large customer base".
- **Casing.** Sentence case everywhere: buttons, titles, nav. Product names keep their own case: Bolo, Medioo, Finioo, IntelliDrugs.
- **Buttons** name the result: **Download résumé**, **Email me**, **Try Bolo**, **Open Medioo**, **Read the case study**. Never "Learn more" or "Click here".
- **Links** end with a single chevron: "Email me ›".
- **No emoji, no exclamation marks, no buzzwords** ("passionate", "rockstar", "synergy").
- **Product claims** come from each product's own README and stay inside what it does today. A product that is not live yet still links to its address (Finioo: finioo.eliooo.org) and carries the status label **Launching soon** (a hollow dot and the words); a live product carries **Live** (a filled dot). Status is never colour alone.
- **Client claims** come from `content/facts.md` in the site repo and nowhere else.

Real copy:

| Place | Copy |
|---|---|
| Hero eyebrow | Engineering Lead · Dhaka, UTC+6 · Open to remote |
| Hero headline | I lead the team. And ship the whole product. |
| Hero lede | Internet banking for 583,000 customers. A platform for a national regulator. And four products of my own, from first sketch to production. |
| Bolo chapter | Speak English without freezing. |
| Medioo chapter | Your mother's medical papers, in plain Bangla. |
| Finioo chapter | Your business model, in numbers you can trust. |
| IntelliDrugs chapter | Bangladesh's drug data, checked by pharmacists. |
| Role line | Designed, built and run solo · Live |

## Visual foundations

### Colour

- Put the page on `stage`. Raise cards and the contact panel on `surface` with `shadow-card`. Use `surface-2` for an unloaded film frame.
- Set text in `ink`; ledes and nav links in `ink-2`; eyebrows, meta and captions in `ink-3`.
- Use `link` for text links and the focus ring on stage. Fill the one primary button per view with `ink` and `on-ink`.
- Draw dividers in `hairline`; draw outlined control boundaries in `line-control`.
- **Chapters own their colours.** A chapter's ground, text, link and play disc use only that product's tokens (`bolo-*`, `medioo-*`, `finioo-*`, `intellidrugs-*`). The page's own `link` blue never appears inside a chapter.
- **Bolo's sky** is three steps: `bolo-sky-high` → `bolo-sky-mid` → `bolo-sky-low`, blended, never a two-colour jump. Text sits only on sky-high and sky-mid; the rose horizon sits behind the film, where no text is.
- **Transitions between chapters** are a short blend (the last 8% of one ground into the first of the next), so scrolling feels like the light changing, not a hard cut.

### Type

- Use the system face: SF Pro on Apple devices, Inter elsewhere (`display`, `text`). It ships Apple's optical sizes and tracking.
- Track by size: `hero` −0.045em, `section-title` −0.035em, `lede` −0.012em, `body` −0.01em, `meta` 0. Never one tracking for all sizes.
- Hierarchy comes from size and weight together. Weights: 400 reading, 600 labels, 650 headlines.
- Inside a chapter, every word uses that product's face (`bolo`, `medioo`, `finioo`, `intellidrugs`). Never track Bangla.
- Headings get `text-wrap: balance`. Ledes stop at 38ch, body at 65ch.
- Figures use tabular lining digits.

### Layout

- Content max width `w-page` (1200px), side gutter `gutter` (40px) on desktop, max(20px, safe-area inset) on phones.
- Page order: nav → hero → four product chapters → client work → how I lead → timeline → contact → footer.
- **Hero** fills about 80% of the first screen on desktop, with the résumé button visible without scrolling at 1280×800 and 390×844.
- **Chapters** are full-bleed bands, centred text above a centred film, `space-36` padding top and bottom on desktop and `space-16` on phones.
- **Client work** is a grid of four cards: two columns on desktop, one on phones.
- Sections on stage are `space-24` apart.

### Shape and depth

- Anything you press is a pill (`radius-pill`). Cards use `radius-card`. Films use `radius-film`.
- Black swallows shadows, so cards on stage get a light hairline (`shadow-card`). Only the film gets a real shadow (`shadow-film`), because it is the one object lifted toward the reader.
- The nav is the only material: `material` with a 20px blur and saturate(180%), `shadow-nav` on its bottom edge, content scrolling underneath. Under `prefers-reduced-transparency` it becomes solid `surface`.

### Motion

- Motion follows the reader. Chapter grounds blend as they scroll; nothing loops by itself except the films.
- Text and films rise into place once, 24px and a fade over 600ms on a critically damped spring (no bounce). They are visible at rest: a reader who has scrolled past, a thumbnail and a no-JS visitor all see the finished page.
- Buttons respond on press: scale 0.97 over 100ms.
- Films autoplay muted and loop only while on screen, and pause when scrolled away. Every film has a play/pause control.
- Under `prefers-reduced-motion`: no rise, no autoplay (the poster shows with a play button), background blends become instant.

### Films (for Remotion)

- One master per product serves both this site and eliooo.org: 16:10 at 1728×1080, WebM with an MP4 fallback, plus a poster of the strongest frame. Same format as the elioo design system's product slots, so a film is rendered once.
- A short loop (6 to 15 seconds, at most 3 MB) plays muted in the chapter. An optional longer cut (up to 45 seconds) opens from the play disc.
- Each film uses its product's colours and type, so it continues the chapter around it.
- The films are silent on the page, so every point is made on screen with type, not voice-over.
- Keep the outer 5% clear of key content: the frame's rounded corners crop it.
- Before a film exists the frame is finished, not empty: the poster is the product's own scene (Bolo's sun over the dusk hills, Medioo's paper and chat card, Finioo's hero figure, IntelliDrugs' review row).

### Photo

- One portrait of Tanvir, in greyscale so it sits in the black-and-white palette, beside the About section. No other people, no stock photography, no device mockups.

### Sister site

- elioo (eliooo.org) is Tanvir's product studio and has its own system: ink editorial, Instrument Sans, left-aligned, stacked product cards. This portfolio stays Apple-like (system face, pure black, centred chapters) so the two read as related, not duplicated. Product colours are identical in both because both copy them from the products' own systems. The portfolio links to elioo once, in the About section.

## Iconography

- No icon set. Navigation and actions are words; links end with "›".
- The only drawn glyph is the play/pause disc on films.
- Product wordmarks are typed, not drawn, exactly as each product's system specifies (Medi + `medioo-oo` "oo" + `medioo-dot` dot; IntelliDrugs + `intellidrugs-link` full stop).
- No emoji.

## Accessibility

- Text holds 4.5:1 on its named ground (3:1 at 24px and up); control boundaries and focus rings hold 3:1.
- Every focusable element gets a 2px `focus` ring (inside a chapter, that product's link colour) at 3px offset.
- Films have a text alternative: the chapter headline and lede say what the film shows, and the film element has a label.
- Respect `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast: more` (nav becomes solid, hairlines become `line-control`).
- Works without JavaScript: posters show, links work, nothing waits on a script to become visible.
