import { Box, Button, TextField, Typography, MenuItem, Select, Paper } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { getMessages } from '../api';

const socket = io('http://localhost:3000');

export default function ChatWindow({ role, patientId, patientName, user, appointmentUpdated }) {
  const [chat, setChat] = useState([]);
  const [text, setText] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  useEffect(() => {
    fetchAppointments();
  }, [appointmentUpdated]); // Refetch when appointment is updated dynamically

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      if (
        selectedChatUser &&
        ((newMessage.doctorId === user._id && newMessage.patientId === selectedChatUser._id) ||
          (newMessage.patientId === user._id && newMessage.doctorId === selectedChatUser._id))
      ) {
        setChat((prevChat) => [...prevChat, newMessage]);
      }
    };
    socket.on('receiveMessage', handleReceiveMessage);
    return () => socket.off('receiveMessage', handleReceiveMessage);
  }, [selectedChatUser, user]);

  useEffect(() => {
    if (selectedChatUser) fetchChat();
  }, [selectedChatUser]);

  const fetchAppointments = async () => {
    try {
      const endpoint = role === 'doctor'
        ? `http://localhost:3000/api/appointments/doctor/${user._id}`
        : `http://localhost:3000/api/appointments/get/${patientId}`;
      const res = await axios.get(endpoint);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const fetchChat = async () => {
    try {
      const { data } = await getMessages(
        role === 'doctor' ? user._id : selectedChatUser._id,
        role === 'doctor' ? selectedChatUser._id : user._id
      );
      setChat(data);
    } catch (err) {
      console.error('Error fetching chat:', err);
    }
  };

  const handleSend = async () => {
    if (!selectedChatUser || !text.trim()) return;
    const doctorId = role === 'doctor' ? user._id : selectedChatUser._id;
    const patientIdToSend = role === 'doctor' ? selectedChatUser._id : user._id;
    const doctorName = role === 'doctor' ? user.name : selectedChatUser.name;
    const patientNameToSend = role === 'doctor' ? selectedChatUser.name : user.name;

    const messageData = {
      doctorName,
      patientName: patientNameToSend,
      message: text,
      senderRole: role,
      doctorId,
      patientId: patientIdToSend,
    };

    try {
      const response = await axios.post('http://localhost:3000/api/chat/send', messageData);
      setText('');
      setChat((prevChat) => [...prevChat, response.data]);
      socket.emit('sendMessage', response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" mb={2}>Chat Section</Typography>

      <Select
        fullWidth
        displayEmpty
        value={selectedChatUser?._id || ''}
        onChange={(e) => {
          const selectedUserId = e.target.value;
          const selectedAppointment = appointments.find((apt) =>
            role === 'doctor'
              ? apt.patientId?._id === selectedUserId
              : apt.doctorId?._id === selectedUserId
          );
          const userObj = role === 'doctor' ? selectedAppointment?.patientId : selectedAppointment?.doctorId;
          setSelectedChatUser(userObj);
          setChat([]); // Clear chat when selecting new user
        }}
      >
        <MenuItem value="" disabled>Select {role === 'doctor' ? 'Patient' : 'Doctor'} to Chat</MenuItem>
        {appointments.map((apt) => {
          const userObj = role === 'doctor' ? apt.patientId : apt.doctorId;
          return (
            <MenuItem key={apt._id} value={userObj?._id}>{userObj?.name}</MenuItem>
          );
        })}
      </Select>

      <Paper elevation={3} sx={{ my: 2, p: 2, height: '300px', overflowY: 'auto' }} ref={chatBoxRef}>
        {selectedChatUser ? (
          chat.length === 0 ? (
            <Typography>No messages yet.</Typography>
          ) : (
            chat.map((msg, index) => (
              <Box key={index} display="flex" justifyContent={msg.senderRole === role ? 'flex-end' : 'flex-start'}>
                <Typography sx={{
                  backgroundColor: msg.senderRole === role ? '#1976d2' : '#e0e0e0',
                  color: msg.senderRole === role ? '#fff' : '#000',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  marginY: '4px',
                  maxWidth: '60%',
                  wordBreak: 'break-word',
                }}>
                  {msg.message}
                </Typography>
              </Box>
            ))
          )
        ) : (
          <Typography>Select a user to view chat</Typography>
        )}
      </Paper>

      <TextField
        fullWidth
        label="Type your message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        disabled={!selectedChatUser}
      />
      <Button variant="contained" onClick={handleSend} sx={{ mt: 2 }} disabled={!selectedChatUser}>Send</Button>
    </Box>
  );
}
