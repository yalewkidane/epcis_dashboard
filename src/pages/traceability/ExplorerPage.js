import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Slider, Stack, Tab, Tabs, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../api/useApi';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader, ErrorAlert, LoadingBlock, EmptyState } from '../../components/common';
import TraceGraph from '../../components/graph/TraceGraph';
import IdentifierSearch from '../../components/trace/IdentifierSearch';
import { TraceSummary, TraceTimeline, EventsTable, ContainmentTree } from '../../components/trace/TracePanels';
import NodeDetailsDrawer from '../../components/trace/NodeDetailsDrawer';

const DIRECTIONS = [
  { value: 'forward', label: 'Forward', icon: <ArrowForwardIcon fontSize="small" />, hint: 'Where did it go: containers it was packed into and products made from it' },
  { value: 'backward', label: 'Backward', icon: <ArrowBackIcon fontSize="small" />, hint: 'Where did it come from: what it contained and what it was made from' },
  { value: 'both', label: 'Both', icon: <SwapHorizIcon fontSize="small" />, hint: 'The whole connected lineage' },
];

export default function ExplorerPage() {
  const api = useApi();
  const [params, setParams] = useSearchParams();
  const id = params.get('id') || '';
  const direction = params.get('direction') || 'both';
  const depth = Number(params.get('depth') || 10);

  const tab = params.get('tab') || 'summary';
  const [draftId, setDraftId] = useState(id);
  const [selected, setSelected] = useState(null);

  useEffect(() => setDraftId(id), [id]);

  const scenarios = useAsync(() => api.trace.scenarios(), [api]);
  const examples = useMemo(() => (scenarios.data || []).flatMap((s) => s.highlights || []), [scenarios.data]);

  const trace = useAsync(
    async () => {
      if (!id) return null;
      const [graph, events] = await Promise.all([api.trace.graph(id, { direction, depth }), api.trace.trace(id, { direction, depth })]);
      return { graph, events };
    },
    [api, id, direction, depth]
  );

  const setQuery = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === null || v === '') next.delete(k);
        else next.set(k, String(v));
      }
      setParams(next);
    },
    [params, setParams]
  );

  const run = (value) => {
    const target = (value || draftId || '').trim();
    if (target) setQuery({ id: target });
  };

  const onNodeClick = (node) => setSelected(node);
  const pickId = (newId) => {
    setSelected(null);
    setQuery({ id: newId });
  };

  const graph = trace.data && trace.data.graph;
  const events = trace.data && trace.data.events;
  const eventById = (eventID) => graph && graph.nodes.find((n) => n.kind === 'event' && n.id === eventID);

  return (
    <Box>
      <PageHeader
        title="Traceability explorer"
        subtitle="Enter any GS1 identifier and the knowledge graph returns its full history in a single query, across every packing level, transformation and EPCIS repository."
      />

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} lg={6}>
              <IdentifierSearch value={draftId} onChange={setDraftId} onSubmit={run} examples={examples} autoFocus={!id} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Direction
              </Typography>
              <ToggleButtonGroup size="small" exclusive value={direction} onChange={(e, v) => v && setQuery({ direction: v })} fullWidth>
                {DIRECTIONS.map((d) => (
                  <ToggleButton key={d.value} value={d.value} sx={{ gap: 0.5, px: 1 }}>
                    <Tooltip title={d.hint}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {d.icon}
                        <span>{d.label}</span>
                      </Stack>
                    </Tooltip>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={7} sm={3.5} lg={1.6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Depth: {depth}
              </Typography>
              <Slider size="small" min={1} max={25} value={depth} onChange={(e, v) => setQuery({ depth: v })} sx={{ mt: 0.25 }} />
            </Grid>
            <Grid item xs={5} sm={2.5} lg={1.4}>
              <Button variant="contained" startIcon={<HubOutlinedIcon />} onClick={() => run()} fullWidth sx={{ mt: 2.25 }}>
                Trace
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ErrorAlert error={trace.error} title="Trace failed" onRetry={trace.reload} />

      {!id && !trace.loading && (
        <Card>
          <EmptyState
            icon={<HubOutlinedIcon fontSize="inherit" />}
            title="Pick an identifier to start"
            description="Search for a product, lot, case or pallet known to the graph, or use one of the example identifiers from the loaded scenarios."
          />
        </Card>
      )}

      {id && trace.loading && !trace.data && <LoadingBlock height={420} label="Traversing the knowledge graph…" />}

      {id && graph && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={7}>
            <TraceGraph data={graph} height={640} onNodeClick={onNodeClick} selectedId={selected && selected.id} />
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: 640, display: 'flex', flexDirection: 'column' }}>
              <Tabs value={tab} onChange={(e, v) => setQuery({ tab: v === 'summary' ? '' : v })} variant="fullWidth" sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 44 }}>
                <Tab value="summary" label="Summary" sx={{ minHeight: 44 }} />
                <Tab value="timeline" label={`Timeline (${events ? events.events.length : 0})`} sx={{ minHeight: 44 }} />
                <Tab value="events" label="Events" sx={{ minHeight: 44 }} />
                <Tab value="packing" label="Packing" sx={{ minHeight: 44 }} />
              </Tabs>
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {tab === 'summary' && <TraceSummary trace={events} graph={graph} />}
                {tab === 'timeline' && <TraceTimeline events={events ? events.events : []} selectedId={selected && selected.kind === 'event' ? selected.id : null} onSelect={(e) => setSelected(eventById(e.eventID) || { ...e, kind: 'event', id: e.eventID })} />}
                {tab === 'events' && <EventsTable events={events ? events.events : []} selectedId={selected && selected.kind === 'event' ? selected.id : null} onSelect={(e) => setSelected(eventById(e.eventID) || { ...e, kind: 'event', id: e.eventID })} />}
                {tab === 'packing' && <ContainmentTree graph={graph} onSelect={(oid) => setSelected({ kind: 'object', id: oid })} />}
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      <NodeDetailsDrawer node={selected} onClose={() => setSelected(null)} onTrace={pickId} onPick={(oid) => setSelected({ kind: 'object', id: oid })} />
    </Box>
  );
}
