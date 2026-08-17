import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Dashboard.css';
import './Training.css';
import ThemeToggle from './ThemeToggle';
import ApiKeyModal from './ApiKeyModal';
import UserProfileModal from './UserProfileModal';

const Training = ({ user, updateAvatar, onSaveProfile, onLogout }) => {
  const location = useLocation();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('gym'); // 'gym' | 'home' | 'rehab'
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');

  const avatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png'
  ];

  const muscleGroups = ['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'REHAB'];

  const trainingData = {
    gym: [
      {
        id: 101,
        title: "BARBELL SQUAT",
        muscleGroup: "LEGS",
        type: "Strength",
        video: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
        youtubeId: "gcNh17Ckjgg",
        tips: "Keep core braced and drive through mid-foot. Depth should be at or below parallel for maximum glute & quad activation.",
        protocol: ["4 Sets", "8-12 Reps", "90s Rest"]
      },
      {
        id: 102,
        title: "CABLE CHEST FLY",
        muscleGroup: "CHEST",
        type: "Hypertrophy",
        video: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
        youtubeId: "eGjt4lk6g34",
        tips: "Focus on the squeeze at peak contraction. Maintain a slight elbow bend and stretch the pectoral fibers wide.",
        protocol: ["3 Sets", "15 Reps", "60s Rest"]
      },
      {
        id: 103,
        title: "INCLINE DUMBBELL PRESS",
        muscleGroup: "CHEST",
        type: "Hypertrophy",
        video: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
        youtubeId: "8iPEnn-ltC8",
        tips: "Set bench at 30 degrees. Retract scapula, lower dumbells under control to upper chest line, press up aggressively.",
        protocol: ["4 Sets", "10 Reps", "75s Rest"]
      },
      {
        id: 104,
        title: "BARBELL BENT OVER ROW",
        muscleGroup: "BACK",
        type: "Strength",
        video: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80",
        youtubeId: "VKFeB7jy8v0",
        tips: "Hinge at 45° angle. Pull bar toward lower ribs while driving elbows behind torso for maximum lat & rhomboid density.",
        protocol: ["4 Sets", "8-10 Reps", "90s Rest"]
      },
      {
        id: 105,
        title: "WIDE GRIP LAT PULLDOWN",
        muscleGroup: "BACK",
        type: "Hypertrophy",
        video: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80",
        youtubeId: "CAwf7n6Luuc",
        tips: "Depress shoulder blades before pulling. Drive elbows down to your sides and pull bar to upper sternum.",
        protocol: ["3 Sets", "12 Reps", "60s Rest"]
      },
      {
        id: 106,
        title: "OVERHEAD BARBELL PRESS (OHP)",
        muscleGroup: "SHOULDERS",
        type: "Power",
        video: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&auto=format&fit=crop&q=80",
        youtubeId: "2yjwXTZQDDI",
        tips: "Squeeze glutes and brace abs tightly. Press bar straight up, clearing your chin, locking out overhead.",
        protocol: ["4 Sets", "6-8 Reps", "120s Rest"]
      },
      {
        id: 107,
        title: "DUMBBELL BICEP CURLS",
        muscleGroup: "ARMS",
        type: "Hypertrophy",
        video: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
        youtubeId: "ykJmrZ5v0Oo",
        tips: "Keep upper arms stationary. Supinate wrists at top for maximum biceps brachii peak contraction.",
        protocol: ["3 Sets", "12 Reps", "60s Rest"]
      },
      {
        id: 108,
        title: "TRICEPS ROPE PUSHDOWN",
        muscleGroup: "ARMS",
        type: "Hypertrophy",
        video: "https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600&auto=format&fit=crop&q=80",
        youtubeId: "vB5OHsJ3EME",
        tips: "Keep elbows pinned to your ribs. Flare the rope ends outward at lockout for lateral head triceps engagement.",
        protocol: ["4 Sets", "15 Reps", "45s Rest"]
      },
      {
        id: 109,
        title: "BARBELL CONVENTIONAL DEADLIFT",
        muscleGroup: "BACK",
        type: "Power",
        video: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
        youtubeId: "op9kVnSso6Q",
        tips: "Bar over mid-foot. Pull slack out of bar, wedge hips into bar, drive floor away with leg push then glute lockout.",
        protocol: ["4 Sets", "5 Reps", "180s Rest"]
      },
      {
        id: 110,
        title: "HANGING LEG RAISES",
        muscleGroup: "CORE",
        type: "Core",
        video: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
        youtubeId: "hdng3Nm1x_E",
        tips: "Hang from pull-up bar without swinging. Curl pelvis upward bringing feet to bar height to overload lower abs.",
        protocol: ["3 Sets", "15 Reps", "45s Rest"]
      }
    ],
    home: [
      {
        id: 201,
        title: "EXPLOSIVE DECLINE PUSHUPS",
        muscleGroup: "CHEST",
        type: "Power",
        video: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80",
        youtubeId: "IODxDxX7oi4",
        tips: "Explode off floor with maximum force. Maintain rigid plank alignment with glutes squeezed and elbows tucked 45°.",
        protocol: ["4 Sets", "To Failure", "60s Rest"]
      },
      {
        id: 202,
        title: "HIGH KNEE SPRINTS & CARDIO BURN",
        muscleGroup: "LEGS",
        type: "Cardio",
        video: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=80",
        youtubeId: "Z5dBA9oW32s",
        tips: "Drive knees up to hip level violently. Stay on balls of feet, pump arms fast, and maintain rapid cadence.",
        protocol: ["5 Rounds", "30s Work", "30s Rest"]
      },
      {
        id: 203,
        title: "BULGARIAN SPLIT SQUATS",
        muscleGroup: "LEGS",
        type: "Hypertrophy",
        video: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=80",
        youtubeId: "2C-uNgKwPLE",
        tips: "Place rear foot elevated on couch or chair. Lower hips straight down into deep single-leg knee flexion.",
        protocol: ["3 Sets", "12 Reps/Leg", "60s Rest"]
      },
      {
        id: 204,
        title: "PIKE PUSHUPS (DELTOID BLAST)",
        muscleGroup: "SHOULDERS",
        type: "Strength",
        video: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&auto=format&fit=crop&q=80",
        youtubeId: "sposDXWEB08",
        tips: "Form an inverted V body shape. Lower head forward between hands to transfer bodyweight to anterior shoulders.",
        protocol: ["4 Sets", "10 Reps", "60s Rest"]
      },
      {
        id: 205,
        title: "DIAMOND PUSHUPS (TRICEPS FOCUS)",
        muscleGroup: "ARMS",
        type: "Hypertrophy",
        video: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
        youtubeId: "J0DnG1_S92I",
        tips: "Touch thumbs and index fingers together below lower chest. Tuck elbows tight to torso to isolate triceps.",
        protocol: ["3 Sets", "15 Reps", "45s Rest"]
      },
      {
        id: 206,
        title: "HOLLOW BODY HOLD & CORE LOCK",
        muscleGroup: "CORE",
        type: "Core",
        video: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
        youtubeId: "LlDNef_Ztsc",
        tips: "Press lower back completely flat against floor. Extend arms overhead and legs 6 inches off ground with full core tension.",
        protocol: ["4 Sets", "45s Hold", "30s Rest"]
      },
      {
        id: 207,
        title: "INVERTED BODYWEIGHT ROW",
        muscleGroup: "BACK",
        type: "Strength",
        video: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop&q=80",
        youtubeId: "XZV9IwluPjw",
        tips: "Set up under sturdy table edge or bar. Pull chest up to bar driving elbows back with glutes squeezed.",
        protocol: ["4 Sets", "15 Reps", "45s Rest"]
      }
    ],
    rehab: [
      {
        id: 301,
        title: "ROTATOR CUFF REPAIR & EXTERNAL ROTATION",
        muscleGroup: "REHAB",
        type: "Shoulder Rehab",
        video: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
        youtubeId: "kS8Lz_mR8O8",
        tips: "Use light resistance bands or towel. Keep elbow pinned to side and externally rotate forearm without shrugging shoulder.",
        protocol: ["3 Sets", "20 Reps", "Daily"]
      },
      {
        id: 302,
        title: "KNEE STABILITY & VMO ACTIVATION GRID",
        muscleGroup: "REHAB",
        type: "Knee Rehab",
        video: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
        youtubeId: "W-c2L8dE5C8",
        tips: "Single-leg balance and terminal knee extension. Strengthens tear-drop quad (VMO) to stabilize patellar tracking.",
        protocol: ["3 Sets", "12 Reps/Leg", "48h Interval"]
      },
      {
        id: 303,
        title: "LUMBAR DECOMPRESSION & MCKENZIE EXTENSION",
        muscleGroup: "REHAB",
        type: "Back Rehab",
        video: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
        youtubeId: "2VNTW-C2bN4",
        tips: "Prone cobra press-ups. Relieves disc pressure, centralizes lower back pain, and restores spinal extension mobility.",
        protocol: ["3 Sets", "10 Slow Reps", "Daily"]
      },
      {
        id: 304,
        title: "ACHILLES TENDON & ANKLE DORSIFLEXION",
        muscleGroup: "REHAB",
        type: "Ankle Rehab",
        video: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
        youtubeId: "1kEwb9wOaFA",
        tips: "Eccentric calf drops on step edge. Restores ankle flex angle needed for deep knee bend and squat depth.",
        protocol: ["3 Sets", "15 Reps/Foot", "Daily"]
      },
      {
        id: 305,
        title: "ELBOW & WRIST TENDINITIS DECOMPRESSION",
        muscleGroup: "REHAB",
        type: "Elbow Rehab",
        video: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
        youtubeId: "W3fW_7sPUpE",
        tips: "Wrist flexor/extensor eccentric loading. Eliminates tennis and golfer's elbow pain from heavy barbell pulling.",
        protocol: ["3 Sets", "20 Reps", "Daily"]
      },
      {
        id: 306,
        title: "THORACIC MOBILITY & CERVICAL RETRACTION",
        muscleGroup: "REHAB",
        type: "Neck/Posture",
        video: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
        youtubeId: "R4a6x24cM84",
        tips: "Chin tucks and foam roller T-spine openers. Reverses forward head posture and unlocks tight upper thoracic spine.",
        protocol: ["3 Sets", "12 Reps", "Daily"]
      }
    ]
  };

  const [playingVideo, setPlayingVideo] = useState(null);

  // Filter exercises by muscle group if not 'ALL'
  const filteredExercises = trainingData[activeTab].filter(item => {
    if (selectedMuscle === 'ALL') return true;
    return item.muscleGroup.toUpperCase() === selectedMuscle.toUpperCase();
  });

  return (
    <div className="dashboard-container training-vault">
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
          <div className="header-subtitle">/ FULL BODY EXERCISE CATALOG</div>
          <h1>TRAINING <span className="neon-orange">VAULT</span></h1>
          <p>Access high-performance protocols for Gym, Home, and Injury Rehabilitation across all body parts.</p>
        </header>

        {/* Top Environment Tabs */}
        <div className="category-switcher">
          <button className={activeTab === 'gym' ? 'active' : ''} onClick={() => setActiveTab('gym')}>
            🏋️ GYM POWER ({trainingData.gym.length})
          </button>
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
            🏠 HOME ELITE ({trainingData.home.length})
          </button>
          <button className={activeTab === 'rehab' ? 'active' : ''} onClick={() => setActiveTab('rehab')}>
            🩹 INJURY REHAB ({trainingData.rehab.length})
          </button>
        </div>

        {/* Muscle Group Filter Bar */}
        <div className="muscle-filter-bar glass-card">
          <span className="filter-title">FILTER BY BODY PART:</span>
          <div className="muscle-chips">
            {muscleGroups.map(group => (
              <button
                key={group}
                className={`muscle-chip ${selectedMuscle === group ? 'active' : ''}`}
                onClick={() => setSelectedMuscle(group)}
              >
                {group === 'ALL' ? '⚡ ALL BODY PARTS' : group}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length === 0 ? (
          <div className="empty-training-state glass-card">
            <p>No protocols found for body part: <strong>{selectedMuscle}</strong> under <strong>{activeTab.toUpperCase()}</strong> tab.</p>
            <button className="reset-filter-btn" onClick={() => setSelectedMuscle('ALL')}>
              SHOW ALL BODY PARTS
            </button>
          </div>
        ) : (
          <div className="training-grid">
            {filteredExercises.map(item => (
              <div key={item.id} className="training-card glass-card animate-fade-in">
                <div 
                  className="video-placeholder" 
                  style={{ backgroundImage: `url(${item.video})` }} 
                  onClick={() => setPlayingVideo(item.youtubeId)}
                >
                  <div className="play-button">▶</div>
                  <div className="badge">{item.type}</div>
                  <div className="muscle-badge">{item.muscleGroup}</div>
                </div>
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p className="tips">{item.tips}</p>
                  <div className="protocol-row">
                    {item.protocol.map((p, i) => (
                      <div key={i} className="protocol-item">
                        <span className="p-value">{p.split(' ')[0]}</span>
                        <span className="p-label">{p.split(' ').slice(1).join(' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {playingVideo && (
        <div className="modal-overlay" onClick={() => setPlayingVideo(null)}>
          <div className="video-modal-content glass-card" onClick={e => e.stopPropagation()}>
            <button className="close-video-btn" onClick={() => setPlayingVideo(null)}>×</button>
            <div className="iframe-container">
              <iframe 
                src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
                title="Training Protocol"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="modal-fallback-bar">
              <span>Having trouble loading video inside player?</span>
              <a 
                href={`https://www.youtube.com/watch?v=${playingVideo}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-yt-link"
              >
                OPEN ON YOUTUBE ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;

