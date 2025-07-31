import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

/**
 * A consistent loading indicator for lazy-loaded components
 */
const LazyLoadingFallback = () => {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center py-5">
      <Spinner animation="border" variant="primary" role="status" className="mb-3" />
      <p className="text-muted">Cargando componente...</p>
    </Container>
  );
};

export default LazyLoadingFallback;
