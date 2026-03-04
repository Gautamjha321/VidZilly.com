"use client";

import { useState } from "react";
import {
    Ghost,
    Flame,
    Heart,
    Brain,
    Dumbbell,
    Utensils,
    Plane,
    Code,
    TrendingUp,
    Laugh,
    BookOpen,
    Briefcase,
    Pen,
} from "lucide-react";

const availableNiches = [
    {
        id: "scary-stories",
        name: "Scary Stories",
        description: "Chilling tales and horror narratives that keep viewers on edge",
        icon: Ghost,
    },
    {
        id: "motivation",
        name: "Motivation",
        description: "Uplifting content to inspire and drive personal growth",
        icon: Flame,
    },
    {
        id: "relationships",
        name: "Relationships",
        description: "Love advice, dating tips, and building meaningful connections",
        icon: Heart,
    },
    {
        id: "psychology",
        name: "Psychology Facts",
        description: "Mind-blowing psychological insights and human behavior",
        icon: Brain,
    },
    {
        id: "fitness",
        name: "Fitness & Health",
        description: "Workout routines, health hacks, and wellness tips",
        icon: Dumbbell,
    },
    {
        id: "cooking",
        name: "Cooking & Recipes",
        description: "Quick recipes, cooking tricks, and delicious meal ideas",
        icon: Utensils,
    },
    {
        id: "travel",
        name: "Travel & Adventure",
        description: "Explore destinations, travel hacks, and bucket-list adventures",
        icon: Plane,
    },
    {
        id: "tech",
        name: "Tech & Gadgets",
        description: "Latest tech reviews, coding tips, and gadget showcases",
        icon: Code,
    },
    {
        id: "finance",
        name: "Personal Finance",
        description: "Money management, investing tips, and financial freedom",
        icon: TrendingUp,
    },
    {
        id: "comedy",
        name: "Comedy & Humor",
        description: "Funny sketches, memes, and humorous commentary",
        icon: Laugh,
    },
    {
        id: "education",
        name: "Education & Learning",
        description: "Bite-sized lessons, study tips, and fascinating facts",
        icon: BookOpen,
    },
    {
        id: "business",
        name: "Business & Startups",
        description: "Entrepreneurship advice, startup stories, and growth strategies",
        icon: Briefcase,
    },
];

interface NicheSelectionProps {
    selectedNiche: string;
    customNiche: string;
    onSelectNiche: (niche: string) => void;
    onCustomNicheChange: (value: string) => void;
}

export default function NicheSelection({
    selectedNiche,
    customNiche,
    onSelectNiche,
    onCustomNicheChange,
}: NicheSelectionProps) {
    const [activeTab, setActiveTab] = useState<"available" | "custom">("available");

    return (
        <div className="mx-auto w-full max-w-3xl">
            {/* Section Header */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Niche</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Select a content niche for your video series
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-1 rounded-xl sm:bg-gray-100 sm:p-1 w-full">
                <button
                    onClick={() => setActiveTab("available")}
                    className={`w-full sm:flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === "available"
                        ? "bg-white text-gray-900 border border-gray-200 sm:border-none shadow-sm"
                        : "bg-gray-50 text-gray-500 border border-gray-100 sm:bg-transparent sm:border-none hover:text-gray-700"
                        }`}
                >
                    Available Niche
                </button>
                <button
                    onClick={() => setActiveTab("custom")}
                    className={`w-full sm:flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === "custom"
                        ? "bg-white text-gray-900 border border-gray-200 sm:border-none shadow-sm"
                        : "bg-gray-50 text-gray-500 border border-gray-100 sm:bg-transparent sm:border-none hover:text-gray-700"
                        }`}
                >
                    Custom Niche
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "available" ? (
                /* ── Available Niches ── */
                <div className="max-h-[60vh] md:h-[420px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 scrollbar-thin">
                    <div className="grid gap-2">
                        {availableNiches.map((niche) => {
                            const isSelected = selectedNiche === niche.id;
                            return (
                                <button
                                    key={niche.id}
                                    onClick={() => onSelectNiche(niche.id)}
                                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all ${isSelected
                                        ? "bg-purple-50 ring-2 ring-purple-500"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSelected
                                            ? "bg-purple-100 text-purple-600"
                                            : "bg-gray-100 text-gray-400"
                                            }`}
                                    >
                                        <niche.icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`text-[15px] font-semibold ${isSelected ? "text-purple-700" : "text-gray-900"
                                                }`}
                                        >
                                            {niche.name}
                                        </p>
                                        <p className="truncate text-sm text-gray-500">
                                            {niche.description}
                                        </p>
                                    </div>
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
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* ── Custom Niche ── */
                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 min-w-0">
                    <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                            <Pen className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[15px] font-semibold text-gray-900">
                                Enter Your Custom Niche
                            </p>
                            <p className="text-sm text-gray-500">
                                Describe the specific content niche you want to create
                            </p>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={customNiche}
                        onChange={(e) => onCustomNicheChange(e.target.value)}
                        placeholder="e.g. Ancient History Mysteries, Space Exploration..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 transition-all focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                </div>
            )}
        </div>
    );
}
