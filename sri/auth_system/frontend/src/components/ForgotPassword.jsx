import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function ForgotPassword() {
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/forgot-password', { user_id: userId });
      // In a real app, this would be emailed. For MVP, we display it.
      setToken(response.data.token); 
      setStep(2);
      setMessage('Token generated (simulated email). Please use it below.');
    } catch (err) {
      setMessage('Error requesting token');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/reset-password', {
        token: token,
        new_password: newPassword
      });
      setStep(3);
    } catch (err) {
      setMessage('Error resetting password: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="container">
      <h1>Forgot Password</h1>
      {message && <div className={step === 3 ? "success" : "error"}>{message}</div>}
      
      {step === 1 && (
        <form onSubmit={handleRequestToken}>
          <p style={{textAlign: 'center'}}>Enter your User ID to receive a reset token.</p>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <button type="submit">Request Reset Token</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset}>
          <p style={{textAlign: 'center'}}>Token: <strong>{token}</strong></p>
          <input
            type="text"
            placeholder="Paste Token Here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}

      {step === 3 && (
        <div style={{textAlign: 'center'}}>
          <p className="success">Password has been reset successfully!</p>
          <Link to="/user/login" className="link">Back to Login</Link>
        </div>
      )}
      
      {step !== 3 && (
        <div style={{marginTop: '1rem', textAlign: 'center'}}>
          <Link to="/user/login" className="link">Back to Login</Link>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
