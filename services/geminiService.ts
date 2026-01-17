import { GoogleGenAI, Modality } from "@google/genai";
import { HostPair, HostPairId, PodcastConfig, VoiceName, HOST_PAIRS } from "../types";
import { decodeBase64, pcmToWavBlob } from "../utils/audioUtils";

const apiKey = process.env.API_KEY || '';

/**
 * 1. Search for news and write a script.
 */
export const searchAndScriptPodcast = async (
  config: PodcastConfig
): Promise<{ script: string; sources: Array<{ title: string; uri: string }> }> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const hostConfig = HOST_PAIRS[config.hostPairId];
  const durationGuidance = config.duration === 'Short' ? '2 minutes (approx 300 words)' : 
                          config.duration === 'Medium' ? '5 minutes (approx 750 words)' : 
                          '8 minutes (approx 1200 words)';
                          
  const publications = config.publications.length > 0 
    ? config.publications.join(', ') 
    : "Reliable global news sources";

  const prompt = `
    You are a professional podcast producer for "NewsCaster AI".
    
    **Task**: Create a radio-style podcast script about the latest news.
    **Timeframe for Search**: STRICTLY find news from the **${config.timeframe}**. Do not use old news.
    **Topics**: ${config.interests.join(', ')}.
    **Sources**: Prioritize news from: ${publications}.
    
    **Host Configuration**:
    - **Host 1**: ${hostConfig.speaker1Name} (Voice: ${hostConfig.speaker1})
    - **Host 2**: ${hostConfig.speaker2Name} (Voice: ${hostConfig.speaker2})
    - Tone: ${hostConfig.description}
    
    **Structure**:
    1. Hosts introduce themselves and the show.
    2. Discuss 3-4 key stories found via Google Search.
    3. Use natural transitions between major story changes.
    4. **End** with a brief sign-off.
    
    **Formatting**:
    - Use exact speaker labels: "Host 1:" and "Host 2:".
    - Write natural, conversational dialogue (interjections, agreement, slight banter).
    - Keep the total length around ${durationGuidance}.
    
    **Grounding**:
    - Use the \`googleSearch\` tool to find REAL facts.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const script = response.text || "Could not generate script.";
    
    // Extract sources
    const sources: Array<{ title: string; uri: string }> = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

    return { script, sources: uniqueSources };

  } catch (error) {
    console.error("Script generation error:", error);
    throw new Error("Failed to search news and generate script.");
  }
};

/**
 * 2. Convert the script to multi-speaker audio.
 */
export const generateMultiSpeakerPodcast = async (
  script: string,
  hostPairId: HostPairId
): Promise<{ audioBlob: Blob }> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-preview-tts";
  const hosts = HOST_PAIRS[hostPairId];
  
  // 1. Map generic host labels to specific names (for text consistency)
  // The speaker names must exactly match the speakerVoiceConfigs speaker field
  // Clean up any formatting issues and ensure consistent "Speaker: text" format
  let formattedScript = script
    .replace(/\*\*Host 1\*\*:\s*/gi, `${hosts.speaker1Name}: `)
    .replace(/\*\*Host 2\*\*:\s*/gi, `${hosts.speaker2Name}: `)
    .replace(/Host 1:\s*/gi, `${hosts.speaker1Name}: `)
    .replace(/Host 2:\s*/gi, `${hosts.speaker2Name}: `)
    .replace(/\*\*/g, ''); // Remove any remaining markdown bold markers

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: formattedScript }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: hosts.speaker1Name,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: hosts.speaker1 } }
              },
              {
                speaker: hosts.speaker2Name,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: hosts.speaker2 } }
              }
            ]
          }
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini.");
    }

    const pcmData = decodeBase64(base64Audio);
    const audioBlob = pcmToWavBlob(pcmData, 24000); 

    return { audioBlob };

  } catch (error) {
    console.error("Speech generation error:", error);
    throw new Error("Failed to generate podcast audio.");
  }
};