import { APPS_SCRIPT_URL } from "./constants";
import type { ApiParams, ApiPostBody, ApiResponse } from "./types";

// --- API ---
export async function apiGet(params: ApiParams): Promise<ApiResponse> {
  const url = new URL(APPS_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json() as Promise<ApiResponse>;
}

export async function apiPost(body: ApiPostBody): Promise<ApiResponse> {
  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: formData,
  });
  return res.json() as Promise<ApiResponse>;
}