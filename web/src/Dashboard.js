import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard({ setUser }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const bgStyle = {
    backgroundImage: `linear-gradient(rgba(100,10,10,0.65), rgba(100,10,10,0.65)), url(${process.env.PUBLIC_URL}/images/lrac.jpg)`,
  };

  return (
    <div className="dashboard-page" style={bgStyle}>
      <div className="dashboard-card">
        <div className="dashboard-header">
          <img src="/images/cit.png" alt="CIT Logo" className="dashboard-logo" />
          <h1>StudyNook</h1>
        </div>
        <div className="user-info">
          <h2>Welcome, {user ? user.name : 'User'}!</h2>
          <p><strong>Email:</strong> {user ? user.email : 'N/A'}</p>
          <p><strong>Role:</strong> {user ? user.role : 'Guest'}</p>
          <p><strong>Member Since:</strong> {user && user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
        <button onClick={() => setShowLogoutModal(true)} className="btn-logout">Logout</button>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-modal-confirm" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;