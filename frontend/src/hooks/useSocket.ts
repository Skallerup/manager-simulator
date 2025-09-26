import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../components/auth/AuthProvider';

export interface Notification {
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Get access token from cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    if (!token) {
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002', {
      auth: {
        token: token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    newSocket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return {
    socket,
    notifications,
    clearNotifications,
    removeNotification,
  };
}



