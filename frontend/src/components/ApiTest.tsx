import React, { useState } from 'react';

export const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint: string) => {
    setLoading(true);
    setResult('Testing...');
    try {
      console.log(`Testing endpoint: http://localhost:9090/api/v1${endpoint}`);
      const response = await fetch(`http://localhost:9090/api/v1${endpoint}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('API test failed:', error);
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid black',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3>API Test</h3>
      <div>
        <button onClick={() => testApi('/health')} disabled={loading}>
          Test Health
        </button>
        <button onClick={() => testApi('/test')} disabled={loading} style={{marginLeft: '5px'}}>
          Test Simple
        </button>
        <button onClick={() => testApi('/countries')} disabled={loading} style={{marginLeft: '5px'}}>
          Test Countries Fixed
        </button>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
          {result}
        </pre>
      </div>
    </div>
  );
};
