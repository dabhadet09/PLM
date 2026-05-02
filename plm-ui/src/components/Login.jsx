import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Login = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successAnim, setSuccessAnim] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/Auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('username', res.data.username);
      setAuth(true);
      setSuccessAnim(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Container fluid className="min-vh-100 p-0 d-flex">
      <Row className="w-100 m-0">
        <Col md={6} className="d-none d-md-flex flex-column justify-content-center align-items-start p-5 bg-primary bg-opacity-10 position-relative overflow-hidden">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="z-1 px-5">
            <Activity size={64} className="text-primary mb-4" />
            <h1 className="display-4 fw-bold text-light mb-4">Monitor Assets<br/>in Real-Time</h1>
            <p className="lead text-muted mb-4">
              Predictive Maintenance Lite empowers you to track machinery, anticipate failures before they happen, and drastically reduce downtime.
            </p>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">✓ Real-time sensor telemetry</li>
              <li className="mb-2">✓ Automatic ticket generation</li>
              <li className="mb-2">✓ Role-based access control</li>
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
              <h2 className="fw-bold gradient-text">Welcome Back</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>
            
            <Card className="glass-card border-0 p-4">
              <AnimatePresence mode="wait">
                {successAnim ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="d-flex flex-column align-items-center justify-content-center py-5"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <CheckCircle size={64} className="text-success mb-3" />
                    </motion.div>
                    <h4 className="text-light fw-bold">Login Successful</h4>
                    <p className="text-muted">Redirecting to Dashboard...</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {error && <Alert variant="danger" className="py-2 border-0 bg-danger bg-opacity-25 text-danger">{error}</Alert>}
                    <Form onSubmit={handleLogin}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-muted">Email Address</Form.Label>
                        <Form.Control type="email" pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" title="Please enter a full valid email address (e.g., abc@gmail.com)" className="bg-dark text-light border-secondary py-2" value={username} onChange={(e) => setUsername(e.target.value)} required />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="text-muted">Password</Form.Label>
                        <Form.Control type="password" className="bg-dark text-light border-secondary py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </Form.Group>
                      <Button variant="primary" type="submit" className="w-100 rounded-pill mb-4 py-2 fw-bold shadow-sm">Sign In</Button>
                      <div className="text-center">
                        <span className="text-muted">Don't have an account? </span>
                        <Link to="/register" className="text-primary text-decoration-none fw-medium">Register here</Link>
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

export default Login;
