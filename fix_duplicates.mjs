import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDuplicates() {
    // Get all video assets
    const { data: videos } = await supabase
        .from("video_assets")
        .select("id, status, final_video_url, created_at")
        .order("created_at", { ascending: false });

    console.log("All video records:");
    videos?.forEach(v => console.log(`  ${v.id} | ${v.status} | ${v.final_video_url?.substring(0, 80)}`));

    // Get all actual files in bucket
    const { data: files } = await supabase.storage
        .from("vidmaxx-assets")
        .list("final_videos", { limit: 100 });

    console.log("\nBucket files:", files?.map(f => f.name));

    // Find duplicate URLs: group by final_video_url
    const urlCounts = {};
    for (const v of videos || []) {
        if (v.final_video_url) {
            if (!urlCounts[v.final_video_url]) urlCounts[v.final_video_url] = [];
            urlCounts[v.final_video_url].push(v);
        }
    }

    for (const [url, records] of Object.entries(urlCounts)) {
        if (records.length > 1) {
            console.log(`\nDuplicate URL found across ${records.length} records: ${url.substring(0, 60)}`);
            // Keep the oldest (first generated) one as COMPLETED, reset the rest to ERROR
            const sorted = records.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const keep = sorted[0];
            const reset = sorted.slice(1);

            console.log(`  ✓ Keeping: ${keep.id}`);
            for (const r of reset) {
                console.log(`  ✗ Resetting to ERROR: ${r.id}`);
                await supabase
                    .from("video_assets")
                    .update({ status: "ERROR", final_video_url: null })
                    .eq("id", r.id);
            }
        }
    }

    console.log("\nDone! The second video is now marked ERROR since its MP4 was never saved.");
    console.log("Please generate it again from the dashboard.");
}

fixDuplicates().catch(console.error);


