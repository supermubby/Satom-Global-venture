/**
 * Public Order API client — used by the customer-facing order form.
 * Reuses the same request() helper pattern as admin.ts (without JWT).
 */

import { API_BASE } from "./admin";

// ── Types matching the backend response ─────────────────────────────────────────
export interface OrderCreatedResponse {
  message: string;
  order_id: string;
  order: import("./admin").OrderSummary;
}

// ── Request payload type matching backend OrderCreate schema ────────────────────
export interface OrderCreatePayload {
  customer: {
    full_name: string;
    email: string;
    phone_number: string;
  };
  service_name: string;
  service_description: string | null;
  installation_address: string;
  state_city: string;
  total_price: number;
  special_instructions: string | null;
}

// ── API call ────────────────────────────────────────────────────────────────────
export async function createOrder(
  payload: OrderCreatePayload
): Promise<OrderCreatedResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 204) {
    return undefined as unknown as OrderCreatedResponse;
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}