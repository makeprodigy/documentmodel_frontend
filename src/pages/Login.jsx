import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { login } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      setError(error.detail || 'Invalid username or password');
    }
  };

  return (
    <div className="center-container">
      <div className="auth-form-container">
        <Typography variant="h4" className="auth-form-title">
          Login
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
            Login
          </Button>
          
          <div className="auth-form-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-form-link">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; 