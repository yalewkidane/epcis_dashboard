import React, { useState, useContext, useEffect} from 'react';
import '../../styles/GeneralComponent.css'; // Import the CSS file
import { GlobalStateContext } from '../../GlobalStateContext'; // Import the GlobalStateContext
import ReactJson from 'react-json-view'; // Import react-json-view
import { Box, Typography, TextField, Button , Collapse, MenuItem} from '@mui/material'; // Import Material-UI components
import { Link } from 'react-router-dom';

const QueryPage = () => {
  const { epcisServerIP, epcisPort } = useContext(GlobalStateContext); // Access the global state

  const [queryParam, setQueryParam] = useState('/events?'); // State for query parameters
  const [perPage, setPerPage] = useState('2');
  const [nextPageToken, setNextPageToken] = useState('');
  const [eventType, setEventType] = useState('ObjectEvent');
  const [eventAction, setEventAction] = useState('ADD');
  const [queryEPCType, setQueryEPCType] = useState('MATCH_epc');
  const [queryEPCValue, setQueryEPCValue] = useState('');
  const [bizStep, setBizStep] = useState([]);
  const [selectedBizStep, setSelectedBizStep] = useState('accepting'); // State for selected bizStep disposition
  const [disposition, setDisposition] = useState([]);
  const [selectedDisposition, setSelectedDisposition] = useState('active'); // State for selected bizStep disposition
  const [response, setResponse] = useState(null);
  const [headerResponse, setHeaderResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [queryTimeType, setQueryTimeType] = useState('GE_eventTime');
  const [queryTimeValue, setQueryTimeValue] = useState('2024-11-09T23:11');
  const [queryType, setQueryType] = useState('orderBy');
  const [queryValue, setQueryValue] = useState('');

  //endPoint
  const [endPoint, setEndPoint] = useState('/events?');

  //for headers 
  const [gs1EpcisMax, setGs1EpcisMax] = useState('2.0.0');
  const [gs1EpcisMin, setGs1EpcisMin] = useState('2.0.0');
  const [gs1CbvMax, setGs1CbvMax] = useState('2.0.0');
  const [gs1CbvMin, setGs1CbvMin] = useState('2.0.0');
  const [gs1EpcFormat, setGs1EpcFormat] = useState('No_Preference');
  const [gs1CbvXmlFormat, setGs1CbvXmlFormat] = useState('');

  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await fetch('/Parameters/parameters.json');
        const data = await response.json();
        setBizStep(data.bizStep); // Assuming 'bizStep' is the key for event types
        setDisposition(data.disposition); // Assuming 'disposition' is the key for event types
      } catch (error) {
        console.error('Error fetching event types:', error);
      }
    };

    fetchEventTypes();
  }, []);



  const handleQuery = async () => {
    try {
      let url_string = `http://${epcisServerIP}:${epcisPort}/epcis/v2`;
       
      const url = new URL(url_string+queryParam);
      console.log('Sending query to:', url.toString());

      

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'GS1-EPCIS-Max':gs1EpcisMax,
          'GS1-EPCIS-Min':gs1EpcisMin,
          'GS1-CBV-Max':gs1CbvMax,
          'GS1-CBV-Min':gs1CbvMin,
          'GS1-EPC-Format':gs1EpcFormat,
          'GS1-CBV-XML-Format':""
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      console.log('Headers: testing her'); // Log headers to console
      const data = await res.json();
      console.log('Fetched data:', JSON.stringify(data)); // Log fetched data to console
      console.log('-----------:')
      // Log all headers to the console
      res.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      setHeaderResponse(res.headers);
      console.log('Headers :', Array.from(res.headers.entries())); // Log headers to console
      setResponse(data);
      setError(null);
    } catch (error) {
      setError(error.message);
      setResponse(null);
    }
  };

  const handleBizStep = () => {
    if (selectedBizStep) {
      const newQueryParam = queryParam ? `${queryParam}&EQ_bizStep=["${selectedBizStep}"]` : `EQ_bizStep=["${selectedBizStep}"]`;
      setQueryParam(newQueryParam);
      //setPerPage(''); // Clear the perPage input
    }
  };
  const handleDisposition = () => {
    if (selectedDisposition) {
      const newQueryParam = queryParam ? `${queryParam}&EQ_disposition=["${selectedDisposition}"]` : `EQ_disposition=["${selectedDisposition}"]`;
      setQueryParam(newQueryParam);
      //setPerPage(''); // Clear the perPage input
    }
  };

  const handleTimeMatch = () => { 
    if (queryEPCValue) {
      const newQueryParam = queryParam ? `${queryParam}&${queryTimeType}=["${queryTimeValue}"]` : `${queryTimeType}=["${queryTimeValue}"]`;
      setQueryParam(newQueryParam);
    }
  };

  const handleAddPerPage = () => {
    if (perPage) {
      const newQueryParam = queryParam ? `${queryParam}&perPage=${perPage}` : `perPage=${perPage}`;
      setQueryParam(newQueryParam);
      //setEventType(''); // Clear the perPage input
    }
  };

  const handleNextPageToken = () => {
    if (nextPageToken) {
      const newQueryParam = queryParam ? `${queryParam}&perPage=${nextPageToken}` : `perPage=${nextPageToken}`;
      setQueryParam(newQueryParam);
      //setEventType(''); // Clear the perPage input
    }
  };
  
  const handleEventType = () => {
    if (eventType) {
      const newQueryParam = queryParam ? `${queryParam}&eventType=["${eventType}"]` : `eventType=["${eventType}"]`;
      setQueryParam(newQueryParam);
      //setPerPage(''); // Clear the perPage input
    }
  };
  const handleEventAction = () => {
    if (eventAction) {
      const newQueryParam = queryParam ? `${queryParam}&EQ_action=["${eventAction}"]` : `EQ_action=["${eventAction}"]`;
      setQueryParam(newQueryParam);
      //setPerPage(''); // Clear the perPage input
    }
  };
  const handleEPCMatch = () => { 
    if (queryEPCValue) {
      const newQueryParam = queryParam ? `${queryParam}&${queryEPCType}=["${queryEPCValue}"]` : `${queryEPCType}=["${queryEPCValue}"]`;
      setQueryParam(newQueryParam);
    }
  };

  const handleQueryMatch = () => { 
    if (queryValue) {
      const newQueryParam = queryParam ? `${queryParam}&${queryType}=["${queryValue}"]` : `${queryType}=["${queryValue}"]`;
      setQueryParam(newQueryParam);
    }
  };
//&eventType=["ObjectEvent"]
  return (
    <div className="query-page">
      <h1>EPCIS Query Page</h1>
     
      <p>This page allows you to Query EPCIS events by sending query parameter to the server. </p>
      
      <div className="callout">
      <p>  http://{epcisServerIP}:{epcisPort}/epcis/v2/events;</p>
          <p> To change server settings, go to the <Link to="/settings">Settings</Link> page. </p>
       
      </div>

      <div className="query-form">
        <div  className="query-response">
      <TextField
              select
              label="End Point"
              variant="outlined"
              margin="normal"
              value={endPoint}
              onChange={(e) => {setQueryParam(e.target.value); setEndPoint(e.target.value)}}
              sx={{ width: '200px', marginBottom: '10px', marginRight: '10px' }}
            >
              <MenuItem value="/events?">Events</MenuItem>
              <MenuItem value="/eventTypes/{eventType}/events?">eventTypes</MenuItem>
              <MenuItem value="/epcs/{epc}/events?">Epcs</MenuItem>
              <MenuItem value="/bizSteps/{bizStep}/events?">BizSteps</MenuItem>
              <MenuItem value="/dispositions/{disposition}/events?">Dispositions</MenuItem>
              <MenuItem value="/readPoints/{readPoint}/events?">ReadPoints</MenuItem>
              <MenuItem value="/bizLocations/{bizLocation}/events?">BizLocations</MenuItem>
              
        </TextField>
        <TextField
          label="Query Parameters"
          variant="outlined"
          fullWidth
          margin="normal"
          value={queryParam}
          onChange={(e) => setQueryParam(e.target.value)}
          multiline
          sx={{
            '& .MuiInputBase-input': {
              fontStyle: 'italic',
              color: 'blue', // Change the color as needed
            },
          }}
        />
        </div>
        <Button variant="contained" color="primary" onClick={handleQuery} sx={{ float: 'right' }}>
          Send Query
        </Button>
      </div>
           {/*-------------------------- For the headers -------------------------------------------------------- */}
                                        <Box sx={{ marginTop: '20px', textAlign: 'left' }}>
                                    <Typography variant="h6">Headers:</Typography>
                                    
                                    <TextField
                                      label="GS1-EPCIS-Max"
                                      variant="outlined"
                                      margin="normal"
                                      value={gs1EpcisMax}
                                      onChange={(e) => setGs1EpcisMax(e.target.value)}
                                      sx={{ width: '300px', marginBottom: '10px', marginRight: '10px' }}
                                    />
                                    <TextField
                                      label="GS1-EPCIS-Min"
                                      variant="outlined"
                                      margin="normal"
                                      value={gs1EpcisMin}
                                      onChange={(e) => setGs1EpcisMin(e.target.value)}
                                      sx={{ width: '300px', marginBottom: '10px', marginRight: '10px' }}
                                    />
                                    <TextField
                                      label="GS1-CBV-Max"
                                      variant="outlined"
                                      margin="normal"
                                      value={gs1CbvMax}
                                      onChange={(e) => setGs1CbvMax(e.target.value)}
                                      sx={{ width: '300px', marginBottom: '10px', marginRight: '10px' }}
                                    />
                                    <TextField
                                      label="GS1-CBV-Min"
                                      variant="outlined"
                                      margin="normal"
                                      value={gs1CbvMin}
                                      onChange={(e) => setGs1CbvMin(e.target.value)}
                                      sx={{ width: '300px', marginBottom: '10px', marginRight: '10px' }}
                                    />
                                    <TextField
                                        select
                                        label="GS1-EPC-Format"
                                        variant="outlined"
                                        margin="normal"
                                        value={gs1EpcFormat}
                                        onChange={(e) => setGs1EpcFormat(e.target.value)}
                                        sx={{ width: '300px', marginBottom: '10px', marginRight: '10px' }}
                                      >
                                        <MenuItem value="No_Preference">No_Preference</MenuItem>
                                        <MenuItem value="Always_GS1_Digital_Link">Always_GS1_Digital_Link</MenuItem>
                                        <MenuItem value="Always_EPC_URN">Always_EPC_URN</MenuItem>
                                        <MenuItem value="Never_Translates">Never_Translates</MenuItem>
                                      </TextField>
                                    <TextField
                                      label="GS1-CBV-XML-Format"
                                      variant="outlined"
                                      margin="normal"
                                      value={gs1CbvXmlFormat}
                                      onChange={(e) => setGs1CbvXmlFormat(e.target.value)}
                                      sx={{ width: '300px', marginBottom: '10px', marginRight: '10px' }}
                                    />
                                  </Box>

      <Button variant="contained" color="success" onClick={toggleCollapse} sx={{ marginTop: '50px' }}>
        {isCollapsed ? 'Hide Query Parameters' : 'Show Query Parameters'}
      </Button>

      <Collapse in={isCollapsed}>

          <div className="per-page-nextPageToken-form">

              <TextField label="Per Page" type="number"  variant="outlined" margin="normal"
                value={perPage} onChange={(e) => setPerPage(e.target.value)}sx={{ width: '250px' }}  />
              <Button variant="contained" color="secondary" onClick={handleAddPerPage} sx={{ width: '200px', marginRight: '50px', marginTop: '25px', marginLeft: '10px' }}>
                Add Per Page
              </Button>

              
              <TextField label="Next Page Token" type="number"  variant="outlined" margin="normal"
                value={nextPageToken} onChange={(e) => setNextPageToken(e.target.value)}sx={{ width: '250px' }}  />
              <Button variant="contained" color="secondary" onClick={handleNextPageToken} sx={{ width: '200px', marginRight: '50px', marginTop: '25px', marginLeft: '10px' }}>
                Add nextPage Token
              </Button>
            
         
        </div>

        <div className="action-event-type-form ">

            <TextField
                select label="Event Type" variant="outlined" margin="normal"
                value={eventType} onChange={(e) => setEventType(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                sx={{ width: '250px', marginTop: '10px' }} 
              >
                <option value={"ObjectEvent"}>ObjectEvent</option>
                <option value={"AggregationEvent"}>AggregationEvent</option>
                <option value={"TransformationEvent"}>TransformationEvent</option>
                <option value={"TransactionEvent"}>TransactionEvent</option>
              </TextField>
              <Button variant="contained" color="secondary" onClick={handleEventType} sx={{ width: '200px', marginTop: '25px', marginRight: '50px', marginLeft: '10px' }} >
                Add Event Type
              </Button>


          
             <TextField
            select label="Action" variant="outlined" margin="normal"
            value={eventAction} onChange={(e) => setEventAction(e.target.value)}
            SelectProps={{
              native: true,
            }}
            sx={{ width: '250px', marginTop: '10px' }} 
          >
            <option value={"OBSERVE"}>OBSERVE</option>
            <option value={"DELETE"}>DELETE</option>
            <option value={"ADD"}>ADD</option>
          </TextField>
          <Button variant="contained" color="secondary" onClick={handleEventAction} sx={{ width: '200px', marginRight: '50px', marginTop: '25px', marginLeft: '10px' }} >
            Add Action Type
          </Button>

            
      </div>


          <div className="Disposition start-time-form">
             <TextField
              select label="Biz Step"
              variant="outlined" margin="normal"
              value={selectedBizStep} onChange={(e) => setSelectedBizStep(e.target.value)}
              SelectProps={{native: true,}}
              sx={{ width: '250px', marginTop: '10px' }}>
              {bizStep.map((type) => (<option key={type} value={type}>{type}</option>))}
            </TextField>
            <Button variant="contained" color="secondary" onClick={handleBizStep} sx={{ width: '200px', marginTop: '25px', marginRight: '50px', marginLeft: '10px' }}>
            ADD Biz Step
            </Button>

              <TextField
                select label="Dispositionp"
                variant="outlined" margin="normal"
                value={selectedDisposition} onChange={(e) => setSelectedDisposition(e.target.value)}
                SelectProps={{native: true,}}
                sx={{ width: '250px', marginTop: '10px' }}>
                {disposition.map((type) => (<option key={type} value={type}>{type}</option>))}
              </TextField>
              <Button variant="contained" color="secondary" onClick={handleDisposition} sx={{ width: '200px', marginRight: '50px', marginTop: '25px' , marginLeft: '10px'}}>
              Add Disposition
              </Button>  
          </div>

          <div className="Time-type-form"> 
          <TextField
                select label="Select Time Type" variant="outlined" margin="normal"
                value={queryTimeType} onChange={(e) => setQueryTimeType(e.target.value)}
                sx={{ width: '250px', marginRight: '20px' }}
              >
                <MenuItem value="GE_eventTime">GE_eventTime</MenuItem>
                <MenuItem value="LT_eventTime">LT_eventTime</MenuItem>
                <MenuItem value="GE_recordTime">GE_recordTime</MenuItem>
                <MenuItem value="LT_recordTime">LT_recordTime</MenuItem>

                <MenuItem value="GE_errorDeclarationTime">GE_errorDeclarationTime</MenuItem>
                <MenuItem value="LT_errorDeclarationTime">LT_errorDeclarationTime</MenuItem>

                <MenuItem value="GE_startTime">GE_startTime</MenuItem>
                <MenuItem value="LT_startTime">LT_startTime</MenuItem>
                <MenuItem value="GE_endTime">GE_endTime</MenuItem>
                <MenuItem value="LT_endTime">LT_endTime</MenuItem>

               
  
              </TextField>
              <TextField
                label={queryTimeType} type="datetime-local"
                variant="outlined" margin="normal"
                value={queryTimeValue} onChange={(e) => setQueryTimeValue(e.target.value)}
                sx={{ width: '400px' }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleTimeMatch}
                sx={{ width: '250px', marginLeft: '10px', marginTop: '25px' }}
              >
                Add {queryTimeType}
              </Button>
            </div>
          
          <div className="EPC-type-form"> 
              <TextField
                select label="Select EPC Type" variant="outlined" margin="normal"
                value={queryEPCType} onChange={(e) => setQueryEPCType(e.target.value)}
                sx={{ width: '250px', marginRight: '20px' }}
              >
                <MenuItem value="MATCH_epc">MATCH_epc</MenuItem>
                <MenuItem value="MATCH_anyEPC">MATCH_anyEPC</MenuItem>
                <MenuItem value="MATCH_parentID">MATCH_parentID</MenuItem>
                
                <MenuItem value="MATCH_anyEPCClass">MATCH_anyEPCClass</MenuItem>
                <MenuItem value="MATCH_epcClass">MATCH_epcClass</MenuItem>
                
                <MenuItem value="EQ_transformationID">EQ_transformationID</MenuItem>
                <MenuItem value="EQ_readPoint">EQ_readPoint</MenuItem>
                <MenuItem value="WD_readPoint">WD_readPoint</MenuItem>
                <MenuItem value="EQ_bizLocation">EQ_bizLocation</MenuItem>
                <MenuItem value="WD_bizLocation">WD_bizLocation</MenuItem>
                <MenuItem value="MATCH_inputEPCClass">MATCH_inputEPCClass</MenuItem>
                <MenuItem value="MATCH_inputEPC">MATCH_inputEPC</MenuItem>
                <MenuItem value="MATCH_outputEPC">MATCH_outputEPC</MenuItem>
                <MenuItem value="MATCH_outputEPCClass">MATCH_outputEPCClass</MenuItem>
  
              </TextField>
              <TextField
                label={queryEPCType} type="text"
                variant="outlined" margin="normal"
                value={queryEPCValue} onChange={(e) => setQueryEPCValue(e.target.value)}
                sx={{ width: '400px' }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleEPCMatch}
                sx={{ width: '250px', marginLeft: '10px', marginTop: '25px' }}
              >
                Add {queryEPCType}
              </Button>
            </div>

            <div className="Others-type-form"> 
              <TextField
                select label="Select Query Type" variant="outlined" margin="normal"
                value={queryType} onChange={(e) => setQueryType(e.target.value)}
                sx={{ width: '250px', marginRight: '20px' }}
              >
                <MenuItem value="orderBy">orderBy</MenuItem>
                <MenuItem value="orderDirection">orderDirection</MenuItem>
                <MenuItem value="eventCountLimit">eventCountLimit</MenuItem>
                <MenuItem value="maxEventCount">maxEventCount</MenuItem>
                <MenuItem value="EQ_persistentDisposition_set">EQ_persistentDisposition_set</MenuItem>
                <MenuItem value="EQ_persistentDisposition_unset">EQ_persistentDisposition_unset</MenuItem>

                <MenuItem value="EQ_quantity">EQ_quantity</MenuItem>
                <MenuItem value="GT_quantity">GT_quantity</MenuItem>
                <MenuItem value="GE_quantity">GE_quantity</MenuItem>
                <MenuItem value="LT_quantity">LT_quantity</MenuItem>
                <MenuItem value="LE_quantity">LE_quantity</MenuItem>
                <MenuItem value="EQ_eventID">EQ_eventID</MenuItem>
                <MenuItem value="EXISTS_errorDeclaration">EXISTS_errorDeclaration</MenuItem>
                <MenuItem value="EQ_errorReason">EQ_errorReason</MenuItem>
                <MenuItem value="EQ_correctiveEventID">EQ_correctiveEventID</MenuItem>

                <MenuItem value="EQ_type">EQ_type</MenuItem>
                <MenuItem value="EQ_deviceID">EQ_deviceID</MenuItem>
                <MenuItem value="EQ_dataProcessingMethod">EQ_dataProcessingMethod</MenuItem>
                <MenuItem value="EQ_microorganism">EQ_microorganism</MenuItem>
                <MenuItem value="EQ_chemicalSubstance">EQ_chemicalSubstance</MenuItem>
                <MenuItem value="EQ_bizRules">EQ_bizRules</MenuItem>
                <MenuItem value="EQ_readPoint_readingPointfieldName:fieldname_extension:fieldname">EQ_readPoint_readingPointfieldName:fieldname_extension:fieldname</MenuItem>
                <MenuItem value="EQ_ext:field">EQ_ext:field</MenuItem>
                <MenuItem value="EQ_bizTransaction_po">EQ_bizTransaction_po</MenuItem>
                <MenuItem value="EQ_source_location">EQ_source_location</MenuItem>
                <MenuItem value="EQ_destination_location">EQ_destination_location</MenuItem>

                <MenuItem value="EQ_quantity_KGM">EQ_quantity_KGM</MenuItem>
                <MenuItem value="GE_quantity_KGM">GE_quantity_KGM</MenuItem>
                <MenuItem value="GT_quantity_KGM">GT_quantity_KGM</MenuItem>
                <MenuItem value="LE_quantity_KGM">LE_quantity_KGM</MenuItem>
                <MenuItem value="LT_quantity_KGM">LT_quantity_KGM</MenuItem>
                <MenuItem value="EQ_ext1:float">EQ_ext1:float</MenuItem>
                <MenuItem value="EQ_ext1:time">EQ_ext1:time</MenuItem>
                <MenuItem value="GT_ext1:int">GT_ext1:int</MenuItem>
                <MenuItem value="GE_ext1:int">GE_ext1:int</MenuItem>
                <MenuItem value="LT_ext1:int">LT_ext1:int</MenuItem>
                <MenuItem value="LE_ext1:int">LE_ext1:int</MenuItem>
                <MenuItem value="EQ_ILMD_ext1:float">EQ_ILMD_ext1:float</MenuItem>
                <MenuItem value="GT_ILMD_ext1:float">GT_ILMD_ext1:float</MenuItem>
                <MenuItem value="GE_ILMD_ext1:float">GE_ILMD_ext1:float</MenuItem>
                <MenuItem value="LT_ILMD_ext1:float">LT_ILMD_ext1:float</MenuItem>
                <MenuItem value="LE_ILMD_ext1:float">LE_ILMD_ext1:float</MenuItem>

                <MenuItem value="EQ_INNER_ext1:object_ext25:string">EQ_INNER_ext1:object_ext25:string</MenuItem>
                <MenuItem value="EQ_INNER_ext1:object_ext25:number">EQ_INNER_ext1:object_ext25:number</MenuItem>
                <MenuItem value="GT_INNER_ext1:object_ext25:number">GT_INNER_ext1:object_ext25:number</MenuItem>
                <MenuItem value="GE_INNER_ext1:object_ext25:number">GE_INNER_ext1:object_ext25:number</MenuItem>
                <MenuItem value="LT_INNER_ext1:object_ext25:number">LT_INNER_ext1:object_ext25:number</MenuItem>
                <MenuItem value="LE_INNER_ext1:object_ext25:number">LE_INNER_ext1:object_ext25:number</MenuItem>
                <MenuItem value="EQ_INNER_ILMD_ext1:array_ext1:object_ext1:object_ext2:int">EQ_INNER_ILMD_ext1:array_ext1:object_ext1:object_ext2:int</MenuItem>
                <MenuItem value="EQ_INNER_ILMD_ext244:object_ext246:object_ext3:number">EQ_INNER_ILMD_ext244:object_ext246:object_ext3:number</MenuItem>
                <MenuItem value="GT_INNER_ILMD_ext244:object_ext246:object_ext3:number">GT_INNER_ILMD_ext244:object_ext246:object_ext3:number</MenuItem>
                <MenuItem value="GE_INNER_ILMD_ext244:object_ext246:object_ext3:number">GE_INNER_ILMD_ext244:object_ext246:object_ext3:number</MenuItem>
                <MenuItem value="LT_INNER_ILMD_ext244:object_ext246:object_ext3:number">LT_INNER_ILMD_ext244:object_ext246:object_ext3:number</MenuItem>
                <MenuItem value="LE_INNER_ILMD_ext244:object_ext246:object_ext3:number">LE_INNER_ILMD_ext244:object_ext246:object_ext3:number</MenuItem>
    

                

                <MenuItem value="LE_INNER_ILMD_ext244:object_ext246:object_ext3:number">LE_INNER_ILMD_ext244:object_ext246:object_ext3:number</MenuItem>
                <MenuItem value="EXISTS_ext1:float">EXISTS_ext1:float</MenuItem>
                <MenuItem value="EXISTS_INNER_ext1:object_ext2:array">EXISTS_INNER_ext1:object_ext2:array</MenuItem>
                <MenuItem value="EXISTS_ILMD_ext1:float">EXISTS_ILMD_ext1:float</MenuItem>
                <MenuItem value="EXISTS_INNER_ILMD_ext244:object_ext246:object">EXISTS_INNER_ILMD_ext244:object_ext246:object</MenuItem>
                <MenuItem value="HASATTR_fieldname">HASATTR_fieldname</MenuItem>
                <MenuItem value="EQ_ATTR_fieldname_attrname">EQ_ATTR_fieldname_attrname</MenuItem>
                <MenuItem value="EQ_ERROR_DECLARATION_example:numberErrorDeclaration">EQ_ERROR_DECLARATION_example:numberErrorDeclaration</MenuItem>
                <MenuItem value="EQ_ERROR_DECLARATION_example:declarationTime">EQ_ERROR_DECLARATION_example:declarationTime</MenuItem>
                <MenuItem value="GT_ERROR_DECLARATION_example:numberErrorDeclaration">GT_ERROR_DECLARATION_example:numberErrorDeclaration</MenuItem>
                <MenuItem value="GT_ERROR_DECLARATION_example:declarationTime">GT_ERROR_DECLARATION_example:declarationTime</MenuItem>

                


                  <MenuItem value="GE_ERROR_DECLARATION_example:numberErrorDeclaration">GE_ERROR_DECLARATION_example:numberErrorDeclaration</MenuItem>
                  <MenuItem value="LT_ERROR_DECLARATION_example:numberErrorDeclaration">LT_ERROR_DECLARATION_example:numberErrorDeclaration</MenuItem>
                  <MenuItem value="LE_ERROR_DECLARATION_example:numberErrorDeclaration">LE_ERROR_DECLARATION_example:numberErrorDeclaration</MenuItem>
                  <MenuItem value="EQ_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration">EQ_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration</MenuItem>
                  <MenuItem value="GT_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration">GT_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration</MenuItem>
                  <MenuItem value="GE_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration">GE_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration</MenuItem>
                  <MenuItem value="LT_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration">LT_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration</MenuItem>
                  <MenuItem value="LE_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration">LE_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration</MenuItem>
                  <MenuItem value="EXISTS_ERROR_DECLARATION_example:numberErrorDeclaration">EXISTS_ERROR_DECLARATION_example:numberErrorDeclaration</MenuItem>
                  <MenuItem value="EXISTS_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration">EXISTS_INNER_ERROR_DECLARATION_example:inndrDeclarion_example:numberinnerDeclaration</MenuItem>
                  <MenuItem value="EQ_stringValue">EQ_stringValue</MenuItem>
                  <MenuItem value="EQ_hexBinaryValue">EQ_hexBinaryValue</MenuItem>
                

                

                <MenuItem value="EQ_uriValue">EQ_uriValue</MenuItem>
                <MenuItem value="EQ_booleanValue">EQ_booleanValue</MenuItem>
                <MenuItem value="GE_percRank">GE_percRank</MenuItem>
                <MenuItem value="LT_percRank">LT_percRank</MenuItem>
                <MenuItem value="EQ_value_CEL">EQ_value_CEL</MenuItem>
                <MenuItem value="GT_value_CEL">GT_value_CEL</MenuItem>
                <MenuItem value="GE_value_CEL">GE_value_CEL</MenuItem>
                <MenuItem value="LE_value_CEL">LE_value_CEL</MenuItem>
                <MenuItem value="LT_value_CEL">LT_value_CEL</MenuItem>
                <MenuItem value="GT_minValue_CEL">GT_minValue_CEL</MenuItem>
                <MenuItem value="GE_minValue_CEL">GE_minValue_CEL</MenuItem>
                <MenuItem value="LT_minValue_CEL">LT_minValue_CEL</MenuItem>

               

                <MenuItem value="LE_minValue_CEL">LE_minValue_CEL</MenuItem>
                <MenuItem value="GE_maxValue_CEL">GE_maxValue_CEL</MenuItem>
                <MenuItem value="LT_maxValue_CEL">LT_maxValue_CEL</MenuItem>
                <MenuItem value="GT_meanValue_CEL">GT_meanValue_CEL</MenuItem>
                <MenuItem value="GE_meanValue_CEL">GE_meanValue_CEL</MenuItem>
                <MenuItem value="LT_meanValue_CEL">LT_meanValue_CEL</MenuItem>
                <MenuItem value="LE_meanValue_CEL">LE_meanValue_CEL</MenuItem>
                <MenuItem value="GT_sDev_CEL">GT_sDev_CEL</MenuItem>
                <MenuItem value="GE_sDev_CEL">GE_sDev_CEL</MenuItem>
                <MenuItem value="LT_sDev_CEL">LT_sDev_CEL</MenuItem>
                <MenuItem value="LE_sDev_CEL">LE_sDev_CEL</MenuItem>
                <MenuItem value="GT_percValue_CEL">GT_percValue_CEL</MenuItem>
                <MenuItem value="GE_percValue_CEL">GE_percValue_CEL</MenuItem>
                <MenuItem value="LT_percValue_CEL">LT_percValue_CEL</MenuItem>
                <MenuItem value="LE_percValue_CEL">LE_percValue_CEL</MenuItem>
                <MenuItem value="EQ_percValue_CEL">EQ_percValue_CEL</MenuItem>


                <MenuItem value="GE_percValue_CEL">GE_percValue_CEL</MenuItem>
                <MenuItem value="LT_percValue_CEL">LT_percValue_CEL</MenuItem>
                <MenuItem value="LE_percValue_CEL">LE_percValue_CEL</MenuItem>
                <MenuItem value="EQ_SENSORELEMENT_example:numberSensorElement">EQ_SENSORELEMENT_example:numberSensorElement</MenuItem>
                <MenuItem value="EQ_SENSORELEMENT_example:TimeSensorElement">EQ_SENSORELEMENT_example:TimeSensorElement</MenuItem>
                <MenuItem value="GT_SENSORELEMENT_example:numberSensorElement">GT_SENSORELEMENT_example:numberSensorElement</MenuItem>
                <MenuItem value="GE_SENSORELEMENT_example:numberSensorElement">GE_SENSORELEMENT_example:numberSensorElement</MenuItem>
                <MenuItem value="LT_SENSORELEMENT_example:numberSensorElement">LT_SENSORELEMENT_example:numberSensorElement</MenuItem>
                <MenuItem value="LE_SENSORELEMENT_example:numberSensorElement">LE_SENSORELEMENT_example:numberSensorElement</MenuItem>
                <MenuItem value="EQ_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement">EQ_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement</MenuItem>
                <MenuItem value="EQ_INNER_SENSORELEMENT_example:inndrSensorElement_example:timeInnerSensorElement">EQ_INNER_SENSORELEMENT_example:inndrSensorElement_example:timeInnerSensorElement</MenuItem>
                <MenuItem value="GT_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement">GT_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement</MenuItem>

                <MenuItem value="GE_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement">GE_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement</MenuItem>
                <MenuItem value="LT_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement">LT_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement</MenuItem>
                <MenuItem value="LE_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement">LE_INNER_SENSORELEMENT_example:inndrSensorElement_example:numberinnerSensorElement</MenuItem>
                <MenuItem value="EQ_SENSORMETADATA_example:numbersensorMetadata">EQ_SENSORMETADATA_example:numbersensorMetadata</MenuItem>
                <MenuItem value="EQ_SENSORMETADATA_example:stringsensorMetadata">EQ_SENSORMETADATA_example:stringsensorMetadata</MenuItem>
                <MenuItem value="GT_SENSORMETADATA_example:numbersensorMetadata">GT_SENSORMETADATA_example:numbersensorMetadata</MenuItem>
                <MenuItem value="GE_SENSORMETADATA_example:numbersensorMetadata">GE_SENSORMETADATA_example:numbersensorMetadata</MenuItem>
                <MenuItem value="LT_SENSORMETADATA_example:numbersensorMetadata">LT_SENSORMETADATA_example:numbersensorMetadata</MenuItem>
                <MenuItem value="LE_SENSORMETADATA_example:numbersensorMetadata">LE_SENSORMETADATA_example:numbersensorMetadata</MenuItem>
                <MenuItem value="EQ_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata">EQ_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata</MenuItem>
                <MenuItem value="GT_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata">GT_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata</MenuItem>
                <MenuItem value="GE_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata">GE_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata</MenuItem>

                

                <MenuItem value="LT_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata">LT_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata</MenuItem>
                <MenuItem value="LE_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata">LE_INNER_SENSORMETADATA_example:inndrsensorMetadata_example:numberinnersensorMetadata</MenuItem>
                <MenuItem value="EQ_SENSORREPORT_example:numbersensorReport">EQ_SENSORREPORT_example:numbersensorReport</MenuItem>
                <MenuItem value="GT_SENSORREPORT_example:numbersensorReport">GT_SENSORREPORT_example:numbersensorReport</MenuItem>
                <MenuItem value="GE_SENSORREPORT_example:numbersensorReport">GE_SENSORREPORT_example:numbersensorReport</MenuItem>
                <MenuItem value="LE_SENSORREPORT_example:numbersensorReport">LE_SENSORREPORT_example:numbersensorReport</MenuItem>
                <MenuItem value="EQ_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport">EQ_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport</MenuItem>
                <MenuItem value="GT_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport">GT_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport</MenuItem>
                <MenuItem value="GE_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport">GE_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport</MenuItem>
                <MenuItem value="LT_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport">LT_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport</MenuItem>
                <MenuItem value="LE_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport">LE_INNER_SENSORREPORT_example:inndrsensorReport_example:numberinnersensorReport</MenuItem>



    
                <MenuItem value="EXISTS_SENSORELEMENT_example:numberSensorElement">EXISTS_SENSORELEMENT_example:numberSensorElement</MenuItem>
                <MenuItem value="EXISTS_SENSORMETADATA_example:numbersensorMetadata">EXISTS_SENSORMETADATA_example:numbersensorMetadata</MenuItem>
                <MenuItem value="EXISTS_SENSORREPORT_example:numbersensorReport">EXISTS_SENSORREPORT_example:numbersensorReport</MenuItem>

  
              </TextField>
              <TextField
                label={queryType} type="text"
                variant="outlined" margin="normal"
                value={queryValue} onChange={(e) => setQueryValue(e.target.value)}
                sx={{ width: '400px' }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleQueryMatch}
                sx={{ width: '250px', marginLeft: '10px', marginTop: '25px' }}
              >
                Add {queryType}
              </Button>
            </div>
          
    </Collapse>

    <div className="response Header-container">
  {headerResponse && (
    <ReactJson
      src={Array.from(headerResponse.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {})}
      theme="monokai"
    />
  )}
</div>

      <div className="response-container">
        {error && <div className="error-message">Error: {error}</div>}
        {response && <ReactJson src={response} theme="monokai" />}
      </div>
    </div>
  );
};

export default QueryPage;