import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Connection settings, persisted in localStorage.
 *
 * The graph is fed by several distributed EPCIS repositories; the dashboard keeps a list
 * of them (name + base URL) plus the URL of the traceability knowledge-graph service.
 */
const STORAGE_KEY = 'traceability-dashboard.settings.v1';

export const DEFAULT_SETTINGS = {
  traceabilityUrl: 'http://localhost:7087',
  repositories: [{ name: 'default', url: 'http://localhost:7080/epcis/v2' }],
  activeRepository: 'default',
  hashGeneratorUrl: '',
  hashAlgorithm: 'sha256',
  pollIntervalMs: 15000,
};

const trimSlash = (s) => String(s || '').trim().replace(/\/+$/, '');

/** Earlier versions stored host/port pairs under separate keys; honour them once. */
function migrateLegacy() {
  try {
    const ip = localStorage.getItem('EPCIS_serverIP');
    const port = localStorage.getItem('EPCIS_port');
    const tip = localStorage.getItem('Traceability_serverIP');
    const tport = localStorage.getItem('Traceability_port');
    const hip = localStorage.getItem('EventHashGen_serverIP');
    const hport = localStorage.getItem('EventHashGen_port');
    const s = { ...DEFAULT_SETTINGS };
    if (ip && port) s.repositories = [{ name: 'default', url: `http://${ip}:${port}/epcis/v2` }];
    if (tip && tport) s.traceabilityUrl = `http://${tip}:${tport}`;
    if (hip && hport) s.hashGeneratorUrl = `http://${hip}:${hport}`;
    return s;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateLegacy();
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULT_SETTINGS, ...parsed };
    if (!Array.isArray(merged.repositories) || !merged.repositories.length) merged.repositories = DEFAULT_SETTINGS.repositories;
    if (!merged.repositories.some((r) => r.name === merged.activeRepository)) merged.activeRepository = merged.repositories[0].name;
    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* private mode or blocked storage: keep in memory */
    }
  }, [settings]);

  const update = useCallback((patch) => setSettings((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) })), []);
  const reset = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  const value = useMemo(() => {
    const repositories = settings.repositories.map((r) => ({ name: r.name, url: trimSlash(r.url) }));
    const active = repositories.find((r) => r.name === settings.activeRepository) || repositories[0];
    return {
      settings,
      update,
      reset,
      repositories,
      activeRepository: active,
      epcisUrl: active.url,
      traceabilityUrl: trimSlash(settings.traceabilityUrl),
      setActiveRepository: (name) => update({ activeRepository: name }),
    };
  }, [settings, update, reset]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
