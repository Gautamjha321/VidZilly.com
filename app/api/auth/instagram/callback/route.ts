import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
            console.error("Instagram OAuth Error:", error, errorDescription);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=instagram_auth_failed`);
        }

        if (!code) {
            return NextResponse.json({ error: "No authorization code provided" }, { status: 400 });
        }

        const clientId = process.env.INSTAGRAM_CLIENT_ID;
        const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: "Instagram Client ID and Secret not configured" }, { status: 500 });
        }

        // 1. Exchange OAuth code for a short-lived access token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("Token Exchange Error:", tokenData.error);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=token_exchange_failed`);
        }

        const shortLivedToken = tokenData.access_token;

        // 2. Exchange short-lived token for a long-lived access token
        const longTokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
        const longTokenRes = await fetch(longTokenUrl);
        const longTokenData = await longTokenRes.json();

        const accessToken = longTokenData.access_token || shortLivedToken;

        // 3. Query User's Facebook Pages to find a linked Instagram Business Account
        const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?fields=access_token,name,instagram_business_account&access_token=${accessToken}`;
        const pagesRes = await fetch(pagesUrl);
        const pagesData = await pagesRes.json();

        if (!pagesData.data || pagesData.data.length === 0) {
            console.error("No Facebook Pages found for user.");
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=no_facebook_pages`);
        }

        // Find the first FB Page that has a linked Instagram Business account
        const pageWithIg = pagesData.data.find((page: any) => page.instagram_business_account);

        if (!pageWithIg) {
            console.error("No linked Instagram Professional account found. Make sure the Instagram account is converted to Professional and linked to a Facebook Page.");
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=no_instagram_linked`);
        }

        // 4. Fetch the Instagram Account's actual username for the UI
        const igAccountId = pageWithIg.instagram_business_account.id;
        const pageAccessToken = pageWithIg.access_token; // Crucial: use Page Access Token for IG API calls

        const igUserUrl = `https://graph.facebook.com/v18.0/${igAccountId}?fields=username&access_token=${pageAccessToken}`;
        const igUserRes = await fetch(igUserUrl);
        const igUserData = await igUserRes.json();

        const channelName = igUserData.username || `${pageWithIg.name} (IG)`;

        // 5. Get the current user from Clerk to link in database
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            console.error("User not authenticated with Clerk during Instagram callback.");
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=not_authenticated`);
        }

        // Initialize Supabase admin client
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

        // 6. Save connection to platform_connections
        const { error: dbError } = await supabase
            .from("platform_connections")
            .upsert({
                user_id: user.id,
                platform: "instagram",
                channel_name: channelName,
                channel_id: igAccountId,
                access_token: pageAccessToken, // Using Page Access Token which has no expiration if generated from long-lived user token
                refresh_token: null, // Facebook Graph API doesn't use refresh tokens this way
                connected_at: new Date().toISOString()
            }, { onConflict: "user_id,platform" });

        if (dbError) {
            console.error("Database error saving Instagram connection:", dbError);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=${encodeURIComponent(dbError.message || 'db_error')}`);
        }

        // Successfully connected! Redirect back to Settings
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?success=instagram_connected`);
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        console.error("Instagram OAuth Callback Error:", err.message);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/setting?error=${encodeURIComponent(err.message || 'server_error')}`);
    }
}
