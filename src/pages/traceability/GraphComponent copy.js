import React, { useState, useContext, useRef, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { GlobalStateContext } from '../../GlobalStateContext';  // Import the global state
import { ForceGraph2D } from 'react-force-graph';
import { nodePainter, linkPainter } from '../../utils/graphUtils';

const GraphComponent = (props) => {
  const { traceabilityServerIP, traceabilityPort } = useContext(GlobalStateContext); // Access the global state
  const [productId, setProductId] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const fgRef = useRef(); // Reference to the ForceGraph2D component

  useEffect(() => {
    const graph = fgRef.current;
    if (graph) {
      const linkForce = graph.d3Force('link');
      if (linkForce) {
        // Assuming your nodes have an 'id' property you want to use
        linkForce.id((node) => node.id);
        linkForce.distance(200); // Increase the distance between nodes
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const handleSearch = async () => {
    try {
      let url = `http://${traceabilityServerIP}:${traceabilityPort}/traceability/graph/${productId}`;
      
      console.log('Sending query to:', url.toString());

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Fetched data:', data); // Log fetched data to console

      // Process the data to create nodes and links for the graph
      const nodes = [];
      const links = [];

      data.records.forEach(record => {
        const objectNode = {
          id: record._fields[1].properties.objectID,
          label: record._fields[1].properties.objectID,
          group: 'Object'
        };
        nodes.push(objectNode);

        record._fields[2].forEach(event => {
          const eventNode = {
            id: event.properties.eventID,
            label: event.properties.eventID,
            group: 'Event'
          };
          nodes.push(eventNode);


          console.log('objectNode:', objectNode);
          console.log('eventNode:', eventNode);
          links.push({
            source: objectNode.id,
            target: eventNode.id,
            label: event.properties.bizStep
          });
        });
      });

      setGraphData({ nodes, links });
    } catch (error) {
      console.error('Error fetching traceability data:', error);
    }
  };

  const linkLabelRenderer = (link, ctx, globalScale) => {
    const startNode = graphData.nodes.find(node => node.id === link.source);
    const endNode = graphData.nodes.find(node => node.id === link.target);

    if (!startNode || !endNode) return; // Ensure both nodes exist

    // Calculate label positioning
    const textPos = {
      x: (startNode.x + endNode.x) / 2,
      y: (startNode.y + endNode.y) / 2
    };

    // Scale for better visibility at different zoom levels
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Semi-transparent black

    // Draw the text
    ctx.fillText(link.label, textPos.x, textPos.y);
  };

  const graphConfig = {
    nodeHighlightBehavior: true,
    node: {
      color: 'lightgreen',
      size: 10, // Adjust the node size
      highlightStrokeColor: 'blue'
    },
    link: {
      highlightColor: 'lightblue'
    }
  };

  return (
    <Box sx={{ padding: '20px', textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Traceability Graph Information Page
      </Typography>
      <Typography variant="body1" gutterBottom>
        Enter the Product ID below to check the traceability information in a Graph format.
      </Typography>
      <TextField
        label="Product ID"
        variant="outlined"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        sx={{
          marginBottom: '20px',
          width: '300px',
          '& .MuiInputBase-input': {
            fontStyle: 'italic',
            color: 'blue', // Change the color as needed
            fontWeight: 'bold',
          },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        sx={{ marginLeft: '10px' }}
      >
        Search Traceability
      </Button>
      {graphData.nodes && graphData.nodes.length > 0 && (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="label"
          nodeAutoColorBy="label"
          linkDirectionalParticles="value"
          nodeCanvasObject={nodePainter}
          linkCanvasObject={linkPainter}
          linkCanvasObjectMode={() => 'before'} // Ensures labels are drawn under the link lines
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkLabelRenderer={linkLabelRenderer} // Use the linkLabelRenderer function
          width={1500}
          height={1000}
          config={graphConfig}
        />
      )}
    </Box>
  );
};

export default GraphComponent;