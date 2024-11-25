import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ value, onValueChange, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    const handleOutsideClick = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <SelectTrigger
                onClick={() => setIsOpen((prev) => !prev)}
                value={value}
            />
            {isOpen && (
                <SelectContent>
                    {React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                            onValueChange,
                            closeDropdown: () => setIsOpen(false),
                            isSelected: child.props.value === value // Highlight selected item
                        })
                    )}
                </SelectContent>
            )}
        </div>
    );
};

export const SelectTrigger = ({ onClick, value }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 border rounded-md cursor-pointer hover:bg-gray-200"
    >
        <SelectValue value={value} />
        <span className="ml-2">&#9662;</span> {/* Downward arrow */}
    </button>
);

export const SelectValue = ({ value }) => (
    <span>{value || 'Select an option'}</span>
);

export const SelectContent = ({ children }) => (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
        {children}
    </div>
);

export const SelectItem = ({ value, onValueChange, closeDropdown, isSelected }) => {
    const handleClick = () => {
        onValueChange(value);
        closeDropdown();
    };

    return (
        <div
            onClick={handleClick}
            className={`px-4 py-2 cursor-pointer ${isSelected ? 'bg-gray-300' : 'hover:bg-gray-200'
                }`}
        >
            {value}
        </div>
    );
};
