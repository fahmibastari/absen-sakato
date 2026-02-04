import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Clock, CalendarDays, LogIn, LogOut } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white border-4 border-neo-black border-dashed">
                <Clock className="w-12 h-12 mb-2 text-gray-400" strokeWidth={3} />
                <p className="font-black uppercase text-gray-500">Log Empty.</p>
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

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h}H ${m}M`;
        return `${m}M`;
    };

    return (
        <div className="space-y-4">
            {Object.entries(grouped).map(([date, data], index) => {
                const isExpanded = expandedDates[date] ?? (index === 0);

                return (
                    <div key={date} className="border-4 border-neo-black bg-white shadow-neo-sm">
                        {/* Header */}
                        <button
                            onClick={() => toggleDate(date)}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-neo-yellow transition-colors border-b-4 border-neo-black last:border-b-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neo-black text-white shadow-sm transform -rotate-3">
                                    <CalendarDays size={20} strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-black text-neo-black text-sm uppercase">{date}</h4>
                                    <p className="text-[10px] font-bold uppercase bg-neo-blue text-white inline-block px-1 mt-1">
                                        {data.items.length} SESSIONS
                                    </p>
                                </div>
                            </div>
                            {isExpanded ? <ChevronDown size={24} strokeWidth={3} className="text-neo-black" /> : <ChevronRight size={24} strokeWidth={3} className="text-neo-black" />}
                        </button>

                        {/* Content */}
                        {isExpanded && (
                            <div className="p-2 space-y-2 bg-gray-100 border-t-0">
                                {data.items.map((item) => (
                                    <div key={item.id} className="relative bg-white p-3 border-2 border-neo-black shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-black text-neo-black text-sm uppercase leading-none">{item.fullName}</p>
                                            <span className="font-mono font-bold text-xs bg-neo-black text-white px-1">
                                                {formatDuration(item.duration)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs font-bold font-mono">
                                            <div className="flex items-center gap-1 text-green-700 bg-green-50 p-1 border border-green-200">
                                                <LogIn size={12} strokeWidth={3} />
                                                {format(new Date(item.checkInTime), 'HH:mm')}
                                            </div>
                                            <div className="flex items-center gap-1 text-red-700 bg-red-50 p-1 border border-red-200">
                                                <LogOut size={12} strokeWidth={3} />
                                                {format(new Date(item.checkOutTime), 'HH:mm')}
                                            </div>
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
