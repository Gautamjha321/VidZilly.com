export const Language = [
    {
        language: "English",
        countryCode: "US",
        countryFlag: "us",
        modelName: "deepgram",
        modelLangCode: "en-US",
    },
    {
        language: "Spanish",
        countryCode: "MX",
        countryFlag: "mx",
        modelName: "deepgram",
        modelLangCode: "es-MX",
    },
    {
        language: "German",
        countryCode: "DE",
        countryFlag: "de",
        modelName: "deepgram",
        modelLangCode: "de-DE",
    },
    {
        language: "Hindi",
        countryCode: "IN",
        countryFlag: "in",
        modelName: "fonadalab",
        modelLangCode: "hi-IN",
    },
    {
        language: "Marathi",
        countryCode: "IN",
        countryFlag: "in",
        modelName: "fonadalab",
        modelLangCode: "mr-IN",
    },
    {
        language: "Telugu",
        countryCode: "IN",
        countryFlag: "in",
        modelName: "fonadalab",
        modelLangCode: "te-IN",
    },
    {
        language: "Tamil",
        countryCode: "IN",
        countryFlag: "in",
        modelName: "fonadalab",
        modelLangCode: "ta-IN",
    },
    {
        language: "French",
        countryCode: "FR",
        countryFlag: "fr",
        modelName: "deepgram",
        modelLangCode: "fr-FR",
    },
    {
        language: "Dutch",
        countryCode: "NL",
        countryFlag: "nl",
        modelName: "deepgram",
        modelLangCode: "nl-NL",
    },
    {
        language: "Italian",
        countryCode: "IT",
        countryFlag: "it",
        modelName: "deepgram",
        modelLangCode: "it-IT",
    },
    {
        language: "Japanese",
        countryCode: "JP",
        countryFlag: "jp",
        modelName: "deepgram",
        modelLangCode: "ja-JP",
    },
];

export interface VoiceOption {
    model: string;
    modelName: string;
    preview: string;
    gender: string;
}

export const DeepgramVoices: VoiceOption[] = [
    {
        model: "deepgram",
        modelName: "aura-2-odysseus-en",
        preview: "/voice/deepgram-aura-2-odysseus-en.wav",
        gender: "male",
    },
    {
        model: "deepgram",
        modelName: "aura-2-thalia-en",
        preview: "/voice/deepgram-aura-2-thalia-en.wav",
        gender: "female",
    },
    {
        model: "deepgram",
        modelName: "aura-2-amalthea-en",
        preview: "/voice/deepgram-aura-2-amalthea-en.wav",
        gender: "female",
    },
    {
        model: "deepgram",
        modelName: "aura-2-andromeda-en",
        preview: "/voice/deepgram-aura-2-andromeda-en.wav",
        gender: "female",
    },
    {
        model: "deepgram",
        modelName: "aura-2-apollo-en",
        preview: "/voice/deepgram-aura-2-apollo-en.wav",
        gender: "male",
    },
];

export const FonadalabVoices: VoiceOption[] = [
    {
        model: "fonadalab",
        modelName: "Vaanee",
        preview: "/voice/fonadalab-Vaanee.mp3",
        gender: "female",
    },
    {
        model: "fonadalab",
        modelName: "Chaitra",
        preview: "/voice/fonadalab-Chaitra.mp3",
        gender: "female",
    },
    {
        model: "fonadalab",
        modelName: "Meghra",
        preview: "/voice/fonadalab-Meghra.mp3",
        gender: "male",
    },
    {
        model: "fonadalab",
        modelName: "Nirvani",
        preview: "/voice/fonadalab-Nirvani.mp3",
        gender: "female",
    },
];

export function getVoicesForModel(modelName: string): VoiceOption[] {
    if (modelName === "deepgram") return DeepgramVoices;
    if (modelName === "fonadalab") return FonadalabVoices;
    return [];
}
