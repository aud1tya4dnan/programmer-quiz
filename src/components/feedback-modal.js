/**
 * Feedback Modal Component
 * Allows users to report issues with quiz questions (wrong answer, AI hallucination, etc.)
 */

import { submitFeedback } from '../quiz-engine.js';

/**
 * Render the feedback modal for a specific question.
 * @param {HTMLElement} container - the modal content element
 * @param {object} question - the question being reported
 * @param {function} onClose - callback for closing the modal
 */
export function renderFeedbackModal(container, question, onClose) {
  container.innerHTML = `
    <div class="feedback-panel">
      <div class="feedback-header">
        <h2>🚩 Report Issue</h2>
        <button class="btn btn-ghost btn-close" id="feedback-close">✕</button>
      </div>

      <div class="feedback-body">
        <div class="feedback-question">
          <strong>Question:</strong>
          <p>${escapeHtml(question.question)}</p>
        </div>

        <div class="feedback-types">
          <p><strong>What's wrong?</strong> (select all that apply)</p>
          <label class="checkbox-label">
            <input type="checkbox" name="feedback-type" value="wrong-answer" />
            <span class="checkbox-box"></span>
            ❌ Wrong/incorrect answer
          </label>
          <label class="checkbox-label">
            <input type="checkbox" name="feedback-type" value="unclear" />
            <span class="checkbox-box"></span>
            😕 Unclear or ambiguous question
          </label>
          <label class="checkbox-label">
            <input type="checkbox" name="feedback-type" value="hallucination" />
            <span class="checkbox-box"></span>
            🤖 AI hallucination (made-up facts)
          </label>
          <label class="checkbox-label">
            <input type="checkbox" name="feedback-type" value="other" />
            <span class="checkbox-box"></span>
            📝 Other
          </label>
        </div>

        <div class="feedback-comment">
          <label for="feedback-text"><strong>Additional details</strong> (optional)</label>
          <textarea
            id="feedback-text"
            class="input"
            placeholder="Explain the issue or suggest a correction..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="feedback-footer">
        <button class="btn btn-primary" id="feedback-submit">Submit Report</button>
        <button class="btn btn-outline" id="feedback-cancel">Cancel</button>
      </div>
    </div>
  `;

  // Submit
  container.querySelector('#feedback-submit').addEventListener('click', () => {
    const types = Array.from(container.querySelectorAll('input[name="feedback-type"]:checked')).map(
      (cb) => cb.value,
    );
    const comment = container.querySelector('#feedback-text').value.trim();

    if (types.length === 0 && !comment) {
      // Require at least one selection or a comment
      container.querySelector('.feedback-types').classList.add('shake');
      setTimeout(() => container.querySelector('.feedback-types').classList.remove('shake'), 600);
      return;
    }

    submitFeedback(question.id, { types, comment });

    // Show confirmation
    container.innerHTML = `
      <div class="feedback-panel">
        <div class="feedback-confirm">
          <span class="confirm-icon">✅</span>
          <h3>Report submitted</h3>
          <p>Thank you for your feedback! This helps improve question quality.</p>
          <button class="btn btn-primary" id="feedback-done">Done</button>
        </div>
      </div>
    `;
    container.querySelector('#feedback-done').addEventListener('click', onClose);
  });

  // Cancel & close
  container.querySelector('#feedback-cancel').addEventListener('click', onClose);
  container.querySelector('#feedback-close').addEventListener('click', onClose);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
