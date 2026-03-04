import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // This is a stub for real TikTok Login Kit OAuth flow
    // Next steps for production:
    // 1. Register app on TikTok for Developers
    // 2. Get Client Key and Client Secret
    // 3. Set up OAuth redirect URI to here
    // 4. Generate Auth URL and redirect user

    const html = `
        <html>
            <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f9fafb;">
                <h1 style="color: #000000;">TikTok OAuth Integration Setup Needed</h1>
                <p>To enable real TikTok connection, you must configure TikTok Developer credentials.</p>
                <a href="/dashboard/setting" style="margin-top: 20px; padding: 10px 20px; background: #9333ea; color: white; text-decoration: none; border-radius: 8px;">Back to Settings</a>
            </body>
        </html>
    `;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
