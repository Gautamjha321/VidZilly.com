"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Edit, MoreVertical, Play, Pause, Trash2, Video, Youtube, Instagram, Facebook, Mail, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { videoStyles } from "../create/_components/VideoStyleSelection";

interface SeriesRecord {
    id: string;
    created_at: string;
    series_name: string;
    video_style: string;
    platforms?: string[];
    status?: string;
    // other fields omitted for brevity
}

const getPlatformIcon = (platform: string) => {
    switch (platform) {
        case "youtube": return Youtube;
        case "instagram": return Instagram;
        case "facebook": return Facebook;
        case "tiktok": return Video; // TikTok doesn't have a perfect Lucide icon, Video is decent
        case "email": return Mail;
        default: return null;
    }
};

interface SeriesCardProps {
    series: SeriesRecord;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTogglePause: (id: string, currentStatus: string) => void;
    onGenerateVideo: (id: string) => void;
    onViewGenerated: (id: string) => void;
    onExecuteWorkflow: (id: string) => Promise<void>;
}

export default function SeriesCard({
    series,
    onEdit,
    onDelete,
    onTogglePause,
    onGenerateVideo,
    onViewGenerated,
    onExecuteWorkflow,
}: SeriesCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    // Fallback if the style gets removed from code
    const styleObj = videoStyles.find((s) => s.id === series.video_style);
    const thumbnailSrc = styleObj?.image || "/video-style/cinematic.png";

    const currentStatus = series.status || "Active";
    const statusColorClass = currentStatus === "Active"
        ? "bg-green-500/80 text-white"
        : currentStatus === "Paused"
            ? "bg-amber-500/80 text-white"
            : "bg-blue-500/80 text-white";

    return (
        <div className="group flex flex-col rounded-[28px] border border-gray-100/80 bg-white p-2.5 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-visible will-change-transform">

            {/* Thumbnail Area (Inset floating style) */}
            <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden rounded-[20px] ring-1 ring-black/5 ring-inset mb-4">
                <Image
                    src={thumbnailSrc}
                    alt={series.series_name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Status Badge overlay top left */}
                <div className="absolute left-3 top-3 z-10">
                    <span className={`inline-flex items-center rounded-full backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ring-1 ring-white/30 ${statusColorClass} will-change-transform`}>
                        {currentStatus}
                    </span>
                </div>

                {/* Edit Button overlay top right */}
                <button
                    onClick={() => onEdit(series.id)}
                    className="absolute z-10 right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white ring-1 ring-white/20 transition-all hover:bg-black/60 hover:scale-105 opacity-0 group-hover:opacity-100 will-change-transform"
                    title="Edit Series"
                >
                    <Edit className="h-4 w-4" />
                </button>
            </div>

            {/* Content & Actions */}
            <div className="flex flex-1 flex-col px-2.5 pb-2">
                <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 pr-4">
                        <div className="flex gap-2 mb-2 items-center text-gray-400">
                            <span className="inline-flex rounded-lg bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 ring-1 ring-purple-200/50">
                                {styleObj?.name || "Style"}
                            </span>
                            {/* Platform Icons */}
                            {series.platforms && series.platforms.map((p) => {
                                const Icon = getPlatformIcon(p);
                                return Icon ? <Icon key={p} className="h-3.5 w-3.5 transition-colors group-hover:text-purple-500" /> : null;
                            })}
                        </div>
                        <h3 className="truncate text-lg font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {series.series_name}
                        </h3>
                        <p className="text-[12px] text-gray-500 font-semibold mt-0.5">
                            Created {format(new Date(series.created_at), "MMM d, yyyy")}
                        </p>
                    </div>

                    {/* Popover Menu Trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="relative z-40 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {/* Popover Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-10 z-[60] w-44 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-100 origin-top-right will-change-transform">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onEdit(series.id);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50/80 transition-colors"
                                >
                                    <Edit className="h-4 w-4 text-gray-400" />
                                    Edit Series
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onTogglePause(series.id, currentStatus);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50/80 transition-colors border-t border-gray-50"
                                >
                                    <Pause className="h-4 w-4 text-gray-400" />
                                    {currentStatus === "Active" ? "Pause" : "Resume"}
                                </button>
                                <div className="h-px bg-gray-100" />
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onDelete(series.id);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-auto pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <button
                            onClick={() => onViewGenerated(series.id)}
                            className="flex items-center justify-center gap-1.5 rounded-2xl border border-gray-200/80 bg-white px-3 py-3 text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-[1px]"
                        >
                            <Video className="h-4 w-4" />
                            View
                        </button>
                        <button
                            onClick={() => onGenerateVideo(series.id)}
                            className="flex items-center justify-center gap-1.5 rounded-2xl bg-purple-600 px-3 py-3 text-xs font-bold text-white shadow-md shadow-purple-200 transition-all hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-300 hover:-translate-y-[1px]"
                        >
                            <Play className="h-4 w-4" />
                            Generate
                        </button>
                    </div>

                    {/* Execute Workflow */}
                    <button
                        onClick={async () => {
                            setIsRunning(true);
                            try {
                                await onExecuteWorkflow(series.id);
                            } finally {
                                setIsRunning(false);
                            }
                        }}
                        disabled={isRunning}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-3.5 text-[13px] font-bold text-white shadow-md shadow-orange-200 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:-translate-y-[1px] disabled:transform-none disabled:opacity-60 disabled:cursor-not-allowed group/btn"
                    >
                        {isRunning ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Running Workflow...</>
                        ) : (
                            <><Zap className="h-4 w-4 group-hover/btn:scale-110 transition-transform" /> Execute Workflow</>
                        )}
                    </button>
                </div>
            </div>

            {/* Click outside listener for menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-50"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
}
