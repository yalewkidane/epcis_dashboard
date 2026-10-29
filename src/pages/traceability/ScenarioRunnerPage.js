import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, CardActionArea, CardContent, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, LinearProgress, MenuItem, Select, Stack, Step, StepContent, StepLabel, Stepper, TextField, Tooltip, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import StopIcon from '@mui/icons-material/Stop';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../../api/useApi';
import { useSettings } from '../../config/settings';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader, ErrorAlert, EventTypeChip, JsonViewer, LoadingBlock, SectionCard } from '../../components/common';
import TraceGraph from '../../components/graph/TraceGraph';
import { describeId } from '../../utils/ids';

const REPO_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0d9488', '#db2777', '#ca8a04'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function repoColor(name, names) {
  const i = Math.max(0, names.indexOf(name));
  return REPO_COLORS[i % REPO_COLORS.length];
}

export default function ScenarioRunnerPage() {
  const api = useApi();
  const { repositories, settings } = useSettings();
  const list = useAsync(() => api.trace.scenarios(), [api]);
  const [name, setName] = useState(null);
  const scenario = useAsync(() => (name ? api.trace.scenario(name) : null), [api, name]);

  const [target, setTarget] = useState('epcis');
  const [delayMs, setDelayMs] = useState(1200);
  const [status, setStatus] = useState({});
  const [cursor, setCursor] = useState(0);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [showDoc, setShowDoc] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [error, setError] = useState(null);
  const stop = useRef(false);

  useEffect(() => {
    if (!name && list.data && list.data.length) setName(list.data[0].name);
  }, [list.data, name]);

  useEffect(() => {
    setStatus({});
    setCursor(0);
    setLog([]);
    setPreview(null);
    setPreviewId(scenario.data && scenario.data.highlights && scenario.data.highlights[0] ? scenario.data.highlights[0].id : null);
  }, [scenario.data]);

  const repoNames = useMemo(() => (scenario.data ? Object.keys(scenario.data.repositories || {}) : []), [scenario.data]);

  const refreshPreview = useCallback(
    async (idOverride) => {
      const pid = idOverride || previewId;
      if (!pid) return;
      try {
        const g = await api.trace.graph(pid, { direction: 'both', depth: 10 });
        setPreview(g);
      } catch {
        setPreview(null);
      }
    },
    [api, previewId]
  );

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview]);

  const runStep = useCallback(
    async (index) => {
      const step = scenario.data.steps[index];
      setStatus((s) => ({ ...s, [index]: { state: 'running' } }));
      const started = Date.now();
      try {
        const body = { target };
        if (target === 'epcis') {
          // Route the step to the repository it belongs to when the dashboard knows it.
          const repo = repositories.find((r) => r.name === step.repository);
          if (repo) body.epcisEndpoint = repo.url;
        }
        const r = await api.trace.runStep(name, index, body);
        const ok = r.ok !== false;
        setStatus((s) => ({ ...s, [index]: { state: ok ? 'done' : 'error', result: r } }));
        setLog((l) => [{ at: new Date(), index, title: step.title, ok, text: ok ? `${target === 'graph' ? 'ingested' : `captured by ${r.endpoint || 'EPCIS'}`} · ${Date.now() - started} ms` : JSON.stringify(r.body || r).slice(0, 200) }, ...l]);
        return ok;
      } catch (err) {
        setStatus((s) => ({ ...s, [index]: { state: 'error', error: err.message } }));
        setLog((l) => [{ at: new Date(), index, title: step.title, ok: false, text: err.message }, ...l]);
        return false;
      }
    },
    [api, name, scenario.data, target, repositories]
  );

  const next = async () => {
    if (!scenario.data || cursor >= scenario.data.steps.length) return;
    setError(null);
    const i = cursor;
    setCursor(i + 1);
    await runStep(i);
    // EPCIS path is asynchronous (capture queue -> MQTT -> graph); give it a moment.
    await sleep(target === 'epcis' ? 1500 : 200);
    refreshPreview(scenario.data.steps[i].highlight);
  };

  const runAll = async () => {
    if (!scenario.data) return;
    setRunning(true);
    stop.current = false;
    setError(null);
    for (let i = cursor; i < scenario.data.steps.length; i++) {
      if (stop.current) break;
      setCursor(i + 1);
      const ok = await runStep(i);
      await sleep(target === 'epcis' ? Math.max(delayMs, 800) : delayMs);
      refreshPreview(scenario.data.steps[i].highlight);
      if (!ok) {
        setError(new Error(`Step ${i + 1} failed; stopped.`));
        break;
      }
    }
    setRunning(false);
  };

  const resetProgress = () => {
    stop.current = true;
    setStatus({});
    setCursor(0);
    setLog([]);
  };

  const resetGraph = async () => {
    setConfirmReset(false);
    try {
      await api.trace.resetGraph();
      resetProgress();
      setPreview(null);
      setLog((l) => [{ at: new Date(), title: 'Graph reset', ok: true, text: 'all nodes and relationships deleted' }, ...l]);
    } catch (err) {
      setError(err);
    }
  };

  const total = scenario.data ? scenario.data.steps.length : 0;
  const done = Object.values(status).filter((s) => s.state === 'done').length;

  return (
    <Box>
      <PageHeader
        title="Scenario runner"
        subtitle="Replay a supply-chain story step by step. Each step is an EPCIS document captured by the repository of the partner that recorded it; the knowledge graph picks it up through its subscriptions and the lineage grows live."
      />
      <ErrorAlert error={list.error || scenario.error || error} />

      {list.loading && !list.data && <LoadingBlock label="Loading scenarios" />}

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {(list.data || []).map((s) => (
          <Grid item xs={12} md={6} key={s.name}>
            <Card sx={{ borderColor: name === s.name ? 'primary.main' : 'divider', borderWidth: name === s.name ? 2 : 1 }}>
              <CardActionArea onClick={() => setName(s.name)} disabled={running}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{s.title}</Typography>
                    <Chip size="small" label={`${s.steps} steps`} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {s.description}
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap>
                    {Object.keys(s.repositories || {}).map((r, i) => (
                      <Chip key={r} size="small" label={r} sx={{ height: 20, fontSize: 10.5, bgcolor: `${REPO_COLORS[i % REPO_COLORS.length]}1f`, color: REPO_COLORS[i % REPO_COLORS.length], fontWeight: 600 }} />
                    ))}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {scenario.data && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={5}>
            <SectionCard
              title={scenario.data.title}
              subtitle={`${done}/${total} steps captured`}
              action={
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Reset progress (keeps the graph)">
                    <span>
                      <IconButton size="small" onClick={resetProgress} disabled={running}>
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Wipe the knowledge graph (demo mode)">
                    <span>
                      <IconButton size="small" color="error" onClick={() => setConfirmReset(true)} disabled={running}>
                        <DeleteSweepIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              }
            >
              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel>Deliver through</InputLabel>
                  <Select value={target} label="Deliver through" onChange={(e) => setTarget(e.target.value)} disabled={running}>
                    <MenuItem value="epcis">EPCIS repositories → subscriptions → graph</MenuItem>
                    <MenuItem value="graph">Directly into the graph</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" label="Pause (ms)" type="number" value={delayMs} onChange={(e) => setDelayMs(Number(e.target.value) || 0)} sx={{ width: 130 }} disabled={running} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {!running ? (
                  <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={runAll} disabled={cursor >= total}>
                    {cursor === 0 ? 'Run all' : 'Continue'}
                  </Button>
                ) : (
                  <Button variant="outlined" color="warning" startIcon={<StopIcon />} onClick={() => (stop.current = true)}>
                    Stop
                  </Button>
                )}
                <Button variant="outlined" startIcon={<SkipNextIcon />} onClick={next} disabled={running || cursor >= total}>
                  Next step
                </Button>
              </Stack>
              {running && <LinearProgress sx={{ mb: 2 }} variant="determinate" value={(done / total) * 100} />}

              {target === 'epcis' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Repositories in this scenario
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    {repoNames.map((r) => {
                      const mapped = repositories.find((x) => x.name === r);
                      return (
                        <Tooltip key={r} title={mapped ? `Routed to ${mapped.url}` : `No repository named "${r}" in Settings; routed to the graph service's default EPCIS endpoint`}>
                          <Chip size="small" label={`${r}${mapped ? '' : ' → default'}`} sx={{ bgcolor: `${repoColor(r, repoNames)}1f`, color: repoColor(r, repoNames), fontWeight: 600 }} />
                        </Tooltip>
                      );
                    })}
                  </Stack>
                </Box>
              )}

              <Stepper orientation="vertical" activeStep={cursor} nonLinear sx={{ '& .MuiStepConnector-line': { minHeight: 8 } }}>
                {scenario.data.steps.map((step, i) => {
                  const st = status[i] || {};
                  const icon = st.state === 'done' ? <CheckCircleIcon color="success" /> : st.state === 'error' ? <ErrorIcon color="error" /> : undefined;
                  return (
                    <Step key={i} completed={st.state === 'done'} expanded={i === cursor - 1 || i === cursor}>
                      <StepLabel icon={icon} optional={<Typography variant="caption" color="text.secondary">{step.description}</Typography>}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="subtitle2">{step.title}</Typography>
                          <EventTypeChip type={step.eventType.split(' + ')[0]} />
                          {step.action && <Chip size="small" variant="outlined" label={step.action} sx={{ height: 20, fontSize: 10.5 }} />}
                          <Chip size="small" label={step.repository} sx={{ height: 20, fontSize: 10.5, bgcolor: `${repoColor(step.repository, repoNames)}1f`, color: repoColor(step.repository, repoNames), fontWeight: 600 }} />
                        </Stack>
                      </StepLabel>
                      <StepContent>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button size="small" startIcon={<CodeIcon />} onClick={() => setShowDoc(step)}>
                            Document
                          </Button>
                          {step.highlight && (
                            <Button size="small" startIcon={<OpenInNewIcon />} component={RouterLink} to={`/traceability?id=${encodeURIComponent(step.highlight)}&direction=both`}>
                              Explore {describeId(step.highlight).short}
                            </Button>
                          )}
                          {st.result && st.result.status && (
                            <Typography variant="caption" color="text.secondary">
                              HTTP {st.result.status} · {st.result.ms} ms
                            </Typography>
                          )}
                          {st.error && (
                            <Typography variant="caption" color="error">
                              {st.error}
                            </Typography>
                          )}
                        </Stack>
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </SectionCard>
          </Grid>

          <Grid item xs={12} lg={7}>
            <SectionCard title="Knowledge graph, live" subtitle={previewId ? `Lineage of ${describeId(previewId).short} (both directions), refreshed after every step` : 'Run a step to see the graph grow'} dense>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Watch:
                </Typography>
                {(scenario.data.highlights || []).map((h) => (
                  <Chip key={h.id} size="small" label={h.label} title={h.hint || h.id} onClick={() => setPreviewId(h.id)} color={previewId === h.id ? 'primary' : 'default'} variant={previewId === h.id ? 'filled' : 'outlined'} />
                ))}
              </Stack>
              <TraceGraph data={preview} height={520} legend />
              {previewId && (
                <Button size="small" sx={{ mt: 1 }} component={RouterLink} to={`/traceability?id=${encodeURIComponent(previewId)}&direction=both`} endIcon={<OpenInNewIcon />}>
                  Open in explorer
                </Button>
              )}
            </SectionCard>

            <SectionCard title="Delivery log" sx={{ mt: 2.5 }} dense>
              {log.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nothing delivered yet.
                </Typography>
              ) : (
                <Stack spacing={0.5} sx={{ maxHeight: 220, overflow: 'auto' }}>
                  {log.map((l, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                      {l.ok ? <CheckCircleIcon sx={{ fontSize: 16 }} color="success" /> : <ErrorIcon sx={{ fontSize: 16 }} color="error" />}
                      <Typography variant="caption" color="text.secondary" sx={{ width: 64 }}>
                        {l.at.toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {l.index !== undefined ? `${l.index + 1}. ` : ''}
                        {l.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.text}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </SectionCard>
          </Grid>
        </Grid>
      )}

      <Dialog open={!!showDoc} onClose={() => setShowDoc(null)} maxWidth="md" fullWidth>
        <DialogTitle>{showDoc ? `${showDoc.title} — EPCIS document` : ''}</DialogTitle>
        <DialogContent>{showDoc && <JsonViewer value={showDoc.document} maxHeight={560} />}</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDoc(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)}>
        <DialogTitle>Wipe the knowledge graph?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">All identifiers, events and relationships in the graph service at {settings.traceabilityUrl} will be deleted. The EPCIS repositories are not touched.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={resetGraph}>
            Wipe graph
          </Button>
        </DialogActions>
      </Dialog>
      <Divider sx={{ display: 'none' }} />
      <Collapse in={false} />
    </Box>
  );
}
