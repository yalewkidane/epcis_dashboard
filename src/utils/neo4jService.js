import driver from './neo4jConfig';

export const runQuery = async (query) => {
  const session = driver.session();
  try {
    const result = await session.run(query);
    console.info('running query:', query);
    return parseResult(result);
  } catch (error) {
    console.error('Error running query:', error);
  } finally {
    await session.close();
  }
};

const parseResult = (result) => {
    const nodesMap = new Map(); // Stores nodes to prevent duplication
    const links = [];           // Stores links (relationships)
    const linksSet = new Set(); // Prevents duplicate links
  
    result.records.forEach(record => {
      record.forEach(value => {
        if (value.labels) { // Node handling
          if (!nodesMap.has(value.identity.toNumber())) { // Ensures unique nodes
            nodesMap.set(value.identity.toNumber(), {
              id: value.identity.toNumber(),
              label: value.labels[0], // Assuming one label per node
              title: JSON.stringify(value.properties),
              ...value.properties
            });
          }
        } else if (value.type) { // Relationship handling
          const linkId = `${value.start.toNumber()}-${value.end.toNumber()}`;
          if (!linksSet.has(linkId)) { // Ensures unique links
            linksSet.add(linkId);
            links.push({ // Adds new link
              source: value.start.toNumber(),
              target: value.end.toNumber(),
              type: value.type,
              properties: value.properties
            });
          }
        }
      });
    });
  
    return { nodes: Array.from(nodesMap.values()), links: links };
  };
  