import React, { useState } from 'react';
import './Login.css';

function Login({ setUser, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Invalid credentials' });
      }
    } catch (error) {
      setErrors({ submit: 'Backend not connected. Please ensure the server is running.' });
    } finally {
      setIsLoading(false);
    }
  };

  const bgStyle = {
    backgroundImage: `linear-gradient(rgba(100,10,10,0.65), rgba(100,10,10,0.65)), url(${process.env.PUBLIC_URL}/images/lrac.jpg)`,
  };

  return (
    <div className="auth-page" style={bgStyle}>
      <div className="auth-card login-card">
        <h2 className="auth-title">Sign In</h2>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <span className="auth-link" onClick={() => onNavigate('register')}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;