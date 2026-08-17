import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Dashboard.css'; 
import './FoodAnalysis.css';
import ThemeToggle from './ThemeToggle';
import ApiKeyModal from './ApiKeyModal';
import UserProfileModal from './UserProfileModal';

const FoodAnalysis = ({ user, updateAvatar, onSaveProfile, onLogout }) => {
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutrition, setNutrition] = useState(null);
  const [error, setError] = useState(null);

  const avatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png'
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const clearUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!query && !selectedFile) {
      setError('Please provide a text description or upload an image.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setNutrition(null);

    const formData = new FormData();
    if (query) formData.append('query', query);
    if (selectedFile) formData.append('image', selectedFile);
    formData.append('goal', user.goal || 'bulking');

    try {
      const response = await fetch('http://localhost:5001/api/analyze-food', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setNutrition(data.data);
      } else {
        setError(data.message || 'Failed to analyze food.');
      }
    } catch (err) {
      setError('Error connecting to backend server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-container food-analysis">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="brand">IRON<span className="neon-orange">PULSE</span></div>
          <div className="nav-links">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>METRICS</Link>
            <Link to="/training" className={location.pathname === '/training' ? 'active' : ''}>TRAINING</Link>
            <Link to="/food" className={location.pathname === '/food' ? 'active' : ''}>NUTRITION</Link>
            <Link to="/booking" className={location.pathname === '/booking' ? 'active' : ''}>BOOKING</Link>
            <Link to="/assistant" className={location.pathname === '/assistant' ? 'active' : ''}>AI ASSISTANT</Link>
            <Link to="/community" className={location.pathname === '/community' ? 'active' : ''}>COMMUNITY</Link>
            <Link to="/tools" className={location.pathname === '/tools' ? 'active' : ''}>TOOLS</Link>
          </div>
        </div>
        <div className="nav-actions">
          <button className="ai-keys-nav-btn" onClick={() => setShowAiKeyModal(true)}>
            🔑 AI KEYS
          </button>
          <ThemeToggle />
          <div className="user-profile" onClick={() => setShowAvatarModal(true)}>
            <span>{user.name.toUpperCase()}</span>
            <div className="avatar-preview" style={{ backgroundImage: `url(${user.avatar})` }}></div>
          </div>
          <button className="logout-btn" onClick={onLogout}>EXIT</button>
        </div>
      </nav>

      <ApiKeyModal isOpen={showAiKeyModal} onClose={() => setShowAiKeyModal(false)} />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>NUTRITION <span className="neon-orange">VAULT</span></h1>
          <p>Instant AI breakdown via text or visual scanning.</p>
        </header>

        <div className="analysis-grid">
          <section className="input-section glass-card">
            <h3>ANALYZE <span className="neon-blue">BIOMATTER</span></h3>
            
            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
              {previewUrl ? (
                <div className="preview-container">
                  <img src={previewUrl} alt="Meal preview" />
                  <button className="clear-upload" onClick={(e) => { e.stopPropagation(); clearUpload(); }}>×</button>
                  <div className="scan-overlay"></div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <span>DROP PHOTO OR CLICK TO SCAN</span>
                  <small>JPEG, PNG supported</small>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                hidden 
              />
            </div>

            <div className="input-group">
              <label>MEAL CONTEXT (OPTIONAL)</label>
              <textarea 
                placeholder="Add details for higher precision..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button 
              className={`analyze-btn ${isAnalyzing ? 'loading' : ''}`} 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'SCALING MOLECULAR DATA...' : 'EXECUTE VISUAL SCAN'}
            </button>
            {error && <div className="error-msg">{error}</div>}
          </section>

          <section className="results-section">
            {nutrition ? (
              <div className="nutrition-results">
                <div className="main-stats glass-card animate-slide-up">
                  <div className="stat-main">
                    <span className="label">ESTIMATED CALORIES</span>
                    <span className="value neon-orange">{nutrition.calories} kcal</span>
                  </div>
                  <div className="macro-grid">
                    <div className="macro-item">
                      <span className="m-val neon-blue">{nutrition.protein}g</span>
                      <span className="m-lab">PROTEIN</span>
                    </div>
                    <div className="macro-item">
                      <span className="m-val neon-blue">{nutrition.carbs}g</span>
                      <span className="m-lab">CARBS</span>
                    </div>
                    <div className="macro-item">
                      <span className="m-val neon-blue">{nutrition.fat}g</span>
                      <span className="m-lab">FAT</span>
                    </div>
                  </div>
                </div>

                {nutrition.ingredients && nutrition.ingredients.length > 0 && (
                  <div className="ingredients-card glass-card animate-slide-up delay-1">
                    <h4>IDENTIFIED <span className="neon-blue">COMPONENTS</span></h4>
                    <div className="tags-container">
                      {nutrition.ingredients.map((ingredient, i) => (
                        <div className="ingredient-tag" key={i}>
                          <span className="crosshair"></span>
                          {ingredient.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="tips-card glass-card animate-slide-up delay-2">
                  <h4>PRO <span className="neon-orange">STRATEGY</span></h4>
                  <ul>
                    {nutrition.proTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="empty-results glass-card">
                <div className="dna-icon"></div>
                <p>Waiting for molecular breakdown...</p>
                <span>Upload a meal photo to start AI decomposition.</span>
              </div>
            )}
          </section>
        </div>
      </main>

      <UserProfileModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} user={user} onSaveProfile={onSaveProfile || updateAvatar} />
    </div>
  );
};

export default FoodAnalysis;
