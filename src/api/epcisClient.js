import { request, qs } from './http';

const VERSION_HEADERS = {
  'GS1-EPCIS-Version': '2.0.0',
  'GS1-EPCIS-Max': '2.0.0',
  'GS1-EPCIS-Min': '2.0.0',
  'GS1-CBV-Version': '2.0.0',
  'GS1-CBV-Max': '2.0.0',
  'GS1-CBV-Min': '2.0.0',
};

export const VOCABULARIES = [
  { key: 'eventTypes', label: 'Event types', path: '/eventTypes' },
  { key: 'epcs', label: 'EPCs', path: '/epcs' },
  { key: 'bizSteps', label: 'Business steps', path: '/bizSteps' },
  { key: 'bizLocations', label: 'Business locations', path: '/bizLocations' },
  { key: 'readPoints', label: 'Read points', path: '/readPoints' },
  { key: 'dispositions', label: 'Dispositions', path: '/dispositions' },
];

/** Client for one EPCIS 2.0 repository (base = http://host:port/epcis/v2). */
export function epcisClient(base) {
  const b = String(base || '').replace(/\/+$/, '');
  const serverRoot = b.replace(/\/epcis\/v2$/, '');

  const eventsOf = (data) => {
    const list = data && data.epcisBody && data.epcisBody.queryResults && data.epcisBody.queryResults.resultsBody && data.epcisBody.queryResults.resultsBody.eventList;
    return Array.isArray(list) ? list : [];
  };

  return {
    base: b,
    async health() {
      const r = await request(`${b}/health`, { timeoutMs: 6000 });
      return r.data;
    },
    async info() {
      const r = await request(`${b}/info`);
      return r.data;
    },
    async discovery() {
      const r = await request(serverRoot || b, { timeoutMs: 6000 });
      return r.data;
    },
    /** Parameterised event query. Returns {events, nextPageToken, maxEventCount, document}. */
    async events(params = {}, extraHeaders = {}) {
      const r = await request(`${b}/events${qs(params)}`, { headers: { ...VERSION_HEADERS, ...extraHeaders } });
      return { events: eventsOf(r.data), nextPageToken: r.headers.nextpagetoken || null, maxEventCount: r.headers.maxeventcount || null, document: r.data, headers: r.headers };
    },
    async event(eventID) {
      const r = await request(`${b}/events/${encodeURIComponent(eventID)}`, { headers: VERSION_HEADERS });
      return r.data;
    },
    /** Vocabulary listing (eventTypes, epcs, bizSteps, ...). Returns the `member` array. */
    async vocabulary(path, { perPage = 1000 } = {}) {
      const r = await request(`${b}${path}${qs({ PerPage: perPage })}`, { headers: VERSION_HEADERS });
      const d = r.data || {};
      return Array.isArray(d.member) ? d.member : Array.isArray(d) ? d : [];
    },
    async vocabularyEvents(path, id, params = {}) {
      const r = await request(`${b}${path}/${encodeURIComponent(id)}/events${qs(params)}`, { headers: VERSION_HEADERS });
      return { events: eventsOf(r.data), nextPageToken: r.headers.nextpagetoken || null, document: r.data };
    },
    async queries() {
      const r = await request(`${b}/queries`, { headers: VERSION_HEADERS });
      return Array.isArray(r.data) ? r.data : [];
    },
    async createQuery(name, query) {
      return request(`${b}/queries`, { method: 'POST', body: { name, query }, headers: VERSION_HEADERS });
    },
    async deleteQuery(name) {
      return request(`${b}/queries/${encodeURIComponent(name)}`, { method: 'DELETE', headers: VERSION_HEADERS });
    },
    async queryEvents(name, params = {}) {
      const r = await request(`${b}/queries/${encodeURIComponent(name)}/events${qs(params)}`, { headers: VERSION_HEADERS });
      return { events: eventsOf(r.data), nextPageToken: r.headers.nextpagetoken || null, document: r.data };
    },
    async subscriptions(queryName) {
      try {
        const r = await request(`${b}/queries/${encodeURIComponent(queryName)}/subscriptions`, { headers: VERSION_HEADERS });
        return Array.isArray(r.data) ? r.data : [];
      } catch (err) {
        if (err.status === 404) return [];
        throw err;
      }
    },
    async createSubscription(queryName, body) {
      const r = await request(`${b}/queries/${encodeURIComponent(queryName)}/subscriptions`, { method: 'POST', body, headers: VERSION_HEADERS });
      return r.data;
    },
    async deleteSubscription(queryName, subscriptionID) {
      return request(`${b}/queries/${encodeURIComponent(queryName)}/subscriptions/${encodeURIComponent(subscriptionID)}`, { method: 'DELETE', headers: VERSION_HEADERS });
    },
    /** Asynchronous capture of a whole document. Returns {status, location, body}. */
    async capture(document) {
      const r = await request(`${b}/capture`, { method: 'POST', body: document, headers: VERSION_HEADERS, raw: true });
      return { status: r.status, location: r.headers.location || null, body: r.data, headers: r.headers };
    },
    async captureJob(id) {
      const r = await request(`${b}/capture/${encodeURIComponent(id)}`);
      return r.data;
    },
    /** Synchronous capture of a single event. */
    async captureEvent(event) {
      const r = await request(`${b}/events`, { method: 'POST', body: event, headers: VERSION_HEADERS, raw: true });
      return { status: r.status, body: r.data, headers: r.headers };
    },
    async validate(event) {
      const r = await request(`${b}/validate`, { method: 'POST', body: event, raw: true });
      return { status: r.status, body: r.data };
    },
  };
}
