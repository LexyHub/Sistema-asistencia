import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const RegistroExito = () => {
  const location = useLocation();
  const message = location.state?.message || 'Registro guardado exitosamente.';

  return (
    <div className="d-flex justify-content-center align-items-center my-5">
      <Card className="shadow text-center" style={{ maxWidth: '500px' }}>
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0" style={{ color: '#fff' }}>Operación Exitosa</h4>
        </Card.Header>
        <Card.Body className="py-5">
          <div className="mb-4">
            <FaCheckCircle size={60} className="text-success mb-3" />
            <h5>{message}</h5>
          </div>
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/registro-asistencia" variant="outline-primary">
              Nuevo Registro
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

export default RegistroExito;
