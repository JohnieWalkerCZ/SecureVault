"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();

    const email = session?.user.email;

    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 backdrop-blur-md sticky top-0 z-50 min-h-[6vh]">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-50">
                <Lock className="w-5 h-5 text-emerald-500" />
                <span>The Vault</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                <Link href="/about" className="hover:text-emerald-500 transition-colors">How it works</Link>
                {email ? (
                    <>
                        <Link href="/dashboard">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">My Vault</Button>
                        </Link>
                        <Button onClick={() => { signOut(); router.push('/') }} className="text-white bg-emerald-900 hover:bg-emerald-950">Log out</Button>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button variant="ghost" className="hover:bg-slate-900">Login</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Get Started</Button>
                        </Link>
                    </>
                )
                }
            </div >
        </nav >
    );
}

