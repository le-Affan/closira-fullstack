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
    label: "SOP Matched",
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
