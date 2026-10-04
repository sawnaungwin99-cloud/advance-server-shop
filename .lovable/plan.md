# Christmas Flash Sale Theme

## What will change
- Add a separate Christmas theme on/off setting to the existing flash-sale settings, controlled from the admin panel.
- Add a Burmese admin toggle for the Christmas decoration while keeping the current flash-sale controls intact.
- When enabled, decorate the active flash-sale area with softly falling snow, varied snowflakes, and layered snow buildup along the edges.
- Keep the content and buy buttons readable, avoid overlap, support mobile screens, and stop animation for visitors who prefer reduced motion.

## Technical details
- Add `is_christmas_theme` as a boolean database field with a safe default of `false`.
- Update generated database typings and the flash-sale settings update payload.
- Render the Christmas visuals only when the flash sale is active and the new setting is enabled; Christmas takes visual priority if another festival theme is also enabled.
- Use lightweight CSS/SVG decoration without changing checkout, pricing, inventory, or sale timing behavior.
- Verify the database change, compile result, and the active Christmas appearance in desktop and mobile previews.
