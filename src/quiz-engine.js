/**
 * Quiz Engine
 * Manages quiz state, question flow, scoring, and feedback storage.
 */

import { generateQuestions, checkEssayAnswer, hasApiKey } from './ai-client.js';

// ── Fallback Questions (used when no API key is set) ──────────────────────────

const FALLBACK_QUESTIONS = [
  {
    id: 'f1',
    type: 'multiple-choice',
    category: 'programming',
    difficulty: 'easy',
    question: 'Which data structure uses FIFO (First In, First Out) ordering?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswer: 1,
    explanation: 'A Queue follows FIFO — the first element added is the first one removed.',
  },
  {
    id: 'f2',
    type: 'multiple-choice',
    category: 'linux',
    difficulty: 'easy',
    question: 'Which command is used to change file permissions in Linux?',
    options: ['chown', 'chmod', 'chgrp', 'chattr'],
    correctAnswer: 1,
    explanation: 'chmod (change mode) modifies file access permissions for owner, group, and others.',
  },
  {
    id: 'f3',
    type: 'essay',
    category: 'programming',
    difficulty: 'medium',
    question: 'Explain the difference between a stack and a heap in memory management.',
    sampleAnswer: 'The stack is used for static memory allocation and stores local variables and function calls in LIFO order. The heap is used for dynamic memory allocation where variables are allocated and freed in any order. Stack memory is faster but limited in size, while heap memory is larger but slower to access.',
    explanation: 'Understanding memory management is crucial for writing efficient programs.',
  },
  {
    id: 'f4',
    type: 'multiple-choice',
    category: 'linux',
    difficulty: 'medium',
    question: 'What does the command `grep -r "pattern" /etc/` do?',
    options: [
      'Searches for "pattern" only in /etc/ directory',
      'Recursively searches for "pattern" in /etc/ and all subdirectories',
      'Replaces "pattern" in all files under /etc/',
      'Counts occurrences of "pattern" in /etc/',
    ],
    correctAnswer: 1,
    explanation: 'The -r flag makes grep search recursively through all files in the directory and its subdirectories.',
  },
  {
    id: 'f5',
    type: 'essay',
    category: 'linux',
    difficulty: 'easy',
    question: 'What is the purpose of the /etc/fstab file in Linux?',
    sampleAnswer: 'The /etc/fstab file contains information about disk drives and partitions, specifying how they should be mounted at boot time. It defines the mount point, filesystem type, and mount options for each partition.',
    explanation: '/etc/fstab is essential for persistent filesystem mounting in Linux.',
  },
  {
    id: 'f6',
    type: 'multiple-choice',
    category: 'programming',
    difficulty: 'hard',
    question: 'What is the worst-case time complexity of QuickSort?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    correctAnswer: 2,
    explanation: 'QuickSort degrades to O(n²) when the pivot selection consistently produces unbalanced partitions, such as when the array is already sorted.',
  },
];

// ── Quiz State ────────────────────────────────────────────────────────────────

let currentQuestions = [];
let userAnswers = {};

export function getCurrentQuestions() {
  return currentQuestions;
}

export function getUserAnswers() {
  return { ...userAnswers };
}

/**
 * Load a new quiz.
 * @param {string} category - 'all', 'programming', or 'linux'
 * @param {number} count - number of questions
 * @returns {Promise<Array>} questions
 */
export async function loadQuiz(category = 'all', count = 5) {
  userAnswers = {};

  if (hasApiKey()) {
    currentQuestions = await generateQuestions(category, count);
  } else {
    // Use fallback questions, filtered by category
    let pool = [...FALLBACK_QUESTIONS];
    if (category !== 'all') {
      pool = pool.filter((q) => q.category === category);
    }
    // Shuffle and pick
    pool.sort(() => Math.random() - 0.5);
    currentQuestions = pool.slice(0, Math.min(count, pool.length));
  }

  return currentQuestions;
}

/**
 * Submit an answer for a question.
 * @param {string} questionId
 * @param {*} answer - index for multiple-choice, string for essay
 */
export function submitAnswer(questionId, answer) {
  userAnswers[questionId] = answer;
}

/**
 * Check a multiple-choice answer.
 * @param {object} question
 * @param {number} selectedIndex
 * @returns {{ isCorrect: boolean, correctAnswer: number, explanation: string }}
 */
export function checkMultipleChoice(question, selectedIndex) {
  return {
    isCorrect: selectedIndex === question.correctAnswer,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  };
}

/**
 * Check an essay answer via AI.
 * @param {object} question
 * @param {string} answer
 * @returns {Promise<object>}
 */
export async function checkEssay(question, answer) {
  if (!hasApiKey()) {
    // Without API key, provide a basic comparison
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Essay checking requires a Gemini API key. Configure it in Settings to get AI-powered feedback.',
      correctAnswer: question.sampleAnswer,
    };
  }
  return checkEssayAnswer(question, answer);
}

/**
 * Calculate the current score (multiple-choice only, essays are async).
 */
export function calculateScore() {
  let correct = 0;
  let total = 0;

  for (const q of currentQuestions) {
    if (q.type === 'multiple-choice' && userAnswers[q.id] !== undefined) {
      total++;
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    }
  }

  return { correct, total };
}

// ── Feedback Storage ──────────────────────────────────────────────────────────

/**
 * Submit feedback for a question.
 * @param {string} questionId
 * @param {object} feedback - { types: string[], comment: string }
 */
export function submitFeedback(questionId, feedback) {
  const feedbackLog = JSON.parse(localStorage.getItem('quiz_feedback') || '[]');
  feedbackLog.push({
    questionId,
    ...feedback,
    timestamp: new Date().toISOString(),
    question: currentQuestions.find((q) => q.id === questionId)?.question || '',
  });
  localStorage.setItem('quiz_feedback', JSON.stringify(feedbackLog));
}

/**
 * Get all stored feedback.
 */
export function getFeedbackLog() {
  return JSON.parse(localStorage.getItem('quiz_feedback') || '[]');
}
