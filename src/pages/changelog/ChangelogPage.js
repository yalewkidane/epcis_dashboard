import React from 'react';

const ChangelogPage = (props) => {
  return (
    <div className="changelog-page">
      <h1>Changelog</h1>

      <div className="changelog-section">
        <h2>EPCIS</h2>
        <ul>
          <li><strong>v1.2.0</strong> - Added new event types and improved performance.</li>
          <li><strong>v1.1.0</strong> - Fixed bugs related to event processing.</li>
          <li><strong>v1.0.0</strong> - Initial release with basic EPCIS functionalities.</li>
        </ul>
      </div>

      <div className="changelog-section">
        <h2>HashFunction Generator</h2>
        <ul>
          <li><strong>v1.1.0</strong> - Added support for SHA3-256 and SHA-512 algorithms.</li>
          <li><strong>v1.0.1</strong> - Fixed minor bugs and improved error handling.</li>
          <li><strong>v1.0.0</strong> - Initial release with SHA-256 algorithm support.</li>
        </ul>
      </div>

      <div className="changelog-section">
        <h2>Traceability</h2>
        <ul>
          <li><strong>v2.0.0</strong> - Major update with new traceability features and UI improvements.</li>
          <li><strong>v1.1.0</strong> - Improved data visualization and reporting.</li>
          <li><strong>v1.0.0</strong> - Initial release with basic traceability functionalities.</li>
        </ul>
      </div>
    </div>
  );
};

export default ChangelogPage;