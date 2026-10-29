import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, List, ListItemButton, ListItemText, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../../api/useApi';
import { useAsync } from '../../hooks/useAsync';
import { VOCABULARIES } from '../../api/epcisClient';
import { PageHeader, ErrorAlert, SectionCard, LoadingBlock, EmptyState, IdLabel, KindBadge } from '../../components/common';
import { EventsTable } from '../../components/trace/TracePanels';
import { eventIdentifiers, describeId } from '../../utils/ids';

export default function VocabulariesPage() {
  const api = useApi();
  const [tab, setTab] = useState(VOCABULARIES[0].key);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const voc = VOCABULARIES.find((v) => v.key === tab);

  const list = useAsync(() => api.epcis.vocabulary(voc.path), [api, voc]);
  const events = useAsync(() => (selected ? api.epcis.vocabularyEvents(voc.path, selected, { perPage: 30 }) : null), [api, voc, selected]);

  const items = useMemo(() => {
    const all = list.data || [];
    const f = filter.trim().toLowerCase();
    return f ? all.filter((x) => String(x).toLowerCase().includes(f)) : all;
  }, [list.data, filter]);

  const rows = events.data ? events.data.events.map((e) => ({ ...e, involved: eventIdentifiers(e).map((x) => ({ objectID: x.id, role: x.role })) })) : [];
  const isId = tab === 'epcs' || tab === 'bizLocations' || tab === 'readPoints';

  return (
    <Box>
      <PageHeader title="Vocabularies" subtitle={`Master-data and vocabulary resources exposed by ${api.activeRepository.name} for HATEOAS discovery.`} />
      <Tabs
        value={tab}
        onChange={(e, v) => {
          setTab(v);
          setSelected(null);
          setFilter('');
        }}
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        variant="scrollable"
      >
        {VOCABULARIES.map((v) => (
          <Tab key={v.key} value={v.key} label={v.label} />
        ))}
      </Tabs>
      <ErrorAlert error={list.error} onRetry={list.reload} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <SectionCard title={voc.label} subtitle={`${items.length} entries`} action={<TextField size="small" placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ width: 180 }} />} dense>
            {list.loading && !list.data ? (
              <LoadingBlock />
            ) : !items.length ? (
              <EmptyState title="Nothing here yet" />
            ) : (
              <List dense disablePadding sx={{ maxHeight: 620, overflow: 'auto' }}>
                {items.map((x) => (
                  <ListItemButton key={x} selected={selected === x} onClick={() => setSelected(x)} sx={{ borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          {isId && <KindBadge id={x} />}
                          <Typography sx={{ fontFamily: isId ? '"JetBrains Mono", monospace' : undefined, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isId ? describeId(x).short : x}</Typography>
                        </Stack>
                      }
                      secondary={isId ? x : null}
                      secondaryTypographyProps={{ sx: { fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={7}>
          <SectionCard
            title={selected ? 'Events' : 'Select an entry'}
            subtitle={selected ? `Events referencing this ${voc.label.toLowerCase().replace(/s$/, '')}` : 'Events referencing the selected entry are listed here'}
            action={
              selected && tab === 'epcs' ? (
                <Button size="small" variant="contained" startIcon={<HubOutlinedIcon />} component={RouterLink} to={`/traceability?id=${encodeURIComponent(selected)}&direction=both`}>
                  Trace in graph
                </Button>
              ) : null
            }
            dense
          >
            {selected && (
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} alignItems="center">
                <Chip size="small" label={voc.label} />
                <IdLabel id={selected} max={80} />
              </Stack>
            )}
            <ErrorAlert error={events.error} />
            {events.loading && <LoadingBlock />}
            {selected && !events.loading && <EventsTable events={rows} />}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
