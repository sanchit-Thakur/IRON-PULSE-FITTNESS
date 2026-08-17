import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE } from './config';
import ThemeToggle from './ThemeToggle';
import UserProfileModal from './UserProfileModal';
import './Dashboard.css';
import './ChatAssistant.css';

const ChatAssistant = ({ user, updateAvatar, onSaveProfile, onLogout, isWidgetOnly = false }) => {
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [isOpen, setIsOpen] = useState(!isWidgetOnly);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('squat');

  const avatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png'
  ];

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "⚡ **SYSTEM ONLINE: NEXUS-AI FORM & FACILITY ASSISTANT**\n\nWelcome back, Athlete. I am ready to analyze your lift biomechanics, check real-time equipment status, or find open coaching slots.",
      time: "SYSTEM INITIALIZED"
    }
  ]);

  const quickPrompts = [
    "🏋️ Barbell Squat Form Cues",
    "⚡ Is Squat Rack #2 available?",
    "📅 Slots for Coach Jax Sterling?",
    "💪 Bench Press Elbow Alignment",
    "🔥 Deadlift Spine & Slack Cues",
    "🧊 Cryo Therapy Pod status?"
  ];

  const biomechanicsGuide = {
    squat: {
      title: "BARBELL SQUAT MECHANICS",
      target: "Quads, Glutes & Core Stabilization",
      cues: [
        "Brace 360° into abdomen with Valsalva maneuver prior to un-racking.",
        "Hip crease MUST reach at or below the top of knees (parallel depth).",
        "Knees track outward in line with 2nd/3rd toes; avoid knee valgus collapses.",
        "Maintain mid-foot tripod pressure (heel, big toe joint, pinky toe joint)."
      ],
      warning: "Avoid 'butt-wink' (posterior pelvic tilt) at depth—limit range to active hip flexion or improve ankle dorsiflexion."
    },
    bench: {
      title: "BARBELL BENCH PRESS PROTOCOL",
      target: "Pectoralis Major, Anterior Deltoid & Triceps",
      cues: [
        "Retract and depress scapula into bench pad like locking a vise.",
        "Tuck elbows at 45°-60° angle to your torso; avoid 90° flare.",
        "Drive heels firmly into floor to engage kinetic leg drive.",
        "Lower bar with control to lower sternum before pressing vertically."
      ],
      warning: "Do not let wrists bend backward past 90° under load—keep wrists stacked straight over elbows."
    },
    deadlift: {
      title: "CONVENTIONAL / SUMO DEADLIFT",
      target: "Posterior Chain, Glutes, Hamstrings & Latissimus",
      cues: [
        "Set up with bar 1 inch from shins over exact mid-foot.",
        "Hinge hips back, engage lats by trying to 'break the bar' around your legs.",
        "Pull slack out of bar before applying vertical floor push.",
        "Lock out by squeezing glutes at top—never over-extend lumbar spine."
      ],
      warning: "Never start floor drive with rounded thoracic or lumbar spine unless trained in specific Jefferson lifts."
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await response.json();

      setIsTyping(false);

      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: data.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: "⚠️ System connection interrupted. Unable to reach Iron Pulse AI Core.",
            time: "ERROR"
          }
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "⚠️ Offline Response Mode: Could not connect to backend server. Make sure the server is running.",
          time: "OFFLINE"
        }
      ]);
    }
  };

  // Helper to format text with simple markdown bolding
  const formatMarkdown = (text) => {
    return text.split('\n').map((line, lineIndex) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lineIndex} className="chat-paragraph">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="neon-orange">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // If used strictly as a floating widget on other pages
  if (isWidgetOnly) {
    return (
      <div className="floating-chat-widget-container">
        {!isOpen ? (
          <button 
            className="floating-chat-toggle-btn"
            onClick={() => setIsOpen(true)}
            title="Open AI Form-Check & FAQ Bot"
          >
            <div className="bot-pulse-ring"></div>
            <span className="bot-icon">🤖</span>
            <span className="bot-label">AI ASSISTANT</span>
            <span className="status-badge-dot"></span>
          </button>
        ) : (
          <div className="chat-widget-modal glass-card animate-fade-in">
            <header className="widget-header">
              <div className="header-left">
                <div className="cyber-avatar-ring">🤖</div>
                <div>
                  <h4>NEXUS-AI <span className="neon-orange">ASSISTANT</span></h4>
                  <span className="status-text">🟢 BIOMETRIC ENGINE ACTIVE</span>
                </div>
              </div>
              <button className="close-widget-btn" onClick={() => setIsOpen(false)}>×</button>
            </header>

            <div className="widget-quick-chips">
              {quickPrompts.slice(0, 3).map((prompt, idx) => (
                <button key={idx} className="chip-btn" onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <div className="widget-messages-container">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="chat-bubble">
                    {formatMarkdown(msg.text)}
                    <span className="msg-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble-row bot">
                  <div className="chat-bubble typing-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="widget-input-area" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
              <input 
                type="text" 
                placeholder="Ask squat form, rack status, or trainer slots..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" className="send-btn">TRANSMIT</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Full Page Mode (/assistant)
  return (
    <div className="dashboard-container assistant-full-page">
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
          <ThemeToggle />
          <div className="user-profile" onClick={() => setShowAvatarModal(true)}>
            <span>{user.name.toUpperCase()}</span>
            <div className="avatar-preview" style={{ backgroundImage: `url(${user.avatar})` }}></div>
          </div>
          <button className="logout-btn" onClick={onLogout}>EXIT</button>
        </div>
      </nav>

      <UserProfileModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} user={user} onSaveProfile={onSaveProfile || updateAvatar} />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-subtitle">/ BIOMETRIC INTELLIGENCE ENGINE</div>
          <h1>AI FORM-CHECK <span className="neon-orange">& FAQ BOT</span></h1>
          <p>Instant answers for lift mechanics, trainer booking slots, and equipment availability.</p>
        </header>

        <div className="assistant-layout-grid">
          {/* Left Column: Biomechanics Manual & Live Monitor */}
          <div className="assistant-sidebar-col">
            <div className="biomechanics-card glass-card">
              <div className="card-header-row">
                <span className="cyber-badge orange">FORM-CHECK MANUAL</span>
                <h3>BIOMECHANICS <span className="neon-blue">VAULT</span></h3>
              </div>

              <div className="guide-tabs">
                <button 
                  className={activeFormTab === 'squat' ? 'active' : ''} 
                  onClick={() => setActiveFormTab('squat')}
                >
                  SQUAT
                </button>
                <button 
                  className={activeFormTab === 'bench' ? 'active' : ''} 
                  onClick={() => setActiveFormTab('bench')}
                >
                  BENCH
                </button>
                <button 
                  className={activeFormTab === 'deadlift' ? 'active' : ''} 
                  onClick={() => setActiveFormTab('deadlift')}
                >
                  DEADLIFT
                </button>
              </div>

              <div className="guide-content">
                <h4>{biomechanicsGuide[activeFormTab].title}</h4>
                <p className="guide-target">🎯 <strong>Target:</strong> {biomechanicsGuide[activeFormTab].target}</p>

                <h5>KEY EXECUTION CUES:</h5>
                <ul className="cues-list">
                  {biomechanicsGuide[activeFormTab].cues.map((cue, idx) => (
                    <li key={idx}><span className="cue-bullet">⚡</span> {cue}</li>
                  ))}
                </ul>

                <div className="warning-box">
                  <strong>⚠️ RED-FLAG WARNING:</strong>
                  <p>{biomechanicsGuide[activeFormTab].warning}</p>
                </div>
              </div>
            </div>

            {/* Live Equipment Quick Status */}
            <div className="equipment-status-card glass-card">
              <div className="card-header-row">
                <span className="cyber-badge green">LIVE MONITOR</span>
                <h3>FACILITY <span className="neon-green">EQUIPMENT FEED</span></h3>
              </div>
              <ul className="equipment-list">
                <li>
                  <span className="eq-name">Barbell Squat Rack #1</span>
                  <span className="eq-status busy">In Use (8m)</span>
                </li>
                <li>
                  <span className="eq-name">Barbell Squat Rack #2</span>
                  <span className="eq-status free">AVAILABLE NOW</span>
                </li>
                <li>
                  <span className="eq-name">Cable Crossover Bay A</span>
                  <span className="eq-status free">AVAILABLE NOW</span>
                </li>
                <li>
                  <span className="eq-name">Cryo Pod Recovery #1</span>
                  <span className="eq-status free">AVAILABLE NOW</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Chat Console */}
          <div className="assistant-main-console glass-card">
            <header className="console-header">
              <div className="console-brand">
                <div className="bot-avatar">🤖</div>
                <div>
                  <h3>NEXUS-AI <span className="neon-orange">CORE CONSOLE</span></h3>
                  <p className="console-sub">Direct Neural Terminal • Gemini Flash Integrated</p>
                </div>
              </div>
              <span className="live-pill">LIVE FEED</span>
            </header>

            <div className="prompts-bar">
              <span className="prompt-label">QUICK QUERY:</span>
              <div className="prompts-chips-scroll">
                {quickPrompts.map((prompt, idx) => (
                  <button key={idx} className="chip-btn" onClick={() => sendMessage(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="full-messages-container">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="chat-avatar-tag">{msg.sender === 'bot' ? 'NEXUS' : 'YOU'}</div>
                  <div className="chat-bubble">
                    {formatMarkdown(msg.text)}
                    <span className="msg-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble-row bot">
                  <div className="chat-avatar-tag">NEXUS</div>
                  <div className="chat-bubble typing-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="typing-text">Processing Biomechanical & Facility Data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="console-input-bar" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
              <input 
                type="text"
                placeholder="Type your question about form, equipment status, or trainer schedules..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" className="console-send-btn">
                SEND COMMAND →
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatAssistant;
