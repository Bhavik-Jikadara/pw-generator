// src/components/ui/alert.jsx
import React from 'react';

export const Alert = ({ children, className = '' }) => {
    return (
      <div className={`bg-gray-100 p-4 rounded-lg ${className}`}>
        {children}
      </div>
    );
  };
  
  export const AlertDescription = ({ children, className = '' }) => {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        {children}
      </div>
    );
  };