import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, CheckCircle } from 'lucide-react';
import api from '../services/api';

const TicketsTable = () => {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/Tickets');
      setTickets(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id) => {
    try {
      // Assuming a PUT endpoint to update ticket status exists or just ignoring for UI demo
      await api.put(`/Tickets/${id}`, { status: 'Closed' });
      fetchTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Card className="glass-card border-0 h-100">
        <Card.Header className="py-3 border-bottom border-secondary border-opacity-25">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <AlertOctagon className="text-warning" />
            Recent Alerts & Tickets
          </h5>
        </Card.Header>
        <Card.Body className="p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <ListGroup variant="flush" className="bg-transparent">
            <AnimatePresence>
              {tickets.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <CheckCircle size={48} className="text-success mb-3 opacity-50" />
                  <p className="mb-0">All systems clear. No active tickets.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <motion.div key={ticket.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="border-bottom border-secondary border-opacity-25">
                    <ListGroup.Item className="bg-transparent text-light border-0 py-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 fw-bold">{ticket.title || `Alert: ${ticket.issueType}`}</h6>
                        <Badge bg={ticket.status === 'Closed' ? 'success' : 'danger'} className="rounded-pill px-2">
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-2">{ticket.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{new Date(ticket.createdAt).toLocaleString()}</small>
                        {ticket.status !== 'Closed' && (
                          <Button variant="outline-success" size="sm" className="rounded-pill py-0 px-2" onClick={() => handleResolve(ticket.id)}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </ListGroup>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default TicketsTable;
