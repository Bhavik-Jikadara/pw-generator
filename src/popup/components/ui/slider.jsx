// src/components/ui/slider.jsx
import React from 'react';

export const Slider = ({ value, onValueChange, min, max, step = 1 }) => {
    return (
        <input
            type="range"
            value={value[0]}
            onChange={(e) => onValueChange([parseInt(e.target.value)])}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
    );
};