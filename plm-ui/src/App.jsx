import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { Activity, LayoutDashboard, LogOut, Settings, Moon, Sun, Users, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import Overview from './components/Overview';
import AssetList from './components/AssetList';
import ManageUsers from './components/ManageUsers';
import Login from './components/Login';
import Register from './components/Register';
import AdminResetPassword from './components/AdminResetPassword';

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
        <li>
          <NavLink to="/manage-assets" className={({ isActive }) => isActive ? 'active' : ''}>
            <Settings size={16} /> Manage Assets
          </NavLink>
        </li>
        {role === 'Admin' && (
          <>
            <li>
              <NavLink to="/manage-users" className={({ isActive }) => isActive ? 'active' : ''}>
                <Users size={16} /> Manage Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reset-password" className={({ isActive }) => isActive ? 'active' : ''}>
                <KeyRound size={16} /> Reset Password
              </NavLink>
            </li>
          </>
        )}
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
function AppShell({ handleLogout, title, children, theme, toggleTheme }) {
  return (
    <div className="app-shell">
      <Sidebar handleLogout={handleLogout} />
      <div className="main-content">
        <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5>{title}</h5>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={toggleTheme}
              className="btn-sm-ghost"
              style={{ padding: '6px', borderRadius: '50%' }}
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── App Root ───────────────────── */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={isAuthenticated ? <AppShell handleLogout={handleLogout} title="Dashboard" theme={theme} toggleTheme={toggleTheme}><Overview /></AppShell> : <Navigate to="/login" />} />
      <Route path="/manage-assets" element={isAuthenticated ? <AppShell handleLogout={handleLogout} title="Manage Assets" theme={theme} toggleTheme={toggleTheme}><div className="page-body"><AssetList /></div></AppShell> : <Navigate to="/login" />} />
      <Route path="/manage-users" element={isAuthenticated && localStorage.getItem('userRole') === 'Admin' ? <AppShell handleLogout={handleLogout} title="Manage Users" theme={theme} toggleTheme={toggleTheme}><div className="page-body"><ManageUsers /></div></AppShell> : <Navigate to="/dashboard" />} />
      <Route path="/admin/reset-password" element={isAuthenticated && localStorage.getItem('userRole') === 'Admin' ? <AdminResetPassword /> : <Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}

export default App;
