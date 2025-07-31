import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AttendanceService from '../../services/attendanceService';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate, formatTime, formatAttendanceType } from '../../utils/formatters';
import { FaEdit, FaExclamationTriangle } from 'react-icons/fa';

// Validation schema for the form
const validationSchema = Yup.object().shape({
  motivo: Yup.string().required('Debe ingresar un motivo para la corrección'),
  nueva_fecha: Yup.date(),
  nueva_hora: Yup.string()
});

const SolicitarCorreccion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchRegistro = async () => {
      try {
        setLoading(true);
        // Fetch the attendance record to be corrected
        const response = await AttendanceService.getAttendanceData({
          id_registro: id
        });
        
        // Find the record with matching ID
        const found = response.records?.find(r => r.id_registro === Number(id));
        
        if (found) {
          setRegistro(found);
        } else {
          setFormError('Registro de asistencia no encontrado');
        }
      } catch (err) {
        error('Error al cargar los detalles del registro');
        console.error('Error fetching record details:', err);
        setFormError('Error al cargar los detalles del registro');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistro();
  }, [id, error]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await AttendanceService.submitCorrectionRequest(id, values);
      success('Solicitud de corrección enviada exitosamente');
      navigate('/registro-exito', { 
        state: { 
          message: 'Solicitud de corrección enviada exitosamente. Un administrador revisará su solicitud.' 
        } 
      });
    } catch (err) {
      error('Error al enviar la solicitud de corrección');
      console.error('Error submitting correction request:', err);
      setFormError('Error al enviar la solicitud de corrección');
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
        <p className="mt-2">Cargando detalles del registro...</p>
      </div>
    );
  }

  if (formError) {
    return (
      <Alert variant="danger" className="text-center my-5">
        <FaExclamationTriangle size={30} className="mb-3" />
        <h5>{formError}</h5>
        <Button 
          variant="primary" 
          onClick={() => navigate('/dashboard')}
          className="mt-3"
        >
          Volver al Dashboard
        </Button>
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0" style={{ color: '#fff' }}>
          <FaEdit className="me-2" />
          Solicitar Corrección de Registro
        </h4>
      </Card.Header>
      <Card.Body>
        <Row className="mb-4">
          <Col md={6}>
            <h5>Detalles del Registro Original</h5>
            <dl className="row">
              <dt className="col-sm-4">Empleado:</dt>
              <dd className="col-sm-8">{registro.nombre_colaborador}</dd>
              
              <dt className="col-sm-4">RUT:</dt>
              <dd className="col-sm-8">{registro.rut_colaborador}</dd>
              
              <dt className="col-sm-4">Tipo:</dt>
              <dd className="col-sm-8">{formatAttendanceType(registro.tipo_registro)}</dd>
              
              <dt className="col-sm-4">Fecha:</dt>
              <dd className="col-sm-8">{formatDate(registro.fecha)}</dd>
              
              <dt className="col-sm-4">Hora:</dt>
              <dd className="col-sm-8">{formatTime(registro.hora)}</dd>
            </dl>
          </Col>
          <Col md={6}>
            <Alert variant="info">
              <p className="mb-0">
                Ingrese los valores que desea corregir. Puede modificar la fecha, hora, o ambos. 
                Su solicitud será revisada por un administrador.
              </p>
            </Alert>
          </Col>
        </Row>

        <Formik
          initialValues={{
            motivo: '',
            nueva_fecha: '',
            nueva_hora: ''
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
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nueva Fecha (opcional)</Form.Label>
                    <DatePicker
                      selected={values.nueva_fecha ? new Date(values.nueva_fecha) : null}
                      onChange={(date) => setFieldValue('nueva_fecha', date ? date.toISOString().split('T')[0] : '')}
                      dateFormat="dd/MM/yyyy"
                      className={`form-control ${touched.nueva_fecha && errors.nueva_fecha ? 'is-invalid' : ''}`}
                      placeholderText="Dejar en blanco para mantener fecha original"
                      maxDate={new Date()}
                    />
                    {touched.nueva_fecha && errors.nueva_fecha && (
                      <div className="text-danger small mt-1">{errors.nueva_fecha}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nueva Hora (opcional)</Form.Label>
                    <Form.Control
                      type="time"
                      name="nueva_hora"
                      placeholder="Dejar en blanco para mantener hora original"
                      value={values.nueva_hora}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.nueva_hora && !!errors.nueva_hora}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.nueva_hora}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Motivo de la Corrección</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="motivo"
                  placeholder="Explique el motivo por el que solicita esta corrección"
                  value={values.motivo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.motivo && !!errors.motivo}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.motivo}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/dashboard')}
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Enviando solicitud...
                    </>
                  ) : (
                    'Solicitar Corrección'
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
      <Card.Footer className="bg-light">
        <small className="text-muted">
          Nota: Las solicitudes de corrección requieren aprobación administrativa.
        </small>
      </Card.Footer>
    </Card>
  );
};

export default SolicitarCorreccion;
