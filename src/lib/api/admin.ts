/**
 * Admin API client - handles JWT auth and all admin endpoints.
 */

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  admin: AdminUser;
}

export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  confirmed_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_customers: number;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export interface OrderSummary {
  id: string;
  customer: Customer;
  service_name: string;
  service_description: string | null;
  installation_address: string;
  state_city: string;
  total_price: number;
  order_status: string;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
}

// ── Token Management ───────────────────────────────────────────────────────────
const TOKEN_KEY = "admin_access_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── API Helpers ────────────────────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────────────────────
export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  storeToken(data.access_token);
  return data;
}

export async function getMe(): Promise<AdminUser> {
  return request<AdminUser>("/api/admin/me");
}

export function logout(): void {
  clearToken();
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/api/admin/dashboard");
}

// ── Orders ─────────────────────────────────────────────────────────────────────
export async function getOrders(): Promise<OrderSummary[]> {
  return request<OrderSummary[]>("/api/admin/orders");
}

export async function getOrder(id: string): Promise<OrderSummary> {
  return request<OrderSummary>(`/api/admin/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  data: { order_status?: string; total_price?: number }
): Promise<OrderSummary> {
  return request<OrderSummary>(`/api/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  return request<void>(`/api/admin/orders/${id}`, {
    method: "DELETE",
  });
}

// ── Customers ──────────────────────────────────────────────────────────────────
export async function getCustomers(): Promise<Customer[]> {
  return request<Customer[]>("/api/admin/customers");
}

export async function getCustomer(id: string): Promise<Customer> {
  return request<Customer>(`/api/admin/customers/${id}`);
}