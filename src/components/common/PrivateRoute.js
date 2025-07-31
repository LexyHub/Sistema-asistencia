import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Button } from 'react-bootstrap';

const PrivateRoute = ({ children, requiresAdmin = false, allowedRoles = [] }) => {
  const { isAuthenticated, isAdmin, user, isSessionValid, logout } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to the login page, but save the current location they were
    // trying to go to so we can send them there after login
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Check session validity for authenticated users
  if (user && typeof isSessionValid === 'function' && !isSessionValid()) {
    // Automatically logout and redirect to login
    logout();
    return <Navigate to="/login" state={{ from: location, sessionExpired: true }} />;
  }

  // If this route requires admin role and user is not admin
  if (requiresAdmin && !isAdmin) {
    return (
      <div className="container mt-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Acceso Denegado</Alert.Heading>
          <p>No tiene permisos suficientes para acceder a esta página.</p>
          <hr />
          <p className="mb-0">
            Esta funcionalidad requiere privilegios de administrador.
          </p>
          <div className="mt-3">
            <Button variant="primary" onClick={() => window.history.back()}>
              Volver
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Check for specific allowed roles (if provided)
  if (allowedRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasAllowedRole = allowedRoles.some(role => 
      userRoles.includes(role) || (role === 'admin' && isAdmin)
    );
    
    if (!hasAllowedRole) {
      return (
        <div className="container mt-5">
          <Alert variant="warning" className="text-center">
            <Alert.Heading>Acceso Restringido</Alert.Heading>
            <p>Su rol actual no le permite acceder a esta funcionalidad.</p>
            <hr />
            <p className="mb-0">
              Roles requeridos: {allowedRoles.join(', ')}
            </p>
            <div className="mt-3">
              <Button variant="primary" onClick={() => window.history.back()}>
                Volver
              </Button>
            </div>
          </Alert>
        </div>
      );
    }
  }

  // If authenticated (and has required role if applicable), render the component
  return children;
};

export default PrivateRoute;
