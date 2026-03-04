import SettingsClient from "./_components/SettingsClient";
import { getPlatformConnections } from "@/actions/connections";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export default async function SettingsPage() {
    const clerkUser = await currentUser();

    // Fetch user profile info directly
    let userProfile = null;
    if (clerkUser?.id) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data } = await supabase
            .from("users")
            .select("email, name")
            .eq("clerk_id", clerkUser.id)
            .single();
        userProfile = data;
    }

    // Fetch existing platform connections
    const { data: connections = [] } = await getPlatformConnections();

    return (
        <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Settings</h2>

            <SettingsClient
                initialConnections={connections || []}
                userEmail={userProfile?.email || clerkUser?.primaryEmailAddress?.emailAddress || ""}
            />
        </div>
    );
}
