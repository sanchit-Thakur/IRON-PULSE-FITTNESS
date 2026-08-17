import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE } from './config';
import './Dashboard.css';
import ThemeToggle from './ThemeToggle';
import ApiKeyModal from './ApiKeyModal';
import UserProfileModal from './UserProfileModal';

const Dashboard = ({ user, updateAvatar, onSaveProfile, onLogout }) => {
  const location = useLocation();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);
  const avatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png'
  ];

  const [metrics, setMetrics] = useState({
    weight: '',
    height: '',
    heightFt: '',
    heightIn: '',
    unit: 'cm',
    age: '',
    gender: 'male',
    activity: '1.2',
    goal: 'bulking'
  });

  const [results, setResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetrics({ ...metrics, [name]: value });
  };

  const calculateFitness = () => {
    const { weight, height, heightFt, heightIn, unit, age, gender, activity, goal } = metrics;
    
    let h = 0;
    if (unit === 'cm') {
      h = parseFloat(height);
    } else {
      h = (parseFloat(heightFt) * 30.48) + (parseFloat(heightIn) * 2.54);
    }

    if (!weight || !h || !age) return;

    const w = parseFloat(weight);
    const a = parseInt(age);
    const act = parseFloat(activity);

    // BMR Calculation (Mifflin-St Jeor)
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    // TDEE
    const tdee = bmr * act;

    // Water Intake
    const water = (w * 35) / 1000;

    // Goal Calories
    const goalCalories = goal === 'bulking' ? tdee + 500 : tdee - 500;

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      water: water.toFixed(1),
      goalCalories: Math.round(goalCalories)
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
      const data = await response.json();
      if (data.success) {
        alert('Performance blueprint saved to Command Center.');
      }
    } catch (error) {
      console.error('Error saving metrics:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const { weight, height, heightFt, age, unit } = metrics;
    const hasHeight = unit === 'cm' ? height : heightFt;
    if (weight && hasHeight && age) {
      calculateFitness();
    }
  }, [metrics]);

  // Calculate personalized biometric targets based on user's weight, height, age, gender, and goal
  const weightKg = parseFloat(user.weight) || 75;
  const heightCm = parseFloat(user.height) || 178;
  const ageYears = parseInt(user.age) || 24;
  const gender = user.gender || 'male';
  const goal = user.goal || 'bulking';

  // Mifflin-St Jeor Equation for BMR & TDEE
  const bmr = gender === 'female' 
    ? (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161
    : (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;

  const tdee = Math.round(bmr * 1.375);

  let targetCalories = tdee;
  let targetProtein = Math.round(weightKg * 2.0);
  let goalLabel = 'LEAN BULK';
  let planLabel = 'HYPERTROPHY PPL';

  if (goal === 'bulking') {
    targetCalories = Math.round(tdee + 350);
    targetProtein = Math.round(weightKg * 2.2);
    goalLabel = 'LEAN BULK';
    planLabel = 'MASS PPL (+350 SURPLUS)';
  } else if (goal === 'cutting') {
    targetCalories = Math.round(tdee - 500);
    targetProtein = Math.round(weightKg * 2.3);
    goalLabel = 'FAT LOSS CUT';
    planLabel = 'SHRED PPL (-500 DEFICIT)';
  } else if (goal === 'recomp') {
    targetCalories = tdee;
    targetProtein = Math.round(weightKg * 2.1);
    goalLabel = 'RECOMP';
    planLabel = 'BODY RECOMPOSITION';
  } else if (goal === 'strength') {
    targetCalories = Math.round(tdee + 250);
    targetProtein = Math.round(weightKg * 2.2);
    goalLabel = 'MAX STRENGTH';
    planLabel = '5x5 POWERLIFTING';
  }

  const currentCalories = Math.round(targetCalories * 0.72);
  const currentProtein = Math.round(targetProtein * 0.78);

  const radius = 52;
  const circumference = 2 * Math.PI * radius; // 326.72
  const calProgress = Math.min(1, currentCalories / targetCalories);
  const proProgress = Math.min(1, currentProtein / targetProtein);

  const calStrokeOffset = circumference - (calProgress * circumference);
  const proStrokeOffset = circumference - (proProgress * circumference);

  return (
    <div className="dashboard-container new-dashboard">
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
      <UserProfileModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} user={user} onSaveProfile={onSaveProfile || updateAvatar} />

      <main className="dashboard-content">
        <header className="dashboard-header new-style">
          <h1>WELCOME, {user.name.toUpperCase()}</h1>
          <p>Let's close those rings today.</p>
        </header>

        <div className="dashboard-top-section">
          <div className="daily-targets-card glass-card">
            <div className="card-header">
              <span className="target-label">TODAY</span>
              <h2>DAILY TARGETS</h2>
            </div>
            
            <div className="rings-container">
              <div className="ring-wrapper">
                <svg className="progress-ring" width="120" height="120">
                  <circle className="progress-ring__circle bg" stroke="var(--surface-high)" strokeWidth="8" fill="transparent" r="52" cx="60" cy="60"/>
                  <circle 
                    className="progress-ring__circle calories-ring" 
                    stroke="#d4ff00" 
                    strokeWidth="8" 
                    strokeDasharray={circumference}
                    strokeDashoffset={calStrokeOffset}
                    strokeLinecap="round"
                    fill="transparent" 
                    r="52" 
                    cx="60" 
                    cy="60"
                  />
                </svg>
                <div className="ring-content">
                  <span className="ring-value">{currentCalories}</span>
                  <span className="ring-sub">/ {targetCalories} KCAL</span>
                </div>
                <div className="ring-label">CALORIES</div>
              </div>

              <div className="ring-wrapper">
                <svg className="progress-ring" width="120" height="120">
                  <circle className="progress-ring__circle bg" stroke="var(--surface-high)" strokeWidth="8" fill="transparent" r="52" cx="60" cy="60"/>
                  <circle 
                    className="progress-ring__circle protein-ring" 
                    stroke="#00ff41" 
                    strokeWidth="8" 
                    strokeDasharray={circumference}
                    strokeDashoffset={proStrokeOffset}
                    strokeLinecap="round"
                    fill="transparent" 
                    r="52" 
                    cx="60" 
                    cy="60"
                  />
                </svg>
                <div className="ring-content">
                  <span className="ring-value">{currentProtein}</span>
                  <span className="ring-sub">/ {targetProtein} G</span>
                </div>
                <div className="ring-label">PROTEIN</div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card glass-card">
              <span className="stat-label">MEALS TODAY</span>
              <span className="stat-value">2</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">GOAL</span>
              <span className="stat-value">{goalLabel}</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">PLAN</span>
              <span className="stat-value">{planLabel}</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-label">HEIGHT / WEIGHT</span>
              <span className="stat-value">{heightCm} CM / {weightKg} KG</span>
            </div>
          </div>
        </div> 

        <div className="quick-actions-grid">
          <Link to="/food" className="action-card glass-card">
            <div className="action-icon camera-icon">📷</div>
            <div className="action-text">
              <span className="action-label">AI-POWERED</span>
              <h3>SCAN FOOD</h3>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/training" className="action-card glass-card">
            <div className="action-icon dumbbell-icon">🏋️</div>
            <div className="action-text">
              <span className="action-label">TODAY'S LIFT</span>
              <h3>WORKOUT PLAN</h3>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/booking" className="action-card glass-card">
            <div className="action-icon people-icon">👥</div>
            <div className="action-text">
              <span className="action-label">ELITE COACHES</span>
              <h3>BOOK TRAINER</h3>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/community" className="action-card glass-card">
            <div className="action-icon chart-icon">📊</div>
            <div className="action-text">
              <span className="action-label">CROWD & PRs</span>
              <h3>COMMUNITY HUB</h3>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/tools" className="action-card glass-card">
            <div className="action-icon gear-icon">🧬</div>
            <div className="action-text">
              <span className="action-label">CALCULATORS & MAP</span>
              <h3>TOOLS HUB</h3>
            </div>
            <div className="action-arrow">→</div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
