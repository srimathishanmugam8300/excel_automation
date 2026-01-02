import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ user_id: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/admin/login');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-user', newUser);
      setMessage('User created successfully');
      setNewUser({ user_id: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      setMessage('Error creating user: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm(`Reset password for ${userId}?`)) return;
    try {
      const response = await api.post('/auth/admin/reset-user-password', { user_id: userId });
      alert(`Password reset. Temporary password: ${response.data.temporary_password}`);
      fetchUsers(); // Refresh to see status changes if any
    } catch (err) {
      alert('Error resetting password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin/login');
  };

  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="secondary">Logout</button>
      </div>

      <div style={{marginTop: '2rem'}}>
        <h2>Create User</h2>
        {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
        <form onSubmit={handleCreateUser} style={{maxWidth: '500px', margin: '0 auto'}}>
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

      <div style={{marginTop: '3rem'}}>
        <h2>User List</h2>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>Status</th>
              <th>First Login?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.email}</td>
                <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                <td>{user.is_first_login ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => handleResetPassword(user.user_id)} className="secondary" style={{padding: '0.5rem'}}>
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
