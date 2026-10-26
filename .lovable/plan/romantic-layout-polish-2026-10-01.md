# Romantic layout polish

## What will change

- Move the 3D companion out of the fixed full-screen layer and place him in a dedicated finale area, with a contained interaction zone and speech bubble that cannot cover story content.
- Add safe top spacing to the letter, gallery overlay, opening/full-screen scenes, and other expanded panels so the music controls never obscure headings.
- Strengthen the open letter signature with a rich burgundy ink color and subtle readable emphasis.
- Refine timeline cards with a prominent date badge, stable mobile layout, and collision-free expansion.
- Tune the 15-reasons grid for narrow phones, improve back-face contrast, and preserve a smooth flip without layout shifts.
- Make the final “Forever & Always” control auto-sized, non-clipping, and generously padded.
- Verify the complete phone flow, including companion visibility, card flips, letter, timeline expansion, and finale layout.

## Technical details

- Keep the current wine, gold, rose, glass, serif, and script design system.
- Reuse the existing Three.js model and animations, but contain its canvas in normal document flow near the finale.
- Use responsive CSS constraints and semantic design tokens; no new features or content.
