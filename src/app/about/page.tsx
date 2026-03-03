import { ShieldCheck, Cpu, HardDrive } from "lucide-react";

export default function AboutPage() {
    const pillars = [
        { title: "Client-Side Only", icon: <Cpu />, desc: "Keys are generated in your browser's RAM and never touch our servers." },
        { title: "AES-256 GCM", icon: <ShieldCheck />, desc: "Industry-standard authenticated encryption for every single note." },
        { title: "Blind Storage", icon: <HardDrive />, desc: "Our MariaDB database only sees random ciphertext. We cannot leak what we cannot read." }
    ];

    return (
        <div className="max-w-4xl mx-auto py-20 px-6 text-slate-50">
            <h1 className="text-4xl font-bold mb-6 text-center">Why The Vault?</h1>
            <p className="text-lg text-slate-400 text-center mb-16">
                Most "secure" apps still hold the keys to your data. If they get hacked, you get hacked.
                The Vault changes the dynamic by putting the power of cryptography in your browser.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
                {pillars.map((p, i) => (
                    <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30">
                        <div className="text-emerald-500 mb-4">{p.icon}</div>
                        <h3 className="font-semibold text-xl mb-2">{p.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
