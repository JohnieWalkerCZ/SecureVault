import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Github } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="w-full bg-slate-950 text-slate-50">
            <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
                <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-sm text-emerald-400 mb-6">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Zero-Knowledge Architecture
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                    Your data, <span className="text-emerald-500">encrypted</span> <br />
                    beyond our reach.
                </h1>
                <p className="max-w-[600px] text-slate-400 text-lg mb-10">
                    The Vault uses client-side AES-256 encryption. We store your data, but we can't read it. Not even if we wanted to.
                </p>
                <div className="flex gap-4">
                    <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link href="/signup"><Lock /> Create Secure Vault</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-slate-700 hover:bg-slate-900">
                        <Link href="https://github.com/JohnieWalkerCZ/SecureVault" target="_blank"><Github /> View Source</Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}
