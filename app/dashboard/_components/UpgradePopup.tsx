"use client";

import { useRouter } from "next/navigation";
import { Sparkles, X, ArrowRight } from "lucide-react";

interface UpgradePopupProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export default function UpgradePopup({
    isOpen,
    onClose,
    title = "Upgrade to Pro",
    description = "You've reached the free plan limit. Upgrade to generate unlimited AI videos and access premium features!"
}: UpgradePopupProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 fade-in-0 duration-300 bg-white">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-6 bg-purple-100">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                </div>

                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{title}</h3>
                    <p className="text-sm mb-8 leading-relaxed text-gray-500">
                        {description}
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                onClose();
                                router.push("/dashboard/billing");
                            }}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 text-sm font-semibold text-white shadow-sm transition-colors bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90"
                        >
                            View Upgrade Plans <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
