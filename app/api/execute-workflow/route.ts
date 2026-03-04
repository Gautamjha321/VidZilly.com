import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { inngest } from "@/inngest/client";

export async function POST(req: NextRequest) {
    try {
        const { seriesId } = await req.json();

        if (!seriesId) {
            return NextResponse.json({ success: false, error: "seriesId is required" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Fetch series
        const { data: series, error: seriesError } = await supabase
            .from("video_series")
            .select("*")
            .eq("id", seriesId)
            .single();

        if (seriesError || !series) {
            console.error("Series fetch failed:", seriesError?.message);
            return NextResponse.json({ success: false, error: "Series not found" }, { status: 404 });
        }

        // 2. Get user email
        let userEmail: string | null = null;
        let userName = "there";

        if (series.user_id) {
            const { data: userData } = await supabase
                .from("users")
                .select("email, name")
                .eq("id", series.user_id)
                .single();
            userEmail = userData?.email ?? null;
            userName = userData?.name ?? "there";
        }

        if (!userEmail) {
            const { data: fallback } = await supabase
                .from("users")
                .select("email, name")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
            userEmail = fallback?.email ?? null;
            userName = fallback?.name ?? "there";
        }

        // 2.5 Check limit for free users
        let userPlan = null;
        if (series.user_id) {
            const { data: planData } = await supabase
                .from("users")
                .select("plan")
                .eq("id", series.user_id)
                .single();
            userPlan = planData?.plan || null;
        }

        if (!userPlan && series.user_id) {
            const { data: userSeries } = await supabase
                .from("video_series")
                .select("id")
                .eq("user_id", series.user_id);

            if (userSeries && userSeries.length > 0) {
                const seriesIds = userSeries.map((s: any) => s.id);
                const { count } = await supabase
                    .from("video_assets")
                    .select("*", { count: "exact", head: true })
                    .in("series_id", seriesIds);

                if (count !== null && count >= 2) {
                    return NextResponse.json({ success: false, error: "upgrade_required" });
                }
            }
        }

        // 3. Create pending video record
        const { data: videoRecord, error: insertError } = await supabase
            .from("video_assets")
            .insert([{ series_id: seriesId, status: "GENERATING", script: "", scenes: [] }])
            .select("id")
            .single();

        if (insertError || !videoRecord) {
            console.error("Failed to create video record:", insertError?.message);
            return NextResponse.json({ success: false, error: "Failed to initialize video" }, { status: 500 });
        }

        const videoId = videoRecord.id;

        // 4. Fire video/generate with triggerPublish: true
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

        console.log(`✅ Execute workflow started for series: ${series.series_name} | video: ${videoId}`);
        console.log(`   Platforms: ${(series.platforms || []).join(", ")}`);
        console.log(`   User email: ${userEmail}`);

        return NextResponse.json({ success: true, data: { videoId } });
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        console.error("Execute workflow API error:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
