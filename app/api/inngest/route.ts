import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld, generateVideo, scheduleVideoPublish, publishVideoToPlatforms } from "../../../inngest/functions";

// Create an API that serves zero-manage Inngest functions
// Usually at /api/inngest
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        helloWorld,
        generateVideo,
        scheduleVideoPublish,
        publishVideoToPlatforms,
    ],
});
