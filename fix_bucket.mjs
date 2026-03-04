import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixBucket() {
    console.log("Updating vidmaxx-assets bucket to public...");
    const { data, error } = await supabase.storage.updateBucket('vidmaxx-assets', {
        public: true,
        allowedMimeTypes: null,
        fileSizeLimit: null
    });

    if (error) {
        console.error("Failed to update bucket:", error);
    } else {
        console.log("Bucket updated successfully:", data);
    }
}

fixBucket().catch(console.error);
