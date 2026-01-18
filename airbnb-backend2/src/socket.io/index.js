export default function initializeSocket(io) {
  io.on("connection", (socket) => {
    if (!socket.id) {
      console.error("Socket ID is undefined! Connection failed.");
      return;
    }

    console.log(`User connected: ${socket.id}`); 

    socket.on("join_room", (chatRoomId) => {
      if (!chatRoomId) {
        console.error("No chatRoomId provided for join_room.");
        return;
      }
      

      socket.join(chatRoomId);
      console.log(`Socket ID ${socket.id} joined room: ${chatRoomId}`);
    });

    socket.on("send_message", ({ senderId, receiverId, message }) => {
      if (!senderId || !receiverId || !message) {
        console.error("send_message received with missing fields.");
        return;
      }

      const chatRoomId = `${senderId}_${receiverId}`;
      console.log(`Message received for room: ${chatRoomId}`);

      io.to(chatRoomId).emit("receive_message", {
        senderId,
        message,
        timestamp: new Date(),
      });

      console.log(`Message emitted to room ${chatRoomId}:`, {
        senderId,
        message,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}