import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { Activity, LayoutDashboard, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Overview from './components/Overview';
import Login from './components/Login';
import Register from './components/Register';

/* ── Sidebar ────────────────────── */
function Sidebar({ handleLogout }) {
  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('userRole') || 'Engineer';
  const initials = username[0]?.toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity size={22} className="logo-icon" />
        <div>
          <h6>PLM Lite</h6>
          <p>Predictive Maintenance</p>
        </div>
      </div>

      <p className="sidebar-section-title">Navigation</p>
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
            <div className="role"><span className="badge-role">{role}</span></div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Main Shell ─────────────────── */
function DashboardShell({ handleLogout }) {
  return (
    <div className="app-shell">
      <Sidebar handleLogout={handleLogout} />
      <div className="main-content">
        <div className="topbar">
          <h5>Dashboard</h5>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <Overview />
      </div>
    </div>
  );
}

/* ── App Root ───────────────────── */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardShell handleLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}

export default App;
