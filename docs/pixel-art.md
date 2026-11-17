# Pixel art style guide

Every animated scene on the site (the Alberta panorama along the bottom) follows these rules so they read as one world. The palette and drawing helpers live in
`assets/js/pixel/engine.js`; scenes may only use what is defined there.

## Look

Old Metroidvania: dense, hand-placed detail, chunky cartoon proportions, a slightly gothic mood
(deep violet shadows, pointed roofs, crescent moon, bats, candle light). Serious, never goofy.

## Grid

- One grid for the whole band: 3 screen px per art px on desktop, 2 on phones. Everything shares it.
- Never scale by fractions, never smooth (`image-rendering: pixelated`), never draw off the grid.
- Scenes are drawn at their art resolution and scaled up by CSS. No anti-aliasing anywhere.

## Colour

- Only the ramps in the engine's palette. Each ramp runs dark to light and is **hue-shifted**:
  shadows lean violet/blue, highlights lean warm/yellow. Never darken with black or lighten with white.
- The darkest outline colour is `ink` (a violet black), not `#000`.
- Light comes from the **upper left**. Lit faces take the ramp's upper steps, shadow faces the lower
  steps, with one step of rim light on the lit edge of foreground objects.
- 3 tones plus a highlight per material. No pillow shading (shading that follows the outline).

## Outlines

- Foreground sprites (machines, buildings, signs) get a 1px outline: `ink` on the shadow
  side, the material's darkest ramp step on the lit side (selective outlining).
- Background layers (mountains, hills, far fields) have no outlines; they separate by value.
  The farther the layer, the lighter and bluer it is (atmospheric perspective).

## Dithering

- Ordered (4x4 Bayer) dithering only, and only for large gradients: sky, haze, the dissolve where a
  scene meets the page, glow around lights. No dithering on small sprites.
- Biomes meet in the foreground in a ragged, dithered seam about 8 art px wide, never a straight cut.

## Day and night

- Light mode is day, dark mode is night. Night is not a separate drawing: every colour is graded
  toward moonlit blue by the engine. Light sources (windows, lamps, screens, candles, stars, the moon,
  aurora) are drawn as *glow* and skip the grade, so they pop at night.

## No people

- The scenes have no people or faces. Tell the story with land, buildings, machines and animals.

## Motion

- Stepped animation at 10 frames per second; hold key poses rather than tweening.
- Loops are 2 to 8 frames. Big actions have anticipation and impact.
- Secondary motion (leaves, smoke, wheat) runs offset from the main action.
- Ambient motion only: nothing flashes, nothing moves fast near text.
- With "reduce motion" turned on, scenes draw one still frame. Scenes pause when off-screen or when
  the tab is hidden.

## Placement

- Scenes never sit behind body text. The band runs along the bottom, right of the sidebar: at the
  end of the page on most pages, fixed to the window on posts with the article column cut out of it.
  The sidebar strip under the icons is fixed at the same height, so they meet as one picture.
- Scenes are background: below the content and every control in stacking order, and they never move
  or resize page content.
- Scenes are decoration: `aria-hidden`, no pointer events (except the icon plates and the sign link).
