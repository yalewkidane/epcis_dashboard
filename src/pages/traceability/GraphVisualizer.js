import React, { useState, useEffect, useRef } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import QueryInput from '../../components/test/QueryInput';
import { runQuery } from '../../utils/neo4jService';
import { nodePainter, linkPainter } from '../../utils/graphUtils';


const GraphVisualizer = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const fgRef = useRef(); // Reference to the ForceGraph2D component
  useEffect(() => {
    const graph = fgRef.current;
    if (graph) {
      const linkForce = graph.d3Force('link');
      if (linkForce) {
        // Assuming your nodes have an 'id' property you want to use
        linkForce.id((node) => node.id);
        linkForce.distance(150); // Set the distance
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount


  const handleExecute = async (query) => {
    const data = await runQuery(query);
    //Testing the type of data we are getting
    console.log("Yalew  ", data);
    setGraphData(data);
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
    ctx.fillText(link.type, textPos.x, textPos.y);
  };

  console.log(linkLabelRenderer);
  return (
    <div>
      <QueryInput onExecute={handleExecute} />
      <ForceGraph2D

        ref={fgRef}

        graphData={graphData}
        nodeLabel="label"
        nodeAutoColorBy="label"
        linkDirectionalParticles="value"
        nodeCanvasObject={nodePainter}
        linkCanvasObject={linkPainter}
        linkCanvasObjectMode={() => 'before'} // Ensures labels are drawn under the link lines
        
        width={800}
        height={600}
      />
    </div>
  );
};

export default GraphVisualizer;
