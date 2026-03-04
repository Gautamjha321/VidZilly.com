"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepFooterProps {
    currentStep: number;
    totalSteps?: number;
    canContinue: boolean;
    onBack: () => void;
    onContinue: () => void;
    continueLabel?: string;
}

export default function StepFooter({
    currentStep,
    totalSteps = 6,
    canContinue,
    onBack,
    onContinue,
    continueLabel,
}: StepFooterProps) {
    const isFirst = currentStep === 1;
    const isLast = currentStep === totalSteps;
    const label = continueLabel ?? (isLast ? "Schedule" : "Continue");

    return (
        <div className="mx-auto mt-6 md:mt-8 flex w-full max-w-3xl flex-col-reverse gap-3 sm:flex-row items-center justify-between sm:gap-0">
            {/* Back Button */}
            {!isFirst ? (
                <button
                    onClick={onBack}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            ) : (
                <div />
            )}

            {/* Continue Button */}
            <button
                onClick={onContinue}
                disabled={!canContinue}
                className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold transition-all ${canContinue
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-300 active:scale-[0.98]"
                    : "cursor-not-allowed bg-gray-100 text-gray-400"
                    }`}
            >
                {label}
                {!isLast && <ArrowRight className="h-4 w-4" />}
            </button>
        </div>
    );
}
