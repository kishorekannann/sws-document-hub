import React from 'react';

const FileProgressItem = ({ file }) => {
  // Format size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3 flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex-shrink-0 text-slate-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 w-full pr-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-slate-800 truncate">{file.name}</h4>
            <span className="text-xs font-medium px-2 py-0.5 rounded uppercase
              ${file.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
              {file.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            {formatSize(file.size)} · {file.type || 'Unknown Type'}
          </p>
          <div className="w-full bg-slate-200 rounded-full h-1.5 flex items-center">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${file.progress}%` }}
            ></div>
            <span className="text-xs text-slate-500 ml-2 mt-[-10px] absolute right-4">
              {file.progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileProgressItem;
