"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDashboardStats } from "@/actions/series";
import {
    LayoutGrid,
    Video,
    CheckCircle2,
    Loader2,
    TrendingUp,
    PauseCircle,
    XCircle,
} from "lucide-react";

interface Stats {
    totalSeries: number;
    activeSeries: number;
    pausedSeries: number;
    totalVideos: number;
    generatingVideos: number;
    publishedVideos: number;
    failedVideos: number;
}

const DEFAULT_STATS: Stats = {
    totalSeries: 0,
    activeSeries: 0,
    pausedSeries: 0,
    totalVideos: 0,
    generatingVideos: 0,
    publishedVideos: 0,
    failedVideos: 0,
};

interface StatCardProps {
    label: string;
    value: number;
    sub?: string;
    subValue?: number;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    badge?: string;
    badgeColor?: string;
    pulse?: boolean;
}

function StatCard({
    label,
    value,
    sub,
    subValue,
    icon: Icon,
    iconColor,
    iconBg,
    badge,
    badgeColor,
    pulse,
}: StatCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md will-change-transform">
            {/* Top row */}
            <div className="flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </span>
                {badge && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeColor}`}>
                        {pulse && (
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                            </span>
                        )}
                        {badge}
                    </span>
                )}
            </div>

            {/* Value */}
            <p className="mt-4 text-3xl font-extrabold text-gray-900 tabular-nums leading-none">
                {value}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>

            {/* Sub-stat */}
            {sub && subValue !== undefined && (
                <p className="mt-2 text-xs text-gray-400">
                    {subValue} {sub}
                </p>
            )}

            {/* Subtle gradient accent */}
            <div className={`pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full opacity-10 ${iconBg}`} />
        </div>
    );
}

interface Props {
    initialStats: Stats;
}

export default function DashboardStats({ initialStats }: Props) {
    const [stats, setStats] = useState<Stats>(initialStats);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {

        setMounted(true);
    }, []);

    const refresh = useCallback(async () => {
        const res = await getDashboardStats();
        if (res.success && res.data) {
            setStats(res.data as Stats);
            setLastUpdated(new Date());
        }
    }, []);

    useEffect(() => {
        // ── Supabase real-time subscriptions ──
        const supabase = createClient();

        const seriesSub = supabase
            .channel("series-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "video_series" },
                () => refresh()
            )
            .subscribe();

        const videoSub = supabase
            .channel("video-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "video_assets" },
                () => refresh()
            )
            .subscribe();

        // ── Polling fallback every 15 seconds ──
        const interval = setInterval(refresh, 15_000);

        return () => {
            supabase.removeChannel(seriesSub);
            supabase.removeChannel(videoSub);
            clearInterval(interval);
        };
    }, [refresh]);

    const cards: StatCardProps[] = [
        {
            label: "Total Series",
            value: stats.totalSeries,
            sub: "paused",
            subValue: stats.pausedSeries,
            icon: LayoutGrid,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-50",
            badge: stats.activeSeries > 0 ? `${stats.activeSeries} Active` : undefined,
            badgeColor: "bg-purple-100 text-purple-700",
        },
        {
            label: "Total Videos",
            value: stats.totalVideos,
            sub: "published",
            subValue: stats.publishedVideos,
            icon: Video,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
            badge:
                stats.generatingVideos > 0
                    ? `${stats.generatingVideos} Generating`
                    : undefined,
            badgeColor: "bg-blue-100 text-blue-700",
            pulse: stats.generatingVideos > 0,
        },
        {
            label: "Published",
            value: stats.publishedVideos,
            sub: "generating now",
            subValue: stats.generatingVideos,
            icon: CheckCircle2,
            iconColor: "text-green-600",
            iconBg: "bg-green-50",
            badge: stats.publishedVideos > 0 ? "Live" : undefined,
            badgeColor: "bg-green-100 text-green-700",
        },
        {
            label: "Active Series",
            value: stats.activeSeries,
            sub: "paused",
            subValue: stats.pausedSeries,
            icon: TrendingUp,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-50",
            badge: stats.failedVideos > 0 ? `${stats.failedVideos} Failed` : undefined,
            badgeColor: "bg-red-100 text-red-600",
        },
    ];

    return (
        <div>
            {/* Real-time indicator */}
            <div className="mb-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-xs text-gray-400">
                    Live · Updated {mounted ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--"}
                </span>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>
        </div>
    );
}
