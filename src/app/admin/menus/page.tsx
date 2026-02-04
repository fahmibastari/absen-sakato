'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Coffee, Plus, Trash2, X, ImageIcon, Package } from 'lucide-react';

export default function MenuManagementPage() {
    const [menus, setMenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        imageUrl: '',
        isAvailable: true
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadMenus();
    }, []);

    async function loadMenus() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch('/api/admin/menus', {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setMenus(data);
        }
        setLoading(false);
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const { data: { session } } = await supabase.auth.getSession();

        await fetch('/api/admin/menus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(newItem)
        });

        setIsAdding(false);
        setNewItem({ name: '', description: '', imageUrl: '', isAvailable: true });
        loadMenus();
        setSubmitting(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure?')) return;
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`/api/admin/menus?id=${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        loadMenus();
    }

    return (
        <div className="min-h-screen bg-neo-green bg-dots p-6 md:pl-72 pb-24 pt-8 font-sans">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 border-4 border-neo-black shadow-neo">
                <div>
                    <h1 className="text-4xl font-black text-neo-black mb-1 uppercase tracking-tighter">Inventory</h1>
                    <p className="text-gray-600 font-bold uppercase">Curate the goods</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} variant="primary" className="bg-neo-black text-white hover:bg-neo-yellow hover:text-neo-black border-2 border-white">
                    {isAdding ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                    {isAdding ? 'CANCEL' : 'ADD ITEM'}
                </Button>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="mb-8 animate-slideDown relative">
                    <div className="absolute inset-0 bg-neo-black translate-x-2 translate-y-2"></div>
                    <Card className="relative bg-white border-4 border-neo-black p-8 z-10">
                        <form onSubmit={handleAdd} className="space-y-6">
                            <h3 className="font-black text-2xl mb-4 text-neo-black flex items-center gap-2 uppercase">
                                <Package size={28} strokeWidth={3} />
                                New Stock Entry
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="ITEM NAME *" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required placeholder="e.g. KOPI SUSU AREN" />
                                <Input label="IMAGE URL" value={newItem.imageUrl} onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <TextArea label="DESCRIPTION" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Write something punchy..." />

                            <div className="flex justify-end pt-4">
                                <Button type="submit" isLoading={submitting} variant="primary" className="w-full md:w-auto">
                                    <Plus size={18} className="mr-2" />
                                    CREATE MENU ITEM
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Menu Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menus.map(item => (
                    <div key={item.id} className="group relative bg-white border-4 border-neo-black overflow-hidden shadow-neo-sm hover:shadow-neo hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
                        {/* Image */}
                        <div className="h-48 bg-neo-yellow/20 w-full relative overflow-hidden border-b-4 border-neo-black">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <Coffee className="text-gray-400" size={64} />
                                </div>
                            )}
                            {/* Delete Button Overlay */}
                            <div className="absolute top-2 right-2">
                                <button onClick={() => handleDelete(item.id)} className="bg-neo-pink border-2 border-neo-black p-2 text-white hover:bg-red-600 shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 relative">
                            <h3 className="font-black text-xl text-neo-black mb-2 uppercase leading-none">{item.name}</h3>
                            <p className="text-xs font-bold text-gray-500 line-clamp-2 h-8 uppercase mb-4">{item.description || 'NO DESCRIPTION.'}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 border-2 border-neo-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] ${item.isAvailable ? 'bg-neo-green text-neo-black' : 'bg-neo-pink text-white'}`}>
                                    {item.isAvailable ? 'IN STOCK' : 'SOLD OUT'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {menus.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center bg-white border-4 border-neo-black border-dashed">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-neo-yellow border-4 border-neo-black rounded-none mb-6 shadow-neo">
                            <Coffee className="text-neo-black" size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-neo-black mb-2 uppercase">NO ITEMS IN GRID</h3>
                        <p className="text-gray-600 font-bold mb-8 uppercase">Initialize your supply chain.</p>
                        <Button onClick={() => setIsAdding(true)} variant="primary">
                            <Plus size={18} className="mr-2" />
                            ADD FIRST ITEM
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
