import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Plus, ChevronLeft, ChevronRight, ServerCrash, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';

const PAGE_SIZE = 8;

const AssetList = ({ onSelectAsset, selectedAssetId }) => {
  const [assets, setAssets]       = useState([]);
  const [page, setPage]           = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset]   = useState({ name: '', location: '', type: '' });
  const [editingAsset, setEditingAsset] = useState(null);
  const [saving, setSaving]       = useState(false);
  const role = localStorage.getItem('userRole');

  const fetchAssets = async () => {
    try {
      const res = await api.get('/Assets');
      setAssets(res.data);
    } catch (e) {
      console.error('Error fetching assets:', e);
    }
  };

  useEffect(() => {
    fetchAssets();
    const interval = setInterval(fetchAssets, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAsset) {
        await api.put(`/Assets/${editingAsset.id}`, { ...newAsset, id: editingAsset.id, status: editingAsset.status });
      } else {
        await api.post('/Assets', { ...newAsset, status: 'Active' });
      }
      setShowModal(false);
      setNewAsset({ name: '', location: '', type: '' });
      setEditingAsset(null);
      fetchAssets();
    } catch (err) {
      console.error('Error saving asset:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (e, asset) => {
    if (e) e.stopPropagation();
    setEditingAsset(asset);
    setNewAsset({ name: asset.name, location: asset.location, type: asset.type });
    setShowModal(true);
  };

  const handleDelete = async (e, id) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await api.delete(`/Assets/${id}`);
        fetchAssets();
      } catch (err) {
        console.error('Error deleting asset:', err);
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));
  const paged = assets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <motion.div
        className="card-clean"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="card-header-clean">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={15} /> Monitored Assets
            <span style={{
              fontSize: 11, background: 'var(--surface-2)',
              padding: '1px 8px', borderRadius: 20,
              color: 'var(--text-muted)', fontWeight: 400,
            }}>
              {assets.length}
            </span>
          </span>
          {role === 'Admin' && (
            <button
              id="add-asset-btn"
              className="btn-sm-primary"
              onClick={() => { setEditingAsset(null); setNewAsset({ name: '', location: '', type: '' }); setShowModal(true); }}
            >
              <Plus size={13} /> Add Asset
            </button>
          )}
        </div>

        {/* Table */}
        {assets.length === 0 ? (
          <div className="empty-state">
            <ServerCrash size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
            <p>No assets found.</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>
              {role === 'Admin'
                ? 'Click "Add Asset" to register your first monitored asset.'
                : 'No assets have been registered yet. Contact an Admin.'}
            </p>
          </div>
        ) : (
          <table className="clean-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                {role === 'Admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paged.map((asset) => (
                <tr
                  key={asset.id}
                  id={`asset-row-${asset.id}`}
                  onClick={() => onSelectAsset?.(asset)}
                  style={{
                    cursor: 'pointer',
                    background: selectedAssetId === asset.id ? 'rgba(59,130,246,0.08)' : '',
                  }}
                >
                  <td style={{ fontWeight: 600, color: selectedAssetId === asset.id ? 'var(--primary)' : 'var(--text)' }}>
                    {asset.name}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{asset.type || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{asset.location || '—'}</td>
                  <td>
                    <span className={asset.status === 'Active' ? 'badge-active' : 'badge-closed'}>
                      {asset.status || 'Active'}
                    </span>
                  </td>
                  {role === 'Admin' && (
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-sm-ghost" onClick={(e) => handleEdit(e, asset)} style={{ padding: 4 }}><Pencil size={14} /></button>
                        <button className="btn-sm-danger" onClick={(e) => handleDelete(e, asset.id)} style={{ padding: 4 }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {assets.length > PAGE_SIZE && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: 10, padding: '10px 20px', borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Page {page} / {totalPages}
            </span>
            <button
              className="btn-sm-ghost" style={{ padding: '4px 8px' }}
              disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="btn-sm-ghost" style={{ padding: '4px 8px' }}
              disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h5>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h5>
            <form onSubmit={handleSave}>
              <div className="form-field">
                <label>Asset Name</label>
                <input
                  id="new-asset-name"
                  required
                  placeholder="e.g. Engine-01"
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Type</label>
                <input
                  id="new-asset-type"
                  required
                  placeholder="e.g. Compressor"
                  value={newAsset.type}
                  onChange={e => setNewAsset({ ...newAsset, type: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Location</label>
                <input
                  id="new-asset-location"
                  required
                  placeholder="e.g. Factory Floor B"
                  value={newAsset.location}
                  onChange={e => setNewAsset({ ...newAsset, location: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-sm-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button id="save-asset-btn" type="submit" className="btn-sm-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AssetList;
