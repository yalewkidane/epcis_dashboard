import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Tooltip } from '@mui/material';
import { GlobalStateContext } from '../../GlobalStateContext';  // Import the global state
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimeAgo from 'react-timeago';
import { Typography } from '@mui/material';
//import TransactionData from '../../components/data/TransactionData';
import InputIcon from '@mui/icons-material/Input';
import GradeIcon from '@mui/icons-material/Grade';
import OutputIcon from '@mui/icons-material/Output';
import BatteryCharging80Icon from '@mui/icons-material/BatteryCharging80';
import RedeemIcon from '@mui/icons-material/Redeem';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';

const TimeLineComponent = (props) => {
  const { traceabilityServerIP, traceabilityPort } = useContext(GlobalStateContext); // Access the global state
  const [productId, setProductId] = useState('');
  const [timelineData, setTimelineData] = useState([]);

  const handleSearch = async () => {
    try {
      let url = `http://${traceabilityServerIP}:${traceabilityPort}/traceability/${productId}`;
      
      console.log('Sending query to:', url.toString());

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Fetched data:', data); // Log fetched data to console
      setTimelineData(data); // Assuming the response contains the array of events
    } catch (error) {
      console.error('Error fetching traceability data:', error);
    }
  };

  const typeIcon = {
    commissioning: <GradeIcon />,
    loading: <InputIcon />,
    unloading: <OutputIcon />,
    "DPP:charging": <BatteryCharging80Icon />,
    packing: <RedeemIcon />,
    unpacking: <RedeemIcon />,
    arriving: <DeliveryDiningIcon />,
    departing: <DeliveryDiningIcon />,
    retail_selling: <PointOfSaleIcon />,
    collecting: <RestoreFromTrashIcon />,
    "DPP:recycling": <AutorenewIcon />,
    inspecting: <SearchIcon />, // Add the Search icon for inspecting
    storing: <StorageIcon /> // Add the Storage icon for storing
  };

  const timelineItems = timelineData?.sort((eventA, eventB) => new Date(eventA.eventTime) - new Date(eventB.eventTime)).map((event, index) => (
    <TimelineItem key={index} style={{ width: '100%', margin: '10px', padding: '0px' }}>
      <TimelineOppositeContent color="text.secondary" style={{ fontSize: '10pt' }}>
        {new Date(event.eventTime).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} <br />
        <TimeAgo date={event.eventTime} style={{ fontSize: '7pt' }} />
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot style={{ color: 'black' }}>
          {typeIcon[event.bizStep] || ''}
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      
        <TimelineContent style={{ fontSize: '10pt' }}>
          {event.bizStep} ({event.type})
          <br />
          <span style={{ fontSize: '9pt' }}>
            {event.creator?.mspid}
          </span>
          
          <Tooltip
            title={<pre>{JSON.stringify(event, null, 2)}</pre>}
            arrow
            placement="right"
          >
            <Typography variant="body2"
              sx={{
                color: 'blue', // Change the color as needed
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Event Details
            </Typography>
          </Tooltip>
        </TimelineContent>
      
    </TimelineItem>
  ));

  return (

    //add a title for the TimeLineComponent page
    <>
        <Typography variant="h4" component="h1" gutterBottom> Traceability Time Line Page </Typography>
        
      
      <Typography variant="body1" gutterBottom>
        Enter the Product ID below to check the traceability information in Time Line format.
      </Typography><Box sx={{ padding: '20px', textAlign: 'center' }}>
        <TextField
          label="Product ID"
          variant="outlined"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          sx={{
            marginBottom: '20px',
            width: '600px',
            '& .MuiInputBase-input': {
              fontStyle: 'italic',
              color: 'blue', // Change the color as needed
              fontWeight: 'bold',
            },
          }} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          sx={{ marginLeft: '10px', marginTop: '10px' }}
        >
          Search Traceability
        </Button>
        <Timeline position="alternate">{timelineItems}</Timeline>
      </Box></>
    
  );
};

export default TimeLineComponent;