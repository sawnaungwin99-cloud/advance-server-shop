# Rainy Season Flash Sale Decoration

## What will change
- Add a persistent, independent “Rainy Season Promotion” switch to the existing Admin flash-sale controls.
- Add a third seasonal effect layer to the Flash Sale section without removing or changing Winter snow, Summer leaves/branches, pricing, countdowns, or purchase actions.
- Create a dark Myanmar monsoon treatment using layered charcoal clouds, angled rain with varied depth, restrained lightning, mist, droplets, and wet frame highlights.
- Keep every decoration behind or around readable content, non-clickable, clipped inside the existing card, and responsive on phones, tablets, and desktop.

## Multiple-season behavior
- Winter, Summer, and Rainy settings remain independently saved and can all be enabled together.
- When multiple effects are active, reduce their visual intensity and layer them safely rather than automatically changing any switch.
- Preserve the existing Christmas priority rule for the earlier Thadingyut decoration; Rainy and Summer remain independent.

## Technical details
- Add `is_rainy_theme` to `flash_sale_settings` with a safe `false` default through an applied database migration.
- Update the generated database type and Admin save payload.
- Build lightweight CSS/SVG effects only: reusable cloud shapes, a limited fixed set of rain streaks, CSS haze/lightning, and no images, videos, OCR, or heavy libraries.
- Disable lightning and movement under reduced-motion preferences; reduce decorative density on small screens.
- Verify persistence wiring, compile health, and the Flash Sale appearance at desktop and mobile sizes without altering live seasonal settings.