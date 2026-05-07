import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (onNotification) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    if (onNotification) {
      newSocket.on('new_notification', onNotification);
    }

    return () => {
      newSocket.disconnect();
    };
  }, [onNotification]); // Depend on the callback

  return { socket, connected };
};
