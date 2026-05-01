import React, { useState } from 'react';
import { Card, Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Engineer');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Auth/register', { username, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container fluid className="min-vh-100 p-0 d-flex">
      <Row className="w-100 m-0">
        <Col md={6} className="d-none d-md-flex flex-column justify-content-center align-items-start p-5 bg-primary bg-opacity-10 position-relative overflow-hidden">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="z-1 px-5">
            <Activity size={64} className="text-primary mb-4" />
            <h1 className="display-4 fw-bold text-light mb-4">Join The Future<br/>of Maintenance</h1>
            <p className="lead text-muted mb-4">
              By joining Predictive Maintenance Lite, you are taking the first step towards zero unplanned downtime. Monitor systems securely and act on intelligent alerts.
            </p>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">✓ Advanced analytical models</li>
              <li className="mb-2">✓ Beautiful responsive dashboard</li>
              <li className="mb-2">✓ Unified asset management</li>
            </ul>
          </motion.div>
          {/* Decorative background elements */}
          <div className="position-absolute rounded-circle bg-primary opacity-25" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px', filter: 'blur(80px)' }}></div>
          <div className="position-absolute rounded-circle bg-secondary opacity-25" style={{ width: '300px', height: '300px', bottom: '50px', right: '-50px', filter: 'blur(60px)' }}></div>
        </Col>

        <Col md={6} className="d-flex align-items-center justify-content-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-100" style={{ maxWidth: '450px' }}>
            <div className="text-center mb-4 d-md-none">
              <Activity size={48} className="text-primary mb-3" />
            </div>
            <div className="mb-5">
              <h2 className="fw-bold gradient-text">Create Account</h2>
              <p className="text-muted">Set up your workspace</p>
            </div>
            
            <Card className="glass-card border-0 p-4">
              {error && <Alert variant="danger" className="py-2 border-0 bg-danger bg-opacity-25 text-danger">{error}</Alert>}
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Email Address</Form.Label>
                  <Form.Control type="email" pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" title="Please enter a full valid email address (e.g., abc@gmail.com)" className="bg-dark text-light border-secondary py-2" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Password</Form.Label>
                  <Form.Control type="password" pattern="(?=.*\d)(?=.*[A-Z]).{8,}" title="Must contain at least one number and one uppercase letter, and at least 8 or more characters" className="bg-dark text-light border-secondary py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted">Role</Form.Label>
                  <Form.Select className="bg-dark text-light border-secondary py-2" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Engineer">Engineer</option>
                    <option value="Admin">Admin</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 rounded-pill mb-4 py-2 fw-bold shadow-sm">Register</Button>
                <div className="text-center">
                  <span className="text-muted">Already have an account? </span>
                  <Link to="/login" className="text-primary text-decoration-none fw-medium">Sign In</Link>
                </div>
              </Form>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
