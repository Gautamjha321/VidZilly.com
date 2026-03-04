import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export interface CaptionWord {
    word: string;
    start: number;
    end: number;
    confidence: number;
}

export interface GeneratedVideoProps {
    script: string;
    audioUrl: string;
    captions: CaptionWord[];
    images: string[];
}

export const GeneratedVideo: React.FC<GeneratedVideoProps> = ({
    audioUrl,
    captions,
    images,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const validImages = images.filter((img) => img && img !== "");

    const audioDurationInSeconds =
        captions && captions.length > 0
            ? captions[captions.length - 1].end + 1
            : validImages.length * 5 || 5;

    const totalFrames = Math.max(1, Math.ceil(audioDurationInSeconds * fps));

    const framesPerImage =
        validImages.length > 0 ? Math.ceil(totalFrames / validImages.length) : totalFrames;

    const getAnimationStyle = (index: number) => {
        const animationType = index % 3;
        if (animationType === 0) {
            const scale = interpolate(frame - index * framesPerImage, [0, framesPerImage], [1, 1.2], { extrapolateRight: "clamp" });
            return { transform: `scale(${scale})` };
        } else if (animationType === 1) {
            const translateY = interpolate(frame - index * framesPerImage, [0, framesPerImage], [0, -100], { extrapolateRight: "clamp" });
            return { transform: `translateY(${translateY}px)` };
        } else {
            const opacity = interpolate(frame - index * framesPerImage, [0, 30], [0, 1], { extrapolateRight: "clamp" });
            const scale = interpolate(frame - index * framesPerImage, [0, framesPerImage], [1.05, 1], { extrapolateRight: "clamp" });
            return { opacity, transform: `scale(${scale})` };
        }
    };

    const currentTime = frame / fps;
    const chunkedCaptions: CaptionWord[][] = [];

    let i = 0;
    while (i < (captions || []).length) {
        const chunkSize = i % 2 === 0 ? 3 : 2;
        chunkedCaptions.push(captions.slice(i, i + chunkSize));
        i += chunkSize;
    }

    const activeChunk = chunkedCaptions.find((chunk) => {
        const start = chunk[0].start;
        const end = chunk[chunk.length - 1].end;
        return currentTime >= start && currentTime <= end + 0.5;
    });

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            {audioUrl && <Audio src={audioUrl} />}

            {validImages.map((img, index) => {
                const startFrame = index * framesPerImage;
                return (
                    <Sequence key={index} from={startFrame} durationInFrames={framesPerImage}>
                        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
                            <Img
                                src={img}
                                style={{ ...getAnimationStyle(index), minWidth: "100%", minHeight: "100%", objectFit: "cover" }}
                            />
                        </AbsoluteFill>
                    </Sequence>
                );
            })}

            {activeChunk && (
                <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: "15%" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", padding: "20px 40px", backgroundColor: "rgba(0, 0, 0, 0.6)", borderRadius: "20px", maxWidth: "80%" }}>
                        {activeChunk.map((wordObj, i) => {
                            const isSpeaking = currentTime >= wordObj.start && currentTime <= wordObj.end;
                            return (
                                <span key={i} style={{ fontSize: "60px", fontWeight: "bold", color: isSpeaking ? "#FFE600" : "white", textTransform: "uppercase", fontFamily: "Arial, sans-serif", textShadow: "4px 4px 0px rgba(0,0,0,0.8)" }}>
                                    {wordObj.word}
                                </span>
                            );
                        })}
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};
