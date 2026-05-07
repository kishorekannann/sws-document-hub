import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const uploadFiles = async (files, onProgress) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onProgress) {
        onProgress(percentCompleted);
      }
    }
  });
};

export const fetchFiles = () => api.get('/files').then(res => res.data);

export const downloadFile = (id, name) => {
  // Use a temporary anchor to trigger download instead of location.href to keep the page state
  const url = `/api/files/${id}/download`;
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const fetchNotifications = () => api.get('/notifications').then(res => res.data);

export const markRead = (id) => api.patch(`/notifications/${id}/read`).then(res => res.data);

export const markAllRead = () => api.patch('/notifications/read-all').then(res => res.data);

export const deleteFile = (id) => api.delete(`/files/${id}`).then(res => res.data);
