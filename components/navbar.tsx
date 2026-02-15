"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n-context";
import { ShieldCheck, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { ProfileDropdown } from "./profile-dropdown";

interface UserData {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
}

export function Navbar() {
    const { t, setLanguage, language } = useI18n();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoadingUser(false);
        }
    };

    if (!mounted) return null;

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
                    <ShieldCheck className="h-8 w-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(0,255,157,0.5)] transition-all" />
                    <span className="tracking-tighter">Tuni<span className="text-primary">Shield</span></span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/scan" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.scanner')}</Link>
                    <Link href="/community" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.community')}</Link>
                    <Link href="/quiz" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.quiz')}</Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Language Toggle */}
                    <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'tn' ? 'fr' : 'tn')}>
                        <span className="text-xs font-bold">{language === 'tn' ? 'TN' : 'FR'}</span>
                    </Button>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Auth: Profile or Login/Signup */}
                    {!loadingUser && (
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <ProfileDropdown
                                    user={user}
                                    onLogout={() => setUser(null)}
                                />
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm">{t('cta.login')}</Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button variant="primary" size="sm">{t('cta.signup')}</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

function ThemeToggle() {
    const toggle = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <Button variant="ghost" size="icon" onClick={toggle}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
