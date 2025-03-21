require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Models
const Doctor = require('../backend/models/Doctor');
const Patient = require('../backend/models/Patient');
const Chat = require('../backend/models/Chat');
const Appointment = require('../backend/models/Appoinment');

// API Routes
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/appointments', require('./routes/appointment'));
const prescriptionRoutes = require('./routes/prescription');
app.use('/api/prescription', prescriptionRoutes);
const reportRoutes = require('./routes/report.js');
app.use('/api/report', reportRoutes);

app.use('/uploads', express.static('uploads'));

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST']
  }
});

// 🔥 Real-time socket connection
io.on('connection', (socket) => {
  console.log(`✅ Socket Connected: ${socket.id}`);

  // Listen for chat message
  socket.on('sendMessage', async (data) => {
    try {
      // Save the chat to the database
      const chat = new Chat({
        doctorName: data.doctorName,
        patientName: data.patientName,
        message: data.message,
        senderRole: data.senderRole,
        doctorId: data.doctorId,
        patientId: data.patientId,
        createdAt: new Date()
      });

      const savedChat = await chat.save();

      // Emit the saved message to all connected clients
      io.emit('receiveMessage', savedChat);

      console.log('✅ Message saved and broadcasted');
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
