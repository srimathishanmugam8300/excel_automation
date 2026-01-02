import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login({ role }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const endpoint = role === 'admin' ? '/admin/login' : '/user/login';
      const response = await api.post(endpoint, formData);
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);

      if (role === 'user' && response.data.is_first_login) {
        navigate('/change-password?force=true');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container">
      <h1>{role === 'admin' ? 'Admin' : 'User'} Login</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={role === 'admin' ? "Username" : "User ID"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {role === 'user' && (
        <Link to="/forgot-password" className="link">Forgot Password?</Link>
      )}
      <div style={{marginTop: '1rem', textAlign: 'center'}}>
        <Link to={role === 'admin' ? "/user/login" : "/admin/login"} className="link">
          Switch to {role === 'admin' ? 'User' : 'Admin'} Login
        </Link>
      </div>
    </div>
  );
}

export default Login;
