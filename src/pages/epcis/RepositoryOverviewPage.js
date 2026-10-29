import React from 'react';
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../../api/useApi';
import { useAsync } from '../../hooks/useAsync';
import { VOCABULARIES } from '../../api/epcisClient';
import { PageHeader, StatTile, SectionCard, ErrorAlert, StatusChip, EventTypeChip } from '../../components/common';
import { EventsTable } from '../../components/trace/TracePanels';
import { fmtDateTime, fmtNumber, eventIdentifiers } from '../../utils/ids';
import { eventTypeColors } from '../../theme';

export default function RepositoryOverviewPage() {
  const api = useApi();
  const repo = api.activeRepository;

  const overview = useAsync(
    async () => {
      const [health, vocab, latest, queries] = await Promise.all([
        api.epcis.health().catch((e) => ({ error: e.message })),
        Promise.all(VOCABULARIES.map(async (v) => ({ ...v, items: await api.epcis.vocabulary(v.path).catch(() => []) }))),
        api.epcis.events({ perPage: 10, orderBy: 'recordTime', orderDirection: 'DESC' }).catch((e) => ({ events: [], error: e.message })),
        api.epcis.queries().catch(() => []),
      ]);
      return { health, vocab, latest, queries };
    },
    [api]
  );
  const d = overview.data;
  const events = d ? d.latest.events.map((e) => ({ ...e, involved: eventIdentifiers(e).map((x) => ({ objectID: x.id, role: x.role })) })) : [];

  return (
    <Box>
      <PageHeader
        title={`EPCIS repository · ${repo.name}`}
        subtitle={repo.url}
        chips={d && <StatusChip ok={d.health && !d.health.error} label={d.health && !d.health.error ? 'online' : 'offline'} />}
        actions={
          <Button startIcon={<RefreshIcon />} onClick={overview.reload} disabled={overview.loading}>
            Refresh
          </Button>
        }
      />
      <ErrorAlert error={overview.error} onRetry={overview.reload} />

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {(d ? d.vocab : VOCABULARIES.map((v) => ({ ...v, items: null }))).map((v) => (
          <Grid item xs={6} md={4} lg={2} key={v.key}>
            <StatTile label={v.label} value={v.items ? v.items.length : undefined} loading={!v.items} color={v.key === 'eventTypes' ? '#0284c7' : v.key === 'epcs' ? '#7c3aed' : '#475569'} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <SectionCard title="Latest captured events" subtitle="Ten most recently recorded events" action={<Button size="small" component={RouterLink} to="/epcis/events">All events</Button>} dense>
            {d && d.latest.error && <ErrorAlert error={new Error(d.latest.error)} />}
            <EventsTable events={events} />
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SectionCard title="Server" dense>
            {d && d.health && !d.health.error ? (
              <Stack spacing={0.75}>
                <Row label="Status" value={d.health.status} />
                <Row label="Uptime" value={`${Math.round((d.health.uptime || 0) / 3600)} h`} />
                <Row label="Memory (RSS)" value={`${fmtNumber(Math.round((d.health.memory_rss || 0) / 1048576))} MB`} />
                <Row label="Server time" value={fmtDateTime(d.health.timestamp)} />
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {d && d.health ? d.health.error : 'Checking…'}
              </Typography>
            )}
          </SectionCard>
          <SectionCard title="Event types" sx={{ mt: 2.5 }} dense>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {d && d.vocab.find((v) => v.key === 'eventTypes').items.map((t) => <EventTypeChip key={t} type={t} short={false} />)}
              {d && !d.vocab.find((v) => v.key === 'eventTypes').items.length && (
                <Typography variant="body2" color="text.secondary">
                  No events captured yet.
                </Typography>
              )}
            </Stack>
          </SectionCard>
          <SectionCard title="Named queries" subtitle="Stored queries used by stream subscriptions" sx={{ mt: 2.5 }} action={<Button size="small" component={RouterLink} to="/console/subscriptions">Manage</Button>} dense>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {d && d.queries.map((q) => <Chip key={q.name} size="small" label={q.name} sx={{ bgcolor: `${eventTypeColors.TransactionEvent}1f`, color: eventTypeColors.TransactionEvent, fontWeight: 600 }} />)}
              {d && !d.queries.length && (
                <Typography variant="body2" color="text.secondary">
                  None registered.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}
