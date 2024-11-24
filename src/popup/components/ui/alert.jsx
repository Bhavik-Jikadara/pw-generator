// src/components/ui/alert.jsx
import React from 'react';

export const Alert = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`p-4 mb-4 rounded-lg bg-blue-100 text-blue-800 ${className}`}
            role="alert"
            {...props}
        >
            {children}
        </div>
    );
};