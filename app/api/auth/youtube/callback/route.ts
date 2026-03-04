import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            console.error("YouTube OAuth Error:", error);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=youtube_auth_failed`);
        }

        if (!code) {
            return NextResponse.json({ error: "No authorization code provided" }, { status: 400 });
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: "Google Client ID and Secret not configured" }, { status: 500 });
        }

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            `${baseUrl}/api/auth/youtube/callback`
        );

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch YouTube Channel Info
        const youtube = google.youtube({ version: "v3", auth: oauth2Client });
        const channelRes = await youtube.channels.list({
            part: ["snippet"],
            mine: true
        });

        const channel = channelRes.data.items?.[0];
        if (!channel) {
            console.error("No YouTube channel found for the authenticated user.");
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=no_youtube_channel`);
        }

        const channelId = channel.id;
        const channelName = channel.snippet?.title || "YouTube Channel";

        // Get the current user from Clerk
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            console.error("User not authenticated with Clerk during YouTube callback.");
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=not_authenticated`);
        }

        // Initialize Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get internal Supabase user_id
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", clerkId)
            .single();

        if (!user || !user.id) {
            console.error("User not found in database.");
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=user_not_found`);
        }

        // Save connection to platform_connections
        const { error: dbError } = await supabase
            .from("platform_connections")
            .upsert({
                user_id: user.id,
                platform: "youtube",
                channel_name: channelName,
                channel_id: channelId,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token, // Critical for long-term access
                connected_at: new Date().toISOString()
            }, { onConflict: "user_id,platform" });

        if (dbError) {
            console.error("Database error saving YouTube connection:", JSON.stringify(dbError, null, 2));
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=${encodeURIComponent(dbError.message || 'db_error')}`);
        }

        // Successfully connected
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?success=youtube_connected`);
    } catch (err: any) {
        console.error("YouTube OAuth Callback Error:", err.message);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=${encodeURIComponent(err.message || 'server_error')}`);
    }
}
