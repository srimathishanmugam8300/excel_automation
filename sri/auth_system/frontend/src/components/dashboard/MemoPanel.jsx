import React, { useState, useEffect } from 'react';
import api from '../../api';
import Modal from '../Modal';

function MemoPanel() {
  const [memos, setMemos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMemo, setCurrentMemo] = useState(null);
  const [formData, setFormData] = useState({
    owner_id: '', reason: '', description: '', date_issued: '', escalation_level: 'Low', status: 'Open'
  });

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    try {
      const response = await api.get('/dashboard/memos');
      setMemos(response.data);
    } catch (err) {
      console.error("Failed to fetch memos", err);
    }
  };

  const handleOpenModal = (memo = null) => {
    if (memo) {
      setCurrentMemo(memo);
      setFormData(memo);
    } else {
      setCurrentMemo(null);
      setFormData({
        owner_id: '', reason: '', description: '', date_issued: new Date().toISOString().slice(0, 10), escalation_level: 'Low', status: 'Open'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMemo) {
        await api.put(`/dashboard/memos/${currentMemo.id}`, formData);
      } else {
        await api.post('/dashboard/memos', formData);
      }
      setIsModalOpen(false);
      fetchMemos();
    } catch (err) {
      alert('Error saving memo');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this memo?')) return;
    try {
      await api.delete(`/dashboard/memos/${id}`);
      fetchMemos();
    } catch (err) {
      alert('Error deleting memo');
    }
  };

  return (
    <div className="card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h3>Memo & Escalation Overview</h3>
        <button onClick={() => handleOpenModal()} className="small">Add Memo</button>
      </div>
      
      <div className="memos-list">
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{textAlign: 'left', borderBottom: '1px solid #eee'}}>
              <th style={{padding: '8px'}}>Owner</th>
              <th style={{padding: '8px'}}>Reason</th>
              <th style={{padding: '8px'}}>Level</th>
              <th style={{padding: '8px'}}>Status</th>
              <th style={{padding: '8px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {memos.map(memo => (
              <tr key={memo.id} style={{borderBottom: '1px solid #f9f9f9'}}>
                <td style={{padding: '8px'}}>{memo.owner_id}</td>
                <td style={{padding: '8px'}}>
                  <strong>{memo.reason}</strong>
                  <div style={{fontSize: '0.8rem', color: '#666'}}>{memo.description}</div>
                </td>
                <td style={{padding: '8px'}}>
                  <span className={`status-badge ${memo.escalation_level.toLowerCase()}`}>{memo.escalation_level}</span>
                </td>
                <td style={{padding: '8px'}}>{memo.status}</td>
                <td style={{padding: '8px'}}>
                  <button className="secondary small" onClick={() => handleOpenModal(memo)} style={{marginRight: '5px'}}>Edit</button>
                  <button className="danger small" onClick={() => handleDelete(memo.id)}>X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentMemo ? "Edit Memo" : "Add Memo"}>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Owner ID" value={formData.owner_id} onChange={e => setFormData({...formData, owner_id: e.target.value})} required />
          <input type="text" placeholder="Reason" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required />
          <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
          <input type="date" value={formData.date_issued} onChange={e => setFormData({...formData, date_issued: e.target.value})} required />
          <select value={formData.escalation_level} onChange={e => setFormData({...formData, escalation_level: e.target.value})}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
            <option>Open</option>
            <option>Closed</option>
            <option>Pending</option>
          </select>
          <button type="submit" style={{marginTop: '1rem', width: '100%'}}>Save Memo</button>
        </form>
      </Modal>
    </div>
  );
}

export default MemoPanel;
