// components/faqs/VoteModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { useFAQStore } from '@/store/faq-store';
import { FAQVoteRecord } from '@/types/tour/faqs.types';

interface VoteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    faqId: string | null;
    faqQuestion?: string;
}

// Skeleton row — neumorphic shimmer placeholder
function VoteSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-[#E7E5E4] p-3 shadow-[inset_2px_2px_5px_#c5c3c2,inset_-2px_-2px_5px_#ffffff] animate-pulse"
                >
                    {/* Avatar placeholder */}
                    <div className="h-8 w-8 rounded-full bg-[#1E2938]/10" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-24 rounded bg-[#1E2938]/10" />
                        <div className="h-2 w-16 rounded bg-[#1E2938]/6" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function VoteModal({ open, onOpenChange, faqId, faqQuestion }: VoteModalProps) {
    const { fetchFAQVotes, faqVotes } = useFAQStore();
    const [votes, setVotes] = useState<FAQVoteRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && faqId) {
            const loadVotes = async () => {
                setIsLoading(true);
                await fetchFAQVotes(faqId, { limit: 50 });
                setIsLoading(false);
            };
            loadVotes();
        }
    }, [open, faqId, fetchFAQVotes]);

    useEffect(() => {
        if (faqId && faqVotes[faqId]) {
            setVotes(faqVotes[faqId].votes);
        } else {
            setVotes([]);
        }
    }, [faqId, faqVotes]);

    const likeVotes = votes.filter((v) => v.type === 'like');
    const dislikeVotes = votes.filter((v) => v.type === 'dislike');

    const getUserName = (user: FAQVoteRecord['userId']) => {
        if (typeof user === 'string') return user;
        return user?.name || 'Anonymous';
    };

    const getUserAvatar = (user: FAQVoteRecord['userId']) => {
        if (typeof user === 'string') return undefined;
        return user?.avatar;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                // Remove default shadcn chrome; apply neumorphic raised card
                className="max-w-2xl border-0 p-0 outline-none bg-[#E7E5E4] rounded-3xl shadow-sm [&>button]:hidden">
                {/* ── Modal header ── */}
                <DialogHeader className="relative px-7 pt-7 pb-5 border-b border-[#1E2938]/8">
                    {/* Close button — raised neumorphic pill */}
                    <button
                        onClick={() => onOpenChange(false)}
                        aria-label="Close"
                        className="
                            absolute right-6 top-6
                            flex h-8 w-8 items-center justify-center
                            rounded-xl bg-[#E7E5E4]
                            shadow-[3px_3px_7px_#c5c3c2,-3px_-3px_7px_#ffffff]
                            text-[#1E2938]/50
                            transition-all duration-150
                            hover:text-[#1E2938]
                            active:shadow-[inset_2px_2px_5px_#c5c3c2,inset_-2px_-2px_5px_#ffffff]
                        "
                    >
                        <X className="h-4 w-4" strokeWidth={2} />
                    </button>

                    <DialogTitle className="space-y-1 pr-10">
                        <span className="block font-['Space_Mono'] text-lg font-bold tracking-tight text-[#1E2938]">
                            Vote Details
                        </span>
                        {faqQuestion && (
                            <span className="block font-['JetBrains_Mono'] text-xs font-normal leading-relaxed text-[#1E2938]/50">
                                {faqQuestion.length > 110
                                    ? `${faqQuestion.slice(0, 110)}…`
                                    : faqQuestion}
                            </span>
                        )}
                    </DialogTitle>

                    {/* Tally pills */}
                    {!isLoading && (
                        <div className="mt-3 flex items-center gap-3">
                            {/* Likes tally — raised */}
                            <div className="flex items-center gap-2 rounded-xl bg-[#E7E5E4] px-3 py-1.5 shadow-[3px_3px_6px_#c5c3c2,-3px_-3px_6px_#ffffff]">
                                <ThumbsUp className="h-3.5 w-3.5 text-[#006666]" strokeWidth={2.5} />
                                <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#006666]">
                                    {likeVotes.length}
                                </span>
                            </div>
                            {/* Dislikes tally — inset */}
                            <div className="flex items-center gap-2 rounded-xl bg-[#E7E5E4] px-3 py-1.5 shadow-[inset_2px_2px_5px_#c5c3c2,inset_-2px_-2px_5px_#ffffff]">
                                <ThumbsDown className="h-3.5 w-3.5 text-[#1E2938]/40" strokeWidth={2.5} />
                                <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#1E2938]/50">
                                    {dislikeVotes.length}
                                </span>
                            </div>
                        </div>
                    )}
                </DialogHeader>

                {/* ── Body ── */}
                <div className="px-7 py-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <VoteSkeleton />
                            <VoteSkeleton />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* ── Likes column ── */}
                            <div className="space-y-4">
                                {/* Section label */}
                                <div className="flex items-center gap-2">
                                    {/* Raised icon nub */}
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4] shadow-[3px_3px_6px_#c5c3c2,-3px_-3px_6px_#ffffff]">
                                        <ThumbsUp className="h-3.5 w-3.5 text-[#006666]" strokeWidth={2.5} />
                                    </div>
                                    <span className="font-['Space_Mono'] text-xs font-bold uppercase tracking-widest text-[#006666]">
                                        Likes
                                    </span>
                                </div>

                                {/* Inset scroll well */}
                                <div className="rounded-2xl bg-[#E7E5E4] p-3 shadow-[inset_4px_4px_10px_#c5c3c2,inset_-4px_-4px_10px_#ffffff]">
                                    <ScrollArea className="h-[260px] pr-1">
                                        {likeVotes.length === 0 ? (
                                            <div className="flex h-full items-center justify-center py-12">
                                                <p className="font-['JetBrains_Mono'] text-xs text-[#1E2938]/30">
                                                    No likes yet
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {likeVotes.map((vote) => (
                                                    <VoteRow
                                                        key={vote._id}
                                                        name={getUserName(vote.userId)}
                                                        avatar={getUserAvatar(vote.userId)}
                                                        date={vote.createdAt}
                                                        accentColor="#006666"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>

                            {/* ── Dislikes column ── */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4] shadow-[3px_3px_6px_#c5c3c2,-3px_-3px_6px_#ffffff]">
                                        <ThumbsDown className="h-3.5 w-3.5 text-[#1E2938]/50" strokeWidth={2.5} />
                                    </div>
                                    <span className="font-['Space_Mono'] text-xs font-bold uppercase tracking-widest text-[#1E2938]/50">
                                        Dislikes
                                    </span>
                                </div>

                                <div className="rounded-2xl bg-[#E7E5E4] p-3 shadow-[inset_4px_4px_10px_#c5c3c2,inset_-4px_-4px_10px_#ffffff]">
                                    <ScrollArea className="h-[260px] pr-1">
                                        {dislikeVotes.length === 0 ? (
                                            <div className="flex h-full items-center justify-center py-12">
                                                <p className="font-['JetBrains_Mono'] text-xs text-[#1E2938]/30">
                                                    No dislikes yet
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {dislikeVotes.map((vote) => (
                                                    <VoteRow
                                                        key={vote._id}
                                                        name={getUserName(vote.userId)}
                                                        avatar={getUserAvatar(vote.userId)}
                                                        date={vote.createdAt}
                                                        accentColor="#1E2938"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ─────────────────────────────────────────────
   VoteRow — individual voter card (raised)
───────────────────────────────────────────── */
interface VoteRowProps {
    name: string;
    avatar?: string;
    date: string | Date;
    accentColor: string;
}

function VoteRow({ name, avatar, date, accentColor }: VoteRowProps) {
    const initials = name.charAt(0).toUpperCase();

    return (
        <div
            className="
                flex items-center gap-3
                rounded-xl bg-[#E7E5E4] p-2.5
                shadow-[3px_3px_7px_#c5c3c2,-3px_-3px_7px_#ffffff]
                transition-all duration-150
                hover:shadow-[5px_5px_10px_#c5c3c2,-5px_-5px_10px_#ffffff]
                active:shadow-[inset_2px_2px_5px_#c5c3c2,inset_-2px_-2px_5px_#ffffff]
            "
        >
            {/* Avatar — inset ring */}
            <div className="flex-shrink-0 rounded-full p-0.5 shadow-[inset_1px_1px_3px_#c5c3c2,inset_-1px_-1px_3px_#ffffff]">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={avatar} />
                    <AvatarFallback
                        className="text-xs font-bold"
                        style={{ backgroundColor: `${accentColor}18`, color: accentColor, fontFamily: 'JetBrains Mono, monospace' }}
                    >
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Name + date */}
            <div className="min-w-0 flex-1">
                <p className="truncate font-['JetBrains_Mono'] text-sm font-medium text-[#1E2938]">
                    {name}
                </p>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#1E2938]/40">
                    {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </p>
            </div>
        </div>
    );
}