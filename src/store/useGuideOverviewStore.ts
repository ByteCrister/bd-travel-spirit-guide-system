// useGuideOverviewStore.ts (drop-in replacement for your store)
"use client";

import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import {
    EditableGuideOverview,
    GuideOverviewStore,
    GetGuideOverviewResponse,
    UpdateGuideOverviewRequest,
    UpdateGuideOverviewResponse,
    GuideDocument,
    SubscriptionHistoryEntry,
    GuideSocialEntry,
    createEmptyEditableGuide,
} from "@/types/overview.types";
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import { v4 as uuidv4 } from "uuid";

const URL_AFTER_API = "/mock/dashboard/overview";

const withDevtools = <T>(initializer: StateCreator<T, [], []>): StateCreator<T, [], []> => {
    if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return devtools(initializer as any) as any;
    }
    return initializer;
};

type GetSubscriptionsResponse = {
    ok: boolean;
    data: { subscriptionHistory: SubscriptionHistoryEntry[] };
    errors?: string[] | null;
};

function setEditableField<T extends object, K extends keyof T>(obj: T, key: K, next: T[K]): T {
    return { ...obj, [key]: next };
}

export const useGuideOverviewStore = create<GuideOverviewStore>()(
    withDevtools<GuideOverviewStore>((set, get) => ({
        original: null,
        draft: null,
        loading: false,
        saving: false,
        error: null,
        subscriptionsCursor: null,
        subscriptionsLoadingMore: false,
        subscriptionsHasMore: true,

        async load() {
            set({ loading: true, error: null });
            try {
                const res = await api.get<GetGuideOverviewResponse>(URL_AFTER_API);
                if (!res.data.ok || !res.data.data) {
                    throw new Error(res.data.errors?.join(", ") || "Invalid response");
                }
                const overview = res.data.data;

                // ensure social entries have stable ids for client-side ops
                const socialWithIds = (overview.social || []).map((s) => ({ ...s, id: s.id ?? uuidv4() }));

                const draft: EditableGuideOverview = {
                    companyId: overview.companyId,
                    companyName: { value: overview.companyName, dirty: false },
                    bio: { value: overview.bio ?? null, dirty: false },
                    social: { value: socialWithIds, dirty: false },
                    owner: {
                        name: { value: overview.owner.name, dirty: false },
                        email: overview.owner.email,
                        phone: { value: overview.owner.phone ?? null, dirty: false },
                        oauthProvider: overview.owner.oauthProvider ?? null,
                    },
                    documents: { value: overview.documents ?? [], dirty: false },
                    subscriptionHistory: overview.subscriptionHistory ?? [],
                    currentSubscription: { value: overview.currentSubscription ?? null, dirty: false },
                    status: { value: overview.status, dirty: false },
                    isSuspended: overview.isSuspended,
                    isActive: overview.isActive,
                    hasActiveSubscription: overview.hasActiveSubscription,
                    aggregates: overview.aggregates,
                };

                // store original keeps server ids for social (strip client ids)
                const originalForStore = { ...overview, social: socialWithIds };

                set({ original: originalForStore, draft, loading: false });
            } catch (err) {
                const message = extractErrorMessage(err);
                set({ error: message, loading: false });
            }
        },

        setField<K extends keyof EditableGuideOverview>(key: K, value: EditableGuideOverview[K]) {
            const draft = get().draft;
            if (!draft) return;
            set({ draft: setEditableField(draft, key, value) });
        },

        patchField<K extends keyof EditableGuideOverview>(key: K, patch: Partial<EditableGuideOverview[K]>) {
            const draft = get().draft;
            if (!draft) return;
            const prev = draft[key];
            if (typeof prev === "object" && prev !== null && "value" in prev) {
                const merged = {
                    ...(prev as Record<string, unknown>),
                    ...(patch as Record<string, unknown>),
                    dirty: true,
                } as EditableGuideOverview[K];
                set({ draft: setEditableField(draft, key, merged) });
            } else {
                set({ draft: setEditableField(draft, key, patch as EditableGuideOverview[K]) });
            }
        },

        markDirty(path: string) {
            const draft = get().draft;
            if (!draft) return;
            const [top] = path.split(".") as [keyof EditableGuideOverview];
            const field = draft[top];
            if (field && typeof field === "object" && "dirty" in field) {
                const updated = { ...field, dirty: true } as EditableGuideOverview[typeof top];
                set({ draft: setEditableField(draft, top, updated) });
            }
        },

        revertDraft() {
            const original = get().original;
            if (!original) return;
            const newDraft = createEmptyEditableGuide();
            newDraft.companyName.value = original.companyName;
            newDraft.bio.value = original.bio ?? null;
            // ensure client ids exist
            newDraft.social.value = (original.social ?? []).map((s) => ({ ...s, id: s.id ?? uuidv4() }));
            newDraft.owner.name.value = original.owner.name;
            newDraft.owner.email = original.owner.email;
            newDraft.owner.phone.value = original.owner.phone ?? null;
            newDraft.owner.oauthProvider = original.owner.oauthProvider ?? null;
            newDraft.documents.value = original.documents ?? [];
            newDraft.subscriptionHistory = original.subscriptionHistory ?? [];
            newDraft.currentSubscription.value = original.currentSubscription ?? null;
            newDraft.status.value = original.status;
            newDraft.isSuspended = original.isSuspended;
            newDraft.isActive = original.isActive;
            newDraft.hasActiveSubscription = original.hasActiveSubscription;
            newDraft.aggregates = original.aggregates;
            set({ draft: newDraft });
        },

        async saveDraft() {
            const draft = get().draft;
            if (!draft) {
                const err = "No draft loaded";
                set({ error: err });
                return { ok: false, errors: [err] } as UpdateGuideOverviewResponse;
            }
            set({ saving: true, error: null });
            try {
                const body: UpdateGuideOverviewRequest = {};

                if (draft.companyName.dirty) body.companyName = draft.companyName.value;
                if (draft.bio.dirty) body.bio = draft.bio.value;
                if (draft.social.dirty) {
                    // send social without client-only ids when possible (backend may accept id if present)
                    body.social = draft.social.value.map(({ id, ...rest }) => rest);
                }
                if (draft.owner.name.dirty || draft.owner.phone.dirty) {
                    body.owner = {
                        ...(draft.owner.name.dirty && { name: draft.owner.name.value }),
                        ...(draft.owner.phone.dirty && { phone: draft.owner.phone.value }),
                    };
                }
                if (draft.documents.dirty) body.documents = draft.documents.value;
                if (draft.currentSubscription.dirty) body.currentSubscription = draft.currentSubscription.value ?? null;
                if (draft.status.dirty) body.status = draft.status.value;

                const res = await api.patch<UpdateGuideOverviewResponse>(URL_AFTER_API, body);
                if (!res.data.ok) throw new Error(res.data.errors?.join(", ") || "Save failed");

                const updated = res.data.data!;

                // ensure client ids for social persist after save
                const socialWithIds = (updated.social ?? []).map((s, i) => {
                    // try to match by url+platform to keep client id; fallback to new uuid
                    const existing = draft.social.value.find((x) => x.url === s.url && x.platform === s.platform);
                    return { ...s, id: existing?.id ?? uuidv4() };
                });

                const nextDraft: EditableGuideOverview = {
                    ...draft,
                    companyName: { value: updated.companyName, dirty: false },
                    bio: { value: updated.bio ?? null, dirty: false },
                    social: { value: socialWithIds, dirty: false },
                    owner: {
                        ...draft.owner,
                        name: { value: updated.owner.name, dirty: false },
                        phone: { value: updated.owner.phone ?? null, dirty: false },
                    },
                    documents: { value: updated.documents ?? [], dirty: false },
                    subscriptionHistory: updated.subscriptionHistory ?? [],
                    currentSubscription: { value: updated.currentSubscription ?? null, dirty: false },
                    status: { value: updated.status, dirty: false },
                    isSuspended: updated.isSuspended,
                    isActive: updated.isActive,
                    hasActiveSubscription: updated.hasActiveSubscription,
                    aggregates: updated.aggregates,
                };

                set({ original: updated, draft: nextDraft, saving: false });
                return res.data;
            } catch (err) {
                const message = extractErrorMessage(err);
                set({ saving: false, error: message });
                return { ok: false, errors: [message] } as UpdateGuideOverviewResponse;
            }
        },

        /* -------------------------
         * Social CRUD
         * ------------------------- */

        addSocial(entry: GuideSocialEntry) {
            const draft = get().draft;
            if (!draft) return;
            const newEntry: GuideSocialEntry = { ...entry, id: entry.id ?? uuidv4() };
            const next = [...draft.social.value, newEntry];
            set({ draft: { ...draft, social: { value: next, dirty: true } } });
        },

        updateSocial(id: string | undefined, patch: Partial<GuideSocialEntry>) {
            const draft = get().draft;
            if (!draft) return;
            const next = draft.social.value.map((s) => (s.id === id ? { ...s, ...patch } : s));
            set({ draft: { ...draft, social: { value: next, dirty: true } } });
        },

        removeSocial(id: string) {
            const draft = get().draft;
            if (!draft) return;
            const next = draft.social.value.filter((s) => s.id !== id);
            set({ draft: { ...draft, social: { value: next, dirty: true } } });
        },

        reorderSocial(newOrder: string[]) {
            const draft = get().draft;
            if (!draft) return;
            const map = new Map(draft.social.value.map((s) => [s.id ?? "", s]));
            const reordered: GuideSocialEntry[] = [];
            for (const id of newOrder) {
                const item = map.get(id);
                if (item) reordered.push(item);
            }
            // append any missing entries that were not included in newOrder
            for (const s of draft.social.value) {
                if (!reordered.some((r) => r.id === s.id)) reordered.push(s);
            }
            set({ draft: { ...draft, social: { value: reordered, dirty: true } } });
        },

        /* -------------------------
         * Document operations
         * ------------------------- */

        addDocument(doc: GuideDocument) {
            const draft = get().draft;
            if (!draft) return;
            const nextDocs = [...draft.documents.value, doc];
            set({
                draft: { ...draft, documents: { value: nextDocs, dirty: true } },
            });
        },

        updateDocument(id: string | undefined, patch: Partial<GuideDocument>) {
            const draft = get().draft;
            if (!draft) return;
            const nextDocs = draft.documents.value.map((d) => (d.id === id ? { ...d, ...patch } : d));
            set({ draft: { ...draft, documents: { value: nextDocs, dirty: true } } });
        },

        removeDocument(id: string) {
            const draft = get().draft;
            if (!draft) return;
            const nextDocs = draft.documents.value.filter((d) => d.id !== id);
            set({ draft: { ...draft, documents: { value: nextDocs, dirty: true } } });
        },

        /* -------------------------
         * Subscription refresh & pagination
         * ------------------------- */

        async refreshSubscriptionHistory(): Promise<{ ok: boolean; error?: string | null }> {
            const original = get().original;
            const draft = get().draft;
            if (!original) {
                const err = "No original loaded";
                set({ error: err });
                return { ok: false, error: err };
            }
            set({ loading: true, error: null });
            try {
                const res = await api.get<GetSubscriptionsResponse>(`${URL_AFTER_API}/subscriptions`);
                if (!res.data.ok || !res.data.data) {
                    throw new Error(res.data.errors?.join(", ") || "Invalid response");
                }
                const snapshot = res.data.data.subscriptionHistory ?? [];
                set({
                    original: { ...original, subscriptionHistory: snapshot },
                    draft: draft ? { ...draft, subscriptionHistory: snapshot } : draft,
                    loading: false,
                    subscriptionsCursor: snapshot.length ? snapshot[snapshot.length - 1].createdAt ?? null : null,
                    subscriptionsHasMore: snapshot.length >= 20,
                });
                return { ok: true };
            } catch (err) {
                const message = extractErrorMessage(err);
                set({ loading: false, error: message });
                return { ok: false, error: message };
            }
        },

        async loadMoreSubscriptions(pageSize = 20) {
            const original = get().original;
            const draft = get().draft;
            if (!original) {
                const err = "No original loaded";
                set({ error: err });
                return { status: "error", error: err };
            }
            if (!get().subscriptionsHasMore) return { status: "noMore" };
            set({ subscriptionsLoadingMore: true, error: null });
            try {
                const cursor = get().subscriptionsCursor;
                const qs = cursor ? `?after=${encodeURIComponent(cursor)}&limit=${pageSize}` : `?limit=${pageSize}`;
                const res = await api.get<GetSubscriptionsResponse>(`${URL_AFTER_API}/subscriptions${qs}`);
                if (!res.data.ok || !res.data.data) {
                    throw new Error(res.data.errors?.join(", ") || "Invalid response");
                }
                const incoming = res.data.data.subscriptionHistory ?? [];
                const existing = original.subscriptionHistory ?? [];
                const existingKeys = new Set<string>();
                for (const e of existing) {
                    if (e.id) existingKeys.add(`id:${e.id}`);
                    else if (e.paymentId) existingKeys.add(`p:${e.paymentId}`);
                    else existingKeys.add(`created:${e.createdAt ?? ""}`);
                }
                const newItems: typeof incoming = [];
                for (const it of incoming) {
                    const key = it.id ? `id:${it.id}` : it.paymentId ? `p:${it.paymentId}` : `created:${it.createdAt ?? ""}`;
                    if (!existingKeys.has(key)) {
                        existingKeys.add(key);
                        newItems.push(it);
                    }
                }
                const merged = [...existing, ...newItems];
                const last = incoming.length ? incoming[incoming.length - 1] : null;
                const nextCursor = last?.createdAt ?? null;
                const hasMore = incoming.length === pageSize;
                set({
                    original: { ...original, subscriptionHistory: merged },
                    draft: draft ? { ...draft, subscriptionHistory: merged } : draft,
                    subscriptionsCursor: nextCursor,
                    subscriptionsHasMore: hasMore,
                    subscriptionsLoadingMore: false,
                });
                return { status: "success", added: newItems.length, hasMore };
            } catch (err) {
                const message = extractErrorMessage(err);
                set({ subscriptionsLoadingMore: false, error: message });
                return { status: "error", error: message };
            }
        },

        validateDraft() {
            const draft = get().draft;
            if (!draft) return { valid: false, errors: { general: "No draft loaded" } };
            const errors: Record<string, string> = {};
            if (!draft.companyName.value.trim()) errors.companyName = "Company name is required";
            if (draft.social.value.some((s) => !s.url || !s.platform)) errors.social = "All social entries must have platform and url";
            return {
                valid: Object.keys(errors).length === 0,
                errors: Object.keys(errors).length ? errors : null,
            };
        },
    }))
);
