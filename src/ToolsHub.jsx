import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE } from './config';
import ThemeToggle from './ThemeToggle';
import ApiKeyModal from './ApiKeyModal';
import UserProfileModal from './UserProfileModal';
import './Dashboard.css';
import './ToolsHub.css';

const ToolsHub = ({ user, updateAvatar, onSaveProfile, onLogout }) => {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('muscle-map'); // 'muscle-map' | 'macro-calc' | 'barbell-math'
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

  // Tool 1: Muscle Map States
  const [selectedMuscleKey, setSelectedMuscleKey] = useState('chest');
  const [muscleData, setMuscleData] = useState({});
  const [customRoutine, setCustomRoutine] = useState([]);
  const [bodyView, setBodyView] = useState('ANTERIOR'); // 'ANTERIOR' | 'POSTERIOR'

  // Tool 2: Macro Calculator States
  const [macroInputs, setMacroInputs] = useState({
    weight: '78',
    height: '178',
    age: '24',
    gender: 'male',
    activity: '1.375',
    goal: 'lean-bulk'
  });
  const [macroResults, setMacroResults] = useState(null);
  const [isCalculatingMacros, setIsCalculatingMacros] = useState(false);

  // Tool 3: Barbell Math States
  const [barbellInputs, setBarbellInputs] = useState({
    targetWeight: '140',
    unit: 'kg',
    barWeight: '20'
  });
  const [barbellResult, setBarbellResult] = useState(null);

  // Fetch Muscle Mappings
  useEffect(() => {
    fetch(`${API_BASE}/api/tools/muscle-data`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMuscleData(data.muscles);
      })
      .catch(() => {
        // Fallback local muscle map
        setMuscleData({
          chest: {
            name: "CHEST (PECTORALIS MAJOR)",
            view: "ANTERIOR",
            description: "Primary horizontal pusher. Crucial for upper body press strength and upper torso thickness.",
            exercises: ["Incline Dumbbell Press", "Barbell Bench Press", "Cable Chest Fly", "Dips"],
            cues: ["Retract & depress scapula", "Tuck elbows at 45°", "Stretch under control at bottom"],
            repRange: "6 - 12 Reps (Hypertrophy / Power)"
          },
          lats: {
            name: "LATS (LATISSIMUS DORSI)",
            view: "POSTERIOR",
            description: "The V-taper muscle. Drives vertical and horizontal pulling power.",
            exercises: ["Wide Grip Lat Pulldown", "Barbell Bent Over Row", "Weighted Pull-Ups"],
            cues: ["Initiate pull by depressing scapula", "Drive elbows toward hips", "Squeeze lats at bottom"],
            repRange: "8 - 15 Reps (V-Taper Hypertrophy)"
          },
          quads: {
            name: "QUADS (QUADRICEPS)",
            view: "ANTERIOR",
            description: "Dominant leg extensors. Essential for sprinting, jumping, and heavy squatting.",
            exercises: ["Barbell Back Squat", "Leg Press", "Bulgarian Split Squat"],
            cues: ["Keep heels grounded", "Knees track over 2nd/3rd toes", "Depth at or below parallel"],
            repRange: "8 - 12 Reps (Strength / Quad Hypertrophy)"
          },
          shoulders: {
            name: "DELTOIDS (SHOULDERS)",
            view: "ANTERIOR",
            description: "Creates shoulder width and stabilizes overhead pressing.",
            exercises: ["Overhead Barbell Press", "Dumbbell Lateral Raise", "Rear Delt Cable Fly"],
            cues: ["Avoid shrugging traps during lateral raise", "Squeeze glutes during OHP"],
            repRange: "10 - 20 Reps (Deltoid Isolation)"
          },
          biceps: {
            name: "BICEPS BRACHII",
            view: "ANTERIOR",
            description: "Arm flexor muscles responsible for elbow flexion and forearm supination.",
            exercises: ["Dumbbell Incline Curl", "Barbell Preacher Curl", "Hammer Curls"],
            cues: ["Keep upper arms stationary", "Supinate wrist at peak", "Control 3s negative"],
            repRange: "10 - 15 Reps (Arm Density)"
          },
          triceps: {
            name: "TRICEPS BRACHII",
            view: "POSTERIOR",
            description: "Makes up 60% of total upper arm mass. Drives lockout on all pressing movements.",
            exercises: ["Triceps Rope Pushdown", "Skullcrushers", "Close-Grip Bench Press"],
            cues: ["Pin elbows to ribs", "Lock out elbows fully at bottom"],
            repRange: "10 - 15 Reps (Triceps Overload)"
          },
          hamstrings: {
            name: "HAMSTRINGS & GLUTES",
            view: "POSTERIOR",
            description: "Posterior chain engine. Drives hip extension, sprinting power, and knee protection.",
            exercises: ["Romanian Deadlift (RDL)", "Barbell Glute Hip Thrust", "Lying Leg Curls"],
            cues: ["Hinge hips backward with soft knee bend", "Keep bar close to legs"],
            repRange: "8 - 12 Reps (Posterior Power)"
          },
          abs: {
            name: "ABS & CORE ARMOR",
            view: "ANTERIOR",
            description: "Core armor stabilizing the spine during heavy barbell lifts.",
            exercises: ["Hanging Leg Raise", "Ab Wheel Rollout", "Cable Woodchoppers"],
            cues: ["Tilt pelvis upward", "Exhale fully at top contraction"],
            repRange: "12 - 20 Reps or Timed Holds"
          }
        });
      });
  }, []);

  // Calculate Macros Handler
  const handleCalculateMacros = async (e) => {
    if (e) e.preventDefault();
    setIsCalculatingMacros(true);
    try {
      const response = await fetch(`${API_BASE}/api/tools/calculate-macros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(macroInputs)
      });
      const data = await response.json();
      if (data.success) setMacroResults(data.data);
    } catch (err) {
      // Local fallback macro calculation
      const w = parseFloat(macroInputs.weight) || 75;
      const h = parseFloat(macroInputs.height) || 175;
      const a = parseInt(macroInputs.age) || 25;
      const act = parseFloat(macroInputs.activity) || 1.375;
      let bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
      const tdee = bmr * act;
      let target = tdee + 350;
      setMacroResults({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(target),
        proteinGrams: Math.round((target * 0.3) / 4),
        carbsGrams: Math.round((target * 0.45) / 4),
        fatGrams: Math.round((target * 0.25) / 9),
        proteinPercent: 30,
        carbsPercent: 45,
        fatPercent: 25,
        waterLiters: (w * 0.035).toFixed(1),
        caloriesPerMeal: Math.round(target / 4)
      });
    } finally {
      setIsCalculatingMacros(false);
    }
  };

  // Initial Auto Macro Calc
  useEffect(() => {
    handleCalculateMacros();
  }, []);

  // Calculate Barbell Math Handler
  const handleBarbellMath = async (targetW, unitVal, barW) => {
    const tw = targetW || barbellInputs.targetWeight;
    const u = unitVal || barbellInputs.unit;
    const bw = barW || barbellInputs.barWeight;

    try {
      const response = await fetch(`${API_BASE}/api/tools/barbell-math`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetWeight: tw, unit: u, barWeight: bw })
      });
      const data = await response.json();
      if (data.success) setBarbellResult(data.data);
    } catch (err) {
      // Local fallback barbell calculation
      const total = parseFloat(tw) || 100;
      const bar = parseFloat(bw) || 20;
      const sleeve = (total - bar) / 2;
      const plates = [
        { weight: 25, color: '#ff003c', label: '25kg (Red)' },
        { weight: 20, color: '#0071e3', label: '20kg (Blue)' },
        { weight: 15, color: '#ffd600', label: '15kg (Yellow)' },
        { weight: 10, color: '#00ff41', label: '10kg (Green)' },
        { weight: 5, color: '#ffffff', label: '5kg (White)' },
        { weight: 2.5, color: '#2a2a2a', label: '2.5kg (Black)' }
      ];
      let rem = sleeve;
      const loaded = [];
      plates.forEach(p => {
        const count = Math.floor(rem / p.weight);
        for (let i = 0; i < count; i++) loaded.push(p);
        rem -= count * p.weight;
      });
      setBarbellResult({
        targetWeight: total,
        unit: u,
        barWeight: bar,
        weightPerSleeve: sleeve.toFixed(2),
        loadedPlatesPerSleeve: loaded,
        totalAchievedWeight: total
      });
    }
  };

  useEffect(() => {
    handleBarbellMath();
  }, []);

  // Add Exercise to Custom Routine Builder
  const handleAddToRoutine = (exerciseName, muscle) => {
    if (customRoutine.some(item => item.name === exerciseName)) return;
    setCustomRoutine(prev => [...prev, { name: exerciseName, muscle, sets: 4, reps: "8-12" }]);
  };

  const handleRemoveFromRoutine = (index) => {
    setCustomRoutine(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="dashboard-container tools-hub">
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
        <header className="dashboard-header">
          <div className="header-subtitle">/ UTILITIES & CALCULATORS</div>
          <h1>INTERACTIVE <span className="neon-orange">TOOLS HUB</span></h1>
          <p>Anatomical muscle mapping, multi-step macro engine, and visual barbell sleeve load assistant.</p>
        </header>

        {/* Tools Sub Navigation Tabs */}
        <div className="tools-sub-tabs">
          <button 
            className={activeTab === 'muscle-map' ? 'active' : ''} 
            onClick={() => setActiveTab('muscle-map')}
          >
            🧬 MUSCLE MAP & ROUTINE BUILDER
          </button>
          <button 
            className={activeTab === 'macro-calc' ? 'active' : ''} 
            onClick={() => setActiveTab('macro-calc')}
          >
            📊 SMART MACRO & NUTRITION ENGINE
          </button>
          <button 
            className={activeTab === 'barbell-math' ? 'active' : ''} 
            onClick={() => setActiveTab('barbell-math')}
          >
            🏋️ VISUAL BARBELL MATH ASSISTANT
          </button>
        </div>

        {/* TOOL 1: INTERACTIVE MUSCLE MAP & ROUTINE BUILDER */}
        {activeTab === 'muscle-map' && (
          <div className="tool-section-container animate-fade-in">
            <div className="muscle-map-layout">
              {/* Left Column: Interactive Anatomical Graphic */}
              <div className="anatomical-card glass-card">
                <div className="card-header-flex">
                  <div>
                    <span className="cyber-badge orange">ANATOMICAL SCANNER</span>
                    <h3>CLICK A <span className="neon-blue">MUSCLE GROUP</span></h3>
                  </div>

                  <div className="view-toggle">
                    <button 
                      className={bodyView === 'ANTERIOR' ? 'active' : ''} 
                      onClick={() => setBodyView('ANTERIOR')}
                    >
                      FRONT (ANTERIOR)
                    </button>
                    <button 
                      className={bodyView === 'POSTERIOR' ? 'active' : ''} 
                      onClick={() => setBodyView('POSTERIOR')}
                    >
                      BACK (POSTERIOR)
                    </button>
                  </div>
                </div>

                {/* SVG Anatomical Muscle Selector Canvas */}
                <div className="svg-body-canvas">
                  <div className="body-silhouette">
                    {bodyView === 'ANTERIOR' ? (
                      <div className="muscle-interactive-grid">
                        <button 
                          className={`muscle-btn chest ${selectedMuscleKey === 'chest' ? 'active' : ''}`}
                          onClick={() => setSelectedMuscleKey('chest')}
                        >
                          CHEST
                        </button>
                        <button 
                          className={`muscle-btn shoulders ${selectedMuscleKey === 'shoulders' ? 'active' : ''}`}
                          onClick={() => setSelectedMuscleKey('shoulders')}
                        >
                          DELTS / SHOULDERS
                        </button>
                        <button 
                          className={`muscle-btn biceps ${selectedMuscleKey === 'biceps' ? 'active' : ''}`}
                          onClick={() => setSelectedMuscleKey('biceps')}
                        >
                          BICEPS
                        </button>
                        <button 
                          className={`muscle-btn abs ${selectedMuscleKey === 'abs' ? 'active' : ''}`}
                          onClick={() => setSelectedMuscleKey('abs')}
                        >
                          ABS & CORE
                        </button>
                        <button 
                          className={`muscle-btn quads ${selectedMuscleKey === 'quads' ? 'active' : ''}`}
                          onClick={() => setSelectedMuscleKey('quads')}
                        >
                          QUADS
                        </button>
                      </div>
                    ) : (
                      <div className="muscle-interactive-grid">
                        <button 
                          className={`muscle-btn lats ${selectedMuscleKey === 'lats' ? 'active' : ''}`}
                          onClick={() => setSelectedMuscleKey('lats')}
                        >
                          LATS & UPPER BACK
                        </button>
                        <button 
                          className={`muscle-btn triceps ${selectedMuscleKey === 'triceps' ? 'active' : ''}`}
                          onClick={() => setSelectedMuscleKey('triceps')}
                        >
                          TRICEPS
                        </button>
                        <button 
                          className={`muscle-btn hamstrings ${selectedMuscleKey === 'hamstrings' ? 'active' : ''}`}
                          onClick={() => setSelectedMuscleKey('hamstrings')}
                        >
                          HAMSTRINGS & GLUTES
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Column: Selected Muscle Details */}
              {muscleData[selectedMuscleKey] && (
                <div className="muscle-details-card glass-card">
                  <span className="cyber-badge blue">{muscleData[selectedMuscleKey].view} VIEW</span>
                  <h3 className="neon-orange">{muscleData[selectedMuscleKey].name}</h3>
                  <p className="muscle-desc">{muscleData[selectedMuscleKey].description}</p>

                  <div className="protocol-summary-box">
                    <span className="p-label">RECOMMENDED REP RANGE:</span>
                    <strong className="neon-blue">{muscleData[selectedMuscleKey].repRange}</strong>
                  </div>

                  <h4>TOP TARGET EXERCISES:</h4>
                  <div className="exercises-list">
                    {muscleData[selectedMuscleKey].exercises.map((ex, i) => (
                      <div key={i} className="exercise-item">
                        <div>
                          <span className="ex-title">⚡ {ex}</span>
                        </div>
                        <button 
                          className="add-to-routine-btn"
                          onClick={() => handleAddToRoutine(ex, muscleData[selectedMuscleKey].name)}
                        >
                          + ADD TO ROUTINE
                        </button>
                      </div>
                    ))}
                  </div>

                  <h4>BIOMECHANICAL EXECUTION CUES:</h4>
                  <ul className="cues-bullet-list">
                    {muscleData[selectedMuscleKey].cues.map((cue, idx) => (
                      <li key={idx}>✓ {cue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Right Column: Custom Routine Drawer */}
              <div className="routine-drawer-card glass-card">
                <div className="card-header-flex">
                  <h3>CUSTOM <span className="neon-green">ROUTINE</span></h3>
                  <span className="sets-count">{customRoutine.length} EXERCISES</span>
                </div>

                {customRoutine.length === 0 ? (
                  <div className="empty-routine-box">
                    <p>No exercises added yet.</p>
                    <small>Click "+ ADD TO ROUTINE" on any muscle group to build your custom workout split.</small>
                  </div>
                ) : (
                  <div className="routine-items-list">
                    {customRoutine.map((item, idx) => (
                      <div key={idx} className="routine-item">
                        <div>
                          <span className="r-name">{item.name}</span>
                          <span className="r-sets">4 Sets • {item.reps} Reps</span>
                        </div>
                        <button className="remove-r-btn" onClick={() => handleRemoveFromRoutine(idx)}>×</button>
                      </div>
                    ))}

                    <button className="export-routine-btn" onClick={() => alert("Routine saved to Command Center!")}>
                      SAVE & EXPORT ROUTINE →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 2: SMART MACRO & NUTRITION CALCULATOR */}
        {activeTab === 'macro-calc' && (
          <div className="tool-section-container animate-fade-in">
            <div className="macro-calc-grid">
              {/* Form Input Column */}
              <div className="macro-form-card glass-card">
                <span className="cyber-badge orange">MULTI-STEP CALORIC ENGINE</span>
                <h3>PHYSIQUE <span className="neon-orange">PARAMETERS</span></h3>

                <form className="macro-form" onSubmit={handleCalculateMacros}>
                  <div className="input-row">
                    <div className="input-group">
                      <label>BODY WEIGHT (KG)</label>
                      <input 
                        type="number" 
                        value={macroInputs.weight} 
                        onChange={(e) => setMacroInputs({ ...macroInputs, weight: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>HEIGHT (CM)</label>
                      <input 
                        type="number" 
                        value={macroInputs.height} 
                        onChange={(e) => setMacroInputs({ ...macroInputs, height: e.target.value })}
                        required 
                      />
                    </div>
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label>AGE (YEARS)</label>
                      <input 
                        type="number" 
                        value={macroInputs.age} 
                        onChange={(e) => setMacroInputs({ ...macroInputs, age: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>GENDER</label>
                      <select 
                        value={macroInputs.gender}
                        onChange={(e) => setMacroInputs({ ...macroInputs, gender: e.target.value })}
                      >
                        <option value="male">MALE</option>
                        <option value="female">FEMALE</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>ACTIVITY LEVEL</label>
                    <select 
                      value={macroInputs.activity}
                      onChange={(e) => setMacroInputs({ ...macroInputs, activity: e.target.value })}
                    >
                      <option value="1.2">SEDENTARY (DESK JOB, LITTLE EXERCISE)</option>
                      <option value="1.375">LIGHT ATHLETE (1-3 LIFT SESSIONS / WEEK)</option>
                      <option value="1.55">MODERATE ATHLETE (4-5 LIFT SESSIONS / WEEK)</option>
                      <option value="1.725">HEAVY ATHLETE (DAILY HEAVY TRAINING)</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>PHYSIQUE GOAL</label>
                    <div className="goal-options-grid">
                      <button 
                        type="button" 
                        className={`goal-btn ${macroInputs.goal === 'lean-bulk' ? 'active' : ''}`}
                        onClick={() => setMacroInputs({ ...macroInputs, goal: 'lean-bulk' })}
                      >
                        🔥 LEAN BULK (+350 KCAL)
                      </button>
                      <button 
                        type="button" 
                        className={`goal-btn ${macroInputs.goal === 'aggressive-cut' ? 'active' : ''}`}
                        onClick={() => setMacroInputs({ ...macroInputs, goal: 'aggressive-cut' })}
                      >
                        ⚡ AGGRESSIVE CUT (-500 KCAL)
                      </button>
                      <button 
                        type="button" 
                        className={`goal-btn ${macroInputs.goal === 'recomp' ? 'active' : ''}`}
                        onClick={() => setMacroInputs({ ...macroInputs, goal: 'recomp' })}
                      >
                        💪 AESTHETIC RECOMP (-150 KCAL)
                      </button>
                      <button 
                        type="button" 
                        className={`goal-btn ${macroInputs.goal === 'max-strength' ? 'active' : ''}`}
                        onClick={() => setMacroInputs({ ...macroInputs, goal: 'max-strength' })}
                      >
                        🏆 MAX STRENGTH (+500 KCAL)
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="calculate-btn" disabled={isCalculatingMacros}>
                    {isCalculatingMacros ? 'RECALCULATING BIOMETRICS...' : 'CALCULATE MACRO SPLIT →'}
                  </button>
                </form>
              </div>

              {/* Output Results Column */}
              {macroResults && (
                <div className="macro-results-card glass-card">
                  <span className="cyber-badge green">OPTIMIZED MACRO SPLIT</span>
                  <h3>DAILY TARGET: <span className="neon-orange">{macroResults.targetCalories} KCAL</span></h3>

                  <div className="macros-rings-grid">
                    <div className="macro-box protein">
                      <span className="m-val neon-blue">{macroResults.proteinGrams} G</span>
                      <span className="m-label">PROTEIN ({macroResults.proteinPercent}%)</span>
                    </div>

                    <div className="macro-box carbs">
                      <span className="m-val neon-orange">{macroResults.carbsGrams} G</span>
                      <span className="m-label">CARBS ({macroResults.carbsPercent}%)</span>
                    </div>

                    <div className="macro-box fat">
                      <span className="m-val neon-green">{macroResults.fatGrams} G</span>
                      <span className="m-label">FAT ({macroResults.fatPercent}%)</span>
                    </div>
                  </div>

                  <div className="macro-breakdown-details">
                    <div className="b-item">
                      <span className="b-label">ESTIMATED BMR</span>
                      <span className="b-val">{macroResults.bmr} kcal/day</span>
                    </div>
                    <div className="b-item">
                      <span className="b-label">TDEE MAINTENANCE</span>
                      <span className="b-val">{macroResults.tdee} kcal/day</span>
                    </div>
                    <div className="b-item">
                      <span className="b-label">CALORIES PER MEAL (4 MEALS)</span>
                      <span className="b-val neon-orange">{macroResults.caloriesPerMeal} kcal</span>
                    </div>
                    <div className="b-item">
                      <span className="b-label">DAILY WATER INTAKE</span>
                      <span className="b-val neon-blue">💧 {macroResults.waterLiters} Liters/day</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOOL 3: VISUAL PLATE & BARBELL MATH ASSISTANT */}
        {activeTab === 'barbell-math' && (
          <div className="tool-section-container animate-fade-in">
            <div className="barbell-math-grid">
              {/* Input Card */}
              <div className="barbell-input-card glass-card">
                <span className="cyber-badge orange">BARBELL SLEEVE LOADER</span>
                <h3>PLATE & BARBELL <span className="neon-orange">MATH</span></h3>

                <div className="input-group">
                  <label>TARGET LIFT LOAD ({barbellInputs.unit.toUpperCase()})</label>
                  <input 
                    type="number" 
                    value={barbellInputs.targetWeight} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setBarbellInputs({ ...barbellInputs, targetWeight: val });
                      handleBarbellMath(val, barbellInputs.unit, barbellInputs.barWeight);
                    }}
                    placeholder="Enter load (e.g. 140)"
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>UNIT</label>
                    <select 
                      value={barbellInputs.unit}
                      onChange={(e) => {
                        const u = e.target.value;
                        const defaultBar = u === 'lbs' ? '45' : '20';
                        setBarbellInputs({ ...barbellInputs, unit: u, barWeight: defaultBar });
                        handleBarbellMath(barbellInputs.targetWeight, u, defaultBar);
                      }}
                    >
                      <option value="kg">KILOGRAMS (KG)</option>
                      <option value="lbs">POUNDS (LBS)</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>BAR WEIGHT</label>
                    <select 
                      value={barbellInputs.barWeight}
                      onChange={(e) => {
                        const bw = e.target.value;
                        setBarbellInputs({ ...barbellInputs, barWeight: bw });
                        handleBarbellMath(barbellInputs.targetWeight, barbellInputs.unit, bw);
                      }}
                    >
                      {barbellInputs.unit === 'kg' ? (
                        <>
                          <option value="20">20 KG (STANDARD OLYMPIC BAR)</option>
                          <option value="15">15 KG (WOMEN'S BAR)</option>
                          <option value="25">25 KG (SQUAT / POWER BAR)</option>
                        </>
                      ) : (
                        <>
                          <option value="45">45 LBS (STANDARD OLYMPIC BAR)</option>
                          <option value="35">35 LBS (WOMEN'S BAR)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Quick Weight Chips */}
                <div className="quick-weights-chips">
                  <span className="chip-label">QUICK TARGET PRESETS:</span>
                  <div className="chips-list">
                    {barbellInputs.unit === 'kg' ? (
                      ['60', '100', '140', '180', '220'].map(w => (
                        <button key={w} className="w-chip" onClick={() => {
                          setBarbellInputs({ ...barbellInputs, targetWeight: w });
                          handleBarbellMath(w, barbellInputs.unit, barbellInputs.barWeight);
                        }}>
                          {w} kg
                        </button>
                      ))
                    ) : (
                      ['135', '225', '315', '405', '495'].map(w => (
                        <button key={w} className="w-chip" onClick={() => {
                          setBarbellInputs({ ...barbellInputs, targetWeight: w });
                          handleBarbellMath(w, barbellInputs.unit, barbellInputs.barWeight);
                        }}>
                          {w} lbs
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Visual Barbell Sleeve Canvas */}
              {barbellResult && (
                <div className="barbell-visual-card glass-card">
                  <div className="visual-header">
                    <span className="cyber-badge blue">LOAD ON EACH SIDE</span>
                    <h3>SLEEVE WEIGHT: <span className="neon-blue">{barbellResult.weightPerSleeve} {barbellResult.unit.toUpperCase()}</span></h3>
                  </div>

                  {/* Canvas SVG Sleeve */}
                  <div className="barbell-sleeve-canvas">
                    <div className="bar-shaft"></div>
                    <div className="bar-collar"></div>

                    {/* Loaded Plates Stack */}
                    <div className="plates-stack">
                      {barbellResult.loadedPlatesPerSleeve.map((plate, i) => (
                        <div 
                          key={i} 
                          className="plate-disc"
                          style={{
                            backgroundColor: plate.color,
                            height: `${Math.min(180, 80 + plate.weight * 3.5)}px`,
                            border: plate.color === '#ffffff' ? '1px solid #999' : 'none'
                          }}
                          title={plate.label}
                        >
                          <span className="plate-label-text">{plate.weight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="plates-summary-box">
                    <h4>LOAD EACH SIDE WITH:</h4>
                    {barbellResult.loadedPlatesPerSleeve.length === 0 ? (
                      <p className="no-plates-text">Empty Bar ({barbellResult.barWeight} {barbellResult.unit.toUpperCase()})</p>
                    ) : (
                      <div className="plates-tags-list">
                        {barbellResult.loadedPlatesPerSleeve.map((p, idx) => (
                          <span key={idx} className="plate-tag" style={{ borderLeftColor: p.color }}>
                            {p.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ToolsHub;
