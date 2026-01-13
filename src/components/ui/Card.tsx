import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <div className={`glass-card rounded-2xl p-6 ${className}`}>
            {children}
        </div>
    );
};
