import { MOCK_ENQUIRIES, getMockEnquiryById } from "../mocks/enquiries";

/**
 * Simulated async API layer.
 *
 * All functions are async and return shaped data that matches the real
 * backend response contracts exactly. Swapping to real HTTP calls later
 * means replacing the function bodies only — callers stay untouched.
 *
 * A small artificial delay simulates network latency so loading states
 * are exercised during development.
 */

const SIMULATED_DELAY_MS = 400;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * GET /enquiry — returns the full list of enquiries.
 * Real backend doesn't have a list endpoint yet; this is forward-looking.
 */
export async function fetchEnquiries() {
  await delay(SIMULATED_DELAY_MS);
  return [...MOCK_ENQUIRIES];
}

/**
 * GET /enquiry/{id}/history
 * Returns a single enquiry with messages[] and timeline[].
 * Throws if not found — matching real API 404 behaviour.
 */
export async function fetchEnquiryHistory(id) {
  await delay(SIMULATED_DELAY_MS);
  const enquiry = getMockEnquiryById(id);
  if (!enquiry) {
    throw new Error(`Enquiry not found: ${id}`);
  }
  return enquiry;
}

/**
 * POST /enquiry/{id}/escalate
 * Placeholder — mutates nothing in mock mode.
 */
export async function escalateEnquiry(id, reason) {
  await delay(SIMULATED_DELAY_MS);
  const enquiry = getMockEnquiryById(id);
  if (!enquiry) {
    throw new Error(`Enquiry not found: ${id}`);
  }
  // Real implementation will POST to backend and return updated enquiry
  return { ...enquiry, status: "escalated", escalation_reason: reason };
}

/**
 * POST /enquiry/{id}/followup
 * Placeholder — returns a mock followup record.
 */
export async function scheduleFollowUp(id, { delay_minutes, message_template }) {
  await delay(SIMULATED_DELAY_MS);
  const enquiry = getMockEnquiryById(id);
  if (!enquiry) {
    throw new Error(`Enquiry not found: ${id}`);
  }
  return {
    id: `followup-mock-${Date.now()}`,
    enquiry_id: id,
    delay_minutes,
    message_template: message_template ?? null,
    done: false,
  };
}

/**
 * Mutates the in-memory mock enquiries array for real-time dashboard simulations.
 */
export async function addMockEnquiry(enquiry) {
  MOCK_ENQUIRIES.unshift(enquiry);
  return enquiry;
}

export async function updateMockEnquiry(id, updates) {
  const index = MOCK_ENQUIRIES.findIndex(e => e.id === id);
  if (index !== -1) {
    MOCK_ENQUIRIES[index] = { ...MOCK_ENQUIRIES[index], ...updates };
    return MOCK_ENQUIRIES[index];
  }
  throw new Error(`Enquiry not found: ${id}`);
}

