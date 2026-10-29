import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Box, Chip, IconButton, Stack, Tooltip, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { roleColors, linkColors, eventTypeColors } from '../../theme';
import { describeId, shortVocab, eventTypeShort } from '../../utils/ids';

const LINK_LABELS = { AGGREGATED_INTO: 'packed into', TRANSFORMED_TO: 'transformed to', INVOLVED_IN: 'involved in' };

/** Convert the API's {nodes, links} into force-graph data (cloned: the library mutates it). */
export function toGraphData(data, { showEvents = true, showInvolvement = true } = {}) {
  if (!data) return { nodes: [], links: [] };
  const nodes = data.nodes
    .filter((n) => showEvents || n.kind !== 'event')
    .map((n) => ({
      ...n,
      label: n.kind === 'event' ? shortVocab(n.bizStep) || eventTypeShort(n.type) : describeId(n.id).short,
      isRoot: n.id === data.root,
    }));
  const ids = new Set(nodes.map((n) => n.id));
  const links = data.links
    .filter((l) => ids.has(l.source) && ids.has(l.target))
    .filter((l) => showInvolvement || l.kind !== 'involvement')
    .map((l) => ({ ...l, label: LINK_LABELS[l.type] || l.type }));
  return { nodes, links };
}

export function GraphLegend({ compact }) {
  return (
    <Stack direction="row" spacing={compact ? 1 : 1.5} flexWrap="wrap" useFlexGap alignItems="center">
      {Object.entries(roleColors).map(([k, v]) => (
        <Stack key={k} direction="row" spacing={0.6} alignItems="center">
          <Box sx={{ width: 10, height: 10, borderRadius: k === 'event' ? 0.5 : '50%', bgcolor: v.main }} />
          <Typography variant="caption">{compact ? (k === 'aggregation' ? 'Aggregation' : v.label.split(' ')[0]) : v.label}</Typography>
        </Stack>
      ))}
      <Stack direction="row" spacing={0.6} alignItems="center">
        <Box sx={{ width: 18, height: 2.5, bgcolor: linkColors.AGGREGATED_INTO }} />
        <Typography variant="caption">packed into</Typography>
      </Stack>
      <Stack direction="row" spacing={0.6} alignItems="center">
        <Box sx={{ width: 18, height: 2.5, bgcolor: linkColors.TRANSFORMED_TO }} />
        <Typography variant="caption">transformed to</Typography>
      </Stack>
      <Stack direction="row" spacing={0.6} alignItems="center">
        <Box sx={{ width: 18, height: 0, borderTop: `2px dashed ${linkColors.INVOLVED_IN}` }} />
        <Typography variant="caption">involved in</Typography>
      </Stack>
    </Stack>
  );
}

/**
 * Interactive rendering of a trace sub-graph. Objects are circles coloured by role,
 * events are rounded squares; structural edges carry arrows and labels, involvement edges
 * are dashed. Hovering highlights the neighbourhood; clicking reports the node.
 */
export default function TraceGraph({ data, height = 600, onNodeClick, selectedId, controls = true, legend = true, initialShowEvents = true }) {
  const fgRef = useRef();
  const boxRef = useRef();
  const [width, setWidth] = useState(800);
  const [showEvents, setShowEvents] = useState(initialShowEvents);
  const [showInvolvement, setShowInvolvement] = useState(true);
  const [hover, setHover] = useState(null);
  const fitted = useRef(null);

  const graphData = useMemo(() => toGraphData(data, { showEvents, showInvolvement: showEvents && showInvolvement }), [data, showEvents, showInvolvement]);

  // neighbourhood index for hover highlighting
  const neighbours = useMemo(() => {
    const m = new Map();
    for (const l of graphData.links) {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      if (!m.has(s)) m.set(s, new Set());
      if (!m.has(t)) m.set(t, new Set());
      m.get(s).add(t);
      m.get(t).add(s);
    }
    return m;
  }, [graphData]);

  useEffect(() => {
    if (!boxRef.current) return undefined;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(Math.max(320, Math.floor(e.contentRect.width)));
    });
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force('charge').strength(-340);
    fg.d3Force('link').distance((l) => (l.kind === 'structure' ? 150 : 70));
    fitted.current = null;
  }, [graphData]);

  const fit = useCallback(() => fgRef.current && fgRef.current.zoomToFit(500, 60), []);

  const dim = (id) => hover && hover !== id && !(neighbours.get(hover) || new Set()).has(id);

  const drawNode = useCallback(
    (node, ctx, scale) => {
      const faded = dim(node.id);
      ctx.globalAlpha = faded ? 0.18 : 1;
      const selected = selectedId && node.id === selectedId;
      if (node.kind === 'event') {
        const s = 9;
        const color = eventTypeColors[node.type] || roleColors.event.main;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(node.x - s / 2, node.y - s / 2, s, s, 2);
        ctx.fill();
        if (selected) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();
        }
        if (scale > 1.1) {
          ctx.font = `${10 / scale}px Inter, sans-serif`;
          ctx.fillStyle = '#334155';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.label, node.x, node.y + s / 2 + 2 / scale);
        }
      } else {
        const c = roleColors[node.role] || roleColors.product;
        const r = node.isRoot ? 11 : node.role === 'aggregation' ? 9 : 7.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = c.main;
        ctx.fill();
        ctx.lineWidth = selected || node.isRoot ? 2.5 : 1.5;
        ctx.strokeStyle = selected ? '#0f172a' : node.isRoot ? c.dark : '#fff';
        ctx.stroke();
        if (node.isRoot) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
          ctx.strokeStyle = `${c.main}66`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.font = `${(node.isRoot ? 12 : 11) / scale}px Inter, sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.label, node.x, node.y + r + 2.5 / scale);
      }
      ctx.globalAlpha = 1;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hover, neighbours, selectedId]
  );

  const paintPointer = useCallback((node, color, ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  const drawLinkLabel = useCallback(
    (link, ctx, scale) => {
      if (link.kind !== 'structure' || scale < 1.3) return;
      const s = link.source;
      const t = link.target;
      if (!s || !t || typeof s !== 'object') return;
      const faded = hover && !(s.id === hover || t.id === hover);
      ctx.globalAlpha = faded ? 0.15 : 1;
      const x = (s.x + t.x) / 2;
      const y = (s.y + t.y) / 2;
      ctx.font = `${9.5 / scale}px Inter, sans-serif`;
      const w = ctx.measureText(link.label).width;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(x - w / 2 - 2 / scale, y - 6 / scale, w + 4 / scale, 12 / scale);
      ctx.fillStyle = linkColors[link.type] || '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(link.label, x, y);
      ctx.globalAlpha = 1;
    },
    [hover]
  );

  const linkColor = useCallback(
    (l) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      const faded = hover && !(s === hover || t === hover);
      const base = l.kind === 'structure' ? linkColors[l.type] || '#64748b' : linkColors.INVOLVED_IN;
      return faded ? `${base}2a` : base;
    },
    [hover]
  );

  const empty = !graphData.nodes.length;

  return (
    <Box ref={boxRef} sx={{ position: 'relative', height, borderRadius: 2, overflow: 'hidden', bgcolor: '#fbfcfe', border: '1px solid', borderColor: 'divider' }}>
      {!empty && (
        <ForceGraph2D
          ref={fgRef}
          width={width}
          height={height}
          graphData={graphData}
          nodeId="id"
          nodeLabel={(n) => (n.kind === 'event' ? `${n.type} · ${shortVocab(n.bizStep)}` : `${describeId(n.id).kind} · ${n.id}`)}
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => 'replace'}
          nodePointerAreaPaint={paintPointer}
          linkColor={linkColor}
          linkWidth={(l) => (l.kind === 'structure' ? 2.2 : 1)}
          linkLineDash={(l) => (l.kind === 'structure' ? null : [3, 3])}
          linkDirectionalArrowLength={(l) => (l.kind === 'structure' ? 6 : 0)}
          linkDirectionalArrowRelPos={1}
          linkCanvasObject={drawLinkLabel}
          linkCanvasObjectMode={() => 'after'}
          onNodeClick={(n) => onNodeClick && onNodeClick(n)}
          onNodeHover={(n) => setHover(n ? n.id : null)}
          cooldownTicks={140}
          d3VelocityDecay={0.3}
          onEngineStop={() => {
            if (fitted.current !== graphData) {
              fitted.current = graphData;
              fit();
            }
          }}
        />
      )}
      {empty && (
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">No graph to show yet</Typography>
        </Box>
      )}
      {controls && !empty && (
        <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 10, right: 10 }}>
          <ToggleButtonGroup size="small" value={[showEvents && 'events', showInvolvement && 'inv'].filter(Boolean)} sx={{ bgcolor: '#fff' }}>
            <ToggleButton value="events" onClick={() => setShowEvents((v) => !v)} sx={{ fontSize: 11, py: 0.4 }}>
              Events
            </ToggleButton>
            <ToggleButton value="inv" onClick={() => setShowInvolvement((v) => !v)} disabled={!showEvents} sx={{ fontSize: 11, py: 0.4 }}>
              Involvement edges
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Fit to view">
            <IconButton size="small" onClick={fit} sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
              <FitScreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
      {legend && !empty && (
        <Box sx={{ position: 'absolute', left: 10, bottom: 8, bgcolor: 'rgba(255,255,255,0.9)', px: 1.25, py: 0.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
          <GraphLegend compact />
        </Box>
      )}
      {!empty && data && data.summary && (
        <Chip size="small" label={`${data.summary.objectCount} objects · ${data.summary.eventCount} events`} sx={{ position: 'absolute', left: 10, top: 10, bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }} />
      )}
    </Box>
  );
}
