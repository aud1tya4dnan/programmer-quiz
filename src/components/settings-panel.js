/**
 * Settings Panel Component
 * Manages API key, quiz preferences, and optional database configuration.
 */

import { getApiKey, setApiKey, hasApiKey } from '../ai-client.js';

/**
 * Render the settings panel into the modal.
 * @param {HTMLElement} container - the modal content element
 * @param {function} onClose - callback for closing the modal
 */
export function renderSettingsPanel(container, onClose) {
  const currentKey = getApiKey();
  const dbConfig = JSON.parse(localStorage.getItem('db_config') || '{}');
  const quizPrefs = JSON.parse(localStorage.getItem('quiz_prefs') || '{"count":5,"category":"all"}');

  container.innerHTML = `
    <div class="settings-panel">
      <div class="settings-header">
        <h2>⚙️ Settings</h2>
        <button class="btn btn-ghost btn-close" id="settings-close">✕</button>
      </div>

      <div class="settings-body">
        <!-- API Key Section -->
        <section class="settings-section">
          <h3>🔑 Gemini API Key</h3>
          <p class="settings-desc">Required for AI-generated questions and essay checking. Get your key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>.</p>
          <div class="input-group">
            <input
              type="password"
              id="api-key-input"
              class="input"
              placeholder="Enter your Gemini API key..."
              value="${escapeAttr(currentKey)}"
            />
            <button class="btn btn-outline" id="toggle-key-visibility">👁️</button>
          </div>
          <div class="api-status ${hasApiKey() ? 'status-active' : 'status-inactive'}">
            ${hasApiKey() ? '✅ API key configured' : '⚠️ No API key — using fallback questions'}
          </div>
        </section>

        <!-- Quiz Preferences -->
        <section class="settings-section">
          <h3>📝 Quiz Preferences</h3>
          <div class="form-row">
            <label for="quiz-count">Questions per quiz</label>
            <select id="quiz-count" class="input input-select">
              ${[3, 5, 8, 10].map((n) => `<option value="${n}" ${quizPrefs.count === n ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
          </div>
          <div class="form-row">
            <label for="quiz-category">Default category</label>
            <select id="quiz-category" class="input input-select">
              <option value="all" ${quizPrefs.category === 'all' ? 'selected' : ''}>All Topics</option>
              <option value="programming" ${quizPrefs.category === 'programming' ? 'selected' : ''}>Programming</option>
              <option value="linux" ${quizPrefs.category === 'linux' ? 'selected' : ''}>Linux</option>
            </select>
          </div>
        </section>

        <!-- Database Configuration -->
        <section class="settings-section">
          <h3>🗄️ Database (Optional)</h3>
          <p class="settings-desc">Connect a personal database for long-term storage of quiz history and feedback. Leave empty to use browser localStorage.</p>
          <div class="form-row">
            <label>Storage backend</label>
            <div class="toggle-group">
              <label class="toggle-label">
                <input type="radio" name="storage-type" value="local" ${!dbConfig.type || dbConfig.type === 'local' ? 'checked' : ''} />
                <span class="toggle-btn">💾 localStorage</span>
              </label>
              <label class="toggle-label">
                <input type="radio" name="storage-type" value="supabase" ${dbConfig.type === 'supabase' ? 'checked' : ''} />
                <span class="toggle-btn">☁️ Supabase</span>
              </label>
            </div>
          </div>
          <div id="supabase-config" class="db-config-fields" style="display: ${dbConfig.type === 'supabase' ? 'block' : 'none'};">
            <div class="form-row">
              <label for="supabase-url">Supabase URL</label>
              <input type="url" id="supabase-url" class="input" placeholder="https://your-project.supabase.co" value="${escapeAttr(dbConfig.supabaseUrl || '')}" />
            </div>
            <div class="form-row">
              <label for="supabase-key">Supabase Anon Key</label>
              <input type="password" id="supabase-key" class="input" placeholder="Your anon/public key" value="${escapeAttr(dbConfig.supabaseKey || '')}" />
            </div>
          </div>
        </section>
      </div>

      <div class="settings-footer">
        <button class="btn btn-primary" id="settings-save">Save Settings</button>
        <button class="btn btn-outline" id="settings-cancel">Cancel</button>
      </div>
    </div>
  `;

  // Toggle password visibility
  const toggleBtn = container.querySelector('#toggle-key-visibility');
  const apiKeyInput = container.querySelector('#api-key-input');
  toggleBtn.addEventListener('click', () => {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    toggleBtn.textContent = apiKeyInput.type === 'password' ? '👁️' : '🙈';
  });

  // Toggle database config visibility
  const storageRadios = container.querySelectorAll('input[name="storage-type"]');
  const supabaseConfig = container.querySelector('#supabase-config');
  storageRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      supabaseConfig.style.display = radio.value === 'supabase' && radio.checked ? 'block' : 'none';
    });
  });

  // Save
  container.querySelector('#settings-save').addEventListener('click', () => {
    // Save API key
    setApiKey(apiKeyInput.value);

    // Save quiz prefs
    localStorage.setItem('quiz_prefs', JSON.stringify({
      count: parseInt(container.querySelector('#quiz-count').value),
      category: container.querySelector('#quiz-category').value,
    }));

    // Save DB config
    const storageType = container.querySelector('input[name="storage-type"]:checked').value;
    const newDbConfig = { type: storageType };
    if (storageType === 'supabase') {
      newDbConfig.supabaseUrl = container.querySelector('#supabase-url').value.trim();
      newDbConfig.supabaseKey = container.querySelector('#supabase-key').value.trim();
    }
    localStorage.setItem('db_config', JSON.stringify(newDbConfig));

    onClose();
  });

  // Cancel & close
  container.querySelector('#settings-cancel').addEventListener('click', onClose);
  container.querySelector('#settings-close').addEventListener('click', onClose);
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
