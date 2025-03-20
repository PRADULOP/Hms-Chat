const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appoinment');
const mongoose = require('mongoose');

// Book an Appointment
router.post('/book', async (req, res) => {
    const { doctorId, patientId, date, time } = req.body;
    const appointment = new Appointment({ doctorId, patientId, date, time, status: 'Booked' });
    await appointment.save();
    res.json({ message: 'Appointment booked successfully' });
});

// Get Appointments of a Patient
router.get('/get/:patientId', async (req, res) => {
    const { patientId } = req.params;

    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ error: 'Invalid or missing patientId' });
    }

    try {
        const appointments = await Appointment.find({ patientId }).populate('doctorId');
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/doctor/:doctorId', async (req, res) => {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId }).populate('patientId');
    res.json(appointments);
  });

module.exports = router;
