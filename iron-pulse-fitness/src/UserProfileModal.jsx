import React, { useState, useEffect } from 'react';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose, user, onSaveProfile }) => {
  const [formData, setFormData] = useState({
    name: user.name || 'ATHLETE',
    age: user.age || '24',
    gender: user.gender || 'male',
    goal: user.goal || 'bulking',
    weight: user.weight || '75',
    height: user.height || '178',
    avatar: user.avatar || '/avatars/avatar1.png'
  });

  const avatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'ATHLETE',
        age: user.age || '24',
        gender: user.gender || 'male',
        goal: user.goal || 'bulking',
        weight: user.weight || '75',
        height: user.height || '178',
        avatar: user.avatar || '/avatars/avatar1.png'
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSaveProfile) {
      onSaveProfile(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-profile-modal glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <span className="cyber-badge orange">ATHLETE PASSPORT</span>
            <h3>EDIT <span className="neon-orange">PROFILE & BIOMETRICS</span></h3>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </header>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Avatar Selection Grid */}
          <div className="form-section">
            <label className="section-label">SELECT CYBER AVATAR:</label>
            <div className="avatar-selector-grid">
              {avatars.map((avatar, idx) => (
                <div 
                  key={idx}
                  className={`avatar-tile ${formData.avatar === avatar ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                  style={{ backgroundImage: `url(${avatar})` }}
                >
                  {formData.avatar === avatar && <div className="selected-ring">✓</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Name & Age Row */}
          <div className="form-row">
            <div className="form-group">
              <label>FULL NAME / ATHLETE HANDLE</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Sterling"
                required
              />
            </div>

            <div className="form-group">
              <label>AGE (YEARS)</label>
              <input 
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="24"
                min="14"
                max="99"
                required
              />
            </div>
          </div>

          {/* Gender Selector */}
          <div className="form-group">
            <label>GENDER IDENTIFICATION</label>
            <div className="gender-options">
              <label className={`gender-btn ${formData.gender === 'male' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="male" 
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                />
                MALE ♂
              </label>
              <label className={`gender-btn ${formData.gender === 'female' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="female" 
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                FEMALE ♀
              </label>
              <label className={`gender-btn ${formData.gender === 'other' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="other" 
                  checked={formData.gender === 'other'}
                  onChange={handleChange}
                />
                NON-BINARY ⚡
              </label>
            </div>
          </div>

          {/* Body Stats Row */}
          <div className="form-row">
            <div className="form-group">
              <label>BODY WEIGHT (KG)</label>
              <input 
                type="number" 
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="75"
              />
            </div>

            <div className="form-group">
              <label>HEIGHT (CM)</label>
              <input 
                type="number" 
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="178"
              />
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="form-group">
            <label>PRIMARY FITNESS GOAL</label>
            <select name="goal" value={formData.goal} onChange={handleChange}>
              <option value="bulking">LEAN BULK (+350 kcal)</option>
              <option value="cutting">AGGRESSIVE CUT (-500 kcal)</option>
              <option value="recomp">BODY RECOMPOSITION</option>
              <option value="strength">MAX STRENGTH & POWER</option>
            </select>
          </div>

          <button type="submit" className="save-profile-btn">
            SAVE BIOMETRIC PROFILE →
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
