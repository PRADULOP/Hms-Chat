const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    doctorName: String,
    patientName: String,
    senderRole: String,  // 'doctor' or 'patient'
    message: String,
    timestamp: { type: Date, default: Date.now },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
});

module.exports = mongoose.model('Chat', chatSchema);
