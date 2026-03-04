import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env" });

async function testDeepgram() {
    console.log("Testing Deepgram TTS...");
    const url = `https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=mp3`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: "Hello, this is a test." })
    });

    console.log("Status:", response.status);
    const buffer = Buffer.from(await response.arrayBuffer());
    console.log("TTS Buffer Length:", buffer.length);
    console.log("TTS Snippet:", buffer.toString('utf8').substring(0, 100));
}

testDeepgram().catch(console.error);
