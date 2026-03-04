"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Play, Loader2, Video as VideoIcon, Trash2, X, Download, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteVideo } from "@/actions/video";

interface VideoAsset {
    id: string;
    created_at: string;
    status: string;
    image_urls?: string[];
    final_video_url?: string;
    video_series?: {
        series_name: string;
    };
}

export default function VideoGrid({ videos: initialVideos }: { videos: VideoAsset[] }) {
    const router = useRouter();
    const [videos, setVideos] = useState<VideoAsset[]>(initialVideos);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

    // Keep local state in sync with server props when router.refresh() fetches new data
    useEffect(() => {
        setVideos(initialVideos);
    }, [initialVideos]);

    // Poll every 5s using router.refresh() which re-runs the server component
    // and pushes new props down — avoids Next.js server action timeout crashes
    useEffect(() => {
        const hasGeneratingVideos = videos.some(
            (v) => v.status === "GENERATING" || v.status === "GENERATING_VIDEO"
        );

        if (!hasGeneratingVideos) return;

        const interval = setInterval(() => {
            router.refresh();
        }, 10000);

        return () => clearInterval(interval);
    }, [videos, router]);

    const confirmDelete = async () => {
        if (!videoToDelete) return;

        setIsDeleting(videoToDelete);
        const result = await deleteVideo(videoToDelete);

        if (result.success) {
            setVideos((prev) => prev.filter((v) => v.id !== videoToDelete));
            router.refresh();
        } else {
            alert(`Failed to delete: ${result.error}`);
        }

        setIsDeleting(null);
        setVideoToDelete(null);
    };

    // Force download by fetching as blob (bypasses cross-origin restriction on `download` attribute)
    const handleDownload = async (e: React.MouseEvent, url: string, name: string) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${name.replace(/\s+/g, "_")}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            alert("Download failed. Please try again.");
            console.error(err);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos.map((video) => {
                    const isGenerating = video.status === "GENERATING" || video.status === "GENERATING_VIDEO";
                    const isError = video.status === "ERROR";
                    const isCompleted = video.status === "COMPLETED";

                    // Thumbnail logic: use first generated image if available, else placeholder
                    const thumbnailSrc = video.image_urls?.find(url => url && url.length > 0) || null;

                    const seriesName = video.video_series?.series_name || "Untitled Series";

                    return (
                        <div
                            key={video.id}
                            onClick={() => {
                                if (isCompleted && video.final_video_url) {
                                    setPlayingVideo(video.final_video_url);
                                }
                            }}
                            className={`group flex flex-col rounded-[28px] border border-gray-100/80 bg-white p-2.5 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-visible will-change-transform ${isCompleted && video.final_video_url ? "cursor-pointer" : ""
                                }`}
                        >
                            {/* Thumbnail Area (Inset floating style) */}
                            <div className="relative aspect-[4/5] w-full bg-gray-50 flex items-center justify-center overflow-hidden rounded-[20px] ring-1 ring-black/5 ring-inset mb-3">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center text-purple-600">
                                        <Loader2 className="h-10 w-10 animate-spin mb-3" />
                                        <span className="text-sm font-semibold tracking-wide">
                                            {video.status === "GENERATING_VIDEO" ? "RENDERING VIDEO..." : "GENERATING..."}
                                        </span>
                                        <span className="text-xs text-purple-400 mt-1 max-w-[80%] text-center">
                                            {video.status === "GENERATING_VIDEO"
                                                ? "Compiling final MP4 on AWS..."
                                                : "AI is writing, speaking, and drawing..."}
                                        </span>
                                    </div>
                                ) : isError ? (
                                    <div className="flex flex-col items-center justify-center text-red-500">
                                        <VideoIcon className="h-10 w-10 mb-2 opacity-50" />
                                        <span className="text-sm font-semibold text-center">GENERATION<br />FAILED</span>
                                    </div>
                                ) : thumbnailSrc ? (
                                    <>
                                        <Image
                                            src={thumbnailSrc}
                                            alt={seriesName}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] will-change-transform"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {isCompleted && video.final_video_url && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="bg-white/95 backdrop-blur-md rounded-full p-4 shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300 ring-1 ring-black/5 will-change-transform">
                                                    <Play className="h-8 w-8 text-purple-600 ml-1" />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <VideoIcon className="h-10 w-10 mb-2 opacity-50" />
                                        <span className="text-sm font-medium">No Thumbnail</span>
                                    </div>
                                )}

                                {/* Status Overlay */}
                                <div className="absolute left-3 top-3">
                                    <span
                                        className={`inline-flex items-center rounded-full backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ring-1 ring-white/30 will-change-transform
                                        ${isGenerating ? "bg-purple-500/90 text-white"
                                                : isError ? "bg-red-500/90 text-white"
                                                    : "bg-green-500/90 text-white"}`}
                                    >
                                        {video.status.replace("_", " ")}
                                    </span>
                                </div>

                                {/* Delete + Download Buttons */}
                                <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 text-white">
                                    {isCompleted && video.final_video_url && (
                                        <button
                                            onClick={(e) => handleDownload(e, video.final_video_url!, seriesName)}
                                            className="p-2 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full shadow-sm ring-1 ring-white/20 transition-all hover:scale-110"
                                            title="Download Video"
                                        >
                                            <Download className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setVideoToDelete(video.id);
                                        }}
                                        disabled={isDeleting === video.id}
                                        className="p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-full shadow-sm ring-1 ring-white/20 transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                                        title="Delete Video"
                                    >
                                        {isDeleting === video.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Content Info */}
                            <div className="flex flex-1 flex-col px-2 pb-1">
                                <h3 className="truncate text-[17px] font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors" title={seriesName}>
                                    {seriesName}
                                </h3>
                                <p className="text-[12px] text-gray-500 mt-0.5 font-semibold">
                                    Generated {format(new Date(video.created_at), "MMM d, yyyy")}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Video Play Modal */}
            {playingVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
                    <div className="relative w-full max-w-[400px] h-[85vh] sm:h-auto bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-center">
                        {/* Close Button */}
                        <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute z-[60] top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>

                        {/* Download Button in Modal */}
                        <button
                            onClick={(e) => handleDownload(e, playingVideo, "video")}
                            className="absolute z-[60] top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-blue-600/90 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-semibold rounded-full backdrop-blur-md transition-colors shadow"
                            title="Download Video"
                        >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            Download
                        </button>

                        <div className="relative aspect-[9/16] w-full bg-gray-900 flex items-center justify-center">
                            <video
                                key={playingVideo}
                                src={playingVideo}
                                className="w-full h-full object-contain"
                                controls
                                autoPlay
                                playsInline
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Deletion Confirmation Modal */}
            {videoToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="border-b border-gray-100 flex items-center gap-3 bg-red-50/50 p-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 border border-red-200">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Delete Video</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-8">
                                Are you sure you want to permanently delete this video? It will be removed from your dashboard and servers immediately.
                            </p>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setVideoToDelete(null)}
                                    disabled={isDeleting !== null}
                                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition whitespace-nowrap"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting !== null}
                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isDeleting !== null ? "Deleting..." : "Delete Video"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
