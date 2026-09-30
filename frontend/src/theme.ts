/**
 * Dark Industrial Design System Tokens
 * AP-Auditor Design System
 * 
 * Strict specifications:
 * - Background: #0A0A0C
 * - Accent: #0078D4
 * - Warning: #FFB900
 * - Error: #D13438
 * - Font: Inter / Segoe UI
 * - Geometry: Strict sharp edges (no rounded blobby shapes)
 * - Material: High-density acrylic glass with specular highlights & hairline borders
 */

export const industrialTheme = {
  colors: {
    bg: "#0A0A0C",
    bgElevated: "#12141A",
    surface: "#111217",
    panel: "rgba(14, 15, 20, 0.75)",
    panelHeavy: "rgba(10, 11, 15, 0.90)",
    border: "#1F222E",
    borderSubtle: "rgba(255, 255, 255, 0.08)",
    borderAcrylic: "rgba(255, 255, 255, 0.14)",
    
    // Core Semantic Brand Tokens
    accent: "#0078D4",
    accentHover: "#1084DE",
    accentActive: "#0063B1",
    accentMuted: "rgba(0, 120, 212, 0.16)",
    accentBorder: "rgba(0, 120, 212, 0.45)",
    accentGlow: "rgba(0, 120, 212, 0.35)",

    warning: "#FFB900",
    warningHover: "#FFC526",
    warningActive: "#DDA000",
    warningMuted: "rgba(255, 185, 0, 0.16)",
    warningBorder: "rgba(255, 185, 0, 0.45)",
    warningGlow: "rgba(255, 185, 0, 0.35)",

    error: "#D13438",
    errorHover: "#E04347",
    errorActive: "#B02327",
    errorMuted: "rgba(209, 52, 56, 0.16)",
    errorBorder: "rgba(209, 52, 56, 0.45)",
    errorGlow: "rgba(209, 52, 56, 0.35)",

    nominal: "#107C41",
    nominalBright: "#00CC6A",
    nominalMuted: "rgba(16, 124, 65, 0.16)",

    // Technical Grays / Steels
    steel: {
      900: "#13141B",
      800: "#1E202B",
      700: "#2B2E3D",
      600: "#3E4357",
      500: "#5A617C",
      400: "#7F88A8",
      300: "#A9B1CC",
      200: "#D3D7E5",
      100: "#F0F2F7",
    },

    // Typography
    text: {
      primary: "#F3F4F6",
      secondary: "#A2A7B5",
      muted: "#63697B",
      dim: "#404555",
      inverse: "#0A0A0C",
    }
  },

  fonts: {
    primary: "Inter, 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Consolas', 'Segoe UI Mono', monospace",
  },

  geometry: {
    radius: "0px", // STRICT: No rounded blobby shapes
    borderWidth: "1px",
    hairline: "0.5px",
    cutout: "8px", // 45-degree chamfer size
  },

  acrylic: {
    backdropFilter: "blur(18px) saturate(140%)",
    specularHighlight: "inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
    shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.6)",
  },

  // 3D Hex values for Three.js Color / Material instantiations
  three: {
    bgClear: 0x0A0A0C,
    gridMain: 0x0078D4,
    gridSubtle: 0x1A2234,
    accent: 0x0078D4,
    warning: 0xFFB900,
    error: 0xD13438,
    nominal: 0x00CC6A,
    chassisWireframe: 0x48587A,
    chassisMetal: 0x151720,
    specular: 0x88CCFF,
  }
} as const;

export type IndustrialTheme = typeof industrialTheme;

// Backward-compatibility export
export const theme = {
  bg: industrialTheme.colors.bg,
  accent: industrialTheme.colors.accent,
  warn: industrialTheme.colors.warning,
  error: industrialTheme.colors.error,
  font: industrialTheme.fonts.primary,
};