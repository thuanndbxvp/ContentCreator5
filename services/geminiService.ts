import { GoogleGenAI, Type } from "@google/genai";
import type { GenerationParams, VisualPrompt, AllVisualPromptsResult, ScriptPartSummary } from '../types';

// Helper function to handle API errors and provide more specific messages
const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Error during ${context}:`, error);
    if (error instanceof Error) {
        let userMessage = `Could not ${context}.`;
        
        const lowerCaseErrorMessage = error.message.toLowerCase();

        if (lowerCaseErrorMessage.includes('api key not valid') || lowerCaseErrorMessage.includes('api_key_invalid')) {
            userMessage += ' The API Key is invalid. Please check it in the settings.';
        } else if (error.message.includes('429') || lowerCaseErrorMessage.includes('quota')) {
            userMessage += ' You have reached the request limit. Please try again later.';
        } else if (lowerCaseErrorMessage.includes('safety')) {
            userMessage += ' Your request was blocked for safety reasons. Please adjust the topic or keywords.';
        } else {
            // For other errors, show the original message for better debugging.
            userMessage += ` Details: ${error.message}`;
        }
        return new Error(userMessage);
    }
    return new Error(`Could not ${context}. An unknown error occurred.`);
};


// Helper function to get the API client instance
const getApiClient = (): GoogleGenAI => {
    const keysJson = localStorage.getItem('gemini-api-keys');
    if (!keysJson) {
        throw new Error("API Key not found. Please add your API Key using the 'API' button.");
    }
    try {
        const keys = JSON.parse(keysJson);
        if (!Array.isArray(keys) || keys.length === 0) {
            throw new Error("API Key not found. Please add your API Key using the 'API' button.");
        }
        // Use the first key in the list as the active one
        const apiKey = keys[0];
        return new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Error initializing GoogleGenAI:", e);
        throw new Error("Failed to initialize AI Client. The API Key may be invalid.");
    }
}

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        // A simple, fast, and low-token request to check validity.
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'test',
        });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};

export const generateScript = async (params: GenerationParams): Promise<string> => {
    const { topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers } = params;
    const { tone, style, voice } = styleOptions;
    const { headings, bullets, bold, includeIntro, includeOutro } = formattingOptions;

    const language = targetAudience;
    let prompt: string;

    if (scriptType === 'Podcast') {
        const speakersInstruction = numberOfSpeakers === 'Auto'
            ? 'Automatically determine the best number of speakers (2-4) for this topic.'
            : `Create a conversation for exactly ${numberOfSpeakers} speakers.`;

        prompt = `
            You are an expert Podcast scriptwriter. Your task is to generate a compelling and well-structured podcast script in ${language}.

            **Primary Topic:** "${topic}".
            **Target Audience & Language:** The script must be written in ${language}.

            **Speaker & Character Instructions:**
            - **Number of Speakers:** ${speakersInstruction}
            - **Character Names:** Instead of using generic roles like "Host" or "Guest", you MUST create and use appropriate, gender-specific character names for the speakers. For example, for Vietnamese, use names like "Minh Anh:", "Quốc Trung:"; for English, use names like "Sarah:", "David:".
            - **Dialogue Labeling:** Each line of dialogue must start with the character's name followed by a colon (e.g., "Minh Anh:").

            **Script Structure & Length:**
            - **Total Word Count:** Aim for approximately ${wordCount || '800'} words.
            - **Introduction:** ${includeIntro ? "Include a captivating introduction with intro music cues [intro music]." : "Do not write a separate introduction."}
            - **Segments:** Structure the podcast into logical segments or talking points.
            - **Outro:** ${includeOutro ? "Include a concluding outro with a call-to-action and outro music cues [outro music]." : "Do not write a separate outro."}
            - **Sound Cues:** Include sound effect cues where appropriate (e.g., [sound effect of a cash register], [transition sound]).

            **AI Writing Style Guide:**
            - **Tone:** ${tone}. The script should feel conversational and ${tone.toLowerCase()}.
            - **Style:** ${style}. Structure the content in a ${style.toLowerCase()} manner.
            - **Voice:** ${voice}. The speakers' personalities should be ${voice.toLowerCase()}.

            **Keywords:** If provided, naturally integrate the following keywords into the conversation: "${keywords || 'None'}".

            **Formatting Instructions:**
            - ${headings ? "Use clear headings for different segments." : "Do not use special headings."}
            - ${bullets ? "Use bullet points for lists within a speaker's dialogue." : "Do not use lists."}
            - ${bold ? "Use markdown for bold (**text**) to emphasize key phrases." : "Do not use bold."}

            Please generate the complete podcast script now.
        `;
    } else { // Video script
        const scriptPartsInstruction = scriptParts === 'Auto'
            ? "Structure the script into a logical number of main parts based on the topic and content flow."
            : `Structure the script into ${scriptParts} main parts. If the number of parts is 1, create a continuous flow.`;

        prompt = `
          You are an expert YouTube scriptwriter. Your task is to generate a compelling and well-structured video script in ${language}.
          **Primary Goal:** Create a script about "${topic}".
          **Target Audience & Language:** The script must be written in ${language} and should be culturally relevant for this audience.
          
          **Engagement & Retention Hooks:**
          To maximize viewer retention, strategically and naturally weave in the following types of phrases throughout the script. Do not overuse them; they should feel like a natural part of the narrative.
          - **Intriguing Promises (early on):** Create anticipation for what's coming later. Example in Vietnamese: "Và ở phần cuối, tôi sẽ tiết lộ một chi tiết mà hầu như không ai biết."
          - **Open-ended Questions:** Stimulate curiosity and encourage comments. Example in Vietnamese: "Theo bạn, ai thực sự đứng sau toàn bộ câu chuyện này?"
          - **Surprising Facts or Twists:** Introduce unexpected information to keep the viewer engaged. Example in Vietnamese: "Nhưng điều không ai ngờ tới: nhân vật này… chưa bao giờ tồn tại thật."
          - **Mid-video Soft CTAs:** Re-engage the viewer in the middle of the video. Example in Vietnamese: "Nếu bạn còn xem đến đây, bạn chắc chắn sẽ muốn biết phần sau cùng…"
          - **Sequel Hooks (in the outro):** Encourage viewers to watch the next video. Example in Vietnamese: "Câu chuyện này chưa dừng lại đâu… vì ở phần sau, chúng ta sẽ khám phá điều bị che giấu 100 năm qua."

          **Script Structure & Length:**
          - **Total Word Count:** Aim for approximately ${wordCount || '800'} words.
          - **Script Parts:** ${scriptPartsInstruction}
          - **Introduction:** ${includeIntro ? "Include a captivating introduction to hook the viewer." : "Do not write a separate introduction."}
          - **Outro:** ${includeOutro ? "Include a concluding outro with a call-to-action." : "Do not write a separate outro."}
          
          **AI Writing Style Guide:**
          - **Tone:** ${tone}. The script should feel ${tone.toLowerCase()}.
          - **Style:** ${style}. Structure the content in a ${style.toLowerCase()} manner.
          - **Voice:** ${voice}. The narrator's personality should be ${voice.toLowerCase()}.
          
          **Crucial Instruction:** Ensure all parts of the script are well-connected, flow logically, and maintain a consistent narrative throughout.
          
          **Keywords:** If provided, naturally integrate the following keywords: "${keywords || 'None'}".
          
          **Formatting Instructions:**
          - ${headings ? "Use clear headings and subheadings for different sections (e.g., Intro, Main Point 1, Outro)." : "Do not use special headings."}
          - ${bullets ? "Use bullet points or numbered lists for easy-to-digest information where appropriate." : "Do not use lists."}
          - ${bold ? "Use markdown for bold (**text**) or italics (*text*) to emphasize key phrases or points." : "Do not use bold or italics."}
          
          Please generate the complete video script now.
        `;
    }

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, 'generate script');
    }
};

export const generateScriptOutline = async (topic: string, wordCount: string, language: string): Promise<string> => {
    const prompt = `
        You are an expert YouTube scriptwriter and content strategist.
        Your task is to generate a detailed and well-structured outline for a long-form YouTube video.
        **Primary Topic:** "${topic}"
        **Target Language:** ${language}
        **Target Script Length:** Approximately ${wordCount} words.
        **Instructions:**
        1.  Create a comprehensive outline that breaks the topic down into a logical sequence (e.g., Introduction, Part 1, Part 2, ..., Conclusion).
        2.  For each main part, include key talking points, sub-topics, or questions that should be answered.
        3.  The structure should be clear and easy to follow, serving as a roadmap for writing the full script later.
        4.  Suggest where engagement hooks (like a surprising fact or an open question) could be placed to maximize viewer retention.
        5.  Ensure the outline is detailed enough to guide the creation of a script that meets the target word count.
        6.  The entire response should be in ${language}. Use markdown headings starting from ## for parts.
        **Output Format:** Provide ONLY the outline, using markdown for headings, subheadings, and bullet points for clarity. Start directly with the outline.
        Example:
        ## I. Mở Đầu (Intro)
        -   Gây ấn tượng mạnh, nêu ra câu hỏi trung tâm.
        -   Giới thiệu ngắn gọn về chủ đề và tầm quan trọng của nó.
        -   Hứa hẹn giá trị mà người xem sẽ nhận được.
        ---
        Now, please generate the outline for the specified topic.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const userGuide = `### Dàn Ý Chi Tiết Cho Kịch Bản Dài\n\n**Gợi ý:** Kịch bản của bạn dài hơn 1000 từ. Đây là dàn ý chi tiết AI đã tạo ra. Bạn có thể sử dụng nút "Tạo kịch bản đầy đủ" bên dưới để AI tự động viết từng phần cho bạn.\n\n---\n\n`;
        return userGuide + response.text;
    } catch (error) {
        throw handleApiError(error, 'generate outline');
    }
};

export const generateTopicSuggestions = async (theme: string): Promise<string[]> => {
    if (!theme.trim()) return [];
    const prompt = `Based on the central theme "${theme}", generate exactly 10 specific, engaging, and SEO-friendly YouTube video titles in Vietnamese. The titles should be diverse and cover different angles of the theme.`;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            description: "A list of 10 video topic suggestions.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['suggestions']
                 }
             }
        });
        
        const jsonResponse = JSON.parse(response.text);
        const suggestions: string[] = jsonResponse.suggestions;
        if (!Array.isArray(suggestions) || suggestions.some(s => typeof s !== 'string')) {
             throw new Error("AI returned data in an unexpected format.");
        }
        return suggestions;

    } catch (error) {
        throw handleApiError(error, 'generate topic suggestions');
    }
};

export const generateKeywordSuggestions = async (topic: string): Promise<string[]> => {
    if (!topic.trim()) return [];
    const prompt = `Based on the central video topic "${topic}", generate at least 5 relevant, SEO-friendly keywords. The keywords should be in Vietnamese.`;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: {
                            type: Type.ARRAY,
                            description: "A list of at least 5 relevant keywords.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['keywords']
                 }
             }
        });
        
        const jsonResponse = JSON.parse(response.text);
        const keywords: string[] = jsonResponse.keywords;
        if (!Array.isArray(keywords) || keywords.some(s => typeof s !== 'string')) {
             throw new Error("AI returned data in an unexpected format.");
        }
        return keywords;

    } catch (error) {
        throw handleApiError(error, 'generate keyword suggestions');
    }
};

export const reviseScript = async (originalScript: string, revisionInstruction: string, params: GenerationParams): Promise<string> => {
    const { targetAudience, styleOptions } = params;
    const { tone, style, voice } = styleOptions;
    const language = targetAudience;

    const scriptTypeInstruction = params.scriptType === 'Podcast'
        ? 'The script is for a podcast. Maintain the conversational format using the established character names as speaker labels (e.g., "Minh Anh:").'
        : 'The script is for a YouTube video. Maintain the video script format with narration and visual cues.';

    const prompt = `
      You are an expert script editor. Your task is to revise the following script based on the user's instructions.
      **Script Type Context:** ${scriptTypeInstruction}
      **Original Script:**
      """
      ${originalScript}
      """
      **User's Revision Request:**
      "${revisionInstruction}"
      **Instructions:**
      - Apply the requested changes while maintaining the original tone, style, and voice: Tone: ${tone}, Style: ${style}, Voice: ${voice}.
      - Remember to keep the script engaging.
      - The script must remain coherent and flow naturally. The revision must integrate seamlessly.
      - The language must remain ${language}.
      - The output should be the FULL, revised script, not just the changed parts. Adhere to the original formatting guidelines.
      - Start directly with the revised script content.
      Please provide the revised script now.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, 'revise script');
    }
};

export const generateScriptPart = async (fullOutline: string, previousPartsScript: string, currentPartOutline: string, params: Omit<GenerationParams, 'topic'>): Promise<string> => {
    const { targetAudience, styleOptions, keywords, formattingOptions } = params;
    const { tone, style, voice } = styleOptions;
    const { headings, bullets, bold } = formattingOptions;
    const language = targetAudience;
    const prompt = `
      You are an expert YouTube scriptwriter continuing the creation of a video script. You must ensure seamless transitions and maintain a consistent narrative flow.
      **Overall Video Outline:**
      """
      ${fullOutline}
      """
      **Script Generated So Far (for context only, do not repeat):**
      """
      ${previousPartsScript}
      """
      **Your Current Task:** Write the script for the next section based on this part of the outline:
      """
      ${currentPartOutline}
      """
      **Instructions:**
      - Write ONLY the script for the current part described in the task.
      - **Crucial:** Ensure the beginning of this part connects smoothly with the end of the previously generated script.
      - Strictly adhere to the established style guide: Tone: ${tone}, Style: ${style}, Voice: ${voice}.
      - **Engagement Strategy:** Where appropriate for this specific part, incorporate engaging elements like surprising facts, twists, or open-ended questions to maintain viewer interest. Do not force them if they don't fit naturally.
      - The language must remain ${language}.
      - If provided, naturally integrate these keywords: "${keywords || 'None'}".
      - Formatting: ${headings ? "Use headings if needed." : ""} ${bullets ? "Use lists if needed." : ""} ${bold ? "Use bold/italics if needed." : ""}
      - The final output should be ONLY the text for the current part, starting directly with its content (including its heading from the outline).
      Generate the script for the current part now.
    `;
    
    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, 'generate next script part');
    }
};

export const extractDialogue = async (script: string, language: string): Promise<string> => {
    const prompt = `
      You are an AI assistant specializing in processing video or podcast scripts for Text-to-Speech (TTS) generation.
      Your task is to analyze the following script and extract ONLY the parts meant to be spoken aloud.

      **Input Script:**
      """
      ${script}
      """

      **Instructions:**
      1.  **Extract Spoken Text Only:** Read through the entire script and pull out only the dialogue or narration.
      2.  **Remove Non-Spoken Elements:** You MUST remove all of the following:
          -   Speaker labels if present (e.g., "Host:", "Guest 1:", "Minh Anh:"). The output should be only the spoken words.
          -   Headings and subheadings (e.g., "## Mở Đầu", "### Phần 1: ...").
          -   Formatting instructions or scene/sound descriptions in brackets (e.g., "[upbeat music]", "[show graphic of a planet]", "[sound effect]").
          -   Markdown formatting like asterisks for bold/italics.
          -   Any comments or notes for the editor or creator.
          -   Section separators like "---".
      3.  **Format for TTS:** The output should be a single, clean block of text. Paragraph breaks should be preserved to allow for natural pacing in the TTS output.
      4.  **Language:** The output must be in the original language of the script, which is ${language}.

      Please provide the clean, TTS-ready dialogue now.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, 'extract dialogue');
    }
};

export const generateVisualPrompt = async (sceneDescription: string): Promise<VisualPrompt> => {
    const prompt = `
        You are a visual director. Based on the following script scene, create a concise, descriptive, and evocative prompt in English for an AI image or video generator (like Veo or Flow).
        The prompt should focus on visual elements: setting, characters, actions, mood, and camera style.
        Also, provide a Vietnamese translation for the prompt.
        Output ONLY a JSON object with two keys: "english" and "vietnamese".

        **Script Scene:**
        """
        ${sceneDescription}
        """
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        english: {
                            type: Type.STRING,
                            description: "The visual prompt in English."
                        },
                        vietnamese: {
                            type: Type.STRING,
                            description: "The Vietnamese translation of the prompt."
                        }
                    },
                    required: ["english", "vietnamese"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        if (typeof jsonResponse.english === 'string' && typeof jsonResponse.vietnamese === 'string') {
            return jsonResponse;
        } else {
            throw new Error("AI returned data in an unexpected format.");
        }
    } catch (error) {
        throw handleApiError(error, 'generate visual prompt');
    }
};

export const generateAllVisualPrompts = async (script: string): Promise<AllVisualPromptsResult[]> => {
    const prompt = `
        You are a visual director AI. Your task is to analyze the following YouTube script, which is divided into sections by markdown headings (## or ###), and generate a concise, descriptive visual prompt in English for an AI image/video generator for EACH section. Also provide a Vietnamese translation for each prompt.

        **Input Script:**
        """
        ${script}
        """

        **Instructions:**
        1. Identify each distinct section/scene in the script, using the markdown headings as delimiters.
        2. For each section, create one visual prompt.
        3. The prompt should focus on visual elements: setting, characters, actions, mood, and camera style.
        4. The final output must be a JSON array. Each element in the array should be an object with three keys: "scene" (containing the original text of the script section), "english" (the English prompt), and "vietnamese" (the Vietnamese translation).
        
        Please generate the JSON array now.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            scene: {
                                type: Type.STRING,
                                description: 'The original text of the script scene/section.'
                            },
                            english: {
                                type: Type.STRING,
                                description: 'The visual prompt in English.'
                            },
                            vietnamese: {
                                type: Type.STRING,
                                description: 'The Vietnamese translation of the prompt.'
                            }
                        },
                        required: ['scene', 'english', 'vietnamese']
                    }
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        if (Array.isArray(jsonResponse)) {
            // Further validation can be added here if needed
            return jsonResponse as AllVisualPromptsResult[];
        } else {
            throw new Error("AI returned data in an unexpected format.");
        }
    } catch (error) {
        throw handleApiError(error, 'generate all visual prompts');
    }
};

export const summarizeScriptForScenes = async (script: string): Promise<ScriptPartSummary[]> => {
    const prompt = `
        You are an expert video production assistant. Your task is to break down the following YouTube script into a series of detailed scenes, each corresponding to an 8-second video clip.
        The script is organized into main parts using markdown headings (## or ###). For each main part, you must generate multiple short scenes.

        **Input Script:**
        """
        ${script}
        """

        **Instructions:**
        1.  Analyze the script section by section.
        2.  For each main part identified by a heading, create a list of scenes.
        3.  Each scene must be designed to be approximately 8 seconds long.
        4.  For each scene, provide:
            - A short 'summary' in Vietnamese, describing the key action, information, or dialogue for that 8-second segment.
            - A detailed 'visualPrompt' in English for an AI video generator (like Veo) that visually represents the summary. This prompt should describe the setting, characters, action, mood, and camera style.
        5.  The final output must be a JSON array. Each object in the array represents a main part of the script and must have a 'partTitle' (the heading text) and a 'scenes' array. Each object in the 'scenes' array must have 'sceneNumber' (starting from 1 for each part), 'summary', and 'visualPrompt'.

        Please generate the JSON array now.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            partTitle: {
                                type: Type.STRING,
                                description: "The title of the script part from the heading."
                            },
                            scenes: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        sceneNumber: {
                                            type: Type.NUMBER,
                                            description: "The sequential number of the scene within the part."
                                        },
                                        summary: {
                                            type: Type.STRING,
                                            description: "A short summary in Vietnamese for an 8-second clip."
                                        },
                                        visualPrompt: {
                                            type: Type.STRING,
                                            description: "A detailed visual prompt in English for an AI video generator."
                                        }
                                    },
                                    required: ['sceneNumber', 'summary', 'visualPrompt']
                                }
                            }
                        },
                        required: ['partTitle', 'scenes']
                    }
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        if (Array.isArray(jsonResponse)) {
            return jsonResponse as ScriptPartSummary[];
        } else {
            throw new Error("AI returned data in an unexpected format.");
        }
    } catch (error) {
        throw handleApiError(error, 'summarize script for scenes');
    }
};