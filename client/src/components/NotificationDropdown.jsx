import React from 'react';

const NotificationDropdown = ({ notifications, markAllRead, close, goToNotifications }) => {
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-md">
        <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
        <button 
          onClick={markAllRead}
          className="text-xs text-primary hover:text-blue-800 font-medium"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {recentNotifications.length > 0 ? (
          recentNotifications.map(notif => (
            <div 
              key={notif.id} 
              className={`px-4 py-3 border-b border-slate-50 flex items-start ${notif.is_read ? 'bg-white' : 'bg-primary-light'}`}
            >
              <div className="flex-shrink-0 pt-0.5">
                {notif.type === 'success' && (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notif.type === 'error' && (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm text-slate-800 font-medium">{notif.message}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(notif.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            No notifications yet.
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 rounded-b-md text-center">
        <button 
          onClick={goToNotifications}
          className="text-sm text-primary font-medium hover:text-blue-800"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
