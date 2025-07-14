import React from 'react';
import GraphVisualizer from './GraphVisualizer';
import ApiDataComponent  from './ApiDataComponent';
import '../../styles/TraceabilityPage.css'


const DocumentationPage = (props) => {
  return (
    <div>Traceability Page
    <div className="content-container" >
                <GraphVisualizer />
                <ApiDataComponent  />
            </div>
            </div>
  );
};

export default DocumentationPage ;