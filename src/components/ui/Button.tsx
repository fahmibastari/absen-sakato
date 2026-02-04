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
    const baseStyles = "w-full py-3 px-6 font-bold border-2 border-neo-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

    const variants = {
        primary: "bg-neo-yellow text-neo-black shadow-neo hover:bg-[#D4EE00]",
        secondary: "bg-neo-blue text-white shadow-neo hover:bg-blue-600",
        outline: "bg-white text-neo-black shadow-neo hover:bg-gray-50",
        danger: "bg-neo-pink text-white shadow-neo hover:bg-red-500",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-inherit border-t-transparent rounded-full animate-spin"></span>
            ) : children}
        </button>
    );
};
