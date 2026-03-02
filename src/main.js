/**
 * Main Application
 * Wires up the quiz engine, UI components, and user interactions.
 */

import './style.css';
import { loadQuiz } from './quiz-engine.js';
import { createQuizCard } from './components/quiz-card.js';
import { renderSettingsPanel } from './components/settings-panel.js';
import { renderFeedbackModal } from './components/feedback-modal.js';

// ── DOM References ────────────────────────────────────────────────────────────

const settingsBtn = document.getElementById('settings-btn');
const generateBtn = document.getElementById('generate-btn');
const quizContainer = document.getElementById('quiz-questions');
const quizLoading = document.getElementById('quiz-loading');
const quizEmpty = document.getElementById('quiz-empty');
const settingsModal = document.getElementById('settings-modal');
const feedbackModal = document.getElementById('feedback-modal');
const categoryBadges = document.querySelectorAll('.category-badges .badge');

let activeCategory = 'all';

// ── Category Selection ────────────────────────────────────────────────────────

categoryBadges.forEach((badge) => {
  badge.addEventListener('click', () => {
    categoryBadges.forEach((b) => b.classList.remove('badge-active'));
    badge.classList.add('badge-active');
    activeCategory = badge.dataset.category;
  });
});

// ── Generate Quiz ─────────────────────────────────────────────────────────────

generateBtn.addEventListener('click', () => generateQuiz());

async function generateQuiz() {
  const prefs = JSON.parse(localStorage.getItem('quiz_prefs') || '{"count":5}');
  const count = prefs.count || 5;

  // Show loading
  quizEmpty.style.display = 'none';
  quizContainer.style.display = 'none';
  quizLoading.style.display = 'flex';
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="spinner-small"></span> Generating...';

  try {
    const questions = await loadQuiz(activeCategory, count);

    // Render question cards
    quizContainer.innerHTML = '';
    questions.forEach((q, i) => {
      const card = createQuizCard(q, i, openFeedbackModal);
      quizContainer.appendChild(card);
    });

    quizLoading.style.display = 'none';
    quizContainer.style.display = 'flex';
  } catch (err) {
    quizLoading.style.display = 'none';
    quizEmpty.style.display = 'flex';
    quizEmpty.innerHTML = `
      <div class="empty-icon">⚠️</div>
      <h2>Something went wrong</h2>
      <p>${err.message}</p>
    `;
  }

  generateBtn.disabled = false;
  generateBtn.innerHTML = '<span class="icon">🎲</span> Generate Quiz';
}

// ── Settings Modal ────────────────────────────────────────────────────────────

settingsBtn.addEventListener('click', () => openSettingsModal());

function openSettingsModal() {
  const content = settingsModal.querySelector('.modal-content');
  renderSettingsPanel(content, () => closeModal(settingsModal));
  openModal(settingsModal);
}

// ── Feedback Modal ────────────────────────────────────────────────────────────

function openFeedbackModal(question) {
  const content = feedbackModal.querySelector('.modal-content');
  renderFeedbackModal(content, question, () => closeModal(feedbackModal));
  openModal(feedbackModal);
}

// ── Modal Helpers ─────────────────────────────────────────────────────────────

function openModal(modal) {
  modal.style.display = 'flex';
  document.body.classList.add('modal-open');

  // Close on backdrop click
  const backdrop = modal.querySelector('.modal-backdrop');
  backdrop.onclick = () => closeModal(modal);

  // Close on Escape
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal(modal);
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

function closeModal(modal) {
  modal.style.display = 'none';
  document.body.classList.remove('modal-open');
}
