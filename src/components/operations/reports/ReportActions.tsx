"use client";

import { FC, FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { MdCheckCircle, MdRestore, MdDeleteForever, MdMoreHoriz, MdCancel } from "react-icons/md";
import { useReportsStore } from "@/store/report.store";
import { PulseLoader } from "./PulseLoader";
import { REPORT_STATUS, ReportListItem } from "@/types/reports.types";

export const ReportActions: FC<{ item: ReportListItem }> = ({ item }) => {
    const { resolveReport, reopenReport, softDeleteReport, rejectReport } = useReportsStore();

    const [resolveOpen, setResolveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [resolutionNotes, setResolutionNotes] = useState("");
    const [rejectNotes, setRejectNotes] = useState("");

    const onResolve = async (e: FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await resolveReport(item._id, resolutionNotes);
            setResolveOpen(false);
            setResolutionNotes("");
        } finally {
            setActionLoading(false);
        }
    };

    const onReject = async (e: FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await rejectReport(item._id, rejectNotes);
            setRejectOpen(false);
            setRejectNotes("");
        } finally {
            setActionLoading(false);
        }
    };

    const onReopen = async () => {
        setActionLoading(true);
        try {
            await reopenReport(item._id);
        } finally {
            setActionLoading(false);
        }
    };

    const onDelete = async () => {
        setActionLoading(true);
        try {
            await softDeleteReport(item._id);
        } finally {
            setActionLoading(false);
        }
    };

    const isOpenOrInReview = [REPORT_STATUS.OPEN, REPORT_STATUS.IN_REVIEW].includes(item.status);
    const isResolvedOrRejected = [REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED].includes(item.status);


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <MdMoreHoriz className="mr-2" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="flex flex-col space-y-2 p-2 w-48">

                {/* Resolve Dialog */}
                <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="justify-start w-full" disabled={!isOpenOrInReview}  >
                            <MdCheckCircle className="mr-2 text-emerald-600" /> Resolve
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Resolve Report</DialogTitle>
                            <DialogDescription>Mark this report as resolved. Add optional notes for internal tracking.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onResolve} className="space-y-4">
                            <Input
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Add resolution notes..."
                                aria-label="Resolution notes"
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setResolveOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700">
                                    {actionLoading ? <PulseLoader /> : "Mark as Resolved"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="justify-start w-full" disabled={!isOpenOrInReview}  >
                            <MdCancel className="mr-2 text-red-600" /> Reject
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Report</DialogTitle>
                            <DialogDescription>Mark this report as rejected. Add optional notes explaining the reason.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onReject} className="space-y-4">
                            <Input
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="Add rejection reason..."
                                aria-label="Rejection notes"
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setRejectOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                                    {actionLoading ? <PulseLoader /> : "Reject Report"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reopen Alert */}
                <AlertDialog open={reopenConfirmOpen} onOpenChange={setReopenConfirmOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="justify-start w-full" disabled={!isResolvedOrRejected}  >
                            <MdRestore className="mr-2 text-amber-600" /> Reopen
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reopen Report?</AlertDialogTitle>
                            Are you sure you want to reopen this report? This will change its status back to pending review.
                        </AlertDialogHeader>
                        <div className="flex justify-end space-x-2 mt-4">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onReopen} disabled={actionLoading} className="bg-amber-600 hover:bg-amber-700">
                                {actionLoading ? <PulseLoader /> : "Reopen"}
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Delete Alert */}
                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="justify-start w-full">
                            <MdDeleteForever className="mr-2" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                            This action cannot be undone. The report will be soft-deleted and archived.
                        </AlertDialogHeader>
                        <div className="flex justify-end space-x-2 mt-4">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} disabled={actionLoading}>
                                {actionLoading ? <PulseLoader /> : "Delete"}
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            </PopoverContent>
        </Popover>
    );
};