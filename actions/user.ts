"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function syncUser() {
    const user = await currentUser();
    if (!user) {
        return { error: "No user found" };
    }

    // Use the Service Role Key to bypass RLS policies
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert user into Supabase
    const { data, error } = await supabase
        .from("users")
        .upsert(
            {
                clerk_id: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                name: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "User",
                image_url: user.imageUrl,
                created_at: new Date().toISOString(),
            },
            { onConflict: "clerk_id" }
        )
        .select()
        .single();

    if (error) {
        console.error("Supabase user sync error:", error);
        return { error: error.message };
    }

    return { success: true, user: data };
}

export async function getSupabaseUserId() {
    const user = await currentUser();
    if (!user) return null;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

    return data?.id || null;
}
