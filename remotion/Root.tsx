import { Composition } from "remotion";
import { GeneratedVideo, GeneratedVideoProps } from "./GeneratedVideo";

export const Root: React.FC = () => {
    return (
        <>
            <Composition
                id="GeneratedVideo"
                component={GeneratedVideo as any}
                fps={30}
                width={1080}
                height={1920}
                calculateMetadata={({ props }: any) => {
                    const validImages = props.images?.filter((img: string) => img && img !== "") || [];
                    const audioDurationInSeconds = props.captions && props.captions.length > 0
                        ? props.captions[props.captions.length - 1].end + 1
                        : validImages.length * 5 || 5; // Default 5s minimum

                    const durationInFrames = Math.max(1, Math.ceil(audioDurationInSeconds * 30));

                    return {
                        durationInFrames,
                        props,
                    };
                }}
                defaultProps={{
                    script: "This is a test script.",
                    audioUrl: "",
                    captions: [
                        { word: "This", start: 0, end: 0.5, confidence: 0.99 },
                        { word: "is", start: 0.5, end: 1.0, confidence: 0.99 },
                        { word: "a", start: 1.0, end: 1.5, confidence: 0.99 },
                        { word: "test", start: 1.5, end: 2.0, confidence: 0.99 },
                    ],
                    images: ["", ""],
                } as GeneratedVideoProps}
            />
        </>
    );
};
