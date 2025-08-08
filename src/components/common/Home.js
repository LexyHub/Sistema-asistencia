import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserClock, FaClipboardList, FaPen, FaUserShield, FaUserLock, FaKey, FaSyncAlt } from 'react-icons/fa';
import { getModuleAvailability } from '../../utils/timeUtils';


const Home = () => {
  const { isAuthenticated, isAdmin, user, cargo } = useAuth();
  const [moduleAvailability, setModuleAvailability] = useState(getModuleAvailability(isAdmin));
  const navigate = useNavigate();

  useEffect(() => {
    const updateAvailability = () => {
      setModuleAvailability(getModuleAvailability(isAdmin));
    };
    updateAvailability();
    const interval = setInterval(updateAvailability, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleEditarContrasena = () => {
    if (isAdmin) {
      navigate('/cambio-contrasena-admin');
    } else {
      navigate('/cambio-contrasena');
    }
  };

  // Definir las cards principales
  const cards = [
    {
      key: 'asistencia',
      show: cargo !== "DT",
      content: (
        <Card className={`h-100 shadow-sm hover-card ${!isAuthenticated() || !moduleAvailability.regular.available || cargo == "DT" ? 'card-disabled' : ''}`}>
          <Card.Body className="text-center p-4 d-flex flex-column">
            <div className="mb-3">
              <FaUserClock size={50} className={`${!isAuthenticated() || !moduleAvailability.regular.available ? 'text-muted' : 'text-primary'}`} />
            </div>
            <Card.Title className={!isAuthenticated() || !moduleAvailability.regular.available ? 'text-muted' : ''}>Registrar Asistencia</Card.Title>
            <Card.Text className={!isAuthenticated() || !moduleAvailability.regular.available ? 'text-muted' : ''}>
              Registre su entrada o salida diaria con un proceso simple y rápido.
              {!moduleAvailability.regular.available && isAuthenticated() && (
                <small className="d-block mt-2 text-danger">
                  Disponible solo entre 8:45 - 9:30 AM y 18:00 - 19:30 PM
                </small>
              )}
            </Card.Text>
            <div className="mt-auto">
              <Button
                as={Link}
                to="/registro-asistencia"
                variant="light"
                style={{
                  background: 'linear-gradient(90deg, #3a1c71 0%, #5f51e8 100%)',
                  color: '#fff',
                  border: 'none'
                }}
                className="w-100 fw-semibold"
                disabled={!isAuthenticated() || !moduleAvailability.regular.available}
              >
                Registrar
              </Button>
            </div>
          </Card.Body>
        </Card>
      )
    },
    {
      key: 'dashboard',
      show: true,
      content: (
        <Card className={`h-100 shadow-sm hover-card ${!isAuthenticated() ? 'card-disabled' : ''}`}>
          <Card.Body className="text-center p-4 d-flex flex-column">
            <div className="mb-3">
              <FaClipboardList size={50} className={`${!isAuthenticated() ? 'text-muted' : 'text-info'}`} />
            </div>
            <Card.Title className={!isAuthenticated() ? 'text-muted' : ''}>Ver Registros</Card.Title>
            <Card.Text className={!isAuthenticated() ? 'text-muted' : ''}>
              Consulte los registros de asistencia y exportelos en diferentes formatos.
            </Card.Text>
            <div className="mt-auto">
              <Button
                as={Link}
                to={cargo == "DT" ? "/dashboardDT" : "/dashboard"}
                variant="light"
                style={{
                  background: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
                  color: '#fff',
                  border: 'none'
                }}
                className="w-100 fw-semibold"
                disabled={!isAuthenticated()}
              >
                Ver Dashboard
              </Button>
            </div>
          </Card.Body>
        </Card>
      )
    },
    {
      key: 'extraordinario',
      show: cargo !== "DT",
      content: (
        <Card className={`h-100 shadow-sm hover-card ${!isAuthenticated() || !moduleAvailability.extraordinary.available || cargo === "DT" ? 'card-disabled' : ''}`}>
          <Card.Body className="text-center p-4 d-flex flex-column">
            <div className="mb-3">
              <FaPen size={50} className={`${!isAuthenticated() || !moduleAvailability.extraordinary.available ? 'text-muted' : 'text-warning'}`} />
            </div>
            <Card.Title className={!isAuthenticated() || !moduleAvailability.extraordinary.available ? 'text-muted' : ''}>Registro Extraordinario</Card.Title>
            <Card.Text className={!isAuthenticated() || !moduleAvailability.extraordinary.available ? 'text-muted' : ''}>
              Solicite registros de asistencia en fechas anteriores o por casos especiales.
              {!moduleAvailability.extraordinary.available && isAuthenticated() && (
                <small className="d-block mt-2 text-danger">
                  No disponible entre 8:00 - 9:30 AM y 18:00 - 19:30 PM
                </small>
              )}
            </Card.Text>
            <div className="mt-auto">
              <Button
                as={Link}
                to="/registro-extraordinario"
                variant="light"
                style={{
                  background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
                  color: '#fff',
                  border: 'none'
                }}
                className="w-100 fw-semibold"
                disabled={!isAuthenticated() || !moduleAvailability.extraordinary.available}
              >
                Registrar
              </Button>
            </div>
          </Card.Body>
        </Card>
      )
    },
    {
      key: 'admin',
      show: isAdmin && cargo !== "DT",
      content: (
        <Card className={`h-100 shadow-sm hover-card ${!isAuthenticated() || cargo === "DT" ? 'card-disabled' : ''}`}>
          <Card.Body className="text-center p-4 d-flex flex-column">
            <div className="mb-3">
              <FaUserShield size={50} className={`${!isAuthenticated() ? 'text-muted' : 'text-danger'}`} />
            </div>
            <Card.Title className={!isAuthenticated() ? 'text-muted' : ''}>Administración</Card.Title>
            <Card.Text className={!isAuthenticated() ? 'text-muted' : ''}>
              Gestione solicitudes de corrección y administre los registros de asistencia.
            </Card.Text>
            <div className="mt-auto">
              <Button
                as={Link}
                to="/admin-correcciones"
                variant="light"
                style={{
                  background: 'linear-gradient(90deg,rgb(194, 30, 27) 0%,rgb(240, 128, 126) 100%)',
                  color: '#fff',
                  border: 'none'
                }}
                className="w-100 fw-semibold"
                disabled={!isAuthenticated()}
              >
                Administrar
              </Button>
            </div>
          </Card.Body>
        </Card>
      )
    },
    {
      key: 'editar-contrasena',
      show: true,
      content: (
        <Card className={`h-100 shadow-sm hover-card ${!isAuthenticated() ? 'card-disabled' : ''}`}>
          <Card.Body className="text-center p-4 d-flex flex-column">
            <div className="mb-3">
              <FaKey size={50} className="text-success" />
            </div>
            <Card.Title className="mb-2">
              Editar contraseña
            </Card.Title>
            <Card.Text className="mb-4">
              Realizar cambio de contraseña para ingresar a la plataforma
            </Card.Text>
            <div className="mt-auto">
              <Button
                variant="light"
                style={{
                  background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
                  color: '#fff',
                  border: 'none'
                }}
                className="fw-semibold w-100"
                onClick={handleEditarContrasena}
                disabled={!isAuthenticated()}
              >
                Ir a cambio de contraseña
              </Button>
            </div>
          </Card.Body>
        </Card>
      )
    },
    {
      key: 'cambiar-estado-empleado',
      show: isAdmin && cargo !== "DT",
      content: (
        <Card className={`h-100 shadow-sm hover-card ${!isAuthenticated() || cargo === "DT" ? 'card-disabled' : ''}`}>
          <Card.Body className="text-center p-4 d-flex flex-column">
            <div className="mb-3">
              <FaSyncAlt size={50} className={`${!isAuthenticated() ? 'text-muted' : ''}`} style={{ color: '#a259e6' }} />
            </div>
            <Card.Title className={!isAuthenticated() ? 'text-muted' : ''} style={{ color: '#a259e6' }}>
              Cambiar Estado Empleado
            </Card.Title>
            <Card.Text className={!isAuthenticated() ? 'text-muted' : ''}>
              Cambia el estado de los colaboradores entre Activo e Inactivo.
            </Card.Text>
            <div className="mt-auto">
              <Button
                as={Link}
                to="/cambiar-estado-empleado"
                variant="light"
                style={{
                  background: 'linear-gradient(90deg, #3a1c71 0%, #a259e6 100%)',
                  color: '#fff',
                  border: 'none'
                }}
                className="fw-semibold w-100"
                disabled={!isAuthenticated()}
              >
                Ir a Cambiar Estado
              </Button>
            </div>
          </Card.Body>
        </Card>
      )
    }
  ];

  // Filtrar las cards a mostrar
  const visibleCards = cards.filter(card => card.show);

  // Agrupar las cards en filas de 3 columnas
  const cardRows = [];
  for (let i = 0; i < visibleCards.length; i += 3) {
    cardRows.push(visibleCards.slice(i, i + 3));
  }

  return (
    <div className="mb-4">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Sistema de Control de Asistencia Lexy</h1>
        <p className="lead">
          Recuerda Marcar tu Entrada y Salida.
        </p>
      </div>
      {cardRows.map((row, idx) => (
        <Row className="justify-content-center" key={idx}>
          {row.map(card => (
            <Col
              key={card.key}
              xs={12}
              sm={10}
              md={4}
              lg={4}
              className="mb-4 d-flex"
            >
              <div className="w-100 card-uniform-size d-flex">{card.content}</div>
            </Col>
          ))}
        </Row>
      ))}
      {!isAuthenticated() && (
        <div className="text-center mt-5 p-4 bg-light rounded shadow-sm">
          <h4 className="text-primary mb-3">
            <FaUserLock className="me-2" />
            Acceso Requerido
          </h4>
          <p className="lead text-dark mb-4">
            Debe iniciar sesión para acceder a las funcionalidades del sistema.
          </p>
          <Button as={Link} to="/login" variant="primary" size="lg">
            Iniciar Sesión
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
