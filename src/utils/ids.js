/** Helpers for GS1 identifiers (Digital Link URIs and EPC URNs) and display formatting. */

const DL_KEYS = {
  '00': 'SSCC',
  '01': 'GTIN',
  '10': 'LOT',
  '21': 'SERIAL',
  '253': 'GDTI',
  '255': 'GCN',
  '401': 'GINC',
  '402': 'GSIN',
  '414': 'GLN',
  '417': 'PARTY',
  '8003': 'GRAI',
  '8004': 'GIAI',
  '8006': 'ITIP',
  '8010': 'CPID',
  '8017': 'GSRN-P',
  '8018': 'GSRN',
};

/** Classify an identifier and produce a short, readable label. */
export function describeId(id) {
  if (!id || typeof id !== 'string') return { id: String(id || ''), short: String(id || ''), kind: 'ID' };
  try {
    if (/^https?:\/\//i.test(id)) {
      const u = new URL(id);
      const parts = u.pathname.split('/').filter(Boolean);
      const pairs = [];
      for (let i = 0; i + 1 < parts.length; i += 2) pairs.push([parts[i], parts[i + 1]]);
      if (pairs.length) {
        const keys = pairs.map(([k]) => DL_KEYS[k] || k);
        let kind = keys[0];
        if (keys[0] === 'GTIN' && keys.includes('SERIAL')) kind = 'SGTIN';
        else if (keys[0] === 'GTIN' && keys.includes('LOT')) kind = 'LGTIN';
        const last = pairs[pairs.length - 1];
        const short = pairs.length > 1 ? `${DL_KEYS[last[0]] ? DL_KEYS[last[0]].toLowerCase() : last[0]} ${last[1]}` : `${kind} …${last[1].slice(-8)}`;
        return { id, short, kind, host: u.host, pairs };
      }
      return { id, short: parts[parts.length - 1] || u.host, kind: 'URI', host: u.host };
    }
    if (id.startsWith('urn:epc:')) {
      const seg = id.split(':');
      const kind = (seg[3] || 'EPC').toUpperCase();
      const value = seg.slice(4).join(':');
      const tail = value.split('.');
      return { id, short: `${kind} …${tail[tail.length - 1]}`, kind };
    }
  } catch {
    /* fall through */
  }
  const short = id.length > 28 ? `…${id.slice(-24)}` : id;
  return { id, short, kind: id.includes(':') ? id.split(':')[0].toUpperCase() : 'ID' };
}

export const shortId = (id) => describeId(id).short;

/** Business step / disposition can be a CBV short name or a full URI. */
export const shortVocab = (v) => {
  if (!v) return '';
  const s = String(v);
  if (/^https?:\/\//.test(s) || s.includes(':')) {
    const tail = s.split(/[/#:]/).filter(Boolean).pop();
    return tail || s;
  }
  return s;
};

export const fmtDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

export const fmtNumber = (n) => (n === null || n === undefined ? '–' : Number(n).toLocaleString());

export const eventTypeShort = (t) => (t ? String(t).replace(/Event$/, '') : '');

/** All identifiers mentioned by a raw EPCIS event, with the list they came from. */
export function eventIdentifiers(ev) {
  if (!ev) return [];
  const out = [];
  const add = (list, role) => (Array.isArray(list) ? list : list ? [list] : []).forEach((x) => out.push({ id: typeof x === 'string' ? x : x && (x.epcClass || x.epc || x.id), role, quantity: x && x.quantity, uom: x && x.uom }));
  add(ev.epcList, 'epcList');
  add(ev.parentID, 'parent');
  add(ev.childEPCs, 'child');
  add(ev.inputEPCList, 'input');
  add(ev.outputEPCList, 'output');
  add(ev.quantityList, 'quantity');
  add(ev.childQuantityList, 'childQuantity');
  add(ev.inputQuantityList, 'inputQuantity');
  add(ev.outputQuantityList, 'outputQuantity');
  return out.filter((x) => x.id);
}

/**
 * Ingest sources look like "mqtt:mqtt://host:1883/epcisv2", "webhook", "http:ingest",
 * "websocket:ws://host/queries/x/events", "scenario:clothing/supplier".
 */
export function describeSource(source) {
  if (!source) return { channel: 'unknown', target: '', label: 'unknown' };
  const s = String(source);
  const i = s.indexOf(':');
  const channel = i > 0 ? s.slice(0, i) : s;
  let target = i > 0 ? s.slice(i + 1) : '';
  target = target.replace(/^[a-z]+:\/\//i, '');
  const label = target ? `${channel} · ${target}` : channel;
  return { channel, target, label };
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
