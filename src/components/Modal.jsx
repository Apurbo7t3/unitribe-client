// src/components/Modal.jsx - FIXED WITH PROPER STYLING
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Optional Footer - if needed */}
        {/* <div className="px-6 py-4 border-t">
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button>Save</Button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Modal;