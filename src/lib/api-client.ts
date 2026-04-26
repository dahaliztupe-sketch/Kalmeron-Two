import { auth } from "@/src/lib/firebase";

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  const headers = new Headers(init.headers || {});
  if (user) {
    try {
      const token = await user.getIdToken();
      headers.set("authorization", `Bearer ${token}`);
    } catch {}
  }
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return fetch(input, { ...init, headers });
}

export async function apiJson<T = unknown>(input: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(input, init);
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = (json as { message?: string; error?: string }).message || (json as { message?: string; error?: string }).error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}
