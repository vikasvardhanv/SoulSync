// Debug component for testing image upload functionality
import React, { useState } from 'react';
import { imagesAPI } from '../services/api';
import toast from 'react-hot-toast';

const ImageUploadDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testApiConnection = async () => {
    try {
      setLoading(true);
      const response = await imagesAPI.testConnection();
      toast.success('API connection test successful');
      setResults(prev => [...prev, {
        test: 'API Connection',
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      }]);
    } catch (error: any) {
      toast.error('API connection test failed');
      setResults(prev => [...prev, {
        test: 'API Connection',
        success: false,
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const testFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      console.log('Testing file upload:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const response = await imagesAPI.uploadSingle(formData, (progress) => {
        console.log('Upload progress:', progress + '%');
      });

      toast.success('File upload test successful');
      setResults(prev => [...prev, {
        test: 'File Upload',
        success: true,
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        data: response.data,
        timestamp: new Date().toISOString()
      }]);
    } catch (error: any) {
      console.error('File upload test failed:', error);
      toast.error('File upload test failed');
      setResults(prev => [...prev, {
        test: 'File Upload',
        success: false,
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        error: {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          details: error.response?.data
        },
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      testFileUpload(file);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Image Upload Debug Tool</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Test File Upload:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Test Results:</h3>
        {results.length === 0 ? (
          <p className="text-gray-500">No tests run yet</p>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{result.test}</h4>
                <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.success ? '✅ Success' : '❌ Failed'}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 mb-2">{result.timestamp}</p>
              
              {result.file && (
                <div className="mb-2">
                  <strong>File:</strong> {result.file.name} ({(result.file.size / 1024 / 1024).toFixed(2)} MB, {result.file.type})
                </div>
              )}
              
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(result.success ? result.data : result.error, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium mb-2">Debug Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• First test API connection to ensure backend is reachable</li>
          <li>• Check browser console for additional error details</li>
          <li>• Verify authentication token is being sent</li>
          <li>• Try uploading different file sizes and formats</li>
          <li>• Check network tab in browser dev tools</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadDebug;