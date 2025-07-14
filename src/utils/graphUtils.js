export function linkPainter(link, ctx, globalScale) {
    // get the start and end point
    const start = link.source;
    const end = link.target;
  
    // calculate midpoint x and y for label
    const textX = (start.x + end.x) / 2;
    const textY = (start.y + end.y) / 2;

    // Adjust font size based on globalScale
    // You can modify the divisor to control the scaling effect
    const fontSize = 10 / globalScale;  // Smaller value reduces the size more significantly


  
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Semi-transparent black

    ctx.fillText(link.type, textX, textY);
  }
  export function nodePainter(node, ctx, globalScale) {
    const label = node.label;
    const fontSize = 12 / globalScale; // Adjust font size based on zoom level

    // Calculate the radius based on the label size
    const textWidth = ctx.measureText(label).width;
    const radius = Math.max(20, textWidth / 2 + 5); // Ensure the radius is large enough for the text

    // Draw the node circle
    ctx.fillStyle = getNodeColor(node);
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    // Draw the label inside the node
    ctx.fillStyle = "white"; // Contrast color for better readability
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, node.x, node.y);
}

  export function nodePainter1(node, ctx, globalScale) {
    const label = node.label;
    //console.log("node : ", node)
    const fontSize = 12 / globalScale;
    ctx.fillStyle = getNodeColor(node);
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    ctx.fill();
  
    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, node.x, node.y + 10);
  }
  
  function getNodeColor(node) {
    //console.log("node label", node.label, "node label")
    switch(node.label) {
      case 'Object': return 'red';
      case 'Event': return 'green';
      default: return 'blue';
    }
  }