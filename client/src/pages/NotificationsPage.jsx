import React from 'react';
import { markRead } from '../api';

const NotificationsPage = ({ notifications, markAllRead, refreshNotifications }) => {
  
  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      refreshNotifications();
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
        <button 
          onClick={markAllRead}
          className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <li 
                key={notif.id} 
                className={`p-4 flex items-start justify-between transition-colors ${
                  notif.is_read ? 'bg-white' : 'bg-primary-light border-l-4 border-primary'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {notif.type === 'success' ? (
                      <div className="bg-green-100 rounded-full p-1.5">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="bg-blue-100 rounded-full p-1.5">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-base ${notif.is_read ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'}`}>
                      {notif.message}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(notif.created_at).toLocaleString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {!notif.is_read && (
                  <button 
                    onClick={() => handleMarkRead(notif.id)}
                    className="ml-4 flex-shrink-0 text-xs font-medium text-primary bg-white border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
