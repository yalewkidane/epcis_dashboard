import React from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import SensorsIcon from '@mui/icons-material/Sensors';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../../api/useApi';
import { useAsync } from '../../hooks/useAsync';
import { useConnectionStatus } from '../../components/layout/Topbar';
import { StatTile, SectionCard, StatusChip } from '../../components/common';
import { roleColors, linkColors } from '../../theme';

function SchemaDiagram() {
  const node = (x, y, color, label, sub, square) => (
    <g key={label}>
      {square ? <rect x={x - 28} y={y - 18} width={56} height={36} rx={6} fill={color} /> : <circle cx={x} cy={y} r={26} fill={color} />}
      <text x={x} y={y + (sub ? -2 : 4)} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
        {label}
      </text>
      {sub && (
        <text x={x} y={y + 11} textAnchor="middle" fill="#fff" fontSize="9">
          {sub}
        </text>
      )}
    </g>
  );
  const edge = (x1, y1, x2, y2, color, label, dashed) => (
    <g key={label + x1 + y1}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeDasharray={dashed ? '4 3' : undefined} markerEnd="url(#arrow)" />
      <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle" fontSize="9.5" fill={color} fontWeight="600" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}>
        {label}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 520 250" width="100%" style={{ maxHeight: 250 }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#64748b" />
        </marker>
      </defs>
      {edge(96, 60, 232, 60, linkColors.AGGREGATED_INTO, 'AGGREGATED_INTO')}
      {edge(286, 60, 422, 60, linkColors.TRANSFORMED_TO, 'TRANSFORMED_TO')}
      {edge(96, 78, 232, 190, linkColors.INVOLVED_IN, 'INVOLVED_IN', true)}
      {edge(260, 86, 260, 172, linkColors.INVOLVED_IN, 'INVOLVED_IN', true)}
      {edge(424, 78, 288, 190, linkColors.INVOLVED_IN, 'INVOLVED_IN', true)}
      <path d="M 283 40 C 320 0, 200 0, 237 40" fill="none" stroke={linkColors.AGGREGATED_INTO} strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path d="M 473 40 C 510 0, 390 0, 427 40" fill="none" stroke={linkColors.TRANSFORMED_TO} strokeWidth="1.5" markerEnd="url(#arrow)" />
      {node(70, 60, roleColors.product.main, 'Product', 'EPC / lot')}
      {node(260, 60, roleColors.aggregation.main, 'Aggregated', 'case, pallet')}
      {node(450, 60, roleColors.transformed.main, 'Transformed', 'new product')}
      {node(260, 200, roleColors.event.main, 'EPCIS event', null, true)}
      <text x="260" y="238" textAnchor="middle" fontSize="9.5" fill="#64748b">
        type · time · bizStep · disposition · location · source repository
      </text>
    </svg>
  );
}

export default function HomePage() {
  const api = useApi();
  const status = useConnectionStatus();
  const stats = useAsync(() => api.trace.stats(), [api]);
  const scenarios = useAsync(() => api.trace.scenarios(), [api]);
  const s = stats.data;

  return (
    <Box>
      <Card sx={{ mb: 3, background: 'linear-gradient(120deg,#0b1220 0%,#1e293b 55%,#1d4ed8 100%)', color: '#fff', border: 0 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Chip label="EPCIS 2.0 · GS1 Digital Link · Knowledge graph" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#fff', maxWidth: 820 }}>
            One query for the whole life of a product, across every partner's EPCIS repository.
          </Typography>
          <Typography sx={{ mt: 1.5, maxWidth: 760, color: '#cbd5e1' }}>
            Partners capture visibility events in their own EPCIS 2.0 repositories. The traceability knowledge graph subscribes to all of them, links identifiers through packing and
            transformation, and answers lineage questions that would otherwise need a chain of queries across repositories.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
            <Button variant="contained" size="large" startIcon={<HubOutlinedIcon />} component={RouterLink} to="/traceability" sx={{ bgcolor: '#fff', color: '#0b1220', '&:hover': { bgcolor: '#e2e8f0' } }}>
              Open the explorer
            </Button>
            <Button variant="outlined" size="large" startIcon={<PlayCircleOutlineIcon />} component={RouterLink} to="/traceability/scenarios" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
              Run a scenario
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatTile label="Identifiers in graph" value={s && s.nodes.objects} hint={s ? `${s.nodes.aggregations} containers · ${s.nodes.transformed} transformed` : ''} icon={<Inventory2OutlinedIcon />} color={roleColors.product.main} loading={stats.loading && !s} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile label="Events in graph" value={s && s.nodes.events} hint={s ? Object.entries(s.eventsByType).map(([t, n]) => `${n} ${t.replace('Event', '')}`).join(' · ') : ''} icon={<EventNoteOutlinedIcon />} color={roleColors.event.main} loading={stats.loading && !s} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile label="Lineage edges" value={s && s.relationships.AGGREGATED_INTO + s.relationships.TRANSFORMED_TO} hint={s ? `${s.relationships.AGGREGATED_INTO} packing · ${s.relationships.TRANSFORMED_TO} transformation` : ''} icon={<AccountTreeOutlinedIcon />} color={roleColors.aggregation.main} loading={stats.loading && !s} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile label="Source channels" value={s && s.eventsBySource ? Object.keys(s.eventsBySource).length : '–'} hint={s && s.eventsBySource ? Object.keys(s.eventsBySource).map((x) => x.split(':')[0]).join(', ') : ''} icon={<SensorsIcon />} color="#0d9488" loading={stats.loading && !s} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <SectionCard title="How it works" subtitle="The architecture of the paper, in three steps">
            <Grid container spacing={2}>
              {[
                { icon: <StorageOutlinedIcon />, color: '#2563eb', title: '1 · Capture', text: 'Each partner records ObjectEvents, AggregationEvents and TransformationEvents in its own EPCIS 2.0 repository, using GS1 keys for every item, lot, case and pallet.' },
                { icon: <SensorsIcon />, color: '#0d9488', title: '2 · Subscribe and link', text: 'The graph service subscribes (MQTT, webhook or websocket) to every repository and merges the events into one knowledge graph, keeping the repository each event came from.' },
                { icon: <QueryStatsIcon />, color: '#7c3aed', title: '3 · Ask once', text: 'Packing and transformation become recursive edges, so a single traversal returns the complete history of a product through any number of re-identifications.' },
              ].map((c) => (
                <Grid item xs={12} md={4} key={c.title}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: `${c.color}1f`, color: c.color, mb: 1 }}>{c.icon}</Box>
                  <Typography variant="subtitle2">{c.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.text}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
          <SectionCard title="Knowledge graph schema" subtitle="Two node types, three identifier roles, recursive lineage edges" sx={{ mt: 2.5 }}>
            <SchemaDiagram />
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <SectionCard title="Connected systems" action={<Button size="small" component={RouterLink} to="/settings">Settings</Button>}>
            <Stack spacing={1}>
              {(status.data ? status.data.repos : []).map((r) => (
                <Stack key={r.name} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <StorageOutlinedIcon fontSize="small" color="action" />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        EPCIS repository · {r.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {r.url}
                      </Typography>
                    </Box>
                  </Stack>
                  <StatusChip ok={r.ok} label={r.ok ? 'online' : 'offline'} />
                </Stack>
              ))}
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <HubOutlinedIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Traceability knowledge graph
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {api.trace.base}
                    </Typography>
                  </Box>
                </Stack>
                <StatusChip ok={status.data && status.data.graph.ok} label={status.data && status.data.graph.ok ? 'online' : 'offline'} loading={!status.data} />
              </Stack>
            </Stack>
          </SectionCard>
          <SectionCard title="Demo scenarios" subtitle="Ready-made supply-chain stories you can replay" sx={{ mt: 2.5 }} action={<Button size="small" component={RouterLink} to="/traceability/scenarios" startIcon={<PlayCircleOutlineIcon />}>Runner</Button>}>
            <Stack spacing={1.5}>
              {(scenarios.data || []).map((sc) => (
                <Box key={sc.name}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AutoFixHighOutlinedIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2">{sc.title}</Typography>
                    <Chip size="small" label={`${sc.steps} steps`} sx={{ height: 20, fontSize: 10.5 }} />
                  </Stack>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, ml: 3.5 }} flexWrap="wrap" useFlexGap>
                    {(sc.highlights || []).map((h) => (
                      <Chip key={h.id} size="small" variant="outlined" label={h.label} component={RouterLink} to={`/traceability?id=${encodeURIComponent(h.id)}&direction=both`} clickable sx={{ height: 22 }} />
                    ))}
                  </Stack>
                </Box>
              ))}
              {scenarios.data && !scenarios.data.length && (
                <Typography variant="body2" color="text.secondary">
                  No scenarios found on the graph service.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
