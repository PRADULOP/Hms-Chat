const express = require('express');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Doctor Register
router.post('/register', async (req, res) => {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.json({ message: 'Doctor registered successfully' });
});

// Doctor Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: doctor._id, role: 'doctor' }, 'secretkey', { expiresIn: '1d' });
    res.json({ token, doctor });
});

// Get all doctors - needed for appointment booking dropdown
router.get('/all', async (req, res) => {
    try {
        const doctors = await Doctor.find({}, '_id name email');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctors' });
    }
});


module.exports = router;
