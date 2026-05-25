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
  accent: "#0EA5E9",       // sky-505
  accentMuted: "#E0F2FE",  // sky-100

  // Channel-specific colors
  channelWhatsapp: "#22C55E", // WhatsApp green
  channelWhatsappBg: "#DCFCE7",
  channelEmail: "#3B82F6",    // Email blue
  channelEmailBg: "#DBEAFE",
  channelCall: "#F59E0B",     // Call amber
  channelCallBg: "#FEF3C7",

  // Status-specific (mirrors STATUS_META below)
  statusNew: "#3B82F6",        // New blue
  statusProcessing: "#F59E0B", // amber-500
  statusSopMatched: "#10B981", // Qualified green
  statusEscalated: "#EF4444",  // Escalated red

  // Status backgrounds (light tints for badges)
  statusNewBg: "#EFF6FF",      // blue-50
  statusProcessingBg: "#FFFBEB",
  statusSopMatchedBg: "#ECFDF5",
  statusEscalatedBg: "#FEF2F2",

  // Semantic
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
};
