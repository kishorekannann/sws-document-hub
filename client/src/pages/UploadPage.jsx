import React, { useState, useEffect } from 'react';
import DropZone from '../components/DropZone';
import FileProgressItem from '../components/FileProgressItem';
import DocumentTable from '../components/DocumentTable';
import { uploadFiles, fetchFiles } from '../api';

const UploadPage = () => {
  const [documents, setDocuments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const loadFiles = () => {
    fetchFiles()
      .then(data => setDocuments(data.files || []))
      .catch(err => console.error("Error loading files", err));
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDropFiles = async (acceptedFiles) => {
    const newUploads = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending',
      originalFile: file
    }));

    setUploadingFiles(prev => [...newUploads, ...prev]);

    try {
      // Simulate individual file progress
      const totalSize = newUploads.reduce((acc, f) => acc + f.size, 0);
      
      const onProgress = (overallPercent) => {
        setUploadingFiles(prev => prev.map(uf => {
          // If this file was part of the batch we just sent
          const isCurrentBatch = newUploads.find(nu => nu.id === uf.id);
          if (isCurrentBatch) {
            return { ...uf, progress: overallPercent, status: overallPercent === 100 ? 'complete' : 'uploading' };
          }
          return uf;
        }));
      };

      await uploadFiles(acceptedFiles, onProgress);
      loadFiles(); // Refresh document table after upload
      
      // Clear completed uploads after 3 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(uf => uf.status !== 'complete'));
      }, 3000);

    } catch (error) {
      console.error("Upload failed", error);
      setUploadingFiles(prev => prev.map(uf => {
        const isCurrentBatch = newUploads.find(nu => nu.id === uf.id);
        if (isCurrentBatch) {
          return { ...uf, status: 'failed' };
        }
        return uf;
      }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* Info Banner */}
      <div className="bg-primary-light border border-blue-200 rounded-lg p-4 mb-8 flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-primary font-medium">
            Simulated demo — files are processed client-side only, nothing is stored. 
            Upload <span className="font-bold">1–3 files</span> to see individual per-file progress bars. 
            Upload <span className="font-bold">4 or more files</span> to trigger the bulk notification flow.
          </p>
        </div>
      </div>

      {/* DropZone */}
      <div className="mb-8">
        <DropZone onDropFiles={handleDropFiles} />
      </div>

      {/* Uploading Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Uploading Files</h3>
          <div className="space-y-2">
            {uploadingFiles.map(file => (
              <FileProgressItem key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}

      {/* Document Library */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Document Library</h3>
        <DocumentTable files={documents} />
      </div>
      
    </div>
  );
};

export default UploadPage;
