---
name: Kinetic Enterprise
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#584237'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8c7164'
  outline-variant: '#e0c0b1'
  surface-tint: '#9d4300'
  primary: '#9d4300'
  on-primary: '#ffffff'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#ffb690'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#5a5f62'
  on-tertiary: '#ffffff'
  tertiary-container: '#969b9f'
  on-tertiary-container: '#2e3336'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dfe3e7'
  tertiary-fixed-dim: '#c3c7cb'
  on-tertiary-fixed: '#171c1f'
  on-tertiary-fixed-variant: '#43474b'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

This design system is built for high-performance enterprise environments where clarity and speed are paramount. The personality is utilitarian yet energized, prioritizing information density without sacrificing visual breathing room.

The aesthetic follows a **Refined Minimalism** approach. It avoids decorative flourishes like gradients or blurs, relying instead on strict grid alignment, purposeful whitespace, and a high-contrast primary accent to guide user intent. The emotional response should be one of reliability, precision, and systematic efficiency.

## Colors

The palette is anchored by a high-visibility **Action Orange** (#F97316) used exclusively for primary interactions and critical states. 

- **Primary:** Used for the main call-to-action buttons, active navigation states, and progress indicators.
- **Surface:** The background remains a pure white (#FFFFFF) to maximize contrast with text.
- **Typography:** Headings utilize a deep Dark Charcoal (#171717) for maximum legibility. Secondary text and metadata use a Slate Gray (#64748B) to establish a clear information hierarchy.
- **Borders:** A consistent light gray (#E5E7EB) defines structure without adding visual noise.

## Typography

The design system utilizes **Inter** across all levels to maintain a systematic, neutral, and highly legible interface. 

Tight letter-spacing is applied to larger display type to maintain visual tension, while body text uses standard spacing for long-form readability. Use `label-sm` specifically for table headers and small metadata tags to differentiate from interactive body text.

## Layout & Spacing

This design system uses a **12-column fluid grid** for internal application pages, transitioning to a centered **fixed grid** (max 1440px) for dashboard views. 

- **Spacing Rhythm:** Based on a 4px baseline. Most components should utilize 16px (md) for internal padding and 24px (lg) for section margins.
- **Mobile:** Margins shrink to 16px. Grids collapse to a single column.
- **Density:** In data-heavy views (tables/lists), vertical padding may be reduced to 8px (sm) to increase information density, while maintaining 24px horizontal gutters to prevent crowding.

## Elevation & Depth

To maintain the minimal enterprise aesthetic, this design system rejects heavy shadows. Depth is communicated through **Tonal Layering** and **Subtle Outlines**:

- **Level 0 (Background):** Pure white (#FFFFFF).
- **Level 1 (Cards/Sections):** White surface with a 1px solid border (#E5E7EB). No shadow.
- **Level 2 (Overlays/Modals):** White surface with a 1px solid border and a very soft, diffused ambient shadow (0px 10px 15px -3px rgba(0, 0, 0, 0.05)) to suggest lift without looking "heavy."
- **Interaction:** Hover states on interactive cards should transition the border color from light gray to the primary orange or a darker gray, rather than increasing shadow depth.

## Shapes

The shape language is disciplined and professional. A standard **8px (0.5rem)** radius is applied to almost all UI containers including cards, input fields, and buttons.

- **Standard (8px):** Primary buttons, input fields, and small cards.
- **Large (16px):** Main content containers or dashboard widgets.
- **Pill:** Reserved exclusively for status "Chips" (e.g., "Active", "Pending") to distinguish them from interactive buttons.

## Components

- **Buttons:** 
  - *Primary:* Solid #F97316 background with White text. No gradient. 
  - *Secondary:* White background with #E5E7EB border and #171717 text.
- **Input Fields:** 1px border (#E5E7EB). On focus, the border changes to #F97316 with a subtle 2px outer glow of the same color at 10% opacity.
- **Cards:** White background, 1px border (#E5E7EB), 8px corner radius. Use for grouping related data or dashboard modules.
- **Navigation:**
  - *Sidebar:* Clean white or very light gray (#F8FAFC) background.
  - *Links:* Neutral gray (#64748B) text. Active state uses #171717 text with a 2px vertical orange line on the leading edge.
- **Data Tables:** Borderless rows with a 1px bottom divider (#F1F5F9). Header row uses `label-sm` typography with a subtle gray background tint.
- **Chips/Badges:** Small, pill-shaped, using low-saturation background tints with high-saturation text for status signaling (e.g., Light Green background with Dark Green text).