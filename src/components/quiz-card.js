/**
 * Quiz Card Component
 * Renders individual quiz questions with answer inputs and feedback.
 */

import { checkMultipleChoice, checkEssay, submitAnswer } from '../quiz-engine.js';

/**
 * Create a quiz card element for a question.
 * @param {object} question
 * @param {number} index - question number (0-based)
 * @param {function} onReport - callback when user clicks "Report Issue"
 * @returns {HTMLElement}
 */
export function createQuizCard(question, index, onReport) {
  const card = document.createElement('div');
  card.className = `quiz-card ${question.category}`;
  card.id = `card-${question.id}`;

  const difficultyColors = { easy: '🟢', medium: '🟡', hard: '🔴' };

  card.innerHTML = `
    <div class="card-header">
      <span class="question-number">Q${index + 1}</span>
      <div class="card-badges">
        <span class="badge badge-category">${question.category === 'programming' ? '💻' : '🐧'} ${question.category}</span>
        <span class="badge badge-difficulty">${difficultyColors[question.difficulty]} ${question.difficulty}</span>
      </div>
    </div>
    <div class="card-body">
      <p class="question-text">${escapeHtml(question.question)}</p>
      <div class="answer-area" id="answer-${question.id}"></div>
    </div>
    <div class="card-footer">
      <button class="btn btn-primary btn-submit" id="submit-${question.id}" disabled>
        Submit Answer
      </button>
      <button class="btn btn-ghost btn-report" data-question-id="${question.id}">
        🚩 Report Issue
      </button>
    </div>
    <div class="card-result" id="result-${question.id}" style="display: none;"></div>
  `;

  const answerArea = card.querySelector(`#answer-${question.id}`);
  const submitBtn = card.querySelector(`#submit-${question.id}`);
  const reportBtn = card.querySelector('.btn-report');

  // Render answer input based on type
  if (question.type === 'multiple-choice') {
    renderMultipleChoice(answerArea, question, submitBtn);
  } else {
    renderEssayInput(answerArea, question, submitBtn);
  }

  // Submit handler
  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-small"></span> Checking...';

    await handleSubmit(question, card);
  });

  // Report handler
  reportBtn.addEventListener('click', () => onReport(question));

  return card;
}

/**
 * Render multiple-choice radio buttons.
 */
function renderMultipleChoice(container, question, submitBtn) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'options-group';

  question.options.forEach((option, i) => {
    const label = document.createElement('label');
    label.className = 'option-label';
    label.innerHTML = `
      <input type="radio" name="option-${question.id}" value="${i}" />
      <span class="option-radio"></span>
      <span class="option-text">${escapeHtml(option)}</span>
    `;
    fieldset.appendChild(label);
  });

  container.appendChild(fieldset);

  // Enable submit when an option is selected
  fieldset.addEventListener('change', () => {
    submitBtn.disabled = false;
  });
}

/**
 * Render essay text area.
 */
function renderEssayInput(container, question, submitBtn) {
  const wrapper = document.createElement('div');
  wrapper.className = 'essay-wrapper';
  wrapper.innerHTML = `
    <textarea
      class="essay-input"
      id="essay-${question.id}"
      placeholder="Type your answer here..."
      rows="4"
    ></textarea>
    <div class="char-count"><span id="chars-${question.id}">0</span> characters</div>
  `;
  container.appendChild(wrapper);

  const textarea = wrapper.querySelector('textarea');
  const charCount = wrapper.querySelector(`#chars-${question.id}`);

  textarea.addEventListener('input', () => {
    charCount.textContent = textarea.value.length;
    submitBtn.disabled = textarea.value.trim().length === 0;
  });
}

/**
 * Handle answer submission.
 */
async function handleSubmit(question, card) {
  const resultDiv = card.querySelector(`#result-${question.id}`);
  const submitBtn = card.querySelector(`#submit-${question.id}`);

  try {
    let result;

    if (question.type === 'multiple-choice') {
      const selected = card.querySelector(`input[name="option-${question.id}"]:checked`);
      if (!selected) return;
      const selectedIndex = parseInt(selected.value);
      submitAnswer(question.id, selectedIndex);
      result = checkMultipleChoice(question, selectedIndex);

      // Highlight correct/incorrect options
      const options = card.querySelectorAll(`.option-label`);
      options.forEach((opt, i) => {
        const input = opt.querySelector('input');
        input.disabled = true;
        if (i === question.correctAnswer) {
          opt.classList.add('option-correct');
        } else if (i === selectedIndex && !result.isCorrect) {
          opt.classList.add('option-incorrect');
        }
      });

      renderResult(resultDiv, {
        isCorrect: result.isCorrect,
        feedback: result.explanation,
        score: result.isCorrect ? 100 : 0,
      });
    } else {
      // Essay
      const textarea = card.querySelector(`#essay-${question.id}`);
      const answer = textarea.value.trim();
      submitAnswer(question.id, answer);
      textarea.disabled = true;

      result = await checkEssay(question, answer);

      renderResult(resultDiv, {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        score: result.score,
        correctAnswer: result.correctAnswer,
      });
    }
  } catch (err) {
    renderResult(resultDiv, {
      isCorrect: false,
      feedback: `Error checking answer: ${err.message}`,
      score: 0,
    });
  }

  submitBtn.style.display = 'none';
  resultDiv.style.display = 'block';
  card.classList.add('answered');
}

/**
 * Render the result feedback.
 */
function renderResult(container, { isCorrect, feedback, score, correctAnswer }) {
  const scoreClass = score >= 60 ? 'good' : score >= 30 ? 'partial' : 'wrong';
  container.innerHTML = `
    <div class="result ${scoreClass}">
      <div class="result-header">
        <span class="result-icon">${isCorrect ? '✅' : '❌'}</span>
        <span class="result-label">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
        ${score !== undefined ? `<span class="result-score">${score}/100</span>` : ''}
      </div>
      <p class="result-feedback">${escapeHtml(feedback)}</p>
      ${correctAnswer ? `<div class="result-answer"><strong>Reference answer:</strong> ${escapeHtml(correctAnswer)}</div>` : ''}
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS.
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
