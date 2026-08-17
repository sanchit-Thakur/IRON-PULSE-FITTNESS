import React, { useState, useEffect } from 'react';
import './ApiKeyModal.css';

const ApiKeyModal = ({ isOpen, onClose, onConfigSaved }) => {
  const [activeProvider, setActiveProvider] = useState('hybrid');
  const [geminiKey, setGeminiKey] = useState('');
  const [grokKey, setGrokKey] = useState('');
  
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGrokKey, setShowGrokKey] = useState(false);

  const [testStatus, setTestStatus] = useState(null); // { type: 'success'|'error', msg: '' }
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current AI Config from backend
  const fetchAiConfig = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/config/ai');
      const data = await res.json();
      if (data.success) {
        setActiveProvider(data.config.activeProvider || 'hybrid');
        setGeminiKey(data.config.geminiKeyRaw || '');
        setGrokKey(data.config.grokKeyRaw || '');
      }
    } catch (err) {
      console.warn('Could not load AI config from server:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAiConfig();
      setTestStatus(null);
    }
  }, [isOpen]);

  // Test Key Connection
  const handleTestKey = async (providerName) => {
    setIsTesting(true);
    setTestStatus(null);
    const targetKey = providerName === 'grok' ? grokKey : geminiKey;

    try {
      const res = await fetch('http://localhost:5001/api/config/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerName, key: targetKey })
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus({ type: 'success', msg: data.message });
      } else {
        setTestStatus({ type: 'error', msg: data.message });
      }
    } catch (err) {
      setTestStatus({ type: 'error', msg: `Connection error: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  // Save Configuration
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTestStatus(null);

    try {
      const res = await fetch('http://localhost:5001/api/config/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiKey,
          grokKey,
          activeProvider
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus({ type: 'success', msg: '🟢 AI Provider Keys & Configuration Saved!' });
        if (onConfigSaved) onConfigSaved(data.config);
        setTimeout(() => onClose(), 1200);
      } else {
        setTestStatus({ type: 'error', msg: data.message });
      }
    } catch (err) {
      setTestStatus({ type: 'error', msg: 'Failed to save configuration.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="api-key-modal glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <span className="cyber-badge orange">MULTI-MODEL AI ENGINE</span>
            <h3>AI API KEYS & <span className="neon-orange">PROVIDER PORTAL</span></h3>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSaveConfig} className="key-portal-form">
          {/* Active Provider Selector */}
          <div className="provider-selector-card">
            <label className="section-label">SELECT ACTIVE AI ENGINE PROVIDER:</label>
            <div className="provider-options">
              <label className={`provider-option ${activeProvider === 'hybrid' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="provider" 
                  value="hybrid" 
                  checked={activeProvider === 'hybrid'}
                  onChange={() => setActiveProvider('hybrid')}
                />
                <div>
                  <span className="p-title">⚡ AUTO-HYBRID ENGINE</span>
                  <span className="p-sub">Dynamic xAI Grok + Google Gemini Failover</span>
                </div>
              </label>

              <label className={`provider-option ${activeProvider === 'gemini' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="provider" 
                  value="gemini" 
                  checked={activeProvider === 'gemini'}
                  onChange={() => setActiveProvider('gemini')}
                />
                <div>
                  <span className="p-title">♊ GOOGLE GEMINI ENGINE</span>
                  <span className="p-sub">Gemini 1.5 Flash / Pro Vision API</span>
                </div>
              </label>

              <label className={`provider-option ${activeProvider === 'grok' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="provider" 
                  value="grok" 
                  checked={activeProvider === 'grok'}
                  onChange={() => setActiveProvider('grok')}
                />
                <div>
                  <span className="p-title">🤖 xAI GROK ENGINE</span>
                  <span className="p-sub">Grok-2 Vision / Grok Beta API</span>
                </div>
              </label>
            </div>
          </div>

          {/* Key 1: Google Gemini */}
          <div className="key-input-block">
            <div className="block-header">
              <span className="k-title">♊ GOOGLE GEMINI API KEY</span>
              <button 
                type="button" 
                className="test-key-btn" 
                onClick={() => handleTestKey('gemini')}
                disabled={isTesting || !geminiKey}
              >
                {isTesting ? 'TESTING...' : 'TEST GEMINI ⚡'}
              </button>
            </div>

            <div className="input-with-eye">
              <input 
                type={showGeminiKey ? "text" : "password"} 
                placeholder="Paste Gemini API Key (starts with AIzaSy...)"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowGeminiKey(!showGeminiKey)}
              >
                {showGeminiKey ? '👁️' : '🙈'}
              </button>
            </div>
            <span className="key-hint">Get a key at Google AI Studio (aistudio.google.com)</span>
          </div>

          {/* Key 2: xAI Grok */}
          <div className="key-input-block">
            <div className="block-header">
              <span className="k-title">🤖 xAI GROK API KEY</span>
              <button 
                type="button" 
                className="test-key-btn grok" 
                onClick={() => handleTestKey('grok')}
                disabled={isTesting || !grokKey}
              >
                {isTesting ? 'TESTING...' : 'TEST GROK 🤖'}
              </button>
            </div>

            <div className="input-with-eye">
              <input 
                type={showGrokKey ? "text" : "password"} 
                placeholder="Paste xAI Grok API Key (starts with xai-...)"
                value={grokKey}
                onChange={(e) => setGrokKey(e.target.value)}
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowGrokKey(!showGrokKey)}
              >
                {showGrokKey ? '👁️' : '🙈'}
              </button>
            </div>
            <span className="key-hint">Get a key at xAI Console (console.x.ai)</span>
          </div>

          {/* Status Message */}
          {testStatus && (
            <div className={`test-status-banner ${testStatus.type}`}>
              {testStatus.msg}
            </div>
          )}

          <button type="submit" className="save-keys-btn" disabled={isSaving}>
            {isSaving ? 'SAVING & REBOOTING ENGINE...' : 'SAVE KEYS & UPDATE AI ENGINES →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
