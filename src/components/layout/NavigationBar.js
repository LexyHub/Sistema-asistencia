import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserClock, FaSignOutAlt, FaUserShield, FaPen, FaKey, FaSyncAlt } from 'react-icons/fa';
import { getModuleAvailability } from '../../utils/timeUtils';

const NavigationBar = () => {
  const { user, isAdmin, logout, isAuthenticated,cargo } = useAuth();
  const navigate = useNavigate();
  const [moduleAvailability, setModuleAvailability] = useState(getModuleAvailability(isAdmin));

  useEffect(() => {
    const updateAvailability = () => {
      setModuleAvailability(getModuleAvailability(isAdmin));
    };
    updateAvailability();
    const interval = setInterval(updateAvailability, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar
      bg="primary"
      variant="dark"
      expand="lg"
      className="mb-3 py-2 shadow-sm"
      style={{ zIndex: 1050, background: 'linear-gradient(90deg, #3a1c71 0%, #a259e6 100%)' }}
      sticky="top"
    >
      <Container fluid>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center py-1"
          style={{ fontWeight: 600, fontSize: '1.25rem', letterSpacing: '1px' }}
        >
          <img
            src="https://i.ibb.co/bnNqvY5/logo.png"
            alt="Logo Lexy"
            height="40"
            className="d-inline-block align-top me-2"
            style={{ borderRadius: 8, background: '#fff', padding: 2 }}
          />
          <span>Sistema de Asistencia</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto mb-2 mb-lg-0 align-items-center">
            <Nav.Link as={Link} to="/" className="fw-semibold text-white px-3">
              Inicio
            </Nav.Link>
            {isAuthenticated() && (
              <>
                {cargo !== "DT" && (<Nav.Link
                  as={Link}
                  to="/registro-asistencia"
                  className="fw-semibold text-white px-3 d-flex align-items-center"
                  disabled={!moduleAvailability.regular.available}
                >
                  <FaUserClock className="me-2" />
                  <span>Registrar Asistencia</span>
                </Nav.Link>)}
                {cargo === "DT" ? <Nav.Link as={Link} to="/dashboardDT" className="fw-semibold text-white px-3">
                  Dashboard DT
                </Nav.Link>: <Nav.Link as={Link} to="/dashboard" className="fw-semibold text-white px-3">
                  Dashboard
                </Nav.Link>}
                {cargo !== "DT" && (<Nav.Link
                  as={Link}
                  to="/registro-extraordinario"
                  className="fw-semibold text-white px-3 d-flex align-items-center"
                  disabled={!moduleAvailability.extraordinary.available}
                >
                  <FaPen className="me-2" />
                  <span>Registro Extraordinario</span>
                </Nav.Link>)}
                {!isAdmin || cargo == "DT" &&(
                  <Nav.Link as={Link} to="/cambio-contrasena" className="fw-semibold text-white px-3 d-flex align-items-center">
                    <FaKey className="me-2" />
                    <span>Cambio de PIN</span>
                  </Nav.Link>
                )}
                {isAdmin && cargo !== "DT" &&  (
                  <Nav.Link as={Link} to="/cambio-contrasena-admin" className="fw-semibold text-white px-3 d-flex align-items-center">
                    <FaKey className="me-2" />
                    <span>Cambio de PIN</span>
                  </Nav.Link>
                )}
                {isAdmin && cargo !== "DT" &&  (
                  <Nav.Link as={Link} to="/admin-correcciones" className="fw-semibold text-white px-3 d-flex align-items-center">
                    <FaUserShield className="me-2" />
                    <span>Administración</span>
                  </Nav.Link>
                )}
                {isAdmin &&  cargo !== "DT" && (
                  <Nav.Link as={Link} to="/cambiar-estado-empleado" className="fw-semibold text-white px-3 d-flex align-items-center">
                    <FaSyncAlt className="me-2" />
                    <span>Cambiar Estado Empleado</span>
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav className="ms-auto align-items-center">
            {isAuthenticated() ? (
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span
                  className="text-light px-2 py-1 rounded"
                  style={{
                    background: 'rgba(0,0,0,0.10)',
                    fontWeight: 500,
                    fontSize: '1rem',
                    maxWidth: 260,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={user?.name || user?.username || 'Usuario'}
                >
                  Bienvenido, {user?.name || user?.username || 'Usuario'}
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                  style={{ minWidth: 120 }}
                >
                  <FaSignOutAlt className="me-1" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Nav.Link as={Link} to="/login" className="fw-semibold text-white">
                Iniciar Sesión
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
