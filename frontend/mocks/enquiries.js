/**
 * Mock enquiry data mirroring the backend Enquiry + Message + StatusTimeline models.
 * Shape matches GET /enquiry/{id}/history exactly so switching to real API
 * later is a drop-in replace in services/api.js.
 */

export const MOCK_ENQUIRIES = [
  {
    id: "a1b2c3d4-0001-4abc-8def-000000000001",
    customer_name: "Sarah Mitchell",
    channel: "whatsapp",
    status: "sop_matched",
    sop_match: "Booking Enquiry",
    suggested_response:
      "Thank you for reaching out. We'd be glad to book you in. " +
      "Please let us know your preferred date and time and we'll confirm your appointment shortly.",
    escalation_reason: null,
    created_at: "2026-05-25T06:10:00Z",
    messages: [
      {
        id: "msg-0001-a",
        sender: "customer",
        content:
          "Hi there, I'd like to book an appointment for next Thursday afternoon if possible.",
        timestamp: "2026-05-25T06:10:00Z",
      },
      {
        id: "msg-0001-b",
        sender: "ai",
        content:
          "Thank you for reaching out. We'd be glad to book you in. " +
          "Please let us know your preferred date and time and we'll confirm your appointment shortly.",
        timestamp: "2026-05-25T06:10:02Z",
      },
    ],
    timeline: [
      {
        status: "queued",
        note: "Enquiry received",
        timestamp: "2026-05-25T06:10:00Z",
      },
      {
        status: "processing",
        note: "Background task started",
        timestamp: "2026-05-25T06:10:01Z",
      },
      {
        status: "sop_matched",
        note: "Matched SOP: Booking Enquiry",
        timestamp: "2026-05-25T06:10:02Z",
      },
    ],
  },

  {
    id: "a1b2c3d4-0002-4abc-8def-000000000002",
    customer_name: "Tariq Osman",
    channel: "email",
    status: "escalated",
    sop_match: null,
    suggested_response: null,
    escalation_reason:
      "Customer is requesting to speak directly with a senior manager regarding a billing dispute.",
    created_at: "2026-05-25T05:48:00Z",
    messages: [
      {
        id: "msg-0002-a",
        sender: "customer",
        content:
          "This is absolutely unacceptable. I was charged twice for the same service and nobody has responded to my previous emails. I want to speak to a manager immediately.",
        timestamp: "2026-05-25T05:48:00Z",
      },
      {
        id: "msg-0002-b",
        sender: "ai",
        content:
          "Your enquiry has been escalated to a human agent for further review.",
        timestamp: "2026-05-25T05:48:03Z",
      },
    ],
    timeline: [
      {
        status: "queued",
        note: "Enquiry received",
        timestamp: "2026-05-25T05:48:00Z",
      },
      {
        status: "processing",
        note: "Background task started",
        timestamp: "2026-05-25T05:48:01Z",
      },
      {
        status: "escalated",
        note: "Auto-escalated: no SOP match found",
        timestamp: "2026-05-25T05:48:03Z",
      },
      {
        status: "escalated",
        note: "Manually escalated: Customer is requesting to speak directly with a senior manager regarding a billing dispute.",
        timestamp: "2026-05-25T05:55:00Z",
      },
    ],
  },

  {
    id: "a1b2c3d4-0003-4abc-8def-000000000003",
    customer_name: "Priya Nair",
    channel: "call",
    status: "sop_matched",
    sop_match: "Pricing Question",
    suggested_response:
      "Our pricing depends on the specific service you're interested in. " +
      "Could you share more details so we can give you an accurate quote?",
    escalation_reason: null,
    created_at: "2026-05-25T04:22:00Z",
    messages: [
      {
        id: "msg-0003-a",
        sender: "customer",
        content:
          "Hi, I wanted to know how much you charge for a monthly cleaning package for a 3-bedroom flat?",
        timestamp: "2026-05-25T04:22:00Z",
      },
      {
        id: "msg-0003-b",
        sender: "ai",
        content:
          "Our pricing depends on the specific service you're interested in. " +
          "Could you share more details so we can give you an accurate quote?",
        timestamp: "2026-05-25T04:22:02Z",
      },
    ],
    timeline: [
      {
        status: "queued",
        note: "Enquiry received",
        timestamp: "2026-05-25T04:22:00Z",
      },
      {
        status: "processing",
        note: "Background task started",
        timestamp: "2026-05-25T04:22:01Z",
      },
      {
        status: "sop_matched",
        note: "Matched SOP: Pricing Question",
        timestamp: "2026-05-25T04:22:02Z",
      },
    ],
  },

  {
    id: "a1b2c3d4-0004-4abc-8def-000000000004",
    customer_name: "James Whitfield",
    channel: "whatsapp",
    status: "escalated",
    sop_match: null,
    suggested_response: null,
    escalation_reason:
      "No SOP matched for inbound message. Flagged for human review.",
    created_at: "2026-05-25T03:05:00Z",
    messages: [
      {
        id: "msg-0004-a",
        sender: "customer",
        content:
          "I need to discuss something very specific about the contract terms from last year's agreement. Can someone call me back today?",
        timestamp: "2026-05-25T03:05:00Z",
      },
      {
        id: "msg-0004-b",
        sender: "ai",
        content:
          "Your enquiry has been escalated to a human agent for further review.",
        timestamp: "2026-05-25T03:05:04Z",
      },
    ],
    timeline: [
      {
        status: "queued",
        note: "Enquiry received",
        timestamp: "2026-05-25T03:05:00Z",
      },
      {
        status: "processing",
        note: "Background task started",
        timestamp: "2026-05-25T03:05:01Z",
      },
      {
        status: "escalated",
        note: "Auto-escalated: no SOP match found",
        timestamp: "2026-05-25T03:05:04Z",
      },
    ],
  },

  {
    id: "a1b2c3d4-0005-4abc-8def-000000000005",
    customer_name: "Fatima Al-Hassan",
    channel: "email",
    status: "sop_matched",
    sop_match: "After-Hours Message",
    suggested_response:
      "Unfortunately our office is currently closed. " +
      "We'll get back to you during business hours which are Monday to Friday between 9am and 6pm. " +
      "For urgent matters, please call our emergency line.",
    escalation_reason: null,
    created_at: "2026-05-24T22:47:00Z",
    messages: [
      {
        id: "msg-0005-a",
        sender: "customer",
        content:
          "Hello, I'm emailing after hours — do you have weekend availability for a consultation?",
        timestamp: "2026-05-24T22:47:00Z",
      },
      {
        id: "msg-0005-b",
        sender: "ai",
        content:
          "Unfortunately our office is currently closed. " +
          "We'll get back to you during business hours which are Monday to Friday between 9am and 6pm. " +
          "For urgent matters, please call our emergency line.",
        timestamp: "2026-05-24T22:47:02Z",
      },
    ],
    timeline: [
      {
        status: "queued",
        note: "Enquiry received",
        timestamp: "2026-05-24T22:47:00Z",
      },
      {
        status: "processing",
        note: "Background task started",
        timestamp: "2026-05-24T22:47:01Z",
      },
      {
        status: "sop_matched",
        note: "Matched SOP: After-Hours Message",
        timestamp: "2026-05-24T22:47:02Z",
      },
    ],
  },

  {
    id: "a1b2c3d4-0006-4abc-8def-000000000006",
    customer_name: "Chloe Bergman",
    channel: "whatsapp",
    status: "sop_matched",
    sop_match: "General Follow-Up",
    suggested_response:
      "Thank you for the follow up. We're looking into your enquiry and will have an update for you shortly.",
    escalation_reason: null,
    created_at: "2026-05-25T07:30:00Z",
    messages: [
      {
        id: "msg-0006-a",
        sender: "customer",
        content:
          "Hi, just following up on my booking request from yesterday — any update on availability?",
        timestamp: "2026-05-25T07:30:00Z",
      },
      {
        id: "msg-0006-b",
        sender: "ai",
        content:
          "Thank you for the follow up. We're looking into your enquiry and will have an update for you shortly.",
        timestamp: "2026-05-25T07:30:02Z",
      },
    ],
    timeline: [
      {
        status: "queued",
        note: "Enquiry received",
        timestamp: "2026-05-25T07:30:00Z",
      },
      {
        status: "processing",
        note: "Background task started",
        timestamp: "2026-05-25T07:30:01Z",
      },
      {
        status: "sop_matched",
        note: "Matched SOP: General Follow-Up",
        timestamp: "2026-05-25T07:30:02Z",
      },
    ],
  },
];

/**
 * Look up a single mock enquiry by id.
 * Returns undefined if not found — matching real API 404 behaviour.
 */
export function getMockEnquiryById(id) {
  return MOCK_ENQUIRIES.find((e) => e.id === id);
}
