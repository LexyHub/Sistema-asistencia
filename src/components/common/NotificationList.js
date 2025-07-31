import React from 'react';
import { Alert } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationList = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
      {notifications.map(notification => (
        <Alert
          key={notification.id}
          variant={notification.type}
          onClose={() => removeNotification(notification.id)}
          dismissible
          className="mb-2 shadow-sm"
        >
          {notification.message}
        </Alert>
      ))}
    </div>
  );
};

export default NotificationList;
