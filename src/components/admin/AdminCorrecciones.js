import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tab, Tabs, Table, Button, Form, Modal, Spinner, Badge, Alert } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import AdminService from '../../services/adminService';
import { formatDate, formatTime, formatAttendanceType } from '../../utils/formatters';
import { exportCorreccionesToExcel, exportCorreccionesToCSV } from '../../utils/excelExportCorrecciones';
import { FaCheck, FaTimes, FaHistory, FaExclamationTriangle, FaFileExcel, FaFileCsv } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext'; // Agrega este import si no está

const AdminCorrecciones = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesProcesadas, setSolicitudesProcesadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    solicitudId: null,
    accion: '',
    adminPin: '',
    motivoRechazo: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const { success, error: notifyError } = useNotification();
  const { user } = useAuth(); // Obtén el usuario autenticado

  // Fetch correction requests - memoized to prevent dependency cycle
  const fetchCorrecciones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminService.getPendingCorrections();
      setSolicitudes(data.solicitudes || []);
      setSolicitudesProcesadas(data.solicitudes_procesadas || []);
    } catch (err) {
      notifyError('Error al cargar las solicitudes de corrección');
      console.error('Error fetching correction requests:', err);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);
  useEffect(() => {
    fetchCorrecciones();
  }, [notifyError, fetchCorrecciones]);

  // Handle showing the approval/rejection modal
  const handleShowModal = (solicitudId, accion) => {
    const solicitud = solicitudes.find(s => s.solicitud_id === solicitudId);
    setModalData({
      solicitudId,
      accion,
      adminPin: '',
      motivoRechazo: '',
      fecha_solicitada: solicitud?.fecha_solicitada || null,
      hora_solicitada: solicitud?.hora_solicitada || null
    });
    setShowModal(true);
    setError('');
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle form submission (approve/reject)
  const handleSubmit = async () => {
    // Basic validation
    if (!modalData.adminPin) {
      setError('Debe ingresar el PIN de administrador');
      return;
    }

    if (modalData.accion === 'rechazar' && !modalData.motivoRechazo) {
      setError('Debe ingresar un motivo de rechazo');
      return;
    }

    try {
      setSubmitLoading(true);
      const formData = {
        solicitud_id: modalData.solicitudId,
        accion: modalData.accion,
        admin_pin: modalData.adminPin,
        motivo_rechazo: modalData.motivoRechazo,
        user_id: user?.id, // Ajusta según tu estructura de usuario
        user_rut: user?.username, // Asumiendo que el RUT es el username
        dia_original: modalData.fecha_solicitada || null,
        hora_original: modalData.hora_solicitada || null,
      };
      await AdminService.processCorrectionRequest(formData);
      success(`Solicitud ${modalData.accion === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`);
      handleCloseModal();
      fetchCorrecciones(); // Refresh data
    } catch (err) {
      console.error('Error processing request:', err);
      if (err.response?.status === 401) {
        setError('PIN de administrador incorrecto');
      } else {
        setError(`Error al ${modalData.accion} la solicitud`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada':
        return <Badge bg="success">Aprobada</Badge>;
      case 'rechazada':
        return <Badge bg="danger">Rechazada</Badge>;
      case 'pendiente':
      default:
        return <Badge bg="warning">Pendiente</Badge>;
    }
  };

  // Get request type badge
  const getRequestTypeBadge = (esNuevoRegistro) => {
    return esNuevoRegistro ?
      <Badge bg="info">Extraordinario</Badge> :
      <Badge bg="secondary">Corrección</Badge>;
  };

  // Render the status of the correction
  const renderCorrectionStatus = (solicitud) => {
    if (solicitud.solicitud_nuevo_registro) {
      return (
        <div className="d-flex flex-column">
          <span className="mb-1">Creación de registro {formatAttendanceType(solicitud.tipo_registro)}</span>
          <small>
            {formatDate(solicitud.fecha_solicitada)} {solicitud.hora_solicitada && formatTime(solicitud.hora_solicitada)}
          </small>
        </div>
      );
    }

    return (
      <div className="d-flex flex-column">
        {solicitud.fecha_solicitada && (
          <small>
            Nueva: {formatDate(solicitud.fecha_solicitada)} {solicitud.hora_solicitada && formatTime(solicitud.hora_solicitada)}
          </small>
        )}
      </div>
    );
  };

  // Datos para exportar igual que en Dashboard
  const exportData = solicitudesProcesadas.map((solicitud) => ({
    'Tipo': solicitud.solicitud_nuevo_registro ? 'Extraordinario' : 'Corrección',
    'Empleado': solicitud.nombre_colaborador || '',
    'Registro': formatAttendanceType(solicitud.tipo_registro) || '',
    'Cambio Solicitado': solicitud.solicitud_nuevo_registro
      ? `Creación de registro ${formatAttendanceType(solicitud.tipo_registro)}\n${formatDate(solicitud.fecha_solicitada)} ${solicitud.hora_solicitada ? formatTime(solicitud.hora_solicitada) : ''}`
      : `Original: ${formatDate(solicitud.fecha_original)} ${solicitud.hora_original ? formatTime(solicitud.hora_original) : ''}${solicitud.fecha_solicitada ? ` | Nueva: ${formatDate(solicitud.fecha_solicitada)} ${solicitud.hora_solicitada ? formatTime(solicitud.hora_solicitada) : ''}` : ''}`,
    'Motivo': solicitud.motivo_solicitud || '',
    'Estado': solicitud.estado_solicitud || '',
    'Procesado por': solicitud.usuario_resolucion || '',
    'Fecha Resolución': formatDate(solicitud.fecha_resolucion) || '',
    ...(solicitud.estado_solicitud === 'rechazada' && solicitud.motivo_rechazo
      ? { 'Motivo rechazo': solicitud.motivo_rechazo }
      : {}),
  }));

  const handleExportExcel = async () => {
    try {
      if (solicitudesProcesadas.length === 0) {
        notifyError('No hay datos para exportar');
        return;
      }
      exportCorreccionesToExcel(exportData, 'historico_correcciones');
      success('Archivo Excel generado exitosamente');
    } catch (err) {
      notifyError('Error al generar el archivo Excel');
      console.error('Error exporting to Excel:', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      if (solicitudesProcesadas.length === 0) {
        notifyError('No hay datos para exportar');
        return;
      }
      exportCorreccionesToCSV(exportData, 'historico_correcciones');
      success('Archivo CSV generado exitosamente');
    } catch (err) {
      notifyError('Error al generar el archivo CSV');
      console.error('Error exporting to CSV:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando solicitudes de corrección...</p>
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
        }}
      >
        <h4 className="mb-0" style={{ color: '#fff' }}>Administración de Correcciones</h4>
      </Card.Header>
      <Card.Body>
        <Tabs defaultActiveKey="pendientes" id="correction-tabs" className="mb-4">
          <Tab eventKey="pendientes" title={
            <span>
              Pendientes
              {solicitudes.length > 0 && (
                <Badge bg="warning" pill className="ms-2">{solicitudes.length}</Badge>
              )}
            </span>
          }>
            {solicitudes.length === 0 ? (
              <Alert variant="info" className="text-center my-4">
                No hay solicitudes pendientes de revisión.
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover bordered className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tipo</th>
                      <th>Empleado</th>
                      <th>Registro</th>
                      <th>Cambio Solicitado</th>
                      <th>Motivo</th>
                      <th>Fecha Solicitud</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.solicitud_id}>
                        <td>{getRequestTypeBadge(solicitud.solicitud_nuevo_registro)}</td>
                        <td>
                          <div>
                            {solicitud.nombre_colaborador}
                            <br />
                            <small className="text-muted">{solicitud.rut_colaborador}</small>
                          </div>
                        </td>
                        <td>
                          {formatAttendanceType(solicitud.tipo_registro)}
                        </td>
                        <td>
                          {renderCorrectionStatus(solicitud)}
                        </td>
                        <td style={{ maxWidth: '200px' }} className="text-truncate" title={solicitud.motivo_solicitud}>
                          {solicitud.motivo_solicitud}
                        </td>
                        <td>
                          {formatDate(solicitud.fecha_solicitud)}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleShowModal(solicitud.solicitud_id, 'aprobar')}
                            >
                              <FaCheck /> Aprobar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleShowModal(solicitud.solicitud_id, 'rechazar')}
                            >
                              <FaTimes /> Rechazar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab>
          <Tab eventKey="historico" title={
            <span>
              <FaHistory className="me-1" />
              Histórico
            </span>
          }>
            {solicitudesProcesadas.length === 0 ? (
              <Alert variant="info" className="text-center my-4">
                No hay solicitudes procesadas en el historial.
              </Alert>
            ) : (
              <>
                <div className="d-flex justify-content-end mb-3 gap-2">
                  <Button variant="success" size="sm" onClick={handleExportExcel}>
                    <FaFileExcel className="me-2" />
                    Exportar Excel
                  </Button>
                  <Button variant="info" size="sm" onClick={handleExportCSV}>
                    <FaFileCsv className="me-2" />
                    Exportar CSV
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table hover bordered className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Tipo</th>
                        <th>Empleado</th>
                        <th>Registro</th>
                        <th>Cambio Solicitado</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th>Procesado por</th>
                        <th>Fecha Resolución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudesProcesadas.map((solicitud) => (
                        <tr key={solicitud.solicitud_id}>
                          <td>{getRequestTypeBadge(solicitud.solicitud_nuevo_registro)}</td>
                          <td>
                            <div>
                              {solicitud.nombre_colaborador}
                              <br />
                              <small className="text-muted">{solicitud.rut_colaborador}</small>
                            </div>
                          </td>
                          <td>
                            {formatAttendanceType(solicitud.tipo_registro)}
                          </td>
                          <td>
                            {renderCorrectionStatus(solicitud)}
                          </td>
                          <td style={{ maxWidth: '200px' }}>
                            <div className="text-truncate" title={solicitud.motivo_solicitud}>
                              {solicitud.motivo_solicitud}
                            </div>
                            {solicitud.estado_solicitud === 'rechazada' && solicitud.motivo_rechazo && (
                              <div className="mt-1 small text-danger">
                                <strong>Motivo rechazo:</strong> {solicitud.motivo_rechazo}
                              </div>
                            )}
                          </td>
                          <td>
                            {getStatusBadge(solicitud.estado_solicitud)}
                          </td>
                          <td>
                            {solicitud.usuario_resolucion}
                          </td>
                          <td>
                            {formatDate(solicitud.fecha_resolucion)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Tab>
        </Tabs>
      </Card.Body>

      {/* Modal for Approve/Reject */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalData.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'} Solicitud
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>PIN de Administrador</Form.Label>
            <Form.Control
              type="password"
              name="adminPin"
              value={modalData.adminPin}
              onChange={handleInputChange}
              placeholder="Ingrese su PIN de administrador"
              autoFocus
            />
          </Form.Group>

          {modalData.accion === 'rechazar' && (
            <Form.Group className="mb-3">
              <Form.Label>Motivo del Rechazo</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="motivoRechazo"
                value={modalData.motivoRechazo}
                onChange={handleInputChange}
                placeholder="Explique el motivo por el que se rechaza esta solicitud"
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button
            variant={modalData.accion === 'aprobar' ? 'success' : 'danger'}
            onClick={handleSubmit}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Procesando...
              </>
            ) : (
              modalData.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default AdminCorrecciones;
