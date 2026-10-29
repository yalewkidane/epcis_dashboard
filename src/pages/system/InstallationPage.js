import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { PageHeader, SectionCard, JsonViewer } from '../../components/common';

const EPCIS = `# epcisV2/.env  (one per repository; change the project name and port per partner)
COMPOSE_PROJECT_NAME=supplier
EPCIS_SERVER_PORT=7080
ROOT_END_POINT=/epcis/v2
ENABLE_AUTH=false
MQTT_ENABLED=true
MQTT_HOST=mqtt_broker
MQTT_PORT=1883
MQTT_TOPIC=epcisv2
DOCKER_NETWORK=traceability_network

$ cd epcisV2 && docker compose up -d`;

const GRAPH = `# traceability/.env
EPCIS_ENDPOINT=http://localhost:7080/epcis/v2
EPCIS_REPOSITORIES=supplier=http://localhost:7080/epcis/v2,retailer=http://localhost:7081/epcis/v2
MQTT_AUTO_SUBSCRIBE=mqtt://localhost:1883,mqtt://localhost:1884
NEO4J_URL=bolt://localhost:7688
NEO4J_USER=neo4j
NEO4J_PASSWORD=change-me
REDIS_HOST=127.0.0.1
REDIS_PORT=6380
DEMO_MODE=true
DOCKER_NETWORK=supplier_traceability_network

$ cd traceability && docker compose up -d neo4j tr-redis
$ cd src && npm install && npm start          # or: docker compose up -d --build traceability
$ npm run load:clothing                        # replay a scenario through EPCIS`;

const DASH = `$ cd epcis_dashboard && npm install && npm start
# open http://localhost:3000 and set the repository and graph-service URLs under Settings

# production build
$ npm run build && npx serve -s build -l 5000`;

export default function InstallationPage() {
  return (
    <Box>
      <PageHeader title="Installation" subtitle="Three parts: one or more EPCIS 2.0 repositories, the traceability knowledge-graph service, and this dashboard." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <SectionCard title="1 · EPCIS 2.0 repositories" subtitle="Run one stack per supply-chain partner (MongoDB, Redis, MQTT broker, EPCIS server)" dense>
            <JsonViewer value={EPCIS} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Each repository publishes its captured events on its MQTT broker and offers webhook and websocket subscriptions. Expose a different port and broker port for each partner.
            </Typography>
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <SectionCard title="2 · Traceability knowledge graph" subtitle="Subscribes to all repositories and builds the graph" dense>
            <JsonViewer value={GRAPH} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Compose joins the external docker network of the EPCIS stack so in-network names resolve; without an EPCIS stack add <code>-f docker-compose.standalone.yml</code>.
            </Typography>
          </SectionCard>
          <SectionCard title="3 · Dashboard" sx={{ mt: 2.5 }} dense>
            <JsonViewer value={DASH} />
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
