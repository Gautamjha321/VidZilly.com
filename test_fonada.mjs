import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env" });

async function testFonada() {
    console.log("Testing Fonada TTS...");
    const fonadaEndpoint = "https://api.fonada.ai/tts/generate-audio-large";
    const fonadaPayload = {
        input: "Hello, this is a test.",
        voice: "Naad",
        language: "Hindi"
    };

    const response = await fetch(fonadaEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.FONADA_API_KEY}`
        },
        body: JSON.stringify(fonadaPayload)
    });

    console.log("Status:", response.status);
    const buffer = Buffer.from(await response.arrayBuffer());
    console.log("TTS Buffer Length:", buffer.length);
    console.log("TTS Snippet:", buffer.toString('utf8').substring(0, 100));
}

testFonada().catch(console.error);
