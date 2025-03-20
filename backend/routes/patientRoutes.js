const express = require('express');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register Patient
router.post('/register', async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.json({ message: 'Patient Registered Successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login Patient
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: patient._id, role: 'patient' }, 'secretkey', { expiresIn: '1d' });
    res.json({ token, patient });
});

// Get All Patients (Admin Purpose)
router.get('/', async (req, res) => {
    const patients = await Patient.find();
    res.json(patients);
});

module.exports = router;
