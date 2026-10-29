import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, Collapse, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../../api/useApi';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader, ErrorAlert, EventTypeChip, IdLabel, JsonViewer, SectionCard, EmptyState } from '../../components/common';
import { fmtDateTime, shortVocab, describeId, eventIdentifiers } from '../../utils/ids';

const EVENT_TYPES = ['ObjectEvent', 'AggregationEvent', 'TransformationEvent', 'TransactionEvent', 'AssociationEvent'];

function EventRow({ ev }) {
  const [open, setOpen] = useState(false);
  const ids = eventIdentifiers(ev);
  return (
    <>
      <TableRow hover onClick={() => setOpen((v) => !v)} sx={{ cursor: 'pointer', '& td': { borderBottom: open ? 0 : undefined } }}>
        <TableCell sx={{ width: 36, p: 0.5 }}>
          <IconButton size="small">{open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}</IconButton>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDateTime(ev.eventTime)}</TableCell>
        <TableCell>
          <EventTypeChip type={ev.type} />
        </TableCell>
        <TableCell sx={{ fontSize: 12.5 }}>
          {shortVocab(ev.bizStep)}
          {ev.action ? <Typography variant="caption" color="text.secondary"> · {ev.action}</Typography> : null}
        </TableCell>
        <TableCell sx={{ fontSize: 12.5 }}>{shortVocab(ev.disposition)}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {ids.slice(0, 3).map((x, i) => (
              <Chip key={`${x.id}-${i}`} size="small" label={describeId(x.id).short} sx={{ height: 20, fontSize: 10.5, fontFamily: '"JetBrains Mono", monospace' }} />
            ))}
            {ids.length > 3 && <Chip size="small" label={`+${ids.length - 3}`} sx={{ height: 20, fontSize: 10.5 }} />}
          </Stack>
        </TableCell>
        <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{describeId((ev.bizLocation && ev.bizLocation.id) || (ev.readPoint && ev.readPoint.id) || '').short}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, borderBottom: open ? undefined : 0 }}>
          <Collapse in={open} unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap alignItems="center">
                <IdLabel id={ev.eventID || '(no eventID)'} max={70} />
                {ids.map((x, i) => (
                  <Button key={`${x.id}-${i}`} size="small" variant="outlined" startIcon={<HubOutlinedIcon />} component={RouterLink} to={`/traceability?id=${encodeURIComponent(x.id)}&direction=both`} sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>
                    {describeId(x.id).short}
                  </Button>
                ))}
              </Stack>
              <JsonViewer value={ev} maxHeight={380} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function EventsPage() {
  const api = useApi();
  const [form, setForm] = useState({ eventType: '', bizStep: '', disposition: '', epc: '', from: '', to: '', perPage: 20 });
  const [applied, setApplied] = useState(form);
  const [tokens, setTokens] = useState([]); // page history
  const [token, setToken] = useState(null);

  const params = useMemo(() => {
    const p = { perPage: applied.perPage, orderBy: 'eventTime', orderDirection: 'DESC' };
    if (applied.eventType) p.eventType = JSON.stringify([applied.eventType]);
    if (applied.bizStep) p.EQ_bizStep = JSON.stringify([applied.bizStep]);
    if (applied.disposition) p.EQ_disposition = JSON.stringify([applied.disposition]);
    if (applied.epc) p.MATCH_anyEPC = JSON.stringify([applied.epc]);
    if (applied.from) p.GE_eventTime = new Date(applied.from).toISOString();
    if (applied.to) p.LT_eventTime = new Date(applied.to).toISOString();
    if (token) p.nextPageToken = token;
    return p;
  }, [applied, token]);

  const page = useAsync(() => api.epcis.events(params), [api, params]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const apply = () => {
    setTokens([]);
    setToken(null);
    setApplied(form);
  };
  const nextPage = () => {
    if (!page.data || !page.data.nextPageToken) return;
    setTokens((t) => [...t, token]);
    setToken(page.data.nextPageToken);
  };
  const prevPage = () => {
    setTokens((t) => {
      const copy = [...t];
      const prev = copy.pop();
      setToken(prev === undefined ? null : prev);
      return copy;
    });
  };

  const events = page.data ? page.data.events : [];

  return (
    <Box>
      <PageHeader title="Events" subtitle={`Parameterised event query against ${api.activeRepository.name} (${api.epcis.base}/events).`} />

      <SectionCard sx={{ mb: 2.5 }} dense>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Event type</InputLabel>
              <Select value={form.eventType} label="Event type" onChange={set('eventType')}>
                <MenuItem value="">Any</MenuItem>
                {EVENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField size="small" fullWidth label="Business step" value={form.bizStep} onChange={set('bizStep')} placeholder="shipping" />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField size="small" fullWidth label="Disposition" value={form.disposition} onChange={set('disposition')} placeholder="in_transit" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField size="small" fullWidth label="Identifier (MATCH_anyEPC)" value={form.epc} onChange={set('epc')} InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5 } }} />
          </Grid>
          <Grid item xs={6} sm={4} md={1.5}>
            <TextField size="small" fullWidth label="From" type="datetime-local" value={form.from} onChange={set('from')} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} sm={4} md={1.5}>
            <TextField size="small" fullWidth label="To" type="datetime-local" value={form.to} onChange={set('to')} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} sm={2} md={1}>
            <TextField size="small" fullWidth label="Rows" type="number" value={form.perPage} onChange={set('perPage')} />
          </Grid>
          <Grid item xs={6} sm={2} md={1.5}>
            <Button variant="contained" fullWidth startIcon={<SearchIcon />} onClick={apply}>
              Query
            </Button>
          </Grid>
        </Grid>
      </SectionCard>

      <ErrorAlert error={page.error} onRetry={page.reload} />

      <SectionCard
        title={`${events.length} events`}
        subtitle={page.data && page.data.maxEventCount ? `server limit ${page.data.maxEventCount} per page` : ''}
        action={
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={prevPage} disabled={!tokens.length}>
              Previous
            </Button>
            <Button size="small" onClick={nextPage} disabled={!page.data || !page.data.nextPageToken}>
              Next page
            </Button>
          </Stack>
        }
        dense
      >
        {!page.loading && !events.length ? (
          <EmptyState title="No events match" description="Loosen the filters or capture some events first." />
        ) : (
          <Box sx={{ overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Event time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Step</TableCell>
                  <TableCell>Disposition</TableCell>
                  <TableCell>Identifiers</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((ev, i) => (
                  <EventRow key={ev.eventID || i} ev={ev} />
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionCard>
    </Box>
  );
}
