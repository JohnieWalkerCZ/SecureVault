"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CryptoContextType {
    masterKey: CryptoKey | null;
    setMasterKey: (key: CryptoKey | null) => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export function CryptoProvider({ children }: { children: ReactNode }) {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

    return (
        <CryptoContext.Provider value={{ masterKey, setMasterKey }}>
            {children}
        </CryptoContext.Provider>
    );
}

export function useCrypto() {
    const context = useContext(CryptoContext);
    if (!context) throw new Error("useCrypto must be used within a CryptoProvider");
    return context;
}
