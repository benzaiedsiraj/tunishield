"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'tn' | 'fr';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations.tn) => string;
    dir: 'ltr' | 'rtl';
    isLoaded: boolean;
}

// Simple translation dictionary for MVP
const translations = {
    tn: {
        "app.name": "TuniShield",
        "app.mission": "نحماو التوانسة في العالم الرقمي",
        "hero.title": "رد بالك على روحك في الأنترنت",
        "hero.subtitle": "منصة تونسية 100% باش تتعلم كيفاش تحمي روحك، تثبت من الليانات، و تبلغ على السكام.",
        "cta.signup": "حل كونت",
        "cta.login": "كونكتا",
        "scanner.title": "ماسح QR Code",
        "scanner.desc": "ثبت من الليانات و الكودات قبل ما تحلهم",
        "community.title": "المجتمع",
        // community.desc moved below

        // quiz keys moved below

        // auth keys partially moved, keeping non-duplicates
        "auth.email": "البريد الإلكتروني",
        "auth.send_code": "ابعث الكود",
        "auth.verify": "ثبت من الكود", // Kept for backward compat if needed, but verify_btn is new
        "auth.code_sent": "بعثنالك كود على الايميل متاعك",
        "auth.success": "مريقل! تعديت",
        "auth.resend": "عاود ابعث",

        "nav.scanner": "سكانير",
        "nav.community": "مجتمع",
        "nav.quiz": "كويز",
        "status.safe": "مريقل (آمن)",
        "status.suspicious": "مشبوه",
        "status.dangerous": "رد بالك (خطير)",

        // Community
        "community.new_report": "بلاغ جديد",
        "community.create_title": "أعمل بلاغ جديد",
        "community.desc": "شوف تجارب العباد و بلغ على التحيل",
        "community.form_title": "العنوان",
        "community.ph_title": "مثال: ميساج D17 مضروب...",
        "community.form_category": "النوع",
        "community.form_body": "شنوة صارلك؟",
        "community.ph_body": "احكيلنا بالتفصيل شنوة صار بش الناس ترد بالها...",
        "community.submit": "هبط البلاغ",
        "community.search_ph": "لوج في البلاغات...",
        "community.no_posts": "ما فما حتى بلاغ لتو. كون أول واحد يبلغ!",
        "community.post_created": "البلاغ متاعك تهبط بنجاح!",
        "community.post_error": "صار مشكل، عاود جرب مبعد.",
        "community.comment_success": "الكومنتار متاعك تهبط.",
        "community.comment_ph": "أكتب كومنتار...",

        // Quiz
        "quiz.title": "ختبر معلوماتك",
        "quiz.desc": "جاوب على الأسئلة و شوف روحك قداش تفهم في السلامة الرقمية.",
        "quiz.start": "ابدأ اللعب",
        "quiz.score": "النتيجة متاعك",
        "quiz.play_again": "عاود العب",

        // Chatbot
        "chat.title": "المساعد الذكي",
        "chat.ph": "اسألني على أي حاجة...",
        "chat.send": "ابعث",
        "chat.welcome": "مرحبا! أنا المساعد الذكي متاع توني-شيلد. باش نعاونك تفهم السلامة الرقمية. شنوا تحب تسأل؟",

        "auth.verify_title": "ثبت الكود",
        "auth.verify_desc": "بعثنالك كود على الإيميل متاعك. حطو لهنا.",
        "auth.verify_btn": "فيريفي",
    },
    fr: {
        "app.name": "TuniShield",
        "app.mission": "Protégeons les Tunisiens dans le monde numérique",
        "hero.title": "Protégez-vous et votre famille contre la cybercriminalité",
        "hero.subtitle": "Une plateforme 100% tunisienne pour apprendre à se protéger, vérifier les liens et signaler les arnaques.",
        "cta.signup": "Créer un compte",
        "cta.login": "Se connecter",
        "scanner.title": "Scanner",
        "scanner.desc": "Vérifiez les liens et codes QR avant de les ouvrir",
        "community.title": "Communauté",
        "community.desc": "Partagez vos expériences et aidez les autres à éviter les arnaques.",
        "community.new_report": "Nouveau rapport",
        "community.create_title": "Créer un nouveau rapport",
        "community.form_title": "Titre",
        "community.ph_title": "Exemple: Message D17 frauduleux...",
        "community.form_category": "Catégorie",
        "community.form_body": "Que s'est-il passé ?",
        "community.ph_body": "Décrivez en détail ce qui s'est passé...",
        "community.submit": "Publier",
        "community.search_ph": "Rechercher...",
        "community.no_posts": "Aucun rapport. Soyez le premier !",
        "community.post_created": "Rapport publié !",
        "community.post_error": "Erreur, réessayez plus tard.",
        "community.comment_success": "Commentaire publié.",
        "community.comment_ph": "Écrire un commentaire...",

        // Quiz
        "quiz.title": "Quiz",
        "quiz.desc": "Testez vos connaissances",
        "quiz.start": "Commencer",
        "quiz.score": "Votre score",
        "quiz.play_again": "Rejouer",

        // Auth
        "auth.email": "Email",
        "auth.send_code": "Envoyer le code",
        "auth.verify": "Vérifier le code",
        "auth.verify_title": "Vérifier le code",
        "auth.verify_desc": "Code envoyé à votre email.",
        "auth.verify_btn": "Vérifier",
        "auth.resend": "Renvoyer",
        "auth.code_sent": "Code envoyé !",
        "auth.success": "Succès !",

        // Chatbot
        "chat.title": "Assistant",
        "chat.ph": "Posez une question...",
        "chat.send": "Envoyer",
        "chat.welcome": "Bonjour ! Je suis l'assistant TuniShield.",

        "nav.scanner": "Scanner",
        "nav.community": "Communauté",
        "nav.quiz": "Quiz",
        "nav.home": "Accueil",
        "status.safe": "Sûr",
        "status.suspicious": "Suspect",
        "status.dangerous": "Dangereux",
    }
};

export type TranslationKey = keyof typeof translations.tn;

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('tn');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('tunishield-lang') as Language;
        if (saved) setLanguage(saved);
        setIsLoaded(true);
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('tunishield-lang', lang);
        document.documentElement.dir = lang === 'tn' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    };

    const t = (key: keyof typeof translations.tn) => {
        return translations[language][key] || key;
    };

    return (
        <I18nContext.Provider value={{
            language,
            setLanguage: handleSetLanguage,
            t,
            dir: language === 'tn' ? 'rtl' : 'ltr',
            isLoaded
        }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used within an I18nProvider');
    return context;
}
