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
        <div className="min-h-screen flex items-center justify-center p-6 bg-neo-green bg-dots md:pl-72 font-sans">
            <div className="w-full max-w-2xl">
                <Card className="bg-white border-4 border-neo-black shadow-neo-lg p-10 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neo-black text-white px-6 py-2 border-4 border-white shadow-neo transform -rotate-2">
                        <h1 className="text-2xl font-black uppercase tracking-widest">Access Pass</h1>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8 mt-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-neo-yellow border-4 border-neo-black mb-4 shadow-neo-sm">
                            <QrCode className="text-neo-black" size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-4xl font-black text-neo-black mb-2 uppercase">Checkpoint QR</h2>
                        <p className="text-gray-600 font-bold uppercase">Print this for the field agents.</p>
                    </div>

                    {/* QR Code Display */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-6 border-4 border-neo-black shadow-neo relative">
                            {/* Corner Accents */}
                            <div className="absolute -top-2 -left-2 w-4 h-4 bg-neo-black"></div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-neo-black"></div>
                            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-neo-black"></div>
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-neo-black"></div>

                            <img src={qrUrl} alt="QR Code" width={300} height={300} className="border-2 border-neo-black" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-gray-100 border-2 border-neo-black p-4 mb-6 font-mono text-center">
                        <div className="text-xs text-gray-400 mb-1 font-bold uppercase">PAYLOAD DATA</div>
                        <div className="text-sm text-neo-black font-black break-all">{qrData}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 bg-neo-black text-white px-6 py-4 border-4 border-transparent hover:border-neo-black hover:bg-neo-yellow hover:text-neo-black font-black uppercase tracking-wide transition-all shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            <Printer size={24} strokeWidth={3} />
                            PRINT
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white border-4 border-neo-black text-neo-black px-6 py-4 font-black uppercase tracking-wide hover:bg-neo-blue hover:text-white transition-all shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            <Download size={24} strokeWidth={3} />
                            DOWNLOAD
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 p-6 bg-neo-blue border-4 border-neo-black shadow-neo-sm">
                        <h3 className="font-black text-white mb-2 flex items-center gap-2 uppercase text-xl">
                            <span className="w-8 h-8 bg-white text-neo-black border-2 border-neo-black flex items-center justify-center text-sm">?</span>
                            Briefing
                        </h3>
                        <ul className="text-sm text-white font-bold space-y-2 ml-4 list-disc marker:text-neo-yellow">
                            <li>PRINT and MOUNT at entry point.</li>
                            <li>Agents SCAN to log attendance.</li>
                            <li>System logs data AUTOMATICALLY.</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
}
