import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Form, Button, Row, Col, Spinner, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSort, FaFileExcel, FaFileCsv, FaSearch, FaEdit, FaExclamationTriangle } from 'react-icons/fa';
import AttendanceService from '../../services/attendanceService';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatTime, formatAttendanceType, getFirstDayOfMonth } from '../../utils/formatters';
import { validateDateRange, sanitizeUrlParams } from '../../utils/validation';
import { exportToExcel, exportToCSV } from '../../utils/excelExport';
import Select from 'react-select';
import api from '../../services/api'; // Asegúrate de tener este helper

// Define the Dashboard component with a named function to ensure proper export
function Dashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(getFirstDayOfMonth()));
  const [endDate, setEndDate] = useState(new Date());
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterError, setFilterError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [cargo, setCargo] = useState('');
  const [area, setArea] = useState('');
  const [hash, setHash] = useState('');
  const [searchEmpleado, setSearchEmpleado] = useState(null);
  const [empleadosOptions, setEmpleadosOptions] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useNotification();// Function to fetch attendance data with current filters - memoized to prevent dependency cycle
  const fetchData = async (isRetry = false) => {
    try {
      setLoading(true);
      setFilterError('');

      // Validar rango de fechas
      const dateValidation = validateDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (!dateValidation.valid) {
        setFilterError(dateValidation.message);
        return;
      }
      const params = sanitizeUrlParams({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchEmpleado ? searchEmpleado.value : '', // <-- Aquí envía el person_id
        cargo,
        area,
        hash,
        person_id: user.id 
      });

      const data = await AttendanceService.getAttendanceData(params);
      setRecords(data.records || []);
      setRetryCount(0); // Reset retry count on success

    } catch (err) {
      console.error('Error fetching attendance data:', err);

      // Manejo específico de errores
      if (err.message.includes('conexión') && retryCount < 3 && !isRetry) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchData(true), 2000); // Retry after 2 seconds
        setFilterError(`Error de conexión. Reintentando... (${retryCount + 1}/3)`);
      } else if (err.message.includes('Fecha')) {
        setFilterError(err.message);
      } else {
        setFilterError('Error al cargar los datos. Verifique su conexión e intente nuevamente.');
        error('Error al cargar los datos de asistencia');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Obtener listado de empleados para el filtro
  useEffect(() => {
    const fetchEmpleados = async () => {
      setLoadingUsuarios(true);
      try {
        const res = await api.get('/listado-total-empleados');
        const options = (res.data.empleados || []).map(e => ({
          value: e.person_id,
          label: e.nombre_colaborador || e.nombre
        }));
        setEmpleadosOptions(options);
      } catch (err) {
        setEmpleadosOptions([]);
      } finally {
        setLoadingUsuarios(false);
      }
    };
    fetchEmpleados();
  }, []);

  // Log selected employee
  useEffect(() => {
    console.log('Empleado seleccionado:', searchEmpleado);
  }, [searchEmpleado]);

  // Handle filter form submission
  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Handle sort column change
  const handleSort = (column) => {
    if (sortBy === column) {
      // If already sorting by this column, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If new column, default to descending order
      setSortBy(column);
      setSortOrder('desc');
    }
  };  // Handle export to Excel
  const handleExportExcel = async () => {
    try {
      // Use the current records that are already loaded
      if (records.length === 0) {
        error('No hay datos para exportar');
        return;
      }

      const exportOptions = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      exportToExcel(records, 'reporte_asistencia', exportOptions);
      success('Archivo Excel generado exitosamente');
    } catch (err) {
      error('Error al generar el archivo Excel');
      console.error('Error exporting to Excel:', err);
    }
  };

  // Handle export to CSV
  const handleExportCSV = async () => {
    try {
      // Use the current records that are already loaded
      if (records.length === 0) {
        error('No hay datos para exportar');
        return;
      }

      exportToCSV(records, 'reporte_asistencia');
      success('Archivo CSV generado exitosamente');
    } catch (err) {
      error('Error al generar el archivo CSV');
      console.error('Error exporting to CSV:', err);
    }
  };

  // Navigate to correction request form
  const handleRequestCorrection = (id) => {
    navigate(`/solicitar-correccion/${id}`);
  };

  // Render sort icon
  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return <FaSort className="ms-1 text-muted" />;
    }
    return sortOrder === 'asc' ?
      <FaSort className="ms-1 text-primary" /> :
      <FaSort className="ms-1 text-primary" style={{ transform: 'rotate(180deg)' }} />;
  };
  // Opciones de ejemplo (puedes obtenerlas dinámicamente si lo prefieres)
const areaOptions = [
  { value: '', label: 'Todos' },
  { value: "3-79-81-82-125-83-118", label: "Operaciones" },
  { value: "119-120-121-122-123-169-202", label: "CX" },
  { value: "132-134-135-136", label: "TI" },
  { value: "77-78", label: "Crecimiento" },
  { value: "116-117-126", label: "Producto" },
  { value: "127-128-129", label: "Personas" },
  { value: "130-131", label: "Finanzas" },
  { value: "348-349-238-239", label: "Consultoría" },
  { value: "314", label: "CEO" }
];

  const cargoOptions = [
    { value: '', label: 'Todos' },
    { value: 1, label: 'Abogado Tramitador' },
    { value: 35, label: 'Analista Administración de Personas' },
    { value: 36, label: 'Ejecutivo Legal CX' },
    { value: 37, label: 'Capitán operaciones' },
    { value: 38, label: 'Capitán CX' },
    { value: 39, label: 'Encargado de producto' },
    { value: 40, label: 'Develawper' },
    { value: 43, label: 'Director de personas' },
    { value: 44, label: 'CEO' },
    { value: 45, label: 'Director de operaciones legales' },
    { value: 46, label: 'Director de CX' },
    { value: 47, label: 'Director de TI' },
    { value: 48, label: 'Analista de finanzas' },
    { value: 49, label: 'Analista de control de gestión' },
    { value: 50, label: 'Director de crecimiento' },
    { value: 51, label: 'generalista de personas' },
    { value: 52, label: 'Marketing manager' },
    { value: 53, label: 'Abogado vendedor' },
    { value: 54, label: 'Diseñador digital' },
    { value: 55, label: 'Analista de cobranza' },
    { value: 56, label: 'UX Designer' },
    { value: 57, label: 'Encargado de formación' },
    { value: 58, label: 'Comunity manager' },
    { value: 59, label: 'Ejecutivo comercial' },
    { value: 60, label: 'Data lead' },
    { value: 61, label: 'IA lead' },
    { value: 62, label: 'tech leader' },
    { value: 95, label: 'Consultor' },

  ];

  // Animación de carga mientras se obtienen los empleados
  if (loadingUsuarios) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando Registro de Asistencia...</p>
      </div>
    );
  }

  return (<Card className="shadow-sm">
    <Card.Header className="bg-primary text-white"
      style={{
        background: 'linear-gradient(90deg,#3a1c71 0%, #a259e6 100%)',
        borderBottom: 'none'
      }}
    >
      <h4 className="mb-0" style={{ color: '#fff' }}>Dashboard de Asistencia</h4>
    </Card.Header>
    <Card.Body>
      {/* Filters */}
      <Form onSubmit={handleFilter} className="mb-4">
        <Row className="g-3 align-items-end">
          {isAdmin ? (
            <>
              <Col xs={12} md={2}>
                <Form.Group>
                  <Form.Label>Búsqueda</Form.Label>
                  <Select
                    options={empleadosOptions}
                    value={searchEmpleado}
                    onChange={setSearchEmpleado}
                    placeholder="Buscar empleado..."
                    isClearable
                    isSearchable
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={2}>
                <Form.Group>
                  <Form.Label>Cargo</Form.Label>
                  <Select
                    options={cargoOptions}
                    value={cargoOptions.find(opt => opt.value === cargo)}
                    onChange={opt => setCargo(opt ? opt.value : '')}
                    placeholder="Seleccionar cargo..."
                    isClearable
                    isSearchable
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={2}>
                <Form.Group>
                  <Form.Label>Área</Form.Label>
                  <Select
                    options={areaOptions}
                    value={areaOptions.find(opt => opt.value === area)}
                    onChange={opt => setArea(opt ? opt.value : '')}
                    placeholder="Seleccionar área..."
                    isClearable
                    isSearchable
                  />
                </Form.Group>
              </Col>
            </>
          ) : (
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>Empleado</Form.Label>
                <Form.Control
                  type="text"
                  value={user?.name || user?.nombre_colaborador || 'Usuario'}
                  disabled
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          )}
          <Col xs={12} md={isAdmin ? 2 : 2}>
            <Form.Group>
              <Form.Label>Hash</Form.Label>
              <Form.Control
                type="text"
                placeholder="Hash"
                value={hash}
                onChange={e => setHash(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={2}>
            <Form.Group>
              <Form.Label>Fecha Inicio</Form.Label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={2}>
            <Form.Group>
              <Form.Label>Fecha Fin</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                dateFormat="dd/MM/yyyy"
                className="form-control"
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={isAdmin ? 12 : 4} className="text-md-end mt-3">
            <Button variant="primary" type="submit" className="me-2 mb-2">
              <FaSearch className="me-2" />
              Filtrar
            </Button>
            <Button variant="success" onClick={handleExportExcel} className="me-2 mb-2">
              <FaFileExcel className="me-2" />
              Exportar Excel
            </Button>
            <Button variant="info" onClick={handleExportCSV} className="mb-2">
              <FaFileCsv className="me-2" />
              Exportar CSV
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Results Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando datos de asistencia...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center my-5">
          <p className="mb-0">No se encontraron registros de asistencia para el período seleccionado.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover bordered className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('fecha')}>
                  Fecha {renderSortIcon('fecha')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nombre_colaborador')}>
                  Nombre {renderSortIcon('nombre_colaborador')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('rut_colaborador')}>
                  RUT {renderSortIcon('rut_colaborador')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('tipo_registro')}>
                  Tipo {renderSortIcon('tipo_registro')}
                </th>                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('hora')}>
                  Hora {renderSortIcon('hora')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('origen_registro')}>
                  Origen {renderSortIcon('origen_registro')}
                </th>
                {/* <th>Acciones</th> */}
              </tr>
            </thead>              <tbody>
              {records.map((record, index) => (
                <tr key={record.id_registro || index}>
                  <td>{formatDate(record.fecha_display || record.fecha) || 'N/A'}</td>
                  <td>{record.nombre_colaborador || 'N/A'}</td>
                  <td>{record.rut_colaborador || 'N/A'}</td>
                  <td>{formatAttendanceType(record.tipo_registro) || 'N/A'}</td>
                  <td>{formatTime(record.hora_display || record.hora) || 'N/A'}</td>                    <td>
                    {record.origen_registro ? (
                      <Badge
                        bg={
                          record.origen_registro.includes('Extraordinario') ? 'warning' :
                            record.origen_registro.includes('Corregido') ? 'info' :
                              record.origen_registro === 'Manual' ? 'secondary' :
                                'success'
                        }
                      >
                        {record.origen_registro}
                      </Badge>
                    ) : (
                      <Badge bg="success">Normal</Badge>
                    )}
                  </td>
                  {/* <td>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled
                      style={{ cursor: 'not-allowed', opacity: 0.6 }}
                    >
                      <FaEdit className="me-1" />
                      Corregir
                    </Button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Card.Body>

  </Card>
  );
};

export default Dashboard;
