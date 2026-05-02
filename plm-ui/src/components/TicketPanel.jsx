import React, { useState } from 'react';
import { Ticket, CheckCircle2, Clock, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const PAGE_SIZE = 8;

/**
 * TicketPanel
 * Props:
 *   assetId   – number
 *   tickets   – array from parent
 *   onRefresh – parent reload callback
 */
const TicketPanel = ({ assetId, tickets, onRefresh }) => {
  const [filter, setFilter]   = useState('all'); // 'all' | 'Open' | 'Closed'
  const [page, setPage]       = useState(1);
  const [resolving, setResolving] = useState(null);

  /* Reset pagination when filter changes */
  const changeFilter = (f) => { setFilter(f); setPage(1); };

  const resolve = async (ticket) => {
    setResolving(ticket.id);
    try {
      await api.patch(`/Tickets/${ticket.id}/status`, JSON.stringify('Closed'), {
        headers: { 'Content-Type': 'application/json' },
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setResolving(null);
    }
  };

  /* Filtered list */
  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCount   = tickets.filter(t => t.status === 'Open').length;
  const closedCount = tickets.filter(t => t.status === 'Closed').length;

  return (
    <div className="card-clean">
      {/* Header */}
      <div className="card-header-clean">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ticket size={15} /> Maintenance Tickets
        </span>
        <span style={{ display: 'flex', gap: 6 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 10px',
            borderRadius: 20, background: 'rgba(239,68,68,0.15)', color: '#f87171',
          }}>
            {openCount} Open
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 10px',
            borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#34d399',
          }}>
            {closedCount} Closed
          </span>
        </span>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex', gap: 6, padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        {['all', 'Open', 'Closed'].map(f => (
          <button
            key={f}
            id={`ticket-filter-${f.toLowerCase()}`}
            onClick={() => changeFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: 20, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === f ? 'var(--primary)' : 'var(--surface-2)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {f === 'all' ? 'All' : f}
            {f !== 'all' && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>
                ({f === 'Open' ? openCount : closedCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {paged.length === 0 ? (
        <div className="empty-state">
          <FilterX size={36} style={{ opacity: 0.2, display: 'block', margin: '0 auto 10px' }} />
          <p>
            {tickets.length === 0
              ? '✅ No tickets for this asset — all systems clear!'
              : `No ${filter} tickets to display.`}
          </p>
          {tickets.length === 0 && (
            <p style={{ fontSize: 11, marginTop: 4 }}>
              Tickets are auto-created when sensor readings breach configured thresholds.
            </p>
          )}
        </div>
      ) : (
        <table className="clean-table">
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <AnimatePresence mode="popLayout">
            <tbody>
              {paged.map(t => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.status === 'Open'
                      ? <Clock size={13} color="#f87171" />
                      : <CheckCircle2 size={13} color="#34d399" />
                    }
                    {t.type || t.issueType || '—'}
                  </td>
                  <td>
                    <span className={t.status === 'Open' ? 'badge-open' : 'badge-closed'}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(t.createdAt).toLocaleString('en-IN', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {t.status === 'Open' && (
                      <button
                        className="btn-sm-ghost"
                        style={{ fontSize: 12 }}
                        disabled={resolving === t.id}
                        onClick={() => resolve(t)}
                      >
                        {resolving === t.id ? 'Resolving…' : 'Resolve'}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </AnimatePresence>
        </table>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
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
    </div>
  );
};

export default TicketPanel;
