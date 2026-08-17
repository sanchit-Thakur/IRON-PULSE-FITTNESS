import React, { useState } from 'react';
import './Auth.css';
import gymBg from './assets/gym-bg.png';
import ThemeToggle from './ThemeToggle';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const toggleAuth = () => {
    setIsLogin(!isLogin);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData.name || formData.email.split('@')[0]);
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${gymBg})` }}>
      <div className="auth-content">
        <header className="auth-header">
          <div className="brand">IRON<span className="neon-orange">PULSE</span></div>
          <ThemeToggle />
        </header>

        <main className="auth-main">
          <div className={`auth-card glass-card ${isLogin ? 'login-mode' : 'signup-mode'}`}>
            <div className="form-container">
              {isLogin ? (
                <div className="auth-form login-form">
                  <h2>Welcome <span className="neon-orange">Back</span></h2>
                  <p className="subtitle">Enter your credentials to access your powerhouse.</p>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="input-group">
                      <label>Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" required />
                    </div>
                    <div className="input-group">
                      <div className="label-row">
                        <label>Password</label>
                        <a href="#" className="neon-blue small-text">Forgot Password?</a>
                      </div>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="primary-btn">Sign In</button>
                  </form>

                  <div className="divider">
                    <span>Or continue with</span>
                  </div>

                  <div className="social-login">
                    <button className="social-btn glass-card">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                      Google
                    </button>
                    <button className="social-btn glass-card">
                      <img src="https://www.svgrepo.com/show/475638/apple-color.svg" alt="Apple" />
                      Apple
                    </button>
                  </div>

                  <p className="auth-footer">
                    New to IronPulse? <a href="#" onClick={toggleAuth} className="neon-orange">Join Now</a>
                  </p>
                </div>
              ) : (
                <div className="auth-form signup-form">
                  <h2>Join the <span className="neon-orange">Elite</span></h2>
                  <p className="subtitle">Start your journey to peak performance today.</p>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="input-group">
                      <label>Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" required />
                    </div>
                    <div className="input-group">
                      <label>Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" required />
                    </div>
                    <div className="input-group">
                      <label>Password</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="primary-btn">Create Account</button>
                  </form>

                  <div className="divider">
                    <span>Or continue with</span>
                  </div>

                  <div className="social-login">
                    <button className="social-btn glass-card">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                      Google
                    </button>
                    <button className="social-btn glass-card">
                      <img src="https://www.svgrepo.com/show/475638/apple-color.svg" alt="Apple" />
                      Apple
                    </button>
                  </div>

                  <p className="auth-footer">
                    Already have an account? <a href="#" onClick={toggleAuth} className="neon-orange">Sign In</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Auth;
