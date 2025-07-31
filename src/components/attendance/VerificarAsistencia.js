import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Card } from 'react-bootstrap';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';

const VerificarAsistencia = () => {
  const [searchParams] = useSearchParams();
  const hash = searchParams.get('hash');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.post('/verificar-valor-hash', { hash });
        setData(res.data);
      } catch (err) {
        setError('No se pudo verificar la asistencia.');
      } finally {
        setLoading(false);
      }
    };
    if (hash) fetchData();
    else {
      setLoading(false);
      setError('No se encontró el parámetro hash en la URL.');
    }
  }, [hash]);

  return (
    <Card className="shadow-sm mx-auto" style={{ maxWidth: 700 }}>
      <Card.Header
        style={{
          background: 'linear-gradient(90deg,#3a1c71 0%, #a259e6 100%)',
          color: '#fff',
          borderBottom: 'none'
        }}
      >
        <h4 className="mb-0" style={{ color: '#fff' }}>Verificar Asistencia</h4>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="mt-2">Verificando asistencia...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : data ? (
          <Table bordered hover responsive>
            <tbody>
              {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                  <th>{key}</th>
                  <td>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="warning">No se encontraron datos para el hash proporcionado.</Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default VerificarAsistencia;