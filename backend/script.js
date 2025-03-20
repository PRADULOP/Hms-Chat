const mongoose = require('mongoose');
const Doctor = require('../backend/models/Doctor');
const Patient = require('../backend/models/Patient');
const Appointment = require('../backend/models/Appoinment');
const Chat = require('../backend/models/Chat');

const MONGO_URI = 'mongodb+srv://pradul:Brook123@cluster0.mqqtj.mongodb.net/hmsDb?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

async function insertData() {
  try {
    // Sample Doctor Data
    const doctorsData = [
      new Doctor({ name: "Dr. John Doe", email: "johndoe@hospital.com", password: "pass123", specialty: "Cardiology", availability: "9AM - 1PM", contactInfo: "9876543210" }),
      new Doctor({ name: "Dr. Alice Smith", email: "alice@hospital.com", password: "pass123", specialty: "Neurology", availability: "2PM - 6PM", contactInfo: "9876543211" }),
      new Doctor({ name: "Dr. Robert Brown", email: "robert@hospital.com", password: "pass123", specialty: "Orthopedics", availability: "10AM - 4PM", contactInfo: "9876543212" }),
      new Doctor({ name: "Dr. Emily Davis", email: "emily@hospital.com", password: "pass123", specialty: "Pediatrics", availability: "11AM - 3PM", contactInfo: "9876543213" }),
      new Doctor({ name: "Dr. Michael Wilson", email: "michael@hospital.com", password: "pass123", specialty: "Dermatology", availability: "12PM - 5PM", contactInfo: "9876543214" }),
    ];

    // Save doctors (auto hashes password)
    const savedDoctors = [];
    for (let doc of doctorsData) {
      savedDoctors.push(await doc.save());
    }

    // Sample Patient Data
    const patientsData = [
      new Patient({ name: "Anna Johnson", email: "anna@hospital.com", password: "patient123", age: 25, gender: "Female", contactInfo: "9123456780" }),
      new Patient({ name: "Mark Lee", email: "mark@hospital.com", password: "patient123", age: 30, gender: "Male", contactInfo: "9123456781" }),
      new Patient({ name: "Sophia Turner", email: "p", password: "patient123", age: 28, gender: "Female", contactInfo: "9123456782" }),
      new Patient({ name: "David Miller", email: "david@hospital.com", password: "patient123", age: 35, gender: "Male", contactInfo: "9123456783" }),
      new Patient({ name: "Olivia White", email: "olivia@hospital.com", password: "patient123", age: 22, gender: "Female", contactInfo: "9123456784" }),
    ];

    const savedPatients = [];
    for (let pat of patientsData) {
      savedPatients.push(await pat.save());
    }

    // Sample Appointments
    const appointmentsData = [
      new Appointment({ doctorId: savedDoctors[0]._id, patientId: savedPatients[0]._id, date: "2025-03-20", time: "10:00 AM", status: "Confirmed" }),
      new Appointment({ doctorId: savedDoctors[1]._id, patientId: savedPatients[1]._id, date: "2025-03-21", time: "11:00 AM", status: "Pending" }),
      new Appointment({ doctorId: savedDoctors[2]._id, patientId: savedPatients[2]._id, date: "2025-03-22", time: "12:00 PM", status: "Pending" }),
      new Appointment({ doctorId: savedDoctors[3]._id, patientId: savedPatients[3]._id, date: "2025-03-23", time: "1:00 PM", status: "Pending" }),
      new Appointment({ doctorId: savedDoctors[4]._id, patientId: savedPatients[4]._id, date: "2025-03-24", time: "2:00 PM", status: "Confirmed" }),
    ];

    await Appointment.insertMany(appointmentsData);

    // Sample Chat Messages
    const chatsData = [
      new Chat({ senderId: savedPatients[0]._id, receiverId: savedDoctors[0]._id, message: "Hello Doctor, I have chest pain." }),
      new Chat({ senderId: savedPatients[1]._id, receiverId: savedDoctors[1]._id, message: "Doctor, I have a headache problem." }),
      new Chat({ senderId: savedPatients[2]._id, receiverId: savedDoctors[2]._id, message: "Doctor, I need help with my knee pain." }),
      new Chat({ senderId: savedPatients[3]._id, receiverId: savedDoctors[3]._id, message: "Doctor, my child has a fever." }),
      new Chat({ senderId: savedPatients[4]._id, receiverId: savedDoctors[4]._id, message: "Doctor, I have skin irritation issues." }),
    ];

    await Chat.insertMany(chatsData);

    console.log('✅ Sample Data Inserted Successfully ✅');
  } catch (error) {
    console.error('❌ Error inserting data:', error);
  } finally {
    mongoose.connection.close();
  }
}

insertData();
