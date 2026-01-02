import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import CreateUser from './components/CreateUser';
import UserDashboard from './components/UserDashboard';
import ChangePassword from './components/ChangePassword';
import ForgotPassword from './components/ForgotPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user/login" replace />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login role="admin" />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/create-user" element={<CreateUser />} />
      
      {/* User Routes */}
      <Route path="/user/login" element={<Login role="user" />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/user/login" replace />} />
    </Routes>
  );
}

export default App;
