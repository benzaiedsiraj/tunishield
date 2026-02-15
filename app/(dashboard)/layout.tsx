"use client";

import { Navbar } from "@/components/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { usePathname } from "next/navigation";
import { QrCode, MessageSquare, BrainCircuit, ShieldAlert, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Chatbot } from "@/components/chatbot";

// Reusing hook logic for simple translation since we are in client component
import { useI18n, TranslationKey } from "@/lib/i18n-context";

const sidebarItems: { href: string; label: TranslationKey; icon: any }[] = [
    { href: "/scan", label: "nav.scanner", icon: QrCode },
    { href: "/community", label: "nav.community", icon: MessageSquare },
    { href: "/quiz", label: "nav.quiz", icon: BrainCircuit },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { t } = useI18n();
    const pathname = usePathname();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <div className="flex flex-1 pt-16 container gap-6 p-4">
                {/* Sidebar (Desktop) */}
                <aside className="hidden lg:flex w-64 flex-col gap-2 sticky top-20 h-[calc(100vh-6rem)]">
                    <GlassCard className="h-full flex flex-col p-4 border-white/5">
                        <div className="flex-1 space-y-2">
                            {sidebarItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <div className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                        pathname === item.href
                                            ? "bg-primary text-brand-dark font-bold shadow-[0_0_15px_rgba(0,255,157,0.3)]"
                                            : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                    )}>
                                        <item.icon className="h-5 w-5" />
                                        <span>{t(item.label)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Security Status Widget */}
                        <div className="mt-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                                <ShieldAlert className="h-5 w-5" />
                                <span className="font-bold text-sm">Threat Level</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[30%] bg-red-500 animate-pulse"></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">3 New threats reported today</p>
                        </div>
                    </GlassCard>
                </aside>

                {/* Main Content */}
                <main className="flex-1 w-full min-w-0">
                    {children}
                </main>
            </div>
            <Chatbot />
        </div>
    );
}
