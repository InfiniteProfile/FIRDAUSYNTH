# FIRDAUSANTH
Arabic-first, Jannah-inspired endless profile feed. Plain HTML/CSS/JS, no build, no backend, no external requests.

**Deploy (GitHub Pages):** push `index.html`, `style.css`, `script.js`, `README.md` to a repo → Settings → Pages → Deploy from branch `main` / root.

**Files:** `index.html` (shell, one language button, search, dialog) · `style.css` · `script.js` (ID math, bilingual data, SVG art, feed engine, i18n).

**Language:** Arabic default (`lang=ar dir=rtl`); the single toggle button swaps all `data-i18n*` strings, rebuilds visible cards from the same ID, stores `fz-lang` locally. Scroll offset and IDs are untouched. Usernames stay Latin.

**IDs:** strings only (`normId`, `incId`, FNV-1a `seed`) – never Number/parseInt. Leading zeros stripped; `0` is rejected (not positive); Arabic-Indic digits are accepted. Search resolves any ID directly (O(digits)) without generating smaller IDs. No digit cap in code.

**Feed:** 360 ids at start; whenever (ready + queued − reader position) < 260 a 300-batch is queued (first trigger ≈ profile 100). One ordered worker (idle-callback chunks of 100) prevents duplicates; failures reset and retry. Fixed-height virtual cells keep the DOM to ~a screenful; spacer height grows, so the viewport never jumps. The page never calls scrollTo. The search group hides on downward scroll (6px dead-zone), returns on upward scroll or at top, and stays visible while the input is focused.

**Sources:** `SRC` in `script.js` lists references with *paraphrased meanings* (not Quranic text), written without live source access. **Verify every reference and the Hadith wording against reliable collections before publishing.**

## Known limitations (honest)
- Art is procedural stylised SVG figures, **not realistic photographic faces**; no bundled/licensed image assets. Variety comes from 10 scenes × 6 poses × seeded colours.
- Browsers cap element height (~17–33M px), which bounds scroll length to roughly tens of thousands of cards per session; a coordinate-remapping scheme would be needed to lift it.
- No particle effects; only a gentle water shimmer (disabled under reduced motion).
- Only the ID/string logic was tested (Node). No real-browser, Android, accessibility, memory or layout-shift testing was done.
