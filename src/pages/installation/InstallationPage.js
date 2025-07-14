import React from 'react';
import { Button, Card, CardContent, Typography } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../../styles/GeneralComponent.css'; // Import the CSS file


const InstallationPage = (props) => {
  const dockerComposeYml = `
version: '3.3'

services:
  epcis-hash-generator:
    image: yaledoc/epcis_event_hash_generator:0.1
    ports:
      - "\${SERVER_PORT}:\${SERVER_PORT}"
    environment:
      - NODE_ENV=production
      - SERVER_PORT=\${'{SERVER_PORT}'}
      - DEFAULT_HASH_ALGORITHM=\${'{DEFAULT_HASH_ALGORITHM}'}
  `;

  const envFile = `
SERVER_PORT=7085
DEFAULT_HASH_ALGORITHM=sha256 # Options: sha256, sha3-256, sha384, sha512
  `;




  const dockerComposeYmlEPCIS = `version: "3"
services:
      epcis:
           container_name: epcis
           image: yaledoc/epcis2:1.2.1
           #build: .
           restart: always
           environment:
            - RunningonDocker=true
            - RunningMqtt=true
            - PORT=\${EPCIS_SERVER_PORT}
            - REDIS_HOST_DOCKER=redis
            - HTTPS=true   #false
           command: node bootstrap.js   #bootstrap_https.js   #bootstrap.js #index_https.js   #node cluster.js  #node authorized.js  #node index.js
           ports:
             - "\${EPCIS_SERVER_PORT}:\${EPCIS_SERVER_PORT}"
           links:
             - mongo
             - mosquitto
             - redis
           networks:
              - epcis_network

      mongo:
             container_name: mongo
             image: mongo:3.6.8
             volumes:
               - ../data:/data/db
             ports:
               - '27018:27017'
             networks:
              - epcis_network
      mosquitto:
            #image: eclipse-mosquitto:2
            build:
              context: .
              dockerfile: Dockerfile.mosquitto
            container_name: mqtt_broker
            ports:
              - 1883:1883
              - 9001:9001
            #volumes:
            #  - ./src/mosquitto/config/mosquitto.conf:/mosquitto/config/mosquitto.conf
            #  - ./src/mosquitto/data:/mosquitto/data
            networks:
              - epcis_network
      redis:
            image: redis
            container_name: redis
            command: redis-server --appendonly yes --requirepass 123456
            ports:
              - "6379:6379"
            networks:
              - epcis_network
networks:
  epcis_network:
    driver: bridge`

  const envFileEPCIS = `EPCIS_SERVER_PORT=7080
COMPOSE_PROJECT_NAME=dataspira
HTTPS=false   #false true
  `;
  return (
    <div>
      
      <h1>InstallationPage</h1>

    <h2>To start EPCIS Server </h2>

    <p>Create a Directory for EPCIS: First, create a directory for the Hash Generator.</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {`mkdir epcis\ncd epcis`}
      </SyntaxHighlighter>
      <p>Create <code>docker-compose.yml</code>: 
        Inside the directory, create a <code>docker-compose.yml</code> file and add the following content:</p>
      <SyntaxHighlighter language="yaml" style={coy}>
        {dockerComposeYmlEPCIS}
      </SyntaxHighlighter>
      <p>Create <code>.env</code> File: Create a <code>.env</code> file in the same directory and save the following content:</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {envFileEPCIS}
      </SyntaxHighlighter>
      <p>Run Docker Compose: Use Docker Compose to start the service.</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {`docker-compose up -d`}
      </SyntaxHighlighter>

    <h2>Event Hash Generatore</h2>
    <p>Create a Directory for Hash_Generator: First, create a directory for the Hash Generator.</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {`mkdir Hash_Generator\ncd Hash_Generator`}
      </SyntaxHighlighter>
      <p>Create <code>docker-compose.yml</code>: Inside the directory, create a <code>docker-compose.yml</code> file and add the following content:</p>
      <SyntaxHighlighter language="yaml" style={coy}>
        {dockerComposeYml}
      </SyntaxHighlighter>
      <p>Create <code>.env</code> File: Create a <code>.env</code> file in the same directory and save the following content:</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {envFile}
      </SyntaxHighlighter>
      <p>Run Docker Compose: Use Docker Compose to start the service.</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {`docker-compose up -d`}
      </SyntaxHighlighter>
    
    <h2>Traceability Server</h2>
    <p>Create a Directory for Hash_Generator: First, create a directory for the Hash Generator.</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {`mkdir Hash_Generator\ncd Hash_Generator`}
      </SyntaxHighlighter>
      <p>Create <code>docker-compose.yml</code>: Inside the directory, create a <code>docker-compose.yml</code> file and add the following content:</p>
      <SyntaxHighlighter language="yaml" style={coy}>
        {dockerComposeYml}
      </SyntaxHighlighter>
      <p>Create <code>.env</code> File: Create a <code>.env</code> file in the same directory and save the following content:</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {envFile}
      </SyntaxHighlighter>
      <p>Run Docker Compose: Use Docker Compose to start the service.</p>
      <SyntaxHighlighter language="bash" style={coy}>
        {`docker-compose up -d`}
      </SyntaxHighlighter>

    <p>
    <p>    </p>
    <p>    </p>
    <p>    </p>
    <p>    </p>
      For more information, please refer to the Hybrid EPCIS documentation.
      
      
      </p>

    <div className="documentation-container">
      <Card sx={{ maxWidth: 800, margin: 'auto', mt: 5 }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Hybrid EPCIS Documentation
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Explore the comprehensive documentation for Hybrid EPCIS. Learn about the features, setup, and usage of the system.
          </Typography>
          <iframe
            src="https://hybrid-epcis-docs.readthedocs.io/en/latest/"
            title="Hybrid EPCIS Documentation"
            width="100%"
            height="300px"
            style={{ border: 'none' }}
          ></iframe>
        </CardContent>
        <Button
          variant="contained"
          color="primary"
          href="https://hybrid-epcis-docs.readthedocs.io/en/latest/"
          target="_blank"
          sx={{ m: 2 }}
        >
          Read the Docs
        </Button>
      </Card>
    </div>

    </div>
  );
};

export default InstallationPage;