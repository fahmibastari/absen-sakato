import { Card } from "@/components/ui/Card";

interface HistoryItem {
    id: string;
    fullName: string;
    checkInTime: string;
    checkOutTime: string;
    duration: number; // minutes
}

export function TodayHistoryList({ items }: { items: HistoryItem[] }) {
    if (items.length === 0) {
        return (
            <div className="text-coffee-500 italic text-center py-4 text-xs">
                Belum ada yang check-out hari ini.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-coffee-800/20 p-3 rounded-lg border border-coffee-800/50">
                    <div>
                        <p className="font-bold text-coffee-200 text-sm">{item.fullName}</p>
                        <p className="text-[10px] text-coffee-400">
                            {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                            {new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-coffee-300 font-bold text-xs">{item.duration} min</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
