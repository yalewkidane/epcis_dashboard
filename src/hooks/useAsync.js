import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async function and track {data, error, loading}. `deps` re-run it; `reload()`
 * re-runs on demand. Stale results (from an earlier call) are discarded.
 */
export function useAsync(fn, deps = [], { immediate = true, initial = null } = {}) {
  const [state, setState] = useState({ data: initial, error: null, loading: immediate });
  const seq = useRef(0);

  const run = useCallback(
    async (...args) => {
      const id = ++seq.current;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fn(...args);
        if (id === seq.current) setState({ data, error: null, loading: false });
        return data;
      } catch (error) {
        if (id === seq.current) setState((s) => ({ ...s, error, loading: false }));
        return undefined;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  return { ...state, run, reload: run, setData: (data) => setState((s) => ({ ...s, data })) };
}

/** Poll an async function every `intervalMs` while the component is mounted (and the tab visible). */
export function usePolling(fn, intervalMs, deps = []) {
  const async = useAsync(fn, deps);
  const { run } = async;
  useEffect(() => {
    if (!intervalMs) return undefined;
    const tick = () => {
      if (document.visibilityState === 'visible') run();
    };
    const timer = setInterval(tick, intervalMs);
    return () => clearInterval(timer);
  }, [run, intervalMs]);
  return async;
}
