import React, { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Grid, IconButton, MenuItem, Radio, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import { useSettings, DEFAULT_SETTINGS } from '../../config/settings';
import { epcisClient } from '../../api/epcisClient';
import { traceabilityClient } from '../../api/traceabilityClient';
import { PageHeader, SectionCard, StatusChip } from '../../components/common';

export default function SettingsPage() {
  const { settings, update, reset } = useSettings();
  const [draft, setDraft] = useState(settings);
  const [tests, setTests] = useState({});
  const [saved, setSaved] = useState(false);

  const setRepo = (i, patch) => setDraft((d) => ({ ...d, repositories: d.repositories.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const addRepo = () => setDraft((d) => ({ ...d, repositories: [...d.repositories, { name: `repo-${d.repositories.length + 1}`, url: 'http://localhost:7081/epcis/v2' }] }));
  const removeRepo = (i) =>
    setDraft((d) => {
      const repositories = d.repositories.filter((_, j) => j !== i);
      const activeRepository = repositories.some((r) => r.name === d.activeRepository) ? d.activeRepository : repositories[0] && repositories[0].name;
      return { ...d, repositories, activeRepository };
    });

  const test = async (key, fn) => {
    setTests((t) => ({ ...t, [key]: { loading: true } }));
    try {
      const data = await fn();
      setTests((t) => ({ ...t, [key]: { ok: true, text: data && data.status ? `status ${data.status}` : 'reachable' } }));
    } catch (err) {
      setTests((t) => ({ ...t, [key]: { ok: false, text: err.message } }));
    }
  };

  const save = () => {
    const clean = { ...draft, repositories: draft.repositories.filter((r) => r.name.trim() && r.url.trim()).map((r) => ({ name: r.name.trim(), url: r.url.trim().replace(/\/+$/, '') })) };
    if (!clean.repositories.length) clean.repositories = DEFAULT_SETTINGS.repositories;
    update(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Where the dashboard finds the systems. Stored in this browser only."
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => {
                reset();
                setDraft({ ...DEFAULT_SETTINGS });
              }}
            >
              Reset defaults
            </Button>
            <Button variant="contained" onClick={save}>
              Save
            </Button>
          </Stack>
        }
      />
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <SectionCard title="EPCIS repositories" subtitle="The distributed repositories that feed the graph. The active one is used by the EPCIS pages and the API console." action={<Button size="small" startIcon={<AddIcon />} onClick={addRepo}>Add repository</Button>} dense>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 70 }}>Active</TableCell>
                  <TableCell sx={{ width: 200 }}>Name</TableCell>
                  <TableCell>Base URL (…/epcis/v2)</TableCell>
                  <TableCell sx={{ width: 190 }}>Connection</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {draft.repositories.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Radio size="small" checked={draft.activeRepository === r.name} onChange={() => setDraft((d) => ({ ...d, activeRepository: r.name }))} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={r.name} onChange={(e) => setRepo(i, { name: e.target.value })} fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={r.url} onChange={(e) => setRepo(i, { url: e.target.value })} fullWidth InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5 } }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button size="small" startIcon={<WifiTetheringIcon />} onClick={() => test(`repo${i}`, () => epcisClient(r.url).health())}>
                          Test
                        </Button>
                        {tests[`repo${i}`] && <StatusChip ok={tests[`repo${i}`].ok} loading={tests[`repo${i}`].loading} label={tests[`repo${i}`].loading ? '…' : tests[`repo${i}`].ok ? 'ok' : 'failed'} />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => removeRepo(i)} disabled={draft.repositories.length === 1}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Scenario steps are tagged with a repository name (supplier, manufacturer, retailer, …). Give your repositories the same names to route each step to the right partner.
            </Typography>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Traceability knowledge graph" dense>
            <Stack spacing={1.5}>
              <TextField size="small" label="Service URL" value={draft.traceabilityUrl} onChange={(e) => setDraft((d) => ({ ...d, traceabilityUrl: e.target.value }))} InputProps={{ sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5 } }} />
              <Stack direction="row" spacing={1} alignItems="center">
                <Button size="small" startIcon={<WifiTetheringIcon />} onClick={() => test('trace', () => traceabilityClient(draft.traceabilityUrl).health())}>
                  Test
                </Button>
                {tests.trace && <StatusChip ok={tests.trace.ok} loading={tests.trace.loading} label={tests.trace.loading ? '…' : tests.trace.ok ? 'ok' : tests.trace.text} />}
              </Stack>
              <TextField select size="small" label="Status polling" value={draft.pollIntervalMs} onChange={(e) => setDraft((d) => ({ ...d, pollIntervalMs: Number(e.target.value) }))}>
                <MenuItem value={5000}>every 5 s</MenuItem>
                <MenuItem value={15000}>every 15 s</MenuItem>
                <MenuItem value={60000}>every minute</MenuItem>
              </TextField>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <Accordion sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px !important', '&:before': { display: 'none' } }} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Advanced
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                <TextField size="small" label="Event hash generator URL (optional)" value={draft.hashGeneratorUrl} onChange={(e) => setDraft((d) => ({ ...d, hashGeneratorUrl: e.target.value }))} />
                <TextField select size="small" label="Hash algorithm" value={draft.hashAlgorithm} onChange={(e) => setDraft((d) => ({ ...d, hashAlgorithm: e.target.value }))}>
                  {['sha256', 'sha3-256', 'sha384', 'sha512'].map((a) => (
                    <MenuItem key={a} value={a}>
                      {a}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
}
