# ⚡ Daily Dev Quiz

A daily programming and Linux configuration quiz app to sharpen your developer skills — one question at a time.

Built with **Vite + vanilla JS**, styled in **neobrutalism**, powered by your choice of **AI provider** for question generation and essay grading.

![Quiz with questions loaded](docs/images/02-quiz-loaded.png)

---

## ✨ Features

- **AI-generated questions** — programming concepts, algorithms, Linux commands, shell scripting & more
- **Multiple AI providers** — Google Gemini, OpenAI, Anthropic, OpenRouter, or any custom/self-hosted endpoint
- **Multiple-choice** — radio button selection with instant correct/incorrect feedback
- **Essay answers** — free-text input with AI-powered grading and constructive feedback
- **Report issues** — flag wrong answers, unclear questions, or AI hallucinations
- **Fallback mode** — works without an API key using built-in questions
- **Settings panel** — configure API key, question count, categories, and optional database
- **Neobrutalism UI** — bold borders, solid shadows, light blue gradient, Poppins font

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (opens http://localhost:3000)
npm run dev
```

### Enable AI Features (optional)

1. Open **Settings** ⚙️ in the app
2. Select your AI **provider** (Gemini, OpenAI, Anthropic, OpenRouter, or Custom)
3. Paste your **API key** and choose a **model**
4. For self-hosted models (Ollama, LM Studio), select **Custom / Self-Hosted** and enter your base URL

Without an API key, the app uses built-in fallback questions.

---

## 📖 Usage Guide

### 1. Start Screen

When you first open the app, you'll see the empty state prompting you to generate a quiz.

![Empty state](docs/images/01-empty-state.png)

### 2. Generate a Quiz

Select a category (**All**, **Programming**, or **Linux**) and click **"Generate Quiz"**. Questions load as cards with badges showing category and difficulty.

![Quiz loaded](docs/images/02-quiz-loaded.png)

### 3. Answer Questions

- **Multiple-choice**: Select a radio button and click **Submit Answer**. The correct answer highlights green, wrong answers highlight red, and an explanation is shown.
- **Essay**: Type your answer in the text area and submit. With an API key, Gemini grades your answer (0–100) with detailed feedback.

![Answer feedback](docs/images/03-answer-feedback.png)

### 4. Configure Settings

Click **Settings** ⚙️ to manage:
- **AI Provider** — choose from Google Gemini, OpenAI, Anthropic, OpenRouter, or Custom / Self-Hosted
- **API Key** — required for AI features (each provider links to where to get a key)
- **Model** — pick from preset models or enter a custom model name
- **Base URL** — for custom/self-hosted endpoints (Ollama, LM Studio, vLLM, etc.)
- **Quiz Preferences** — number of questions per quiz, default category
- **Database** — toggle between localStorage (default) and Supabase for long-term persistence

![Settings panel](docs/images/04-settings.png)

### 5. Report Bad Questions

Click **🚩 Report Issue** on any question card to flag problems:
- Wrong/incorrect answer
- Unclear or ambiguous question
- AI hallucination (made-up facts)
- Other issues with free-text comment

![Feedback modal](docs/images/05-feedback.png)

---

## ⚙️ Configuration

| Setting | Location | Description |
|---------|----------|-------------|
| Provider | Settings → AI Provider | Gemini, OpenAI, Anthropic, OpenRouter, or Custom |
| API Key | Settings → API Key | Required for AI features; each provider has a keyed link |
| Model | Settings → Model | Preset models or custom model name input |
| Base URL | Settings → Base URL | For custom/self-hosted endpoints only |
| Questions per quiz | Settings → Preferences | 3, 5, 8, or 10 questions |
| Default category | Settings → Preferences | All, Programming, or Linux |
| Storage backend | Settings → Database | localStorage (default) or Supabase |

---

## 📁 Project Structure

```
programmer-quiz/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration
├── .gitignore
├── docs/
│   └── images/                   # Documentation screenshots
├── src/
│   ├── main.js                   # App entry point
│   ├── ai-client.js              # Gemini API wrapper
│   ├── quiz-engine.js            # Quiz state, scoring, fallback questions
│   ├── style.css                 # Neobrutalism CSS theme
│   └── components/
│       ├── quiz-card.js           # Question card (MC / essay)
│       ├── settings-panel.js      # API key, prefs, DB config
│       └── feedback-modal.js      # Report issue modal
└── .agents/
    ├── SKILL.md                   # Project skill metadata
    └── skills/
        └── documentation/
            └── SKILL.md           # Documentation skill
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|--------|
| Vite | Dev server & build tool |
| Vanilla JS | No framework — lightweight & fast |
| Poppins | Body font (Google Fonts) |
| Monospace | Code sections & scores |
| Gemini / OpenAI / Anthropic / OpenRouter | AI question generation & essay grading |
| Custom / Self-Hosted | Ollama, LM Studio, vLLM, or any OpenAI-compatible API |
| localStorage | Default client-side storage |
| Supabase (optional) | Cloud PostgreSQL for persistence |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.