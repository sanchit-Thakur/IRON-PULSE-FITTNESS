import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Training from './Training';
import FoodAnalysis from './FoodAnalysis';
import BookingPortal from './BookingPortal';
import ChatAssistant from './ChatAssistant';
import CommunityHub from './CommunityHub';
import ToolsHub from './ToolsHub';

const DEFAULT_USER = {
  name: 'SANCHIT THAKUR',
  avatar: '/avatars/avatar1.png',
  age: '24',
  gender: 'male',
  goal: 'bulking',
  weight: '75',
  height: '178'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('iron_pulse_auth') === 'true';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('iron_pulse_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('iron_pulse_auth', 'true');
      localStorage.setItem('iron_pulse_user', JSON.stringify(user));
    }
  }, [isAuthenticated, user]);

  const login = (name) => {
    const newUser = { ...user, name: name || user.name || 'ATHLETE' };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('iron_pulse_auth', 'true');
    localStorage.setItem('iron_pulse_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('iron_pulse_auth');
    localStorage.removeItem('iron_pulse_user');
  };
  
  const updateProfile = (profileData) => {
    setUser(prev => {
      const updated = typeof profileData === 'string'
        ? { ...prev, avatar: profileData }
        : { ...prev, ...profileData };
      localStorage.setItem('iron_pulse_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Auth onLogin={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard user={user} updateAvatar={updateProfile} onSaveProfile={updateProfile} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/training" element={isAuthenticated ? <Training user={user} updateAvatar={updateProfile} onSaveProfile={updateProfile} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/food" element={isAuthenticated ? <FoodAnalysis user={user} updateAvatar={updateProfile} onSaveProfile={updateProfile} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/booking" element={isAuthenticated ? <BookingPortal user={user} updateAvatar={updateProfile} onSaveProfile={updateProfile} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/assistant" element={isAuthenticated ? <ChatAssistant user={user} updateAvatar={updateProfile} onSaveProfile={updateProfile} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/community" element={isAuthenticated ? <CommunityHub user={user} updateAvatar={updateProfile} onSaveProfile={updateProfile} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/tools" element={isAuthenticated ? <ToolsHub user={user} updateAvatar={updateProfile} onSaveProfile={updateProfile} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>

      {/* Site-wide Floating AI Form-Check Assistant Widget */}
      {isAuthenticated && <ChatAssistant user={user} isWidgetOnly={true} />}
    </div>
  )
}

export default App

