"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCrypto } from "@/components/CryptoContext";
import { deriveKey, encryptData } from "@/lib/crypto";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { setMasterKey } = useCrypto();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or master password.");
            } else {
                const derivedKey = await deriveKey(password, email);
                setMasterKey(derivedKey);
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center bg-slate-950 px-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-slate-50">Welcome Back</CardTitle>
                    <CardDescription className="text-slate-400">
                        Decrypt your vault by entering your credentials.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="grid gap-4 mb-4">
                        {error && <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-md border border-red-900/50">{error}</div>}

                        <div className="grid gap-2 text-slate-50">
                            <label htmlFor="email">Email Address</label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-950 border-slate-700"
                            />
                        </div>
                        <div className="grid gap-2 text-slate-50">
                            <label htmlFor="password">Master Password</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-950 border-slate-700"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isLoading ? "Decrypting..." : "Unlock Vault"}
                        </Button>
                        <div className="text-center text-sm text-slate-500">
                            New here? <Link href="/signup" className="text-emerald-500 hover:underline">Create a secure vault</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>);
}
