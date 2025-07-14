import React, { useContext } from 'react';
import { Box, Typography,Grid } from '@mui/material';
import { GlobalStateContext } from '../../GlobalStateContext'; // Import the GlobalStateContext
import ServerIcon from '@mui/icons-material/Storage'; // Import an icon for the server


const BottomBar = () => {
  const { epcisServerIP, epcisPort, traceabilityServerIP, traceabilityPort, hashGeneratorServerIP, hashGeneratorPort } = useContext(GlobalStateContext); // Access the global state
  
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        p: 2,
        position: 'fixed',
        bottom: 0,
        backgroundColor: '#f8f9fa',
        textAlign: 'center',
        borderTop: '1px solid #e7e7e7'
      }}
    >
      <Grid container spacing={2} justifyContent="right">
        <Grid item>
          <ServerIcon color="primary" />
        </Grid>
        <Grid item>
          <Typography variant="body2" color="textSecondary">
          EPCIS End Point: <span style={{ fontWeight: 'bold', fontStyle: 'italic', color: '#007bff' }}>{epcisServerIP}:{epcisPort}</span>
            
          </Typography>
        </Grid>
        <Grid item>
          <ServerIcon color="secondary" />
        </Grid>
        <Grid item>
          <Typography variant="body2" color="textSecondary">
            Hash Generatore End Point: <span style={{ fontWeight: 'bold', fontStyle: 'italic', color: '#007bff' }}>{hashGeneratorServerIP}:{hashGeneratorPort}</span>
          </Typography>
        </Grid>
        <Grid item>
          <ServerIcon color="success" />
        </Grid>
        <Grid item>
          <Typography variant="body2" color="textSecondary">
          Traceability  End Point: <span style={{ fontWeight: 'bold', fontStyle: 'italic', color: '#007bff' }}>{traceabilityServerIP}:{traceabilityPort}</span>
          </Typography>
        </Grid>
      </Grid>
      <Typography variant="body2" color="textSecondary">
        © 2024 Yale. All rights reserved.
      </Typography>
    </Box>
  );
};

export default BottomBar;