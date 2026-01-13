'use client';

import { Card } from "@/components/ui/Card";
import { Download, Printer, QrCode } from "lucide-react";

export default function AdminQRPage() {
    const qrData = JSON.stringify({
        app: "sakato",
        type: "attendance"
    });

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-brown-50 via-white to-green-50 md:pl-72">
            <div className="w-full max-w-2xl">
                <Card className="bg-white border border-brown-100 shadow-2xl p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                            <QrCode className="text-green-600" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-brown-900 mb-2">QR Code Generator</h1>
                        <p className="text-brown-600">Print and display this code at your check-in station</p>
                    </div>

                    {/* QR Code Display */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gradient-to-br from-brown-100 to-brown-50 p-8 rounded-3xl border-4 border-brown-200 shadow-xl">
                            <img src={qrUrl} alt="QR Code" width={300} height={300} className="rounded-xl" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-brown-50 rounded-xl p-4 mb-6 border border-brown-200">
                        <div className="text-xs text-brown-600 mb-1 font-semibold uppercase tracking-wide">QR Data</div>
                        <div className="font-mono text-sm text-brown-900 break-all">{qrData}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-mustard-500 to-mustard-600 text-white px-6 py-4 rounded-xl font-bold hover:from-mustard-600 hover:to-mustard-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Printer size={20} />
                            Print QR Code
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white border-2 border-brown-200 text-brown-700 px-6 py-4 rounded-xl font-bold hover:bg-brown-50 transition-all">
                            <Download size={20} />
                            Download
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                        <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">i</span>
                            How to Use
                        </h3>
                        <ul className="text-sm text-green-800 space-y-1 ml-8 list-disc">
                            <li>Print this QR code in a visible location</li>
                            <li>Users scan the code to check in/out</li>
                            <li>Each scan is automatically logged in the system</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
}
