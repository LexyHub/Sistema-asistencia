import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserLock } from 'react-icons/fa';

// Validation schema for the login form
const validationSchema = Yup.object().shape({
  rut: Yup.string()
    .required('Correo o Rut requerido')
    .min(8, 'RUT debe tener al menos 8 caracteres'),
  pin: Yup.string()
    .required('PIN es requerido')
    .matches(/^\d+$/, 'PIN debe contener solo números')
    .min(1, 'PIN es requerido')
});

const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Get the page they were trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';
  const sessionExpired = location.state?.sessionExpired || false;  // Login function que llama a la API
  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setError('');      // Llamada a la API de autenticación
      const response = await fetch('https://api.v2.lexy.cl/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut: values.rut,
          pin: values.pin
        })
      });

      const dataArr = await response.json();
      const data = Array.isArray(dataArr) ? dataArr[0] : dataArr;

      if (response.ok && data.success) {
        // Login exitoso
        login(data.user);
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }

    } catch (err) {
      setError('Error de conexión. Verifique su conexión a internet.');
      console.error('Login error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center my-5">
      <Card style={{ maxWidth: '400px' }} className="shadow">
        <Card.Header className="bg-primary text-white text-center py-3">
          <FaUserLock size={30} className="mb-2" />
          <h4 className="mb-0" style={{ color: '#fff' }}>Iniciar Sesión</h4>
        </Card.Header>        <Card.Body className="p-4">
          {sessionExpired && (
            <Alert variant="warning" className="mb-4">
              <strong>Sesión Expirada:</strong> Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          <Formik
            initialValues={{ rut: '', pin: '' }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>CORREO O RUT</Form.Label>
                  <Form.Control
                    type="text"
                    name="rut"
                    value={values.rut}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.rut && !!errors.rut}
                    placeholder="Ej: 12345678-9"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.rut}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>PIN</Form.Label>
                  <Form.Control
                    type="password"
                    name="pin"
                    value={values.pin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.pin && !!errors.pin}
                    placeholder="Ingrese su PIN"
                  />                  <Form.Control.Feedback type="invalid">
                    {errors.pin}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </div>
                {/*               <div className="text-center mt-4">
                  <small className="text-muted">
                    Ingrese su RUT y el PIN que usa para marcar asistencia.<br />
                    <strong>Administradores:</strong> RUT: admin, PIN: admin
                  </small>
                </div> */}
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
