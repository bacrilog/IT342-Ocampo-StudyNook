import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'register'

  if (user) {
    return <Dashboard setUser={setUser} />;
  }

  if (currentPage === 'login') {
    return <Login setUser={setUser} onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'register') {
    return <Register onNavigate={setCurrentPage} />;
  }

  const bgStyle = {
    backgroundImage: `linear-gradient(rgba(100,10,10,0.65), rgba(100,10,10,0.65)), url(${process.env.PUBLIC_URL}/images/lrac.jpg)`,
  };

  // Landing page
  return (
    <div className="landing-page" style={bgStyle}>
      <div className="landing-card">
        <div className="landing-brand">
          <img src="/images/cit.png" alt="CIT Logo" className="landing-logo" />
          <div className="landing-brand-text">
            <h1>StudyNook</h1>
            <p>Library Booking Portal</p>
          </div>
        </div>
        <button className="btn-signin" onClick={() => setCurrentPage('login')}>
          Sign In
        </button>
        <button className="btn-signup" onClick={() => setCurrentPage('register')}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default App;