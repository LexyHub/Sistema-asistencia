import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🟢 React App is Working!</h1>
      <p>If you can see this, the React application is loading correctly.</p>
      <p>API URL: {process.env.REACT_APP_API_URL || 'https://api.v2.lexy.cl'}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
    </div>
  );
};

export default TestComponent;
