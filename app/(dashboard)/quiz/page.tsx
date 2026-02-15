"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-context";
import { CheckCircle2, XCircle, Trophy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

// Mock Quiz Data
const QUIZ_DATA = [
    {
        id: 1,
        question: "You receive an SMS from 'La Poste' asking to pay 2 DT for package delivery via a link. What do you do?",
        options: ["Click the link and pay", "Ignore it", "Call La Poste to verify", "Forward to a friend"],
        correct: 2, // Index
        explanation: "La Poste never asks for payment via SMS links. This is a common phishing scam."
    },
    {
        id: 2,
        question: "A friend on Facebook asks for urgent money via D17. Their tone seems different.",
        options: ["Send money immediately", "Call them on phone to verify", "Ask for their card number", "Block them"],
        correct: 1,
        explanation: "Always verify urgent requests via another channel (phone call). Accounts can be hacked."
    }
];

export default function QuizPage() {
    const { t } = useI18n();
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [selected, setSelected] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [cooldown, setCooldown] = useState<number | null>(null);

    const checkAvailability = async () => {
        try {
            const res = await fetch("/api/quiz/attempt");
            const data = await res.json();
            if (data.remainingMs > 0) {
                setCooldown(data.remainingMs);
            }
        } catch (error) {
            console.error("Failed to check quiz availability");
        }
    };

    useEffect(() => {
        checkAvailability();
        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev === null || prev <= 0) return null;
                return prev - 1000;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const handleAnswer = (index: number) => {
        setSelected(index);
        setShowExplanation(true);

        if (index === QUIZ_DATA[currentQ].correct) {
            setScore(s => s + 1);
            toast.success("Correct!");
        } else {
            toast.error("Incorrect!");
        }

        // Check if it's the last question and auto-save if needed
        if (currentQ === QUIZ_DATA.length - 1) {
            const finalScore = score + (index === QUIZ_DATA[currentQ].correct ? 1 : 0);
            // We don't setFinished here, we wait for "Next Question" or explicit finish action usually, 
            // but logic below wraps up in nextQuestion interaction or we can do it here if we want immediate finish.
            // For consistency with UI flow, we'll save in nextQuestion or when the user proceeds.
            // Actually, simplest is to just record it here if we want to be safe, but let's let nextQuestion handle the transition.
        }
    };

    const nextQuestion = () => {
        if (currentQ < QUIZ_DATA.length - 1) {
            setCurrentQ(c => c + 1);
            setSelected(null);
            setShowExplanation(false);
        } else {
            setFinished(true);
            // Save attempt
            fetch("/api/quiz/attempt", {
                method: "POST",
                body: JSON.stringify({ score: score })
            });
        }
    };

    if (!started) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <GlassCard className="max-w-md w-full text-center space-y-6">
                    <Trophy className="h-20 w-20 text-yellow-500 mx-auto animate-bounce" />
                    <h1 className="text-3xl font-bold">{t("quiz.title")}</h1>
                    <p className="text-muted-foreground">{t("quiz.desc")}</p>
                    {cooldown !== null && cooldown > 0 ? (
                        <Button size="lg" className="w-full text-lg" disabled>
                            Available in {formatTime(cooldown)}
                        </Button>
                    ) : (
                        <Button size="lg" className="w-full text-lg" onClick={() => setStarted(true)}>
                            {t("quiz.start")}
                        </Button>
                    )}
                </GlassCard>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <GlassCard className="max-w-md w-full text-center space-y-6">
                    <div className="relative inline-block">
                        <Trophy className="h-24 w-24 text-primary mx-auto" />
                        <span className="absolute -top-2 -right-2 bg-primary text-black font-bold px-2 rounded-full animate-ping">New High Score!</span>
                    </div>
                    <h2 className="text-4xl font-bold">{score} / {QUIZ_DATA.length}</h2>
                    <p className="text-muted-foreground">Great job! Come back tomorrow for more scenarios.</p>
                    <Button onClick={() => window.location.reload()} variant="glass"><RefreshCcw className="mr-2 h-4 w-4" /> Play Again</Button>
                </GlassCard>
            </div>
        );
    }

    const question = QUIZ_DATA[currentQ];

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            {/* Progress */}
            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                <span>Question {currentQ + 1} / {QUIZ_DATA.length}</span>
                <span>Score: {score}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentQ + 1) / QUIZ_DATA.length) * 100}%` }} />
            </div>

            <GlassCard className="min-h-[300px] flex flex-col">
                <h2 className="text-xl md:text-2xl font-bold mb-8">{question.question}</h2>

                <div className="space-y-3 flex-1">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            disabled={showExplanation}
                            onClick={() => handleAnswer(i)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${selected === i
                                ? (i === question.correct ? "bg-green-500/20 border-green-500 text-green-400" : "bg-red-500/20 border-red-500 text-red-400")
                                : showExplanation && i === question.correct
                                    ? "bg-green-500/10 border-green-500/50"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{opt}</span>
                                {selected === i && (
                                    i === question.correct ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {showExplanation && (
                    <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2">
                        <p className="font-bold text-primary mb-2">Explanation:</p>
                        <p className="text-muted-foreground mb-4">{question.explanation}</p>
                        <Button onClick={nextQuestion} className="w-full">Next Question</Button>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
