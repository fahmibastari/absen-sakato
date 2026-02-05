import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface User {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
}

interface MentionsInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string; // Add className prop
}

export default function MentionsInput({ value, onChange, placeholder, disabled, className }: MentionsInputProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPos, setCursorPos] = useState(0);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    // Fetch users once
    useEffect(() => {
        fetch('/api/users/lite')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUsers(data);
            })
            .catch(err => console.error("Failed to load users for mentions", err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newCursorPos = e.target.selectionStart;
        onChange(newValue);
        setCursorPos(newCursorPos);

        // Check for @ trigger
        // Find the last @ before cursor
        const lastAt = newValue.lastIndexOf('@', newCursorPos - 1);

        if (lastAt !== -1) {
            // Check if there's a space before @ (or it's start of string)
            const prevChar = lastAt > 0 ? newValue[lastAt - 1] : ' ';
            if (prevChar === ' ' || prevChar === '\n') {
                const textAfterAt = newValue.substring(lastAt + 1, newCursorPos);
                // If text after contains space, close suggestions (unless we want multi-word search, but username usually single word)
                if (!textAfterAt.includes(' ')) {
                    setQuery(textAfterAt);
                    setShowSuggestions(true);
                    return;
                }
            }
        }
        setShowSuggestions(false);
    };

    useEffect(() => {
        if (showSuggestions) {
            const lowerQuery = query.toLowerCase();
            const matches = users.filter(u =>
                u.username.toLowerCase().includes(lowerQuery) ||
                u.fullName.toLowerCase().includes(lowerQuery)
            ).slice(0, 5); // Limit to 5
            setFilteredUsers(matches);
        }
    }, [query, users, showSuggestions]);

    const handleSelectUser = (user: User) => {
        // Replace @query with @username
        const lastAt = value.lastIndexOf('@', cursorPos - 1);
        if (lastAt !== -1) {
            const prefix = value.substring(0, lastAt);
            const suffix = value.substring(cursorPos);
            // We use username for the actual text value
            const newValue = `${prefix}@${user.username} ${suffix}`;
            onChange(newValue);
            setShowSuggestions(false);

            // Restore focus and cursor roughly
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    const newPos = lastAt + 1 + user.username.length + 1;
                    inputRef.current.setSelectionRange(newPos, newPos);
                }
            }, 50);
        }
    };

    return (
        <div className="relative flex-1">
            <textarea
                ref={inputRef}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className={className} // Pass className through
            />

            {showSuggestions && filteredUsers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white border-2 border-neo-black shadow-neo z-50 max-h-40 overflow-y-auto">
                    {filteredUsers.map(user => (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full text-left p-2 hover:bg-neo-yellow flex items-center gap-2 transition-colors border-b border-gray-100 last:border-0"
                        >
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 border border-neo-black shrink-0">
                                {user.avatarUrl ? (
                                    <Image src={user.avatarUrl} alt={user.username} width={24} height={24} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                        {user.fullName[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-sm text-neo-black">{user.fullName}</div>
                                <div className="text-[10px] text-gray-500">@{user.username}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
