"use server";

import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseUserId } from "./user";

export async function getVideos() {
    noStore();
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, data: [] };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Get all series IDs owned by this user
        const { data: userSeries, error: seriesError } = await supabase
            .from("video_series")
            .select("id")
            .eq("user_id", userId);

        if (seriesError || !userSeries || userSeries.length === 0) {
            return { success: true, data: [] };
        }

        const userSeriesIds = userSeries.map((s) => s.id);

        // 2. Fetch video assets that belong only to those series
        const { data: videos, error } = await supabase
            .from("video_assets")
            .select("*")
            .in("series_id", userSeriesIds)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching videos:", error.message, error.details, error.hint);
            return { success: false, data: [] };
        }

        if (!videos || videos.length === 0) {
            return { success: true, data: [] };
        }

        // Fetch series names for all unique series_ids
        const seriesIds = [...new Set(videos.map((v) => v.series_id).filter(Boolean))];
        let seriesMap: Record<string, string> = {};

        if (seriesIds.length > 0) {
            const { data: seriesData } = await supabase
                .from("video_series")
                .select("id, series_name")
                .in("id", seriesIds);

            if (seriesData) {
                seriesMap = Object.fromEntries(seriesData.map((s) => [s.id, s.series_name]));
            }
        }

        // Merge series_name into each video record
        const enriched = videos.map((v) => ({
            ...v,
            video_series: v.series_id ? { series_name: seriesMap[v.series_id] || "Unknown Series" } : null,
        }));

        return { success: true, data: enriched };
    } catch (err: any) {
        console.error("Fetch videos caught error:", err.message);
        return { success: false, data: [] };
    }
}

export async function deleteVideo(videoId: string) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "Unauthorized" };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. First find the video to get its series_id
        const { data: videoAsset, error: fetchError } = await supabase
            .from("video_assets")
            .select("series_id")
            .eq("id", videoId)
            .single();

        if (fetchError || !videoAsset) {
            return { success: false, error: "Video not found" };
        }

        // 2. Verify the user owns the parent series
        const { data: seriesLink, error: seriesError } = await supabase
            .from("video_series")
            .select("id")
            .match({ id: videoAsset.series_id, user_id: userId })
            .single();

        if (seriesError || !seriesLink) {
            return { success: false, error: "Unauthorized to delete this video" };
        }

        // 3. Authorized. Safe to delete.
        const { error } = await supabase
            .from("video_assets")
            .delete()
            .eq("id", videoId);

        if (error) {
            console.error("Error deleting video:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Delete video caught error:", err);
        return { success: false, error: err.message };
    }
}
