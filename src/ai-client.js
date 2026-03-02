/**
 * Multi-Provider AI Client
 * Supports Gemini, OpenAI, Anthropic, and OpenRouter with configurable models.
 */

// ── Provider Definitions ──────────────────────────────────────────────────────

export const PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    icon: '🔷',
    apiKeyUrl: 'https://aistudio.google.com/apikey',
    apiKeyPlaceholder: 'Enter your Gemini API key...',
    defaultModel: 'gemini-2.5-flash',
    models: [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
    ],
  },
  openai: {
    name: 'OpenAI',
    icon: '🟢',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    apiKeyPlaceholder: 'Enter your OpenAI API key (sk-...)...',
    defaultModel: 'gpt-4o-mini',
    models: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4.1-nano',
      'gpt-4.1-mini',
      'gpt-4.1',
      'o4-mini',
    ],
  },
  anthropic: {
    name: 'Anthropic',
    icon: '🟠',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    apiKeyPlaceholder: 'Enter your Anthropic API key (sk-ant-...)...',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      'claude-sonnet-4-20250514',
      'claude-haiku-4-20250514',
      'claude-3-5-haiku-20241022',
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    icon: '🔀',
    apiKeyUrl: 'https://openrouter.ai/keys',
    apiKeyPlaceholder: 'Enter your OpenRouter API key...',
    defaultModel: 'google/gemini-2.5-flash',
    models: [
      'google/gemini-2.5-flash',
      'google/gemini-2.5-pro',
      'openai/gpt-4o-mini',
      'anthropic/claude-sonnet-4',
      'meta-llama/llama-4-maverick',
      'deepseek/deepseek-r1',
    ],
  },
  custom: {
    name: 'Custom / Self-Hosted',
    icon: '🖥️',
    apiKeyUrl: '',
    apiKeyPlaceholder: 'API key (or leave blank if not required)...',
    defaultModel: '',
    models: [],
    customBaseUrl: true,
  },
};

// ── Config Persistence ────────────────────────────────────────────────────────

/**
 * Get the full AI configuration from localStorage.
 * @returns {{ provider: string, apiKey: string, model: string }}
 */
export function getAIConfig() {
  const raw = localStorage.getItem('ai_config');
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }

  // Migration: check for old gemini_api_key
  const legacyKey = localStorage.getItem('gemini_api_key');
  if (legacyKey) {
    const config = { provider: 'gemini', apiKey: legacyKey, model: 'gemini-2.5-flash' };
    saveAIConfig(config);
    localStorage.removeItem('gemini_api_key');
    return config;
  }

  return { provider: 'gemini', apiKey: '', model: PROVIDERS.gemini.defaultModel };
}

/**
 * Save AI configuration.
 */
export function saveAIConfig(config) {
  localStorage.setItem('ai_config', JSON.stringify(config));
}

/**
 * Check if an API key is configured.
 */
export function hasApiKey() {
  return getAIConfig().apiKey.length > 0;
}

// Backward-compatible exports for other modules
export function getApiKey() {
  return getAIConfig().apiKey;
}

export function setApiKey(key) {
  const config = getAIConfig();
  config.apiKey = key.trim();
  saveAIConfig(config);
}

// ── Provider-Specific API Calls ───────────────────────────────────────────────

/**
 * Call the configured AI provider with a prompt, expecting JSON back.
 */
async function callAI(prompt) {
  const config = getAIConfig();
  if (!config.apiKey) throw new Error('No API key configured. Open Settings to add one.');

  switch (config.provider) {
    case 'gemini':    return callGemini(config, prompt);
    case 'openai':    return callOpenAI(config, prompt);
    case 'anthropic': return callAnthropic(config, prompt);
    case 'openrouter': return callOpenRouter(config, prompt);
    case 'custom':    return callCustom(config, prompt);
    default: throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Google Gemini API
 */
async function callGemini(config, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini.');
  return JSON.parse(text);
}

/**
 * OpenAI-compatible API (also used by OpenRouter)
 */
async function callOpenAICompatible(url, apiKey, model, prompt, extraHeaders = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt + '\n\nRespond ONLY with valid JSON, no markdown code fences.' }],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from API.');

  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function callOpenAI(config, prompt) {
  return callOpenAICompatible(
    'https://api.openai.com/v1/chat/completions',
    config.apiKey,
    config.model,
    prompt,
  );
}

async function callOpenRouter(config, prompt) {
  return callOpenAICompatible(
    'https://openrouter.ai/api/v1/chat/completions',
    config.apiKey,
    config.model,
    prompt,
    { 'HTTP-Referer': window.location.origin, 'X-Title': 'Daily Dev Quiz' },
  );
}

/**
 * Custom / Self-Hosted OpenAI-compatible API (Ollama, LM Studio, vLLM, etc.)
 */
async function callCustom(config, prompt) {
  const baseUrl = (config.customBaseUrl || '').replace(/\/$/, '');
  if (!baseUrl) throw new Error('No base URL set for custom provider. Configure it in Settings.');
  return callOpenAICompatible(
    `${baseUrl}/v1/chat/completions`,
    config.apiKey,
    config.model,
    prompt,
  );
}

/**
 * Anthropic Messages API
 */
async function callAnthropic(config, prompt) {
  // Anthropic requires CORS proxy or a backend — for client-side, we go through their API
  // Note: Direct browser calls to Anthropic may be blocked by CORS.
  // In that case, users should use OpenRouter with an Anthropic model instead.
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt + '\n\nRespond ONLY with valid JSON, no markdown code fences.' }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Anthropic.');

  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ── Public API (unchanged signatures) ─────────────────────────────────────────

/**
 * Generate quiz questions using the configured AI provider.
 */
export async function generateQuestions(category = 'all', count = 5) {
  const categoryInstruction =
    category === 'all'
      ? 'a mix of programming concepts (algorithms, data structures, languages, design patterns) and Linux/Unix administration (commands, configuration, networking, shell scripting)'
      : category === 'programming'
        ? 'programming concepts such as algorithms, data structures, programming languages, design patterns, and software engineering'
        : 'Linux/Unix system administration such as commands, configuration files, networking, shell scripting, and system tools';

  const prompt = `You are a quiz generator for programmers. Generate exactly ${count} quiz questions about ${categoryInstruction}.

Rules:
- Mix question types: approximately 60% multiple-choice and 40% essay/short-answer
- For multiple-choice: provide exactly 4 options with one correct answer
- For essay: the answer should be a short explanation (1-3 sentences)
- Questions should range from beginner to intermediate difficulty
- Each question must have a unique id (use q1, q2, q3, etc.)
- Include a "category" field: either "programming" or "linux"
- Include a "difficulty" field: "easy", "medium", or "hard"

Return a JSON array with this exact structure:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "category": "programming",
    "difficulty": "medium",
    "question": "What is the time complexity of binary search?",
    "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    "correctAnswer": 1,
    "explanation": "Binary search divides the search space in half with each step, giving O(log n) complexity."
  },
  {
    "id": "q2",
    "type": "essay",
    "category": "linux",
    "difficulty": "easy",
    "question": "Explain the difference between hard links and soft links in Linux.",
    "sampleAnswer": "A hard link points directly to the inode of a file, while a soft (symbolic) link points to the file path. Hard links share the same inode and data, while soft links can break if the target is deleted.",
    "explanation": "Understanding file linking is fundamental to Linux filesystem management."
  }
]`;

  return callAI(prompt);
}

/**
 * Check an essay answer using the configured AI provider.
 */
export async function checkEssayAnswer(question, userAnswer) {
  const prompt = `You are a programming quiz grader. Evaluate the following answer.

Question: ${question.question}
Expected answer (reference): ${question.sampleAnswer}
User's answer: ${userAnswer}

Grade the answer and provide feedback. Return a JSON object with this exact structure:
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "Detailed feedback explaining what was correct and what could be improved.",
  "correctAnswer": "The ideal answer for reference."
}

Be fair but accurate. A partially correct answer should get partial credit (30-70 score). 
An answer is "correct" (isCorrect: true) if the score is >= 60.
Provide constructive, encouraging feedback.`;

  return callAI(prompt);
}
