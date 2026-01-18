import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import axios from "axios";
import {
  emitEvent,
  initializeSocket,
  subscribeToUpdates,
  unsubscribeFromUpdates,
} from "../../webSockets/webSockets";
import useDocumentTitle from "../../hooks/dynamicTitle/dynamicTitle";

initializeSocket();

const GuestAllMessages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const receiverId = user._id;
  const messagesEndRef = useRef(null);

  useDocumentTitle(selectedSenderId ? `${senders.find((s) => s.id === selectedSenderId)?.name} - Airbnb` : "Messages - Airbnb");

  // Fetch the list of senders
  useEffect(() => {
    const fetchSenders = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await axios.get(
          `http://192.168.18.45:5000/list-users-for-messages`,
          config
        );
        setSenders(response.data.users);
      } catch (error) {
        console.error("Error fetching senders:", error);
      }
    };
    fetchSenders();
  }, [token]);

  // Fetch chat messages when a sender is selected
  useEffect(() => {
    if (!selectedSenderId || !receiverId) return;

    const fetchChat = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      try {
        const response = await axios.get(
          `http://192.168.18.45:5000/get-chat/${selectedSenderId}`,
          config
        );
        setMessages(response.data.messages);

        // Join chat room
        emitEvent("join_room", `${receiverId}_${selectedSenderId}`);
        emitEvent("join_room", `${selectedSenderId}_${receiverId}`);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };
    fetchChat();
  }, [selectedSenderId, receiverId, token]);

  // Listen for new messages
  useEffect(() => {
    const handleMessage = (payload) => {
      setMessages((prevMessages) => [...prevMessages, payload]);
    };

    subscribeToUpdates("receive_message", handleMessage);

    return () => {
      unsubscribeFromUpdates("receive_message");
    };
  }, []);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage) return;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    try {
      await axios.post(
        `http://192.168.18.45:5000/send-message`,
        { guestId: selectedSenderId, message: newMessage },
        config
      );
      emitEvent("send_message", {
        senderId: receiverId,
        receiverId: selectedSenderId,
        message: newMessage,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "87vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: showChat ? "0" : "100%", md: "30%" },
          display: showChat && { xs: "none", md: "block" },
          overflowY: "auto",
          borderRight: { md: "1px solid #ccc" },
          transition: "all 0.3s ease",
        }}
      >
        <Typography
          variant="h6"
          sx={{ padding: 2, textAlign: "left", fontWeight: "bold" }}
        >
          Conversations
        </Typography>
        <List>
          {senders.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#757575",
              }}
            >
              <InboxOutlinedIcon
                sx={{
                  fontSize: 50,
                  marginBottom: "16px",
                  opacity: 0.7,
                  color: "#bdbdbd",
                }}
              />
              <Typography
                variant="h6"
                sx={{ textAlign: "center", fontWeight: 500 }}
              >
                You don’t have any messages
              </Typography>
              <Typography
                variant="body2"
                sx={{ textAlign: "center", marginTop: 1 }}
              >
                Start a conversation to see messages here.
              </Typography>
            </Box>
          ) : (
            senders.map((sender, index) => (
              <ListItem
                button
                key={index}
                onClick={() => {
                  setSelectedSenderId(sender.id);
                  setShowChat(true);
                }}
                sx={{
                  backgroundColor:
                    selectedSenderId === sender.id ? "#e0f7fa" : "#ffffff",
                  "&:hover": {
                    backgroundColor:
                      selectedSenderId === sender.id ? "#b2ebf2" : "#f0f0f0",
                      cursor: "pointer"
                  },
                  transition: "background-color 0.3s ease",
                }}
              >
                {sender.photoProfile ? (
                  <img
                    src={sender.photoProfile}
                    alt={sender.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      marginRight: "8px",
                    }}
                  />
                ) : (
                  <Avatar sx={{ marginRight: 2 }}>{sender.name[0]}</Avatar>
                )}
                <ListItemText primary={sender.name} />
              </ListItem>
            ))
          )}
        </List>
      </Box>

      {/* Chat Window */}
      <Box
        sx={{
          flex: 1,
          display: showChat || { xs: "none", md: "block" },
          flexDirection: "column",
          height: "100%",
        }}
      >
        {selectedSenderId ? (
          <>
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
                onClick={() => {
                  setSelectedSenderId(null);
                  setShowChat(false);
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ marginLeft: 2 }}>
                Chat with{" "}
                {senders.find((s) => s.id === selectedSenderId)?.name ||
                  "Unknown"}
              </Typography>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                height: { xs: "400px", md: "calc(100vh - 250px)" }, // Fixed height on mobile, full height minus header/input on desktop
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
                      msg.senderId !== receiverId ? "flex-start" : "flex-end",
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
                        msg.senderId !== receiverId ? "0px" : "16px",
                      borderBottomRightRadius:
                        msg.senderId !== receiverId ? "16px" : "0px",
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
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#757575",
            }}
          >
            <ChatBubbleOutlineIcon
              sx={{
                fontSize: 80,
                marginBottom: "16px",
                opacity: 0.7,
                color: "#bdbdbd", // Subtle icon color
              }}
            />
            <Typography
              variant="h6"
              sx={{ textAlign: "center", fontWeight: 500 }}
            >
              Select a conversation to start chatting
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: "center", marginTop: 1 }}
            >
              Choose a sender from the list to begin chatting with them.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GuestAllMessages;
