import { Box, Typography, TextField, Button, Grid, Paper, Select, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import axios from 'axios';

export default function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/doctors/all');
      setDoctors(res.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/appointments/get/${user?.patient?._id}`);
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!bookingData.doctorId || !bookingData.date || !bookingData.time) {
      return alert('Please fill all fields');
    }
    try {
      await axios.post('http://localhost:3000/api/appointments/book', {
        ...bookingData,
        patientId: user.patient._id
      });
      alert('Appointment Booked!');
      setBookingData({ doctorId: '', date: '', time: '' });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Failed to book appointment.');
    }
  };

  if (!user?.patient) {
    return <Typography>Loading dashboard...</Typography>;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }} gutterBottom>Patient Dashboard</Typography>
      <Typography variant="h6">Welcome, {user.patient.name}</Typography>

      {/* Appointment Booking */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Book Appointment</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Select
              fullWidth
              value={bookingData.doctorId}
              onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Doctor</MenuItem>
              {doctors.map((doc) => (
                <MenuItem key={doc._id} value={doc._id}>
                  {doc.name} - {doc.specialty}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={bookingData.date}
              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={bookingData.time}
              onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" fullWidth onClick={handleBookAppointment}>Book</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Appointment List */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>My Appointments</Typography>
        {appointments.length === 0 ? (
          <Typography>No appointments booked yet.</Typography>
        ) : (
          appointments.map((apt) => (
            <Box key={apt._id} sx={{ my: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
              <Typography><strong>Doctor:</strong> {apt.doctorId?.name || 'Doctor Info Missing'}</Typography>
              <Typography><strong>Date:</strong> {apt.date}</Typography>
              <Typography><strong>Time:</strong> {apt.time}</Typography>
              <Typography><strong>Status:</strong> {apt.status}</Typography>
            </Box>
          ))
        )}
      </Paper>

      {/* Chat Section */}
      <Box mt={4}>
        <ChatWindow role="patient" user={user.patient} patientId={user.patient._id} patientName={user.patient.name} />
      </Box>
    </Box>
  );
}
