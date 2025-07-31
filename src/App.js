import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LazyLoadingFallback from './components/common/LazyLoadingFallback';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout Component
import MainLayout from './components/layout/MainLayout';

// Common Components
import PrivateRoute from './components/common/PrivateRoute';
import LoadingWrapper from './components/common/LoadingWrapper';
import Home from './components/common/Home';
import Login from './components/common/Login';
import ResponseAdapter from './components/common/ResponseAdapter';
import CambioContrasena from './components/attendance/CambioContrasena.js';
import CambioContrasenaAdmin from './components/attendance/CambioContrasenaAdmin';
import CambiarEstadoEmpleado from './components/attendance/CambioEstadoAdmin';
import VerificarAsistencia from './components/attendance/VerificarAsistencia';
import DashboardDT from './views/dashboard/DashboardDT';

// Use React.lazy for components that were causing issues
// Attendance Components
import RegistroAsistenciaForm from './components/attendance/RegistroAsistenciaForm';

// Lazy loaded components with proper chunk naming
const RegistroExtraordinario = lazy(() =>
  import(/* webpackChunkName: "registro-extraordinario" */ './components/attendance/RegistroExtraordinario')
);
const SolicitarCorreccion = lazy(() =>
  import(/* webpackChunkName: "solicitar-correccion" */ './components/attendance/SolicitarCorreccion')
);

// Dashboard Components
const Dashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ './components/dashboard/Dashboard')
);
const DashboardSimplificado = lazy(() =>
  import(/* webpackChunkName: "dashboard-simplificado" */ './components/dashboard/DashboardSimplificado')
);

// Admin Components
const AdminCorrecciones = lazy(() => import('./components/admin/AdminCorrecciones'));

function App() {
  console.log('🚀 App component rendering...');

  return (
    <AuthProvider>
      <LoadingWrapper>
        <NotificationProvider>
          <ErrorBoundary>
            <Router>
              <MainLayout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro-exito" element={<ResponseAdapter />} />
                  <Route path="/registro-error" element={<ResponseAdapter />} />

                  {/* Protected Routes */}
                  <Route
                    path="/registro-asistencia"
                    element={
                      <PrivateRoute>
                        <RegistroAsistenciaForm />
                      </PrivateRoute>
                    }
                  />
                   <Route
                    path="/dashboardDT"
                    element={
                      <PrivateRoute>
                        <DashboardDT />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/registro-extraordinario"
                    element={
                      <PrivateRoute>
                        <Suspense fallback={<LazyLoadingFallback />}>
                          <RegistroExtraordinario />
                        </Suspense>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cambio-contrasena"
                    element={
                      <PrivateRoute>
                        <CambioContrasena />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cambio-contrasena-admin"
                    element={
                      <PrivateRoute requiresAdmin={true}>
                        <CambioContrasenaAdmin />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cambiar-estado-empleado"
                    element={
                      <PrivateRoute requiresAdmin={true}>
                        <CambiarEstadoEmpleado />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/verificar-asistencia"
                    element={<VerificarAsistencia />}
                  />

                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Suspense fallback={<LazyLoadingFallback />}>
                          <Dashboard />
                        </Suspense>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/dashboard-simplificado"
                    element={
                      <PrivateRoute>
                        <Suspense fallback={<LazyLoadingFallback />}>
                          <DashboardSimplificado />
                        </Suspense>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/solicitar-correccion/:id"
                    element={
                      <PrivateRoute>
                        <Suspense fallback={<LazyLoadingFallback />}>
                          <SolicitarCorreccion />
                        </Suspense>
                      </PrivateRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin-correcciones"
                    element={
                      <PrivateRoute requiresAdmin={true}>
                        <Suspense fallback={<LazyLoadingFallback />}>
                          <AdminCorrecciones />
                        </Suspense>
                      </PrivateRoute>
                    }
                  />

                  {/* Catch all - redirect to home */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainLayout>
            </Router>
          </ErrorBoundary>
        </NotificationProvider>
      </LoadingWrapper>
    </AuthProvider>
  );
}

export default App;
