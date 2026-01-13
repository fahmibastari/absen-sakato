'use client';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
    onScan: (decodedText: string) => void;
    onError?: (error: any) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        // ID of the element to render the camera stream
        const elementId = "qr-reader-video";

        async function startScanner() {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    setHasPermission(true);

                    const scanner = new Html5Qrcode(elementId);
                    scannerRef.current = scanner;

                    await scanner.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                        },
                        (decodedText) => {
                            // IMMEDIATE STOP
                            if (!scannerRef.current) return;
                            scannerRef.current.pause(true); // Pause scanning
                            onScan(decodedText);
                        },
                        (errorMessage) => {
                            if (onError) onError(errorMessage);
                        }
                    );
                } else {
                    setHasPermission(false);
                    alert("Kamera tidak ditemukan");
                }
            } catch (err) {
                console.error("Camera error", err);
                setHasPermission(false);
            }
        }

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(console.error);
            }
        };
    }, []);

    return (
        <div className="w-full aspect-square bg-black rounded-xl overflow-hidden relative">
            <div id="qr-reader-video" className="w-full h-full object-cover"></div>

            {/* Overlay Frame */}
            <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none z-10">
                <div className="w-full h-full border-2 border-coffee-300 relative opacity-50">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-coffee-300"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-coffee-300"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-coffee-300"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-coffee-300"></div>
                </div>
            </div>

            {hasPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center text-white p-4 text-center">
                    Izin kamera diperlukan untuk scan.
                </div>
            )}
        </div>
    );
}
