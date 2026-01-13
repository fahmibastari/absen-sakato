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
        <div className="min-h-screen bg-gradient-to-br from-brown-50 via-white to-mustard-50 p-6 md:pl-72 pb-24 pt-8">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-brown-900 mb-1">Menu Management</h1>
                    <p className="text-brown-600">Curate your coffee shop menu</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} variant="primary" className="bg-mustard-500 hover:bg-mustard-600">
                    {isAdding ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                    {isAdding ? 'Cancel' : 'Add Item'}
                </Button>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="mb-8 animate-slideDown">
                    <Card className="bg-white border-2 border-mustard-200 shadow-lg p-6">
                        <form onSubmit={handleAdd} className="space-y-4">
                            <h3 className="font-bold text-lg mb-4 text-brown-900 flex items-center gap-2">
                                <Package size={20} />
                                New Menu Item
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Item Name *" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required placeholder="e.g. Kopi Susu Aren" />
                                <Input label="Image URL" value={newItem.imageUrl} onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <TextArea label="Description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Delicious description..." />

                            <div className="flex justify-end pt-4">
                                <Button type="submit" isLoading={submitting} variant="primary">
                                    <Plus size={18} className="mr-2" />
                                    Create Menu Item
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Menu Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menus.map(item => (
                    <div key={item.id} className="group relative bg-white border border-brown-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                        {/* Image */}
                        <div className="h-48 bg-gradient-to-br from-brown-100 to-brown-50 w-full relative overflow-hidden">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Coffee className="text-brown-300" size={64} />
                                </div>
                            )}
                            {/* Delete Button Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleDelete(item.id)} className="bg-red-500 p-3 rounded-full text-white hover:bg-red-600 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-brown-900 mb-2">{item.name}</h3>
                            <p className="text-sm text-brown-600 line-clamp-2 h-10">{item.description || 'No description provided.'}</p>
                            <div className="mt-4 pt-4 border-t border-brown-100">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {menus.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-brown-100 rounded-full mb-4">
                            <Coffee className="text-brown-400" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-brown-900 mb-2">No menu items yet</h3>
                        <p className="text-brown-600 mb-6">Start building your menu by adding your first item</p>
                        <Button onClick={() => setIsAdding(true)} variant="primary">
                            <Plus size={18} className="mr-2" />
                            Add First Item
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
