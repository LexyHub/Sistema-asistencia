import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import AttendanceService from '../../services/attendanceService';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { getModuleAvailability } from '../../utils/timeUtils';
import Select from 'react-select';

// Validation schema for the form
const validationSchema = Yup.object().shape({
  person_id: Yup.string().required('Debe seleccionar un empleado'),
  tipo_registro: Yup.string().required('Debe seleccionar el tipo de registro'),
  //pin: Yup.string().required('Debe ingresar su PIN')
});

const RegistroAsistenciaForm = () => {
  const [empleados, setEmpleados] = useState([]);
  const [latestDate, setLatestDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useNotification();

  // Redirección basada en disponibilidad horaria
  useEffect(() => {
    if (isRedirecting) return; // Evitar ejecuciones múltiples

    const availability = getModuleAvailability(isAdmin);
    if (!availability.regular.available && !isAdmin) { // Solo redirigir si no es admin
      setIsRedirecting(true); // Marcar que la redirección está en proceso
      error('El módulo de registro de asistencia no está disponible en este horario.');
      navigate('/');
    }
  }, [isAdmin, navigate, error, isRedirecting]);  // Memoize fetchEmpleados to avoid dependency issues
  const fetchEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AttendanceService.getEmployees();
      let empleadosList = data.empleados || [];

      // Si no es admin, filtrar solo el empleado actual
      if (!isAdmin && user) {
        empleadosList = empleadosList.filter(emp => emp.person_id.toString() === user.id.toString());
      }

      setEmpleados(empleadosList);
      setLatestDate(data.latest_date);
    } catch (err) {
      error('Error al cargar la lista de empleados');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [error, isAdmin, user]);

  useEffect(() => {
    // Si ya se está redirigiendo o no es admin y no está disponible, no cargar empleados
    if (isRedirecting || (!getModuleAvailability(isAdmin).regular.available && !isAdmin)) {
      setLoading(false);
      return;
    }

    fetchEmpleados();

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [fetchEmpleados, isAdmin, isRedirecting]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await AttendanceService.registerAttendance(values);
      // Muestra el mensaje del backend si existe, si no, usa el mensaje por defecto
      success(response?.message || `Registro de ${values.tipo_registro} guardado exitosamente`);
      resetForm();
      navigate('/registro-exito');
    } catch (err) {
      // Intenta mostrar el mensaje del backend si existe
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Error al guardar el registro de asistencia';
      error(backendMsg);
      console.error('Error submitting attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
      <Card.Header className="bg-primary text-white"
        style={{
          background: 'linear-gradient(90deg,#3a1c71 0%, #a259e6 100%)',
          color: '#fff',
          borderBottom: 'none'
        }}>
        <h4 className="mb-0" style={{ color: '#fff' }}>Registro de Asistencia</h4>
      </Card.Header>
      <Card.Body>
        {empleados.length === 0 ? (
          <div className="text-center py-4">
            <p className="mb-0">No hay empleados disponibles para registrar asistencia.</p>
            {latestDate && (
              <small className="text-muted">
                Última actualización de empleados: {new Date(latestDate).toLocaleDateString()}
              </small>
            )}
          </div>
        ) : (
          <>
            <Row className="mb-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center">
                  <p className="mb-0">
                    <strong>Fecha:</strong> {currentTime.toLocaleDateString()}
                  </p>
                  <p className="mb-0">
                    <strong>Hora:</strong> {currentTime.toLocaleTimeString()}
                  </p>
                </div>
                {/* {latestDate && (
                  <small className="text-muted">
                    Empleados actualizados el: {new Date(latestDate).toLocaleDateString()}
                  </small>
                )} */}
              </Col>
            </Row>            <Formik
              initialValues={{
                person_id: !isAdmin && user ? user.id.toString() : '',
                tipo_registro: '',
                pin: !isAdmin && user ? user.id.toString() : '',
                origen_registro: 'normal'
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                setFieldValue
              }) => (
                <Form onSubmit={handleSubmit}>
                  {isAdmin ? (
                    <Form.Group className="mb-3">
                      <Form.Label>Seleccione Empleado</Form.Label>
                      <Select
                        name="person_id"
                        value={empleados.find(e => e.person_id.toString() === values.person_id) || null}
                        onChange={option => setFieldValue('person_id', option ? option.person_id.toString() : '')}
                        options={empleados}
                        getOptionLabel={e => `${e.nombre_colaborador} - ${e.rut_colaborador}`}
                        getOptionValue={e => e.person_id.toString()}
                        placeholder="Buscar y seleccionar empleado..."
                        isClearable
                        className={touched.person_id && errors.person_id ? 'is-invalid' : ''}
                        onBlur={handleBlur}
                      />
                      {touched.person_id && errors.person_id && (
                        <div className="text-danger small mt-1">{errors.person_id}</div>
                      )}
                    </Form.Group>
                  ) : (
                    <Form.Group className="mb-3">
                      <Form.Label>Empleado</Form.Label>
                      <Form.Control
                        type="text"
                        value={user?.name || 'Usuario'}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Registrando asistencia para: {user?.name}
                      </Form.Text>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Registro</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        id="entrada"
                        name="tipo_registro"
                        value="entrada"
                        label={
                          <span>
                            <FaUserCheck className="text-success me-1" /> Entrada
                          </span>
                        }
                        checked={values.tipo_registro === 'entrada'}
                        onChange={handleChange}
                        isInvalid={touched.tipo_registro && !!errors.tipo_registro}
                      />
                      <Form.Check
                        type="radio"
                        id="salida"
                        name="tipo_registro"
                        value="salida"
                        label={
                          <span>
                            <FaUserTimes className="text-danger me-1" /> Salida
                          </span>
                        }
                        checked={values.tipo_registro === 'salida'}
                        onChange={handleChange}
                        isInvalid={touched.tipo_registro && !!errors.tipo_registro}
                      />
                    </div>
                    {touched.tipo_registro && errors.tipo_registro && (
                      <div className="text-danger small mt-1">{errors.tipo_registro}</div>
                    )}
                  </Form.Group>
                  {/* <Form.Group className="mb-3">
                    <Form.Label>PIN {!isAdmin ? '(su PIN personal)' : '(mismo que su ID de persona)'}</Form.Label>
                    <Form.Control
                      type="password"
                      name="pin"
                      placeholder={!isAdmin ? "Su PIN personal" : "Ingrese su PIN"}
                      value={values.pin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.pin && !!errors.pin}
                      disabled={!isAdmin}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.pin}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {!isAdmin ? 'Su PIN se ha configurado automáticamente' : 'El PIN es el mismo número que su ID de persona'}
                    </Form.Text>
                  </Form.Group> */}

                  <div className="d-grid gap-2">
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Procesando...
                        </>
                      ) : (
                        'Registrar Asistencia'
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default RegistroAsistenciaForm;
