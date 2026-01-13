import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="relative group">
            <input
                className={`
          w-full bg-coffee-800/50 border border-coffee-600/30 rounded-xl px-4 pt-6 pb-2 
          text-coffee-100 outline-none focus:border-coffee-300 transition-all peer
          placeholder-transparent
          ${className}
        `}
                placeholder={label}
                {...props}
            />
            <label
                className="
          absolute left-4 top-4 text-coffee-400 text-sm transition-all pointer-events-none
          peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-coffee-500
          peer-focus:top-1 peer-focus:text-xs peer-focus:text-coffee-300
          peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-xs
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
          w-full bg-coffee-800/50 border border-coffee-600/30 rounded-xl px-4 pt-6 pb-2 
          text-coffee-100 outline-none focus:border-coffee-300 transition-all peer resize-none
          placeholder-transparent
          ${className}
        `}
                placeholder={label}
                {...props}
            />
            <label
                className="
          absolute left-4 top-4 text-coffee-400 text-sm transition-all pointer-events-none
          peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-coffee-500
          peer-focus:top-1 peer-focus:text-xs peer-focus:text-coffee-300
          peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-xs
        "
            >
                {label}
            </label>
        </div>
    )
}
