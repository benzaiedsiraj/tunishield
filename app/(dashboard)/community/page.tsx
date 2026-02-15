"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n, TranslationKey } from "@/lib/i18n-context";
import { Search, Plus, ThumbsUp, MessageCircle, AlertTriangle, Send, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CommunityPage() {
    const { t } = useI18n();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [page, setPage] = useState(1);

    // Create Post State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", body: "", category: "D17" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Comment State
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Data Fetching
    const { data, error, isLoading } = useSWR(
        `/api/community/posts?page=${page}&limit=10&search=${search}&category=${filter}`,
        fetcher
    );

    const posts = data?.posts || [];

    // Handlers
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/community/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
            });

            if (!res.ok) throw new Error("Failed to create post");

            toast.success(t("community.post_created"));
            setIsCreateOpen(false);
            setNewPost({ title: "", body: "", category: "D17" });
            mutate(`/api/community/posts?page=${page}&limit=10&search=${search}&category=${filter}`);
        } catch (error) {
            toast.error(t("community.post_error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            await fetch(`/api/community/posts/${postId}/like`, { method: "POST" });
            mutate(`/api/community/posts?page=${page}&limit=10&search=${search}&category=${filter}`);
        } catch (error) {
            toast.error("Failed to like post");
        }
    };

    const handleComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/community/posts/${postId}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: commentText }),
            });

            if (!res.ok) throw new Error("Failed to comment");

            toast.success(t("community.comment_success"));
            setCommentText("");
            setActiveCommentPostId(null);
            mutate(`/api/community/posts?page=${page}&limit=10&search=${search}&category=${filter}`);
        } catch (error) {
            toast.error("Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-end md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t("community.title")}</h1>
                    <p className="text-muted-foreground">{t("community.desc")}</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> {t("community.new_report")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10 backdrop-blur-xl text-white">
                        <DialogHeader>
                            <DialogTitle>{t("community.create_title")}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">{t("community.form_title")}</Label>
                                <Input
                                    id="title"
                                    value={newPost.title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost({ ...newPost, title: e.target.value })}
                                    placeholder={t("community.ph_title")}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">{t("community.form_category")}</Label>
                                <Select
                                    value={newPost.category}
                                    onValueChange={(val: string) => setNewPost({ ...newPost, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="D17">D17</SelectItem>
                                        <SelectItem value="Phishing">Phishing</SelectItem>
                                        <SelectItem value="Phone">Phone Call</SelectItem>
                                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">{t("community.form_body")}</Label>
                                <Textarea
                                    id="body"
                                    value={newPost.body}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPost({ ...newPost, body: e.target.value })}
                                    placeholder={t("community.ph_body")}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("community.submit")}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search & Filter */}
            <GlassCard className="p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("community.search_ph")}
                        className="pl-9 bg-background/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {["All", "D17", "Phishing", "Phone", "WhatsApp"].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-2 rounded-full border transition-colors whitespace-nowrap ${filter === cat
                                ? "bg-primary text-brand-dark border-primary font-bold"
                                : "border-white/10 hover:bg-white/5"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </GlassCard>

            {/* Posts Feed */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {t("community.no_posts")}
                    </div>
                ) : (
                    posts.map((post: any) => (
                        <GlassCard key={post.id} className="transition-colors group hover:border-white/20">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-center">
                                    <span className="px-2 py-1 rounded bg-white/10 text-xs font-mono">{post.category}</span>
                                    <span className="text-xs text-muted-foreground">{format(new Date(post.createdAt), "PPP")}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500">
                                    <AlertTriangle className="h-4 w-4" />
                                </Button>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-foreground">{post.title}</h3>
                            <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.body}</p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-white/5 pt-4">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-1 hover:text-primary transition-colors"
                                >
                                    <ThumbsUp className="h-4 w-4" /> {post._count.likes}
                                </button>
                                <button
                                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                    className={`flex items-center gap-1 transition-colors ${activeCommentPostId === post.id ? "text-primary" : "hover:text-primary"}`}
                                >
                                    <MessageCircle className="h-4 w-4" /> {post._count.comments}
                                </button>
                                <span className="ml-auto flex items-center gap-2 text-xs">
                                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                                    {post.author.name}
                                </span>
                            </div>

                            {/* Comments Section */}
                            {activeCommentPostId === post.id && (
                                <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in">
                                    <form onSubmit={(e) => handleComment(e, post.id)} className="flex gap-2 mb-4">
                                        <Input
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder={t("community.comment_ph")}
                                            className="bg-black/20"
                                            autoFocus
                                        />
                                        <Button type="submit" size="icon" disabled={submittingComment}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>

                                    <CommentList postId={post.id} />
                                </div>
                            )}
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}

function CommentList({ postId }: { postId: string }) {
    const { data: comments, isLoading } = useSWR(`/api/community/posts/${postId}/comment`, fetcher);

    if (isLoading) return <div className="text-xs text-center py-2"><Loader2 className="h-3 w-3 animate-spin inline mr-2" />Loading comments...</div>;
    if (!comments || comments.length === 0) return <div className="text-xs text-center text-muted-foreground py-2">No comments yet. Be the first!</div>;

    // ... 

    return (
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment: any) => (
                <div key={comment.id} className="bg-white/5 p-2 rounded text-sm">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-primary">{comment.author.name}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(comment.createdAt), "MMM d, HH:mm")}</span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                </div>
            ))}
        </div>
    );
}
