import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Clock, CalendarDays } from "lucide-react";
import { id } from "date-fns/locale";

interface HistoryItem {
    id: string;
    fullName: string;
    checkInTime: string;
    checkOutTime: string;
    duration: number; // minutes
}

type GroupedHistory = {
    [date: string]: {
        totalDuration: number;
        items: HistoryItem[];
    };
};

export function TodayHistoryList({ items }: { items: HistoryItem[] }) {
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center text-brown-400">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm italic">Belum ada riwayat aktivitas.</p>
            </div>
        );
    }

    // Group items by date
    const grouped = items.reduce<GroupedHistory>((acc, item) => {
        const dateKey = format(new Date(item.checkOutTime), 'EEEE, d MMMM yyyy', { locale: id });
        if (!acc[dateKey]) {
            acc[dateKey] = { totalDuration: 0, items: [] };
        }
        acc[dateKey].items.push(item);
        acc[dateKey].totalDuration += item.duration;
        return acc;
    }, {});

    const toggleDate = (date: string) => {
        setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
    };

    // Helper to format minutes to Hours & Minutes
    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h} jam ${m} menit`;
        return `${m} menit`;
    };

    return (
        <div className="space-y-4">
            {Object.entries(grouped).map(([date, data], index) => {
                // Default expand the first (latest) date
                const isExpanded = expandedDates[date] ?? (index === 0);

                return (
                    <div key={date} className="border border-brown-100 rounded-xl overflow-hidden bg-white shadow-sm">
                        {/* Header */}
                        <button
                            onClick={() => toggleDate(date)}
                            className="w-full flex items-center justify-between p-4 bg-brown-50 hover:bg-brown-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-brown-600 shadow-sm">
                                    <CalendarDays size={18} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-brown-900 text-sm">{date}</h4>
                                    <p className="text-xs text-brown-500">
                                        Total Check-in: <span className="font-semibold text-mustard-700">{data.items.length} Akun</span>
                                    </p>
                                </div>
                            </div>
                            {isExpanded ? <ChevronDown size={20} className="text-brown-400" /> : <ChevronRight size={20} className="text-brown-400" />}
                        </button>

                        {/* Content */}
                        {isExpanded && (
                            <div className="p-3 space-y-2 bg-white">
                                {data.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-mustard-200 transition-colors">
                                        <div>
                                            <p className="font-bold text-brown-800 text-sm">{item.fullName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                                                    IN: {format(new Date(item.checkInTime), 'HH:mm')}
                                                </span>
                                                <span className="text-gray-300">➜</span>
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                                                    OUT: {format(new Date(item.checkOutTime), 'HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-mustard-700 font-bold text-xs">{formatDuration(item.duration)}</span>
                                            <span className="text-[10px] text-gray-400">Durasi</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
