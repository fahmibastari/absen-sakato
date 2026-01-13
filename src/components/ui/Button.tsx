import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    ...props
}) => {
    const baseStyles = "w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2";

    const variants = {
        primary: "bg-coffee-300 text-coffee-900 hover:bg-coffee-200 shadow-lg shadow-coffee-300/20",
        secondary: "bg-coffee-600 text-coffee-100 hover:bg-coffee-500",
        outline: "border-2 border-coffee-300 text-coffee-300 hover:bg-coffee-300/10",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : children}
        </button>
    );
};
