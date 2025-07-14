import React from 'react';
import { Button, Card, CardContent, Typography } from '@mui/material';
import '../../styles/GeneralComponent.css'; // Import the CSS file

const DocumentationPage = () => {
  return (
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
            height="800px"
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
  );
};

export default DocumentationPage;