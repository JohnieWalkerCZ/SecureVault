"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Lock, Loader2, Copy, CheckCheck } from "lucide-react";
import { useCrypto } from "@/components/CryptoContext";
import { decryptData, encryptData } from "@/lib/crypto";
import { signOut, useSession } from "next-auth/react";

type Secret = {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
};

export default function Dashboard() {
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const { masterKey } = useCrypto();
    const { status } = useSession();

    useEffect(() => {
        fetchSecrets();
    }, []);

    useEffect(() => {
        if (status === "authenticated" && masterKey === null) {
            signOut({ callbackUrl: "/login" });
        }
    }, [status, masterKey]);

    const handleCreateSecret = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (!masterKey) throw new Error("No master key found");

            const encryptedTitle = await encryptData(newTitle, masterKey);
            const encryptedContent = await encryptData(newContent, masterKey);

            const payload = {
                title: encryptedTitle.ciphertext,
                titleIv: encryptedTitle.iv,
                content: encryptedContent.ciphertext,
                contentIv: encryptedContent.iv,
            };

            const res = await fetch("/api/vault", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save");

            await fetchSecrets();
            setIsDialogOpen(false);
            setNewTitle("");
            setNewContent("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const fetchSecrets = async () => {
        setIsLoading(true);
        try {
            if (!masterKey) return;

            const res = await fetch("/api/vault");
            if (!res.ok) throw new Error("Failed to fetch");
            const encryptedData = await res.json();

            const decryptedSecrets = await Promise.all(
                encryptedData.map(async (item: any) => {
                    try {
                        return {
                            ...item,
                            title: await decryptData(item.title, item.titleIv, masterKey),
                            content: await decryptData(item.content, item.contentIv, masterKey)
                        };
                    } catch (e) {
                        console.error("Failed to decrypt item:", item.id);
                        return { ...item, title: "Decryption Failed", content: "Error" };
                    }
                })
            );

            setSecrets(decryptedSecrets);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleCopyToClipboard = (id: string, textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedId(id);
            setTimeout(() => {
                navigator.clipboard.writeText('');
                setCopiedId(null);
            }, 10000);
        });
    };

    const confirmDelete = (id: string) => {
        setNoteToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!noteToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/vault?id=${noteToDelete}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Failed to delete note");

            // Re-fetch secrets after successful deletion
            await fetchSecrets();
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setNoteToDelete(null);
        }
    };

    return (
        <div className="w-full flex min-h-[85vh] grow bg-slate-950 text-slate-50">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 p-4 hidden md:block">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-500" /> The Vault
                </h2>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full justify-start gap-2 mb-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="w-4 h-4" /> New Secret
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
                        <DialogHeader>
                            <DialogTitle>Store a new secret</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSecret} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="title" className="text-sm font-medium">Title</label>
                                <Input
                                    id="title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g., AWS Root Login"
                                    className="bg-slate-950 border-slate-800"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="content" className="text-sm font-medium">Secret Content</label>
                                <Textarea
                                    id="content"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Super secret data goes here..."
                                    className="bg-slate-950 border-slate-800 min-h-[100px]"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Encrypt & Save"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8">
                    <div className="relative w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                        <Input placeholder="Search your secrets..." className="pl-8 bg-slate-900 border-slate-800" />
                    </div>
                </header>

                <ScrollArea className="p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : secrets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <Lock className="w-12 h-12 mb-4 opacity-20" />
                            <p>Your vault is empty.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {secrets.map((secret) => (
                                <div key={secret.id} className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 transition-colors group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-semibold text-lg">{secret.title}</h3>
                                        <div className="flex gap-2">
                                            {/* Copy Button */}
                                            <button
                                                onClick={() => handleCopyToClipboard(secret.id, secret.content)}
                                                className="text-slate-500 hover:text-emerald-400 transition-colors"
                                                title="Copy to clipboard (clears in 10s)"
                                            >
                                                {copiedId === secret.id ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            </button>

                                            {/* Delete Button trigger */}
                                            <button onClick={() => confirmDelete(secret.id)}>
                                                <Trash2 className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Obfuscated content that reveals on hover */}
                                    <p className="text-slate-500 font-mono text-sm blur-sm hover:blur-none transition-all cursor-crosshair break-all">
                                        {secret.content}
                                    </p>

                                    <div className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest">
                                        Last updated {new Date(secret.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>)}
                </ScrollArea>
            </main>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Delete Secret</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-slate-300">
                        Are you sure you want to delete this secret? This action cannot be undone.
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="border-slate-700 hover:bg-slate-800 hover:text-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
