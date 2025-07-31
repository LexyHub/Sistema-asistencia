import React, { Component } from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Error Boundary component to catch JavaScript errors in child components
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Additional debugging information
    console.group("🚨 Error Boundary Debug Info");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Component stack:", errorInfo.componentStack);
    console.error("Error object:", error);
    console.groupEnd();
    
    // Check for specific React error patterns
    if (error.message.includes('Minified React error')) {
      console.warn("🔍 This appears to be a minified React error. Consider using development build for better debugging.");
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  // Reset the error state to allow recovery
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex justify-content-center align-items-center my-5">
          <Card className="shadow text-center" style={{ maxWidth: '600px' }}>
            <Card.Header className="bg-danger text-white">
              <h4 className="mb-0" style={{ color: '#fff' }}>
                <FaExclamationTriangle className="me-2" />
                Algo salió mal
              </h4>
            </Card.Header>
            <Card.Body className="py-5">
              <p className="mb-4">
                Lo sentimos, ha ocurrido un error en la aplicación. Por favor intente nuevamente.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-start">
                  <details className="mb-3">
                    <summary className="text-danger mb-2">Detalles del Error (Solo Desarrollo)</summary>
                    <pre className="border p-3 bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="border p-3 bg-light" style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflow: 'auto' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                </div>
              )}
              
              <div className="d-flex justify-content-center gap-3">
                <Button variant="primary" onClick={this.handleReset}>
                  Intentar Nuevamente
                </Button>
                <Button variant="outline-primary" onClick={() => window.location.href = '/'}>
                  Volver al Inicio
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
