import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const LoadingWrapper = ({ children }) => {
  const { loading, isSessionValid, logout, user } = useAuth();

  // Solo verificar validez de sesión si el usuario está autenticado
  if (user && typeof isSessionValid === 'function' && !isSessionValid()) {
    return (
      <div className="container mt-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Sesión Expirada</Alert.Heading>
          <p>Su sesión ha expirado por inactividad.</p>
          <hr />
          <button 
            className="btn btn-primary"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
          >
            Iniciar Sesión Nuevamente
          </button>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" className="mb-3">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="text-muted">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default LoadingWrapper;
