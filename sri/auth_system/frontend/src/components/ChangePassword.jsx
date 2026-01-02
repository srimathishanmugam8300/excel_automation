import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isForce = searchParams.get('force') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    try {
      await api.post('/user/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      
      alert('Password changed successfully. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/user/login');
    } catch (err) {
      setMessage('Error changing password: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="container">
      <h1>{isForce ? 'Change Password Required' : 'Change Password'}</h1>
      {isForce && <p style={{textAlign: 'center', color: '#666'}}>You must change your password on first login.</p>}
      {message && <div className="error">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>
      {!isForce && (
        <div style={{marginTop: '1rem', textAlign: 'center'}}>
          <Link to="/user/dashboard" className="link">Cancel</Link>
        </div>
      )}
    </div>
  );
}

export default ChangePassword;
