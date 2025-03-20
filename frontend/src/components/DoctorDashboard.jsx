import { Box, Typography } from '@mui/material';
import ChatWindow from './ChatWindow';

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Box p={4} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
        Doctor Dashboard
      </Typography>

      <Typography variant="h6" sx={{ mb: 4 }}>
        Welcome Dr. {user?.doctor?.name}
      </Typography>

      {/* Chat Window with role as doctor */}
      <ChatWindow role="doctor" user={user.doctor} />
    </Box>
  );
}
