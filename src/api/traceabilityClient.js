import { request, qs } from './http';

/** Client for the traceability knowledge-graph service (base = http://host:7087). */
export function traceabilityClient(base) {
  const b = String(base || '').replace(/\/+$/, '');
  const t = `${b}/traceability`;
  return {
    base: b,
    async health() {
      const r = await request(`${b}/health`, { timeoutMs: 6000 });
      return r.data;
    },
    async stats() {
      return (await request(`${t}/stats`)).data;
    },
    async trace(id, { direction = 'forward', depth } = {}) {
      return (await request(`${t}${qs({ id, direction, depth })}`)).data;
    },
    async graph(id, { direction = 'forward', depth } = {}) {
      return (await request(`${t}/graph${qs({ id, direction, depth })}`)).data;
    },
    async timeline(id, { direction = 'forward', depth } = {}) {
      return (await request(`${t}/timeline${qs({ id, direction, depth })}`)).data;
    },
    async objects({ q = '', type = '', limit = 20, skip = 0 } = {}) {
      return (await request(`${t}/objects${qs({ q, type, limit, skip })}`)).data;
    },
    async objectDetail(id) {
      return (await request(`${t}/objects/detail${qs({ id })}`)).data;
    },
    async recentEvents(limit = 20) {
      return (await request(`${t}/events/recent${qs({ limit })}`)).data;
    },
    async eventDetail(eventID) {
      return (await request(`${t}/events/detail${qs({ eventID })}`)).data;
    },
    async ingest(document) {
      return (await request(`${t}/ingest`, { method: 'POST', body: document })).data;
    },
    async resetGraph() {
      return (await request(`${t}/graph`, { method: 'DELETE' })).data;
    },
    async scenarios() {
      return (await request(`${t}/scenarios`)).data;
    },
    async scenario(name, { documents = true } = {}) {
      return (await request(`${t}/scenarios/${encodeURIComponent(name)}${qs({ documents })}`)).data;
    },
    async runStep(name, index, body = {}) {
      return (await request(`${t}/scenarios/${encodeURIComponent(name)}/steps/${index}/run`, { method: 'POST', body, timeoutMs: 60000 })).data;
    },
    async runScenario(name, body = {}) {
      return (await request(`${t}/scenarios/${encodeURIComponent(name)}/run`, { method: 'POST', body, timeoutMs: 300000 })).data;
    },
    async subscriptions() {
      return (await request(`${t}/subscription`)).data;
    },
    async addSubscription(kind, body) {
      return (await request(`${t}/subscription/${kind}`, { method: 'POST', body, timeoutMs: 30000 })).data;
    },
    async removeSubscription(kind, id) {
      return request(`${t}/subscription/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  };
}
