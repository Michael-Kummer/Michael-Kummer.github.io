# Pixel art style guide

Every animated scene on the site (the Alberta panorama along the bottom) follows these rules so they read as one world. The palette and drawing helpers live in
`assets/js/pixel/engine.js`; scenes may only use what is defined there.

## Look

Old Metroidvania: dense, hand-placed detail, chunky cartoon proportions, a slightly gothic mood
(deep violet shadows, pointed roofs, crescent moon, bats, candle light). Serious, never goofy.

## Grid: two tiers

The world is drawn at two pixel sizes, like a game's map view and its close-up rooms:

| Tier | Screen px per art px | Used for |
| --- | --- | --- |
| Landscape (far) | 3 on desktop, 2 on phones | the Alberta panorama and the sidebar strip |
| Close-up (near) | 2 on desktop | reserved for close-up scenes (none at the moment) |

- The close-up tier has about 1.5 times the art pixels in each direction, so it carries the fine
  detail: faces, hands, props, room furniture. Within a tier, everything shares one grid.
- Never mix tiers inside one scene, never scale by fractions, never smooth
  (`image-rendering: pixelated`), never draw off the grid.
- Scenes are drawn at their art resolution and scaled up by CSS. No anti-aliasing anywhere.

## Colour

- Only the ramps in the engine's palette. Each ramp runs dark to light and is **hue-shifted**:
  shadows lean violet/blue, highlights lean warm/yellow. Never darken with black or lighten with white.
- The darkest outline colour is `ink` (a violet black), not `#000`.
- Light comes from the **upper left**. Lit faces take the ramp's upper steps, shadow faces the lower
  steps, with one step of rim light on the lit edge of foreground objects.
- 3 tones plus a highlight per material. No pillow shading (shading that follows the outline).

## Outlines

- Foreground sprites (people, the owl, machines, buildings) get a 1px outline: `ink` on the shadow
  side, the material's darkest ramp step on the lit side (selective outlining).
- Background layers (mountains, hills, far fields) have no outlines; they separate by value.
  The farther the layer, the lighter and bluer it is (atmospheric perspective).

## Dithering

- Ordered (4x4 Bayer) dithering only, and only for large gradients: sky, haze, the dissolve where a
  scene meets the page, glow around lights. No dithering on small sprites.

## Day and night

- Light mode is day, dark mode is night. Night is not a separate drawing: every colour is graded
  toward moonlit blue by the engine. Light sources (windows, lamps, screens, candles, stars, the moon,
  aurora) are drawn as *glow* and skip the grade, so they pop at night.

## Characters

- Close-up people are about 40 art pixels tall (36 to 44 with hats and hair), about 3 heads tall.
  They come from the shared rig in `people.js`: a hand-drawn head (eyes with whites, a pupil and a
  highlight, brows, nose, mouth, ear), swappable hair with 3 to 4 steps and a highlight, a torso
  shaded in 4 steps, and jointed arms, hands and legs posed by angle. Every part gets its own
  selective outline, so overlapping limbs stay readable.
- Looks (skin, hair, clothes, hard hat, vest, apron, glasses, lanyard) are recoloured per role from
  the palette; proportions never change between rooms.
- People always do something believable: work cycles, walks with turnarounds, idle breathing (a 1px
  torso bob), blinks, and secondary motion (hair, tools, steam).
- Figures in the landscape tier stay small and simple (the compact `person` rig in `engine.js`
  is for them): at that distance a silhouette reads better than detail.

## Motion

- Stepped animation at 10 frames per second; hold key poses rather than tweening.
- Loops are 2 to 8 frames. Big actions have anticipation and impact (the hammer cocks back and holds
  before it falls). Walks are 8-frame cycles locked to the distance travelled, so feet never slide.
- Secondary motion (hair, leaves, steam) runs offset from the main action.
- Ambient motion only: nothing flashes, nothing moves fast near text.
- With "reduce motion" turned on, scenes draw one still frame. Scenes pause when off-screen or when
  the tab is hidden.

## Placement

- Scenes never sit behind body text. They live under the footer, at the bottom of the sidebar below
  the icons, and in the empty column beside the post list.
- Scenes are background: below the cards, the topbar and every control in stacking order, never
  overlapping them, and they never move or resize page content.
- Scenes are decoration: `aria-hidden`, no pointer events.
