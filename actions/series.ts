/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseUserId } from "./user";

export async function createVideoSeries(data: any) {
    try {
        // Using Service Role Key to bypass RLS securely from the server
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get current Clerk user to save user_id in the series
        const clerkUser = await currentUser();
        let supabaseUserId: string | null = null;
        let userData: any = null;

        if (clerkUser?.id) {
            // First try to find existing user
            const { data, error: userError } = await supabase
                .from("users")
                .select("id, plan")
                .eq("clerk_id", clerkUser.id)
                .single();

            userData = data;

            // If user doesn't exist in Supabase yet (e.g., webhook failed/delayed), create them now
            if (!userData || userError) {
                const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
                const { data: newUser, error: createError } = await supabase
                    .from("users")
                    .insert([{
                        clerk_id: clerkUser.id,
                        email: primaryEmail,
                        name: clerkUser.fullName || primaryEmail?.split('@')[0] || "User",
                        created_at: new Date().toISOString()
                    }])
                    .select("id")
                    .single();
                if (!createError && newUser) {
                    supabaseUserId = newUser.id;
                    console.log("--- DEBUG: Created new user, ID is:", supabaseUserId);
                } else {
                    console.error("--- DEBUG: Failed to auto-create missing user:", createError);
                    return { success: false, error: `User syncing failed: ${createError?.message || 'Unknown error'}` };
                }
            } else {
                supabaseUserId = userData?.id || null;
                console.log("--- DEBUG: Found existing user, ID is:", supabaseUserId);
            }
        } else {
            console.log("--- DEBUG: clerkUser?.id is undefined");
        }

        console.log("--- DEBUG: Final supabaseUserId before insert is:", supabaseUserId);

        if (!supabaseUserId) {
            return { success: false, error: "Please log in again. We could not sync your user account." };
        }

        const userPlan = userData?.plan || null;

        if (!userPlan && supabaseUserId) {
            const { count } = await supabase
                .from("video_series")
                .select("*", { count: "exact", head: true })
                .eq("user_id", supabaseUserId);

            if (count !== null && count >= 2) {
                return { success: false, error: "upgrade_required" };
            }
        }

        console.log("--- DEBUG: About to insert into video_series with data:", {
            niche: data.selectedNiche,
            series_name: data.seriesName,
            user_id: supabaseUserId
        });

        const { error } = await supabase.from("video_series").insert([
            {
                niche: data.selectedNiche,
                custom_niche: data.customNiche,
                language: data.language,
                voice: data.voice,
                bg_music: data.bgMusic,
                video_style: data.videoStyle,
                caption_style: data.captionStyle,
                series_name: data.seriesName,
                duration: data.duration,
                platforms: data.platforms,
                publish_time: data.publishTime,
                status: "Active",
                user_id: supabaseUserId,
            },
        ]);

        if (error) {
            console.error("Error saving series:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Save series caught error:", err);
        return { success: false, error: err.message };
    }
}

export async function getSeries() {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, data: [] };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase
            .from("video_series")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching series:", error);
            return { success: false, data: [] };
        }

        return { success: true, data };
    } catch (err: any) {
        console.error("Fetch series caught error:", err);
        return { success: false, data: [] };
    }
}

export async function deleteSeries(id: string) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "Unauthorized" };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabase
            .from("video_series")
            .delete()
            .match({ id, user_id: userId });

        if (error) {
            console.error("Error deleting series:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Delete series caught error:", err);
        return { success: false, error: err.message };
    }
}

export async function toggleSeriesStatus(id: string, currentStatus: string) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "Unauthorized" };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const newStatus = currentStatus === "Active" ? "Paused" : "Active";

        const { error } = await supabase
            .from("video_series")
            .update({ status: newStatus })
            .match({ id, user_id: userId });

        if (error) {
            console.error("Error toggling series status:", error);
            return { success: false, error: error.message };
        }

        return { success: true, newStatus };
    } catch (err: any) {
        console.error("Toggle series status caught error:", err);
        return { success: false, error: err.message };
    }
}

export async function getSeriesById(id: string) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, data: null };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase
            .from("video_series")
            .select("*")
            .match({ id, user_id: userId })
            .single();

        if (error) {
            console.error("Error fetching series by id:", error);
            return { success: false, data: null };
        }

        return { success: true, data };
    } catch (err: any) {
        console.error("Fetch series by id caught error:", err);
        return { success: false, data: null };
    }
}

export async function updateSeries(id: string, data: any) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "Unauthorized" };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabase
            .from("video_series")
            .update({
                niche: data.selectedNiche,
                custom_niche: data.customNiche,
                language: data.language,
                voice: data.voice,
                bg_music: data.bgMusic,
                video_style: data.videoStyle,
                caption_style: data.captionStyle,
                series_name: data.seriesName,
                duration: data.duration,
                platforms: data.platforms,
                publish_time: data.publishTime,
            })
            .match({ id, user_id: userId });

        if (error) {
            console.error("Error updating series:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err: any) {
        console.error("Update series caught error:", err);
        return { success: false, error: err.message };
    }
}

export async function generateVideoInngest(seriesId: string) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "Unauthorized" };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 0. Verify series ownership
        const { data: series, error: authError } = await supabase
            .from("video_series")
            .select("id")
            .match({ id: seriesId, user_id: userId })
            .single();

        if (authError || !series) {
            return { success: false, error: "Unauthorized to generate video for this series" };
        }

        const { data: userData } = await supabase
            .from("users")
            .select("plan")
            .eq("id", userId)
            .single();

        const userPlan = userData?.plan || null;

        if (!userPlan) {
            const { data: userSeries } = await supabase
                .from("video_series")
                .select("id")
                .eq("user_id", userId);

            if (userSeries && userSeries.length > 0) {
                const seriesIds = userSeries.map((s: any) => s.id);
                const { count } = await supabase
                    .from("video_assets")
                    .select("*", { count: "exact", head: true })
                    .in("series_id", seriesIds);

                if (count !== null && count >= 2) {
                    return { success: false, error: "upgrade_required" };
                }
            }
        }

        // 1. Create a pending video record in the database first
        const { data: videoRecord, error: insertError } = await supabase
            .from("video_assets")
            .insert([
                {
                    series_id: seriesId,
                    status: "GENERATING",
                    script: "", // Empty placeholders since we don't have this data yet
                    scenes: [],
                }
            ])
            .select("id")
            .single();

        if (insertError) {
            console.error("Failed to create pending video record:", insertError);
            return { success: false, error: "Failed to initialize video generation" };
        }

        const videoId = videoRecord.id;

        // 2. Send the event to Inngest with both IDs
        const { inngest } = await import("@/inngest/client");

        await inngest.send({
            name: "video/generate",
            data: { seriesId, videoId },
        });

        // 3. Return the new video ID so the frontend can redirect to /dashboard/video
        return { success: true, data: { videoId } };
    } catch (err: any) {
        console.error("Generate video caught error:", err);
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Execute Workflow — triggers full generate + publish pipeline (used by the
// "Execute Workflow" button on the Series Card for manual testing)
// ─────────────────────────────────────────────────────────────────────────────
export async function executeWorkflow(seriesId: string) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "Unauthorized" };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Fetch series data (simple query, no joins) AND map to authenticated user
        const { data: series, error: seriesError } = await supabase
            .from("video_series")
            .select("*")
            .match({ id: seriesId, user_id: userId })
            .single();

        if (seriesError || !series) {
            console.error("Series fetch error:", seriesError?.message);
            return { success: false, error: "Series not found: " + seriesError?.message };
        }

        // 2. Get user email directly via user_id
        let userEmail: string | null = null;
        let userName: string = "there";

        if (series.user_id) {
            const { data: userData } = await supabase
                .from("users")
                .select("email, name")
                .eq("id", series.user_id)
                .single();
            userEmail = userData?.email ?? null;
            userName = userData?.name ?? "there";
        }

        // Fallback: get most recently created user
        if (!userEmail) {
            const { data: fallback } = await supabase
                .from("users")
                .select("email, name")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
            userEmail = fallback?.email ?? null;
            userName = fallback?.name ?? "there";
            console.log("Using fallback user email:", userEmail);
        }


        let userPlan = null;
        if (series.user_id) {
            const { data: planData } = await supabase
                .from("users")
                .select("plan")
                .eq("id", series.user_id)
                .single();
            userPlan = planData?.plan || null;
        }

        if (!userPlan) {
            const { data: userSeries } = await supabase
                .from("video_series")
                .select("id")
                .eq("user_id", userId);

            if (userSeries && userSeries.length > 0) {
                const seriesIds = userSeries.map((s: any) => s.id);
                const { count } = await supabase
                    .from("video_assets")
                    .select("*", { count: "exact", head: true })
                    .in("series_id", seriesIds);

                if (count !== null && count >= 2) {
                    return { success: false, error: "upgrade_required" };
                }
            }
        }

        // 3. Create a pending video record
        const { data: videoRecord, error: insertError } = await supabase
            .from("video_assets")
            .insert([{ series_id: seriesId, status: "GENERATING", script: "", scenes: [] }])
            .select("id")
            .single();

        if (insertError || !videoRecord) {
            console.error("Failed to create video record:", insertError);
            return { success: false, error: "Failed to initialize video generation" };
        }

        const videoId = videoRecord.id;

        // 4. Fire video/generate with triggerPublish: true so it dispatches video/publish on completion
        const { inngest } = await import("@/inngest/client");

        await inngest.send({
            name: "video/generate",
            data: {
                seriesId,
                videoId,
                triggerPublish: true,
                platforms: series.platforms || [],
                userEmail,
                userName,
            },
        });

        return { success: true, data: { videoId } };
    } catch (err: any) {
        console.error("Execute workflow caught error:", err);
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// getDashboardStats — single round-trip fetch of all stat counts for the
// real-time dashboard overview cards.
// ─────────────────────────────────────────────────────────────────────────────
export async function getDashboardStats() {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, data: null };

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch ALL series for the authenticated user only
        const { data: seriesRows, error: seriesError } = await supabase
            .from("video_series")
            .select("id, status")
            .eq("user_id", userId);

        if (seriesError) {
            console.error("getDashboardStats series error:", seriesError);
            return { success: false, data: null };
        }

        const sr = seriesRows ?? [];
        const seriesIds = sr.map((s: any) => s.id);
        const totalSeries = sr.length;
        const activeSeries = sr.filter((s: any) => s.status === "Active").length;
        const pausedSeries = sr.filter((s: any) => s.status === "Paused").length;

        // Fetch all videos for those series
        let totalVideos = 0;
        let generatingVideos = 0;
        let publishedVideos = 0;
        let failedVideos = 0;

        if (seriesIds.length > 0) {
            const { data: videoRows } = await supabase
                .from("video_assets")
                .select("id, status")
                .in("series_id", seriesIds);

            const vr = videoRows ?? [];
            totalVideos = vr.length;
            generatingVideos = vr.filter((v: any) => v.status === "GENERATING").length;
            publishedVideos = vr.filter((v: any) => v.status === "DONE").length;
            failedVideos = vr.filter((v: any) => v.status === "FAILED").length;
        }

        return {
            success: true,
            data: {
                totalSeries,
                activeSeries,
                pausedSeries,
                totalVideos,
                generatingVideos,
                publishedVideos,
                failedVideos,
            },
        };
    } catch (err: any) {
        console.error("getDashboardStats error:", err);
        return { success: false, data: null };
    }
}
