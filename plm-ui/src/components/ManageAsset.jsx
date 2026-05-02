import React, { useState, useEffect } from 'react';
import { Plus, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const ManageAsset = ({ asset }) => {
  const [sensors, setSensors] = useState([]);
  const [threshold, setThreshold] = useState(null);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [showThreshModal, setShowThreshModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newSensor, setNewSensor] = useState({ name: '', sensorType: 'Temperature', unit: 'C' });
  const [threshForm, setThreshForm] = useState({ tempMax: '', rmsMax: '' });

  // Admin self-reset password state
  const [pwdForm, setPwdForm] = useState({ newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const role = localStorage.getItem('userRole');

  useEffect(() => {
    fetchData();
  }, [asset.id]);

  const fetchData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        api.get('/Sensors'),
        api.get(`/Thresholds/asset/${asset.id}`).catch(() => ({ data: null }))
      ]);
      setSensors(sRes.data.filter(s => s.assetId === asset.id));
      setThreshold(tRes.data);
      if (tRes.data) setThreshForm({ tempMax: tRes.data.tempMax, rmsMax: tRes.data.rmsMax });
    } catch (e) { console.error(e); }
  };

  const addSensor = async (e) => {
    e.preventDefault();
    await api.post('/Sensors', { 
      name: newSensor.name,
      type: newSensor.sensorType,
      unit: newSensor.unit,
      assetId: asset.id 
    });
    setShowSensorModal(false);
    setNewSensor({ name: '', sensorType: 'Temperature', unit: 'C' });
    fetchData();
  };

  const deleteSensor = async (id) => {
    await api.delete(`/Sensors/${id}`);
    fetchData();
  };

  const saveThreshold = async (e) => {
    e.preventDefault();
    const payload = { assetId: asset.id, tempMax: Number(threshForm.tempMax), rmsMax: Number(threshForm.rmsMax) };
    if (threshold) {
      await api.put(`/Thresholds/${threshold.id}`, { ...payload, id: threshold.id });
    } else {
      await api.post('/Thresholds', payload);
    }
    setShowThreshModal(false);
    fetchData();
  };

  const openPwdModal = () => {
    setPwdForm({ newPassword: '', confirmPassword: '' });
    setPwdError('');
    setPwdSuccess('');
    setShowNewPwd(false);
    setShowConfirmPwd(false);
    setShowPwdModal(true);
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (pwdForm.newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters long.');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('Passwords do not match.');
      return;
    }

    // Get current admin user id from Users list
    setPwdLoading(true);
    try {
      const usersRes = await api.get('/Users');
      const currentUsername = localStorage.getItem('username');
      const adminUser = usersRes.data.find(u => u.username === currentUsername);
      if (!adminUser) { setPwdError('Could not identify admin account.'); return; }

      await api.put(`/Users/${adminUser.id}/reset-password`, { newPassword: pwdForm.newPassword });
      setPwdSuccess('Your password has been updated successfully!');
      setPwdForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPwdModal(false), 1800);
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Error resetting password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Sensors */}
      <div className="card-clean">
        <div className="card-header-clean">
          <span>Sensors</span>
          {role === 'Admin' && (
            <button className="btn-sm-primary" onClick={() => setShowSensorModal(true)}><Plus size={13} /> Add Sensor</button>
          )}
        </div>
        {sensors.length === 0 ? (
          <div className="empty-state"><p>No sensors attached to this asset yet.</p></div>
        ) : (
          <table className="clean-table">
            <thead><tr><th>Name</th><th>Type</th><th>Unit</th>{role === 'Admin' && <th>Action</th>}</tr></thead>
            <tbody>
              {sensors.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name || `Sensor #${s.id}`}</td>
                  <td>{s.type || s.sensorType}</td>
                  <td>{s.unit}</td>
                  {role === 'Admin' && <td><button className="btn-sm-danger" onClick={() => deleteSensor(s.id)}>Remove</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Threshold */}
      <div className="card-clean">
        <div className="card-header-clean">
          <span>Alert Thresholds</span>
          {role === 'Admin' && (
            <button className="btn-sm-primary" onClick={() => setShowThreshModal(true)}>
              {threshold ? 'Edit Threshold' : <><Plus size={13} /> Set Threshold</>}
            </button>
          )}
        </div>
        {!threshold ? (
          <div className="empty-state"><p>No thresholds configured. {role === 'Admin' ? 'Click "Set Threshold" to configure.' : 'Admin needs to configure thresholds.'}</p></div>
        ) : (
          <div className="card-body-clean">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px 20px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>MAX TEMPERATURE</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>{threshold.tempMax}°C</p>
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px 20px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>MAX RMS VIBRATION</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{threshold.rmsMax}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin: Reset My Password */}
      {role === 'Admin' && (
        <div className="card-clean">
          <div className="card-header-clean">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={14} /> Admin Account Security
            </span>
            <button
              id="admin-reset-pwd-btn"
              className="btn-sm-ghost"
              onClick={openPwdModal}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <KeyRound size={13} /> Reset My Password
            </button>
          </div>
          <div className="card-body-clean">
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              As an administrator, you can reset your own login password here. You can also reset engineer passwords from the <strong>Manage Users</strong> panel in the sidebar.
            </p>
          </div>
        </div>
      )}

      {/* Add Sensor Modal */}
      {showSensorModal && (
        <div className="modal-overlay" onClick={() => setShowSensorModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h5>Add Sensor to {asset.name}</h5>
            <form onSubmit={addSensor}>
              <div className="form-field"><label>Sensor Name</label><input required value={newSensor.name} onChange={e => setNewSensor({...newSensor, name: e.target.value})} placeholder="e.g. Temp-01" /></div>
              <div className="form-field">
                <label>Type</label>
                <select value={newSensor.sensorType} onChange={e => setNewSensor({...newSensor, sensorType: e.target.value})}>
                  <option value="Temperature">Temperature</option>
                  <option value="Vibration">Vibration</option>
                  <option value="Pressure">Pressure</option>
                </select>
              </div>
              <div className="form-field"><label>Unit</label><input required value={newSensor.unit} onChange={e => setNewSensor({...newSensor, unit: e.target.value})} placeholder="e.g. C, m/s², bar" /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-sm-ghost" onClick={() => setShowSensorModal(false)}>Cancel</button>
                <button type="submit" className="btn-sm-primary">Add Sensor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Modal */}
      {showThreshModal && (
        <div className="modal-overlay" onClick={() => setShowThreshModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h5>{threshold ? 'Edit' : 'Set'} Threshold for {asset.name}</h5>
            <form onSubmit={saveThreshold}>
              <div className="form-field"><label>Max Temperature (°C)</label><input type="number" required value={threshForm.tempMax} onChange={e => setThreshForm({...threshForm, tempMax: e.target.value})} placeholder="e.g. 100" /></div>
              <div className="form-field"><label>Max RMS Vibration</label><input type="number" step="0.01" required value={threshForm.rmsMax} onChange={e => setThreshForm({...threshForm, rmsMax: e.target.value})} placeholder="e.g. 4.5" /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-sm-ghost" onClick={() => setShowThreshModal(false)}>Cancel</button>
                <button type="submit" className="btn-sm-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset My Password Modal */}
      {showPwdModal && (
        <div className="modal-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(59,130,246,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <KeyRound size={18} color="var(--primary)" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontSize: 15 }}>Reset Admin Password</h5>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                  {localStorage.getItem('username')}
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminResetPassword}>
              <div className="form-field">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-new-password"
                    type={showNewPwd ? 'text' : 'password'}
                    required
                    value={pwdForm.newPassword}
                    onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    placeholder="Min. 8 characters"
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(v => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 0, display: 'flex',
                    }}
                  >
                    {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-confirm-password"
                    type={showConfirmPwd ? 'text' : 'password'}
                    required
                    value={pwdForm.confirmPassword}
                    onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(v => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 0, display: 'flex',
                    }}
                  >
                    {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {pwdError && (
                <p style={{
                  fontSize: 12, color: 'var(--danger)', background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                  padding: '8px 12px', marginBottom: 8,
                }}>
                  {pwdError}
                </p>
              )}
              {pwdSuccess && (
                <p style={{
                  fontSize: 12, color: 'var(--success)', background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8,
                  padding: '8px 12px', marginBottom: 8,
                }}>
                  {pwdSuccess}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-sm-ghost" onClick={() => setShowPwdModal(false)}>Cancel</button>
                <button
                  id="confirm-admin-reset-btn"
                  type="submit"
                  className="btn-sm-primary"
                  disabled={pwdLoading}
                >
                  {pwdLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAsset;
