import React, { useEffect, useState, useRef } from "react";
import { getAuthToken, getAuthUser } from "../../utils/cookieUtils";
import { Box, TextField, Button, Typography, IconButton, CircularProgress } from "@mui/material";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  initializeSocket,
  subscribeToUpdates,
  unsubscribeFromUpdates,
  emitEvent,
} from "../../webSockets/webSockets";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import usePageTitle from "../../hooks/usePageTitle";
import { API_BASE_URL } from "../../config/env";

initializeSocket();

import { getHostProfile } from "../../services/profileService";
import { Avatar, Stack } from "@mui/material";

const GuestMessages = () => {
  usePageTitle("Chat");
  const { hostId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const listingId = queryParams.get("listingId");
  const receiverId = hostId;
  const [messages, setMessages] = useState([]);
  const [host, setHost] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const token = getAuthToken();
  const user = getAuthUser();
  const senderId = user?._id;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (hostId) {
      getHostProfile(hostId).then(data => setHost(data)).catch(err => console.error(err));
    }
  }, [hostId]);

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
          `${API_BASE_URL}/get-chat/${receiverId}`,
          config
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        // Join the chat room
        emitEvent("join_room", `${receiverId}_${senderId}`);
        emitEvent("join_room", `${senderId}_${receiverId}`);
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
        `${API_BASE_URL}/send-message`,
        { guestId: receiverId, message: newMessage, listingId, role: 'guest' },
        config
      );

      // Emit the message to the server
      // Removed redundant emitEvent("send_message") because backend emits "receive_message" upon save.
      /* 
      emitEvent("send_message", {
        senderId: senderId,
        receiverId: receiverId,
        message: newMessage,
      });
      */

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
        height: { xs: "calc(100vh - 65px)", md: "calc(100vh - 85px)" },
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2,
          borderBottom: "1px solid #ccc",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <IconButton
          sx={{ display: { xs: "inline-flex", md: "none" } }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ ml: 2, cursor: 'pointer' }}
          onClick={() => {
            if (host?._id) navigate(`/profile/host/${host._id}`);
          }}
        >
          {host && <Avatar src={host.photoProfile} alt={host.userName} />}
          <Box>
            <Typography variant="h6">
              {host ? host.userName : "Chat with Host"}
            </Typography>
            {host && <Typography variant="caption" color="text.secondary">View Profile</Typography>}
          </Box>
        </Stack>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
          backgroundColor: "var(--bg-secondary)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {messages.map((msg, index) => {
              const mine = msg.senderId === senderId;
              const isAssistant = msg.role === 'assistant' || msg.isAI;

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent:
                      !mine ? "flex-start" : "flex-end",
                    marginBottom: 1,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: { xs: "85%", md: "70%" },
                      padding: "10px 16px",
                      backgroundColor: isAssistant ? "#e8f5e9" :
                        !mine ? "#ffffff" : "primary.main",
                      backgroundImage: isAssistant
                        ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
                        : 'none',
                      color: isAssistant ? "#1b5e20" :
                        !mine ? "#000" : "primary.contrastText",
                      position: "relative",
                      borderRadius: '20px',
                      borderBottomLeftRadius: !mine ? (isAssistant ? '4px' : '20px') : "20px",
                      borderBottomRightRadius: !mine ? "20px" : "4px",
                      boxShadow: isAssistant ? '0 4px 15px rgba(46, 125, 50, 0.1)' : '0 2px 5px rgba(0,0,0,0.05)',
                      border: isAssistant ? '1px solid rgba(46, 125, 50, 0.1)' : 'none',
                    }}
                  >
                    {isAssistant && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 0.5,
                        bgcolor: 'rgba(46, 125, 50, 0.1)',
                        width: 'fit-content',
                        px: 1,
                        py: 0.2,
                        borderRadius: '10px',
                      }}>
                        <AutoAwesomeIcon sx={{ fontSize: 12, mr: 0.5, color: '#2e7d32' }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#2e7d32', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Host Assistant
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: "right",
                        marginTop: 0.5,
                        opacity: 0.6,
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2,
          borderTop: "1px solid #ccc",
          backgroundColor: "var(--bg-primary)",
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
