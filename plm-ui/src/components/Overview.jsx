import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ShieldCheck, Plus, Cpu, Settings } from 'lucide-react';
import api from '../services/api';
import ManageAsset from './ManageAsset';
import TicketPanel from './TicketPanel';
import ReadingChart from './ReadingChart';
import ThresholdForm from './ThresholdForm';
import LogsPanel from './LogsPanel';

const Overview = () => {
  const [assets, setAssets]               = useState([]);
  const [tickets, setTickets]             = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [view, setView]                   = useState('overview');
  const [showAddAsset, setShowAddAsset]   = useState(false);
  const [newAsset, setNewAsset]           = useState({ name: '', type: '', location: '' });
  const [systemStatus, setSystemStatus]   = useState('Offline');
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [aRes, tRes, sRes] = await Promise.all([
        api.get('/Assets'), 
        api.get('/Tickets'),
        api.get('/Readings/latest-timestamp').catch(() => ({ data: { latestTimestamp: null } }))
      ]);
      setAssets(aRes.data);
      setTickets(tRes.data);

      // Determine System Status based on latest reading timestamp
      if (sRes.data && sRes.data.latestTimestamp) {
        const latestTime = new Date(sRes.data.latestTimestamp).getTime();
        const nowTime = Date.now(); 
        const diffSeconds = (nowTime - latestTime) / 1000;
        
        // Debugging (check browser console if it stays Offline)
        // console.log(`[Status Check] Latest: ${sRes.data.latestTimestamp}, Diff: ${diffSeconds.toFixed(1)}s`);
        
        // Handle potential clock drift: if diff is negative (server ahead) or within 45s, it's Online
        const isOnline = diffSeconds < 45 && diffSeconds > -60;
        setSystemStatus(isOnline ? 'Online' : 'Offline');
      } else {
        setSystemStatus('Offline');
      }
    } catch (e) { 
      console.error('Status Fetch error:', e); 
      setSystemStatus('Offline');
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    await api.post('/Assets', { ...newAsset, status: 'Active' });
    setShowAddAsset(false);
    setNewAsset({ name: '', type: '', location: '' });
    fetchAll();
  };

  const handleResolveTicket = async (id) => {
    try {
      await api.patch(`/Tickets/${id}/status`, "Closed", {
        headers: { 'Content-Type': 'application/json' }
      });
      fetchAll();
    } catch (e) {
      console.error('Error resolving ticket:', e);
    }
  };

  const selectedAsset   = assets.find(a => a.id === Number(selectedAssetId));
  const allOpenTickets  = tickets.filter(t => t.status === 'Open');
  const openTicketsCount = allOpenTickets.length;
  const assetTickets    = tickets.filter(t => t.assetId === Number(selectedAssetId));

  /* Reset sub-tab when asset changes */
  const selectAsset = (id) => {
    setSelectedAssetId(String(id));
    setView('overview');
  };

  return (
    <div className="page-body">
      {/* ── Top Stats ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}><Cpu size={20} color="#3b82f6" /></div>
          <div><h3>{assets.length}</h3><p>Total Assets</p></div>
        </motion.div>
        <motion.div 
          className="stat-card" 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.05 }}
          onClick={() => openTicketsCount > 0 && setShowTicketsModal(true)}
          style={{ cursor: openTicketsCount > 0 ? 'pointer' : 'default' }}
        >
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}><AlertTriangle size={20} color="#ef4444" /></div>
          <div><h3>{openTicketsCount}</h3><p>Open Tickets</p></div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon" style={{ 
            background: systemStatus === 'Online' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' 
          }}>
            <ShieldCheck size={20} color={systemStatus === 'Online' ? '#10b981' : '#ef4444'} />
          </div>
          <div>
            <h3 style={{ color: systemStatus === 'Online' ? '#10b981' : '#ef4444' }}>
              {systemStatus}
            </h3>
            <p>System Status</p>
          </div>
        </motion.div>
      </div>

      {/* ── Asset Selector ────────────────────────── */}
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
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No assets found. {role === 'Admin' ? 'Click "Add Asset" to create one.' : ''}
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {assets.map(asset => (
                <button
                  key={asset.id}
                  id={`asset-chip-${asset.id}`}
                  onClick={() => selectAsset(asset.id)}
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
                >
                  {asset.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* ── Asset Detail Section ─────────────────── */}
      {selectedAsset && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Sub-nav tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['overview', 'manage', 'tickets', 'logs'].map(tab => (
              <button
                key={tab}
                id={`tab-${tab}`}
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
              >
                {tab === 'manage'   ? '⚙ Manage'
                 : tab === 'tickets' ? `🎫 Tickets (${assetTickets.length})`
                 : tab === 'logs' ? '📄 Logs'
                 : '📊 Overview'}
              </button>
            ))}
          </div>

          {view === 'overview' && (
            <>
              <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                <AssetOverview asset={selectedAsset} tickets={assetTickets} />
              </div>
              <ReadingChart assets={assets} selectedAssetId={selectedAsset.id} />
            </>
          )}
          {view === 'manage'  && <ManageAsset asset={selectedAsset} />}
          {view === 'tickets' && (
            <TicketPanel
              assetId={selectedAsset.id}
              tickets={assetTickets}
              onRefresh={fetchAll}
            />
          )}
          {view === 'logs' && <LogsPanel assetId={selectedAsset.id} />}
        </motion.div>
      )}

      {/* ── Add Asset Modal ──────────────────────── */}
      {showAddAsset && (
        <div className="modal-overlay" onClick={() => setShowAddAsset(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h5>Add New Asset</h5>
            <form onSubmit={handleAddAsset}>
              <div className="form-field">
                <label>Asset Name</label>
                <input required value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="e.g. Engine-01" />
              </div>
              <div className="form-field">
                <label>Type</label>
                <input required value={newAsset.type} onChange={e => setNewAsset({ ...newAsset, type: e.target.value })} placeholder="e.g. Compressor" />
              </div>
              <div className="form-field">
                <label>Location</label>
                <input required value={newAsset.location} onChange={e => setNewAsset({ ...newAsset, location: e.target.value })} placeholder="e.g. Factory Floor" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-sm-ghost" onClick={() => setShowAddAsset(false)}>Cancel</button>
                <button type="submit" className="btn-sm-primary">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Open Tickets Modal ───────────────────── */}
      {showTicketsModal && (
        <div className="modal-overlay" onClick={() => setShowTicketsModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h5 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} color="var(--danger)" /> 
                Open System Tickets
              </h5>
              <button className="btn-sm-ghost" onClick={() => setShowTicketsModal(false)}>✕</button>
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 5 }}>
              {allOpenTickets.length === 0 ? (
                <div className="empty-state">
                  <ShieldCheck size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
                  <p>No open tickets found.</p>
                </div>
              ) : (
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Issue</th>
                      <th>Raised</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOpenTickets.map(ticket => {
                      const asset = assets.find(a => a.id === ticket.assetId);
                      return (
                        <tr key={ticket.id}>
                          <td style={{ fontWeight: 600 }}>{asset?.name || `ID: ${ticket.assetId}`}</td>
                          <td>
                            <div style={{ fontSize: 13 }}>{ticket.issueType}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ticket.description}</div>
                          </td>
                          <td style={{ fontSize: 11 }}>{new Date(ticket.createdAt).toLocaleString()}</td>
                          <td>
                            <button 
                              className="btn-sm-primary" 
                              style={{ background: 'var(--success)', borderColor: 'var(--success)', padding: '4px 10px', fontSize: 11 }}
                              onClick={() => handleResolveTicket(ticket.id)}
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn-sm-ghost" onClick={() => setShowTicketsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Asset Detail Summary Card ───────────────────────────── */
const AssetOverview = ({ asset, tickets }) => {
  const open = tickets.filter(t => t.status === 'Open').length;
  return (
    <div className="card-clean">
      <div className="card-header-clean">
        <span>{asset.name} — Details</span>
        <span className={open > 0 ? 'badge-open' : 'badge-active'}>
          {open > 0 ? `${open} Open Ticket${open > 1 ? 's' : ''}` : 'All Clear'}
        </span>
      </div>
      <div className="card-body-clean">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'TYPE',           value: asset.type     || '—' },
            { label: 'LOCATION',       value: asset.location || '—' },
            { label: 'TOTAL TICKETS',  value: tickets.length },
            { label: 'OPEN TICKETS',   value: open, color: open > 0 ? 'var(--danger)' : 'var(--success)' },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.label}
              </p>
              <p style={{ fontWeight: 600, fontSize: 15, color: item.color || 'var(--text)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
