// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

const STORAGE_KEY = "weave:preview-token";
const QUERY_PARAM = "preview";

async function post(body: object): Promise<{ ok: boolean; token?: string }> {
  try {
    const res = await fetch("/v1/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok ? await res.json() : { ok: false };
  } catch {
    return { ok: false };
  }
}

/** True if there is something worth checking (key in URL or stored token). */
export function hasPreviewCandidate(): boolean {
  const url = new URL(window.location.href);
  return (
    url.searchParams.has(QUERY_PARAM) ||
    !!window.sessionStorage.getItem(STORAGE_KEY)
  );
}

/** Resolves true when the visitor holds a valid preview session. */
export async function resolvePreviewAccess(): Promise<boolean> {
  const url = new URL(window.location.href);
  const key = url.searchParams.get(QUERY_PARAM);

  if (key) {
    // Never keep the key in the address bar / history.
    url.searchParams.delete(QUERY_PARAM);
    window.history.replaceState(window.history.state, "", url.toString());

    const result = await post({ key });
    if (result.ok && result.token) {
      window.sessionStorage.setItem(STORAGE_KEY, result.token);
      return true;
    }
  }

  const token = window.sessionStorage.getItem(STORAGE_KEY);
  if (token) {
    const result = await post({ token });
    if (result.ok) return true;
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
  return false;
}
