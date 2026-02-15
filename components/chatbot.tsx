"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { GlassCard } from "./ui/glass-card";

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: "سلام! أنا TuniShield Bot. باش تحب نعاونك؟" }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");

        // Simple rule-based logic for MVP
        setTimeout(() => {
            let botResponse = "سامحني، ما فهمتش سؤالك. جرب اسأل على: Scan, Community, Quiz.";
            const lower = userMsg.toLowerCase();
            if (lower.includes("scan") || lower.includes("qr") || lower.includes("رابط")) {
                botResponse = "باش تعمل Scan، ادخل لصفحة Scanner من الفوق و حل الكاميرا ولا حط الرابط.";
            } else if (lower.includes("post") || lower.includes("نشر") || lower.includes("community")) {
                botResponse = "تنجم تهبط بوست في صفحة Community باش تحذر العباد.";
            } else if (lower.includes("quiz") || lower.includes("لعب")) {
                botResponse = "كل يوم فما كويز جديد في صفحة Quiz. جرب حظك!";
            } else if (lower.includes("slm") || lower.includes("سلام") || lower.includes("alo")) {
                botResponse = "أهلا بيك! شنوا جوك؟";
            }

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        }, 600);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    variant="primary"
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-2xl animate-bounce"
                    onClick={() => setIsOpen(true)}
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {isOpen && (
                <GlassCard className="w-80 h-96 flex flex-col p-0 overflow-hidden shadow-2xl border-primary/20">
                    <div className="p-3 bg-primary/20 flex justify-between items-center border-b border-white/10">
                        <h3 className="font-bold flex items-center gap-2"><MessageCircle className="h-4 w-4" /> TuniShield Helper</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${m.role === 'user'
                                        ? 'bg-primary text-brand-dark rounded-br-none'
                                        : 'bg-white/10 rounded-bl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-t border-white/10 flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="اكتب سؤالك..."
                            className="h-9"
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button size="icon" className="h-9 w-9" onClick={handleSend}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
