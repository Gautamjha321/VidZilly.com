import { getSeriesById, updateSeries } from "@/actions/series";
import SeriesForm, { SeriesFormData } from "../../create/_components/SeriesForm";
import { redirect } from "next/navigation";
import EditSeriesClientWrapper from "./EditSeriesClientWrapper";

// Force dynamic rendering since getSeriesById() uses currentUser() which reads HTTP headers.
export const dynamic = "force-dynamic";


export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const res = await getSeriesById(id);
    if (!res.success || !res.data) {
        redirect("/dashboard");
    }

    const { data } = res;

    // Transform database record into form State
    const initialFormData: SeriesFormData = {
        selectedNiche: data.niche || "",
        customNiche: data.custom_niche || "",
        language: data.language || "",
        voice: data.voice || "",
        bgMusic: data.bg_music || [],
        videoStyle: data.video_style || "",
        captionStyle: data.caption_style || "",
        seriesName: data.series_name || "",
        duration: data.duration || "",
        platforms: data.platforms || [],
        publishTime: data.publish_time || "",
    };

    const handleUpdate = async (formData: SeriesFormData) => {
        "use server";
        const updateRes = await updateSeries(id, formData);

        if (updateRes.success) {
            // Need a way to redirect from a server action passed as a prop inside a client component
            // We'll return early and let the client do the redirect if needed, 
            // but actually Next.js handles server action redirects slightly differently.
            // A simpler approach is to use a Client Component wrapper, or just return success and let the Client component route.
        }
        return updateRes;
    };

    return (
        <EditSeriesClientWrapper
            initialData={initialFormData}
            id={id}
        />
    );
}
