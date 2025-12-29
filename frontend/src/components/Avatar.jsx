import React from 'react';

const Avatar = ({ name, size = "w-10 h-10", textSize = "text-lg", className = "" }) => {
    // Safe check: if name is missing, use "?"
    const initial = name ? name.charAt(0).toUpperCase() : "?";

    return (
        <div className={`${size} ${textSize} rounded-full bg-white border border-red-500 text-red-500 flex items-center justify-center font-bold shadow-sm flex-shrink-0 select-none ${className}`}>
            {initial}
        </div>
    );
};

export default Avatar;
