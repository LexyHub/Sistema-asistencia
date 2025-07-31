import React from 'react';
import { Container } from 'react-bootstrap';
import NavigationBar from './NavigationBar';
import NotificationList from '../common/NotificationList';
import DebugPanel from '../common/DebugPanel';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />
      <NotificationList />
      <Container className="py-4 flex-grow-1">
        {children}
        <DebugPanel />
      </Container>
      <Footer />
    </div>
  );
};

export default MainLayout;
