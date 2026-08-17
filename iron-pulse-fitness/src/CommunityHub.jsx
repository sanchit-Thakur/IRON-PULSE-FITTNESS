import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import ApiKeyModal from './ApiKeyModal';
import UserProfileModal from './UserProfileModal';
import './Dashboard.css';
import './CommunityHub.css';

const CommunityHub = ({ user, updateAvatar, onSaveProfile, onLogout }) => {
  const location = useLocation();

  const [activeSection, setActiveSection] = useState('crowd'); // 'crowd' | 'leaderboard' | 'playlist'
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);

  // Crowd Meter State
  const [crowdData, setCrowdData] = useState(null);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedLeaderboardCat, setSelectedLeaderboardCat] = useState('ALL');
  const [showPrModal, setShowPrModal] = useState(false);
  const [newPrForm, setNewPrForm] = useState({
    milestone: '',
    category: 'LIFTS',
    badge: '🔥 LIFETIME PR',
    details: ''
  });
  const [isSubmittingPr, setIsSubmittingPr] = useState(false);

  // Playlists State
  const [playlists, setPlaylists] = useState([]);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState(null);

  const avatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png'
  ];

  // Fetch Community Data
  const fetchCommunityData = async () => {
    try {
      const [cmRes, lbRes, plRes] = await Promise.all([
        fetch('http://localhost:5001/api/community/crowd-meter'),
        fetch('http://localhost:5001/api/community/leaderboard'),
        fetch('http://localhost:5001/api/community/playlists')
      ]);

      const cmData = await cmRes.json();
      const lbData = await lbRes.json();
      const plData = await plRes.json();

      if (cmData.success) setCrowdData(cmData.data);
      if (lbData.success) setLeaderboard(lbData.leaderboard);
      if (plData.success) {
        setPlaylists(plData.playlists);
        if (plData.playlists.length > 0) setSelectedVibe(plData.playlists[0]);
      }
    } catch (err) {
      console.error('Error loading community hub data:', err);
      // Fallback data if server offline
      setCrowdData({
        capacityPercent: 76,
        statusLabel: "PEAK TRAFFIC HOUR",
        recommendedWindow: "01:00 PM - 03:30 PM",
        zones: [
          { name: "Heavy Barbell Rack Zone", occupancy: 88, status: "PEAK 🔴" },
          { name: "Isolation Cable Bay", occupancy: 62, status: "MODERATE 🟡" },
          { name: "Conditioning Turf Track", occupancy: 45, status: "QUIET 🟢" },
          { name: "Cryo & Hyperbaric Recovery Lab", occupancy: 25, status: "QUIET 🟢" }
        ],
        hourlyForecast: [
          { hour: "06 AM", traffic: 35 }, { hour: "08 AM", traffic: 85 },
          { hour: "10 AM", traffic: 40 }, { hour: "12 PM", traffic: 50 },
          { hour: "02 PM", traffic: 20 }, { hour: "04 PM", traffic: 60 },
          { hour: "06 PM", traffic: 95 }, { hour: "08 PM", traffic: 65 },
          { hour: "10 PM", traffic: 20 }
        ]
      });

      setLeaderboard([
        {
          id: "pr-1",
          athleteName: "DEMON ATHLETE",
          avatar: "/avatars/avatar1.png",
          category: "LIFTS",
          badge: "🔥 HEAVY LIFT PR",
          milestone: "260 KG BARBELL CONVENTIONAL DEADLIFT",
          details: "New 1RM lifetime PR set in Bay 2 under Coach Jax Sterling.",
          cheers: 142,
          date: "TODAY"
        },
        {
          id: "pr-2",
          athleteName: "SARAH VANCE",
          avatar: "/avatars/avatar3.png",
          category: "LIFTS",
          badge: "⚡ SQUAT MILESTONE",
          milestone: "140 KG BARBELL SQUAT (PAUSED 3s)",
          details: "Parallel depth achieved cleanly without pelvic tilt.",
          cheers: 98,
          date: "YESTERDAY"
        }
      ]);

      setPlaylists([
        {
          id: "vibe-1",
          name: "🔥 HEAVY LIFT / PR DAY",
          genre: "Metal & Aggressive Rock",
          bpm: "140 - 180 BPM",
          spotifyEmbedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX76t638V648v?utm_source=generator&theme=0",
          tracks: [
            { title: "Till I Collapse", artist: "Eminem", duration: "4:57" },
            { title: "Bulls On Parade", artist: "Rage Against The Machine", duration: "3:51" }
          ]
        }
      ]);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  // Cheer / Upvote milestone handler
  const handleCheer = async (id) => {
    setLeaderboard(prev => prev.map(item => {
      if (item.id === id) return { ...item, cheers: item.cheers + 1 };
      return item;
    }));

    try {
      await fetch(`http://localhost:5001/api/community/leaderboard/${id}/cheer`, {
        method: 'POST'
      });
    } catch (err) {
      console.warn('Cheer request saved locally');
    }
  };

  // Submit new PR handler
  const handleSubmitPr = async (e) => {
    e.preventDefault();
    if (!newPrForm.milestone.trim()) return;

    setIsSubmittingPr(true);
    const payload = {
      athleteName: user.name.toUpperCase(),
      avatar: user.avatar,
      category: newPrForm.category,
      badge: newPrForm.badge,
      milestone: newPrForm.milestone,
      details: newPrForm.details || "Verified member PR milestone at Iron Pulse Facility"
    };

    try {
      const response = await fetch('http://localhost:5001/api/community/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        setLeaderboard(prev => [data.entry, ...prev]);
      }
    } catch (err) {
      // Local fallback insertion
      const localEntry = {
        id: `pr-${Date.now()}`,
        ...payload,
        cheers: 1,
        date: "JUST NOW"
      };
      setLeaderboard(prev => [localEntry, ...prev]);
    } finally {
      setIsSubmittingPr(false);
      setShowPrModal(false);
      setNewPrForm({ milestone: '', category: 'LIFTS', badge: '🔥 LIFETIME PR', details: '' });
    }
  };

  // Filtered Leaderboard Items
  const filteredLeaderboard = leaderboard.filter(item => {
    if (selectedLeaderboardCat === 'ALL') return true;
    return item.category === selectedLeaderboardCat;
  });

  return (
    <div className="dashboard-container community-hub">
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
          <div className="header-subtitle">/ GAMIFICATION & COMMUNITY RETENTION</div>
          <h1>COMMUNITY <span className="neon-orange">HYPE CENTER</span></h1>
          <p>Real-time gym crowd tracking, digital member PR leaderboard, and high-energy workout music.</p>
        </header>

        {/* Section Navigation Tabs */}
        <div className="community-nav-tabs">
          <button 
            className={activeSection === 'crowd' ? 'active' : ''} 
            onClick={() => setActiveSection('crowd')}
          >
            📊 LIVE CROWD METER & TRAFFIC
          </button>
          <button 
            className={activeSection === 'leaderboard' ? 'active' : ''} 
            onClick={() => setActiveSection('leaderboard')}
          >
            🏆 MEMBER PR LEADERBOARD ({leaderboard.length})
          </button>
          <button 
            className={activeSection === 'playlist' ? 'active' : ''} 
            onClick={() => setActiveSection('playlist')}
          >
            🎧 WORKOUT PLAYLIST INTEGRATOR
          </button>
        </div>

        {/* SECTION 1: LIVE CROWD METER & TRAFFIC TRACKER */}
        {activeSection === 'crowd' && crowdData && (
          <div className="crowd-section-container animate-fade-in">
            <div className="crowd-top-grid">
              {/* Capacity Ring Meter */}
              <div className="capacity-card glass-card">
                <span className="cyber-badge orange">REAL-TIME TRAFFIC MONITOR</span>
                <h3>FACILITY <span className="neon-orange">OCCUPANCY</span></h3>

                <div className="capacity-gauge-wrapper">
                  <div className="gauge-circle">
                    <span className="gauge-percent neon-orange">{crowdData.capacityPercent}%</span>
                    <span className="gauge-label">{crowdData.statusLabel}</span>
                  </div>
                </div>

                <div className="quiet-window-box">
                  <span className="window-icon">💡</span>
                  <div>
                    <strong>RECOMMENDED QUIET TRAINING WINDOW:</strong>
                    <p className="neon-green">{crowdData.recommendedWindow} (Lowest Occupancy)</p>
                  </div>
                </div>
              </div>

              {/* Zone Occupancy Breakdown */}
              <div className="zones-card glass-card">
                <span className="cyber-badge blue">LIVE ZONES MONITOR</span>
                <h3>EQUIPMENT <span className="neon-blue">ZONE DENSITY</span></h3>

                <div className="zones-list">
                  {crowdData.zones.map((zone, idx) => (
                    <div key={idx} className="zone-item">
                      <div className="zone-info">
                        <span className="z-name">{zone.name}</span>
                        <span className="z-status">{zone.status}</span>
                      </div>
                      <div className="zone-progress-bar">
                        <div 
                          className="zone-progress-fill" 
                          style={{ 
                            width: `${zone.occupancy}%`,
                            background: zone.occupancy > 75 ? 'var(--crimson)' : (zone.occupancy > 50 ? 'var(--primary)' : 'var(--acid-green)') 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hourly Heatmap Bar Graph */}
            <div className="heatmap-card glass-card">
              <div className="heatmap-header">
                <h3>24-HOUR HOURLY <span className="neon-orange">TRAFFIC HEATMAP</span></h3>
                <span className="heatmap-sub">Plan your sessions around peak vs quiet facility hours</span>
              </div>

              <div className="bars-chart-container">
                {crowdData.hourlyForecast.map((point, idx) => (
                  <div key={idx} className="bar-column">
                    <div className="bar-wrapper">
                      <div 
                        className={`bar-fill ${point.traffic > 75 ? 'peak' : (point.traffic > 45 ? 'moderate' : 'quiet')}`}
                        style={{ height: `${point.traffic}%` }}
                      >
                        <span className="bar-tooltip">{point.traffic}% Occupied ({point.density || 'Normal'})</span>
                      </div>
                    </div>
                    <span className="bar-hour">{point.hour}</span>
                  </div>
                ))}
              </div>

              <div className="chart-legend">
                <span className="legend-item"><span className="dot quiet"></span> QUIET (&lt; 45%)</span>
                <span className="legend-item"><span className="dot moderate"></span> MODERATE (45% - 75%)</span>
                <span className="legend-item"><span className="dot peak"></span> PEAK TRAFFIC (&gt; 75%)</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: COMMUNITY PR LEADERBOARD */}
        {activeSection === 'leaderboard' && (
          <div className="leaderboard-section-container animate-fade-in">
            <div className="leaderboard-control-bar glass-card">
              <div className="cat-filters">
                <button 
                  className={selectedLeaderboardCat === 'ALL' ? 'active' : ''} 
                  onClick={() => setSelectedLeaderboardCat('ALL')}
                >
                  ⚡ ALL MILESTONES
                </button>
                <button 
                  className={selectedLeaderboardCat === 'LIFTS' ? 'active' : ''} 
                  onClick={() => setSelectedLeaderboardCat('LIFTS')}
                >
                  🔥 HEAVY LIFTS
                </button>
                <button 
                  className={selectedLeaderboardCat === 'RECOMP' ? 'active' : ''} 
                  onClick={() => setSelectedLeaderboardCat('RECOMP')}
                >
                  💪 BODY RECOMP
                </button>
                <button 
                  className={selectedLeaderboardCat === 'STREAKS' ? 'active' : ''} 
                  onClick={() => setSelectedLeaderboardCat('STREAKS')}
                >
                  🏆 STREAKS
                </button>
              </div>

              <button className="log-pr-btn" onClick={() => setShowPrModal(true)}>
                ➕ LOG YOUR PR / MILESTONE
              </button>
            </div>

            {/* Leaderboard Cards Grid */}
            <div className="leaderboard-grid">
              {filteredLeaderboard.map(item => (
                <div key={item.id} className="pr-card glass-card">
                  <div className="pr-card-header">
                    <div className="athlete-info">
                      <div className="athlete-avatar" style={{ backgroundImage: `url(${item.avatar})` }}></div>
                      <div>
                        <h4>{item.athleteName}</h4>
                        <span className="pr-date">{item.date}</span>
                      </div>
                    </div>
                    <span className="pr-badge">{item.badge}</span>
                  </div>

                  <div className="pr-milestone-box">
                    <h3>{item.milestone}</h3>
                    <p>{item.details}</p>
                  </div>

                  <div className="pr-card-footer">
                    <button className="cheer-btn" onClick={() => handleCheer(item.id)}>
                      🔥 +1 CHEER ({item.cheers})
                    </button>
                    <span className="verified-tag">⚡ VERIFIED MILESTONE</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit PR Modal */}
            {showPrModal && (
              <div className="modal-overlay" onClick={() => setShowPrModal(false)}>
                <div className="pr-modal glass-card" onClick={e => e.stopPropagation()}>
                  <header className="modal-header">
                    <h3>LOG YOUR <span className="neon-orange">MILESTONE / PR</span></h3>
                    <button className="close-btn" onClick={() => setShowPrModal(false)}>×</button>
                  </header>

                  <form className="pr-form" onSubmit={handleSubmitPr}>
                    <div className="input-group">
                      <label>MILESTONE TITLE (e.g. 240 KG DEADLIFT 1RM)</label>
                      <input 
                        type="text" 
                        placeholder="Enter exercise, weight, or streak..."
                        value={newPrForm.milestone}
                        onChange={(e) => setNewPrForm({ ...newPrForm, milestone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label>CATEGORY</label>
                        <select 
                          value={newPrForm.category}
                          onChange={(e) => setNewPrForm({ ...newPrForm, category: e.target.value })}
                        >
                          <option value="LIFTS">HEAVY LIFTS</option>
                          <option value="RECOMP">BODY RECOMP</option>
                          <option value="STREAKS">WORKOUT STREAK</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label>BADGE TAG</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 🔥 LIFETIME PR"
                          value={newPrForm.badge}
                          onChange={(e) => setNewPrForm({ ...newPrForm, badge: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>DETAILS / NOTES (OPTIONAL)</label>
                      <textarea 
                        placeholder="Describe sets, form cues, or time frame..."
                        value={newPrForm.details}
                        onChange={(e) => setNewPrForm({ ...newPrForm, details: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="submit-pr-btn" disabled={isSubmittingPr}>
                      {isSubmittingPr ? 'POSTING TO LEADERBOARD...' : 'SUBMIT TO COMMUNITY BOARD →'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: WORKOUT PLAYLIST INTEGRATOR */}
        {activeSection === 'playlist' && playlists.length > 0 && selectedVibe && (
          <div className="playlist-section-container animate-fade-in">
            {/* Vibe Tabs */}
            <div className="vibe-switcher-tabs glass-card">
              <span className="vibe-title">SELECT WORKOUT VIBE:</span>
              <div className="vibe-buttons">
                {playlists.map(pl => (
                  <button 
                    key={pl.id}
                    className={`vibe-btn ${selectedVibe.id === pl.id ? 'active' : ''}`}
                    onClick={() => setSelectedVibe(pl)}
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="playlist-player-grid">
              {/* Left Column: Spotify Embedded Player */}
              <div className="spotify-embed-card glass-card">
                <div className="player-header">
                  <span className="cyber-badge orange">{selectedVibe.genre}</span>
                  <h3>{selectedVibe.name}</h3>
                  <span className="bpm-badge">⚡ {selectedVibe.bpm}</span>
                </div>

                <div className="spotify-iframe-container">
                  <iframe 
                    src={selectedVibe.spotifyEmbedUrl}
                    width="100%" 
                    height="352" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    title="Spotify Workout Player"
                  ></iframe>
                </div>
              </div>

              {/* Right Column: Custom Tracklist & Audio Wave Visualizer */}
              <div className="tracklist-card glass-card">
                <div className="card-header-flex">
                  <h3>FEATURED <span className="neon-blue">HYPER-TRACKS</span></h3>
                  <a 
                    href="https://open.spotify.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="open-spotify-link"
                  >
                    OPEN IN SPOTIFY ↗
                  </a>
                </div>

                <div className="waveform-visualizer">
                  <div className="wave-bar"></div>
                  <div className="wave-bar tall"></div>
                  <div className="wave-bar short"></div>
                  <div className="wave-bar tall"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar short"></div>
                  <span className="wave-status">PLAYLIST SYNC ACTIVE</span>
                </div>

                <ul className="tracks-list">
                  {selectedVibe.tracks.map((track, idx) => (
                    <li 
                      key={idx}
                      className={`track-item ${currentPlayingTrack === track.title ? 'playing' : ''}`}
                      onClick={() => setCurrentPlayingTrack(track.title)}
                    >
                      <div className="track-left">
                        <button className="play-track-btn">
                          {currentPlayingTrack === track.title ? '⏸' : '▶'}
                        </button>
                        <div>
                          <span className="t-name">{track.title}</span>
                          <span className="t-artist">{track.artist}</span>
                        </div>
                      </div>
                      <span className="t-duration">{track.duration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityHub;
