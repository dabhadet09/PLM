import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Cpu, Plus } from 'lucide-react';
import api from '../services/api';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', location: '', type: '' });

  const fetchAssets = async () => {
    try {
      const response = await api.get('/Assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
    const interval = setInterval(fetchAssets, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Assets', { ...newAsset, status: 'Active' });
      setShowModal(false);
      fetchAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className="glass-card border-0 h-100">
          <Card.Header className="d-flex justify-content-between align-items-center py-3 border-bottom border-secondary border-opacity-25">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <Cpu className="text-primary" />
              Monitored Assets
            </h5>
            {localStorage.getItem('userRole') === 'Admin' && (
              <Button variant="primary" size="sm" className="d-flex align-items-center gap-1 rounded-pill px-3" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add Asset
              </Button>
            )}
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="text-muted">
                  <tr>
                    <th className="px-4 py-3 border-0">Asset Name</th>
                    <th className="py-3 border-0">Location</th>
                    <th className="py-3 border-0">Type</th>
                    <th className="py-3 border-0">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-bottom border-secondary border-opacity-25">
                      <td className="px-4 py-3 fw-medium">{asset.name}</td>
                      <td className="py-3 text-muted">{asset.location}</td>
                      <td className="py-3 text-muted">{asset.type}</td>
                      <td className="py-3">
                        <Badge bg={asset.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill px-3 py-2 bg-opacity-25 text-success border border-success border-opacity-50">
                          {asset.status || 'Active'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        No assets found. Add one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Add Asset Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card text-light">
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
          <Modal.Title>Add New Asset</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddAsset}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Asset Name</Form.Label>
              <Form.Control type="text" required placeholder="e.g. Engine-01" className="bg-dark text-light border-secondary" value={newAsset.name} onChange={(e) => setNewAsset({...newAsset, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Control type="text" required placeholder="e.g. Engine" className="bg-dark text-light border-secondary" value={newAsset.type} onChange={(e) => setNewAsset({...newAsset, type: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" required placeholder="e.g. Factory Floor" className="bg-dark text-light border-secondary" value={newAsset.location} onChange={(e) => setNewAsset({...newAsset, location: e.target.value})} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-secondary border-opacity-25">
            <Button variant="outline-light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Asset</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AssetList;
