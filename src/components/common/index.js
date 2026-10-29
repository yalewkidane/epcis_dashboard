import React, { useState } from 'react';
import { Alert, AlertTitle, Box, Card, CardContent, Chip, CircularProgress, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { roleColors, eventTypeColors } from '../../theme';
import { describeId, copyToClipboard, eventTypeShort, fmtNumber } from '../../utils/ids';

/* ------------------------------------------------------------------ page header */

export function PageHeader({ title, subtitle, actions, chips }) {
  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4">{title}</Typography>
          {chips}
        </Stack>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 900 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</Box>}
    </Box>
  );
}

/* ------------------------------------------------------------------ stat tile */

export function StatTile({ label, value, hint, color = '#2563eb', icon, loading, onClick }) {
  return (
    <Card sx={{ height: '100%', cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow .15s', '&:hover': onClick ? { boxShadow: 3 } : {} }} onClick={onClick}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.25 }}>
        {icon && (
          <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: `${color}1f`, color, flexShrink: 0 }}>{icon}</Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={32} />
          ) : (
            <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
              {typeof value === 'number' ? fmtNumber(value) : value ?? '–'}
            </Typography>
          )}
          {hint && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {hint}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ chips */

export function RoleChip({ role, size = 'small', label }) {
  const c = roleColors[role] || roleColors.product;
  return <Chip size={size} label={label || role} sx={{ bgcolor: c.light, color: c.dark, fontWeight: 600 }} />;
}

export function EventTypeChip({ type, size = 'small', short = true }) {
  const color = eventTypeColors[type] || '#475569';
  return <Chip size={size} label={short ? eventTypeShort(type) : type} sx={{ bgcolor: `${color}1f`, color, fontWeight: 600 }} />;
}

export function StatusChip({ ok, label, loading, size = 'small' }) {
  if (loading) return <Chip size={size} label={label} icon={<CircularProgress size={12} />} variant="outlined" />;
  return <Chip size={size} label={label} color={ok ? 'success' : 'error'} variant={ok ? 'filled' : 'outlined'} sx={{ fontWeight: 600 }} />;
}

/* ------------------------------------------------------------------ identifiers */

export function IdLabel({ id, mono = true, copy = true, max = 48, onClick, role }) {
  const d = describeId(id);
  const [copied, setCopied] = useState(false);
  const text = d.id.length > max ? `${d.id.slice(0, Math.floor(max / 2) - 1)}…${d.id.slice(-Math.ceil(max / 2))}` : d.id;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
      {role && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: (roleColors[role] || roleColors.product).main, flexShrink: 0 }} />}
      <Tooltip title={d.id} placement="top">
        <Typography
          component={onClick ? 'button' : 'span'}
          onClick={onClick}
          sx={{
            fontFamily: mono ? '"JetBrains Mono", ui-monospace, monospace' : undefined,
            fontSize: 12.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            background: 'none',
            border: 0,
            p: 0,
            cursor: onClick ? 'pointer' : 'default',
            color: onClick ? 'primary.main' : 'text.primary',
            '&:hover': onClick ? { textDecoration: 'underline' } : {},
          }}
        >
          {text}
        </Typography>
      </Tooltip>
      {copy && (
        <IconButton
          size="small"
          sx={{ p: 0.25 }}
          onClick={async (e) => {
            e.stopPropagation();
            if (await copyToClipboard(d.id)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }
          }}
        >
          {copied ? <CheckIcon sx={{ fontSize: 14 }} color="success" /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
        </IconButton>
      )}
    </Stack>
  );
}

export function KindBadge({ id }) {
  const d = describeId(id);
  return <Chip size="small" variant="outlined" label={d.kind} sx={{ height: 20, fontSize: 10.5, fontWeight: 700 }} />;
}

/* ------------------------------------------------------------------ JSON */

export function JsonViewer({ value, maxHeight = 420, fontSize = 12 }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return (
    <Box sx={{ maxHeight, overflow: 'auto', borderRadius: 1.5, border: '1px solid', borderColor: 'divider', '& pre': { m: '0 !important', fontSize: `${fontSize}px !important` } }}>
      <SyntaxHighlighter language="json" style={oneLight} customStyle={{ margin: 0, background: '#fafafa' }} wrapLongLines>
        {text || ''}
      </SyntaxHighlighter>
    </Box>
  );
}

/* ------------------------------------------------------------------ states */

export function ErrorAlert({ error, title = 'Request failed', onRetry, sx }) {
  if (!error) return null;
  return (
    <Alert severity="error" sx={{ mb: 2, ...sx }} action={onRetry ? <Chip label="Retry" size="small" onClick={onRetry} /> : null}>
      <AlertTitle>{title}</AlertTitle>
      {error.message || String(error)}
    </Alert>
  );
}

export function EmptyState({ icon, title, description, action, sx }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 2, color: 'text.secondary', ...sx }}>
      {icon && <Box sx={{ fontSize: 42, mb: 1, opacity: 0.5 }}>{icon}</Box>}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 480, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}

export function LoadingBlock({ height = 160, label }) {
  return (
    <Box sx={{ height, display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
      <Stack alignItems="center" spacing={1}>
        <CircularProgress size={28} />
        {label && <Typography variant="caption">{label}</Typography>}
      </Stack>
    </Box>
  );
}

export function SectionCard({ title, subtitle, action, children, sx, contentSx, dense }) {
  return (
    <Card sx={sx}>
      {(title || action) && (
        <Box sx={{ px: 2.5, pt: 2, pb: dense ? 1 : 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      )}
      <CardContent sx={{ pt: title ? 0 : 2.5, px: 2.5, pb: '20px !important', ...contentSx }}>{children}</CardContent>
    </Card>
  );
}
