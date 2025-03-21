const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appoinment'); // Ensure model has prescription & report fields
const mongoose = require('mongoose');
const multer = require('multer');

// ⚙️ Multer Storage Config for Prescription/Report Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // ✅ Ensure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ✅ Book an Appointment
router.post('/book', async (req, res) => {
  const { doctorId, patientId, date, time } = req.body;
  try {
    const appointment = new Appointment({
      doctorId,
      patientId,
      date,
      time,
      status: 'Booked'
    });
    await appointment.save();
    res.json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('Booking Error:', err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// ✅ Get Appointments of a Patient (with doctor details)
router.get('/get/:patientId', async (req, res) => {
  const { patientId } = req.params;
  if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ error: 'Invalid or missing patientId' });
  }
  try {
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialty');
    res.json(appointments);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get Appointments of a Doctor (with patient details)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name email');
    res.json(appointments);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Upload Prescription & Report
router.post('/upload/:appointmentId', upload.fields([
  { name: 'prescription' },
  { name: 'report' }
]), async (req, res) => {
  try {
    const updateData = {};
    if (req.files['prescription']) {
      updateData.prescription = `/uploads/${req.files['prescription'][0].filename}`;
    }
    if (req.files['report']) {
      updateData.report = `/uploads/${req.files['report'][0].filename}`;
    }
    await Appointment.findByIdAndUpdate(req.params.appointmentId, updateData);
    res.json({ message: 'Files uploaded successfully' });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// ✅ Update Appointment Status (Optional - For Doctors/Admin)
router.post('/status/:appointmentId', async (req, res) => {
  try {
    const { status } = req.body;
    await Appointment.findByIdAndUpdate(req.params.appointmentId, { status });
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Status Update Error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
