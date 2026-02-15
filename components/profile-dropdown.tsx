"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, LogOut, Settings, ChevronDown, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
}

interface ProfileDropdownProps {
    user: UserData;
    onLogout: () => void;
}

export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name || "");
    const [saving, setSaving] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsEditing(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = () => {
        if (user.name) {
            return user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return user.email[0].toUpperCase();
    };

    const handleSaveName = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Profile updated!");
            setIsEditing(false);
            router.refresh();
            // Force re-render by reloading after a brief delay
            setTimeout(() => window.location.reload(), 300);
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            toast.success("Logged out");
            onLogout();
            router.push("/");
            router.refresh();
        } catch {
            toast.error("Logout failed");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 group"
            >
                <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-primary/80 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-primary/20 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all overflow-hidden">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                        <span>{getInitials()}</span>
                    )}
                </div>
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                    >
                        {/* User Info */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/80 to-emerald-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0 overflow-hidden">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <span>{getInitials()}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    {isEditing ? (
                                        <div className="flex items-center gap-1">
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="h-7 text-sm bg-white/5 border-white/10"
                                                placeholder="Your name"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleSaveName();
                                                    if (e.key === "Escape") setIsEditing(false);
                                                }}
                                            />
                                            <button
                                                onClick={handleSaveName}
                                                disabled={saving}
                                                className="p-1 hover:bg-white/10 rounded transition-colors text-primary"
                                            >
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-sm truncate">
                                            {user.name || "Set your name"}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-1">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 transition-colors text-left"
                            >
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-left"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
