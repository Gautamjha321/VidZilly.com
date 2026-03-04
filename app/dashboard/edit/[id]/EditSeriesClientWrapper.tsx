"use client";

import { useRouter } from "next/navigation";
import { updateSeries } from "@/actions/series";
import SeriesForm, { SeriesFormData } from "../../create/_components/SeriesForm";

interface EditSeriesClientWrapperProps {
    initialData: SeriesFormData;
    id: string;
}

export default function EditSeriesClientWrapper({ initialData, id }: EditSeriesClientWrapperProps) {
    const router = useRouter();

    const handleSubmit = async (data: SeriesFormData) => {
        const res = await updateSeries(id, data);
        if (res.success) {
            router.push("/dashboard");
            router.refresh();
        }
        return res;
    };

    return (
        <SeriesForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel="Update Series"
            loadingLabel="Updating..."
            title="Edit Series"
            description="Update the configuration for your video series."
        />
    );
}
