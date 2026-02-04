import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [show, setShow] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!show) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-neo-black/90 backdrop-blur-sm" onClick={onClose} />
            <div
                className={`
                    relative w-full max-w-lg bg-white border-4 border-neo-black shadow-[8px_8px_0px_#000]
                    transform transition-all duration-200
                    ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
                `}
            >
                <div className="flex items-center justify-between p-4 bg-neo-yellow border-b-4 border-neo-black">
                    <h3 className="text-xl font-black uppercase text-neo-black tracking-wide">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-neo-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-none"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
