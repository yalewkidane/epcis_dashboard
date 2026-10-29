import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../../api/useApi';
import { useSettings } from '../../config/settings';
import { useAsync } from '../../hooks/useAsync';
import { epcisClient } from '../../api/epcisClient';
import { PageHeader, SectionCard, JsonViewer } from '../../components/common';
import { eventIdentifiers, describeId } from '../../utils/ids';

const PUBLIC_EXAMPLES = ['Single ObjectEvent.json', 'Single AggregationEvent.json', 'Multiple ObjectEvent Full.json'];

function wrapAsDocument(ev) {
  return { '@context': ['https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld'], type: 'EPCISDocument', schemaVersion: '2.0', creationDate: new Date().toISOString(), epcisBody: { eventList: [ev] } };
}

export default function CapturePage() {
  const api = useApi();
  const { repositories } = useSettings();
  const [repoName, setRepoName] = useState(api.activeRepository.name);
  const [mode, setMode] = useState('document');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const scenarios = useAsync(async () => {
    const list = await api.trace.scenarios();
    const full = await Promise.all(list.map((s) => api.trace.scenario(s.name)));
    return full;
  }, [api]);

  const repo = repositories.find((r) => r.name === repoName) || repositories[0];
  const client = useMemo(() => epcisClient(repo.url), [repo.url]);

  const parsed = useMemo(() => {
    try {
      return { value: JSON.parse(text), error: null };
    } catch (e) {
      return { value: null, error: text.trim() ? e.message : null };
    }
  }, [text]);

  const loadPublic = async (file) => {
    const r = await fetch(`${process.env.PUBLIC_URL}/eventExamples/${encodeURIComponent(file)}`);
    const j = await r.json();
    setText(JSON.stringify(j, null, 2));
    setMode(j.epcisBody ? 'document' : 'event');
  };
  const loadStep = (doc) => {
    setText(JSON.stringify(doc, null, 2));
    setMode('document');
  };

  const send = async (kind) => {
    if (!parsed.value) return;
    setBusy(true);
    setResult(null);
    const started = Date.now();
    try {
      let r;
      if (kind === 'validate') {
        const ev = parsed.value.epcisBody ? parsed.value.epcisBody.eventList[0] : parsed.value;
        r = await client.validate(ev);
      } else if (mode === 'document') {
        const doc = parsed.value.epcisBody ? parsed.value : wrapAsDocument(parsed.value);
        r = await client.capture(doc);
      } else {
        const ev = parsed.value.epcisBody ? parsed.value.epcisBody.eventList[0] : parsed.value;
        r = await client.captureEvent(ev);
      }
      setResult({ ok: true, kind, status: r.status, body: r.body, location: r.location, headers: r.headers, ms: Date.now() - started });
    } catch (err) {
      setResult({ ok: false, kind, status: err.status, body: err.data || err.message, ms: Date.now() - started });
    } finally {
      setBusy(false);
    }
  };

  const ids = parsed.value ? (parsed.value.epcisBody ? parsed.value.epcisBody.eventList.flatMap(eventIdentifiers) : eventIdentifiers(parsed.value)) : [];

  return (
    <Box>
      <PageHeader title="Capture" subtitle="Send EPCIS events to a repository. Documents go through the asynchronous capture interface; single events through the synchronous one." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="EPCIS JSON"
            action={
              <Stack direction="row" spacing={1}>
                <ToggleButtonGroup size="small" exclusive value={mode} onChange={(e, v) => v && setMode(v)}>
                  <ToggleButton value="document">POST /capture</ToggleButton>
                  <ToggleButton value="event">POST /events</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            }
            dense
          >
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Examples:
              </Typography>
              {PUBLIC_EXAMPLES.map((f) => (
                <Chip key={f} size="small" variant="outlined" label={f.replace('.json', '')} onClick={() => loadPublic(f)} />
              ))}
              {(scenarios.data || []).map((s) => (
                <FormControl key={s.name} size="small" sx={{ minWidth: 260 }}>
                  <InputLabel>{s.title}</InputLabel>
                  <Select value="" label={s.title} onChange={(e) => loadStep(s.steps[e.target.value].document)}>
                    {s.steps.map((st) => (
                      <MenuItem key={st.index} value={st.index}>
                        {st.index + 1}. {st.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>
            <TextField
              multiline
              minRows={18}
              maxRows={30}
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='{ "type": "EPCISDocument", "epcisBody": { "eventList": [ ... ] } }'
              error={!!parsed.error}
              helperText={parsed.error || (parsed.value ? `${ids.length} identifier${ids.length === 1 ? '' : 's'} referenced` : ' ')}
              InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5 } }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} alignItems="center" flexWrap="wrap" useFlexGap>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Repository</InputLabel>
                <Select value={repo.name} label="Repository" onChange={(e) => setRepoName(e.target.value)}>
                  {repositories.map((r) => (
                    <MenuItem key={r.name} value={r.name}>
                      {r.name} · {r.url}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<FactCheckOutlinedIcon />} disabled={!parsed.value || busy} onClick={() => send('validate')}>
                Validate
              </Button>
              <Button variant="contained" startIcon={<UploadFileOutlinedIcon />} disabled={!parsed.value || busy} onClick={() => send('capture')}>
                Capture
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <SectionCard title="Response" dense>
            {!result ? (
              <Typography variant="body2" color="text.secondary">
                Nothing sent yet.
              </Typography>
            ) : (
              <Box>
                <Alert severity={result.ok ? 'success' : 'error'} sx={{ mb: 1.5 }}>
                  {result.kind === 'validate' ? 'Validation' : 'Capture'} → HTTP {result.status || 'n/a'} in {result.ms} ms
                  {result.location ? ` · job ${result.location}` : ''}
                </Alert>
                <JsonViewer value={typeof result.body === 'string' ? result.body : result.body} maxHeight={260} />
                {result.ok && result.kind === 'capture' && ids.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Follow in the knowledge graph
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      If the graph service subscribes to this repository, the event appears there within seconds.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                      {[...new Set(ids.map((x) => x.id))].slice(0, 8).map((id) => (
                        <Button key={id} size="small" variant="outlined" startIcon={<HubOutlinedIcon />} component={RouterLink} to={`/traceability?id=${encodeURIComponent(id)}&direction=both`} sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>
                          {describeId(id).short}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
