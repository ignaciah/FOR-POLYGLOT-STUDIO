# 🌍 PolyGlot Studio

> **AI-Powered Multimodal Content Localization Platform**

PolyGlot Studio is a professional-grade platform designed to transform marketing campaigns and content across languages and cultures. Unlike traditional translation tools, PolyGlot Studio uses a **multimodal approach**, adapting text, visuals, and audio simultaneously to ensure cultural resonance and brand consistency worldwide.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Powered by Gemini](https://img.shields.io/badge/AI-Gemini_3-orange.svg)
![React](https://img.shields.io/badge/Frontend-React_19-61DAFB.svg?logo=react)

## 🚀 Core Capabilities

- **Multimodal Context Awareness**: Localizes text while considering uploaded visual or audio context using the `gemini-3-pro-preview` model.
- **Visual Synthesis & Adaptation**: Generates or modifies imagery to suit local cultural norms using `gemini-2.5-flash-image`.
- **Sonic Branding Bridge**: Synthesizes localized voice-overs in multiple languages (Japanese, Spanish, French, German, etc.) with `gemini-2.5-flash-preview-tts`.
- **Cultural Intelligence Engine**: 
  - **Safety Flags**: Automatically detects and warns about cultural sensitivities.
  - **Quality Scoring**: Provides an "Adaptation Score" for every localization project.
  - **Rationale**: Explains the "why" behind specific cultural adaptations.
- **Visual Scene Intelligence**: Decodes source assets to identify core themes, cultural markers, and tone before translation begins.
- **Interactive AI Assistant**: A dedicated chat interface to iterate on translations and ask for specific cultural advice.

## 🛠 Tech Stack

- **Framework**: React 19 (ESM via Import Maps)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner (Rich Toast Notifications)
- **Intelligence**: [Google Gemini API (@google/genai)](https://ai.google.dev/)
  - `gemini-3-pro-preview`: Strategic reasoning and text localization.
  - `gemini-3-flash-preview`: Fast assistant chat responses.
  - `gemini-2.5-flash-image`: Visual asset mutation.
  - `gemini-2.5-flash-preview-tts`: High-fidelity speech synthesis.

## 📂 Project Architecture

```text
.
├── components/
│   ├── Editor/           # Multimodal TextEditor and ImageProcessor engine
│   ├── Layout/           # Global Header and Workspace Sidebar
│   ├── AssistantSidebar  # Real-time AI collaboration chat
│   └── MediaPreview      # Multimodal asset preview components
├── services/
│   └── geminiService.ts  # Orchestration layer for all Gemini API calls
├── types.ts              # Shared TypeScript interfaces and enums
├── App.tsx               # Main application state and layout orchestration
├── index.html            # Entry point with modern Import Maps
└── metadata.json         # Project identity and permissions
```

## ⚙️ Getting Started

1. **API Key**: Ensure you have a valid Gemini API Key.
2. **Environment**: The application requires `process.env.API_KEY` to be set in the execution environment.
3. **Usage**: 
   - Paste your source copy in the **Multimodal Editor**.
   - Upload a visual asset to provide **Visual Context**.
   - Click **Translate & Adapt** to begin the multimodal synthesis.
   - Review the **Cultural Intelligence** panel for safety flags.

## 🎨 Design Philosophy

PolyGlot Studio features a modern "SaaS-Plus" aesthetic:
- **Glassmorphism**: Subtle blurs and semi-transparent backgrounds for a premium feel.
- **Micro-interactions**: Animated transitions, pulse states during AI processing, and hover-scales.
- **Information Density**: A clean sidebar-driven layout that manages complex multimodal data without overwhelming the user.

---

*Developed by the PolyGlot Engineering Team. Powered by Google Gemini.*
