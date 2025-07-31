import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { Card, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';; // Asegúrate de tener este import y el helper api configurado


const CambiarEstadoEmpleado = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // Cambia a objeto para react-select
  const [estado, setEstado] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const { success, error: notifyError } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoadingUsuarios(true);
      setError('');
      try {
        const res = await fetch('https://api.v2.lexy.cl/listado-total-empleados');
        const data = await res.json();

        // Si la respuesta es { empleados: [...] }
        const empleados = Array.isArray(data.empleados) ? data.empleados : [];

        // Map para usuarios únicos por rut, incluyendo estatus y person_id
        const usuariosMap = new Map();
        empleados.forEach(reg => {
          if (reg.rut_colaborador && reg.nombre_colaborador) {
            usuariosMap.set(reg.rut_colaborador, {
              rut: reg.rut_colaborador,
              nombre: reg.nombre_colaborador,
              estatus: reg.estatus || '',
              person_id: reg.person_id // <-- agrega person_id aquí
            });
          }
        });

        const usuariosUnicos = Array.from(usuariosMap.values());
        setUsuarios(usuariosUnicos);
      } catch (err) {
        setError('Error al cargar los usuarios');
        setUsuarios([]);
      } finally {
        setLoadingUsuarios(false);
      }
    };
    fetchUsuarios();
  }, []);

  // Si el usuario no es admin, no mostrar nada
  if (!user?.isAdmin) return null;

  const handleActualizarEstado = () => {
    if (!usuarioSeleccionado) {
      setError('Debe seleccionar un usuario');
      return;
    }
    setShowModal(true);
  };

  const handleConfirmarCambio = async () => {
    setUpdating(true);
    setError('');
    try {
      const usuario = usuarios.find(u => u.rut === usuarioSeleccionado.rut);
      if (!usuario || !usuario.person_id) {
        setError('No se pudo obtener el ID del usuario seleccionado.');
        setUpdating(false);
        return;
      }

      const user_id = usuario.person_id;
      const accion = estado ? "activo" : "inactivo";
      const payload = {
        accion,
        admin_pin: adminPin,
        user_id,
        rut_admin: user?.rut || user?.username
      };

      const res = await api.post('/activar-desactivar-status', payload);

      if (res.data && res.data.success) {
        success('Estado actualizado correctamente');
        setShowModal(false);
        setAdminPin('');
        navigate('/registro-exito'); 
      } else {
        setError(res.data?.error || 'Error al actualizar el estado');
      }
    } catch (err) {
      // Si el error viene del backend, muestra el mensaje
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Error de conexión con el servidor');
      }
    } finally {
      setUpdating(false);
    }
  };

  const usuarioActual = usuarios.find(u => u.rut === usuarioSeleccionado?.rut);
      // Animación de carga igual a RegistroExtraordinario
      if (loadingUsuarios) {
          return (
              <div className="text-center my-5">
                  <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                  <p className="mt-2">Cargando listado de empleados...</p>
              </div>
          );
      }

  return (
    <Card className="shadow-sm">
      <Card.Header
        style={{
          background: 'linear-gradient(90deg,#3a1c71 0%, #a259e6 100%)',
          color: '#fff',
          borderBottom: 'none'
        }}
      >
        <h4 className="mb-0" style={{ color: '#fff' }}>
          Cambiar Estado de Empleado
        </h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            <Select
              name="usuario"
              value={usuarioSeleccionado}
              onChange={option => setUsuarioSeleccionado(option)}
              options={usuarios}
              getOptionLabel={u => `${u.nombre} - ${u.rut} - ${u.estatus}`}
              getOptionValue={u => u.rut}
              placeholder="Buscar y seleccionar usuario..."
              isClearable
              isDisabled={loadingUsuarios}
              className={error ? 'is-invalid' : ''}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                id="estado-activo"
                name="estado"
                value="activo"
                label={
                  <span>
                    <FaUserCheck className="text-success me-1" /> Activo
                  </span>
                }
                checked={estado === true}
                onChange={() => setEstado(true)}
              />
              <Form.Check
                type="radio"
                id="estado-inactivo"
                name="estado"
                value="inactivo"
                label={
                  <span>
                    <FaUserTimes className="text-danger me-1" /> Inactivo
                  </span>
                }
                checked={estado === false}
                onChange={() => setEstado(false)}
              />
            </div>
          </Form.Group>
          <Button
            variant="primary"
            onClick={handleActualizarEstado}
            disabled={loadingUsuarios || !usuarioSeleccionado}
          >
            Actualizar Estado
          </Button>
        </Form>
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Cambio de Estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Ingrese PIN de Administrador</Form.Label>
            <Form.Control
              type="password"
              value={adminPin}
              onChange={e => setAdminPin(e.target.value)}
              autoFocus
            />
          </Form.Group>
          {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={updating}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmarCambio} disabled={updating || !adminPin}>
            {updating ? <Spinner animation="border" size="sm" /> : 'Confirmar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default CambiarEstadoEmpleado;

// Cambia donde usas usuarioSeleccionado.rut o usuarioSeleccionado.person_id según corresponda