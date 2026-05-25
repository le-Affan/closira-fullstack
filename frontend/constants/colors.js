/**
 * App colour palette.
 * Defined once here so every screen and component pulls from the same source.
 * Deliberately neutral — ready for branding later.
 */

export const Colors = {
  // Base surfaces
  background: "#F8FAFC",   // slate-50
  surface: "#FFFFFF",
  border: "#E2E8F0",       // slate-200

  // Text
  textPrimary: "#0F172A",  // slate-900
  textSecondary: "#475569", // slate-600
  textMuted: "#94A3B8",    // slate-400

  // Brand accent (placeholder — refine when branding lands)
  accent: "#0EA5E9",       // sky-500
  accentMuted: "#E0F2FE",  // sky-100

  // Status-specific (mirrors STATUS_META below)
  statusNew: "#6366F1",        // indigo-500
  statusProcessing: "#F59E0B", // amber-500
  statusSopMatched: "#10B981", // emerald-500
  statusEscalated: "#EF4444",  // red-500

  // Status backgrounds (light tints for badges)
  statusNewBg: "#EEF2FF",      // indigo-50
  statusProcessingBg: "#FFFBEB",
  statusSopMatchedBg: "#ECFDF5",
  statusEscalatedBg: "#FEF2F2",

  // Semantic
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
};
