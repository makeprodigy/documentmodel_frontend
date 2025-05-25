import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { register } from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(username, email, password);
      navigate('/login');
    } catch (error) {
      setError(error.detail || 'Registration failed');
    }
  };

  return (
    <div className="center-container">
      <div className="auth-form-container">
        <Typography variant="h4" className="auth-form-title">
          Register
        </Typography>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
          >
            Register
          </Button>
          
          <div className="auth-form-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-form-link">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register; 