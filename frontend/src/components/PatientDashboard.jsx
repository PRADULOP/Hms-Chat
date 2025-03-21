import {
  Box, Typography, TextField, Button, Grid, Paper, Select, MenuItem, CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import axios from 'axios';

export default function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '', time: '' });

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchDoctors(), fetchAppointments(), fetchPrescriptions(), fetchReports()]);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    const res = await axios.get('http://localhost:3000/api/doctors/all');
    setDoctors(res.data);
  };

  // Fetch patient appointments
  const fetchAppointments = async () => {
    const res = await axios.get(`http://localhost:3000/api/appointments/get/${user?.patient?._id}`);
    setAppointments(res.data);
    
  };

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    const res = await axios.get(`http://localhost:3000/api/prescription/get/${user?.patient?._id}`);
    setPrescriptions(res.data);
  };

  // Fetch reports
  const fetchReports = async () => {
    const res = await axios.get(`http://localhost:3000/api/report/${user?.patient?._id}`);
    setReports(res.data);
  };

  // Book appointment handler
  const handleBookAppointment = async () => {
    const { doctorId, date, time } = bookingData;
    if (!doctorId || !date || !time) return alert('⚠️ Please fill all fields.');

    try {
      await axios.post('http://localhost:3000/api/appointments/book', {
        ...bookingData,
        patientId: user.patient._id
      });
      alert('✅ Appointment booked successfully!');
      setBookingData({ doctorId: '', date: '', time: '' });
      fetchAppointments();
    } catch (error) {
      console.error('❌ Failed to book appointment:', error);
      alert('❌ Error booking appointment.');
    }
  };

  // File download handler (supports both absolute and relative paths)
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const downloadUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:3000${fileUrl}`;
      const response = await axios.get(downloadUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('❌ Failed to download:', error);
    }
  };

  // Download prescription text as .txt file
  const downloadTextPrescription = (text, index) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `prescription-${index + 1}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  // Helper: Get doctor name by ID
  const getDoctorName = (doctorId) => {
    const doc = doctors.find(d => d._id === (typeof doctorId === 'object' ? doctorId?._id : doctorId));
    return doc?.name || 'N/A';
  };

  // Loading screen
  if (loading) return (
    <Box p={4} textAlign="center">
      <CircularProgress />
      <Typography mt={2}>Loading your dashboard...</Typography>
    </Box>
  );

  return (
    <Box p={4} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
        Patient Dashboard
      </Typography>
      <Typography variant="h6">Welcome, {user?.patient?.name || 'Patient'}</Typography>

      {/* Appointment Booking */}
      <Paper elevation={4} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>📅 Book Appointment</Typography>
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
            <Button variant="contained" fullWidth color="primary" onClick={handleBookAppointment}>
              Book
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Appointments */}
      <Paper elevation={4} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>📋 My Appointments</Typography>
        {appointments.length === 0 ? (
          <Typography>No appointments booked yet.</Typography>
        ) : (
          appointments.map((apt) => (
            <Box key={apt._id} sx={{ my: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
              <Typography><strong>Doctor:</strong> {getDoctorName(apt.doctorId)}</Typography>
              <Typography><strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}</Typography>
              <Typography><strong>Time:</strong> {apt.time}</Typography>
              <Typography><strong>Status:</strong> {apt.status}</Typography>
            </Box>
          ))
        )}
      </Paper>

      {/* Prescriptions */}
      <Paper elevation={4} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>💊 My Prescriptions</Typography>
        {prescriptions.length === 0 ? (
          <Typography>No prescriptions available.</Typography>
        ) : (
          prescriptions.map((pres, idx) => (
            <Box key={idx} sx={{ my: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
              <Typography><strong>Doctor:</strong> {getDoctorName(pres.doctorId)}</Typography>
              <Typography><strong>Notes:</strong></Typography>
              <Box sx={{ backgroundColor: '#eee', p: 1, borderRadius: '4px' }}>
                <pre>{pres.prescriptionText || 'No prescription text available'}</pre>
              </Box>
              {pres.pdfUrl ? (
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => handleDownload(pres.pdfUrl, `prescription-${idx + 1}.pdf`)}
                  sx={{ mt: 1 }}
                >
                  📥 Download PDF
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => downloadTextPrescription(pres.prescriptionText || '', idx)}
                  sx={{ mt: 1 }}
                >
                  📥 Download as TXT
                </Button>
              )}
            </Box>
          ))
        )}
      </Paper>

      {/* Reports */}
      <Paper elevation={4} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>📑 My Reports</Typography>
        {reports.length === 0 ? (
          <Typography>No reports uploaded yet.</Typography>
        ) : (
          reports.map((rep, idx) => (
            <Box key={idx} sx={{ my: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
              <Typography><strong>File:</strong> {rep.fileName || `Report ${idx + 1}`}</Typography>
              <Typography><strong>Uploaded:</strong> {new Date(rep.createdAt).toLocaleDateString()}</Typography>
              <Typography><strong>Doctor:</strong> {getDoctorName(rep.doctorId)}</Typography>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleDownload(rep.filePath, rep.fileName || `report-${idx + 1}.pdf`)}
                sx={{ mt: 1 }}
              >
                📥 Download Report
              </Button>
            </Box>
          ))
        )}
      </Paper>

      {/* Chat Section */}
      <Box mt={4}>
        <ChatWindow
          role="patient"
          user={user?.patient}
          patientId={user?.patient?._id}
          patientName={user?.patient?.name}
        />
      </Box>
    </Box>
  );
}
