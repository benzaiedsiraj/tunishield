"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { I18nProvider } from "@/lib/i18n-context";
import { Toaster } from "sonner";

// Simple Theme Provider
type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const saved = localStorage.getItem("tunishield-theme") as Theme;
        if (saved) {
            setTheme(saved);
            document.documentElement.classList.toggle("dark", saved === "dark");
        } else {
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("tunishield-theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <I18nProvider>
                {children}
                <Toaster position="top-center" richColors />
            </I18nProvider>
        </ThemeProvider>
    );
}
