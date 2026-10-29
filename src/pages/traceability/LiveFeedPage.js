import React, { useEffect, useRef, useState } from 'react';
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, Switch, FormControlLabel } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../../api/useApi';
import { usePolling } from '../../hooks/useAsync';
import { PageHeader, StatTile, ErrorAlert, EventTypeChip, IdLabel, JsonViewer, SectionCard, StatusChip, EmptyState } from '../../components/common';
import { roleColors } from '../../theme';
import { fmtDateTime, shortVocab, describeId, describeSource } from '../../utils/ids';

export default function LiveFeedPage() {
  const api = useApi();
  const [live, setLive] = useState(true);
  const feed = usePolling(async () => ({ events: await api.trace.recentEvents(40), stats: await api.trace.stats() }), live ? 3000 : 0, [api]);
  const [selected, setSelected] = useState(null);
  const seen = useRef(new Set());
  const [fresh, setFresh] = useState(new Set());

  useEffect(() => {
    if (!feed.data) return;
    const ids = feed.data.events.map((e) => e.eventID);
    if (seen.current.size === 0) {
      ids.forEach((i) => seen.current.add(i));
      return;
    }
    const newOnes = ids.filter((i) => !seen.current.has(i));
    if (newOnes.length) {
      newOnes.forEach((i) => seen.current.add(i));
      setFresh(new Set(newOnes));
      const t = setTimeout(() => setFresh(new Set()), 4000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [feed.data]);

  const stats = feed.data && feed.data.stats;
  const subs = stats ? stats.subscriptions : null;
  const events = feed.data ? feed.data.events : [];

  return (
    <Box>
      <PageHeader
        title="Live feed"
        subtitle="Events arriving in the knowledge graph through its subscriptions to the EPCIS repositories, newest first."
        actions={<FormControlLabel control={<Switch checked={live} onChange={(e) => setLive(e.target.checked)} />} label={live ? 'Live (3 s)' : 'Paused'} />}
      />
      <ErrorAlert error={feed.error} onRetry={feed.reload} />

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={6} md={3}>
          <StatTile label="Identifiers" value={stats && stats.nodes.objects} icon={<Inventory2OutlinedIcon />} color={roleColors.product.main} loading={!stats} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile label="Events" value={stats && stats.nodes.events} icon={<EventNoteOutlinedIcon />} color={roleColors.event.main} loading={!stats} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile label="Packing edges" value={stats && stats.relationships.AGGREGATED_INTO} hint={stats ? `${stats.relationships.AGGREGATED_INTO_open} still packed` : ''} icon={<HubOutlinedIcon />} color={roleColors.aggregation.main} loading={!stats} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile label="Last ingest" value={stats && stats.lastIngestAt ? fmtDateTime(stats.lastIngestAt) : '–'} hint={stats && stats.lastSource ? `from ${stats.lastSource}` : ''} icon={<AutorenewIcon />} color="#0d9488" loading={!stats} />
        </Grid>
      </Grid>

      <SectionCard title="Subscriptions" subtitle="Channels through which the EPCIS repositories push their captured events" sx={{ mb: 2.5 }} dense>
        {!subs ? null : !subs.mqtt.length && !subs.websocket.length && !subs.webhook.length ? (
          <EmptyState icon={<SensorsIcon fontSize="inherit" />} title="No subscriptions" description="Add one on the Subscriptions page or set MQTT_AUTO_SUBSCRIBE in the service's .env." sx={{ py: 2 }} action={<Button size="small" component={RouterLink} to="/console/subscriptions">Manage subscriptions</Button>} />
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {subs.mqtt.map((s) => (
              <Stack key={`m${s.id}`} direction="row" spacing={0.75} alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.25, py: 0.5 }}>
                <StatusChip ok={s.connected} label="MQTT" />
                <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}>
                  {s.brokerUrl} · {s.topic}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.messages} msgs
                </Typography>
              </Stack>
            ))}
            {subs.websocket.map((s) => (
              <Stack key={`w${s.id}`} direction="row" spacing={0.75} alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.25, py: 0.5 }}>
                <StatusChip ok={s.connected} label="WebSocket" />
                <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}>
                  {s.url}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.messages} msgs
                </Typography>
              </Stack>
            ))}
            {subs.webhook.map((s) => (
              <Stack key={`h${s.id}`} direction="row" spacing={0.75} alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.25, py: 0.5 }}>
                <StatusChip ok label="Webhook" />
                <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}>
                  {s.epcisEndpoint}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.messages} deliveries
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
        {stats && stats.eventsBySource && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Events by source:
            </Typography>
            {Object.entries(stats.eventsBySource).map(([s, n]) => (
              <Chip key={s} size="small" variant="outlined" label={`${describeSource(s).label} · ${n}`} title={s} sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }} />
            ))}
          </Stack>
        )}
      </SectionCard>

      <SectionCard title="Recent events" subtitle={`${events.length} most recent, newest first`} dense>
        {events.length === 0 ? (
          <EmptyState title="Nothing yet" description="Capture something in an EPCIS repository or run a scenario." />
        ) : (
          <Box sx={{ overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Event time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Step</TableCell>
                  <TableCell>Identifiers</TableCell>
                  <TableCell>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.eventID} hover onClick={() => setSelected(e)} sx={{ cursor: 'pointer', bgcolor: fresh.has(e.eventID) ? '#dcfce7' : 'inherit', transition: 'background-color 1.5s' }}>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDateTime(e.eventTime)}</TableCell>
                    <TableCell>
                      <EventTypeChip type={e.type} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5 }}>
                      {shortVocab(e.bizStep)}
                      {e.action ? <Typography variant="caption" color="text.secondary"> · {e.action}</Typography> : null}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(e.involved || []).slice(0, 4).map((v) => (
                          <Chip key={`${v.objectID}-${v.role}`} size="small" label={describeId(v.objectID).short} sx={{ height: 20, fontSize: 10.5, fontFamily: '"JetBrains Mono", monospace', bgcolor: (roleColors[v.objectRole] || roleColors.product).light }} />
                        ))}
                        {(e.involved || []).length > 4 && <Chip size="small" label={`+${e.involved.length - 4}`} sx={{ height: 20, fontSize: 10.5 }} />}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Stack direction="row" spacing={0.5}>
                        {(e.sources && e.sources.length ? e.sources : [e.source]).filter(Boolean).map((s) => {
                          const d = describeSource(s);
                          return <Chip key={s} size="small" variant="outlined" label={d.label} title={s} sx={{ height: 20, fontSize: 10.5, fontFamily: '"JetBrains Mono", monospace' }} />;
                        })}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionCard>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selected && (
            <Stack direction="row" spacing={1} alignItems="center">
              <EventTypeChip type={selected.type} short={false} />
              <span>{shortVocab(selected.bizStep)}</span>
            </Stack>
          )}
        </DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <IdLabel id={selected.eventID} max={80} />
                {(selected.involved || []).map((v) => (
                  <Stack key={`${v.objectID}-${v.role}`} direction="row" spacing={1} alignItems="center">
                    <Chip size="small" variant="outlined" label={v.role} sx={{ height: 20, fontSize: 10.5, minWidth: 90 }} />
                    <IdLabel id={v.objectID} max={60} copy={false} />
                    <Button size="small" component={RouterLink} to={`/traceability?id=${encodeURIComponent(v.objectID)}&direction=both`}>
                      trace
                    </Button>
                  </Stack>
                ))}
              </Stack>
              <JsonViewer value={selected.event} maxHeight={420} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
