// src/components/FileUpload.jsx
import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

const FileUpload = ({ 
  value, 
  onChange, 
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '' 
}) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.size <= maxSize) {
      onChange(file);
    }
  }, [maxSize, onChange]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= maxSize) {
      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {value.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(value)}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="ml-4">
                <p className="font-medium">{value.name}</p>
                <p className="text-sm text-gray-500">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag & drop or <label className="text-primary-600 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleChange}
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Max file size: {maxSize / 1024 / 1024}MB
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;