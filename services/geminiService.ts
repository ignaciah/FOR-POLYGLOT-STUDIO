
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProjectMedia, TargetLanguage, LocalizationResult, ChatMessage } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private audioContext: AudioContext | null = null;

  constructor() {
    // Correctly obtain and use the API key exclusively from process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // --- Core Granular Methods ---

  async translateText(text: string, targetLang: string, context?: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Translate the following text to ${targetLang}. 
      Maintain the original tone and intent.
      ${context ? `Context: ${context}` : ''}
      
      Text: ${text}
      
      Provide only the translation.`,
    });
    return response.text || "";
  }

  async analyzeMultimodal(inputs: Array<{type: 'text' | 'image', content: string}>): Promise<any> {
    const parts = inputs.map(input => {
      if (input.type === 'text') {
        return { text: input.content };
      } else {
        const base64Data = input.content.includes(',') ? input.content.split(',')[1] : input.content;
        return { 
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        };
      }
    });

    const prompt = `Analyze these multimodal inputs and provide a JSON response with:
    1. mainThemes: Array of strings
    2. culturalReferences: Array of objects { reference: string, detectionReason: string }
    3. toneAnalysis: String describing tone and style
    4. suggestedAdaptations: Array of objects { culture: string, advice: string }`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [...parts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
            culturalReferences: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  reference: { type: Type.STRING },
                  detectionReason: { type: Type.STRING }
                }
              } 
            },
            toneAnalysis: { type: Type.STRING },
            suggestedAdaptations: { 
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  culture: { type: Type.STRING },
                  advice: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { error: "Failed to parse analysis" };
    }
  }

  async adaptContent(content: string, sourceCulture: string, targetCulture: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Adapt this content from ${sourceCulture} culture to ${targetCulture} culture.
      Consider:
      - Cultural references and idioms
      - Humor and tone appropriateness
      - Local examples and metaphors
      - Social norms and sensitivities
      
      Content: ${content}
      
      Provide the adapted version.`,
    });
    return response.text || "";
  }

  // --- High Level Orchestration ---

  async localizeContent(
    text: string,
    targetLanguage: TargetLanguage,
    media?: ProjectMedia
  ): Promise<LocalizationResult> {
    const model = 'gemini-3-pro-preview';
    
    const parts: any[] = [
      {
        text: `You are a world-class localization strategist. 
        Adapt the campaign for ${targetLanguage}.
        
        PROTOCOL:
        1. MULTIMODAL CONTEXT: Ensure text and visual sync.
        2. IDIOMATIC EQUIVALENCE: Use natural phrases.
        3. CULTURAL SAFETY: Flag issues (e.g. Test Suite rules).
        4. TONE: Preserve brand status.

        Text: "${text}"
        
        RETURN JSON:
        {
          "translatedText": "translation",
          "culturalNotes": ["note1", "note2"],
          "suggestedVisualChanges": "desc",
          "culturalFlags": [{ "severity": "high"|"medium"|"low", "issue": "desc", "suggestion": "fix" }],
          "brandVoiceCheck": "summary",
          "qualityScore": 0.9
        }`
      }
    ];

    if (media && media.type === 'image') {
      const base64Data = media.content.includes(',') ? media.content.split(',')[1] : media.content;
      parts.push({
        inlineData: {
          mimeType: media.mimeType || 'image/png',
          data: base64Data
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
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }

  async assistantChat(history: ChatMessage[], currentMessage: string, context: LocalizationResult | null): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: currentMessage }] }
      ],
      config: { 
        systemInstruction: `PolyGlot Assistant. Context: ${JSON.stringify(context)}. Task: Mediate feedback and provide cultural advice.` 
      }
    });
    return response.text || "";
  }

  async generateLocalizedImage(prompt: string, originalImageBase64?: string): Promise<string> {
    const parts: any[] = [{ text: `Localized image: ${prompt}` }];
    if (originalImageBase64) {
      const base64Data = originalImageBase64.includes(',') ? originalImageBase64.split(',')[1] : originalImageBase64;
      parts.unshift({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data
        }
      });
    }
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("No image generated");
  }

  async generateTTS(text: string, language: TargetLanguage): Promise<Uint8Array> {
    const voiceMap: Record<string, string> = {
      [TargetLanguage.JAPANESE]: 'Kore',
      [TargetLanguage.SPANISH]: 'Puck',
      [TargetLanguage.FRENCH]: 'Charon',
      [TargetLanguage.GERMAN]: 'Fenrir',
      [TargetLanguage.CHINESE]: 'Kore',
      [TargetLanguage.ARABIC]: 'Zephyr'
    };

    // TRUNCATION FIX: The gemini-2.5-flash-preview-tts model has an input limit.
    // Marketing copy should be snappy anyway. 2500 characters is roughly 5-10 minutes of speech.
    const MAX_TTS_CHARS = 2500;
    const safeText = text.length > MAX_TTS_CHARS ? text.substring(0, MAX_TTS_CHARS) + "..." : text;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: safeText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: voiceMap[language] || 'Puck' 
              } 
            } 
          }
        }
      });
      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) throw new Error("TTS response contained no audio data.");
      return this.decodeBase64(data);
    } catch (err: any) {
      if (err.message?.includes('token count')) {
        throw new Error("The translated content is too long for the current voice synthesizer. Try shorter segments.");
      }
      throw err;
    }
  }

  async generateAndPlayTTS(text: string, language: TargetLanguage, ctx?: AudioContext): Promise<void> {
    if (!text || text.trim().length === 0) return;
    
    try {
      const bytes = await this.generateTTS(text, language);
      const context = ctx || this.audioContext || (this.audioContext = new AudioContext({ sampleRate: 24000 }));
      if (context.state === 'suspended') await context.resume();
      
      const buffer = await decodeAudioData(bytes, context, 24000, 1);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start();
    } catch (err) {
      console.error("Audio playback error:", err);
      throw err;
    }
  }

  private decodeBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
}

/**
 * Decodes raw PCM audio data as required by Gemini 2.5 Flash TTS
 */
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
