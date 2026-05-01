import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ShieldCheck, Plus, Cpu, Settings } from 'lucide-react';
import api from '../services/api';
import ManageAsset from './ManageAsset';
import TicketsPanel from './TicketsPanel';

const Overview = () => {
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [view, setView] = useState('overview'); // 'overview' | 'manage' | 'tickets'
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: '', location: '' });
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [aRes, tRes] = await Promise.all([api.get('/Assets'), api.get('/Tickets')]);
      setAssets(aRes.data);
      setTickets(tRes.data);
    } catch (e) { console.error(e); }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    await api.post('/Assets', { ...newAsset, status: 'Active' });
    setShowAddAsset(false);
    setNewAsset({ name: '', type: '', location: '' });
    fetchAll();
  };

  const selectedAsset = assets.find(a => a.id === Number(selectedAssetId));
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const assetTickets = tickets.filter(t => t.assetId === Number(selectedAssetId));

  return (
    <div className="page-body">
      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}><Cpu size={20} color="#3b82f6" /></div>
          <div><h3>{assets.length}</h3><p>Total Assets</p></div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}><AlertTriangle size={20} color="#ef4444" /></div>
          <div><h3>{openTickets}</h3><p>Open Tickets</p></div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}><ShieldCheck size={20} color="#10b981" /></div>
          <div><h3 style={{ color: '#10b981' }}>Online</h3><p>System Status</p></div>
        </motion.div>
      </div>

      {/* Asset Selector Row */}
      <div className="card-clean" style={{ marginBottom: 20 }}>
        <div className="card-header-clean">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Cpu size={15} /> Select Asset to Inspect</span>
          {role === 'Admin' && (
            <button className="btn-sm-primary" onClick={() => setShowAddAsset(true)}>
              <Plus size={13} /> Add Asset
            </button>
          )}
        </div>
        <div className="card-body-clean" style={{ padding: '16px 20px' }}>
          {assets.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No assets found. {role === 'Admin' ? 'Click "Add Asset" to create one.' : ''}</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {assets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => { setSelectedAssetId(String(asset.id)); setView('overview'); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: `1.5px solid ${selectedAssetId === String(asset.id) ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectedAssetId === String(asset.id) ? 'rgba(59,130,246,0.12)' : 'var(--surface-2)',
                    color: selectedAssetId === String(asset.id) ? 'var(--primary)' : 'var(--text)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: selectedAssetId === String(asset.id) ? 700 : 400,
                    transition: 'all 0.15s',
                  }}
                >{asset.name}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Asset Detail Section – only visible after selection */}
      {selectedAsset && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Sub-nav tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['overview', 'manage', 'tickets'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: view === tab ? 'var(--primary)' : 'var(--surface)',
                  color: view === tab ? '#fff' : 'var(--text-muted)',
                  fontWeight: view === tab ? 700 : 400,
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s',
                }}
              >{tab === 'manage' ? '⚙ Manage' : tab === 'tickets' ? `🎫 Tickets (${assetTickets.length})` : '📊 Overview'}</button>
            ))}
          </div>

          {view === 'overview' && <AssetOverview asset={selectedAsset} tickets={assetTickets} />}
          {view === 'manage' && <ManageAsset asset={selectedAsset} />}
          {view === 'tickets' && <TicketsPanel assetId={selectedAsset.id} tickets={assetTickets} onRefresh={fetchAll} />}
        </motion.div>
      )}

      {/* Add Asset Modal */}
      {showAddAsset && (
        <div className="modal-overlay" onClick={() => setShowAddAsset(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h5>Add New Asset</h5>
            <form onSubmit={handleAddAsset}>
              <div className="form-field"><label>Asset Name</label><input required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="e.g. Engine-01" /></div>
              <div className="form-field"><label>Type</label><input required value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} placeholder="e.g. Engine" /></div>
              <div className="form-field"><label>Location</label><input required value={newAsset.location} onChange={e => setNewAsset({...newAsset, location: e.target.value})} placeholder="e.g. Factory Floor" /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-sm-ghost" onClick={() => setShowAddAsset(false)}>Cancel</button>
                <button type="submit" className="btn-sm-primary">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AssetOverview = ({ asset, tickets }) => {
  const open = tickets.filter(t => t.status === 'Open').length;
  return (
    <div className="card-clean">
      <div className="card-header-clean"><span>{asset.name} — Details</span></div>
      <div className="card-body-clean">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div><p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>TYPE</p><p style={{ fontWeight: 600 }}>{asset.type || '—'}</p></div>
          <div><p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>LOCATION</p><p style={{ fontWeight: 600 }}>{asset.location || '—'}</p></div>
          <div><p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>TOTAL TICKETS</p><p style={{ fontWeight: 600 }}>{tickets.length}</p></div>
          <div><p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>OPEN TICKETS</p><p style={{ fontWeight: 600, color: open > 0 ? 'var(--danger)' : 'var(--success)' }}>{open}</p></div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
