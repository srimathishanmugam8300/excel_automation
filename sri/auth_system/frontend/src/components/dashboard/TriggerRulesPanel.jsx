import React, { useState, useEffect } from 'react';
import api from '../../api';
import Modal from '../Modal';

function TriggerRulesPanel() {
  const [rules, setRules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [formData, setFormData] = useState({
    rule_name: '', rule_type: 'Submission Deadline', project_name: '', 
    start_date: '', deadline: '', frequency: 'Weekly', status: 'Active'
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/dashboard/rules');
      setRules(response.data);
    } catch (err) {
      console.error("Failed to fetch rules", err);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setCurrentRule(rule);
      setFormData(rule);
    } else {
      setCurrentRule(null);
      setFormData({
        rule_name: '', rule_type: 'Submission Deadline', project_name: '', 
        start_date: '', deadline: '', frequency: 'Weekly', status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRule) {
        await api.put(`/dashboard/rules/${currentRule.id}`, formData);
      } else {
        await api.post('/dashboard/rules', formData);
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (err) {
      alert('Error saving rule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await api.delete(`/dashboard/rules/${id}`);
      fetchRules();
    } catch (err) {
      alert('Error deleting rule');
    }
  };

  const toggleStatus = async (rule) => {
    const newStatus = rule.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/dashboard/rules/${rule.id}`, { ...rule, status: newStatus });
      fetchRules();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h3>Trigger Rules & Schedule</h3>
        <button onClick={() => handleOpenModal()} className="small">Add New</button>
      </div>
      
      <div className="rules-container">
        {rules.map(rule => (
          <div key={rule.id} className={`rule-item ${rule.status.toLowerCase()}`}>
            <div className="rule-header">
              <span className="rule-project">{rule.project_name || rule.rule_name}</span>
              <span className={`status-badge ${rule.status.toLowerCase()}`}>{rule.status}</span>
            </div>
            
            <div className="rule-details">
              <div className="rule-detail-row">
                <span className="label">Type:</span>
                <span className="value">{rule.rule_type}</span>
              </div>
              <div className="rule-detail-row">
                <span className="label">Frequency:</span>
                <span className="value">{rule.frequency}</span>
              </div>
              <div className="rule-dates">
                <div>
                  <span className="label">Start:</span> {rule.start_date}
                </div>
                <div>
                  <span className="label">Due:</span> {rule.deadline}
                </div>
              </div>
            </div>

            <div className="rule-actions">
              <button className="secondary small" onClick={() => handleOpenModal(rule)}>Edit</button>
              <button className="danger small" onClick={() => handleDelete(rule.id)}>Delete</button>
              <button 
                className={`small ${rule.status === 'Active' ? 'danger' : 'success'}`}
                onClick={() => toggleStatus(rule)}
              >
                {rule.status === 'Active' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRule ? "Edit Rule" : "Add Rule"}>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Rule Name" value={formData.rule_name} onChange={e => setFormData({...formData, rule_name: e.target.value})} required />
          <input type="text" placeholder="Project Name" value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})} />
          <select value={formData.rule_type} onChange={e => setFormData({...formData, rule_type: e.target.value})}>
            <option>Submission Deadline</option>
            <option>Compliance Check</option>
            <option>Data Validation</option>
          </select>
          <input type="date" placeholder="Start Date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
          <input type="date" placeholder="Deadline" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
          <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
          <button type="submit" style={{marginTop: '1rem', width: '100%'}}>Save Rule</button>
        </form>
      </Modal>
    </div>
  );
}

export default TriggerRulesPanel;
