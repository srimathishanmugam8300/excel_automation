import React, { useState, useEffect } from 'react';
import api from '../../api';
import Modal from '../Modal';

function ActivityLogPanel() {
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '', activity_type: 'update', description: '', task_id: '', progress_value: '', timestamp: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/dashboard/logs');
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const handleOpenModal = (log = null) => {
    if (log) {
      setCurrentLog(log);
      setFormData({
        user_id: log.user_id,
        activity_type: log.activity_type,
        description: log.description,
        task_id: log.task_id || '',
        progress_value: log.progress_value || '',
        timestamp: log.timestamp
      });
    } else {
      setCurrentLog(null);
      setFormData({
        user_id: '', activity_type: 'update', description: '', task_id: '', progress_value: '', timestamp: new Date().toISOString().slice(0, 16)
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentLog) {
        await api.put(`/dashboard/logs/${currentLog.id}`, formData);
      } else {
        await api.post('/dashboard/logs', formData);
      }
      setIsModalOpen(false);
      fetchLogs();
    } catch (err) {
      alert('Error saving log');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log?')) return;
    try {
      await api.delete(`/dashboard/logs/${id}`);
      fetchLogs();
    } catch (err) {
      alert('Error deleting log');
    }
  };

  return (
    <div className="card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h3>System Activity Log</h3>
        <button onClick={() => handleOpenModal()} className="small">Add Log</button>
      </div>
      
      <div className="timeline">
        {logs.map(log => (
          <div key={log.id} className="timeline-item">
            <div className={`timeline-marker ${log.activity_type}`}></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-user">User {log.user_id}</span>
                <span className="timeline-time">{new Date(log.timestamp).toLocaleString()}</span>
                <div className="log-actions" style={{marginLeft: 'auto'}}>
                   <button className="secondary small" style={{padding: '2px 5px', fontSize: '0.7rem'}} onClick={() => handleOpenModal(log)}>Edit</button>
                   <button className="danger small" style={{padding: '2px 5px', fontSize: '0.7rem', marginLeft: '5px'}} onClick={() => handleDelete(log.id)}>X</button>
                </div>
              </div>
              <div className="timeline-body">
                {log.activity_type} <span className="highlight">{log.description}</span>
                {log.task_id && <span> (Task: {log.task_id})</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentLog ? "Edit Log" : "Add Log"}>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="User ID" value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} required />
          <select value={formData.activity_type} onChange={e => setFormData({...formData, activity_type: e.target.value})}>
            <option value="update">Update</option>
            <option value="login">Login</option>
            <option value="admin">Admin Action</option>
            <option value="error">Error</option>
          </select>
          <input type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          <input type="text" placeholder="Task ID (Optional)" value={formData.task_id} onChange={e => setFormData({...formData, task_id: e.target.value})} />
          <input type="number" placeholder="Progress Value (Optional)" value={formData.progress_value} onChange={e => setFormData({...formData, progress_value: e.target.value})} />
          <input type="datetime-local" value={formData.timestamp} onChange={e => setFormData({...formData, timestamp: e.target.value})} required />
          <button type="submit" style={{marginTop: '1rem', width: '100%'}}>Save Log</button>
        </form>
      </Modal>
    </div>
  );
}

export default ActivityLogPanel;
