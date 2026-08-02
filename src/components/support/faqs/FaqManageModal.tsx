'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, X, Edit, Flag, Info, Trash2, Check, RefreshCw } from 'lucide-react';
import { useFAQStore } from '@/store/faq-store';
import { FAQ, FAQVoteRecord, FAQReport } from '@/types/tour/faqs.types';
import { showToast } from '@/components/global/showToast';

interface FaqManageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    faq: FAQ | null;
}

// Reusable Skeleton
function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-[#E7E5E4] p-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-[#1E2938]/10" />
            <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-24 rounded bg-[#1E2938]/10" />
                <div className="h-2 w-16 rounded bg-[#1E2938]/6" />
            </div>
        </div>
    );
}

export function FaqManageModal({ open, onOpenChange, faq }: FaqManageModalProps) {
    const { fetchFAQVotes, faqVotes, fetchFAQReports, updateFAQ, deleteFAQ } = useFAQStore();
    const [activeTab, setActiveTab] = useState<'details' | 'votes' | 'reports'>('details');

    // Data states
    const [votes, setVotes] = useState<FAQVoteRecord[]>([]);
    const [reports, setReports] = useState<FAQReport[]>([]);
    const [isLoadingVotes, setIsLoadingVotes] = useState(false);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    // Form states
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (open && faq) {
            setQuestion(faq.question || '');
            setAnswer(faq.answer || '');
            setStatus(faq.status || 'pending');
            setActiveTab('details');

            // Load votes
            const loadVotes = async () => {
                setIsLoadingVotes(true);
                await fetchFAQVotes(faq._id, { limit: 100 });
                setIsLoadingVotes(false);
            };
            loadVotes();

            // Load reports
            const loadReports = async () => {
                setIsLoadingReports(true);
                const fetchedReports = await fetchFAQReports(faq._id);
                setReports(fetchedReports);
                setIsLoadingReports(false);
            };
            loadReports();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, faq?._id]);

    useEffect(() => {
        if (faq && faqVotes[faq._id]) {
            setVotes(faqVotes[faq._id].votes);
        } else {
            setVotes([]);
        }
    }, [faq, faqVotes]);

    const likeVotes = votes.filter((v) => v.type === 'like');
    const dislikeVotes = votes.filter((v) => v.type === 'dislike');

    const getUserName = (user: any) => {
        if (typeof user === 'string') return user;
        return user?.name || 'Anonymous';
    };

    const getUserAvatar = (user: any) => {
        if (typeof user === 'string') return undefined;
        return user?.avatar;
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!faq) return;

        setIsSaving(true);
        await updateFAQ(faq._id, { question, answer, status });
        setIsSaving(false);
    };

    const handleDelete = async () => {
        if (!faq) return;
        if (!confirm('Are you sure you want to delete this FAQ?')) return;
        
        setIsDeleting(true);
        await deleteFAQ(faq._id);
        setIsDeleting(false);
        onOpenChange(false);
    };

    if (!faq) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl border-0 p-0 outline-none bg-[#E7E5E4] rounded-3xl shadow-sm [&>button]:hidden">
                <DialogHeader className="relative px-7 pt-7 pb-4 border-b border-[#1E2938]/8">
                    <DialogTitle className="font-['Space_Mono'] text-lg font-bold tracking-tight text-[#1E2938]">
                        Manage FAQ
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Manage FAQ details, view votes, and view reports.
                    </DialogDescription>
                    <button
                        onClick={() => onOpenChange(false)}
                        aria-label="Close"
                        className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7E5E4] text-[#1E2938]/50 transition-all duration-150 hover:text-[#1E2938]"
                    >
                        <X className="h-4 w-4" strokeWidth={2} />
                    </button>

                    {/* Tabs */}
                    <div className="mt-4 flex items-center gap-2">
                        <TabButton 
                            active={activeTab === 'details'} 
                            onClick={() => setActiveTab('details')}
                            icon={<Edit className="h-4 w-4" />}
                            label="Details & Edit"
                        />
                        <TabButton 
                            active={activeTab === 'votes'} 
                            onClick={() => setActiveTab('votes')}
                            icon={<ThumbsUp className="h-4 w-4" />}
                            label={`Votes (${votes.length})`}
                        />
                        <TabButton 
                            active={activeTab === 'reports'} 
                            onClick={() => setActiveTab('reports')}
                            icon={<Flag className="h-4 w-4" />}
                            label={`Reports (${reports.length})`}
                        />
                    </div>
                </DialogHeader>

                <div className="px-7 py-6">
                    {/* DETAILS TAB */}
                    {activeTab === 'details' && (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#1E2938]/50 font-['Space_Mono']">
                                            Question
                                        </label>
                                        <textarea
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className="w-full rounded-xl bg-[#E7E5E4] [box-shadow:inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff] p-3 text-sm text-[#1E2938] outline-none min-h-[80px]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#1E2938]/50 font-['Space_Mono']">
                                            Answer
                                        </label>
                                        <textarea
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            className="w-full rounded-xl bg-[#E7E5E4] [box-shadow:inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff] p-3 text-sm text-[#1E2938] outline-none min-h-[120px]"
                                            placeholder="Write an answer..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#1E2938]/50 font-['Space_Mono']">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e: any) => setStatus(e.target.value)}
                                            className="w-full rounded-xl bg-[#E7E5E4] [box-shadow:inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff] p-3 text-sm text-[#1E2938] outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#1E2938]/50 font-['Space_Mono']">
                                            Asked By
                                        </label>
                                        <div className="flex items-center gap-3 rounded-xl bg-[#E7E5E4] p-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={getUserAvatar(faq.askedBy)} />
                                                <AvatarFallback className="text-xs font-bold bg-[#1E2938]/10 text-[#1E2938]">
                                                    {getUserName(faq.askedBy).charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-[#1E2938] font-['JetBrains_Mono']">
                                                {getUserName(faq.askedBy)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-[#1E2938]/8">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#FF2157] hover:bg-[#FF2157]/10 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 rounded-xl bg-[#006666] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* VOTES TAB */}
                    {activeTab === 'votes' && (
                        isLoadingVotes ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-3"><SkeletonRow /><SkeletonRow /></div></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4]"><ThumbsUp className="h-3.5 w-3.5 text-[#006666]" /></div>
                                        <span className="font-['Space_Mono'] text-xs font-bold uppercase tracking-widest text-[#006666]">Likes ({likeVotes.length})</span>
                                    </div>
                                    <div className="rounded-2xl bg-[#E7E5E4] p-3">
                                        <ScrollArea className="h-[260px] pr-1">
                                            {likeVotes.length === 0 ? (
                                                <p className="py-12 text-center text-xs text-[#1E2938]/30">No likes yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {likeVotes.map((vote) => (
                                                        <UserRow key={vote._id} name={getUserName(vote.userId)} avatar={getUserAvatar(vote.userId)} date={vote.createdAt} />
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4]"><ThumbsDown className="h-3.5 w-3.5 text-[#1E2938]/50" /></div>
                                        <span className="font-['Space_Mono'] text-xs font-bold uppercase tracking-widest text-[#1E2938]/50">Dislikes ({dislikeVotes.length})</span>
                                    </div>
                                    <div className="rounded-2xl bg-[#E7E5E4] p-3">
                                        <ScrollArea className="h-[260px] pr-1">
                                            {dislikeVotes.length === 0 ? (
                                                <p className="py-12 text-center text-xs text-[#1E2938]/30">No dislikes yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {dislikeVotes.map((vote) => (
                                                        <UserRow key={vote._id} name={getUserName(vote.userId)} avatar={getUserAvatar(vote.userId)} date={vote.createdAt} />
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* REPORTS TAB */}
                    {activeTab === 'reports' && (
                        isLoadingReports ? (
                            <div className="space-y-3"><SkeletonRow /><SkeletonRow /></div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4]"><Flag className="h-3.5 w-3.5 text-[#FF2157]" /></div>
                                    <span className="font-['Space_Mono'] text-xs font-bold uppercase tracking-widest text-[#FF2157]">Reports ({reports.length})</span>
                                </div>
                                <div className="rounded-2xl bg-[#E7E5E4] p-3">
                                    <ScrollArea className="h-[300px] pr-1">
                                        {reports.length === 0 ? (
                                            <p className="py-12 text-center text-xs text-[#1E2938]/30">No reports found</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {reports.map((report, idx) => (
                                                    <div key={idx} className="rounded-xl bg-[#E7E5E4] [box-shadow:4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] p-4 space-y-3">
                                                        <UserRow name={getUserName(report.reportedBy)} avatar={getUserAvatar(report.reportedBy)} date={report.createdAt} />
                                                        <div className="bg-[#1E2938]/5 rounded-lg p-3 space-y-1.5">
                                                            <p className="text-xs font-bold text-[#1E2938]">Reason: <span className="font-normal">{report.reason || report.customReason || 'None'}</span></p>
                                                            {report.explanation && (
                                                                <p className="text-xs text-[#1E2938]/70 italic">"{report.explanation}"</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-200 text-sm font-bold font-['Space_Mono']
                ${active 
                    ? 'bg-[#E7E5E4] [box-shadow:inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff] text-[#006666]' 
                    : 'bg-[#E7E5E4] text-[#1E2938]/50 hover:text-[#1E2938]'}
            `}
        >
            {icon}
            {label}
        </button>
    );
}

function UserRow({ name, avatar, date }: { name: string; avatar?: string; date: string | Date }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-[#E7E5E4] p-2.5">
            <Avatar className="h-8 w-8">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-xs font-bold bg-[#1E2938]/10 text-[#1E2938]">
                    {name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate font-['JetBrains_Mono'] text-sm font-medium text-[#1E2938]">{name}</p>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#1E2938]/40">
                    {new Date(date).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
