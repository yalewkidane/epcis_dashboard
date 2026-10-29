import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Grid, IconButton, MenuItem, Stack, TextField, Typography, Autocomplete } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useApi } from '../../api/useApi';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader, SectionCard, JsonViewer, ErrorAlert } from '../../components/common';
import { qs } from '../../api/http';

const PARAMS = [
  'eventType', 'GE_eventTime', 'LT_eventTime', 'GE_recordTime', 'LT_recordTime', 'EQ_action', 'EQ_bizStep', 'EQ_disposition', 'EQ_readPoint', 'WD_readPoint', 'EQ_bizLocation', 'WD_bizLocation',
  'MATCH_epc', 'MATCH_parentID', 'MATCH_inputEPC', 'MATCH_outputEPC', 'MATCH_anyEPC', 'MATCH_epcClass', 'MATCH_anyEPCClass', 'EQ_transformationID', 'EQ_eventID', 'EXISTS_errorDeclaration',
  'orderBy', 'orderDirection', 'eventCountLimit', 'maxEventCount', 'perPage', 'nextPageToken',
];

const PRESETS = [
  { label: 'Latest 10 events', rows: [{ k: 'perPage', v: '10' }, { k: 'orderBy', v: 'eventTime' }, { k: 'orderDirection', v: 'DESC' }] },
  { label: 'Aggregation events', rows: [{ k: 'eventType', v: '["AggregationEvent"]' }] },
  { label: 'Shipping step', rows: [{ k: 'EQ_bizStep', v: '["shipping"]' }] },
  { label: 'By identifier', rows: [{ k: 'MATCH_anyEPC', v: '["https://id.oliot.org/01/08800026940035/21/TS-0001"]' }] },
];

export default function QueryPage() {
  const api = useApi();
  const [rows, setRows] = useState(PRESETS[0].rows);
  const [endpoint, setEndpoint] = useState('/events');
  const [named, setNamed] = useState({ name: '', query: '{\n  "eventType": ["ObjectEvent"]\n}' });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const queries = useAsync(() => api.epcis.queries(), [api]);

  const params = useMemo(() => Object.fromEntries(rows.filter((r) => r.k).map((r) => [r.k, r.v])), [rows]);
  const url = `${api.epcis.base}${endpoint}${qs(params)}`;

  const run = async () => {
    setBusy(true);
    setResult(null);
    const started = Date.now();
    try {
      const r = endpoint === '/events' ? await api.epcis.events(params) : await api.epcis.queryEvents(endpoint.split('/')[2], params);
      setResult({ ok: true, count: r.events.length, nextPageToken: r.nextPageToken, body: r.document, ms: Date.now() - started });
    } catch (err) {
      setResult({ ok: false, body: err.data || err.message, status: err.status, ms: Date.now() - started });
    } finally {
      setBusy(false);
    }
  };

  const createNamed = async () => {
    try {
      await api.epcis.createQuery(named.name.trim(), JSON.parse(named.query));
      queries.reload();
    } catch (err) {
      setResult({ ok: false, body: err.data || err.message });
    }
  };

  return (
    <Box>
      <PageHeader title="Query" subtitle={`Build a parameterised query against ${api.activeRepository.name}, or manage its named queries.`} />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <SectionCard title="Parameters" subtitle="Values are passed as-is; list parameters expect JSON arrays" dense>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
              {PRESETS.map((p) => (
                <Chip key={p.label} size="small" label={p.label} onClick={() => setRows(p.rows)} variant="outlined" />
              ))}
            </Stack>
            <TextField select size="small" label="Endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} sx={{ mb: 1.5, minWidth: 260 }}>
              <MenuItem value="/events">GET /events</MenuItem>
              {(queries.data || []).map((q) => (
                <MenuItem key={q.name} value={`/queries/${q.name}/events`}>
                  GET /queries/{q.name}/events
                </MenuItem>
              ))}
            </TextField>
            <Stack spacing={1}>
              {rows.map((r, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center">
                  <Autocomplete freeSolo size="small" options={PARAMS} value={r.k} onInputChange={(e, v) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, k: v } : x)))} sx={{ width: 250, flexShrink: 0 }} renderInput={(p) => <TextField {...p} label="Parameter" />} />
                  <TextField size="small" label="Value" value={r.v} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} fullWidth InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5 } }} />
                  <IconButton size="small" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={() => setRows((rs) => [...rs, { k: '', v: '' }])} sx={{ alignSelf: 'flex-start' }}>
                Add parameter
              </Button>
            </Stack>
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontFamily: '"JetBrains Mono", monospace', wordBreak: 'break-all', color: 'text.secondary' }}>
              {url}
            </Typography>
            <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={run} disabled={busy} sx={{ mt: 1.5 }}>
              Run query
            </Button>
          </SectionCard>

          <SectionCard title="Named queries" subtitle="Stored on the repository; stream subscriptions attach to them" sx={{ mt: 2.5 }} dense>
            <ErrorAlert error={queries.error} />
            <Stack spacing={1} sx={{ mb: 2 }}>
              {(queries.data || []).map((q) => (
                <Stack key={q.name} direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={q.name} />
                  <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {JSON.stringify(q.query)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={async () => {
                      await api.epcis.deleteQuery(q.name).catch(() => null);
                      queries.reload();
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              {queries.data && !queries.data.length && (
                <Typography variant="body2" color="text.secondary">
                  No named queries.
                </Typography>
              )}
            </Stack>
            <Stack spacing={1}>
              <TextField size="small" label="Name" value={named.name} onChange={(e) => setNamed((n) => ({ ...n, name: e.target.value }))} />
              <TextField size="small" label="Query (JSON)" multiline minRows={3} value={named.query} onChange={(e) => setNamed((n) => ({ ...n, query: e.target.value }))} InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5 } }} />
              <Button size="small" variant="outlined" onClick={createNamed} disabled={!named.name.trim()} sx={{ alignSelf: 'flex-start' }}>
                Create named query
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <SectionCard title="Result" dense>
            {!result ? (
              <Typography variant="body2" color="text.secondary">
                Run a query to see the EPCISQueryDocument.
              </Typography>
            ) : (
              <>
                <Alert severity={result.ok ? 'success' : 'error'} sx={{ mb: 1.5 }}>
                  {result.ok ? `${result.count} events in ${result.ms} ms${result.nextPageToken ? ' · more pages available' : ''}` : `Failed${result.status ? ` (HTTP ${result.status})` : ''}`}
                </Alert>
                <JsonViewer value={result.body} maxHeight={720} />
              </>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
