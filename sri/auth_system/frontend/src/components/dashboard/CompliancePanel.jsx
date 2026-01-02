import React, { useState, useEffect } from 'react';
import api from '../../api';
import Modal from '../Modal';

function CompliancePanel() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    task_name: '', deadline: '', completed: false, total_progress: 0, assigned_users_str: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/dashboard/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setCurrentTask(task);
      // Convert users list to string format for editing: "user_id: progress"
      const usersStr = task.users ? task.users.map(u => `${u.user_id}: ${u.progress}`).join('\n') : '';
      setFormData({
        task_name: task.task_name,
        deadline: task.deadline,
        completed: task.completed,
        total_progress: task.total_progress,
        assigned_users_str: usersStr
      });
    } else {
      setCurrentTask(null);
      setFormData({
        task_name: '', deadline: '', completed: false, total_progress: 0, assigned_users_str: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse assigned_users_str back to list of objects
    const usersList = formData.assigned_users_str.split('\n').filter(line => line.trim() !== '').map(line => {
      const [uid, prog] = line.split(':');
      return { user_id: uid.trim(), progress: parseInt(prog.trim()) || 0 };
    });

    const payload = {
      task_name: formData.task_name,
      deadline: formData.deadline,
      completed: formData.completed,
      total_progress: formData.total_progress,
      users: usersList
    };

    try {
      if (currentTask) {
        await api.put(`/dashboard/tasks/${currentTask.id}`, payload);
      } else {
        await api.post('/dashboard/tasks', payload);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      alert('Error saving task');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/dashboard/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  return (
    <div className="card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h3>Compliance Summary</h3>
        <button onClick={() => handleOpenModal()} className="small">Add Task</button>
      </div>
      
      <div className="compliance-list">
        {tasks.map(task => {
          // Sort users by progress (descending)
          const sortedUsers = task.users ? [...task.users].sort((a, b) => b.progress - a.progress) : [];
          const leastProgressUser = sortedUsers.length > 0 ? sortedUsers[sortedUsers.length - 1] : null;

          return (
            <div key={task.id} className="task-compliance-card">
              <div className="task-header">
                <h4>{task.task_name}</h4>
                <div className="task-actions">
                  <button className="secondary small" onClick={() => handleOpenModal(task)}>Edit</button>
                  <button className="danger small" onClick={() => handleDelete(task.id)}>X</button>
                </div>
              </div>
              <span className="task-deadline">Due: {task.deadline}</span>
              
              <div className="progress-section">
                <div className="progress-label">
                  <span>Total Progress</span>
                  <span>{task.total_progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{width: `${task.total_progress}%`}}
                  ></div>
                </div>
              </div>

              <div className="user-breakdown">
                <h5>User Progress Breakdown:</h5>
                {sortedUsers.length > 0 ? sortedUsers.map((user) => (
                  <div key={user.user_id} className="user-progress-row">
                    <span className="user-id">User {user.user_id}</span>
                    <div className="user-bar-container">
                      <div 
                        className={`user-bar ${leastProgressUser && user.user_id === leastProgressUser.user_id ? 'lagging' : ''}`}
                        style={{width: `${user.progress}%`}}
                      ></div>
                    </div>
                    <span className="user-percent">{user.progress}%</span>
                  </div>
                )) : <p style={{fontSize: '0.8rem', color: '#999'}}>No users assigned</p>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentTask ? "Edit Task" : "Add Task"}>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Task Name" value={formData.task_name} onChange={e => setFormData({...formData, task_name: e.target.value})} required />
          <input type="date" placeholder="Deadline" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0'}}>
            <label>Total Progress (%):</label>
            <input type="number" min="0" max="100" value={formData.total_progress} onChange={e => setFormData({...formData, total_progress: parseInt(e.target.value)})} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0'}}>
             <label>Completed:</label>
             <input type="checkbox" checked={formData.completed} onChange={e => setFormData({...formData, completed: e.target.checked})} />
          </div>
          <label style={{display: 'block', marginTop: '10px', fontSize: '0.9rem'}}>Assigned Users (Format: UserID: Progress)</label>
          <textarea 
            placeholder="1001: 80&#10;1002: 40" 
            value={formData.assigned_users_str} 
            onChange={e => setFormData({...formData, assigned_users_str: e.target.value})} 
            rows="4"
            style={{fontFamily: 'monospace'}}
          ></textarea>
          <button type="submit" style={{marginTop: '1rem', width: '100%'}}>Save Task</button>
        </form>
      </Modal>
    </div>
  );
}

export default CompliancePanel;
