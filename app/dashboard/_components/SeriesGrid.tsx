/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { deleteSeries, toggleSeriesStatus, generateVideoInngest } from "@/actions/series";
import SeriesCard from "./SeriesCard";
import UpgradePopup from "./UpgradePopup";

export default function SeriesGrid({ seriesList }: { seriesList: any[] }) {
    const router = useRouter();
    const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showUpgradePopup, setShowUpgradePopup] = useState(false);

    const confirmDelete = async () => {
        if (!seriesToDelete) return;
        setIsDeleting(true);
        const res = await deleteSeries(seriesToDelete);
        if (res.success) {
            router.refresh();
        } else {
            alert("Failed to delete series: " + res.error);
        }
        setIsDeleting(false);
        setSeriesToDelete(null);
    };

    const handleTogglePause = async (id: string, currentStatus: string) => {
        const res = await toggleSeriesStatus(id, currentStatus);
        if (res.success) {
            router.refresh();
        } else {
            alert("Failed to toggle status: " + res.error);
        }
    };

    const handleGenerateVideo = async (id: string) => {
        const res = await generateVideoInngest(id);
        if (res.success) {
            router.push("/dashboard/video");
        } else if (res.error === "upgrade_required") {
            setShowUpgradePopup(true);
        } else {
            alert("Failed to start video generation: " + res.error);
        }
    };

    const handleExecuteWorkflow = async (id: string) => {
        try {
            const res = await fetch("/api/execute-workflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seriesId: id }),
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Workflow started! Video is generating and will publish to all platforms when ready.");
                router.push("/dashboard/video");
            } else if (data.error === "upgrade_required") {
                setShowUpgradePopup(true);
            } else {
                alert("❌ Failed to execute workflow: " + data.error);
            }
        } catch (err: any) {
            alert("❌ Network error: " + err.message);
        }
    };
    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {seriesList.map((series: any) => (
                    <SeriesCard
                        key={series.id}
                        series={series}
                        onEdit={(id) => router.push(`/dashboard/edit/${id}`)}
                        onDelete={(id) => setSeriesToDelete(id)}
                        onTogglePause={(id, status) => handleTogglePause(id, status)}
                        onGenerateVideo={handleGenerateVideo}
                        onViewGenerated={(id) => router.push("/dashboard/video")}
                        onExecuteWorkflow={handleExecuteWorkflow}
                    />
                ))}
            </div>

            {/* Series Deletion Confirmation Modal */}
            {seriesToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="border-b border-gray-100 flex items-center gap-3 bg-red-50/50 p-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 border border-red-200">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Delete Series</h3>
                                <p className="text-sm text-gray-500">This action is permanent and irreversible.</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4 text-sm text-gray-600 mb-8">
                                <p>Are you sure you want to permanently delete this series?</p>
                                <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-red-800 text-xs">
                                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                                        <AlertTriangle className="h-4 w-4" /> Warning
                                    </p>
                                    <p>
                                        Deleting this series will also instantly delete <strong>all generated videos</strong> associated with it. This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setSeriesToDelete(null)}
                                    disabled={isDeleting}
                                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition whitespace-nowrap"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isDeleting ? "Deleting..." : "Permanently Delete Series"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <UpgradePopup
                isOpen={showUpgradePopup}
                onClose={() => setShowUpgradePopup(false)}
                title="Limit Reached"
                description="You've reached the free plan limit of 2 generated videos. Upgrade your plan to generate unlimited AI videos!"
            />
        </>
    );
}
