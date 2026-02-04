
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProjectMedia, TargetLanguage, LocalizationResult, ChatMessage } from "../types";

const API_KEY = process.env.API_KEY;

export class GeminiService {
  private ai: GoogleGenAI;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (!API_KEY) {
      throw new Error("API_KEY is not defined in the environment");
    }
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async localizeContent(
    text: string,
    targetLanguage: TargetLanguage,
    media?: ProjectMedia
  ): Promise<LocalizationResult> {
    const model = 'gemini-3-flash-preview';
    
    const parts: any[] = [
      {
        text: `You are a world-class localization and marketing expert. 
        Localize the following campaign text into ${targetLanguage}. 
        Ensure you maintain the brand's voice and creative intent.
        
        Analyze the cultural sensitivity of the provided assets.
        
        Original Text: "${text}"
        
        Return your analysis in the following JSON format:
        {
          "translatedText": "the localized text",
          "culturalNotes": ["note 1", "note 2"],
          "suggestedVisualChanges": "Description of how the visual elements should be changed for this target market",
          "culturalFlags": [
            { "severity": "high" | "medium" | "low", "issue": "desc", "suggestion": "fix" }
          ],
          "brandVoiceCheck": "Analysis of how well the tone was preserved",
          "qualityScore": 0.95
        }`
      }
    ];

    if (media && media.type === 'image') {
      parts.push({
        inlineData: {
          mimeType: media.mimeType || 'image/png',
          data: media.content.split(',')[1] || media.content
        }
      });
    }

    const response = await this.ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            culturalNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedVisualChanges: { type: Type.STRING },
            culturalFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              }
            },
            brandVoiceCheck: { type: Type.STRING },
            qualityScore: { type: Type.NUMBER }
          },
          required: ["translatedText", "culturalNotes", "suggestedVisualChanges", "culturalFlags", "brandVoiceCheck", "qualityScore"]
        }
      }
    });

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Invalid response from AI engine");
    }
  }

  async assistantChat(history: ChatMessage[], currentMessage: string, context: LocalizationResult | null): Promise<string> {
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are the PolyGlot Studio Assistant. You help creative teams adapt marketing campaigns. 
    You have access to the current localization results: ${JSON.stringify(context)}. 
    Be helpful, expert, and creative. Suggest alternatives and explain cultural nuances.`;

    const response = await this.ai.models.generateContent({
      model,
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: currentMessage }] }
      ],
      config: { systemInstruction }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  }

  async generateLocalizedImage(prompt: string, originalImageBase64?: string): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    
    const parts: any[] = [
      { text: `Create a localized marketing image for the target market: ${prompt}. Keep it professional and visually stunning.` }
    ];

    if (originalImageBase64) {
      parts.unshift({
        inlineData: {
          mimeType: 'image/png',
          data: originalImageBase64.split(',')[1] || originalImageBase64
        }
      });
      parts[1].text = `Edit this image to fit these cultural needs: ${prompt}. Keep the core product but adjust the setting, background, and color palette.`;
    }

    const response = await this.ai.models.generateContent({
      model,
      contents: { parts },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated");
  }

  async generateTTS(text: string, language: TargetLanguage): Promise<Uint8Array> {
    const voiceMap: Record<TargetLanguage, string> = {
      [TargetLanguage.JAPANESE]: 'Kore',
      [TargetLanguage.SPANISH]: 'Puck',
      [TargetLanguage.FRENCH]: 'Charon',
      [TargetLanguage.GERMAN]: 'Fenrir',
      [TargetLanguage.CHINESE]: 'Kore',
      [TargetLanguage.ARABIC]: 'Zephyr'
    };
    
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Professional marketing voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceMap[language] || 'Puck' } }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS Generation Failed");
    return this.decodeBase64(base64Audio);
  }

  /**
   * Generates localized audio and plays it immediately.
   */
  async generateAndPlayTTS(text: string, language: TargetLanguage, ctx?: AudioContext): Promise<void> {
    const audioBytes = await this.generateTTS(text, language);
    
    const context = ctx || this.audioContext || (this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
    if (context.state === 'suspended') {
      await context.resume();
    }

    const buffer = await decodeAudioData(audioBytes, context, 24000, 1);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
