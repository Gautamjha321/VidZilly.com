"use client";

import { Clock, Type, Globe, Check, Youtube, Instagram, Facebook, Mail, Video } from "lucide-react";

const availablePlatforms = [
    { id: "youtube", name: "YouTube", icon: Youtube },
    { id: "instagram", name: "Instagram", icon: Instagram },
    { id: "facebook", name: "Facebook", icon: Facebook },
    { id: "tiktok", name: "TikTok", icon: Video },
    { id: "email", name: "Email", icon: Mail },
];

const durationOptions = [
    { value: "30-50", label: "30-50 sec video" },
    { value: "60-70", label: "60-70 sec video" },
];

interface SeriesDetailsSelectionProps {
    seriesName: string;
    onSeriesNameChange: (val: string) => void;
    duration: string;
    onDurationChange: (val: string) => void;
    platforms: string[];
    onPlatformsChange: (val: string[]) => void;
    publishTime: string;
    onPublishTimeChange: (val: string) => void;
}

export default function SeriesDetailsSelection({
    seriesName,
    onSeriesNameChange,
    duration,
    onDurationChange,
    platforms,
    onPlatformsChange,
    publishTime,
    onPublishTimeChange,
}: SeriesDetailsSelectionProps) {
    const togglePlatform = (platformId: string) => {
        if (platforms.includes(platformId)) {
            onPlatformsChange(platforms.filter((p) => p !== platformId));
        } else {
            onPlatformsChange([...platforms, platformId]);
        }
    };

    return (
        <div className="mx-auto w-full max-w-3xl">
            {/* Section Header */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Series Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Finalize your series details, duration, and publish schedule
                </p>
            </div>

            <div className="space-y-4 sm:space-y-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">

                {/* Series Name */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Type className="h-4 w-4 text-purple-500" />
                        Series Name
                    </label>
                    <input
                        type="text"
                        value={seriesName}
                        onChange={(e) => onSeriesNameChange(e.target.value)}
                        placeholder="e.g. Daily Tech Facts"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 text-sm sm:text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all min-w-0"
                    />
                </div>

                {/* Duration */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Clock className="h-4 w-4 text-purple-500" />
                        Video Duration
                    </label>
                    <select
                        value={duration}
                        onChange={(e) => onDurationChange(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 text-sm sm:text-[15px] text-gray-900 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer min-w-0"
                    >
                        <option value="" disabled>Select a duration</option>
                        {durationOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Platform Selection */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Globe className="h-4 w-4 text-purple-500" />
                        Select Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availablePlatforms.map((platform) => {
                            const isSelected = platforms.includes(platform.id);
                            return (
                                <button
                                    key={platform.id}
                                    onClick={() => togglePlatform(platform.id)}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${isSelected
                                        ? "bg-purple-100 text-purple-700 ring-2 ring-purple-500"
                                        : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {isSelected && <Check className="h-3.5 w-3.5" />}
                                    <platform.icon className="h-4 w-4" />
                                    {platform.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Publish Time */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Clock className="h-4 w-4 text-purple-500" />
                        Time to Publish
                    </label>
                    <input
                        type="time"
                        value={publishTime}
                        onChange={(e) => onPublishTimeChange(e.target.value)}
                        className="w-full sm:w-auto rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 sm:px-4 text-sm sm:text-[15px] text-gray-900 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer min-w-0"
                    />
                    <p className="mt-2 text-xs font-semibold text-purple-600 bg-purple-50 p-2 rounded-lg inline-block">
                        Note: Video will generate 3-6 hours before video publish
                    </p>
                </div>

            </div>
        </div>
    );
}
