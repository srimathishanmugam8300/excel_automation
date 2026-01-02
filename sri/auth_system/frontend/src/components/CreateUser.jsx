import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function CreateUser() {
  const [newUser, setNewUser] = useState({ user_id: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-user', newUser);
      setMessage('User created successfully');
      setNewUser({ user_id: '', email: '', password: '' });
      // Optional: Navigate back after success or stay to create more
      // navigate('/admin/dashboard'); 
    } catch (err) {
      setMessage('Error creating user: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="container">
      <div style={{marginBottom: '1rem'}}>
        <Link to="/admin/dashboard" className="link" style={{textAlign: 'left', display: 'inline-block'}}>
          ← Back to Dashboard
        </Link>
      </div>
      
      <h1>Create New User</h1>
      
      {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
      
      <form onSubmit={handleCreateUser}>
        <input
          type="text"
          placeholder="User ID"
          value={newUser.user_id}
          onChange={(e) => setNewUser({...newUser, user_id: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email (Optional)"
          value={newUser.email}
          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
        />
        <input
          type="password"
          placeholder="Initial Password"
          value={newUser.password}
          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
          required
        />
        <button type="submit">Create User</button>
      </form>
    </div>
  );
}

export default CreateUser;
