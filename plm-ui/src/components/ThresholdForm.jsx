import React, { useState, useEffect } from 'react';
import { ShieldAlert, Save, Edit2 } from 'lucide-react';
import api from '../services/api';

/**
 * ThresholdForm
 * Props:
 *   assetId   – number
 *   onSaved   – optional callback after save
 */
const ThresholdForm = ({ assetId, onSaved }) => {
  const [threshold, setThreshold] = useState(null);
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState({ tempMax: '', rmsMax: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    if (!assetId) return;
    api.get(`/Thresholds/asset/${assetId}`)
      .then(r => {
        setThreshold(r.data);
        setForm({ tempMax: r.data.tempMax, rmsMax: r.data.rmsMax });
      })
      .catch(() => { setThreshold(null); setForm({ tempMax: '', rmsMax: '' }); });
  }, [assetId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.tempMax || !form.rmsMax) {
      setError('Both fields are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        assetId,
        tempMax: Number(form.tempMax),
        rmsMax:  Number(form.rmsMax),
      };
      if (threshold) {
        await api.put(`/Thresholds/${threshold.id}`, { ...payload, id: threshold.id });
      } else {
        await api.post('/Thresholds', payload);
      }
      // Refresh
      const r = await api.get(`/Thresholds/asset/${assetId}`);
      setThreshold(r.data);
      setForm({ tempMax: r.data.tempMax, rmsMax: r.data.rmsMax });
      setEditing(false);
      onSaved?.();
    } catch (err) {
      setError('Failed to save threshold. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-clean">
      {/* Header */}
      <div className="card-header-clean">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={15} color="var(--warning)" /> Alert Thresholds
        </span>
        {role === 'Admin' && !editing && (
          <button
            id="threshold-edit-btn"
            className="btn-sm-ghost"
            onClick={() => setEditing(true)}
          >
            <Edit2 size={12} />
            {threshold ? 'Edit' : 'Set Threshold'}
          </button>
        )}
      </div>

      {/* Body */}
      {editing ? (
        /* ── Edit Form ── */
        <div className="card-body-clean">
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-field" style={{ margin: 0 }}>
                <label>Max Temperature (°C)</label>
                <input
                  id="threshold-temp-input"
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 85"
                  value={form.tempMax}
                  onChange={e => setForm({ ...form, tempMax: e.target.value })}
                />
              </div>
              <div className="form-field" style={{ margin: 0 }}>
                <label>Max RMS Vibration</label>
                <input
                  id="threshold-rms-input"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 4.5"
                  value={form.rmsMax}
                  onChange={e => setForm({ ...form, rmsMax: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-sm-ghost"
                onClick={() => { setEditing(false); setError(''); }}
              >
                Cancel
              </button>
              <button
                id="threshold-save-btn"
                type="submit"
                className="btn-sm-primary"
                disabled={saving}
              >
                <Save size={12} />
                {saving ? 'Saving…' : 'Save Threshold'}
              </button>
            </div>
          </form>
        </div>
      ) : !threshold ? (
        /* ── Empty State ── */
        <div className="empty-state">
          <ShieldAlert size={36} style={{ opacity: 0.2, display: 'block', margin: '0 auto 10px' }} />
          <p>No thresholds configured.</p>
          <p style={{ fontSize: 11, marginTop: 4 }}>
            {role === 'Admin'
              ? 'Click "Set Threshold" above to configure alert limits.'
              : 'Contact an Admin to set alert thresholds for this asset.'}
          </p>
        </div>
      ) : (
        /* ── Display Values ── */
        <div className="card-body-clean">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              background: 'var(--surface-2)', borderRadius: 10,
              padding: '18px 20px', borderLeft: '3px solid var(--warning)',
            }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Max Temperature
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning)', lineHeight: 1 }}>
                {threshold.tempMax}
                <span style={{ fontSize: 14, marginLeft: 4 }}>°C</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Alerts trigger above this value
              </p>
            </div>
            <div style={{
              background: 'var(--surface-2)', borderRadius: 10,
              padding: '18px 20px', borderLeft: '3px solid var(--primary)',
            }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Max RMS Vibration
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
                {threshold.rmsMax}
                <span style={{ fontSize: 14, marginLeft: 4 }}>units</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Alerts trigger above this value
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThresholdForm;
