import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import TriggerRulesPanel from './dashboard/TriggerRulesPanel';
import CompliancePanel from './dashboard/CompliancePanel';
import ActivityLogPanel from './dashboard/ActivityLogPanel';
import MemoPanel from './dashboard/MemoPanel';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
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
    <div className="dashboard-container" style={{maxWidth: '1200px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="secondary">Logout</button>
      </div>

      {/* Action Bar */}
      <div style={{marginBottom: '2rem', display: 'flex', gap: '1rem'}}>
        <Link to="/admin/create-user">
          <button>Create New User</button>
        </Link>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Rules & Compliance */}
        <div className="dashboard-column">
          <TriggerRulesPanel />
          <CompliancePanel />
          <MemoPanel />
        </div>

        {/* Right Column: Activity & Users */}
        <div className="dashboard-column">
          <ActivityLogPanel />
          
          <div className="card">
            <h3>Users Overview</h3>
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Status</th>
                    <th>First Login?</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.user_id}>
                      <td>{user.user_id}</td>
                      <td>
                        <span className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}></span>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td>{user.is_first_login ? 'Yes' : 'No'}</td>
                      <td>
                        <button onClick={() => handleResetPassword(user.user_id)} className="secondary small">
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
