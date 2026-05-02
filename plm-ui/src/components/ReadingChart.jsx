import React, { useState, useEffect, useCallback } from 'react';
import {
  ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Activity, Calendar, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '../services/api';

/* ── helpers ──────────────────────────────────────────────── */
const fmt = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
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

/* ── Custom Tooltip ───────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, threshold }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload ?? {};
  const tempBreach = threshold && d.temp > threshold.tempMax;
  const rmsBreach = threshold && d.rms > threshold.rmsMax;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {d.temp != null && (
        <p style={{ color: tempBreach ? '#f87171' : '#f59e0b', fontWeight: 600 }}>
          🌡 Temp: {d.temp}°C {tempBreach && '⚠ BREACH'}
        </p>
      )}
      {d.rms != null && (
        <p style={{ color: rmsBreach ? '#f87171' : '#60a5fa', fontWeight: 600 }}>
          📳 RMS: {d.rms} {rmsBreach && '⚠ BREACH'}
        </p>
      )}
    </div>
  );
};

/* ── ReadingChart ─────────────────────────────────────────── */
const ReadingChart = ({ assets, selectedAssetId }) => {
  const [assetId, setAssetId]     = useState(selectedAssetId ? String(selectedAssetId) : '');

  useEffect(() => {
    if (selectedAssetId) {
      setAssetId(String(selectedAssetId));
    }
  }, [selectedAssetId]);
  const [from, setFrom]           = useState(weekAgo());
  const [to, setTo]               = useState(today());
  const [page, setPage]           = useState(1);
  const [pageSize]                = useState(50);
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
        label: fmt(r.timestamp),
        temp:  r.temp  ?? null,
        rms:   r.rms   ?? null,
        // separate scatter series for breach points
        tempBreach: threshold && r.temp  > threshold.tempMax  ? r.temp  : null,
        rmsBreach:  threshold && r.rms   > threshold.rmsMax   ? r.rms   : null,
      }));
      setData(rows);
      setTotal(res.data.totalCount ?? rows.length);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [assetId, from, to, page, pageSize, threshold]);

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

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="card-clean" style={{ marginBottom: 20 }}>
      {/* Header */}
      <div className="card-header-clean">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={15} /> Sensor Readings — RMS &amp; Temperature Trend
        </span>
        {threshold && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={12} color="var(--warning)" />
            Thresholds: Temp ≤ {threshold.tempMax}°C · RMS ≤ {threshold.rmsMax}
          </span>
        )}
      </div>

      {/* Filters */}
      <div style={{
        padding: '12px 20px', display: 'flex', flexWrap: 'wrap',
        gap: 12, borderBottom: '1px solid var(--border)', alignItems: 'center',
      }}>
        {/* Asset Picker */}
        {!selectedAssetId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Asset
            </label>
            <select
              id="chart-asset-select"
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 13,
                outline: 'none', minWidth: 160,
              }}
            >
              <option value="">— Select Asset —</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        )}

        {/* Date From */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Calendar size={10} style={{ marginRight: 3 }} />From
          </label>
          <input
            id="chart-from-date"
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
            id="chart-to-date"
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

      {/* Chart Body */}
      <div style={{ padding: '20px 16px 8px' }}>
        {!assetId ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <Activity size={40} style={{ opacity: 0.2, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <p>Select an asset above to view its sensor readings.</p>
          </div>
        ) : !hasData && !loading ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <AlertTriangle size={40} style={{ opacity: 0.2, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
            <p>No readings found for this asset in the selected date range.</p>
            <p style={{ fontSize: 11, marginTop: 6 }}>Try expanding the date range or check sensor data ingestion.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              {/* Left Y: Temperature */}
              <YAxis
                yAxisId="temp"
                orientation="left"
                tick={{ fill: '#f59e0b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                label={{ value: '°C', position: 'insideLeft', fill: '#f59e0b', fontSize: 10 }}
              />
              {/* Right Y: RMS */}
              <YAxis
                yAxisId="rms"
                orientation="right"
                tick={{ fill: '#60a5fa', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'RMS', position: 'insideRight', fill: '#60a5fa', fontSize: 10 }}
              />

              <Tooltip content={<CustomTooltip threshold={threshold} />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 12 }}
              />

              {/* Threshold reference lines */}
              {threshold?.tempMax && (
                <ReferenceLine yAxisId="temp" y={threshold.tempMax}
                  stroke="#f87171" strokeDasharray="5 3" strokeWidth={1.5}
                  label={{ value: `Temp Limit ${threshold.tempMax}°C`, fill: '#f87171', fontSize: 10, position: 'insideTopLeft' }}
                />
              )}
              {threshold?.rmsMax && (
                <ReferenceLine yAxisId="rms" y={threshold.rmsMax}
                  stroke="#f87171" strokeDasharray="5 3" strokeWidth={1.5}
                  label={{ value: `RMS Limit ${threshold.rmsMax}`, fill: '#f87171', fontSize: 10, position: 'insideTopRight' }}
                />
              )}

              {/* Normal trend lines */}
              <Line
                yAxisId="temp" type="monotone" dataKey="temp"
                stroke="#f59e0b" strokeWidth={2} dot={false}
                name="Temperature (°C)"
              />
              <Line
                yAxisId="rms" type="monotone" dataKey="rms"
                stroke="#3b82f6" strokeWidth={2} dot={false}
                name="RMS Vibration"
              />

              {/* Breach scatter markers */}
              <Scatter
                yAxisId="temp" dataKey="tempBreach"
                fill="#ef4444" name="Temp Breach"
                shape={<BreachDot />}
              />
              <Scatter
                yAxisId="rms" dataKey="rmsBreach"
                fill="#ef4444" name="RMS Breach"
                shape={<BreachDot />}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pagination */}
      {hasData && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 10, padding: '10px 20px', borderTop: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Page {page} / {totalPages} &nbsp;·&nbsp; {total} readings
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

/* Red dot for breach points */
const BreachDot = (props) => {
  const { cx, cy } = props;
  if (!cy && cy !== 0) return null;
  return (
    <circle cx={cx} cy={cy} r={5} fill="#ef4444"
      stroke="#fff" strokeWidth={1.5} opacity={0.9} />
  );
};

export default ReadingChart;
