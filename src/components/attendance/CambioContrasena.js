import React from 'react';
import { Card, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object().shape({
  pin_actual: Yup.string().required('Debe ingresar su PIN actual'),
  nuevo_pin: Yup.string()
    .required('Debe ingresar el nuevo PIN')
    .matches(/^\d{4}$/, 'El PIN debe contener solo números, con un mínimo y máximo de 4 dígitos.'),
  repetir_nuevo_pin: Yup.string()
    .oneOf([Yup.ref('nuevo_pin'), null], 'Los PIN no coinciden')
    .required('Debe repetir el nuevo PIN')
    .matches(/^\d{4}$/, 'El PIN debe contener solo números, con un mínimo y máximo de 4 dígitos.')
});

const CambioContrasena = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showNuevoPin, setShowNuevoPin] = React.useState(false);
  const [showRepetirPin, setShowRepetirPin] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        pin_id: values.pin_actual,
        rut: user?.username || '',
        clave_nueva: values.nuevo_pin
      };
      await api.post('/cambio-clave', payload);
      setSuccessMsg('PIN cambiado exitosamente');
      resetForm();
      navigate('/registro-exito');
    } catch (error) {
      setErrorMsg('Error al cambiar el PIN. Verifique sus datos.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Solo permitir números en los campos de PIN
  const handleNumberInput = (e) => {
    if (!/^\d*$/.test(e.target.value)) {
      e.preventDefault();
      return false;
    }
  };

  return (
    <Card className="shadow-sm mx-auto" style={{ maxWidth: 400 }}>
      <Card.Header className="bg-primary text-white"
      style={{
          background: 'linear-gradient(90deg,#3a1c71 0%, #a259e6 100%)',
          color: '#fff',
          borderBottom: 'none'
        }}>
        <h5 className="mb-0" style={{ color: '#fff' }}>Cambio de PIN</h5>
      </Card.Header>
      <Card.Body>
        {successMsg && <Alert variant="success">{successMsg}</Alert>}
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        <Formik
          initialValues={{
            pin_actual: '',
            nuevo_pin: '',
            repetir_nuevo_pin: ''
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
              <Form.Group className="mb-3">
                <Form.Label>PIN actual</Form.Label>
                <Form.Control
                  type="password"
                  name="pin_actual"
                  value={values.pin_actual}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.pin_actual && !!errors.pin_actual}
                  autoComplete="current-password"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.pin_actual}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nuevo PIN</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showNuevoPin ? 'text' : 'password'}
                    name="nuevo_pin"
                    value={values.nuevo_pin}
                    onChange={e => {
                      handleNumberInput(e);
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    isInvalid={touched.nuevo_pin && !!errors.nuevo_pin}
                    autoComplete="new-password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  <InputGroup.Text
                    onClick={() => setShowNuevoPin(v => !v)}
                    style={{ cursor: 'pointer', background: '#fff' }}
                    tabIndex={-1}
                  >
                    {showNuevoPin ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.nuevo_pin}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Repetir Nuevo PIN</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showRepetirPin ? 'text' : 'password'}
                    name="repetir_nuevo_pin"
                    value={values.repetir_nuevo_pin}
                    onChange={e => {
                      handleNumberInput(e);
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    isInvalid={touched.repetir_nuevo_pin && !!errors.repetir_nuevo_pin}
                    autoComplete="new-password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  <InputGroup.Text
                    onClick={() => setShowRepetirPin(v => !v)}
                    style={{ cursor: 'pointer', background: '#fff' }}
                    tabIndex={-1}
                  >
                    {showRepetirPin ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.repetir_nuevo_pin}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <div className="d-grid">
                <Button variant="primary" type="submit" disabled={isSubmitting || loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Cambiando...
                    </>
                  ) : (
                    'Cambiar PIN'
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
};

export default CambioContrasena;
