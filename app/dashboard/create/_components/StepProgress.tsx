"use client";

import { Check } from "lucide-react";

const steps = [
    { number: 1, label: "Niche" },
    { number: 2, label: "Language" },
    { number: 3, label: "Music" },
    { number: 4, label: "Style" },
    { number: 5, label: "Caption" },
    { number: 6, label: "Details" },
];

interface StepProgressProps {
    currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
    return (
        <div className="w-full px-2 py-4 md:px-0 md:py-6 relative box-border">
            <div className="mx-auto w-full max-w-3xl overflow-x-auto scrollbar-hide snap-x snap-mandatory rounded-2xl bg-white px-4 py-6 shadow-sm border border-gray-100 min-w-0">
                <div className="flex w-full min-w-[300px] items-center justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.number;
                        const isActive = currentStep === step.number;
                        const isLast = index === steps.length - 1;

                        return (
                            <div key={step.number} className="flex flex-1 items-center snap-center">
                                {/* Step circle + label */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div
                                        className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${isCompleted
                                            ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                                            : isActive
                                                ? "bg-purple-600 text-white shadow-lg shadow-purple-300 ring-4 ring-purple-100"
                                                : "bg-gray-100 text-gray-400"
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-4 w-4 md:h-5 md:w-5" />
                                        ) : (
                                            step.number
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-[10px] md:text-xs font-semibold whitespace-nowrap ${isCompleted || isActive
                                            ? "text-purple-700"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connector line */}
                                {!isLast && (
                                    <div className="mx-2 h-1 flex-1 min-w-[12px] rounded-full bg-gray-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-purple-500 w-full" : "bg-transparent w-0"
                                                }`}
                                            style={{ width: isCompleted ? "100%" : "0%" }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
