---
name: General
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fc'
  surface-container: '#ebedf7'
  surface-container-high: '#e6e8f1'
  surface-container-highest: '#e0e2eb'
  on-surface: '#181c22'
  on-surface-variant: '#414753'
  inverse-surface: '#2d3037'
  inverse-on-surface: '#eef0fa'
  outline: '#717785'
  outline-variant: '#c1c6d5'
  surface-tint: '#005db8'
  primary: '#005cb8'
  on-primary: '#ffffff'
  primary-container: '#1275e2'
  on-primary-container: '#000512'
  inverse-primary: '#aac7ff'
  secondary: '#465f88'
  on-secondary: '#ffffff'
  secondary-container: '#b6d0ff'
  on-secondary-container: '#3f5881'
  tertiary: '#9a4600'
  on-tertiary: '#ffffff'
  tertiary-container: '#c05900'
  on-tertiary-container: '#0d0300'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#aec7f7'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#2d476f'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#763400'
  background: '#f9f9ff'
  on-background: '#181c22'
  surface-variant: '#e0e2eb'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# Design System Document

## Brand & Style
The design system adopts a **Corporate / Modern** style, characterized by a clean, reliable, and professional aesthetic. It balances utility with clarity, ensuring that digital tools and enterprise platforms feel intuitive and trustworthy. The visual language favors strong structural alignment, high legibility, and refined interactive feedback.

## Colors
The color system is built around a precise, accessible light mode palette designed for high contrast and modern digital interfaces.
- **Primary (`#1275e2`)**: A vibrant, dependable blue used for primary actions, active states, and key interactive elements.
- **Secondary (`#5f78a3`)**: A muted slate blue providing supportive contrast and balancing structural elements.
- **Tertiary (`#c55b00`)**: A warm amber accent reserved for highlights, calls-to-action, or critical indicators.
- **Neutral (`#74777f`)**: A balanced cool gray utilized for text, borders, and background surface differentiation.

## Typography
The typography scale utilizes **Inter** across all headline, body, and label roles. Inter provides exceptional legibility at small sizes and a modern geometric clarity for prominent headings. Scale steps are mathematically proportioned to maintain a strict vertical rhythm.

## Layout & Spacing
The layout utilizes a flexible grid system combined with a predictable spacing scale. Margins and gutters adapt fluidly across breakpoints, while component padding and internal element gaps adhere strictly to the 4px/8px-based spacing tokens (`space-xs` through `space-xl`).

## Elevation & Depth
Elevation is conveyed primarily through subtle tonal layers and soft ambient shadows. Depth cues help distinguish floating elements like modals, dropdowns, and cards from the base canvas without introducing heavy visual clutter.

## Shapes
The shape language uses a **Rounded** standard (level 2). Interactive components feature a base 0.5rem corner radius, while larger containers utilize scaled radii (1rem to 1.5rem), creating a friendly yet professional demeanor across all surfaces.

## Components
Components are styled to match the Inter typography, rounded geometry, and primary blue palette. Buttons feature clear hover/active states, input fields utilize subtle neutral borders with primary focus rings, and cards employ clean tonal backgrounds with rounded corners.