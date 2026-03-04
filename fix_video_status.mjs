import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
    console.log("=== BUCKET FILES ===");
    const { data: files } = await supabase.storage
        .from("vidmaxx-assets")
        .list("final_videos", { limit: 100 });
    files?.forEach(f => console.log("FILE:", f.name));

    console.log("\n=== VIDEO ASSETS ===");
    const { data: videos, error } = await supabase
        .from("video_assets")
        .select("id, series_id, status, final_video_url, created_at")
        .order("created_at", { ascending: false });
    if (error) console.error(error.message);
    videos?.forEach(v => console.log(`ID:${v.id} | series_id:${v.series_id} | status:${v.status} | url:${v.final_video_url?.substring(0, 60)}`));

    return { files, videos };
}

async function fixAll() {
    const { files, videos } = await diagnose();

    if (!files || !videos) return;

    console.log("\n=== FIXING ===");

    for (const video of videos) {
        if (video.status === "COMPLETED" && video.final_video_url) {
            console.log(`✓ Already COMPLETED: ${video.id}`);
            continue;
        }

        // Try matching by series_id prefix
        let matchingFile = files.find(f => f.name.startsWith(video.series_id || ""));

        // If no match found, try to match by creation time proximity (file name contains timestamp)
        if (!matchingFile && files.length > 0) {
            const videoTime = new Date(video.created_at).getTime();
            // Find the file whose embedded timestamp is closest to the video creation time
            matchingFile = files
                .map(f => {
                    const match = f.name.match(/_(\d+)\.mp4$/);
                    return { file: f, timestamp: match ? parseInt(match[1]) : 0 };
                })
                .filter(({ timestamp }) => timestamp > 0)
                .sort((a, b) => Math.abs(a.timestamp - videoTime) - Math.abs(b.timestamp - videoTime))[0]?.file;
        }

        if (matchingFile) {
            const finalUrl = supabase.storage
                .from("vidmaxx-assets")
                .getPublicUrl(`final_videos/${matchingFile.name}`).data.publicUrl;

            console.log(`Updating ${video.id} -> ${matchingFile.name}`);

            const { error: updateError } = await supabase
                .from("video_assets")
                .update({ status: "COMPLETED", final_video_url: finalUrl })
                .eq("id", video.id);

            if (updateError) {
                console.error("Update failed:", updateError.message);
            } else {
                console.log("✓ Done!");
            }
        } else {
            console.log(`No file match for ${video.id} - marking ERROR`);
            await supabase.from("video_assets").update({ status: "ERROR" }).eq("id", video.id);
        }
    }

    console.log("\nAll done! Refresh your dashboard.");
}

fixAll().catch(console.error);
