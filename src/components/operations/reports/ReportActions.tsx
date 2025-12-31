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
import { MdAssignmentInd, MdCheckCircle, MdRestore, MdDeleteForever, MdMoreHoriz } from "react-icons/md";
import { useReportsStore } from "@/store/report.store";
import { PulseLoader } from "./PulseLoader";

export const ReportActions: FC<{ reportId: string }> = ({ reportId }) => {
    const { assignReport, resolveReport, reopenReport, softDeleteReport } = useReportsStore();

    const [assignOpen, setAssignOpen] = useState(false);
    const [resolveOpen, setResolveOpen] = useState(false);
    const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [assignUserId, setAssignUserId] = useState("");
    const [resolutionNotes, setResolutionNotes] = useState("");

    const onAssign = async (e: FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await assignReport(reportId, assignUserId);
            setAssignOpen(false);
            setAssignUserId("");
        } finally {
            setActionLoading(false);
        }
    };

    const onResolve = async (e: FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await resolveReport(reportId, resolutionNotes);
            setResolveOpen(false);
            setResolutionNotes("");
        } finally {
            setActionLoading(false);
        }
    };

    const onReopen = async () => {
        setActionLoading(true);
        try {
            await reopenReport(reportId);
        } finally {
            setActionLoading(false);
        }
    };

    const onDelete = async () => {
        setActionLoading(true);
        try {
            await softDeleteReport(reportId);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <MdMoreHoriz className="mr-2" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="flex flex-col space-y-2 p-2 w-44">
                {/* Assign Dialog */}
                <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="justify-start w-full">
                            <MdAssignmentInd className="mr-2" /> Assign
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign report</DialogTitle>
                            <DialogDescription>Enter the admin/user ID to assign this report.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onAssign} className="space-y-4">
                            <Input
                                value={assignUserId}
                                onChange={(e) => setAssignUserId(e.target.value)}
                                placeholder="User ID"
                                aria-label="User ID"
                                required
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setAssignOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={actionLoading}>
                                    {actionLoading ? <PulseLoader /> : "Assign"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Resolve Dialog */}
                <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="justify-start w-full">
                            <MdCheckCircle className="mr-2" /> Resolve
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Resolve report</DialogTitle>
                            <DialogDescription>Optional: Add resolution notes for internal tracking.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onResolve} className="space-y-4">
                            <Input
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Resolution notes"
                                aria-label="Resolution notes"
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setResolveOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={actionLoading}>
                                    {actionLoading ? <PulseLoader /> : "Resolve"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reopen Alert */}
                <AlertDialog open={reopenConfirmOpen} onOpenChange={setReopenConfirmOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="justify-start w-full">
                            <MdRestore className="mr-2" /> Reopen
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reopen Report?</AlertDialogTitle>
                            Are you sure you want to reopen this report?
                        </AlertDialogHeader>
                        <div className="flex justify-end space-x-2 mt-4">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onReopen} disabled={actionLoading}>
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
                            This action cannot be undone. Are you sure you want to delete this report?
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
