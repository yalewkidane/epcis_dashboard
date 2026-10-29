import { useMemo } from 'react';
import { useSettings } from '../config/settings';
import { epcisClient } from './epcisClient';
import { traceabilityClient } from './traceabilityClient';

/** Clients bound to the current settings: the active EPCIS repository, all repositories, and the graph service. */
export function useApi() {
  const { epcisUrl, traceabilityUrl, repositories, activeRepository } = useSettings();
  return useMemo(
    () => ({
      epcis: epcisClient(epcisUrl),
      trace: traceabilityClient(traceabilityUrl),
      repositories: repositories.map((r) => ({ ...r, client: epcisClient(r.url) })),
      activeRepository,
    }),
    [epcisUrl, traceabilityUrl, repositories, activeRepository]
  );
}
