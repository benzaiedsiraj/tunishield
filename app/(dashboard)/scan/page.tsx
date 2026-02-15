"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, AlertTriangle, XCircle, Search, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useI18n, TranslationKey } from "@/lib/i18n-context";
import { toast } from "sonner";

export default function ScannerPage() {
    const { t } = useI18n();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [riskAssessment, setRiskAssessment] = useState<'safe' | 'suspicious' | 'dangerous' | null>(null);
    const [manualUrl, setManualUrl] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only init scanner on client side request (button click or auto? usually button to avoid permissions request immediately)
        // For this demo we'll show a button "Start Scan" to be user friendly
    }, []);

    const startScanner = () => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render((decodedText) => {
            setScanResult(decodedText);
            analyzeRisk(decodedText);
            scanner.clear();
        }, (error) => {
            // console.warn(error);
        });
    };

    const analyzeRisk = (input: string) => {
        setLoading(true);
        // Simulation of risk analysis
        setTimeout(() => {
            const lower = input.toLowerCase();
            if (lower.includes("post") || lower.includes("d17") || lower.includes("free") || lower.includes("win")) {
                setRiskAssessment("suspicious");
            } else if (lower.includes("malware") || lower.includes("bad") || lower.includes("exe")) {
                setRiskAssessment("dangerous");
            } else {
                setRiskAssessment("safe");
            }
            setLoading(false);
        }, 1500);
    };

    const handleManualCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualUrl) return;
        setScanResult(manualUrl);
        analyzeRisk(manualUrl);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t("scanner.title")}</h1>
                    <p className="text-muted-foreground">{t("scanner.desc")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scanner / Input Area */}
                <GlassCard className="min-h-[400px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse z-10"></div>

                    {!scanResult ? (
                        <div className="flex-1 flex flex-col gap-6 p-4">
                            <div id="reader" className="rounded-lg overflow-hidden border-2 border-dashed border-white/20"></div>
                            <div className="text-center">
                                <Button onClick={startScanner} className="mb-4">Start Camera Scanner</Button>
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or type link</span></div>
                                </div>
                                <form onSubmit={handleManualCheck} className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com"
                                        value={manualUrl}
                                        onChange={(e) => setManualUrl(e.target.value)}
                                    />
                                    <Button type="submit" size="icon" disabled={loading}><Search className="h-4 w-4" /></Button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                            <h2 className="text-xl font-mono break-all bg-black/30 p-4 rounded-lg border border-white/5 w-full">
                                {scanResult}
                            </h2>

                            {loading ? (
                                <div className="flex flex-col items-center gap-4 text-primary animate-pulse">
                                    <ShieldCheck className="h-16 w-16" />
                                    <h3 className="text-2xl font-bold">Checking...</h3>
                                </div>
                            ) : (
                                <div className={`flex flex-col items-center gap-4 p-6 rounded-2xl border w-full ${riskAssessment === 'safe' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    riskAssessment === 'suspicious' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}>
                                    {riskAssessment === 'safe' && <ShieldCheck className="h-20 w-20" />}
                                    {riskAssessment === 'suspicious' && <AlertTriangle className="h-20 w-20" />}
                                    {riskAssessment === 'dangerous' && <XCircle className="h-20 w-20" />}

                                    <div>
                                        <h3 className="text-3xl font-bold uppercase tracking-widest mb-2">{t(`status.${riskAssessment}` as TranslationKey)}</h3>
                                        <p className="text-sm opacity-80">
                                            {riskAssessment === 'safe' ? 'No threats detected in this URL.' :
                                                riskAssessment === 'suspicious' ? 'This link mimics known scams or uses suspicious patterns.' :
                                                    'Malicious content detected! Do not open this link.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 w-full">
                                <Button variant="ghost" className="flex-1" onClick={() => { setScanResult(null); setRiskAssessment(null); manualUrl && setManualUrl("") }}>Scan Another</Button>
                                {riskAssessment !== 'dangerous' && (
                                    <Button variant="secondary" className="flex-1" onClick={() => window.open(scanResult, '_blank')}>
                                        <ExternalLink className="mr-2 h-4 w-4" /> Open Anyway
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* Info / History Panel (Placeholder for MVP) */}
                <div className="space-y-6">
                    <GlassCard>
                        <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldCheck className="text-primary" /> Why Scan?</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
                            <li>Scammers use QR codes to redirect you to fake login pages.</li>
                            <li>Shortened URLs (bit.ly, etc.) hide the true destination.</li>
                            <li>We check against a database of reported Tunisian scams.</li>
                        </ul>
                    </GlassCard>

                    <GlassCard className="flex-1">
                        <h3 className="font-bold mb-4">Recent Scans</h3>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-2 w-2 rounded-full bg-green-500 shrink-0"></div>
                                        <span className="truncate text-sm font-mono text-muted-foreground">https://poste.tn/verify...</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">2h ago</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
