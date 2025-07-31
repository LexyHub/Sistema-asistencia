import React from 'react';
import { Card, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Debug component to help diagnose application issues
 * Only shows in development environment
 */
const DebugPanel = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mt-3 border-warning">
      <Card.Header className="bg-warning text-dark">
        <small>🐛 Debug Panel (Development Only)</small>
      </Card.Header>
      <Card.Body className="py-2">
        <div className="row text-small">
          <div className="col-md-4">
            <strong>Authentication:</strong> 
            <Badge bg={isAuthenticated() ? 'success' : 'danger'} className="ms-1">
              {isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </div>
          <div className="col-md-4">
            <strong>User:</strong> 
            {user ? (
              <span className="ms-1">
                {user.name || user.username || 'Unknown'} 
                {isAdmin && <Badge bg="info" className="ms-1">Admin</Badge>}
              </span>
            ) : (
              <Badge bg="secondary" className="ms-1">No User</Badge>
            )}
          </div>
          <div className="col-md-4">
            <strong>Environment:</strong> 
            <Badge bg="info" className="ms-1">{process.env.NODE_ENV}</Badge>
          </div>
        </div>
        <div className="row mt-2 text-small">
          <div className="col-12">
            <strong>API URL:</strong> 
            <code className="ms-1">{process.env.REACT_APP_API_URL}</code>
          </div>
        </div>
        {user && (
          <div className="row mt-2 text-small">
            <div className="col-12">
              <strong>User Object:</strong>
              <details className="mt-1">
                <summary>Click to expand</summary>
                <pre className="bg-light p-2 mt-1" style={{ fontSize: '0.8rem', maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(user, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DebugPanel;
