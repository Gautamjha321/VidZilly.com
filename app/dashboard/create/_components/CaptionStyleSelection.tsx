"use client";

import { Check } from "lucide-react";
import { useState, useEffect } from "react";

export const captionStyles = [
    {
        name: "Youtuber",
        value: "youtuber",
        description: "Classic yellow text with stroke, bold Pop-in effect.",
        animationClass: "animate-youtuber-pop",
        styleClass: "text-yellow-400 font-black tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]",
    },
    {
        name: "Neon Glow",
        value: "neon-glow",
        description: "Cyan glowing text with continuous pulse animation.",
        animationClass: "animate-pulse",
        styleClass: "text-cyan-300 font-bold tracking-widest [text-shadow:0_0_10px_#22d3ee,0_0_20px_#22d3ee]",
    },
    {
        name: "Typewriter",
        value: "typewriter",
        description: "Mono text revealing letter by letter.",
        animationClass: "animate-typewriter",
        styleClass: "font-mono text-green-400 font-semibold border-r-2 border-green-400 whitespace-nowrap overflow-hidden",
    },
    {
        name: "Cinematic",
        value: "cinematic",
        description: "Elegant serif font with slow fade-up and letter spacing expansion.",
        animationClass: "animate-cinematic-fade",
        styleClass: "font-serif text-white font-medium italic tracking-widest drop-shadow-md",
    },
    {
        name: "Highlight",
        value: "highlight",
        description: "Black text on a bright yellow background box.",
        animationClass: "animate-bounce",
        styleClass: "bg-yellow-400 text-black font-bold px-2 py-1 transform -skew-x-6",
    },
    {
        name: "Cyberpunk",
        value: "cyberpunk",
        description: "Glitchy effect with bold pink and cyan text shadows.",
        animationClass: "animate-glitch-skew",
        styleClass: "text-white font-black uppercase tracking-tighter [text-shadow:2px_2px_0_#ec4899,-2px_-2px_0_#06b6d4]",
    },
];

interface CaptionStyleSelectionProps {
    selectedStyle: string;
    onSelectStyle: (style: string) => void;
}

export default function CaptionStyleSelection({
    selectedStyle,
    onSelectStyle,
}: CaptionStyleSelectionProps) {
    // A simple cycle of text words to demonstrate animation
    const words = ["CREATE", "AWESOME", "VIDEOS", "TODAY!"];
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % words.length);
        }, 1500); // Change word every 1.5 seconds

        return () => clearInterval(interval);
    }, [words.length]);

    const currentWord = words[wordIndex];

    return (
        <div className="mx-auto w-full max-w-5xl">
            {/* Section Header */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Caption Style
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose how your captions will look and animate
                </p>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pt-2 px-2 max-h-[60vh] md:h-[400px] overflow-y-auto scrollbar-thin">
                {captionStyles.map((style) => {
                    const isSelected = selectedStyle === style.value;

                    return (
                        <div
                            key={style.value}
                            onClick={() => onSelectStyle(style.value)}
                            className={`relative flex flex-col items-center justify-center cursor-pointer rounded-2xl h-40 md:h-48 bg-gray-900 overflow-hidden transition-all ${isSelected
                                ? "ring-4 ring-purple-600 scale-[1.02] shadow-xl"
                                : "hover:scale-[1.02] hover:shadow-lg ring-1 ring-gray-700"
                                }`}
                        >
                            {/* Preview Area */}
                            <div className="flex-1 flex items-center justify-center w-full z-10">
                                {/* The animated text preview wrapper */}
                                <div key={wordIndex} className={`${style.animationClass}`}>
                                    <span className={`text-2xl md:text-3xl lg:text-4xl ${style.styleClass}`}>
                                        {currentWord}
                                    </span>
                                </div>
                            </div>

                            {/* Information area */}
                            <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm p-3 border-t border-gray-800 z-20">
                                <p className="text-white font-semibold text-sm">
                                    {style.name}
                                </p>
                                <p className="text-gray-400 text-xs truncate">
                                    {style.description}
                                </p>
                            </div>

                            {/* Checkmark */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-md z-30">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
