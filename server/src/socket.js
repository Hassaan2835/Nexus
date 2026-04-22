const socketio = require('socket.io');

const socketHandler = (server) => {
  const io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  console.log('Socket.IO initialized');

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
      socket.to(roomId).emit('user-connected', userId);

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        socket.to(roomId).emit('user-disconnected', userId);
      });
    });

    // WebRTC Signaling
    socket.on('sending-signal', (payload) => {
      io.to(payload.userToSignal).emit('user-joined', {
        signal: payload.signal,
        callerID: payload.callerID
      });
    });

    socket.on('returning-signal', (payload) => {
      io.to(payload.callerID).emit('receiving-returned-signal', {
        signal: payload.signal,
        id: socket.id
      });
    });

    // Chat messaging
    socket.on('send-message', (message) => {
      const { receiverId } = message;
      socket.to(receiverId).emit('receive-message', message);
    });
  });

  return io;
};

module.exports = socketHandler;
