'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useResource<T>(url: string | null, initial: T | null = null) {
  const initialRef = useRef(initial);
  const [state, setState] = useState<ResourceState<T>>({ data: initialRef.current, loading: Boolean(url), error: null });

  const load = useCallback(async () => {
    if (!url) {
      setState({ data: initialRef.current, loading: false, error: null });
      return;
    }

    setState((current) => ({ ...current, loading: current.data === null, error: null }));
    try {
      const response = await fetch(url);
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
      setState({ data: body as T, loading: false, error: null });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : 'Request failed',
      }));
    }
  }, [url]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load, setData: (data: T) => setState({ data, loading: false, error: null }) };
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body instanceof FormData
      ? init.headers
      : { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  return body as T;
}
