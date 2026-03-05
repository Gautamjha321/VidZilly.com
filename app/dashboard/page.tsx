import { getSeries, getDashboardStats } from "@/actions/series";
import Link from "next/link";
import SeriesGrid from "./_components/SeriesGrid";
import DashboardStats from "./_components/DashboardStats";
import { LayoutGrid } from "lucide-react";

// Force this route to always be rendered dynamically (server-side per request)
// because it uses Clerk's currentUser() which reads HTTP request headers.
export const dynamic = "force-dynamic";


export default async function DashboardPage() {
    const [{ success, data }, statsRes] = await Promise.all([
        getSeries(),
        getDashboardStats(),
    ]);

    const seriesList = success && data ? data : [];
    const initialStats = statsRes.success && statsRes.data
        ? statsRes.data
        : {
            totalSeries: 0,
            activeSeries: 0,
            pausedSeries: 0,
            totalVideos: 0,
            generatingVideos: 0,
            publishedVideos: 0,
            failedVideos: 0,
        };

    return (
        <div>
            {/* ── Header ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
                <p className="mt-1 text-gray-500">
                    Here&apos;s a live overview of your video content.
                </p>
            </div>

            {/* ── Real-time Stats Cards ── */}
            <DashboardStats initialStats={initialStats as any} />

            {/* ── Series List ── */}
            {seriesList.length > 0 ? (
                <div className="mt-10">
                    <div className="mb-4 flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-purple-600" />
                        <h2 className="text-xl font-bold text-gray-900">Your Video Series</h2>
                        <span className="ml-auto rounded-full bg-purple-50 border border-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-700">
                            {seriesList.length} series
                        </span>
                    </div>
                    <SeriesGrid seriesList={seriesList} />
                </div>
            ) : (
                <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
                        <svg
                            className="h-7 w-7 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">No series yet</h3>
                    <p className="mb-6 max-w-sm text-sm text-gray-500">
                        Create your first video series to start generating and scheduling AI
                        videos across all platforms.
                    </p>
                    <Link
                        href="/dashboard/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 transition-all hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-300"
                    >
                        + Create New Series
                    </Link>
                </div>
            )}
        </div>
    );
}
