/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { inngest } from "./client";
import { getSeriesById } from "../actions/series";
import { getGeminiModel } from "../lib/gemini";
import { AssemblyAI } from "assemblyai";
import Replicate from "replicate";
import { renderMediaOnLambda, getRenderProgress, presignUrl } from "@remotion/lambda/client";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase for Storage
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper for Deepgram TTS using raw fetch to avoid NextJS Edge/Node fetch conflicts
async function generateDeepgramTTS(text: string, voiceName?: string): Promise<Buffer> {
    if (!process.env.DEEPGRAM_API_KEY) {
        throw new Error("DEEPGRAM_API_KEY is missing");
    }



    // Deepgram requires specific conversational voices e.g. "aura-asteria-en"
    let voice = voiceName || "aura-asteria-en";
    if (!voice.startsWith("aura-")) {
        console.warn(`Deepgram does not support custom voice '${voice}'. Defaulting to 'aura-asteria-en'`);
        voice = "aura-asteria-en";
    }

    const url = `https://api.deepgram.com/v1/speak?model=${voice}&encoding=mp3`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deepgram API failed (${response.status}): ${errorText}`);
    }

    // Convert the response to an ArrayBuffer, then to a Buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { event, body: "Hello, World!" };
    }
);

export const generateVideo = inngest.createFunction(
    {
        id: "generate-video",
        retries: 2,
        concurrency: 1,
        onFailure: async ({ event, error }) => {
            const { videoId } = event.data.event.data;
            if (videoId) {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );
                await supabase
                    .from("video_assets")
                    .update({ status: "ERROR" })
                    .eq("id", videoId);
                console.error(`Set video ${videoId} status to ERROR. Reason: ${error.message}`);
            }
        }
    },
    { event: "video/generate" },
    async ({ event, step }) => {
        const { seriesId, videoId, triggerPublish, platforms, userEmail: eventUserEmail, userName: eventUserName } = event.data;

        // Step 1: Fetch Series Data from Supabase
        const series = await step.run("fetch-series-data", async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { data, error } = await supabase
                .from("video_series")
                .select("*")
                .eq("id", seriesId)
                .single();

            if (error || !data) {
                throw new Error(`Failed to fetch series data or series not found. Details: ${error?.message || "No data returned"}`);
            }
            return data;
        });

        // Step 2: Generate Video Script using AI
        const script = await step.run("generate-video-script", async () => {
            const prompt = `
You are an expert video creator and scriptwriter. 
Generate a comprehensive video script and image prompts for a ${series.duration} video.

Series Information:
- Niche: ${series.custom_niche || series.niche}
- Topic/Name: ${series.series_name}
- Video Style: ${series.video_style}
- Target Duration: ${series.duration}

Requirements:
1. The video script must be natural and engaging, suitable for a human-like voiceover.
2. Provide a catchy Title for the video.
3. Depending on the duration, generate specific scenes:
   - If duration is around "30-40 secs", generate 4-5 scenes.
   - If duration is around "60-70 secs", generate 5-6 scenes.
4. For each scene, provide:
   - 'imagePrompt': A highly detailed, descriptive prompt suitable for an AI image generator to create a visual that perfectly matches the voiceover. Make sure the visual style formally aligns with the "${series.video_style}" style visually.
   - 'duration': Approximate duration of this scene in seconds (e.g. 5, 10).
   - 'text': The exact voiceover text to be spoken during this scene.

IMPORTANT: You MUST return ONLY a valid JSON object. Do not wrap it in markdown code blocks like \`\`\`json. Do not include any extra conversational text.
The JSON must strictly follow this exact schema:
{
  "title": "String (Video Title)",
  "script": "String (The complete combined voiceover text)",
  "scenes": [
    {
      "imagePrompt": "String (Detailed AI Image generation prompt)",
      "duration": "Number (Approximate duration in seconds)",
      "text": "String (Voiceover text for this specific scene)"
    }
  ]
}
`;

            const geminiModel = getGeminiModel();
            const result = await geminiModel.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            const responseText = result.response.text();

            console.log("=== GEMINI RAW RESPONSE ===");
            console.log(responseText);
            console.log("===========================");

            try {
                // Safely parse JSON even if Gemini hallucinated markdown code blocks
                // Extract everything between the first { and the last }
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error("No JSON object found in response");
                }
                const jsonResponse = JSON.parse(jsonMatch[0]);
                return jsonResponse;
            } catch (error) {
                console.error("Failed to parse Gemini JSON output. Raw Text:", responseText);
                console.error("Parse Error Details:", error);
                throw new Error("Failed to generate a valid JSON script from AI");
            }
        });

        // Step 3: Generate Voice using TTS model
        const audioUrl = await step.run("generate-voice-tts", async () => {
            const fullScript = script.script;

            // Determine which provider to use based on Language or Voice preferences
            // For now, let's use FonadaLabs for Hindi/Indian languages, and Deepgram for general English
            const isIndianLanguage = ["Hindi", "Telugu", "Tamil"].includes(series.language);

            let audioBuffer: Buffer;

            if (isIndianLanguage) {
                // FONADALABS INTEGRATION
                if (!process.env.FONADA_API_KEY) {
                    console.warn("FONADA_API_KEY is not defined. Using Deepgram as fallback.");
                    return await generateDeepgramTTS(fullScript);
                }

                const fonadaEndpoint = "https://api.fonada.ai/tts/generate-audio-large";

                // Truncate if over Fonada's 450 char limit for a single request (basic handling for now)
                const safeScript = fullScript.length > 450 ? fullScript.substring(0, 450) : fullScript;

                const fonadaPayload = {
                    input: safeScript,
                    voice: series.voice || "Naad", // Default Fonada voice
                    language: series.language || "Hindi"
                };

                const response = await fetch(fonadaEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.FONADA_API_KEY}`
                    },
                    body: JSON.stringify(fonadaPayload)
                });

                if (!response.ok) {
                    throw new Error(`FonadaLabs TTS Error: ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                audioBuffer = Buffer.from(arrayBuffer);

            } else {
                // DEEPGRAM INTEGRATION
                audioBuffer = await generateDeepgramTTS(fullScript, series.voice);
            }

            // Ensure Bucket Exists
            const { error: bucketError } = await supabase.storage.createBucket("vidmaxx-assets", {
                public: true,
            });

            // Log warning if bucket creation failed for a reason other than "it already exists"
            if (bucketError && !bucketError.message.includes("already exists") && !bucketError.message.includes("duplicate")) {
                console.warn("Supabase Bucket creation warning:", bucketError);
            }

            console.log(`Audio buffer generated. Size: ${Math.round(audioBuffer.byteLength / 1024)} KB`);
            if (audioBuffer.byteLength < 100) {
                console.warn("WARNING: Generated audio buffer is suspiciously small! API might have returned an error wrapper instead of binary.");
                console.log("Raw response snippet:", audioBuffer.toString('utf8').substring(0, 200));
            }

            // Upload to Supabase Storage
            const fileName = `voiceovers/${seriesId}_${Date.now()}.mp3`;
            const { error: uploadError } = await supabase.storage
                .from("vidmaxx-assets") // Assumes a bucket named vidmaxx-assets exists
                .upload(fileName, audioBuffer, {
                    contentType: "audio/mpeg",
                    upsert: true,
                });

            if (uploadError) {
                console.error("Supabase Upload Error:", JSON.stringify(uploadError, null, 2));
                throw new Error(`Failed to upload TTS audio to storage: ${uploadError.message || JSON.stringify(uploadError)}`);
            }

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from("vidmaxx-assets")
                .getPublicUrl(fileName);

            return publicUrlData.publicUrl;
        });
        // Step 4: Generate Captions using Deepgram
        const captions = await step.run("generate-captions", async () => {
            if (!process.env.DEEPGRAM_API_KEY) {
                console.warn("DEEPGRAM_API_KEY is not defined. Skipping captions.");
                return [];
            }

            const url = "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: audioUrl })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Deepgram Transcription Error:", errorText);
                throw new Error("Failed to generate captions via Deepgram");
            }

            const data = await response.json();
            // Deepgram returns word-level timestamps in this path:
            const words = data?.results?.channels?.[0]?.alternatives?.[0]?.words || [];

            return words;
        });

        // Step 5: Generate Images using AI Horde (Free API)
        const images = await step.run("generate-images", async () => {
            const apiKey = process.env.AI_HORDE_API_KEY || "0000000000"; // Use user key, fallback to anonymous

            // Process all scenes in parallel to drastically speed up generation
            const imagePromises = script.scenes.map(async (scene: any, index: number) => {
                try {
                    // Stagger AI Horde requests by 2 seconds each to avoid hitting their concurrency/rate limits
                    if (index > 0) {
                        await new Promise(resolve => setTimeout(resolve, index * 2000));
                    }

                    // Step 1: Request Image Generation (Async)
                    const generateUrl = "https://stablehorde.net/api/v2/generate/async";
                    const generateResponse = await fetch(generateUrl, {
                        method: "POST",
                        headers: {
                            "apikey": apiKey,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            prompt: scene.imagePrompt,
                            censor_nsfw: false,
                            params: {
                                width: 512,
                                height: 512,
                                steps: 20
                            }
                        }),
                    });

                    if (!generateResponse.ok) {
                        const errorText = await generateResponse.text();
                        console.error(`AI Horde API Error (Scene ${index}):`, generateResponse.status, errorText);
                        throw new Error(`AI Horde API failed: ${generateResponse.status}`);
                    }

                    const { id } = await generateResponse.json();

                    // Step 2: Poll for completion
                    const checkUrl = `https://stablehorde.net/api/v2/generate/status/${id}`;
                    let isFinished = false;
                    let imageUrl = "";

                    // Poll every 5 seconds for up to ~3 minutes (36 attempts)
                    for (let i = 0; i < 36; i++) {
                        await new Promise(resolve => setTimeout(resolve, 5000));

                        const statusResponse = await fetch(checkUrl);
                        const statusData = await statusResponse.json();

                        if (statusData.done) {
                            isFinished = true;
                            if (statusData.generations && statusData.generations.length > 0) {
                                const imgData = statusData.generations[0].img;
                                let imageBuffer: Buffer;

                                // AI Horde sometimes returns an R2 download URL, sometimes base64
                                if (imgData.startsWith("http")) {
                                    console.log(`Downloading image from AI Horde URL (Scene ${index})...`);
                                    const imgRes = await fetch(imgData);
                                    const arrayBuf = await imgRes.arrayBuffer();
                                    imageBuffer = Buffer.from(arrayBuf);
                                } else {
                                    // It's raw base64 data
                                    const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
                                    imageBuffer = Buffer.from(base64Data, "base64");
                                }

                                // Upload to Supabase Storage permanently
                                const fileName = `scene_images/${seriesId}_${Date.now()}_${index}_${i}.webp`;
                                const { error: uploadError } = await supabase.storage
                                    .from("vidmaxx-assets")
                                    .upload(fileName, imageBuffer, {
                                        contentType: "image/webp",
                                        upsert: true,
                                    });

                                if (uploadError) {
                                    console.error(`Supabase Image Upload Error (Scene ${index}):`, uploadError);
                                    throw new Error("Failed to upload image to storage");
                                }

                                // Get Public URL
                                const { data: publicUrlData } = supabase.storage
                                    .from("vidmaxx-assets")
                                    .getPublicUrl(fileName);

                                imageUrl = publicUrlData.publicUrl;
                            }
                            break;
                        }

                        if (statusData.faulted) {
                            throw new Error(`Generation faulted on AI Horde (Scene ${index})`);
                        }
                    }

                    if (!isFinished || !imageUrl) {
                        throw new Error(`Image generation timed out or failed to return image (Scene ${index})`);
                    }

                    return imageUrl;

                } catch (error) {
                    console.error(`Failed to generate/upload image for scene ${index}:`, error);
                    return ""; // Return empty to keep scene indices aligned
                }
            });

            // Wait for all scenes to finish generating at the same time
            const generatedImages = await Promise.all(imagePromises);
            return generatedImages;
        });

        // Step 6: Save everything to database prior to final render
        const savedData = await step.run("save-generated-video-data", async () => {
            // Create a fresh client inside the step to avoid Inngest re-hydration issues
            const { createClient: mkClient } = await import("@supabase/supabase-js");
            const db = mkClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Save 6a: core fields (script, audio, status)
            const { error: err1 } = await db
                .from("video_assets")
                .update({
                    script: script.script,
                    scenes: script.scenes,
                    audio_url: audioUrl,
                    status: "GENERATING_VIDEO",
                })
                .eq("id", videoId);

            if (err1) {
                console.error("Step 6a save error:", err1.message, err1.details);
                throw new Error(`Failed to save video data (step 6a): ${err1.message}`);
            }

            // Save 6b: large fields (captions, images) separately
            const { error: err2 } = await db
                .from("video_assets")
                .update({
                    captions: captions ?? [],
                    image_urls: images ?? [],
                })
                .eq("id", videoId);

            if (err2) {
                // Non-fatal: captions/images may be too large; video can still render
                console.warn("Step 6b save warning (captions/images):", err2.message);
            }

            return { success: true };
        });


        // Step 7: Generate Final Video using standard Remotion Lambda setup
        const finalVideoUrl = await step.run("render-video-lambda", async () => {
            const serveUrl = process.env.REMOTION_SERVE_URL || process.env.REMOTION_SITE_ID;
            const functionName = process.env.REMOTION_FUNCTION_NAME;
            const region = (process.env.REMOTION_AWS_REGION || "us-east-1") as any;

            if (!serveUrl || !functionName) {
                console.warn("Remotion SERVE_URL or FUNCTION_NAME is missing. Cannot render video.");
                return null;
            }

            try {
                console.log(`Starting Lambda render on ${functionName} at ${serveUrl}`);

                // Send the render job
                const { renderId, bucketName } = await renderMediaOnLambda({
                    region,
                    functionName,
                    serveUrl,
                    composition: "GeneratedVideo",
                    inputProps: {
                        script: script.script,
                        audioUrl: audioUrl,
                        captions: captions,
                        images: images,
                    },
                    codec: "h264",
                    imageFormat: "jpeg",
                    maxRetries: 1,
                    framesPerLambda: 240, // Render 8 seconds of video per Lambda to drastically reduce concurrent Lambdas
                    concurrencyPerLambda: 1, // Absolutely minimum concurrency to avoid AWS Rate Limits for new accounts
                    privacy: "public",
                    downloadBehavior: {
                        type: "play-in-browser",
                    },
                    envVariables: {
                        REMOTION_AWS_ACCESS_KEY_ID: process.env.REMOTION_AWS_ACCESS_KEY_ID || "",
                        REMOTION_AWS_SECRET_ACCESS_KEY: process.env.REMOTION_AWS_SECRET_ACCESS_KEY || "",
                    }
                });

                console.log(`Render started with ID: ${renderId}`);

                // Block and wait for render to finish
                let renderStatus = "running";
                let finalUrl = "";
                while (renderStatus !== "done" && renderStatus !== "failed") {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    const progress = await getRenderProgress({
                        renderId,
                        bucketName,
                        functionName,
                        region,
                    });

                    if (progress.done && progress.outKey) {
                        renderStatus = "done";
                        console.log("Render completed on AWS. Bypassing S3 Block Public Access by downloading locally using AWS SDK...");

                        const s3 = new S3Client({
                            region,
                            credentials: {
                                accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID!,
                                secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY!
                            }
                        });

                        const command = new GetObjectCommand({
                            Bucket: bucketName,
                            Key: progress.outKey
                        });

                        console.log("Downloading MP4 from AWS S3...");
                        const s3Response = await s3.send(command);

                        // Convert S3 ReadableStream to Buffer
                        const streamToBuffer = async (stream: any): Promise<Buffer> => {
                            return new Promise((resolve, reject) => {
                                const chunks: any[] = [];
                                stream.on("data", (chunk: any) => chunks.push(chunk));
                                stream.on("error", reject);
                                stream.on("end", () => resolve(Buffer.concat(chunks)));
                            });
                        };

                        const videoBuffer = await streamToBuffer(s3Response.Body);

                        // 3. Upload permanently to VidZilly Supabase public CDN!
                        console.log(`Uploading MP4 to Supabase CDN... Size: ${Math.round(videoBuffer.byteLength / 1024 / 1024)} MB`);
                        const fileName = `final_videos/${seriesId}_${Date.now()}.mp4`;

                        // Prevent Inngest hydration / timeout errors by making a fresh client
                        const { createClient } = await import("@supabase/supabase-js");
                        const db = createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL!,
                            process.env.SUPABASE_SERVICE_ROLE_KEY!
                        );

                        // Convert Node.js Buffer to ArrayBuffer to avoid Native Fetch failing on large Buffers in Supabase Storage API
                        // Removed ArrayBuffer slicing as Supabase typings prefer Buffer directly or Blob.
                        // The 'fetch failed' is usually due to stale connections holding over the long Remotion render time,
                        // which is fixed by the new local \`db\` client above.

                        const { error: uploadError } = await db.storage
                            .from("vidmaxx-assets")
                            .upload(fileName, videoBuffer, {
                                contentType: "video/mp4",
                                upsert: true,
                            });

                        if (uploadError) {
                            throw new Error(`Failed to upload final MP4 to Supabase: ${uploadError.message}`);
                        }

                        const { data: publicUrlData } = db.storage
                            .from("vidmaxx-assets")
                            .getPublicUrl(fileName);

                        finalUrl = publicUrlData.publicUrl;
                        console.log("Successfully secured Final Video on Supabase:", finalUrl);
                    } else if (progress.fatalErrorEncountered) {
                        renderStatus = "failed";
                        const errString = JSON.stringify(progress.errors, null, 2);
                        console.error("Render failed details:", errString);
                        throw new Error(`Render encountered a fatal error: ${errString}`);
                    } else {
                        console.log(`Render progress: ${Math.round(progress.overallProgress * 100)}%`);
                    }
                }

                return finalUrl;

            } catch (error: any) {
                console.error("Remotion Lambda Rendering Error Full Detail:", error);
                if (error.response) {
                    console.error("Response data:", error.response.data);
                }
                throw new Error(`Failed to render video on Remotion Lambda: ${error.message || JSON.stringify(error)}`);
            }
        });

        // Step 8: Update database with final MP4 URL
        if (finalVideoUrl) {
            await step.run("save-final-video-url", async () => {
                const { error: finalDbError } = await supabase
                    .from("video_assets")
                    .update({
                        final_video_url: finalVideoUrl,
                        status: "COMPLETED",
                    })
                    .eq("id", videoId);

                if (finalDbError) {
                    console.error("Supabase Final URL Update Error:", JSON.stringify(finalDbError, null, 2));
                }
            });

            // Step 9: Send email notification via Gmail SMTP (Nodemailer)
            await step.run("send-email-notification", async () => {
                const gmailUser = process.env.GMAIL_USER;
                const gmailPass = process.env.GMAIL_APP_PASSWORD;
                if (!gmailUser || gmailUser === "your_gmail@gmail.com" || !gmailPass || gmailPass === "your_gmail_app_password_here") {
                    console.warn("GMAIL_USER / GMAIL_APP_PASSWORD not set. Skipping email notification.");
                    return;
                }

                // Fetch the user's email from Supabase users table
                let userEmail: string | null = null;
                let userName: string = "there";

                if (series.user_id) {
                    // Primary path: look up user directly by user_id
                    const { data: userData, error: userError } = await supabase
                        .from("users")
                        .select("email, name")
                        .eq("id", series.user_id)
                        .single();

                    if (userError || !userData?.email) {
                        console.warn("Could not fetch user by user_id:", userError?.message);
                    } else {
                        userEmail = userData.email;
                        userName = userData.name || "there";
                    }
                }

                // Fallback: if user_id is null (old series), get the most recently created user
                if (!userEmail) {
                    console.warn("series.user_id is null. Attempting fallback user lookup...");
                    const { data: fallbackUser, error: fallbackError } = await supabase
                        .from("users")
                        .select("email, name")
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .single();

                    if (fallbackError || !fallbackUser?.email) {
                        console.warn("Fallback user lookup failed:", fallbackError?.message);
                        console.warn("No user email found. Skipping email notification.");
                        return;
                    }

                    console.log("Using fallback user email:", fallbackUser.email);
                    userEmail = fallbackUser.email;
                    userName = fallbackUser.name || "there";
                }


                // Pick the first generated image as a thumbnail (if available)
                const thumbnailUrl = images?.[0] || "";
                const videoTitle = script?.title || series.series_name || "Your Video";
                const seriesName = series.series_name || "Your Series";
                const niche = series.custom_niche || series.niche || "General";
                const videoStyle = series.video_style || "Default";
                const duration = series.duration || "—";

                // Build rich HTML email body
                const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your video is ready!</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.5);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6c63ff,#3b82f6);padding:40px 40px 30px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">🎬 VidZilly</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Your video is ready to view!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;font-size:17px;color:#e5e5e5;">Hi <strong>${userName}</strong> 👋</p>
              <p style="margin:0 0 28px;font-size:15px;color:#a0a0b0;line-height:1.6;">
                Great news! Your video <strong style="color:#fff;">"${videoTitle}"</strong> has been generated and is ready to watch.
              </p>

              ${thumbnailUrl ? `
              <!-- Thumbnail -->
              <div style="border-radius:12px;overflow:hidden;margin-bottom:28px;border:1px solid rgba(255,255,255,0.1);">
                <img src="${thumbnailUrl}" alt="Video Thumbnail" width="520" style="display:block;width:100%;height:auto;object-fit:cover;" />
              </div>` : ""}

              <!-- Video Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#12122a;border-radius:10px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#7c7c9c;font-size:13px;width:120px;">Series</td>
                        <td style="color:#e5e5e5;font-size:13px;font-weight:600;">${seriesName}</td>
                      </tr>
                      <tr>
                        <td style="color:#7c7c9c;font-size:13px;padding-top:8px;">Niche</td>
                        <td style="color:#e5e5e5;font-size:13px;font-weight:600;padding-top:8px;">${niche}</td>
                      </tr>
                      <tr>
                        <td style="color:#7c7c9c;font-size:13px;padding-top:8px;">Style</td>
                        <td style="color:#e5e5e5;font-size:13px;font-weight:600;padding-top:8px;">${videoStyle}</td>
                      </tr>
                      <tr>
                        <td style="color:#7c7c9c;font-size:13px;padding-top:8px;">Duration</td>
                        <td style="color:#e5e5e5;font-size:13px;font-weight:600;padding-top:8px;">${duration}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${finalVideoUrl}" target="_blank"
                       style="display:inline-block;background:linear-gradient(135deg,#6c63ff,#3b82f6);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                      ▶&nbsp; View Video
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${finalVideoUrl}" download target="_blank"
                       style="display:inline-block;background:rgba(255,255,255,0.08);color:#c9c9f0;text-decoration:none;font-size:14px;font-weight:600;padding:12px 36px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);">
                      ⬇&nbsp; Download Video
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 30px;text-align:center;border-top:1px solid rgba(255,255,255,0.07);">
              <p style="margin:0;font-size:12px;color:#555570;">
                You're receiving this because you generated a video with VidZilly.<br/>
                © ${new Date().getFullYear()} VidZilly. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

                try {
                    const nodemailer = await import("nodemailer");
                    const transporter = nodemailer.default.createTransport({
                        service: "gmail",
                        auth: {
                            user: gmailUser,
                            pass: gmailPass, // Gmail App Password (not regular password)
                        },
                    });

                    await transporter.sendMail({
                        from: `"VidZilly" <${gmailUser}>`,
                        to: userEmail as string,
                        subject: `🎬 Your video "${videoTitle}" is ready!`,
                        html: emailBody,
                    });

                    console.log(`✅ Notification email sent to ${userEmail} via Gmail SMTP`);
                } catch (emailError: any) {
                    // Non-fatal: log but don't throw — video is already saved
                    console.error("Failed to send Gmail notification email:", emailError.message);
                }
            });
        }

        // If triggerPublish is set (from Execute Workflow or scheduled cron),
        // fire video/publish event so platforms receive the video
        if (triggerPublish && finalVideoUrl) {
            await step.run("fire-publish-event", async () => {
                // Get user info if not passed via event
                let publishEmail = eventUserEmail || null;
                let publishName = eventUserName || "there";

                if (!publishEmail && series.user_id) {
                    const { data: userData } = await supabase
                        .from("users")
                        .select("email, name")
                        .eq("id", series.user_id)
                        .single();
                    publishEmail = userData?.email || null;
                    publishName = userData?.name || "there";
                }

                if (!publishEmail) {
                    const { data: fallback } = await supabase
                        .from("users")
                        .select("email, name")
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .single();
                    publishEmail = fallback?.email || null;
                    publishName = fallback?.name || "there";
                }

                await inngest.send({
                    name: "video/publish",
                    data: {
                        seriesId,
                        videoId,
                        finalVideoUrl,
                        platforms: platforms || series.platforms || [],
                        userEmail: publishEmail,
                        userName: publishName,
                        videoTitle: script?.title || series.series_name || "Your Video",
                        thumbnailUrl: images?.[0] || "",
                    },
                });
                console.log("🚀 video/publish event fired for platforms:", platforms || series.platforms);
            });
        }

        return { success: true, series, script, audioUrl, captions, images, savedData, finalVideoUrl };
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULED PUBLISHER — Runs every hour, fires video generation for series
// whose publish_time is ~2 hours away.
// ─────────────────────────────────────────────────────────────────────────────
export const scheduleVideoPublish = inngest.createFunction(
    { id: "schedule-video-publish" },
    { cron: "0 * * * *" }, // Every hour at :00
    async ({ step }) => {
        const results = await step.run("check-series-publish-times", async () => {
            const supabaseLocal = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Fetch all Active series with a publish_time set
            const { data: activeSeries, error } = await supabaseLocal
                .from("video_series")
                .select("id, series_name, publish_time, user_id")
                .eq("status", "Active")
                .not("publish_time", "is", null);

            if (error || !activeSeries) {
                console.error("Failed to fetch active series:", error?.message);
                return { triggered: [] };
            }

            const now = new Date();
            const nowUTC = now.getUTCHours() * 60 + now.getUTCMinutes(); // minutes since midnight UTC
            const triggered: string[] = [];

            for (const series of activeSeries) {
                // parse "HH:MM" publish_time
                const [hh, mm] = (series.publish_time as string).split(":").map(Number);
                const publishMinutes = hh * 60 + mm;

                // Target: 2 hours before publish_time
                const generationTarget = (publishMinutes - 120 + 1440) % 1440;

                // Match if within ±30-minute window
                const diff = Math.abs(nowUTC - generationTarget);
                const isMatch = diff <= 30 || diff >= (1440 - 30);

                if (isMatch) {
                    console.log(`⏰ Triggering video generation for series "${series.series_name}" (publish at ${series.publish_time})`);

                    // Create pending video record
                    const { data: videoRecord, error: insertError } = await supabaseLocal
                        .from("video_assets")
                        .insert([{ series_id: series.id, status: "GENERATING", script: "", scenes: [] }])
                        .select("id")
                        .single();

                    if (insertError || !videoRecord) {
                        console.error(`Failed to create video record for series ${series.id}:`, insertError?.message);
                        continue;
                    }

                    triggered.push(series.id);

                    // Fire existing video/generate event
                    await inngest.send({
                        name: "video/generate",
                        data: { seriesId: series.id, videoId: videoRecord.id, triggerPublish: true },
                    });
                }
            }

            return { triggered, checkedAt: now.toISOString() };
        });

        console.log(`Schedule check complete. Triggered ${results.triggered.length} series.`);
        return results;
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISH VIDEO TO PLATFORMS — Triggered after video generation completes.
// Dispatches to each platform selected in the series.
// ─────────────────────────────────────────────────────────────────────────────
export const publishVideoToPlatforms = inngest.createFunction(
    { id: "publish-video-to-platforms", retries: 1 },
    { event: "video/publish" },
    async ({ event, step }) => {
        const { seriesId, videoId, finalVideoUrl, platforms, userEmail, userName, videoTitle, thumbnailUrl } = event.data;

        console.log(`📢 Publishing video "${videoTitle}" to platforms: ${platforms?.join(", ")}`);

        // Process each platform
        for (const platform of (platforms || [])) {
            await step.run(`publish-to-${platform}`, async () => {
                switch (platform) {
                    case "email": {
                        // Send email notification via Gmail SMTP
                        const gmailUser = process.env.GMAIL_USER;
                        const gmailPass = process.env.GMAIL_APP_PASSWORD;

                        if (!gmailUser || !gmailPass || gmailUser === "your_gmail@gmail.com") {
                            console.warn("Gmail not configured. Skipping email publish.");
                            return;
                        }

                        if (!userEmail) {
                            console.warn("No user email. Skipping email publish.");
                            return;
                        }

                        const emailBody = buildEmailBody({ userName, videoTitle, thumbnailUrl, finalVideoUrl, seriesId });

                        const nodemailer = await import("nodemailer");
                        const transporter = nodemailer.default.createTransport({
                            service: "gmail",
                            auth: { user: gmailUser, pass: gmailPass },
                        });

                        await transporter.sendMail({
                            from: `"VidZilly" <${gmailUser}>`,
                            to: userEmail,
                            subject: `🎬 Your video "${videoTitle}" is ready!`,
                            html: emailBody,
                        });

                        console.log(`✅ Email published to ${userEmail}`);
                        break;
                    }

                    case "youtube": {
                        const { google } = await import("googleapis");
                        const { createClient } = await import("@supabase/supabase-js");

                        console.log(`📺 YouTube: Attempting to upload "${videoTitle}"`);

                        const db = createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL!,
                            process.env.SUPABASE_SERVICE_ROLE_KEY!
                        );

                        // 1. Get the series user_id
                        const { data: seriesData } = await db
                            .from("video_series")
                            .select("user_id")
                            .eq("id", seriesId)
                            .single();

                        if (!seriesData?.user_id) {
                            console.warn("   ❌ No user_id found for series. Cannot publish to YouTube.");
                            break;
                        }

                        // 2. Get YouTube tokens for this user
                        const { data: connection } = await db
                            .from("platform_connections")
                            .select("access_token, refresh_token")
                            .match({ user_id: seriesData.user_id, platform: "youtube" })
                            .single();

                        if (!connection?.access_token) {
                            console.warn("   ❌ User has no connected YouTube account. Skipping upload.");
                            break;
                        }

                        const clientId = process.env.GOOGLE_CLIENT_ID;
                        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

                        if (!clientId || !clientSecret) {
                            console.warn("   ❌ Google Client ID/Secret missing. Skipping upload.");
                            break;
                        }

                        // 3. Set up Auth
                        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
                        oauth2Client.setCredentials({
                            access_token: connection.access_token,
                            refresh_token: connection.refresh_token,
                        });

                        // 4. Download video buffer
                        console.log(`   Downloading video from ${finalVideoUrl}...`);
                        const response = await fetch(finalVideoUrl);
                        if (!response.ok) {
                            console.warn(`   ❌ Failed to download video: ${response.statusText}`);
                            break;
                        }

                        // Pass node-fetch stream into googleapis (need a generic Readable stream for node)
                        const { Readable } = await import("stream");
                        const arrayBuffer = await response.arrayBuffer();
                        const bufferStream = new Readable();
                        bufferStream.push(Buffer.from(arrayBuffer));
                        bufferStream.push(null);

                        // 5. Upload to YouTube
                        console.log(`   Uploading to YouTube...`);
                        const youtube = google.youtube({ version: "v3", auth: oauth2Client });

                        try {
                            const res = await youtube.videos.insert({
                                part: ["snippet", "status"],
                                requestBody: {
                                    snippet: {
                                        title: videoTitle,
                                        description: "Generated by VidZilly - Automated AI faceless videos!",
                                        categoryId: "22", // People & Blogs
                                        tags: ["VidZilly", "AI Video"],
                                    },
                                    status: {
                                        privacyStatus: "private", // Safer default for automated unverified uploads
                                    },
                                },
                                media: {
                                    body: bufferStream,
                                },
                            });

                            console.log(`   ✅ YouTube Upload Success! Video ID: ${res.data.id}`);
                            console.log(`   🔗 Link: https://youtu.be/${res.data.id}`);
                        } catch (err: any) {
                            console.error(`   ❌ YouTube Upload Failed - Auth or Quota Error:`, err.message);
                        }

                        break;
                    }

                    case "instagram": {
                        // 🔧 PLACEHOLDER — Instagram publishing coming soon
                        console.log(`📸 [PLACEHOLDER] Instagram: Would post "${videoTitle}" as a Reel.`);
                        console.log(`   Video URL: ${finalVideoUrl}`);
                        // TODO: Integrate Instagram Graph API
                        // await fetch('https://graph.instagram.com/me/media', { ... });
                        break;
                    }

                    case "tiktok": {
                        // 🔧 PLACEHOLDER — TikTok publishing coming soon
                        console.log(`🎵 [PLACEHOLDER] TikTok: Would post "${videoTitle}" as a video.`);
                        console.log(`   Video URL: ${finalVideoUrl}`);
                        // TODO: Integrate TikTok Content Posting API
                        break;
                    }

                    case "facebook": {
                        // 🔧 PLACEHOLDER — Facebook publishing coming soon
                        console.log(`📘 [PLACEHOLDER] Facebook: Would share "${videoTitle}" as a video post.`);
                        console.log(`   Video URL: ${finalVideoUrl}`);
                        // TODO: Integrate Facebook Graph API
                        break;
                    }

                    default:
                        console.warn(`Unknown platform: ${platform}`);
                }
            });
        }

        return { success: true, platforms, videoId };
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Build rich HTML email body (shared by both generateVideo Step 9
// and publishVideoToPlatforms email handler)
// ─────────────────────────────────────────────────────────────────────────────
function buildEmailBody({ userName, videoTitle, thumbnailUrl, finalVideoUrl, seriesId }: {
    userName: string;
    videoTitle: string;
    thumbnailUrl: string;
    finalVideoUrl: string;
    seriesId: string;
}) {
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Your video is ready!</title></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.5);">
        <tr><td style="background:linear-gradient(135deg,#6c63ff,#3b82f6);padding:40px 40px 30px;text-align:center;">
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;">🎬 VidZilly</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Your video is ready to view!</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 8px;font-size:17px;">Hi <strong>${userName}</strong> 👋</p>
          <p style="margin:0 0 28px;font-size:15px;color:#a0a0b0;">Your video <strong style="color:#fff;">"${videoTitle}"</strong> has been generated!</p>
          ${thumbnailUrl ? `<div style="border-radius:12px;overflow:hidden;margin-bottom:28px;"><img src="${thumbnailUrl}" width="520" style="display:block;width:100%;height:auto;" /></div>` : ""}
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding-bottom:12px;">
              <a href="${finalVideoUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#6c63ff,#3b82f6);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;">▶&nbsp; View Video</a>
            </td></tr>
            <tr><td align="center">
              <a href="${finalVideoUrl}" download target="_blank" style="display:inline-block;background:rgba(255,255,255,0.08);color:#c9c9f0;text-decoration:none;font-size:14px;font-weight:600;padding:12px 36px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);">⬇&nbsp; Download</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 40px 30px;text-align:center;border-top:1px solid rgba(255,255,255,0.07);">
          <p style="margin:0;font-size:12px;color:#555570;">© ${new Date().getFullYear()} VidZilly. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

