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
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { motion, AnimatePresence } from "framer-motion";
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
          padding: '10px 16px',
          borderBottom: "1px solid var(--border-light)",
          backgroundColor: "#f0f2f5",
          zIndex: 10,
        }}
      >
        <IconButton
          sx={{ display: { xs: "inline-flex", md: "none" }, mr: 1 }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flex: 1, cursor: 'pointer' }}
          onClick={() => {
            if (host?._id) navigate(`/profile/host/${host._id}`);
          }}
        >
          {host && <Avatar src={host.photoProfile} alt={host.userName} sx={{ width: 40, height: 40 }} />}
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {host ? host.userName : "Chat with Host"}
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
               Online
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton size="small"><SearchIcon fontSize="small" /></IconButton>
          <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
        </Stack>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
          backgroundColor: "#efeae2",
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundOpacity: 0.06,
          backgroundBlendMode: 'overlay',
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={0.5}>
            <AnimatePresence>
              {messages.map((msg, index) => {
                const mine = msg.senderId === senderId;
                const isAssistant = msg.role === 'assistant' || msg.isAI;

                return (
                  <Box
                    key={index}
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{
                      display: "flex",
                      justifyContent: !mine ? "flex-start" : "flex-end",
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: { xs: "85%", md: "70%" },
                        padding: "6px 12px",
                        backgroundColor: isAssistant ? "#e8f5e9" :
                          !mine ? "#ffffff" : "#d9fdd3",
                        backgroundImage: isAssistant
                          ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
                          : 'none',
                        color: "#111b21",
                        position: "relative",
                        borderRadius: '12px',
                        borderTopLeftRadius: !mine ? '0px' : '12px',
                        borderTopRightRadius: mine ? '0px' : '12px',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                        border: isAssistant ? '1px solid rgba(46, 125, 50, 0.1)' : 'none',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          width: 0,
                          height: 0,
                          border: '8px solid transparent',
                          ...(mine ? {
                            right: -8,
                            borderLeftColor: isAssistant ? '#c8e6c9' : '#d9fdd3',
                            borderTopColor: isAssistant ? '#c8e6c9' : '#d9fdd3',
                          } : {
                            left: -8,
                            borderRightColor: '#ffffff',
                            borderTopColor: '#ffffff',
                          })
                        }
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
                          borderRadius: '6px',
                        }}>
                          <AutoAwesomeIcon sx={{ fontSize: 10, mr: 0.5, color: '#2e7d32' }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#2e7d32', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Assistant
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                        {msg.message}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.2, gap: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            textAlign: "right",
                            opacity: 0.5,
                            fontSize: '0.65rem'
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                        {mine && <DoneAllIcon sx={{ fontSize: 14, color: '#53bdeb' }} />}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: '10px 16px',
          backgroundColor: "#f0f2f5",
          gap: 1,
        }}
      >
        <IconButton size="small"><EmojiEmotionsIcon sx={{ color: '#54656f' }} /></IconButton>
        <IconButton size="small"><AttachFileIcon sx={{ color: '#54656f', transform: 'rotate(45deg)' }} /></IconButton>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: '#ffffff',
              '& fieldset': { border: 'none' }
            }
          }}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={!newMessage}
          sx={{ 
            color: newMessage ? '#00a884' : '#54656f',
            transition: 'all 0.2s'
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default GuestMessages;
