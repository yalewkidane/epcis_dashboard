import React, { useContext, useEffect } from 'react';
import '../../styles/SettingsPage.css'; // Import the CSS file
import { GlobalStateContext } from '../../GlobalStateContext';
import { Card, CardContent, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material'; 

const SettingsPage = () => {
  const { epcisServerIP, setEpcisServerIP, epcisPort, setEpcisPort, 
    traceabilityServerIP, setTraceabilityServerIP, traceabilityPort, setTraceabilityPort,
    hashGeneratorServerIP, setHashGeneratorServerIP, hashGeneratorPort, setHashGeneratorPort, hashGeneratorAlg, setHashGeneratorAlg} = useContext(GlobalStateContext);

  useEffect(() => {
    // Load saved settings from local storage
    const savedEpcisServerIP = localStorage.getItem('EPCIS_serverIP');
    const savedEpcisPort = localStorage.getItem('EPCIS_port');
    const savedTraceabilityServerIP = localStorage.getItem('Traceability_serverIP');
    const savedTraceabilityPort = localStorage.getItem('Traceability_port');
    const savedHashGeneratorServerIP = localStorage.getItem('EventHashGen_serverIP');
    const savedhashGeneratorPort = localStorage.getItem('EventHashGen_port');
    if (savedEpcisServerIP) setEpcisServerIP(savedEpcisServerIP);
    if (savedEpcisPort) setEpcisPort(savedEpcisPort);
    if (savedTraceabilityServerIP) setTraceabilityServerIP(savedTraceabilityServerIP);
    if (savedTraceabilityPort) setTraceabilityPort(savedTraceabilityPort);
    if (savedHashGeneratorServerIP) setHashGeneratorServerIP(savedHashGeneratorServerIP);
    if (savedhashGeneratorPort) setHashGeneratorPort(savedhashGeneratorPort);
  }, [setEpcisServerIP, setEpcisPort, setTraceabilityServerIP, setTraceabilityPort, setHashGeneratorServerIP, setHashGeneratorPort]);

  const handleSave = (e) => {
    e.preventDefault();
    // Save settings to local storage
    localStorage.setItem('EPCIS_serverIP', epcisServerIP);
    localStorage.setItem('EPCIS_port', epcisPort);
    localStorage.setItem('EventHashGen_serverIP', hashGeneratorServerIP);
    localStorage.setItem('EventHashGen_port', hashGeneratorPort);
    localStorage.setItem('Traceability_serverIP', traceabilityServerIP);
    localStorage.setItem('Traceability_port', traceabilityPort);
    alert('Settings saved!');
  };

  return (
    <div className="settings-container">
      <h1>Settings Page</h1>
      <form onSubmit={handleSave}>
        <Card sx={{ maxWidth: 600, margin: '20px auto' }}>
          <CardContent>
            <Typography variant="h5" component="div">
              EPCIS Settings
            </Typography>
            <div className="form-group">
              <TextField
                label="EPCIS Server IP"
                variant="outlined"
                fullWidth
                margin="normal"
                value={epcisServerIP}
                onChange={(e) => setEpcisServerIP(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <TextField
                label="EPCIS Port"
                variant="outlined"
                fullWidth
                margin="normal"
                value={epcisPort}
                onChange={(e) => setEpcisPort(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
        <Card sx={{ maxWidth: 600, margin: '20px auto' }}>
          <CardContent>
            <Typography variant="h5" component="div">
              EPCIS Evnet Hash Generator Settings
            </Typography>
            <div className="form-group">
              <TextField
                label="EPCIS Event Hash Generator  Server IP"
                variant="outlined"
                fullWidth
                margin="normal"
                value={hashGeneratorServerIP}
                onChange={(e) => setHashGeneratorServerIP(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <TextField
                label="EPCIS Event Hash Generator Port"
                variant="outlined"
                fullWidth
                margin="normal"
                value={hashGeneratorPort}
                onChange={(e) => setHashGeneratorPort(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <FormControl variant="outlined" fullWidth margin="normal" required>
                <InputLabel id="hash-generator-alg-label">EPCIS Event Hash Generator Algorithm</InputLabel>
                <Select
                  labelId="hash-generator-alg-label"
                  value={hashGeneratorAlg}
                  onChange={(e) => setHashGeneratorAlg(e.target.value)}
                  label="EPCIS Event Hash Generator Algorithm"
                >
                  <MenuItem value="sha256">SHA-256</MenuItem>
                  <MenuItem value="sha3-256">SHA3-256</MenuItem>
                  <MenuItem value="sha384">SHA-384</MenuItem>
                  <MenuItem value="sha512">SHA-512</MenuItem>
                </Select>
              </FormControl>
            </div>
          </CardContent>
        </Card>
        <Card sx={{ maxWidth: 600, margin: '20px auto' }}>
          <CardContent>
            <Typography variant="h5" component="div">
              Traceability Settings
            </Typography>
            <div className="form-group">
              <TextField
                label="Traceability Server IP"
                variant="outlined"
                fullWidth
                margin="normal"
                value={traceabilityServerIP}
                onChange={(e) => setTraceabilityServerIP(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <TextField
                label="Traceability Port"
                variant="outlined"
                fullWidth
                margin="normal"
                value={traceabilityPort}
                onChange={(e) => setTraceabilityPort(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" variant="contained" color="primary" sx={{ display: 'block', margin: '20px auto' }}>
          Save Settings
        </Button>
      </form>
    </div>
  );
};

export default SettingsPage;