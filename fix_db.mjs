import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Can't easily execute raw DDL queries through Supabase JS v2 without RPC or pgsodium,
// but we can query the REST API directly to create the column using SQL if needed.
// However, the easiest way is to use the exact Supabase API endpoint that manages tables if they have migrations enabled.
// Or we can just interactively request the user to add it via the Supabase Dashboard.

console.log("Checking if we can verify the column exists first...");

async function verifyTable() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
        .from("video_assets")
        .select("final_video_url")
        .limit(1);

    if (error) {
        console.error("Column completely missing error:", error.message);
    } else {
        console.log("Column seems to exist? Data:", data);

        // Reset stuck loading states
        console.log("Resetting stuck generating states to ERROR...");
        await supabase
            .from("video_assets")
            .update({ status: "ERROR" })
            .in("status", ["GENERATING", "GENERATING_VIDEO"]);

        console.log("Reset complete.");
    }
}

verifyTable();
