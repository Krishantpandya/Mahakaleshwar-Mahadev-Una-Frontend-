export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\\/+$/, "");
export type Admin = { id: string; email: string };
export type Photo = {
  id: string; media_url: string; mime_type: string; file_size_bytes: number;
  original_filename?: string; caption?: string | null; photo_date: string;
  uploaded_at: string; published_at: string | null;
};
type PhotoResponse = { data: Photo[]; pagination: { total: number; limit: number; offset: number } };
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init, credentials: "include",
    headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init.headers }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  return payload as T;
}
export const api = {
  me: () => request<{ authenticated: true; admin: Admin }>("/api/v1/admin/auth/me"),
  login: (email: string, password: string) => request<{ authenticated: true; admin: Admin }>("/api/v1/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<{ authenticated: false }>("/api/v1/admin/auth/logout", { method: "POST" }),
  photos: (params: URLSearchParams) => request<PhotoResponse>(`/api/v1/admin/photos?${params.toString()}`),
  publish: (id: string, published: boolean) => request<{ data: Photo }>(`/api/v1/admin/photos/${id}/${published ? "publish" : "unpublish"}`, { method: "POST" })
};