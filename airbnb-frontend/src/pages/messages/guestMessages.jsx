import React, { useEffect, useState, useRef } from "react";
import { Box, TextField, Button, Typography, IconButton } from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  initializeSocket,
  subscribeToUpdates,
  unsubscribeFromUpdates,
  emitEvent,
} from "../../webSockets/webSockets";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

initializeSocket(); 

const GuestMessages = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const receiverId = hostId;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const senderId = user?._id;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!receiverId || !senderId) return;

    const fetchChat = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      try {
        const response = await axios.get(
          `http://192.168.18.45:5000/get-chat/${receiverId}`,
          config
        );
        setMessages(response.data.messages);

        // Join the chat room
        emitEvent("join_room", `${receiverId}_${senderId}`);
        emitEvent("join_room", `${senderId}_${receiverId}`);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chat:", error);
        setLoading(false);
      }
    };

    fetchChat();
  }, [receiverId, senderId, token]);

  useEffect(() => {
    const handleMessage = (payload) => {
      console.log("Message received:", payload);
      setMessages((prevMessages) => [...prevMessages, payload]);
    };

    subscribeToUpdates("receive_message", handleMessage);

    return () => {
      unsubscribeFromUpdates("receive_message");
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage) return;

    setSending(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const res = await axios.post(
        `http://192.168.18.45:5000/send-message`,
        { guestId: receiverId, message: newMessage },
        config
      );

      // Emit the message to the server
      emitEvent("send_message", {
        senderId: senderId,
        receiverId: receiverId,
        message: newMessage,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // Scroll to the bottom when a new message is added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2,
          borderBottom: "1px solid #ccc",
          backgroundColor: "#f8f8f8",
        }}
      >
        <IconButton
          sx={{ display: { xs: "inline-flex", md: "none" } }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ marginLeft: 2 }}>
          Chat with Host
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          height: "calc(100vh - 220px)", // Fixed height minus input area
          overflowY: "auto",
          padding: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                msg.senderId !== receiverId ? "flex-end" : "flex-start",
              marginBottom: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: "75%",
                padding: "10px 16px",
                backgroundColor:
                  msg.senderId !== receiverId ? "#e0e0e0" : "#1976d2",
                color: msg.senderId !== receiverId ? "#000" : "#fff",
                position: "relative",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                borderBottomLeftRadius:
                  msg.senderId !== receiverId ? "16px" : "0px",
                borderBottomRightRadius:
                  msg.senderId !== receiverId ? "0px" : "16px",
              }}
            >
              {msg.message}
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "right",
                  marginTop: 0.5,
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2,
          borderTop: "1px solid #ccc",
          backgroundColor: "#fff",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!newMessage}
          sx={{ marginLeft: 2 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default GuestMessages;
