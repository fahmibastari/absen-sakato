'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface SpinWheelProps {
    items: string[];
    onWin: (item: string) => void;
}

export default function SpinWheel({ items, onWin }: SpinWheelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    // Config
    const spinDuration = 5000; // ms

    useEffect(() => {
        drawWheel(0);
    }, [items]);

    function drawWheel(rotation: number) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;
        const step = (2 * Math.PI) / items.length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        items.forEach((item, i) => {
            const startAngle = i * step + rotation;
            const endAngle = (i + 1) * step + rotation;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            // Colors
            ctx.fillStyle = i % 2 === 0 ? '#D4A373' : '#3E3834'; // Coffee Gold / Dark
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + step / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = i % 2 === 0 ? '#1F1D1B' : '#F3E9DC';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(item, radius - 20, 5);
            ctx.restore();
        });

        // Pointer
        ctx.beginPath();
        ctx.moveTo(centerX + 20, centerY); // Right side pointer
        ctx.lineTo(canvas.width - 20, centerY - 10);
        ctx.lineTo(canvas.width - 20, centerY + 10);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();
    }

    function spin() {
        if (isSpinning || items.length === 0) return;
        setIsSpinning(true);
        setWinner(null);

        // 1. Pick Winner Randomly
        const winningIndex = Math.floor(Math.random() * items.length);
        const wonItem = items[winningIndex];

        // 2. Calculate Angle to stop at
        // Segment arc length
        const step = (2 * Math.PI) / items.length;
        // Center of winning segment
        const segmentCenter = (winningIndex * step) + (step / 2);

        // We want this center to align with the pointer at Angle = 0 (Right/East)
        // Current position: segmentCenter
        // Target position: 0 (or 2PI)
        // Rotation needed R: segmentCenter + R = 0 (mod 2PI) => R = -segmentCenter
        // But we want positive spins.
        // Let's rotate backwards to align 0? No, standard canvas spin is usually clockwise (positive angle additions).
        // My drawWheel uses `startAngle = i * step + rotation`.
        // If rotation increases, segments move visually clockwise.
        // Pointer is at 0.
        // We want `segmentCenter + rotation = 0 + 2PIN`.
        // rotation = 2PI * 5 (min spins) + (2PI - segmentCenter).

        // Add random jitter within the segment for realism (optional)
        // const jitter = (Math.random() - 0.5) * step * 0.8; 

        const extraSpins = 5;
        const targetRotation = (Math.PI * 2 * extraSpins) + (Math.PI * 2 - segmentCenter);

        let start: number | null = null;

        function animate(timestamp: number) {
            if (!start) start = timestamp;
            const progress = timestamp - start;

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress / spinDuration, 3);
            const currentRotation = targetRotation * ease;

            drawWheel(currentRotation);

            if (progress < spinDuration) {
                requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                setWinner(wonItem);
                onWin(wonItem);
            }
        }

        requestAnimationFrame(animate);
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="rounded-full shadow-2xl border-4 border-coffee-600 cursor-pointer"
                onClick={spin}
            />
            <Button onClick={spin} disabled={isSpinning || items.length === 0} className="w-full max-w-xs " variant="primary">
                {isSpinning ? 'Rolling...' : 'PUTAR RODA!'}
            </Button>
            {winner && (
                <div className="bg-yellow-900/40 p-4 rounded-xl border border-yellow-500 animate-bounce">
                    <p className="text-coffee-300 text-xs uppercase font-bold tracking-widest text-center">Winner</p>
                    <p className="text-2xl font-bold text-yellow-400 text-center">{winner}</p>
                </div>
            )}
        </div>
    );
}
