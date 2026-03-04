import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkVideos() {
    console.log("Checking recent video statuses...");
    const { data, error } = await supabase
        .from("video_assets")
        .select("id, status, created_at, final_video_url")
        .order("created_at", { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching videos:", error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

checkVideos().catch(console.error);
