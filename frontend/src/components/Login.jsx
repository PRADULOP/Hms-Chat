import { Button, TextField, Typography, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginDoctor, loginPatient } from '../api';

export default function Login() {
  const [role, setRole] = useState('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const loginFn = role === 'doctor' ? loginDoctor : loginPatient;
      const { data } = await loginFn({ email, password });
      localStorage.setItem('user', JSON.stringify(data));
      navigate(`/${role}`);
    } catch (err) {
      alert('Invalid Credentials');
    }
  };

  return (
    <Box textAlign="center" mt={8}>
      <Typography variant="h4">Login</Typography>
      <TextField fullWidth margin="normal" label="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <TextField fullWidth margin="normal" type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <Box my={2}>
        <Button variant={role === 'doctor' ? 'contained' : 'outlined'} onClick={() => setRole('doctor')}>Doctor</Button>
        <Button variant={role === 'patient' ? 'contained' : 'outlined'} onClick={() => setRole('patient')} sx={{ ml: 2 }}>Patient</Button>
      </Box>
      <Button variant="contained" onClick={handleLogin}>Login</Button>
    </Box>
  );
}
