import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';


const validationSchema = Yup.object().shape({
    usuario_rut: Yup.string().required('Debe seleccionar un usuario'),
    nuevo_pin: Yup.string()
        .required('Debe ingresar el nuevo PIN')
        .matches(/^\d{4}$/, 'El PIN debe contener solo números, con un mínimo y máximo de 4 dígitos.'),
});

const CambioContrasenaAdmin = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showNuevoPin, setShowNuevoPin] = useState(false);
     const navigate = useNavigate();

    useEffect(() => {
        const fetchUsuarios = async () => {
            setLoadingUsuarios(true);
            try {
                const res = await api.get('/registro-asistencia');

                if (!Array.isArray(res.data.empleados)) {
                    throw new Error("La propiedad 'empleados' no es un array");
                }

                const usuariosMap = new Map();
                res.data.empleados.forEach(reg => {
                    if (reg.rut_colaborador && reg.nombre_colaborador) {
                        usuariosMap.set(reg.rut_colaborador, {
                            rut: reg.rut_colaborador,
                            nombre: reg.nombre_colaborador
                        });
                    }
                });

                const usuariosUnicos = Array.from(usuariosMap.values());
                setUsuarios(usuariosUnicos);
            } catch (err) {
                console.error("Error al obtener usuarios:", err);
                setUsuarios([]);
            } finally {
                setLoadingUsuarios(false);
            }
        };


        fetchUsuarios();
    }, []);

    const handleNumberInput = (e) => {
        if (!/^\d*$/.test(e.target.value)) {
            e.preventDefault();
            return false;
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setLoadingSubmit(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const payload = {
                rut: values.usuario_rut,
                clave_nueva: values.nuevo_pin
            };
            await api.post('/cambio-clave-admin', payload);
            setSuccessMsg('PIN cambiado exitosamente');
            resetForm();
            navigate('/registro-exito');
        } catch (error) {
            console.error("Error al enviar el cambio de PIN:", error);
            setErrorMsg('Error al cambiar el PIN. Verifique los datos.');
        } finally {
            setLoadingSubmit(false);
            setSubmitting(false);
        }
    };

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
        <Card className="shadow-sm mx-auto" style={{ maxWidth: 400 }}>
            <Card.Header
                style={{
                    background: 'linear-gradient(90deg,#3a1c71 0%, #a259e6 100%)',
                    color: '#fff',
                    borderBottom: 'none'
                }}>
                <h5 className="mb-0" style={{ color: '#fff' }}>Cambio de PIN (Administrador)</h5>
            </Card.Header>
            <Card.Body>
                {successMsg && <Alert variant="success">{successMsg}</Alert>}
                {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                <Formik
                    initialValues={{ usuario_rut: '', nuevo_pin: '' }}
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
                        setFieldValue,
                        isSubmitting
                    }) => (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Usuario</Form.Label>
                                <Select
                                    name="usuario_rut"
                                    value={usuarios.find(u => u.rut === values.usuario_rut) || null}
                                    onChange={option => setFieldValue('usuario_rut', option ? option.rut : '')}
                                    options={usuarios}
                                    getOptionLabel={u => `${u.nombre} - ${u.rut}`}
                                    getOptionValue={u => u.rut}
                                    placeholder="Buscar y seleccionar usuario..."
                                    isClearable
                                    isDisabled={loadingUsuarios}
                                    className={touched.usuario_rut && errors.usuario_rut ? 'is-invalid' : ''}
                                />
                                {touched.usuario_rut && errors.usuario_rut && (
                                    <div className="text-danger small mt-1">{errors.usuario_rut}</div>
                                )}
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

                            <div className="d-grid">
                                <Button variant="primary" type="submit" disabled={isSubmitting || loadingSubmit}>
                                    {loadingSubmit ? (
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

export default CambioContrasenaAdmin;
