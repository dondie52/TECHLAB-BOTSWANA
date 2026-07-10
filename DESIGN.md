---
name: TechLab Botswana
description: Clean white ground with verdant green accent and documentary tech imagery. Practical local IT brand for Botswana. Dark mode follows system preference.

colors:
  ground: "oklch(99.2% 0.004 195)"
  ground-deep: "oklch(96.5% 0.008 195)"
  surface: "oklch(100% 0 0)"
  surface-raised: "oklch(98% 0.006 195)"
  ink: "oklch(18% 0.02 195)"
  ink-muted: "oklch(36% 0.018 195)"
  ink-faint: "oklch(52% 0.014 195)"
  accent-green: "oklch(48% 0.13 155)"
  accent-green-deep: "oklch(40% 0.12 155)"
  accent-gold: "oklch(52% 0.1 85)"
  accent-blue: "oklch(48% 0.1 240)"
  line: "oklch(18% 0.02 195 / 0.12)"
  line-strong: "oklch(48% 0.13 155 / 0.4)"
  dark-ground: "oklch(12% 0.012 195)"
  dark-ink: "oklch(96% 0.008 195)"
  dark-accent-green: "oklch(68% 0.16 155)"

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

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"

imagery:
  style: documentary tech photography
  context: Southern African workshop and install scenes
  treatment: warm natural light, shallow depth of field, no text overlays
  hero: full-bleed with dark scrim for text legibility
  chapters: 4:3 crop inside framed panels
  map: stylized Botswana outline with Mahalapye highlight

hero:
  budget: brand + one headline + one short support line + CTA group + full-bleed image
  exclude: phone address hours stats promo chips
  contact: post-hero strip and contact section

motion:
  library: GSAP ScrollTrigger + Lenis
  easing: power3.out, no bounce or elastic
  uiTransitions: "150-220ms color/opacity/border only"
  hover: no layout-shifting scale or translate
  parallax: subtle y-shift and scale on images, disabled for reduced-motion
  reveals: content visible by default; motion enhances, never gates visibility
  decorativeLoops: disabled under prefers-reduced-motion

interaction:
  cursor: pointer on all clickable controls
  focus: visible focus-visible ring using green tint
  checklist: design-system/techlab-botswana/MASTER.md
