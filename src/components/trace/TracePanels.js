import React, { useMemo, useState } from 'react';
import { Box, Chip, Collapse, Divider, Grid, IconButton, List, ListItemButton, ListItemText, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { EventTypeChip, IdLabel, RoleChip, StatTile, EmptyState } from '../common';
import { roleColors, eventTypeColors } from '../../theme';
import { describeId, fmtDateTime, fmtDate, shortVocab, describeSource } from '../../utils/ids';

/* ------------------------------------------------------------------ summary */

export function TraceSummary({ trace, graph }) {
  if (!trace) return null;
  const s = trace.summary || {};
  const roles = trace.objects.reduce((acc, o) => ({ ...acc, [o.role]: (acc[o.role] || 0) + 1 }), {});
  const maxHops = Math.max(0, ...trace.objects.map((o) => o.hops));
  const types = trace.events.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }), {});
  const sources = trace.events.reduce((acc, e) => {
    for (const src of e.sources && e.sources.length ? e.sources : [e.source || 'unknown']) acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});
  const structural = graph ? graph.links.filter((l) => l.kind === 'structure') : [];
  const agg = structural.filter((l) => l.type === 'AGGREGATED_INTO').length;
  const tr = structural.filter((l) => l.type === 'TRANSFORMED_TO').length;

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <StatTile label="Graph queries" value={1} hint="any depth" color={roleColors.event.main} />
        </Grid>
        <Grid item xs={6}>
          <StatTile label="EPCIS queries saved" value={s.epcisQueriesNeeded} hint="one per identifier" color="#dc2626" />
        </Grid>
        <Grid item xs={6}>
          <StatTile label="Identifiers" value={s.objectCount} hint={`up to ${maxHops} hop${maxHops === 1 ? '' : 's'} away`} color={roleColors.product.main} />
        </Grid>
        <Grid item xs={6}>
          <StatTile label="Events" value={s.eventCount} hint={`${agg} packing · ${tr} transform.`} color="#16a34a" />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
        Identifiers reached
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {Object.entries(roles).map(([r, n]) => (
          <RoleChip key={r} role={r} label={`${n} ${r}`} />
        ))}
      </Stack>

      <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
        Event types
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {Object.entries(types).map(([t, n]) => (
          <Chip key={t} size="small" label={`${n} × ${t}`} sx={{ bgcolor: `${eventTypeColors[t] || '#64748b'}1f`, color: eventTypeColors[t] || '#64748b', fontWeight: 600 }} />
        ))}
      </Stack>

      <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
        Event sources (repositories / channels)
      </Typography>
      <Stack spacing={0.5}>
        {Object.entries(sources).map(([src, n]) => (
          <Stack key={src} direction="row" justifyContent="space-between">
            <Typography variant="body2" title={src} sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}>
              {describeSource(src).label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {n} events
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
        Traversal
      </Typography>
      <List dense disablePadding>
        {trace.objects.map((o) => (
          <ListItemButton key={o.objectID} sx={{ borderRadius: 1, py: 0.25 }}>
            <Chip size="small" label={`${o.hops} hop${o.hops === 1 ? '' : 's'}`} variant="outlined" sx={{ mr: 1, minWidth: 64, height: 20, fontSize: 10.5 }} />
            <IdLabel id={o.objectID} role={o.role} copy={false} max={60} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

/* ------------------------------------------------------------------ timeline */

export function TraceTimeline({ events, onSelect, selectedId }) {
  if (!events || !events.length) return <EmptyState title="No events" description="The identifier has no events yet." />;
  return (
    <Timeline position="right" sx={{ p: 0, m: 0, '& .MuiTimelineItem-root:before': { flex: 0, p: 0 } }}>
      {events.map((e, i) => {
        const color = eventTypeColors[e.type] || '#64748b';
        const selected = selectedId === e.eventID;
        return (
          <TimelineItem key={e.eventID} sx={{ minHeight: 0 }}>
            <TimelineOppositeContent sx={{ flex: '0 0 110px', pl: 0, pr: 1.5, pt: 0.9 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                {fmtDate(e.eventTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {e.eventTime ? new Date(e.eventTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: color, boxShadow: selected ? `0 0 0 4px ${color}33` : 'none', my: 0.75 }} />
              {i < events.length - 1 && <TimelineConnector sx={{ bgcolor: 'divider' }} />}
            </TimelineSeparator>
            <TimelineContent sx={{ pt: 0.5, pb: 2, pr: 0 }}>
              <Box
                onClick={() => onSelect && onSelect(e)}
                sx={{ cursor: onSelect ? 'pointer' : 'default', borderRadius: 1.5, p: 1, border: '1px solid', borderColor: selected ? color : 'divider', bgcolor: selected ? `${color}0d` : '#fff', '&:hover': { borderColor: color } }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="subtitle2">{shortVocab(e.bizStep) || '(no bizStep)'}</Typography>
                  <EventTypeChip type={e.type} />
                  {e.action && <Chip size="small" variant="outlined" label={e.action} sx={{ height: 20, fontSize: 10.5 }} />}
                  {e.disposition && (
                    <Typography variant="caption" color="text.secondary">
                      → {shortVocab(e.disposition)}
                    </Typography>
                  )}
                </Stack>
                {e.via && e.via.length > 0 && (
                  <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      via
                    </Typography>
                    {e.via.map((v) => (
                      <Tooltip key={`${v.objectID}-${v.role}`} title={`${v.objectID} (${v.role}, ${v.hops} hops)`}>
                        <Chip size="small" label={describeId(v.objectID).short} sx={{ height: 20, fontSize: 10.5, fontFamily: '"JetBrains Mono", monospace' }} />
                      </Tooltip>
                    ))}
                  </Stack>
                )}
                {(e.bizLocation || e.readPoint) && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    at {describeId(e.bizLocation || e.readPoint).short}
                    {e.sources && e.sources.length ? ` · from ${e.sources.map((s) => describeSource(s).label).join(', ')}` : ''}
                  </Typography>
                )}
              </Box>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

/* ------------------------------------------------------------------ table */

export function EventsTable({ events, onSelect, selectedId, dense = true }) {
  if (!events || !events.length) return <EmptyState title="No events" />;
  return (
    <Box sx={{ overflow: 'auto' }}>
      <Table size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Step</TableCell>
            <TableCell>Identifiers</TableCell>
            <TableCell>Location</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((e) => (
            <TableRow key={e.eventID} hover selected={selectedId === e.eventID} onClick={() => onSelect && onSelect(e)} sx={{ cursor: onSelect ? 'pointer' : 'default' }}>
              <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDateTime(e.eventTime)}</TableCell>
              <TableCell>
                <EventTypeChip type={e.type} />
              </TableCell>
              <TableCell sx={{ fontSize: 12.5 }}>
                {shortVocab(e.bizStep)}
                {e.action ? <Typography variant="caption" color="text.secondary"> · {e.action}</Typography> : null}
              </TableCell>
              <TableCell sx={{ maxWidth: 260 }}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {(e.via || e.involved || []).slice(0, 4).map((v) => (
                    <Chip key={`${v.objectID}-${v.role}`} size="small" label={describeId(v.objectID).short} sx={{ height: 20, fontSize: 10.5, fontFamily: '"JetBrains Mono", monospace' }} />
                  ))}
                  {(e.via || e.involved || []).length > 4 && <Chip size="small" label={`+${(e.via || e.involved).length - 4}`} sx={{ height: 20, fontSize: 10.5 }} />}
                </Stack>
              </TableCell>
              <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{describeId(e.bizLocation || e.readPoint || '').short}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

/* ------------------------------------------------------------------ containment tree */

function TreeNode({ id, childrenMap, edgeMap, depth, onSelect, roleOf }) {
  const [open, setOpen] = useState(true);
  const kids = childrenMap.get(id) || [];
  const d = describeId(id);
  return (
    <>
      <ListItemButton sx={{ pl: 1 + depth * 2.5, py: 0.4, borderRadius: 1 }} onClick={() => onSelect && onSelect(id)}>
        {kids.length > 0 ? (
          <IconButton
            size="small"
            sx={{ mr: 0.5, p: 0.25 }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 28 }} />
        )}
        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: (roleColors[roleOf(id)] || roleColors.product).main, mr: 1, flexShrink: 0 }} />
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5 }}>{d.short}</Typography>
              <Chip size="small" variant="outlined" label={d.kind} sx={{ height: 18, fontSize: 10 }} />
              {kids.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {kids.length} item{kids.length === 1 ? '' : 's'}
                </Typography>
              )}
            </Stack>
          }
          secondary={
            edgeMap.get(id) ? (
              <Typography variant="caption" color={edgeMap.get(id).until ? 'text.secondary' : 'success.main'}>
                {edgeMap.get(id).until ? `inside ${fmtDate(edgeMap.get(id).from)} → left ${fmtDate(edgeMap.get(id).until)}` : `inside since ${fmtDate(edgeMap.get(id).from)}`}
              </Typography>
            ) : null
          }
        />
      </ListItemButton>
      {kids.length > 0 && (
        <Collapse in={open}>
          {kids.map((k) => (
            <TreeNode key={k} id={k} childrenMap={childrenMap} edgeMap={edgeMap} depth={depth + 1} onSelect={onSelect} roleOf={roleOf} />
          ))}
        </Collapse>
      )}
    </>
  );
}

/** Nested view of AGGREGATED_INTO edges within the trace sub-graph (history included). */
export function ContainmentTree({ graph, onSelect }) {
  const model = useMemo(() => {
    if (!graph) return null;
    const childrenMap = new Map();
    const edgeMap = new Map();
    const parents = new Set();
    const children = new Set();
    for (const l of graph.links) {
      if (l.type !== 'AGGREGATED_INTO') continue;
      if (!childrenMap.has(l.target)) childrenMap.set(l.target, []);
      childrenMap.get(l.target).push(l.source);
      edgeMap.set(l.source, { from: l.from, until: l.until });
      parents.add(l.target);
      children.add(l.source);
    }
    const roots = [...parents].filter((p) => !children.has(p));
    const roleOf = (id) => {
      const n = graph.nodes.find((x) => x.id === id);
      return n ? n.role : 'product';
    };
    return { childrenMap, edgeMap, roots, roleOf, count: edgeMap.size };
  }, [graph]);

  if (!model || !model.roots.length) {
    return <EmptyState icon={<Inventory2OutlinedIcon fontSize="inherit" />} title="No packing hierarchy" description="No aggregation (packing) relationships in this trace." />;
  }
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        Packing hierarchy reconstructed from AggregationEvents. Open edges mean the item is still inside; closed edges show when it was unpacked.
      </Typography>
      <Divider sx={{ my: 1 }} />
      <List dense disablePadding>
        {model.roots.map((r) => (
          <TreeNode key={r} id={r} childrenMap={model.childrenMap} edgeMap={model.edgeMap} depth={0} onSelect={onSelect} roleOf={model.roleOf} />
        ))}
      </List>
    </Box>
  );
}
