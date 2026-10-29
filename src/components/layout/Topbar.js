import { AppBar, Box, Chip, FormControl, MenuItem, Select, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { useSettings } from '../../config/settings';
import { useApi } from '../../api/useApi';
import { usePolling } from '../../hooks/useAsync';
import { allRoutes } from '../../routes/appRoutes';
import { layout } from '../../theme';

/** Health of every configured EPCIS repository and of the graph service. */
export function useConnectionStatus() {
  const { settings } = useSettings();
  const api = useApi();
  return usePolling(
    async () => {
      const repos = await Promise.all(
        api.repositories.map(async (r) => {
          try {
            const h = await r.client.health();
            return { name: r.name, url: r.url, ok: true, data: h };
          } catch (err) {
            return { name: r.name, url: r.url, ok: false, error: err.message };
          }
        })
      );
      let graph;
      try {
        const h = await api.trace.health();
        graph = { ok: h.status === 'ok', data: h };
      } catch (err) {
        graph = { ok: false, error: err.message };
      }
      return { repos, graph, at: new Date() };
    },
    settings.pollIntervalMs,
    [api]
  );
}

function Dot({ ok, loading }) {
  return <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: loading ? '#cbd5e1' : ok ? '#16a34a' : '#dc2626', boxShadow: ok && !loading ? '0 0 0 3px #16a34a33' : 'none' }} />;
}

export default function Topbar() {
  const { pathname } = useLocation();
  const { repositories, activeRepository, setActiveRepository } = useSettings();
  const status = useConnectionStatus();
  const route = allRoutes.find((r) => r.path === pathname) || allRoutes.find((r) => pathname.startsWith(r.path) && r.path !== '/');
  const repos = status.data ? status.data.repos : [];
  const graph = status.data ? status.data.graph : null;

  return (
    <AppBar position="fixed" color="inherit" sx={{ width: `calc(100% - ${layout.sidebarWidth}px)`, ml: `${layout.sidebarWidth}px`, bgcolor: '#fff' }}>
      <Toolbar sx={{ minHeight: `${layout.topbarHeight}px !important`, gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {route ? route.label : 'Traceability'}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {repos.map((r) => (
            <Tooltip key={r.name} title={`${r.url} — ${r.ok ? 'reachable' : r.error || 'unreachable'}`}>
              <Chip
                size="small"
                variant="outlined"
                component={RouterLink}
                to="/settings"
                clickable
                icon={<Box sx={{ pl: 0.75, display: 'flex' }}><Dot ok={r.ok} loading={status.loading && !status.data} /></Box>}
                label={`EPCIS · ${r.name}`}
              />
            </Tooltip>
          ))}
          <Tooltip title={graph ? (graph.ok ? 'Graph service reachable' : graph.error || 'Graph service degraded') : 'Checking…'}>
            <Chip
              size="small"
              variant="outlined"
              component={RouterLink}
              to="/settings"
              clickable
              icon={<Box sx={{ pl: 0.75, display: 'flex' }}><Dot ok={graph && graph.ok} loading={!graph} /></Box>}
              label="Knowledge graph"
            />
          </Tooltip>
          {repositories.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={activeRepository.name} onChange={(e) => setActiveRepository(e.target.value)} sx={{ fontSize: 13 }}>
                {repositories.map((r) => (
                  <MenuItem key={r.name} value={r.name} sx={{ fontSize: 13 }}>
                    Repository: {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
