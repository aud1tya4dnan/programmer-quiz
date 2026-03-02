/**
 * Gemini AI Client
 * Handles all interactions with the Gemini API for question generation and essay checking.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Get the stored API key from localStorage.
 */
export function getApiKey() {
  return localStorage.getItem('gemini_api_key') || '';
}

/**
 * Save API key to localStorage.
 */
export function setApiKey(key) {
  localStorage.setItem('gemini_api_key', key.trim());
}

/**
 * Check if an API key is configured.
 */
export function hasApiKey() {
  return getApiKey().length > 0;
}

/**
 * Call the Gemini API with a prompt.
 */
async function callGemini(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No Gemini API key configured.');

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
 * Generate quiz questions using Gemini.
 * @param {string} category - 'all', 'programming', or 'linux'
 * @param {number} count - number of questions to generate
 * @returns {Promise<Array>} array of question objects
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

  return callGemini(prompt);
}

/**
 * Check an essay answer using Gemini.
 * @param {object} question - the question object
 * @param {string} userAnswer - the user's answer text
 * @returns {Promise<object>} evaluation result
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

  return callGemini(prompt);
}
