import React, { useState } from 'react';

const QueryInput = ({ onExecute }) => {
  const [query, setQuery] = useState('');

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onExecute(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={query} onChange={handleQueryChange} rows="4" cols="50" />
      <button type="submit">Run Query</button>
    </form>
  );
};

export default QueryInput;
