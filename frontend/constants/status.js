import { Colors } from "./colors";

/**
 * Status metadata — single source of truth for labels, colors, and ordering.
 * Mirrors the backend StatusEnum: new | processing | sop_matched | escalated
 *
 * Add a new status here and every screen picks it up automatically.
 */
export const STATUS_META = {
  new: {
    label: "New",
    color: Colors.statusNew,
    backgroundColor: Colors.statusNewBg,
    description: "Enquiry received, not yet queued for processing.",
  },
  queued: {
    label: "Queued",
    color: Colors.statusNew,
    backgroundColor: Colors.statusNewBg,
    description: "Enquiry queued and waiting for the background task.",
  },
  processing: {
    label: "Processing",
    color: Colors.statusProcessing,
    backgroundColor: Colors.statusProcessingBg,
    description: "Background task is currently running SOP matching.",
  },
  sop_matched: {
    label: "Qualified",
    color: Colors.statusSopMatched,
    backgroundColor: Colors.statusSopMatchedBg,
    description: "A Standard Operating Procedure was matched and a response suggested.",
  },
  escalated: {
    label: "Escalated",
    color: Colors.statusEscalated,
    backgroundColor: Colors.statusEscalatedBg,
    description: "Enquiry flagged for human agent review.",
  },
};

export function getChannelBadgeStyle(channel) {
  switch (channel) {
    case "whatsapp":
      return {
        color: Colors.channelWhatsapp,
        backgroundColor: Colors.channelWhatsappBg,
        label: "WhatsApp",
      };
    case "email":
      return {
        color: Colors.channelEmail,
        backgroundColor: Colors.channelEmailBg,
        label: "Email",
      };
    case "call":
      return {
        color: Colors.channelCall,
        backgroundColor: Colors.channelCallBg,
        label: "Call",
      };
    default:
      return {
        color: Colors.textSecondary,
        backgroundColor: Colors.border,
        label: channel ?? "Unknown",
      };
  }
}

/**
 * Safe lookup with a fallback for unknown statuses from the API.
 */
export function getStatusMeta(status) {
  return (
    STATUS_META[status] ?? {
      label: status ?? "Unknown",
      color: Colors.textMuted,
      backgroundColor: Colors.border,
      description: "Unknown status.",
    }
  );
}

/**
 * Channel display labels — mirrors backend ChannelEnum.
 */
export const CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  email: "Email",
  call: "Call",
};

export function getChannelLabel(channel) {
  return CHANNEL_LABELS[channel] ?? channel;
}

/**
 * Format ISO datetime strings into consistent, readable operational support logs.
 * Example: "May 25, 06:10"
 */
export function formatDateTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

