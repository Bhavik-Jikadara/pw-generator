// src/components/ui/button.jsx
import React from 'react';

export const Button = ({ children, className = '', ...props }) => {
    return (
        <button
            className={`px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 
      transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
      focus:ring-offset-2 disabled:opacity-50 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};