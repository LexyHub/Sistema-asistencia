import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const RegistroError = () => {
  const location = useLocation();
  const message = location.state?.message || 'Error al procesar el registro.';

  return (
    <div className="d-flex justify-content-center align-items-center my-5">
      <Card className="shadow text-center" style={{ maxWidth: '500px' }}>
        <Card.Header className="bg-danger text-white">
          <h4 className="mb-0" style={{ color: '#fff' }}>Error</h4>
        </Card.Header>
        <Card.Body className="py-5">
          <div className="mb-4">
            <FaExclamationTriangle size={60} className="text-danger mb-3" />
            <h5>{message}</h5>
          </div>
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/registro-asistencia" variant="outline-primary">
              Intentar Nuevamente
            </Button>
            <Button as={Link} to="/" variant="primary">
              Ir al Inicio
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegistroError;
