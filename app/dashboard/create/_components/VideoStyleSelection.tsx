"use client";

import Image from "next/image";
import { Check } from "lucide-react";

export const videoStyles = [
    { id: "3d-render", name: "3D Render", image: "/video-style/3d-render.png" },
    { id: "anime", name: "Anime", image: "/video-style/anime.png" },
    { id: "cinematic", name: "Cinematic", image: "/video-style/cinematic.png" },
    { id: "cyberpunk", name: "Cyberpunk", image: "/video-style/cyberpunk.png" },
    { id: "gta", name: "GTA", image: "/video-style/gta.png" },
    { id: "realistic", name: "Realistic", image: "/video-style/realistic.png" },
];

interface VideoStyleSelectionProps {
    selectedStyle: string;
    onSelectStyle: (styleId: string) => void;
}

export default function VideoStyleSelection({
    selectedStyle,
    onSelectStyle,
}: VideoStyleSelectionProps) {
    return (
        <div className="mx-auto w-full max-w-5xl">
            {/* Section Header */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Video Style
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose the visual style for your video series
                </p>
            </div>

            {/* Horizontal Scroll List */}
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 scrollbar-thin snap-x snap-mandatory">
                {videoStyles.map((style) => {
                    const isSelected = selectedStyle === style.id;

                    return (
                        <div
                            key={style.id}
                            onClick={() => onSelectStyle(style.id)}
                            className={`relative flex-none cursor-pointer rounded-2xl transition-all snap-center ${isSelected
                                ? "ring-4 ring-purple-600 scale-[1.02] shadow-xl"
                                : "hover:scale-[1.02] hover:shadow-lg ring-1 ring-gray-200"
                                }`}
                        >
                            {/* 9:16 Aspect Ratio Container */}
                            <div className="relative w-48 h-[341px] sm:w-56 sm:h-[400px] overflow-hidden rounded-2xl">
                                <Image
                                    src={style.image}
                                    alt={style.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 192px, 224px"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Label */}
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                    <span className="text-white font-bold text-lg drop-shadow-md">
                                        {style.name}
                                    </span>
                                </div>

                                {/* Checkmark */}
                                {isSelected && (
                                    <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white shadow-md">
                                        <Check className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
