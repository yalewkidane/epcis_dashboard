import React, { useState } from 'react';
import { Box, Button, Chip, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography, Divider } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useApi } from '../../api/useApi';
import { useSettings } from '../../config/settings';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader, SectionCard, ErrorAlert, StatusChip, EmptyState } from '../../components/common';
import { fmtDateTime } from '../../utils/ids';

const NAMED_QUERY = 'TraceabilityQueryName';

export default function SubscriptionsPage() {
  const api = useApi();
  const { repositories } = useSettings();
  const subs = useAsync(() => api.trace.subscriptions(), [api]);
  const epcisSubs = useAsync(async () => {
    const out = [];
    for (const r of api.repositories) {
      const list = await r.client.subscriptions(NAMED_QUERY).catch(() => []);
      list.forEach((s) => out.push({ ...s, repository: r.name, client: r.client }));
    }
    return out;
  }, [api]);

  const [mqtt, setMqtt] = useState({ brokerUrl: 'mqtt://localhost:1883', topic: 'epcisv2' });
  const [wsRepo, setWsRepo] = useState(repositories[0].name);
  const [hookRepo, setHookRepo] = useState(repositories[0].name);
  const [callbackUrl, setCallbackUrl] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const act = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await Promise.all([subs.reload(), epcisSubs.reload()]);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  const repoUrl = (name) => (repositories.find((r) => r.name === name) || repositories[0]).url;

  const d = subs.data;

  return (
    <Box>
      <PageHeader title="Subscriptions" subtitle="How EPCIS repositories push their events into the knowledge graph. The graph service can follow any number of repositories at once." />
      <ErrorAlert error={error || subs.error} onRetry={subs.reload} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <SectionCard title="Graph service subscriptions" subtitle={`Live channels on ${api.trace.base}`} dense>
            {!d ? null : !d.mqtt.length && !d.websocket.length && !d.webhook.length ? (
              <EmptyState title="No subscriptions yet" description="Add a channel on the right." sx={{ py: 3 }} />
            ) : (
              <Stack spacing={1} divider={<Divider />}>
                {d.mqtt.map((s) => (
                  <Row key={`m${s.id}`} kind="MQTT" ok={s.connected} main={`${s.brokerUrl} · topic ${s.topic}`} meta={`${s.messages} messages · since ${fmtDateTime(s.createdAt)}${s.lastError ? ` · ${s.lastError}` : ''}`} onDelete={() => act(() => api.trace.removeSubscription('mqtt', s.id))} />
                ))}
                {d.websocket.map((s) => (
                  <Row key={`w${s.id}`} kind="WebSocket" ok={s.connected} main={s.url} meta={`${s.messages} messages${s.subscriptionID ? ` · subscription ${s.subscriptionID}` : ''}${s.lastError ? ` · ${s.lastError}` : ''}`} onDelete={() => act(() => api.trace.removeSubscription('websocket', s.id))} />
                ))}
                {d.webhook.map((s) => (
                  <Row key={`h${s.id}`} kind="Webhook" ok main={`${s.epcisEndpoint} → ${s.dest}`} meta={`${s.messages} deliveries · subscription ${s.subscriptionID}`} onDelete={() => act(() => api.trace.removeSubscription('webhook', s.id))} />
                ))}
              </Stack>
            )}
          </SectionCard>

          <SectionCard title="Stream subscriptions registered on the repositories" subtitle={`Named query "${NAMED_QUERY}" on each configured EPCIS repository`} sx={{ mt: 2.5 }} dense>
            <ErrorAlert error={epcisSubs.error} />
            {epcisSubs.data && !epcisSubs.data.length && (
              <Typography variant="body2" color="text.secondary">
                None. Webhook and websocket channels create one automatically.
              </Typography>
            )}
            <Stack spacing={1} divider={<Divider />}>
              {(epcisSubs.data || []).map((s) => (
                <Row
                  key={s.subscriptionID}
                  kind={s.repository}
                  ok
                  main={s.dest ? `webhook → ${s.dest}` : 'websocket stream'}
                  meta={`${s.subscriptionID} · created ${fmtDateTime(s.createdAt)}${s.lastNotifiedAt ? ` · last notified ${fmtDateTime(s.lastNotifiedAt)}` : ''}`}
                  onDelete={() => act(() => s.client.deleteSubscription(NAMED_QUERY, s.subscriptionID))}
                />
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard title="Add an MQTT channel" subtitle="Each EPCIS repository publishes captured events on its broker" dense>
            <Stack spacing={1}>
              <TextField size="small" label="Broker URL" value={mqtt.brokerUrl} onChange={(e) => setMqtt((m) => ({ ...m, brokerUrl: e.target.value }))} helperText="As seen from the graph service, e.g. mqtt://mqtt_broker:1883 inside docker" />
              <TextField size="small" label="Topic" value={mqtt.topic} onChange={(e) => setMqtt((m) => ({ ...m, topic: e.target.value }))} />
              <Button variant="contained" size="small" startIcon={<AddIcon />} disabled={busy || !mqtt.brokerUrl} onClick={() => act(() => api.trace.addSubscription('mqtt', mqtt))} sx={{ alignSelf: 'flex-start' }}>
                Subscribe
              </Button>
            </Stack>
          </SectionCard>
          <SectionCard title="Follow a repository's websocket stream" sx={{ mt: 2.5 }} dense>
            <Stack spacing={1}>
              <FormControl size="small">
                <InputLabel>Repository</InputLabel>
                <Select value={wsRepo} label="Repository" onChange={(e) => setWsRepo(e.target.value)}>
                  {repositories.map((r) => (
                    <MenuItem key={r.name} value={r.name}>
                      {r.name} · {r.url}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" size="small" startIcon={<AddIcon />} disabled={busy} onClick={() => act(() => api.trace.addSubscription('websocket', { epcisEndpoint: repoUrl(wsRepo) }))} sx={{ alignSelf: 'flex-start' }}>
                Connect
              </Button>
            </Stack>
          </SectionCard>
          <SectionCard title="Register a webhook" subtitle="The repository will POST new events to the graph service" sx={{ mt: 2.5 }} dense>
            <Stack spacing={1}>
              <FormControl size="small">
                <InputLabel>Repository</InputLabel>
                <Select value={hookRepo} label="Repository" onChange={(e) => setHookRepo(e.target.value)}>
                  {repositories.map((r) => (
                    <MenuItem key={r.name} value={r.name}>
                      {r.name} · {r.url}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField size="small" label="Callback base URL (optional)" value={callbackUrl} onChange={(e) => setCallbackUrl(e.target.value)} helperText="Where the repository can reach the graph service; defaults to the service's TRACEABILITY_PUBLIC_URL" />
              <Button variant="contained" size="small" startIcon={<AddIcon />} disabled={busy} onClick={() => act(() => api.trace.addSubscription('webhook', { epcisEndpoint: repoUrl(hookRepo), callbackUrl: callbackUrl || undefined }))} sx={{ alignSelf: 'flex-start' }}>
                Register
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

function Row({ kind, ok, main, meta, onDelete }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <StatusChip ok={ok} label={kind} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {main}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {meta}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onDelete}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
      <Chip sx={{ display: 'none' }} />
    </Stack>
  );
}
