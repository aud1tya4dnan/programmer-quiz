---
name: programmer-quiz
description: Daily programming and Linux configuration quiz with AI-powered question generation and essay checking
---

# Programmer Quiz

A single-page quiz app for daily programming and Linux configuration questions. AI-generated questions, multiple-choice & essay answers, AI-powered grading, and human feedback reporting.

## Tech Stack

- **Runtime**: Vite + vanilla JavaScript (no framework)
- **Fonts**: Poppins (body), monospace (code sections)
- **Theme**: Neobrutalism — bold borders, solid shadows, light blue gradient
- **AI**: Gemini API (client-side, requires API key)
- **Storage**: localStorage (default), optional Supabase

## When to use

Use this skill when working on the quiz application — adding features, modifying the UI, or updating quiz logic.

## Project Structure

```
src/
├── main.js                  # App entry point
├── ai-client.js             # Gemini API wrapper
├── quiz-engine.js           # Quiz state, scoring, fallback questions
├── style.css                # Neobrutalism CSS theme
└── components/
    ├── quiz-card.js          # Question card (MC/essay)
    ├── settings-panel.js     # API key, prefs, DB config
    └── feedback-modal.js     # Report bad questions
```

## Instructions

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the Vite dev server on port 3000
3. Open Settings (⚙️) to add a Gemini API key for AI features
4. Click "Generate Quiz" to load questions
5. Without API key, fallback questions are used
