import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import ApiKeyModal from './ApiKeyModal';
import UserProfileModal from './UserProfileModal';
import './Dashboard.css';
import './BookingPortal.css';

const BookingPortal = ({ user, updateAvatar, onSaveProfile, onLogout }) => {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'my-bookings'
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);

  // Filter States
  const [bookingType, setBookingType] = useState('trainer'); // 'trainer' | 'class'
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedIntensity, setSelectedIntensity] = useState('ALL');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('ALL'); // 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'

  // Booking Flow Steps
  const [currentStep, setCurrentStep] = useState(1); // 1: Type, 2: Select Item, 3: Date/Slot, 4: Confirmed Ticket
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-08-18');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Server Data
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const avatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png'
  ];

  // Upcoming week dates generator
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
      dates.push({ iso, dayName, monthDay, isToday: i === 0 });
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Fetch Trainers, Classes & Bookings from server
  const fetchPortalData = async () => {
    try {
      const [tRes, cRes, bRes] = await Promise.all([
        fetch('http://localhost:5001/api/trainers'),
        fetch('http://localhost:5001/api/classes'),
        fetch('http://localhost:5001/api/bookings')
      ]);

      const tData = await tRes.json();
      const cData = await cRes.json();
      const bData = await bRes.json();

      if (tData.success) setTrainers(tData.trainers);
      if (cData.success) setClasses(cData.classes);
      if (bData.success) setMyBookings(bData.bookings);
    } catch (err) {
      console.error('Error fetching portal data:', err);
      // Fallback mock data if server offline
      setTrainers([
        {
          id: "tr-1",
          name: "Coach Jax Sterling",
          role: "Head Strength Specialist",
          specialty: "Strength & Power",
          intensity: "High",
          rating: 4.98,
          bio: "Powerlifting record holder. Specializes in barbell mechanics, max-effort deadlifts, and hypertrophy blueprints.",
          avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=80",
          availableSlots: ["08:00 AM", "10:30 AM", "02:00 PM", "05:30 PM", "07:00 PM"]
        },
        {
          id: "tr-2",
          name: "Coach Kai Vance",
          role: "Biomechanical Rehab Specialist",
          specialty: "Mobility & Rehab",
          intensity: "Low",
          rating: 4.95,
          bio: "Physical therapist background. Expert in rotator cuff recovery, lumbar decompression, and mobility flow.",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          availableSlots: ["09:00 AM", "11:00 AM", "01:30 PM", "04:00 PM"]
        },
        {
          id: "tr-3",
          name: "Coach Elena Rostova",
          role: "Cyber-HIIT Lead",
          specialty: "HIIT & Endurance",
          intensity: "Extreme",
          rating: 4.99,
          bio: "Ex-Olympic sprinter. High-energy metabolic conditioning designed to push lactate thresholds.",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
          availableSlots: ["07:00 AM", "12:00 PM", "06:00 PM", "08:00 PM"]
        }
      ]);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  // Filter Logic
  const filteredTrainers = trainers.filter(t => {
    const matchSpecialty = selectedSpecialty === 'ALL' || t.specialty === selectedSpecialty;
    const matchIntensity = selectedIntensity === 'ALL' || t.intensity.toUpperCase() === selectedIntensity.toUpperCase();
    return matchSpecialty && matchIntensity;
  });

  const filteredClasses = classes.filter(c => {
    const matchSpecialty = selectedSpecialty === 'ALL' || c.specialty === selectedSpecialty;
    const matchIntensity = selectedIntensity === 'ALL' || c.intensity.toUpperCase() === selectedIntensity.toUpperCase();
    return matchSpecialty && matchIntensity;
  });

  // Filter Slots by Time Period
  const filterSlotsByPeriod = (slots) => {
    if (!slots) return [];
    if (selectedTimePeriod === 'ALL') return slots;
    return slots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      const isPM = slot.includes('PM');
      const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
      if (selectedTimePeriod === 'MORNING') return hour24 >= 6 && hour24 < 12;
      if (selectedTimePeriod === 'AFTERNOON') return hour24 >= 12 && hour24 < 17;
      if (selectedTimePeriod === 'EVENING') return hour24 >= 17 && hour24 <= 22;
      return true;
    });
  };

  // Submit Booking
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      setErrorMsg("Please select a valid date and time slot.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const isTrainer = bookingType === 'trainer';
    const payload = {
      type: bookingType,
      title: isTrainer ? `1-on-1 ${selectedTrainer.specialty}` : selectedClass.title,
      trainerName: isTrainer ? selectedTrainer.name : selectedClass.instructor,
      specialty: isTrainer ? selectedTrainer.specialty : selectedClass.specialty,
      date: selectedDate,
      time: selectedSlot,
      location: isTrainer ? "Iron Pulse Personal Coaching Bay 3" : selectedClass.room,
      intensity: isTrainer ? `${selectedTrainer.intensity} 🟠` : `${selectedClass.intensity} 🔴`
    };

    try {
      const response = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        setConfirmedBooking(data.booking);
        setMyBookings(prev => [data.booking, ...prev]);
        setCurrentStep(4);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      // Fallback offline confirmation
      const offlineBooking = {
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        status: "Confirmed",
        ticketCode: `IP-PASS-${Math.floor(1000 + Math.random() * 9000)}`
      };
      setConfirmedBooking(offlineBooking);
      setMyBookings(prev => [offlineBooking, ...prev]);
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      await fetch(`http://localhost:5001/api/bookings/${id}`, { method: 'DELETE' });
      setMyBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setMyBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const resetBookingFlow = () => {
    setCurrentStep(1);
    setSelectedTrainer(null);
    setSelectedClass(null);
    setSelectedSlot('');
    setConfirmedBooking(null);
    setErrorMsg(null);
  };

  return (
    <div className="dashboard-container booking-portal">
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
          <div className="header-subtitle">/ APPOINTMENTS & SESSIONS</div>
          <h1>TRAINER & CLASS <span className="neon-orange">BOOKING PORTAL</span></h1>
          <p>Reserve elite 1-on-1 personal coaches or cyber metabolic group sessions.</p>
        </header>

        {/* Top Sub-Tabs */}
        <div className="portal-sub-tabs">
          <button 
            className={activeTab === 'new' ? 'active' : ''} 
            onClick={() => { setActiveTab('new'); resetBookingFlow(); }}
          >
            ➕ SCHEDULE NEW SESSION
          </button>
          <button 
            className={activeTab === 'my-bookings' ? 'active' : ''} 
            onClick={() => setActiveTab('my-bookings')}
          >
            📋 MY ACTIVE BOOKINGS ({myBookings.length})
          </button>
        </div>

        {activeTab === 'new' ? (
          <div className="new-booking-workflow-container">
            {/* Step Progress Stepper */}
            <div className="stepper-bar glass-card">
              <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                <span className="step-num">01</span>
                <span className="step-text">SESSION TYPE</span>
              </div>
              <div className="step-divider"></div>
              <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
                <span className="step-num">02</span>
                <span className="step-text">TRAINER / CLASS</span>
              </div>
              <div className="step-divider"></div>
              <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                <span className="step-num">03</span>
                <span className="step-text">DATE & TIME</span>
              </div>
              <div className="step-divider"></div>
              <div className={`step-item ${currentStep >= 4 ? 'active' : ''}`}>
                <span className="step-num">04</span>
                <span className="step-text">CYBER PASS</span>
              </div>
            </div>

            {/* STEP 1: Select Session Type */}
            {currentStep === 1 && (
              <div className="step-content animate-fade-in">
                <h3 className="step-title">STEP 1: SELECT <span className="neon-blue">SESSION CATEGORY</span></h3>
                
                <div className="session-type-grid">
                  <div 
                    className={`type-card glass-card ${bookingType === 'trainer' ? 'selected' : ''}`}
                    onClick={() => setBookingType('trainer')}
                  >
                    <div className="type-badge neon-orange">1-ON-1 COACHING</div>
                    <div className="type-icon">🏋️‍♂️</div>
                    <h3>PERSONAL TRAINER SLOT</h3>
                    <p>Dedicated biomechanical analysis, direct bar path coaching, and custom max-effort programming.</p>
                    <span className="type-action">SELECT TRAINER →</span>
                  </div>

                  <div 
                    className={`type-card glass-card ${bookingType === 'class' ? 'selected' : ''}`}
                    onClick={() => setBookingType('class')}
                  >
                    <div className="type-badge neon-blue">GROUP SESSIONS</div>
                    <div className="type-icon">⚡</div>
                    <h3>CYBER GROUP CLASS</h3>
                    <p>High-octane metabolic burn, barbell squats squad, and kinetic mobility flows in the Neon Dome.</p>
                    <span className="type-action">SELECT CLASS →</span>
                  </div>
                </div>

                <div className="step-footer-actions">
                  <button className="cyber-next-btn" onClick={() => setCurrentStep(2)}>
                    PROCEED TO CATALOG →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Filter & Select Item */}
            {currentStep === 2 && (
              <div className="step-content animate-fade-in">
                <div className="step-header-flex">
                  <h3 className="step-title">STEP 2: FILTER & SELECT <span className="neon-orange">{bookingType === 'trainer' ? 'COACH' : 'CLASS'}</span></h3>
                  <button className="back-step-btn" onClick={() => setCurrentStep(1)}>← BACK</button>
                </div>

                {/* Filter Matrix */}
                <div className="filter-matrix-bar glass-card">
                  <div className="filter-group">
                    <label>SPECIALTY:</label>
                    <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
                      <option value="ALL">ALL SPECIALTIES</option>
                      <option value="Strength & Power">STRENGTH & POWER</option>
                      <option value="Hypertrophy & Strength">HYPERTROPHY & STRENGTH</option>
                      <option value="Mobility & Rehab">MOBILITY & REHAB</option>
                      <option value="HIIT & Endurance">HIIT & ENDURANCE</option>
                      <option value="Functional Fitness">FUNCTIONAL FITNESS</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>INTENSITY LEVEL:</label>
                    <select value={selectedIntensity} onChange={(e) => setSelectedIntensity(e.target.value)}>
                      <option value="ALL">ALL INTENSITIES</option>
                      <option value="LOW">LOW (MOBILITY / REHAB 🟢)</option>
                      <option value="MEDIUM">MEDIUM (FUNCTIONAL 🟡)</option>
                      <option value="HIGH">HIGH (STRENGTH / POWER 🟠)</option>
                      <option value="EXTREME">EXTREME (CYBER-HIIT 🔴)</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>TIME WINDOW:</label>
                    <select value={selectedTimePeriod} onChange={(e) => setSelectedTimePeriod(e.target.value)}>
                      <option value="ALL">ANY TIME</option>
                      <option value="MORNING">MORNING (06:00 - 11:00 AM)</option>
                      <option value="AFTERNOON">AFTERNOON (12:00 - 04:00 PM)</option>
                      <option value="EVENING">EVENING (05:00 - 10:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Catalog Grid */}
                {bookingType === 'trainer' ? (
                  <div className="catalog-grid">
                    {filteredTrainers.map(trainer => (
                      <div 
                        key={trainer.id} 
                        className={`catalog-card glass-card ${selectedTrainer?.id === trainer.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTrainer(trainer)}
                      >
                        <div className="card-avatar" style={{ backgroundImage: `url(${trainer.avatar})` }}>
                          <span className="rating-tag">★ {trainer.rating}</span>
                        </div>
                        <div className="card-body">
                          <span className="cyber-badge orange">{trainer.specialty}</span>
                          <h4>{trainer.name}</h4>
                          <span className="role-tag">{trainer.role}</span>
                          <p className="bio">{trainer.bio}</p>
                          <div className="card-footer-info">
                            <span className="intensity-label">Intensity: <strong>{trainer.intensity}</strong></span>
                            <span className="slots-count">🟢 {trainer.availableSlots.length} Slots Open</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="catalog-grid">
                    {filteredClasses.map(cls => (
                      <div 
                        key={cls.id}
                        className={`catalog-card class-variant glass-card ${selectedClass?.id === cls.id ? 'selected' : ''}`}
                        onClick={() => setSelectedClass(cls)}
                      >
                        <div className="class-banner" style={{ backgroundImage: `url(${cls.banner})` }}>
                          <span className="duration-tag">{cls.duration}</span>
                        </div>
                        <div className="card-body">
                          <span className="cyber-badge blue">{cls.specialty}</span>
                          <h4>{cls.title}</h4>
                          <span className="role-tag">Instructor: {cls.instructor}</span>
                          <p className="room-info">📍 {cls.room} • {cls.time}</p>
                          <div className="card-footer-info">
                            <span className="intensity-label">Intensity: <strong>{cls.intensity}</strong></span>
                            <span className="slots-count">🔥 {cls.capacity - cls.booked} Seats Left</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="step-footer-actions">
                  <button 
                    className="cyber-next-btn"
                    disabled={(bookingType === 'trainer' && !selectedTrainer) || (bookingType === 'class' && !selectedClass)}
                    onClick={() => setCurrentStep(3)}
                  >
                    SELECT DATE & TIME SLOT →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Date & Slot Matrix */}
            {currentStep === 3 && (
              <div className="step-content animate-fade-in">
                <div className="step-header-flex">
                  <h3 className="step-title">STEP 3: SELECT <span className="neon-green">DATE & TIME SLOT</span></h3>
                  <button className="back-step-btn" onClick={() => setCurrentStep(2)}>← BACK</button>
                </div>

                <div className="selected-summary-banner glass-card">
                  <div className="summary-info">
                    <span className="cyber-badge orange">{bookingType === 'trainer' ? 'PERSONAL COACHING' : 'CYBER CLASS'}</span>
                    <h3>{bookingType === 'trainer' ? selectedTrainer?.name : selectedClass?.title}</h3>
                    <p>{bookingType === 'trainer' ? selectedTrainer?.role : `Instructor: ${selectedClass?.instructor}`}</p>
                  </div>
                </div>

                {/* Week Calendar Picker */}
                <div className="calendar-week-picker glass-card">
                  <h4>SELECT RESERVATION DATE:</h4>
                  <div className="dates-row">
                    {weekDates.map((item, idx) => (
                      <button
                        key={idx}
                        className={`date-chip ${selectedDate === item.iso ? 'active' : ''}`}
                        onClick={() => setSelectedDate(item.iso)}
                      >
                        <span className="day-name">{item.dayName}</span>
                        <span className="month-day">{item.monthDay}</span>
                        {item.isToday && <span className="today-dot">TODAY</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Matrix */}
                <div className="time-slot-section glass-card">
                  <h4>AVAILABLE TIME SLOTS ({selectedDate}):</h4>
                  
                  {bookingType === 'trainer' ? (
                    <div className="slots-grid">
                      {filterSlotsByPeriod(selectedTrainer?.availableSlots).map((slot, idx) => (
                        <button
                          key={idx}
                          className={`slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <span className="slot-icon">🕒</span>
                          <span className="slot-time">{slot}</span>
                          <span className="slot-badge">AVAILABLE</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="slots-grid">
                      <button
                        className={`slot-btn ${selectedSlot === selectedClass?.time ? 'active' : ''}`}
                        onClick={() => setSelectedSlot(selectedClass?.time)}
                      >
                        <span className="slot-icon">🕒</span>
                        <span className="slot-time">{selectedClass?.time}</span>
                        <span className="slot-badge">CLASS TIME</span>
                      </button>
                    </div>
                  )}

                  {errorMsg && <div className="error-banner">{errorMsg}</div>}
                </div>

                <div className="step-footer-actions">
                  <button 
                    className={`cyber-confirm-btn ${isSubmitting ? 'loading' : ''}`}
                    disabled={!selectedSlot || isSubmitting}
                    onClick={handleConfirmBooking}
                  >
                    {isSubmitting ? 'ISSUING CYBER PASS...' : 'CONFIRM & ISSUE TICKET →'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Confirmed Cyber Access Pass Ticket */}
            {currentStep === 4 && confirmedBooking && (
              <div className="step-content animate-fade-in">
                <div className="ticket-success-container">
                  <div className="success-header">
                    <span className="success-badge">✅ RESERVATION CONFIRMED</span>
                    <h2>YOUR CYBER ACCESS TICKET IS READY</h2>
                    <p>Show this digital ticket at the Iron Pulse Front Access Gate or to your Coach.</p>
                  </div>

                  {/* Cyber Access Ticket Card */}
                  <div className="cyber-ticket-card glass-card">
                    <div className="ticket-header">
                      <div className="brand">IRON<span className="neon-orange">PULSE</span> PASS</div>
                      <span className="ticket-code">{confirmedBooking.ticketCode}</span>
                    </div>

                    <div className="ticket-body">
                      <div className="ticket-row">
                        <div>
                          <span className="t-label">SESSION TITLE</span>
                          <h3 className="t-val neon-orange">{confirmedBooking.title}</h3>
                        </div>
                        <div>
                          <span className="t-label">INSTRUCTOR / COACH</span>
                          <h3 className="t-val neon-blue">{confirmedBooking.trainerName}</h3>
                        </div>
                      </div>

                      <div className="ticket-row">
                        <div>
                          <span className="t-label">DATE & TIME</span>
                          <p className="t-val">{confirmedBooking.date} @ {confirmedBooking.time}</p>
                        </div>
                        <div>
                          <span className="t-label">FACILITY LOCATION</span>
                          <p className="t-val">{confirmedBooking.location}</p>
                        </div>
                      </div>

                      <div className="ticket-barcode-row">
                        <div className="mock-barcode">||||||| | ||||| |||| || |||||| | ||||</div>
                        <span className="scan-note">GATE SCAN VALID ON {confirmedBooking.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-actions">
                    <button className="primary-ticket-btn" onClick={() => setActiveTab('my-bookings')}>
                      VIEW MY BOOKINGS ({myBookings.length})
                    </button>
                    <button className="secondary-ticket-btn" onClick={resetBookingFlow}>
                      BOOK ANOTHER SESSION
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* MY ACTIVE BOOKINGS TAB */
          <div className="my-bookings-container animate-fade-in">
            <h3 className="section-title">ACTIVE MEMBER <span className="neon-blue">RESERVATIONS</span></h3>

            {myBookings.length === 0 ? (
              <div className="empty-bookings glass-card">
                <p>No active reservations found.</p>
                <button className="cyber-next-btn" onClick={() => { setActiveTab('new'); resetBookingFlow(); }}>
                  SCHEDULE YOUR FIRST SESSION
                </button>
              </div>
            ) : (
              <div className="bookings-list-grid">
                {myBookings.map(b => (
                  <div key={b.id} className="booking-card glass-card">
                    <div className="b-header">
                      <span className="cyber-badge orange">{b.type.toUpperCase()}</span>
                      <span className="b-ticket">{b.ticketCode}</span>
                    </div>

                    <h4>{b.title}</h4>
                    <p className="b-coach">👤 {b.trainerName}</p>

                    <div className="b-details-grid">
                      <div>
                        <span className="d-label">DATE</span>
                        <span className="d-val">{b.date}</span>
                      </div>
                      <div>
                        <span className="d-label">TIME</span>
                        <span className="d-val">{b.time}</span>
                      </div>
                      <div>
                        <span className="d-label">LOCATION</span>
                        <span className="d-val">{b.location}</span>
                      </div>
                    </div>

                    <div className="b-footer">
                      <span className="status-confirmed">🟢 Confirmed</span>
                      <button className="cancel-b-btn" onClick={() => handleCancelBooking(b.id)}>
                        CANCEL RESERVATION
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingPortal;
