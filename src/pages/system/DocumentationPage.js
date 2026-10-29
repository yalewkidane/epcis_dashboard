import React from 'react';
import { Box, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, Chip } from '@mui/material';
import { PageHeader, SectionCard, JsonViewer } from '../../components/common';
import { GraphLegend } from '../../components/graph/TraceGraph';

const MODEL = [
  ['(:Object {objectID, idType})', 'Any GS1 identifier: serialized item (SGTIN), lot or class (LGTIN, GTIN), case / pallet (SSCC). idType is instance or class.'],
  [':Aggregation label', 'Added to an identifier that was used as parentID (case, pallet, container).'],
  [':Transformed label', 'Added to an identifier that was an output of a TransformationEvent.'],
  ['(:Event {eventID, type, action, bizStep, disposition, eventTime, sources, raw})', 'One node per EPCIS event; sources lists the repositories/channels it arrived from; raw keeps the full event JSON.'],
  ['(o)-[:INVOLVED_IN {role, quantity, uom}]->(e)', 'The identifier took part in the event. role = epcList, parent, child, input, output, quantity, childQuantity, inputQuantity, outputQuantity.'],
  ['(child)-[:AGGREGATED_INTO {eventID, from, until}]->(parent)', 'Containment. Opened by an Aggregation/Association ADD, closed (until) by a DELETE. Recursive across packing levels.'],
  ['(in)-[:TRANSFORMED_TO {key, eventID, transformationID}]->(out) (+ mirror TRANSFORMED_FROM)', 'Transformation lineage, recursive. Events sharing a transformationID are linked across events.'],
];

const API = [
  ['GET /health', 'Service, graph store, queue and subscription status'],
  ['GET /traceability?id=&direction=forward|backward|both&depth=', 'Every event reachable from the identifier, with the objects it was reached through'],
  ['GET /traceability/graph?id=…', 'Same lineage as {nodes, links} for visualisation'],
  ['GET /traceability/timeline?id=…', 'Trace grouped per traversed object'],
  ['GET /traceability/objects?q=&type=&limit=&skip=', 'Paged identifier list'],
  ['GET /traceability/objects/detail?id=…', 'Containers, children, transformation inputs/outputs of one identifier'],
  ['GET /traceability/events/recent?limit=', 'Latest ingested events'],
  ['GET /traceability/stats', 'Counts by label, relationship, event type and source'],
  ['POST /traceability/ingest', 'Ingest an EPCIS document directly'],
  ['GET /traceability/scenarios, POST …/:name/steps/:i/run', 'Example scenarios and their replay'],
  ['POST /traceability/subscription/{mqtt|websocket|webhook}', 'Attach another EPCIS repository'],
];

const CYPHER = `MATCH (root:Object {objectID: $id})
OPTIONAL MATCH p = (root)-[:AGGREGATED_INTO|TRANSFORMED_TO*0..10]->(o:Object)
WITH o, min(length(p)) AS hops
MATCH (o)-[r:INVOLVED_IN]->(e:Event)
RETURN o, hops, r.role, e
ORDER BY e.eventTime`;

export default function DocumentationPage() {
  return (
    <Box>
      <PageHeader title="Documentation" subtitle="What the knowledge graph stores, how it answers traceability questions, and the API the dashboard uses." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <SectionCard title="Why a knowledge graph" dense>
            <Typography variant="body2" paragraph>
              EPCIS events are independent records that name the identifiers involved. When items are packed into a case, the case gets its own identifier and later events reference the case, not the items. When a product is transformed, the output gets a new identifier. Following a product through its life therefore means discovering each new identifier and querying again, often against a different partner's repository.
            </Typography>
            <Typography variant="body2" paragraph>
              The knowledge graph turns those identifier changes into explicit edges. Packing becomes <b>AGGREGATED_INTO</b> (with the period the item stayed inside), transformation becomes <b>TRANSFORMED_TO</b>, and every event stays attached to its identifiers through <b>INVOLVED_IN</b>. Because the edges are recursive, one traversal from any identifier returns the complete history across all packing levels, transformations and repositories.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <GraphLegend />
            </Stack>
          </SectionCard>
          <SectionCard title="Graph model" sx={{ mt: 2.5 }} dense>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Element</TableCell>
                  <TableCell>Meaning</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MODEL.map(([a, b]) => (
                  <TableRow key={a}>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, width: '42%' }}>{a}</TableCell>
                    <TableCell sx={{ fontSize: 12.5 }}>{b}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <SectionCard title="The single trace query" subtitle="Executed by the graph service for every lookup" dense>
            <JsonViewer value={CYPHER} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              <b>forward</b> follows the arrows (containers and products made from the root), <b>backward</b> reverses them (contents and inputs: provenance), <b>both</b> ignores direction. <b>depth</b> bounds the recursion.
            </Typography>
          </SectionCard>
          <SectionCard title="Ingestion guarantees" sx={{ mt: 2.5 }} dense>
            <Stack spacing={1}>
              {[
                ['Idempotent', 'Every node and edge is merged on a stable key; the same event from two channels or two repositories is stored once with both sources.'],
                ['Ordered', 'Events are applied in event-time order so an unpacking never overtakes the packing it closes.'],
                ['Format tolerant', 'EPCISDocument, EPCISQueryDocument, bare event lists, single events, JSON-LD; events without an eventID get a deterministic hash.'],
                ['Class-level aware', 'Quantity lists (lots, batches) become class-level identifiers, so lot-based supply chains trace too.'],
              ].map(([t, d]) => (
                <Box key={t}>
                  <Chip size="small" label={t} sx={{ mb: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {d}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
          <SectionCard title="Graph service API" sx={{ mt: 2.5 }} dense>
            <Stack spacing={1}>
              {API.map(([a, b]) => (
                <Box key={a}>
                  <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, color: 'primary.dark', wordBreak: 'break-all' }}>{a}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
