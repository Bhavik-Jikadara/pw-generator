import React from 'react';

export const Card = ({ children, className }) => {
    return (
        <div className={`bg-white shadow rounded-lg ${className || ''}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className }) => {
    return (
        <div className={`border-b p-4 ${className || ''}`}>
            {children}
        </div>
    );
};

export const CardTitle = ({ children, className }) => {
    return (
        <h2 className={`text-lg font-semibold ${className || ''}`}>
            {children}
        </h2>
    );
};

export const CardDescription = ({ children, className }) => {
    return (
        <p className={`text-sm text-gray-500 ${className || ''}`}>
            {children}
        </p>
    );
};

export const CardContent = ({ children, className }) => {
    return (
        <div className={`p-4 ${className || ''}`}>
            {children}
        </div>
    );
};

export const CardFooter = ({ children, className }) => {
    return (
        <div className={`p-4 pt-0 ${className || ''}`}>
            {children}
        </div>
    );
};

export default Card;
