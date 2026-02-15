"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/lib/i18n-context";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Mail, KeyRound, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

export function AuthForm({ type }: { type: "login" | "signup" }) {
    const { t } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"email" | "verify">("email");
    const [loading, setLoading] = useState(false);

    // Handle errors (e.g. from previous redirects if any)
    useEffect(() => {
        const error = searchParams.get("error");
        if (error) {
            toast.error("Authentication failed.");
        }
    }, [searchParams]);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                body: JSON.stringify({ email, type }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send code");

            toast.success(t("auth.code_sent"));
            setStep("verify");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email, code }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");

            toast.success(t("auth.success"));
            router.push("/scan");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-blob" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <GlassCard className="border-t border-t-white/20">
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-3 bg-primary/10 rounded-full mb-4">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {type === "login" ? t("cta.login") : t("cta.signup")}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            {step === "email"
                                ? "أدخل الإيميل متاعك باش تكمل"
                                : `بعثنا كود للـ ${email}`}
                        </p>
                    </div>

                    {/* Email OTP Step */}
                    {step === "email" && (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="name@example.com"
                                    type="email"
                                    className="pr-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors text-right"
                                    dir="ltr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 text-lg shadow-lg shadow-primary/20" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : t("auth.send_code")}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground mt-4">
                                {type === "login" ? (
                                    <>ما عندكش حساب؟{" "}<Link href="/signup" className="text-primary hover:underline">حل كونت</Link></>
                                ) : (
                                    <>عندك حساب؟{" "}<Link href="/login" className="text-primary hover:underline">كونكتا</Link></>
                                )}
                            </p>
                        </form>
                    )}

                    {/* Verify OTP Step */}
                    {step === "verify" && (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="relative">
                                <KeyRound className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="123456"
                                    type="text"
                                    maxLength={6}
                                    className="pr-10 h-12 bg-white/5 border-white/10 text-center tracking-[1em] font-mono text-lg"
                                    dir="ltr"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 text-lg shadow-lg shadow-primary/20" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : t("auth.verify")}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t("auth.resend")}
                            </button>
                        </form>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
}
