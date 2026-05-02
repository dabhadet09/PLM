import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, Shield, Lock, Unlock, ChevronLeft, ChevronRight, KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const PAGE_SIZE = 8;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const currentUser = localStorage.getItem('username');

  // Reset password modal state
  const [resetTarget, setResetTarget] = useState(null); // { id, username }
  const [resetForm, setResetForm] = useState({ newPassword: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetting, setResetting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/Users');
      setUsers(res.data);
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleHold = async (id) => {
    try {
      await api.put(`/Users/${id}/toggle-hold`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling hold');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/Users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const openResetModal = (user) => {
    setResetTarget({ id: user.id, username: user.username });
    setResetForm({ newPassword: '', confirmPassword: '' });
    setResetError('');
    setResetSuccess('');
    setShowPwd(false);
    setShowConfirm(false);
  };

  const closeResetModal = () => {
    setResetTarget(null);
    setResetError('');
    setResetSuccess('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (resetForm.newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetting(true);
    try {
      await api.put(`/Users/${resetTarget.id}/reset-password`, { newPassword: resetForm.newPassword });
      setResetSuccess('Password reset successfully!');
      setResetForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => closeResetModal(), 1500);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Error resetting password.');
    } finally {
      setResetting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paged = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <motion.div
        className="card-clean"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="card-header-clean">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={15} /> System Users
            <span style={{
              fontSize: 11, background: 'var(--surface-2)',
              padding: '1px 8px', borderRadius: 20,
              color: 'var(--text-muted)', fontWeight: 400,
            }}>
              {users.length}
            </span>
          </span>
        </div>

        <table className="clean-table">
          <thead>
            <tr>
              <th>Username / Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.username} {u.username === currentUser && <span style={{fontSize: 10, color: 'var(--text-muted)'}}>( You)</span>}</td>
                <td><span className="badge-role">{u.role}</span></td>
                <td>
                  <span className={u.isActive ? 'badge-active' : 'badge-open'}>
                    {u.isActive ? 'Active' : 'On Hold'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {u.role !== 'Admin' && (
                      <>
                        <button
                          className="btn-sm-ghost"
                          onClick={() => openResetModal(u)}
                          title="Reset Password"
                          style={{ padding: 4 }}
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          className="btn-sm-ghost"
                          onClick={() => handleToggleHold(u.id)}
                          title={u.isActive ? "Put on hold" : "Remove hold"}
                          style={{ padding: 4 }}
                        >
                          {u.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                        <button
                          className="btn-sm-danger"
                          onClick={() => handleDelete(u.id)}
                          title="Delete User"
                          style={{ padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    {u.role === 'Admin' && <Shield size={14} className="text-muted" title="Admin protected" />}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading users...</td>
              </tr>
            )}
          </tbody>
        </table>

        {users.length > PAGE_SIZE && (
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

      {/* ── Reset Password Modal ─────────────────────────── */}
      {resetTarget && (
        <div className="modal-overlay" onClick={closeResetModal}>
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
                <h5 style={{ margin: 0, fontSize: 15 }}>Reset Password</h5>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{resetTarget.username}</p>
              </div>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="form-field">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-new-password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={resetForm.newPassword}
                    onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    placeholder="Min. 8 characters"
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 0, display: 'flex',
                    }}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={resetForm.confirmPassword}
                    onChange={e => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 0, display: 'flex',
                    }}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {resetError && (
                <p style={{
                  fontSize: 12, color: 'var(--danger)', background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                  padding: '8px 12px', marginBottom: 8,
                }}>
                  {resetError}
                </p>
              )}
              {resetSuccess && (
                <p style={{
                  fontSize: 12, color: 'var(--success)', background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8,
                  padding: '8px 12px', marginBottom: 8,
                }}>
                  {resetSuccess}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-sm-ghost" onClick={closeResetModal}>Cancel</button>
                <button
                  id="confirm-reset-password-btn"
                  type="submit"
                  className="btn-sm-primary"
                  disabled={resetting}
                >
                  {resetting ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageUsers;
