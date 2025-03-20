const express = require('express');
const Chat = require('../models/Chat');
const Appointment = require('../models/Appoinment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const router = express.Router();

// ✅ Send Chat Message - Only if Appointment Exists
router.post('/send', async (req, res) => {
    const { doctorName, patientName, message, senderRole, doctorId, patientId } = req.body;
    console.log('Received Chat Message:', req.body);

    const appointment = await Appointment.findOne({ doctorId, patientId, status: 'Booked' });
    if (!appointment) {
        console.log('Appointment not found or not booked');
        return res.status(403).json({ error: "No active appointment to chat" });
    }

    const chat = new Chat({
        doctorName,
        patientName,
        message,
        senderRole,
        appointmentId: appointment._id
    });
    await chat.save();
    res.json(chat);
});


router.get('/:doctorId/:patientId', async (req, res) => {
    const appointment = await Appointment.findOne({ doctorId: req.params.doctorId, patientId: req.params.patientId, status: 'Booked' });
    if (!appointment) return res.status(403).json({ error: "No active appointment found" });

    const chats = await Chat.find({ appointmentId: appointment._id });
    res.json(chats);
});


module.exports = router;
