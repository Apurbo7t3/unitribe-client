// src/components/Input.jsx - IMPROVED VERSION
import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  leftIcon, 
  rightIcon, 
  error, 
  disabled = false,
  required = false,
  className = '',
  helperText,
  ...props 
}) => {
  const baseStyles = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200';
  const disabledStyles = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  
  return (
    <div className={`w-full mb-4 ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <div className="text-gray-400">{leftIcon}</div>
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            className={`${baseStyles} ${disabledStyles} ${errorStyles} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            rows={props.rows || 4}
            {...props}
          />
        ) : (
          <input
            type={type}
            className={`${baseStyles} ${disabledStyles} ${errorStyles} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            {...props}
          />
        )}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="text-gray-400">{rightIcon}</div>
          </div>
        )}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;