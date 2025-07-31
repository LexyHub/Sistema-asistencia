import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Alert, Button } from 'react-bootstrap';
import { FaCheck, FaArrowLeft } from 'react-icons/fa';

/**
 * Componente adaptador para manejar las respuestas de Flask que redirigen a "registro_exito.html"
 * Este componente parsea el mensaje de éxito de la respuesta de la API
 */
const ResponseAdapter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtener el mensaje de la respuesta de la API desde state o parámetros
  const message = location?.state?.message || 
                 new URLSearchParams(location.search).get('message') || 
                 'Operación completada correctamente';
  
  // Determinar si es un mensaje de éxito o error
  const isError = location?.state?.isError || location.pathname.includes('error');
  
  // Volver a la página de registro después de un tiempo si es un mensaje de éxito
  useEffect(() => {
    if (!isError) {
      const timer = setTimeout(() => {
        navigate('/registrar-asistencia');
      }, 5000); // Redirigir después de 5 segundos si es éxito
      
      return () => clearTimeout(timer);
    }
  }, [isError, navigate]);
  
  return (
    <div className="d-flex justify-content-center align-items-center my-5">
      <Card className="shadow text-center" style={{ maxWidth: '600px' }}>
        <Card.Header className={isError ? "bg-danger text-white" : "bg-success text-white"}>
          <h4 className="mb-0" style={{ color: '#fff' }}>
            {isError ? 'Error' : <><FaCheck className="me-2" /> Operación Exitosa</>}
          </h4>
        </Card.Header>
        <Card.Body className="py-5">
          <Alert variant={isError ? "danger" : "success"}>
            {message}
          </Alert>
          
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button 
              variant={isError ? "danger" : "success"}
              onClick={() => navigate('/registrar-asistencia')}
            >
              <FaArrowLeft className="me-2" /> 
              Volver al Home
            </Button>
          </div>
          
          {!isError && (
            <div className="mt-3 text-muted">
              <small>Serás redirigido automáticamente en 5 segundos...</small>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResponseAdapter;
