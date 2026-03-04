"use client";

import { useState } from "react";
import StepProgress from "./StepProgress";
import StepFooter from "./StepFooter";
import NicheSelection from "./NicheSelection";
import LanguageVoiceSelection from "./LanguageVoiceSelection";
import BgMusicSelection from "./BgMusicSelection";
import VideoStyleSelection from "./VideoStyleSelection";
import CaptionStyleSelection from "./CaptionStyleSelection";
import SeriesDetailsSelection from "./SeriesDetailsSelection";

export interface SeriesFormData {
    selectedNiche: string;
    customNiche: string;
    language: string;
    voice: string;
    bgMusic: string[];
    videoStyle: string;
    captionStyle: string;
    seriesName: string;
    duration: string;
    platforms: string[];
    publishTime: string;
}

interface SeriesFormProps {
    initialData: SeriesFormData;
    onSubmit: (data: SeriesFormData) => Promise<{ success: boolean; error?: string }>;
    submitLabel?: string;
    loadingLabel?: string;
    title: string;
    description: string;
}

export default function SeriesForm({
    initialData,
    onSubmit,
    submitLabel = "Schedule",
    loadingLabel = "Scheduling...",
    title,
    description,
}: SeriesFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<SeriesFormData>(initialData);
    const [isSaving, setIsSaving] = useState(false);

    const updateField = <K extends keyof SeriesFormData>(
        key: K,
        value: SeriesFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep((s) => s - 1);
    };

    const handleContinue = async () => {
        if (currentStep < 6) {
            setCurrentStep((s) => s + 1);
        } else {
            setIsSaving(true);
            const res = await onSubmit(formData);
            setIsSaving(false);
            if (!res.success && res.error !== "upgrade_required") {
                alert("Failed to save series: " + res.error);
            }
        }
    };

    const canContinue = (): boolean => {
        switch (currentStep) {
            case 1:
                return formData.selectedNiche !== "" || formData.customNiche.trim() !== "";
            case 2:
                return formData.language !== "" && formData.voice !== "";
            case 3:
                return formData.bgMusic.length > 0;
            case 4:
                return formData.videoStyle !== "";
            case 5:
                return formData.captionStyle !== "";
            case 6:
                return (
                    formData.seriesName.trim() !== "" &&
                    formData.duration !== "" &&
                    formData.platforms.length > 0 &&
                    formData.publishTime !== ""
                );
            default:
                return false;
        }
    };

    return (
        <div className="pb-12">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>

            <StepProgress currentStep={currentStep} />

            <div className="mt-4">
                {currentStep === 1 && (
                    <NicheSelection
                        selectedNiche={formData.selectedNiche}
                        customNiche={formData.customNiche}
                        onSelectNiche={(v) => updateField("selectedNiche", v)}
                        onCustomNicheChange={(v) => updateField("customNiche", v)}
                    />
                )}

                {currentStep === 2 && (
                    <LanguageVoiceSelection
                        selectedLanguage={formData.language}
                        selectedVoice={formData.voice}
                        onSelectLanguage={(v) => updateField("language", v)}
                        onSelectVoice={(v) => updateField("voice", v)}
                    />
                )}

                {currentStep === 3 && (
                    <BgMusicSelection
                        selectedMusics={formData.bgMusic}
                        onSelectMusic={(v) => updateField("bgMusic", v)}
                    />
                )}

                {currentStep === 4 && (
                    <VideoStyleSelection
                        selectedStyle={formData.videoStyle}
                        onSelectStyle={(v) => updateField("videoStyle", v)}
                    />
                )}

                {currentStep === 5 && (
                    <CaptionStyleSelection
                        selectedStyle={formData.captionStyle}
                        onSelectStyle={(v) => updateField("captionStyle", v)}
                    />
                )}

                {currentStep === 6 && (
                    <SeriesDetailsSelection
                        seriesName={formData.seriesName}
                        onSeriesNameChange={(v) => updateField("seriesName", v)}
                        duration={formData.duration}
                        onDurationChange={(v) => updateField("duration", v)}
                        platforms={formData.platforms}
                        onPlatformsChange={(v) => updateField("platforms", v)}
                        publishTime={formData.publishTime}
                        onPublishTimeChange={(v) => updateField("publishTime", v)}
                    />
                )}
            </div>

            <StepFooter
                currentStep={currentStep}
                canContinue={canContinue() && !isSaving}
                onBack={handleBack}
                onContinue={handleContinue}
                continueLabel={isSaving ? loadingLabel : (currentStep === 6 ? submitLabel : undefined)}
            />
        </div>
    );
}
