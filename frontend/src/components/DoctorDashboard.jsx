import { Box, Typography, TextField, Button, Select, MenuItem, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import ChatWindow from './ChatWindow';
import axios from 'axios';

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // Disable button when uploading

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/appointments/doctor/${user?.doctor?._id}`);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const handlePrescriptionSubmit = async () => {
    if (!selectedPatient || !prescriptionText.trim()) {
      return alert('Please select a patient and write the prescription.');
    }

    const patient = appointments.find((apt) => apt.patientId?._id === selectedPatient);
    const doctorName = user.doctor.name;
    const patientName = patient?.patientId?.name || 'Unknown Patient';

    const formattedPrescription = `
Prescription
------------
Doctor: ${doctorName}
Patient: ${patientName}
Date: ${new Date().toLocaleDateString()}
----------------------------------------
${prescriptionText}
    `;

    try {
      await axios.post('http://localhost:3000/api/prescription/create', {
        doctorId: user.doctor._id,
        patientId: selectedPatient,
        prescriptionText: formattedPrescription,
        doctorName,
        patientName,
      });

      alert('✅ Prescription saved and sent successfully.');
      setPrescriptionText('');
    } catch (error) {
      console.error('Error sending prescription:', error);
      alert('Failed to send prescription.');
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'doc_reports'); // Make sure this preset exists in Cloudinary
  
    const res = await axios.post('https://api.cloudinary.com/v1_1/dysvzaqcs/auto/upload', formData);
    return res.data.secure_url;
  };

  const handleReportSubmit = async () => {
    if (!selectedPatient || !reportFile) {
      alert('Please select a patient and choose a report file.');
      return;
    }
  
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('reportFile', reportFile);
      formData.append('doctorId', user.doctor._id);
      formData.append('patientId', selectedPatient);
  
      const res = await axios.post('http://localhost:3000/api/report/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      console.log(res.data);
      alert('✅ Report uploaded successfully!');
      setReportFile(null);
      document.getElementById('reportFileInput').value = '';
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('❌ Failed to upload report. Try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  
  
  

  return (
    <Box p={4} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>Doctor Dashboard</Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>Welcome Dr. {user?.doctor?.name}</Typography>

      <ChatWindow role="doctor" user={user.doctor} />

      <Paper elevation={3} sx={{ p: 3, mt: 5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Send Prescription / Upload Report</Typography>

        <Select
          fullWidth
          displayEmpty
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          sx={{ mb: 3 }}
        >
          <MenuItem value="" disabled>Select Patient</MenuItem>
          {appointments.map((apt) => (
            <MenuItem key={apt._id} value={apt.patientId?._id}>
              {apt.patientId?.name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Write Prescription"
          value={prescriptionText}
          onChange={(e) => setPrescriptionText(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handlePrescriptionSubmit}
          disabled={!selectedPatient}
        >
          Send Prescription
        </Button>

        <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>Upload Report (PDF/Image)</Typography>
        <input
          id="reportFileInput"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setReportFile(e.target.files[0])}
        />

        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={handleReportSubmit}
          disabled={!selectedPatient || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Report'}
        </Button>
      </Paper>
    </Box>
  );
}
