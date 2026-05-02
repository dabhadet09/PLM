import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, CheckCircle, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const AdminResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                     = useState('');
  const [successAnim, setSuccessAnim]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const navigate  = useNavigate();
  const username  = localStorage.getItem('username') || '';
  const userRole  = localStorage.getItem('userRole') || '';

  /* Keep dark theme while on this page */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  /* Redirect non-admins away */
  useEffect(() => {
    if (userRole !== 'Admin') navigate('/dashboard');
  }, [userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    /* Client-side validation */
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (!/(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('New password must contain at least one uppercase letter and one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    setLoading(true);
    try {
      /* Step 1 – verify current password via login */
      await api.post('/Auth/login', { username, password: currentPassword });

      /* Step 2 – fetch admin user id */
      const usersRes = await api.get('/Users');
      const adminUser = usersRes.data.find(u => u.username === username);
      if (!adminUser) throw new Error('Admin account not found.');

      /* Step 3 – reset password */
      await api.put(`/Users/${adminUser.id}/reset-password`, { newPassword });

      setSuccessAnim(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password.';
      /* Distinguish wrong current password from other errors */
      if (err.response?.status === 401) {
        setError('Current password is incorrect.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* Password strength meter */
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8)              score++;
    if (pwd.length >= 12)             score++;
    if (/[A-Z]/.test(pwd))           score++;
    if (/\d/.test(pwd))              score++;
    if (/[^A-Za-z0-9]/.test(pwd))   score++;
    return score;
  };
  const strength      = getStrength(newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] || '';
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][strength] || 'transparent';

  return (
    <Container fluid className="min-vh-100 p-0 d-flex">
      <Row className="w-100 m-0">

        {/* ── Left Panel ─────────────────────────── */}
        <Col
          md={6}
          className="d-none d-md-flex flex-column justify-content-center align-items-start p-5 bg-primary bg-opacity-10 position-relative overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="z-1 px-5"
          >
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
            }}>
              <ShieldCheck size={40} color="#3b82f6" />
            </div>
            <h1 className="display-4 fw-bold text-light mb-4">
              Secure Your<br />Admin Account
            </h1>
            <p className="lead text-muted mb-4">
              Regularly updating your password helps protect the system from unauthorized access and keeps your assets safe.
            </p>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">🔒 Current password verification required</li>
              <li className="mb-2">🔑 Min. 8 chars · 1 uppercase · 1 number</li>
              <li className="mb-2">✓ BCrypt-hashed &amp; stored securely</li>
            </ul>
          </motion.div>

          {/* Decorative blobs */}
          <div className="position-absolute rounded-circle bg-primary opacity-25"
            style={{ width: 400, height: 400, top: -100, left: -100, filter: 'blur(80px)' }} />
          <div className="position-absolute rounded-circle bg-secondary opacity-25"
            style={{ width: 300, height: 300, bottom: 50, right: -50, filter: 'blur(60px)' }} />
        </Col>

        {/* ── Right Panel (form) ──────────────────── */}
        <Col md={6} className="d-flex align-items-center justify-content-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-100"
            style={{ maxWidth: 450 }}
          >
            {/* Mobile logo */}
            <div className="text-center mb-4 d-md-none">
              <Activity size={48} className="text-primary mb-3" />
            </div>

            <div className="mb-5">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <KeyRound size={22} color="#3b82f6" />
                <h2 className="fw-bold gradient-text mb-0">Reset Password</h2>
              </div>
              <p className="text-muted" style={{ paddingLeft: 32 }}>
                Logged in as <strong className="text-light">{username}</strong>
              </p>
            </div>

            <Card className="glass-card border-0 p-4">
              <AnimatePresence mode="wait">
                {successAnim ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="d-flex flex-column align-items-center justify-content-center py-5"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                      <CheckCircle size={64} className="text-success mb-3" />
                    </motion.div>
                    <h4 className="text-light fw-bold">Password Updated!</h4>
                    <p className="text-muted">Redirecting to Dashboard…</p>
                  </motion.div>
                ) : (
                  /* ── Form state ── */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {error && (
                      <Alert variant="danger" className="py-2 border-0 bg-danger bg-opacity-25 text-danger">
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      {/* Current password */}
                      <Form.Group className="mb-3">
                        <Form.Label className="text-muted">Current Password</Form.Label>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            id="current-password"
                            type={showCurrent ? 'text' : 'password'}
                            className="bg-dark text-light border-secondary py-2"
                            style={{ paddingRight: 44 }}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrent(v => !v)}
                            style={{
                              position: 'absolute', right: 12, top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#6c757d', padding: 0, display: 'flex',
                            }}
                          >
                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </Form.Group>

                      {/* Divider */}
                      <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                        margin: '20px 0',
                        position: 'relative',
                      }}>
                        <span style={{
                          position: 'absolute', top: -10, left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#1a1d2e', padding: '0 12px',
                          fontSize: 11, color: '#6c757d', letterSpacing: '0.05em',
                        }}>
                          NEW PASSWORD
                        </span>
                      </div>

                      {/* New password */}
                      <Form.Group className="mb-2">
                        <Form.Label className="text-muted">New Password</Form.Label>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            id="new-password"
                            type={showNew ? 'text' : 'password'}
                            className="bg-dark text-light border-secondary py-2"
                            style={{ paddingRight: 44 }}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Min. 8 chars · 1 uppercase · 1 number"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(v => !v)}
                            style={{
                              position: 'absolute', right: 12, top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#6c757d', padding: 0, display: 'flex',
                            }}
                          >
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </Form.Group>

                      {/* Strength meter */}
                      {newPassword.length > 0 && (
                        <div className="mb-3">
                          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} style={{
                                flex: 1, height: 3, borderRadius: 2,
                                background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)',
                                transition: 'background 0.3s',
                              }} />
                            ))}
                          </div>
                          <p style={{ fontSize: 11, color: strengthColor, margin: 0 }}>{strengthLabel}</p>
                        </div>
                      )}

                      {/* Confirm password */}
                      <Form.Group className="mb-4">
                        <Form.Label className="text-muted">Confirm New Password</Form.Label>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            id="confirm-password"
                            type={showConfirm ? 'text' : 'password'}
                            className="bg-dark text-light border-secondary py-2"
                            style={{
                              paddingRight: 44,
                              borderColor: confirmPassword && confirmPassword !== newPassword
                                ? '#ef4444' : confirmPassword && confirmPassword === newPassword
                                ? '#22c55e' : '',
                            }}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(v => !v)}
                            style={{
                              position: 'absolute', right: 12, top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#6c757d', padding: 0, display: 'flex',
                            }}
                          >
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4, marginBottom: 0 }}>
                            Passwords do not match
                          </p>
                        )}
                        {confirmPassword && confirmPassword === newPassword && (
                          <p style={{ fontSize: 11, color: '#22c55e', marginTop: 4, marginBottom: 0 }}>
                            ✓ Passwords match
                          </p>
                        )}
                      </Form.Group>

                      <Button
                        id="reset-password-submit-btn"
                        variant="primary"
                        type="submit"
                        className="w-100 rounded-pill mb-4 py-2 fw-bold shadow-sm"
                        disabled={loading}
                      >
                        {loading ? 'Updating Password…' : 'Update Password'}
                      </Button>

                      <div className="text-center">
                        <Link to="/dashboard" className="text-muted text-decoration-none" style={{ fontSize: 13 }}>
                          ← Back to Dashboard
                        </Link>
                      </div>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminResetPassword;
