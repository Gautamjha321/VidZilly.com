import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!clientId) {
        return new NextResponse("INSTAGRAM_CLIENT_ID not configured in environment variables.", { status: 500 });
    }

    const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

    // Scopes required for Instagram Graph API publishing
    const scopes = [
        "instagram_basic",
        "instagram_content_publish",
        "pages_show_list",
        "pages_read_engagement"
    ].join(",");

    // Meta (Facebook) OAuth Dialog URL
    const authorizationUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`;

    return NextResponse.redirect(authorizationUrl);
}
