import { deployFunction, deploySite, getOrCreateBucket } from "@remotion/lambda";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: ".env" });

const deploy = async () => {
    try {
        console.log("Starting deployment...");
        const region = "us-east-1";
        const { bucketName } = await getOrCreateBucket({ region });

        console.log("Deploying function...");
        const { functionName } = await deployFunction({
            createCloudWatchLogGroup: true,
            memorySizeInMb: 2048,
            region,
            timeoutInSeconds: 120,
        });

        console.log("Deploying site...");
        const entryPoint = path.join(process.cwd(), "remotion/index.ts");
        const { serveUrl, siteName } = await deploySite({
            bucketName,
            entryPoint,
            siteName: "remotion-vidmaxx-site",
            options: {
                onProgress: (progress) => {
                    console.log(`Progress: ${Math.round(progress)}%`);
                }
            },
            region,
        });

        console.log("Deployment successful!");
        console.log("SERVE_URL=" + serveUrl);
        console.log("FUNCTION_NAME=" + functionName);

        // Update .env file
        const envPath = path.join(process.cwd(), ".env");
        let envContent = fs.readFileSync(envPath, "utf-8");
        envContent = envContent.replace(/REMOTION_SERVE_URL=.*\n?/g, "");
        envContent = envContent.replace(/REMOTION_FUNCTION_NAME=.*\n?/g, "");
        envContent += `\nREMOTION_SERVE_URL=${serveUrl}\nREMOTION_FUNCTION_NAME=${functionName}\n`;
        fs.writeFileSync(envPath, envContent);
        console.log("Updated .env file successfully.");

    } catch (e) {
        console.error("Error during deployment:", e);
    }
};

deploy();
