import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // AI Horde Free API key
        const apiKey = process.env.AI_HORDE_API_KEY || "0000000000";

        // Step 1: Request Image Generation (Async)
        const generateUrl = "https://stablehorde.net/api/v2/generate/async";
        const generateResponse = await fetch(generateUrl, {
            method: "POST",
            headers: {
                "apikey": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: prompt,
                censor_nsfw: false,
                params: {
                    width: 512,
                    height: 512,
                }
            }),
        });

        if (!generateResponse.ok) {
            const errorText = await generateResponse.text();
            console.error("AI Horde Generate Error:", errorText);
            return NextResponse.json({ error: "Failed to request image generation" }, { status: generateResponse.status });
        }

        const { id } = await generateResponse.json();

        // Step 2: Poll for completion
        const checkUrl = `https://stablehorde.net/api/v2/generate/status/${id}`;
        let isFinished = false;
        let imageUrl = "";

        // Poll every 5 seconds for up to 3 minutes
        for (let i = 0; i < 36; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));

            const statusResponse = await fetch(checkUrl);
            const statusData = await statusResponse.json();

            if (statusData.done) {
                isFinished = true;
                // The generation returns the image in the 'generations' array
                if (statusData.generations && statusData.generations.length > 0) {
                    const imgData = statusData.generations[0].img;
                    if (imgData.startsWith("http")) {
                        imageUrl = imgData; // Safe to use directly as src
                    } else {
                        // Ensure it has the proper data string prefix for base64
                        imageUrl = imgData.startsWith("data:") ? imgData : `data:image/webp;base64,${imgData}`;
                    }
                }
                break;
            }

            if (statusData.faulted) {
                throw new Error("Generation faulted on AI Horde");
            }
        }

        if (!isFinished || !imageUrl) {
            return NextResponse.json({ error: "Image generation timed out or failed to return image" }, { status: 504 });
        }

        return NextResponse.json({ imageUrl });

    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
