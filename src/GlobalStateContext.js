import React, { createContext, useState } from 'react';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [epcisServerIP, setEpcisServerIP] = useState('');
  const [epcisPort, setEpcisPort] = useState('');
  const [traceabilityServerIP, setTraceabilityServerIP] = useState('');
  const [traceabilityPort, setTraceabilityPort] = useState('');
  const [hashGeneratorServerIP, setHashGeneratorServerIP] = useState('');
  const [hashGeneratorPort, setHashGeneratorPort] = useState('');
  const [hashGeneratorAlg, setHashGeneratorAlg] = useState('');

  return (
    <GlobalStateContext.Provider value={{ epcisServerIP, setEpcisServerIP, epcisPort, setEpcisPort, 
                                          traceabilityServerIP, setTraceabilityServerIP, traceabilityPort, setTraceabilityPort,
                                          hashGeneratorServerIP, setHashGeneratorServerIP, hashGeneratorPort, setHashGeneratorPort,hashGeneratorAlg, setHashGeneratorAlg }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

