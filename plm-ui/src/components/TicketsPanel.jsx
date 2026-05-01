import React from 'react';
import api from '../services/api';

const TicketsPanel = ({ assetId, tickets, onRefresh }) => {
  const resolve = async (ticket) => {
    await api.patch(`/Tickets/${ticket.id}/status`, JSON.stringify('Closed'), {
      headers: { 'Content-Type': 'application/json' }
    });
    onRefresh();
  };

  if (tickets.length === 0) {
    return (
      <div className="card-clean">
        <div className="empty-state">
          <p>✅ No tickets for this asset. All clear!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-clean">
      <div className="card-header-clean"><span>Tickets</span></div>
      <table className="clean-table">
        <thead>
          <tr><th>Type</th><th>Status</th><th>Created</th><th>Action</th></tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id}>
              <td style={{ fontWeight: 600 }}>{t.type}</td>
              <td><span className={t.status === 'Open' ? 'badge-open' : 'badge-closed'}>{t.status}</span></td>
              <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(t.createdAt).toLocaleString()}</td>
              <td>
                {t.status === 'Open' && (
                  <button className="btn-sm-ghost" style={{ fontSize: 12 }} onClick={() => resolve(t)}>Resolve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsPanel;
