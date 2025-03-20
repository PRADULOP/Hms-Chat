import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000/api' });

export const loginPatient = (data) => API.post('/patients/login', data);
export const loginDoctor = (data) => API.post('/doctors/login', data);
export const sendMessage = (data) => API.post('/chat/send', data);
export const getMessages = (doctorId, patientId) => API.get(`/chat/${doctorId}/${patientId}`);

export default API;
