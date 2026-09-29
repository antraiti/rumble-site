'use client'
import { useEffect, useState } from "react";
import { apiGet } from "../../util/apiClient";

/** Fetches `/api/{path}` when path and token are set; stale results are ignored when the path changes. */
export function useStatsFetch<T>(path: string | null, token: string | null) {
  const [result, setResult] = useState<{ path: string; data?: T; error?: boolean } | null>(null);

  useEffect(() => {
    if (!path || !token) return;
    let active = true;
    apiGet<T>(path, { token })
      .then(data => { if (active) setResult({ path, data }); })
      .catch(() => { if (active) setResult({ path, error: true }); });
    return () => { active = false; };
  }, [path, token]);

  const current = result?.path === path ? result : null;
  return { data: current?.data, error: !!current?.error, loading: !current };
}
