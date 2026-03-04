"use client";

import { useRef, useState } from "react";
import { Globe, Mic, Play, Square, User } from "lucide-react";
import {
    Language,
    getVoicesForModel,
    type VoiceOption,
} from "../_data/languageVoiceData";

interface LanguageVoiceSelectionProps {
    selectedLanguage: string;
    selectedVoice: string;
    onSelectLanguage: (langCode: string) => void;
    onSelectVoice: (voiceModelName: string) => void;
}

export default function LanguageVoiceSelection({
    selectedLanguage,
    selectedVoice,
    onSelectLanguage,
    onSelectVoice,
}: LanguageVoiceSelectionProps) {
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Find Selected language object
    const selectedLangObj = Language.find(
        (l) => l.modelLangCode === selectedLanguage
    );
    const voices: VoiceOption[] = selectedLangObj
        ? getVoicesForModel(selectedLangObj.modelName)
        : [];

    // Flag emoji from country code
    const getFlagUrl = (code: string) =>
        `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;

    // Audio preview
    const handlePlayPreview = (voice: VoiceOption) => {
        // Stop currently playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        if (playingVoice === voice.modelName) {
            setPlayingVoice(null);
            return;
        }

        // Play audio from public/voice folder
        const audio = new Audio(voice.preview);
        audioRef.current = audio;
        setPlayingVoice(voice.modelName);

        audio.play().catch(() => setPlayingVoice(null));

        audio.addEventListener("ended", () => {
            setPlayingVoice(null);
            audioRef.current = null;
        });
    };

    return (
        <div className="mx-auto w-full max-w-3xl">
            {/* Section Header */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Language & Voice
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose a language and select a voice for your video series
                </p>
            </div>

            {/* ── Language Selection ── */}
            <div className="mb-6">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Globe className="h-4 w-4 text-purple-500" />
                    Select Language
                </label>
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {Language.map((lang) => {
                        const isSelected = selectedLanguage === lang.modelLangCode;
                        return (
                            <button
                                key={lang.modelLangCode}
                                onClick={() => {
                                    onSelectLanguage(lang.modelLangCode);
                                    onSelectVoice(""); // reset voice when language changes
                                }}
                                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-all ${isSelected
                                    ? "bg-purple-50 text-purple-700 ring-2 ring-purple-500"
                                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getFlagUrl(lang.countryFlag)}
                                    alt={lang.countryCode}
                                    className="h-4 w-6 rounded-sm object-cover"
                                />
                                <span className="truncate">{lang.language}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Voice Selection ── */}
            {selectedLanguage && (
                <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Mic className="h-4 w-4 text-purple-500" />
                        Select Voice
                        <span className="ml-auto text-xs font-normal text-gray-400">
                            Model: {selectedLangObj?.modelName}
                        </span>
                    </label>

                    <div className="max-h-[50vh] md:h-[280px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 scrollbar-thin">
                        <div className="grid gap-2">
                            {voices.map((voice) => {
                                const isSelected = selectedVoice === voice.modelName;
                                const isPlaying = playingVoice === voice.modelName;

                                return (
                                    <div
                                        key={voice.modelName}
                                        onClick={() => onSelectVoice(voice.modelName)}
                                        className={`flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 transition-all ${isSelected
                                            ? "bg-purple-50 ring-2 ring-purple-500"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* Voice icon */}
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSelected
                                                ? "bg-purple-100 text-purple-600"
                                                : "bg-gray-100 text-gray-400"
                                                }`}
                                        >
                                            <Mic className="h-5 w-5" />
                                        </div>

                                        {/* Voice info */}
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`text-[15px] font-semibold capitalize ${isSelected ? "text-purple-700" : "text-gray-900"
                                                    }`}
                                            >
                                                {voice.modelName.replace(/-/g, " ")}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <User className="h-3 w-3" />
                                                    {voice.gender}
                                                </span>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="text-xs text-gray-400">
                                                    {voice.model}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Preview button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayPreview(voice);
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

                                        {/* Radio indicator */}
                                        <div
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected
                                                ? "border-purple-500 bg-purple-500"
                                                : "border-gray-300"
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="h-2 w-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
