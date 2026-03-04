"use client";

import { useRef, useState } from "react";
import { Music, Play, Square, Check } from "lucide-react";

export const backgroundMusics = [
    {
        id: "trending-reels",
        name: "Trending Instagram Reels",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/trending-instagram-reels-music-447249.mp3",
    },
    {
        id: "basketball-reels",
        name: "Basketball Instagram Reels",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/basketball-instagram-reels-music-461852.mp3",
    },
    {
        id: "marketing-reels-1",
        name: "Instagram Reels Marketing 1",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/instagram-reels-marketing-music-384448.mp3",
    },
    {
        id: "marketing-reels-2",
        name: "Instagram Reels Marketing 2",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/instagram-reels-marketing-music-469052.mp3",
    },
    {
        id: "dramatic-hip-hop",
        name: "Dramatic Hip Hop Jazz",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/dramatic-hip-hop-music-background-jazz-music-for-short-video-148505.mp3",
    }
];

interface BgMusicSelectionProps {
    selectedMusics: string[];
    onSelectMusic: (musics: string[]) => void;
}

export default function BgMusicSelection({
    selectedMusics,
    onSelectMusic,
}: BgMusicSelectionProps) {
    const [playingMusic, setPlayingMusic] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Audio preview
    const handlePlayPreview = (musicId: string, url: string) => {
        // Stop currently playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        if (playingMusic === musicId) {
            setPlayingMusic(null);
            return;
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        setPlayingMusic(musicId);

        audio.play().catch(() => setPlayingMusic(null));

        audio.addEventListener("ended", () => {
            setPlayingMusic(null);
            audioRef.current = null;
        });
    };

    const toggleSelection = (musicId: string) => {
        if (selectedMusics.includes(musicId)) {
            onSelectMusic(selectedMusics.filter((id) => id !== musicId));
        } else {
            onSelectMusic([...selectedMusics, musicId]);
        }
    };

    return (
        <div className="mx-auto w-full max-w-3xl">
            {/* Section Header */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Background Music
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Select one or more background music tracks for your video series
                </p>
            </div>

            {/* ── Music Selection ── */}
            <div className="max-h-[60vh] md:h-[380px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 scrollbar-thin">
                <div className="grid gap-2">
                    {backgroundMusics.map((music) => {
                        const isSelected = selectedMusics.includes(music.id);
                        const isPlaying = playingMusic === music.id;

                        return (
                            <div
                                key={music.id}
                                onClick={() => toggleSelection(music.id)}
                                className={`flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 transition-all ${isSelected
                                    ? "bg-purple-50 ring-2 ring-purple-500"
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                {/* Music icon */}
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSelected
                                        ? "bg-purple-100 text-purple-600"
                                        : "bg-gray-100 text-gray-400"
                                        }`}
                                >
                                    <Music className="h-5 w-5" />
                                </div>

                                {/* Music info */}
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`text-[15px] font-semibold ${isSelected ? "text-purple-700" : "text-gray-900"
                                            }`}
                                    >
                                        {music.name}
                                    </p>
                                </div>

                                {/* Preview button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlayPreview(music.id, music.url);
                                    }}
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${isPlaying
                                        ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                    title={isPlaying ? "Stop" : "Preview"}
                                >
                                    {isPlaying ? (
                                        <Square className="h-3.5 w-3.5 fill-white" />
                                    ) : (
                                        <Play className="h-3.5 w-3.5 fill-current" />
                                    )}
                                </button>

                                {/* Checkbox indicator */}
                                <div
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isSelected
                                        ? "border-purple-500 bg-purple-500"
                                        : "border-gray-300 bg-white"
                                        }`}
                                >
                                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
