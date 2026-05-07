import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ToastBanner from './components/ToastBanner';
import UploadPage from './pages/UploadPage';
import NotificationsPage from './pages/NotificationsPage';
import { fetchNotifications, markAllRead } from './api';
import { useSocket } from './hooks/useSocket';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [notifications, setNotifications] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNewNotification = useCallback((notification) => {
    // Add to state
    setNotifications(prev => [notification, ...prev]);
    // Show toast
    setToastMessage(notification.message);
  }, []);

  // Connect socket at App level so it persists across tabs
  useSocket(handleNewNotification);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        notifications={notifications}
        markAllRead={handleMarkAllRead}
        unreadCount={unreadCount}
      />

      <main className="flex-1 bg-slate-50">
        {activeTab === 'upload' && <UploadPage />}
        {activeTab === 'notifications' && (
          <NotificationsPage 
            notifications={notifications} 
            markAllRead={handleMarkAllRead}
            refreshNotifications={loadNotifications}
          />
        )}
        {activeTab === 'ai' && (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-slate-200">
              <svg className="w-16 h-16 text-primary mx-auto mb-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Assistant</h2>
              <p className="text-slate-500">Coming Soon</p>
            </div>
          </div>
        )}
      </main>

      {toastMessage && (
        <ToastBanner 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
}

export default App;
