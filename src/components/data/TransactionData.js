import React from 'react';
//import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
//import { useTransaction } from '../../services/traceability';
//import Tooltip from '@mui/material/Tooltip';
//import TransactionDetailModal from '../TransactionDetailModal';

const TransactionData = ({ transactionId, event }) => {
    return (
      <div>
        <h3>Transaction ID: {transactionId}</h3>
        <p>Event Type: {event.type}</p>
        <p>Event Time: {new Date(event.eventTime).toLocaleString()}</p>
        {/* Add more details as needed */}
      </div>
    );
  };

export default TransactionData;
