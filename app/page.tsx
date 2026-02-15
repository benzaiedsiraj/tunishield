"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Navbar } from "@/components/navbar";
import { useI18n } from "@/lib/i18n-context";
import { Shield, Lock, Users, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Chatbot } from "@/components/chatbot";

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 flex flex-col items-center text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t("app.mission")}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white drop-shadow-[0_0_30px_rgba(0,255,157,0.3)]">
            {t("hero.title")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg shadow-[0_0_40px_-10px_rgba(0,255,157,0.5)]">
                {t("cta.signup")}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="glass" size="lg" className="w-full sm:w-auto text-lg">
                {t("cta.login")}
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="relative mt-16 w-full max-w-5xl mx-auto rounded-xl border border-white/10 shadow-2xl overflow-hidden glass-panel">
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          {/* TODO: Add image here (replace placeholder) - Dashboard Preview */}
          <div className="aspect-[16/9] bg-black/50 flex items-center justify-center relative group">
            <div className="text-center">
              <Shield className="h-20 w-20 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Dashboard Preview</p>
              <p className="text-white/20 text-xs mt-2">Place screenshot of dashboard here</p>
            </div>
            {/* Scanlines effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-24 w-full z-10">
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-primary" />}
            title={t("scanner.title")}
            desc={t("scanner.desc")}
            delay={0.2}
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-blue-400" />}
            title={t("community.title")}
            desc={t("community.desc")}
            delay={0.4}
          />
          <FeatureCard
            icon={<Lock className="h-8 w-8 text-purple-400" />}
            title={t("quiz.title")}
            desc={t("quiz.desc")}
            delay={0.6}
          />
        </div>
      </section>

      {/* FAQ / Info Section */}
      <section className="py-20 px-4 bg-black/20 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12"> الأسئلة الأكثر تداولا </h2>
          <div className="space-y-4">
            <FaqItem question="كيفاش نعرف الرابط هذا سكام؟" answer="استعمل السكانير الموجود في الموقع، حط الرابط و احنا نقلك اذا آمن ولا لا." />
            <FaqItem question="شنوة هو Phishing؟" answer="هو طريقة يستعملوها المتحيلين باش يسرقوا معلوماتك بصفحات وهمية تشبه لصفحات رسمية." />
            <FaqItem question="كيفاش نبلغ على عملية تحيل؟" answer="ادخل للمجتمع (Community) و اكتب تجربتك باش تحذر غيرك." />
            <FaqItem question="هل الموقع مجاني؟" answer="نعم، TuniShield مجاني 100% لكل التوانسة." />
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-white/5 text-center text-muted-foreground text-sm">
        <div className="mb-4 flex justify-center gap-6">
          <Link href="#" className="hover:text-primary">About</Link>
          <Link href="#" className="hover:text-primary">Privacy</Link>
          <Link href="#" className="hover:text-primary">Contact</Link>
        </div>
        <p>© 2024 TuniShield. This tool provides guidance, not legal/financial advice.</p>
      </footer>

      <Chatbot />
    </main>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <GlassCard className="h-full hover:bg-white/10 transition-colors border-l-4 border-l-primary/50">
        <div className="mb-4 p-3 rounded-full bg-white/5 w-fit">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{desc}</p>
      </GlassCard>
    </motion.div>
  )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-right hover:bg-white/5 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-muted-foreground border-t border-white/5 bg-black/20">
          {answer}
        </div>
      )}
    </div>
  )
}
