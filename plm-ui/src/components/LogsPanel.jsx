import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Activity, AlertTriangle } from 'lucide-react';
import api from '../services/api';

/* ── helpers ──────────────────────────────────────────────── */
const fmt = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

const today = () => new Date().toISOString().slice(0, 10);
const dayAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};
const weekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
};
const monthAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

/* ── LogsPanel ────────────────────────────────────────────── */
const LogsPanel = ({ assetId }) => {
  const [from, setFrom]           = useState(weekAgo());
  const [to, setTo]               = useState(today());
  const [page, setPage]           = useState(1);
  const [pageSize]                = useState(20);
  const [data, setData]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [threshold, setThreshold] = useState(null);
  const [loading, setLoading]     = useState(false);

  /* Reset page when filters change */
  useEffect(() => { setPage(1); }, [assetId, from, to]);

  /* Fetch readings (paged) */
  const fetchReadings = useCallback(async () => {
    if (!assetId) return;
    setLoading(true);
    try {
      const res = await api.get('/Readings/paged', {
        params: { assetId, from, to, page, pageSize },
      });
      const rows = (res.data.items ?? res.data).map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        temp: r.temp ?? null,
        rms: r.rms ?? null,
      }));
      setData(rows);
      setTotal(res.data.totalCount ?? rows.length);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [assetId, from, to, page, pageSize]);

  /* Fetch threshold for selected asset */
  useEffect(() => {
    if (!assetId) return;
    api.get(`/Thresholds/asset/${assetId}`)
      .then(r => setThreshold(r.data))
      .catch(() => setThreshold(null));
  }, [assetId]);

  useEffect(() => { fetchReadings(); }, [fetchReadings]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasData = data.length > 0;

  return (
    <div className="card-clean">
      {/* Header */}
      <div className="card-header-clean">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={15} /> Sensor Logs
        </span>
      </div>

      {/* Filters */}
      <div style={{
        padding: '12px 20px', display: 'flex', flexWrap: 'wrap',
        gap: 12, borderBottom: '1px solid var(--border)', alignItems: 'center',
      }}>
        {/* Date From */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Calendar size={10} style={{ marginRight: 3 }} />From
          </label>
          <input
            id="logs-from-date"
            type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 13,
              outline: 'none', colorScheme: 'dark',
            }}
          />
        </div>

        {/* Date To */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Calendar size={10} style={{ marginRight: 3 }} />To
          </label>
          <input
            id="logs-to-date"
            type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 13,
              outline: 'none', colorScheme: 'dark',
            }}
          />
        </div>

        {/* Quick Date Filters */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, paddingBottom: 2 }}>
          <button type="button" className="btn-sm-ghost" onClick={() => { setFrom(monthAgo()); setTo(today()); }}>Last 30 Days</button>
          <button type="button" className="btn-sm-ghost" onClick={() => { setFrom(dayAgo()); setTo(today()); }}>Last 24 Hours</button>
          <button type="button" className="btn-sm-ghost" onClick={() => { setFrom(weekAgo()); setTo(today()); }}>Last 7 Days</button>
          <button type="button" className="btn-sm-ghost" onClick={() => { setFrom(weekAgo()); setTo(today()); }}>Reset</button>
        </div>

        {loading && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', alignSelf: 'flex-end' }}>
            Loading…
          </span>
        )}
      </div>

      {/* Body */}
      <div className="card-body-clean" style={{ padding: 0 }}>
        {!hasData && !loading ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <AlertTriangle size={40} style={{ opacity: 0.2, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <p>No logs found for this asset in the selected date range.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '10px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Temperature (°C)</th>
                  <th style={{ padding: '10px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>RMS Vibration</th>
                  <th style={{ padding: '10px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(r => {
                  const tempBreach = threshold && r.temp > threshold.tempMax;
                  const rmsBreach = threshold && r.rms > threshold.rmsMax;
                  return (
                    <tr key={r.id || r.timestamp} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 20px' }}>{fmt(r.timestamp)}</td>
                      <td style={{ padding: '10px 20px', color: tempBreach ? '#f87171' : 'inherit' }}>
                        {r.temp !== null ? r.temp : '—'}
                      </td>
                      <td style={{ padding: '10px 20px', color: rmsBreach ? '#f87171' : 'inherit' }}>
                        {r.rms !== null ? r.rms : '—'}
                      </td>
                      <td style={{ padding: '10px 20px' }}>
                        {(tempBreach || rmsBreach) ? (
                          <span style={{ color: '#f87171', fontWeight: 600, fontSize: 12 }}>⚠ BREACH</span>
                        ) : (
                          <span style={{ color: '#10b981', fontSize: 12 }}>✓ OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasData && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 10, padding: '10px 20px', borderTop: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Page {page} / {totalPages} &nbsp;·&nbsp; {total} logs
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
    </div>
  );
};

export default LogsPanel;
