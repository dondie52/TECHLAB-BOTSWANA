---
name: TechLab Botswana
description: Warm lacquer-dark ground with verdant green accent and documentary tech imagery. Practical local IT brand for Botswana.

colors:
  ground: "oklch(12% 0.012 195)"
  ground-deep: "oklch(8% 0.01 195)"
  surface: "oklch(16% 0.014 195)"
  surface-raised: "oklch(20% 0.016 195)"
  ink: "oklch(96% 0.008 195)"
  ink-muted: "oklch(78% 0.012 195)"
  ink-faint: "oklch(65% 0.014 195)"
  accent-green: "oklch(68% 0.16 155)"
  accent-green-deep: "oklch(52% 0.14 155)"
  accent-gold: "oklch(78% 0.1 85)"
  accent-blue: "oklch(72% 0.1 240)"
  line: "oklch(96% 0.008 195 / 0.14)"
  line-strong: "oklch(68% 0.16 155 / 0.4)"

typography:
  display:
    fontFamily: "Epilogue, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Epilogue, system-ui, sans-serif"
    fontWeight: 600
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Epilogue, system-ui, sans-serif"
    fontWeight: 500
    fontSize: "0.82rem"
    letterSpacing: "0.06em"
    textTransform: "uppercase"

imagery:
  style: documentary tech photography
  context: Southern African workshop and install scenes
  treatment: warm natural light, shallow depth of field, no text overlays
  hero: full-bleed with dark scrim for text legibility
  chapters: 4:3 crop inside framed panels
  map: stylized Botswana outline with Mahalapye highlight

motion:
  library: GSAP ScrollTrigger + Lenis
  easing: power3.out, no bounce or elastic
  parallax: subtle y-shift and scale on images, disabled for reduced-motion
  reveals: content visible by default; motion enhances, never gates visibility
