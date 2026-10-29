import React from 'react';
import { Box, Button, Chip, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { useApi } from '../../api/useApi';
import { useAsync } from '../../hooks/useAsync';
import { EventTypeChip, IdLabel, JsonViewer, KindBadge, LoadingBlock, RoleChip, ErrorAlert } from '../common';
import { describeId, fmtDateTime, fmtDate, shortVocab, eventIdentifiers, describeSource } from '../../utils/ids';

function Row({ label, children }) {
  return (
    <Stack direction="row" spacing={1} sx={{ py: 0.5 }} alignItems="flex-start">
      <Typography variant="caption" color="text.secondary" sx={{ width: 110, flexShrink: 0, pt: 0.25 }}>
        {label}
      </Typography>
      <Box sx={{ minWidth: 0, flex: 1 }}>{children}</Box>
    </Stack>
  );
}

function ObjectDetails({ id, onTrace, onPick }) {
  const api = useApi();
  const { data, error, loading } = useAsync(() => api.trace.objectDetail(id), [api, id]);
  const d = describeId(id);
  if (loading) return <LoadingBlock label="Loading identifier" />;
  if (error) return <ErrorAlert error={error} />;
  if (!data) return null;
  const list = (items, empty) =>
    items.length ? (
      <Stack spacing={0.5}>
        {items.map((c) => (
          <Stack key={`${c.objectID}-${c.eventID || ''}`} direction="row" spacing={1} alignItems="center">
            <IdLabel id={c.objectID} onClick={() => onPick(c.objectID)} max={40} copy={false} />
            {c.from && (
              <Typography variant="caption" color={c.until ? 'text.secondary' : 'success.main'} sx={{ whiteSpace: 'nowrap' }}>
                {c.until ? `${fmtDate(c.from)} → ${fmtDate(c.until)}` : `since ${fmtDate(c.from)}`}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    ) : (
      <Typography variant="caption" color="text.secondary">
        {empty}
      </Typography>
    );
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <RoleChip role={data.role} />
        <KindBadge id={id} />
        <Chip size="small" variant="outlined" label={data.idType === 'class' ? 'class / lot level' : 'instance level'} sx={{ height: 20, fontSize: 10.5 }} />
      </Stack>
      <IdLabel id={id} max={64} />
      <Divider sx={{ my: 1.5 }} />
      <Row label="Events">{data.eventCount}</Row>
      <Row label="First seen">{fmtDateTime(data.firstSeen)}</Row>
      <Row label="Last seen">{fmtDateTime(data.lastSeen)}</Row>
      <Divider sx={{ my: 1.5 }} />
      <Row label="Inside (now)">{list(data.containers.current, 'not inside any container')}</Row>
      <Row label="Container history">{list(data.containers.history.filter((c) => c.until), 'none')}</Row>
      <Row label="Contains (now)">{list(data.children.current, 'empty')}</Row>
      <Row label="Contained before">{list(data.children.history.filter((c) => c.until), 'none')}</Row>
      <Divider sx={{ my: 1.5 }} />
      <Row label="Made from">{list(data.inputs, 'no transformation inputs')}</Row>
      <Row label="Turned into">{list(data.outputs, 'no transformation outputs')}</Row>
      <Button startIcon={<HubOutlinedIcon />} variant="contained" size="small" sx={{ mt: 2 }} onClick={() => onTrace(id)} fullWidth>
        Trace from {d.short}
      </Button>
    </Box>
  );
}

function EventDetails({ node, onPick }) {
  const ev = node.event || {};
  const ids = eventIdentifiers(ev);
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
        <EventTypeChip type={node.type} short={false} />
        {node.action && <Chip size="small" variant="outlined" label={node.action} />}
      </Stack>
      <Typography variant="h6" sx={{ fontSize: 17 }}>
        {shortVocab(node.bizStep) || '(no business step)'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {fmtDateTime(node.eventTime)}
        {node.disposition ? ` · disposition ${shortVocab(node.disposition)}` : ''}
      </Typography>
      <Divider sx={{ my: 1.5 }} />
      <Row label="Event ID">
        <IdLabel id={node.eventID} max={50} />
      </Row>
      {node.bizLocation && (
        <Row label="Business location">
          <IdLabel id={node.bizLocation} max={44} copy={false} />
        </Row>
      )}
      {node.readPoint && (
        <Row label="Read point">
          <IdLabel id={node.readPoint} max={44} copy={false} />
        </Row>
      )}
      {node.transformationID && (
        <Row label="Transformation">
          <IdLabel id={node.transformationID} max={44} copy={false} />
        </Row>
      )}
      {node.sources && node.sources.length > 0 && (
        <Row label="Received from">
          <Stack spacing={0.25}>
            {node.sources.map((s) => (
              <Typography key={s} variant="caption" title={s} sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {describeSource(s).label}
              </Typography>
            ))}
          </Stack>
        </Row>
      )}
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Identifiers involved
      </Typography>
      <Stack spacing={0.5}>
        {ids.map((x, i) => (
          <Stack key={`${x.id}-${x.role}-${i}`} direction="row" spacing={1} alignItems="center">
            <Chip size="small" variant="outlined" label={x.role} sx={{ height: 20, fontSize: 10.5, minWidth: 90 }} />
            <IdLabel id={x.id} onClick={() => onPick(x.id)} max={40} copy={false} />
            {x.quantity !== undefined && x.quantity !== null && (
              <Typography variant="caption" color="text.secondary">
                {x.quantity} {x.uom || ''}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
        EPCIS event (JSON)
      </Typography>
      <JsonViewer value={ev} maxHeight={360} />
    </Box>
  );
}

/** Side panel with the details of a clicked graph node (identifier or event). */
export default function NodeDetailsDrawer({ node, onClose, onTrace, onPick }) {
  return (
    <Drawer anchor="right" open={!!node} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 2.5 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {node && node.kind === 'event' ? 'Event' : 'Identifier'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      {node && (node.kind === 'event' ? <EventDetails node={node} onPick={onPick} /> : <ObjectDetails id={node.id} onTrace={onTrace} onPick={onPick} />)}
    </Drawer>
  );
}
