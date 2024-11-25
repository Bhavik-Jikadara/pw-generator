import React from 'react';

export const Slider = ({ 
  value, 
  onValueChange, 
  min, 
  max, 
  step = 1, 
  className = '' 
}) => {
  const handleChange = (e) => {
    onValueChange([parseInt(e.target.value)]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
        dark:bg-gray-700 accent-blue-500 ${className}`}
    />
  );
};