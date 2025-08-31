import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Create axios instance for FileUpload with proper baseURL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  timeout: 30000,
});

export default function FileUpload({ onFileUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      console.log('Checking backend health at:', 'http://localhost:5000/api/health');
      const response = await api.get('/health');
      console.log('Health check response:', response.data);
      return response.data.success || response.data.status === 'OK';
    } catch (err) {
      console.error('Backend health check failed:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      return false;
    }
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError(null);
    setSuccess(null);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.');
      } else {
        setError('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      // Check if backend is healthy before uploading
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        setError('Backend server is not responding. Please wait a moment and try again.');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('document', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess(`Document "${file.name}" uploaded successfully!`);
        setTimeout(() => {
          onFileUploaded(response.data.documentId);
        }, 1500);
      } else {
        setError(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Upload failed';
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running and try again.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. Please try with a smaller file or check your connection.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File is too large. Please use a smaller file.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const getDropzoneStyles = () => {
    if (isDragReject) return 'border-danger-300 bg-danger-50';
    if (isDragActive) return 'border-primary-300 bg-primary-50';
    return 'border-gray-300 bg-white hover:bg-gray-50';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
          ${getDropzoneStyles()}
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-gray-700 mb-2">Uploading Document...</p>
            <p className="text-sm text-gray-500">Please wait while we process your file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            
            {isDragActive ? (
              <div>
                <p className="text-lg font-medium text-primary-600 mb-2">Drop your document here</p>
                <p className="text-sm text-gray-600">Release to upload</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag & drop your document here
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  or <span className="text-primary-600 font-medium">click to browse</span>
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <File className="w-4 h-4 mr-1" />
                    PDF, DOC, DOCX, TXT
                  </span>
                  <span>•</span>
                  <span>Max 10MB</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-success-800 font-medium">{success}</p>
            <p className="text-success-600 text-sm mt-1">
              Proceeding to analysis...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-danger-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-danger-800 font-medium">Upload Failed</p>
            <p className="text-danger-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Supported File Types */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Supported document types:</p>
        <div className="flex justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded mr-2"></div>
            PDF Documents
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded mr-2"></div>
            Word Documents
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded mr-2"></div>
            Text Files
          </div>
        </div>
      </div>
    </div>
  );
}
