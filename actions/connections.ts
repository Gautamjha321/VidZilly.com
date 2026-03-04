"use server";

import { createClient } from "@supabase/supabase-js";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Helper to get the current Supabase user_id from Clerk
 */
async function getSupabaseUserId() {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) return null;

    const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUser.id)
        .single();

    return user?.id || null;
}

/**
 * Fetch all platform connections for the current user
 */
export async function getPlatformConnections() {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "User not found" };

        const { data, error } = await supabase
            .from("platform_connections")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching connections:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (err: any) {
        console.error("getPlatformConnections error:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Save or update a platform connection (used by UI for simulating OAuth)
 */
export async function savePlatformConnection(platform: string, channelName: string) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "User not found" };

        const { error } = await supabase
            .from("platform_connections")
            .upsert({
                user_id: userId,
                platform,
                channel_name: channelName,
                // Placeholders for real OAuth tokens later
                access_token: "mock_access_token_" + Date.now(),
                channel_id: "mock_channel_" + Date.now(),
                connected_at: new Date().toISOString()
            }, { onConflict: "user_id,platform" });

        if (error) {
            console.error("Error saving connection:", error.message);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/setting");
        return { success: true };
    } catch (err: any) {
        console.error("savePlatformConnection error:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Delete a specific platform connection
 */
export async function deletePlatformConnection(platform: string) {
    try {
        const userId = await getSupabaseUserId();
        if (!userId) return { success: false, error: "User not found" };

        const { error } = await supabase
            .from("platform_connections")
            .delete()
            .match({ user_id: userId, platform });

        if (error) {
            console.error("Error deleting connection:", error.message);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/setting");
        return { success: true };
    } catch (err: any) {
        console.error("deletePlatformConnection error:", err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Danger Zone: Delete the entire user account and all cascade data
 * (Requires Clerk account deletion separately or via webhook, but this clears DB data)
 */
export async function deleteUserAccount() {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser?.id) return { success: false, error: "Not logged in" };

        const userId = await getSupabaseUserId();

        if (userId) {
            // Only attempt full cascade if we actually find a matching user row in Supabase

            // 1. Find all their series IDs
            const { data: userSeries } = await supabase
                .from("video_series")
                .select("id")
                .eq("user_id", userId);

            if (userSeries && userSeries.length > 0) {
                const seriesIds = userSeries.map((s) => s.id);

                // 2. Delete all video assets belonging to those series
                const { error: videosError } = await supabase
                    .from("video_assets")
                    .delete()
                    .in("series_id", seriesIds);

                if (videosError) {
                    console.error("Error wiping video assets:", videosError);
                }
            }

            // 3. Delete all series owned by the user
            const { error: seriesError } = await supabase
                .from("video_series")
                .delete()
                .eq("user_id", userId);

            if (seriesError) {
                console.error("Error wiping video series:", seriesError);
            }

            // 4. Delete all platform connections
            const { error: connectionsError } = await supabase
                .from("platform_connections")
                .delete()
                .eq("user_id", userId);

            if (connectionsError) {
                console.error("Error wiping platform connections:", connectionsError);
            }

            // 5. Delete the main user row (and their subscription plan data)
            const { error: userError } = await supabase
                .from("users")
                .delete()
                .eq("id", userId);

            if (userError) {
                console.error("Error wiping core user data:", userError);
                return { success: false, error: "Failed to erase database records: " + userError.message };
            }
        }

        // 6. Completely rip out the user from Clerk Authentication 
        // We do this whether or not they had a Supabase profile to ensure they are fully kicked out.
        try {
            const client = await clerkClient();
            await client.users.deleteUser(clerkUser.id);
        } catch (clerkError: any) {
            console.error("Error deleting Clerk Auth User:", clerkError.message);
            return { success: false, error: "Database deleted but failed to destroy Auth provider record." };
        }

        return { success: true };
    } catch (err: any) {
        console.error("deleteUserAccount error:", err.message);
        return { success: false, error: err.message };
    }
}
