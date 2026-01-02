import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/user/login');
  };

  return (
    <div className="container">
      <h1>User Dashboard</h1>
      <p>Welcome! You are logged in securely.</p>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem'}}>
        <Link to="/change-password">
          <button style={{width: '100%'}}>Change Password</button>
        </Link>
        <button onClick={handleLogout} className="secondary">Logout</button>
      </div>
    </div>
  );
}

export default UserDashboard;
