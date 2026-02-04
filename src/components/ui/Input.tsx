import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="relative group">
            <input
                className={`
          w-full bg-white border-2 border-neo-black rounded-none px-4 pt-6 pb-2 
          text-neo-black outline-none focus:bg-neo-yellow/10 transition-all peer
          placeholder-transparent
          ${className}
        `}
                placeholder={label}
                {...props}
            />
            <label
                className="
          absolute left-4 top-4 text-gray-500 text-sm transition-all pointer-events-none font-bold
          peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
          peer-focus:top-1 peer-focus:text-xs peer-focus:text-neo-black
          peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-neo-black
        "
            >
                {label}
            </label>
        </div>
    );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className = '', ...props }) => {
    return (
        <div className="relative group">
            <textarea
                className={`
          w-full bg-white border-2 border-neo-black rounded-none px-4 pt-6 pb-2 
          text-neo-black outline-none focus:bg-neo-yellow/10 transition-all peer resize-none
          placeholder-transparent
          ${className}
        `}
                placeholder={label}
                {...props}
            />
            <label
                className="
          absolute left-4 top-4 text-gray-500 text-sm transition-all pointer-events-none font-bold
          peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-500
          peer-focus:top-1 peer-focus:text-xs peer-focus:text-neo-black
          peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-neo-black
        "
            >
                {label}
            </label>
        </div>
    )
}
