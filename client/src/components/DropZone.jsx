import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const DropZone = ({ onDropFiles }) => {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      onDropFiles(acceptedFiles);
    }
  }, [onDropFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 20 * 1024 * 1024 // 20 MB
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary-light' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
    >
      <input {...getInputProps()} />
      <div className="flex justify-center mb-4">
        <div className="bg-slate-100 p-3 rounded-lg text-slate-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        Drop files here or click to browse
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Any file type · Up to 20 MB per file
      </p>
      
      <div className="flex items-center justify-center space-x-3">
        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
          Single file
        </span>
        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
          Bulk upload
        </span>
        <span className="bg-primary-light text-primary text-xs font-semibold px-3 py-1 rounded-full">
          Try 4+ files to trigger notifications
        </span>
      </div>
    </div>
  );
};

export default DropZone;
