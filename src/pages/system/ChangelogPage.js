import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { PageHeader, SectionCard } from '../../components/common';

const ENTRIES = [
  {
    version: '1.0.0',
    date: '2026-10-28',
    title: 'Knowledge-graph traceability, paper-faithful',
    items: [
      'Graph model from the paper: identifiers with product / aggregated / transformed roles, events, INVOLVED_IN, recursive AGGREGATED_INTO (with open/closed periods) and TRANSFORMED_TO/FROM edges.',
      'Single-query traces in both directions with depth control; packing hierarchy and provenance views.',
      'Distributed EPCIS: the graph follows any number of repositories (MQTT, webhook, websocket) and records the source of every event.',
      'Scenario runner replaying the clothing lifecycle and canned-tuna chains step by step through the repositories.',
      'Live feed, repository overview, event and vocabulary browsers, capture / query / subscription console, connection settings.',
    ],
  },
  {
    version: '0.1.0',
    date: '2024',
    title: 'First dashboard',
    items: ['Capture and query pages for EPCIS 2.0, first graph and timeline views reading Neo4j directly from the browser.'],
  },
];

export default function ChangelogPage() {
  return (
    <Box>
      <PageHeader title="Changelog" />
      <Stack spacing={2.5}>
        {ENTRIES.map((e) => (
          <SectionCard key={e.version} title={`${e.version} · ${e.title}`} subtitle={e.date} action={<Chip size="small" label={e.version} />} dense>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {e.items.map((i) => (
                <li key={i}>
                  <Typography variant="body2">{i}</Typography>
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </Stack>
    </Box>
  );
}
