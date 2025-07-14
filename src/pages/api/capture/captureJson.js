import React, { useState, useEffect, useRef, useContext } from 'react';
import '../../../styles/EpcisCapturePage.css'; // Import the CSS file
import { Link } from 'react-router-dom';
import ReactJson from 'react-json-view'; // Import react-json-view
import { Button, Modal, Box } from '@mui/material'; // Import Material-UI components
import { GlobalStateContext } from '../../../GlobalStateContext'; // Import the GlobalStateContext


const EpcisCapturePage = (props) => {

  const { epcisServerIP, epcisPort, hashGeneratorServerIP, hashGeneratorPort,  hashGeneratorAlg} = useContext(GlobalStateContext); // Access the global state

  const [jsonInput, setJsonInput] = useState('');
  const [response, setResponse] = useState('');
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [mode, setMode] = useState('single'); // State to manage the mode
  const [open, setOpen] = useState(false); // State to manage the modal
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch the list of JSON files from the server or hardcode the list
    const fetchJsonFiles = async () => {
      // Example: Hardcoded list of JSON files
      const files = [
        'Single ObjectEvent.json',
        'Single AggregationEvent.json',
        'Multiple ObjectEvent Full.json'
        // Add more files as needed
      ];
      setJsonFiles(files);
    };

    fetchJsonFiles();
  }, []);

  let parsedJson;
  //let jsonError = null;

  try {
    parsedJson = JSON.parse(jsonInput);
  } catch (error) {
    //jsonError = error.message;
  }


  const handleCaptureEvent = async () => {
    try {

      if(mode === 'single'){
          console.log('Sending request to:', 'http://' + epcisServerIP + ':' + epcisPort + '/epcis/v2/events');
          const res = await fetch('http://' + epcisServerIP + ':' + epcisPort + '/epcis/v2/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
          body: jsonInput,
        });
        const data = await res.text();
        setResponse("[ status: "+res.status+"]  "+data);
      }else{  // mode === 'multiple'  
        console.log('Sending request to:', 'http://' + epcisServerIP + ':' + epcisPort + '/epcis/v2/capture');
        const res = await fetch('http://' + epcisServerIP + ':' + epcisPort + '/epcis/v2/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: jsonInput,
        });
        const data = await res.text(); 
        setResponse("[ status: "+res.status+"]  "+data);
      } 
    } catch (error) {
      console.error('Error: Failed to fetch', error);
      setResponse('Error: ' + error.message + '\n' + error.stack);
    }
  };

  const handleEventValidator = async () => {
    try {
      console.log('Sending request to:', 'http://' + epcisServerIP + ':' + epcisPort + '/epcis/v2/validate');
      const res = await fetch('http://' + epcisServerIP + ':' + epcisPort + '/epcis/v2/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: jsonInput,
      });
      //if (!res.ok) {
      //  throw new Error(`HTTP error! status: ${res.status}`);
      //}
      const data = await res.text();
      setResponse("[ status: "+res.status+"]  "+data);
    } catch (error) {
      console.error('Error: Failed to fetch', error);
      setResponse('Error: ' + error.message + '\n' + error.stack);
    }
  };

  const handleEventHashGenerator = async () => {
    try {
      /*console.log('Sending request to:', 'http://' + hashGeneratorServerIP + ':' + hashGeneratorPort + '/epcis/hash/events');
      console.log('Request headers:', {
        'hashAlg': hashGeneratorAlg,
        'Content-Type': 'application/json'
      });
      console.log('Request body:', jsonInput);
      */
      const res = await fetch('http://' + hashGeneratorServerIP + ':' + hashGeneratorPort + '/epcis/hash/events', {
        method: 'POST',
        headers: {
          'hashAlg': hashGeneratorAlg,
          'Content-Type': 'application/json'
        },
        body: jsonInput,
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error: Failed to fetch', error);
      setResponse('Error: ' + error.message + '\n' + error.stack);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setJsonInput(e.target.result);
      };
      reader.readAsText(file);
      setSelectedFile(''); // Clear the selected file from the dropdown
    }
  };

  const handleDropdownChange = async (event) => {
    const fileName = event.target.value;
    setSelectedFile(fileName);

    // Clear the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Fetch the content of the selected JSON file
    try {
      console.log(`Fetching file: /eventExamples/${fileName}`);
      const response = await fetch(`/eventExamples/${fileName}`);
      const fileContent = await response.text();
      console.log(`File content: ${fileContent}`);
      setJsonInput(fileContent);
    } catch (error) {
      console.error('Error loading JSON file:', error);
    }
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
  };

  const handleJsonInputChange = (e) => {
    try {
      //const parsedJson = JSON.parse(e.target.value);
      //setJsonInput(JSON.stringify(parsedJson, null, 2)); // Format JSON input
      setJsonInput(e.target.value); // Format JSON input
    } catch (error) {
      setJsonInput(e.target.value); // Set raw input if not valid JSON
    }
  };


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  return (
    <div className="container">
      <h1>API-EPCIS Capture Page</h1>
      <p>This page allows you to capture EPCIS events by sending JSON data to the server. </p>
      
      <div className="callout">
        
          <p> To change server settings, go to the <Link to="/settings">Settings</Link> page. </p>
       
      </div>

      <div className="input-container">
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <select value={selectedFile} onChange={handleDropdownChange}>
          <option value="objectEvent.json">Select EPCIS Examples</option>
          {jsonFiles.map((file) => (
            <option key={file} value={file}>
              {file.replace('.json', '')}
            </option>
          ))}
        </select>
      </div>
      <div className="mode-container">
        <label>
          <input
            type="radio"
            value="single"
            checked={mode === 'single'}
            onChange={handleModeChange}
          />
          Single Event
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={mode === 'multiple'}
            onChange={handleModeChange}
          />
          Multiple Events
        </label>
      </div>
      <textarea
        className="json-input"
        value={jsonInput}
        onChange={handleJsonInputChange}
        placeholder="Enter EPCIS Event here"
      />
      <div className="button-container">
        <Button variant="contained" color="primary" onClick={handleCaptureEvent}>Capture</Button>
        <Button variant="contained" color="secondary" onClick={handleEventValidator}>Validate</Button>
        <Button variant="contained" color="success" onClick={handleEventHashGenerator}>Event Hash</Button>
        <Button variant="contained" color="info" onClick={handleOpen}>
          Formatted View
        </Button>
      </div>
      <div className="response-container">
        <h2>Response:</h2>
        <pre className="response">{response}</pre>
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{ p: 4, backgroundColor: 'white', maxWidth: '80%', margin: 'auto', mt: 5 }}>
          <h2>Formatted JSON View</h2>
          {jsonInput ? (
            <ReactJson src={parsedJson} theme="monokai" />
          ) : (
            <p>No JSON input</p>
          )}
          <Button variant="contained" color="secondary" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Modal>
    
    </div>
  );
};

export default EpcisCapturePage;