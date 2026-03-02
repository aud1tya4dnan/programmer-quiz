/**
 * Settings Panel Component
 * Manages AI provider/model selection, API key, quiz preferences, and database configuration.
 */

import { getAIConfig, saveAIConfig, hasApiKey, PROVIDERS } from '../ai-client.js';

/**
 * Render the settings panel into the modal.
 * @param {HTMLElement} container - the modal content element
 * @param {function} onClose - callback for closing the modal
 */
export function renderSettingsPanel(container, onClose) {
  const aiConfig = getAIConfig();
  const dbConfig = JSON.parse(localStorage.getItem('db_config') || '{}');
  const quizPrefs = JSON.parse(localStorage.getItem('quiz_prefs') || '{"count":5,"category":"all"}');

  container.innerHTML = `
    <div class="settings-panel">
      <div class="settings-header">
        <h2>⚙️ Settings</h2>
        <button class="btn btn-ghost btn-close" id="settings-close">✕</button>
      </div>

      <div class="settings-body">
        <!-- AI Provider Section -->
        <section class="settings-section">
          <h3>🤖 AI Provider</h3>
          <p class="settings-desc">Choose your AI provider for question generation and essay grading.</p>

          <!-- Provider Selection -->
          <div class="form-row">
            <label>Provider</label>
            <div class="provider-grid" id="provider-grid">
              ${Object.entries(PROVIDERS).map(([key, p]) => `
                <label class="provider-card ${key === 'custom' ? 'provider-card-wide' : ''} ${aiConfig.provider === key ? 'provider-active' : ''}">
                  <input type="radio" name="ai-provider" value="${key}" ${aiConfig.provider === key ? 'checked' : ''} />
                  <span class="provider-icon">${p.icon}</span>
                  <span class="provider-name">${p.name}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Custom Base URL (shown only for custom provider) -->
          <div class="form-row" id="custom-url-row" style="display: ${aiConfig.provider === 'custom' ? 'block' : 'none'};">
            <label for="custom-base-url">Base URL</label>
            <input
              type="url"
              id="custom-base-url"
              class="input"
              placeholder="http://localhost:11434 (Ollama) or http://localhost:1234 (LM Studio)..."
              value="${escapeAttr(aiConfig.customBaseUrl || '')}"
            />
            <p class="settings-desc" style="margin-top: 0.25rem;">Any OpenAI-compatible endpoint. Will call <code>{baseUrl}/v1/chat/completions</code>.</p>
          </div>

          <!-- API Key Input -->
          <div class="form-row">
            <label for="api-key-input">
              API Key
              <a href="${escapeAttr(PROVIDERS[aiConfig.provider].apiKeyUrl || '#')}" target="_blank" rel="noopener" class="settings-link" id="api-key-link" style="display: ${PROVIDERS[aiConfig.provider].apiKeyUrl ? 'inline' : 'none'}">Get key →</a>
            </label>
            <div class="input-group">
              <input
                type="password"
                id="api-key-input"
                class="input"
                placeholder="${escapeAttr(PROVIDERS[aiConfig.provider].apiKeyPlaceholder)}"
                value="${escapeAttr(aiConfig.apiKey)}"
              />
              <button class="btn btn-outline" id="toggle-key-visibility">👁️</button>
            </div>
            <div class="api-status ${hasApiKey() ? 'status-active' : 'status-inactive'}">
              ${hasApiKey() ? '✅ API key configured' : '⚠️ No API key — using fallback questions'}
            </div>
          </div>

          <!-- Model Selection -->
          <div class="form-row">
            <label for="model-select">Model</label>
            <div class="model-select-group">
              <select id="model-select" class="input input-select">
                ${renderModelOptions(aiConfig.provider, aiConfig.model)}
                <option value="__custom__" ${!PROVIDERS[aiConfig.provider].models.includes(aiConfig.model) ? 'selected' : ''}>✏️ Custom model...</option>
              </select>
              <input
                type="text"
                id="model-custom-input"
                class="input"
                placeholder="Enter custom model name..."
                value="${!PROVIDERS[aiConfig.provider].models.includes(aiConfig.model) ? escapeAttr(aiConfig.model) : ''}"
                style="display: ${!PROVIDERS[aiConfig.provider].models.includes(aiConfig.model) ? 'block' : 'none'};"
              />
            </div>
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

  // ── Event Listeners ───────────────────────────────────────────────────────

  const providerRadios = container.querySelectorAll('input[name="ai-provider"]');
  const apiKeyInput = container.querySelector('#api-key-input');
  const apiKeyLink = container.querySelector('#api-key-link');
  const modelSelect = container.querySelector('#model-select');
  const modelCustomInput = container.querySelector('#model-custom-input');
  const providerCards = container.querySelectorAll('.provider-card');
  const customUrlRow = container.querySelector('#custom-url-row');
  const customBaseUrlInput = container.querySelector('#custom-base-url');

  // Provider switch
  providerRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const provider = radio.value;
      const pDef = PROVIDERS[provider];

      // Update active provider card
      providerCards.forEach((c) => c.classList.remove('provider-active'));
      radio.closest('.provider-card').classList.add('provider-active');

      // Show/hide base URL row for custom provider
      customUrlRow.style.display = provider === 'custom' ? 'block' : 'none';

      // Update API key placeholder and link
      apiKeyInput.placeholder = pDef.apiKeyPlaceholder;
      if (pDef.apiKeyUrl) {
        apiKeyLink.href = pDef.apiKeyUrl;
        apiKeyLink.style.display = 'inline';
      } else {
        apiKeyLink.style.display = 'none';
      }

      // Update model dropdown
      modelSelect.innerHTML = renderModelOptions(provider, pDef.defaultModel)
        + '<option value="__custom__">✏️ Custom model...</option>';
      // For custom provider, always show the custom model input pre-focused
      if (provider === 'custom') {
        modelSelect.value = '__custom__';
        modelCustomInput.style.display = 'block';
      } else {
        modelCustomInput.style.display = 'none';
        modelCustomInput.value = '';
      }
    });
  });

  // Model dropdown — show custom input when "Custom model..." is selected
  modelSelect.addEventListener('change', () => {
    if (modelSelect.value === '__custom__') {
      modelCustomInput.style.display = 'block';
      modelCustomInput.focus();
    } else {
      modelCustomInput.style.display = 'none';
      modelCustomInput.value = '';
    }
  });

  // Toggle password visibility
  const toggleBtn = container.querySelector('#toggle-key-visibility');
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

  // Save all settings
  container.querySelector('#settings-save').addEventListener('click', () => {
    // Save AI config
    const selectedProvider = container.querySelector('input[name="ai-provider"]:checked').value;
    const selectedModel = modelSelect.value === '__custom__'
      ? modelCustomInput.value.trim()
      : modelSelect.value;

    saveAIConfig({
      provider: selectedProvider,
      apiKey: apiKeyInput.value.trim(),
      model: selectedModel || PROVIDERS[selectedProvider].defaultModel || '',
      customBaseUrl: customBaseUrlInput ? customBaseUrlInput.value.trim() : '',
    });

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

// ── Helpers ─────────────────────────────────────────────────────────────────

function renderModelOptions(provider, selectedModel) {
  return PROVIDERS[provider].models
    .map((m) => `<option value="${m}" ${m === selectedModel ? 'selected' : ''}>${m}</option>`)
    .join('');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
