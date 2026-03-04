"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVideoSeries } from "@/actions/series";
import SeriesForm, { SeriesFormData } from "./_components/SeriesForm";
import UpgradePopup from "../_components/UpgradePopup";

const initialFormData: SeriesFormData = {
    selectedNiche: "",
    customNiche: "",
    language: "",
    voice: "",
    bgMusic: [],
    videoStyle: "",
    captionStyle: "",
    seriesName: "",
    duration: "",
    platforms: [],
    publishTime: "",
};

export default function CreateSeriesPage() {
    const router = useRouter();
    const [showUpgradePopup, setShowUpgradePopup] = useState(false);

    const handleSubmit = async (data: SeriesFormData) => {
        const res = await createVideoSeries(data);
        if (res.success) {
            router.push("/dashboard");
        } else if (res.error === "upgrade_required") {
            setShowUpgradePopup(true);
        }
        return res;
    };

    return (
        <>
            <SeriesForm
                initialData={initialFormData}
                onSubmit={handleSubmit}
                submitLabel="Schedule"
                loadingLabel="Scheduling..."
                title="Create New Series"
                description="Set up your AI video series in a few simple steps"
            />
            <UpgradePopup
                isOpen={showUpgradePopup}
                onClose={() => setShowUpgradePopup(false)}
                title="Series Limit Reached"
                description="You've reached the free plan limit of 2 video series. Upgrade your plan to create more series and unlock premium features!"
            />
        </>
    );
}
