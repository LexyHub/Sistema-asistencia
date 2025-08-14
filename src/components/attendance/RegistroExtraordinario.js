import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AttendanceService from '../../services/attendanceService';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserClock, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { getModuleAvailability } from '../../utils/timeUtils';
import Select from 'react-select';

// Validation schema for the form
const validationSchema = Yup.object().shape({
  person_id: Yup.string().required('Debe seleccionar un empleado'),
  tipo_registro: Yup.string()
    .required('Debe seleccionar el tipo de registro')
    .oneOf(['entrada', 'salida'], 'Tipo de registro inválido'), fecha_registro: Yup.string()
      .required('Debe seleccionar una fecha')
      .test('no-future-date', 'No se pueden registrar fechas futuras', function (value) {
        if (!value) return true;
        // Comparar directamente las fechas como strings YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        return value <= today;
      })
      .test('not-too-old', 'No se pueden registrar fechas con más de 30 días de antigüedad', function (value) {
        if (!value) return true;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return value >= thirtyDaysAgo;
      }),
  hora_registro: Yup.string()
    .required('Debe seleccionar una hora')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  motivo_solicitud: Yup.string()
    .required('Debe ingresar un motivo para el registro extraordinario')
    .min(10, 'El motivo debe tener al menos 10 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
  // pin: Yup.string()
  //   .required('Debe ingresar su PIN')
  //   .matches(/^\d+$/, 'El PIN debe contener solo números')
});

// Define the component with a named function to ensure proper export
function RegistroExtraordinario() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatingConflicts, setValidatingConflicts] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [filtroEmpleado, setFiltroEmpleado] = useState('');
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useNotification();

  // Redirección basada en disponibilidad horaria
  useEffect(() => {
    if (isRedirecting) return; // Evitar ejecuciones múltiples

    const availability = getModuleAvailability(isAdmin);
    if (!availability.extraordinary.available && !isAdmin) { // Solo redirigir si no es admin
      setIsRedirecting(true); // Marcar que la redirección está en proceso
      error('El módulo de registro extraordinario no está disponible en este horario.');
      navigate('/');
    }
  }, [isAdmin, navigate, error, isRedirecting]);

  // Función para validar conflictos de registros
  const validateConflicts = async (personId, fecha, tipoRegistro) => {
    try {
      setValidatingConflicts(true);
      const existingRecords = await AttendanceService.getAttendanceData({
        person_id: personId,
        start_date: fecha,
        end_date: fecha,
        search: personId
      });

      const dayRecords = existingRecords.records || [];

      // Verificar si ya existe un registro del mismo tipo para la fecha
      const conflictingRecord = dayRecords.find(record =>
        record.tipo_registro === tipoRegistro &&
        record.fecha === fecha && record.origen_registro !== "Rechazado por Administrador"
      );

      if (conflictingRecord) {
        throw new Error(`Ya existe un registro de ${tipoRegistro} para esta fecha`);
      }

      // Validar lógica de entrada/salida
      if (tipoRegistro === 'salida') {
        const hasEntry = dayRecords.some(record => record.tipo_registro === 'entrada');
        if (!hasEntry) {
          throw new Error('No se puede registrar una salida sin una entrada previa');
        }
      }

      return true;
    } catch (error) {
      throw error;
    } finally {
      setValidatingConflicts(false);
    }
  };  // Memoize fetchEmpleados to avoid dependency issues
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
    } catch (err) {
      error('Error al cargar la lista de empleados');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [error, isAdmin, user]);

  useEffect(() => {
    // Si ya se está redirigiendo o no es admin y no está disponible, no cargar empleados
    if (isRedirecting || (!getModuleAvailability(isAdmin).extraordinary.available && !isAdmin)) {
      setLoading(false);
      return;
    }
    fetchEmpleados();
  }, [fetchEmpleados, isAdmin, isRedirecting]); const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
    try {
      // Validar conflictos antes de enviar
      await validateConflicts(values.person_id, values.fecha_registro, values.tipo_registro);

      // Log para depuración
      console.log('Empleados disponibles:', empleados);
      console.log('Person ID seleccionado:', values.person_id);

      // Obtener el rut_colaborador del empleado seleccionado - con conversión explícita a string para comparación
      const empleadoSeleccionado = empleados.find(e => String(e.person_id) === String(values.person_id));
      if (!empleadoSeleccionado) {
        console.error('No se encontró el empleado con ID:', values.person_id);
        throw new Error('Empleado no encontrado. Verifique la selección e intente de nuevo.');
      }

      console.log('Empleado encontrado:', empleadoSeleccionado);
      // Preparar los datos incluyendo el rut_colaborador requerido por el backend
      const datosParaEnviar = {
        rut_colaborador: empleadoSeleccionado.rut_colaborador,
        tipo_registro: values.tipo_registro,
        fecha_registro: values.fecha_registro,
        hora_registro: values.hora_registro,
        search: values.person_id,
        motivo: values.motivo_solicitud, // El backend espera 'motivo', no 'motivo_solicitud'
        pin: values.pin
      };

      console.log('Datos a enviar al service:', datosParaEnviar);

      await AttendanceService.registerExtraordinaryAttendance(datosParaEnviar);
      success('Solicitud de registro extraordinario enviada exitosamente');
      resetForm();
      navigate('/registro-exito', {
        state: {
          message: 'Solicitud de registro extraordinario enviada exitosamente. Espere la aprobación.'
        }
      });
    } catch (err) {
      console.error('Error submitting extraordinary attendance:', err);

      // Manejar errores específicos
      if (err.message.includes('Ya existe un registro')) {
        setFieldError('fecha_registro', err.message);
        setFieldError('tipo_registro', err.message);
      } else if (err.message.includes('entrada previa')) {
        setFieldError('tipo_registro', err.message);
      } else {
        error(err.message || 'Error al enviar la solicitud de registro extraordinario');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const empleadosFiltrados = empleados.filter(empleado =>
    `${empleado.nombre_colaborador} - ${empleado.rut_colaborador}`
      .toLowerCase()
      .includes(filtroEmpleado.toLowerCase())
  );

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
        <h4 className="mb-0" style={{ color: '#fff' }}>
          <FaUserClock className="me-2" />
          Registro Extraordinario de Asistencia
        </h4>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          Utilice este formulario para solicitar el registro de asistencia en fechas u horarios pasados.
          Su solicitud será revisada por un administrador para su aprobación.
        </p>        <Formik
          initialValues={{
            person_id: !isAdmin && user ? user.id.toString() : '',
            tipo_registro: '',
            fecha_registro: '',
            hora_registro: '',
            motivo_solicitud: '',
            search: !isAdmin && user ? user.id.toString() : '',
            pin: !isAdmin && user ? user.id.toString() : ''
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
          }) => (<Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                {isAdmin ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Seleccione Empleado</Form.Label>
                    <Select
                      name="person_id"
                      value={empleadosFiltrados.find(e => e.person_id === values.person_id) || null}
                      onChange={option => setFieldValue('person_id', option ? option.person_id : '')}
                      options={empleadosFiltrados}
                      getOptionLabel={e => `${e.nombre_colaborador} - ${e.rut_colaborador}`}
                      getOptionValue={e => e.person_id}
                      placeholder="Buscar y seleccionar empleado..."
                      isClearable
                      className={touched.person_id && errors.person_id ? 'is-invalid' : ''}
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
                      Solicitando registro extraordinario para: {user?.name}
                    </Form.Text>
                  </Form.Group>
                )}
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Registro</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="entrada-extraordinario"
                      name="tipo_registro"
                      value="entrada"
                      label="Entrada"
                      checked={values.tipo_registro === 'entrada'}
                      onChange={handleChange}
                      isInvalid={touched.tipo_registro && !!errors.tipo_registro}
                    />
                    <Form.Check
                      type="radio"
                      id="salida-extraordinario"
                      name="tipo_registro"
                      value="salida"
                      label="Salida"
                      checked={values.tipo_registro === 'salida'}
                      onChange={handleChange}
                      isInvalid={touched.tipo_registro && !!errors.tipo_registro}
                    />
                  </div>
                  {touched.tipo_registro && errors.tipo_registro && (
                    <div className="text-danger small mt-1">{errors.tipo_registro}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaCalendarAlt className="me-1" /> Fecha
                  </Form.Label>
                  <div>                      <DatePicker
                    selected={values.fecha_registro ? new Date(values.fecha_registro + 'T12:00:00') : null}
                    onChange={(date) => {
                      if (date) {
                        // Formatear la fecha manualmente para evitar problemas de zona horaria
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFieldValue('fecha_registro', `${year}-${month}-${day}`);
                      } else {
                        setFieldValue('fecha_registro', '');
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    className={`form-control ${touched.fecha_registro && errors.fecha_registro ? 'is-invalid' : ''}`}
                    placeholderText="Seleccione fecha"
                    maxDate={new Date()}
                    minDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                  />
                  </div>
                  {touched.fecha_registro && errors.fecha_registro && (
                    <div className="text-danger small mt-1">{errors.fecha_registro}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaClock className="me-1" /> Hora
                  </Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_registro"
                    value={values.hora_registro}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.hora_registro && !!errors.hora_registro}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.hora_registro}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Motivo del Registro Extraordinario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="motivo_solicitud"
                placeholder="Explique el motivo por el que realiza este registro extraordinario"
                value={values.motivo_solicitud}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.motivo_solicitud && !!errors.motivo_solicitud}
              />
              <Form.Control.Feedback type="invalid">
                {errors.motivo_solicitud}
              </Form.Control.Feedback>
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
                    Enviando solicitud...
                  </>
                ) : (
                  'Enviar Solicitud'
                )}
              </Button>
            </div>
          </Form>
          )}
        </Formik>
      </Card.Body>
      <Card.Footer className="bg-light">
        <small className="text-muted">
          Nota: Los registros extraordinarios requieren aprobación administrativa antes de ser registrados en el sistema.
        </small>
      </Card.Footer>
    </Card >
  );
};

export default RegistroExtraordinario;
