const mongoose = require('mongoose'); 
const appointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    date: String,
    time: String,
    status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
