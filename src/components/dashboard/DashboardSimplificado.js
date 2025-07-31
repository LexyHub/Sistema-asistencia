import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Form, Button, Row, Col, Spinner, Badge } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSort, FaSearch } from 'react-icons/fa';
import AttendanceService from '../../services/attendanceService';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate, formatTime, formatAttendanceType, getFirstDayOfMonth } from '../../utils/formatters';

const DashboardSimplificado = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(getFirstDayOfMonth()));
  const [endDate, setEndDate] = useState(new Date());
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');
  const { error } = useNotification();
  // Function to fetch attendance data with current filters - memoized to prevent dependency cycle
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        sort_by: sortBy,
        sort_order: sortOrder
      };
      const data = await AttendanceService.getSimplifiedDashboard(params);
      setRecords(data.records || []);
    } catch (err) {
      error('Error al cargar los datos de asistencia');
      console.error('Error fetching simplified dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, sortBy, sortOrder, error]);
  // Load data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData contains all the dependencies we need

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

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0" style={{ color: '#fff' }}>Registros de Asistencia</h4>
      </Card.Header>
      <Card.Body>
        {/* Filters */}
        <Form onSubmit={handleFilter} className="mb-4">
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
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
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
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
            <Col md={4} className="d-flex justify-content-md-end mt-3 mt-md-0">
              <Button variant="primary" type="submit">
                <FaSearch className="me-2" />
                Buscar
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
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('hora')}>
                    Hora {renderSortIcon('hora')}
                  </th>
                  <th>Estado</th>
                </tr>
              </thead>              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id_registro || index}>
                    <td>{formatDate(record.fecha) || 'N/A'}</td>
                    <td>{record.nombre_colaborador || 'N/A'}</td>
                    <td>{record.rut_colaborador || 'N/A'}</td>
                    <td>{formatAttendanceType(record.tipo_registro) || 'N/A'}</td>
                    <td>{formatTime(record.hora) || 'N/A'}</td>
                    <td>
                      {record.corregido ? (
                        <Badge bg="info">Corregido</Badge>
                      ) : record.origen_registro === 'Extraordinario' ? (
                        <Badge bg="warning">Extraordinario</Badge>
                      ) : (
                        <Badge bg="success">Normal</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
      <Card.Footer className="text-muted">
        <small>
          Esta vista muestra solo los registros normales y extraordinarios aprobados.
          No incluye registros rechazados o pendientes de aprobación.
        </small>
      </Card.Footer>
    </Card>
  );
};

export default DashboardSimplificado;
