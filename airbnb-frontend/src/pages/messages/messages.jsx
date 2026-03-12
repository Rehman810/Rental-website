import React, { useEffect, useState, useRef } from "react";
import { getAuthToken, getAuthUser } from "../../utils/cookieUtils";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import axios from "axios";
import {
  emitEvent,
  initializeSocket,
  subscribeToUpdates,
  unsubscribeFromUpdates,
} from "../../webSockets/webSockets";
import usePageTitle from "../../hooks/usePageTitle";
import { API_BASE_URL } from "../../config/env";

initializeSocket();

import { useNavigate } from "react-router-dom";
import { Stack } from "@mui/material";

const GuestAllMessages = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [senders, setSenders] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const token = getAuthToken();
  const user = getAuthUser();
  const receiverId = user?._id;
  const messagesEndRef = useRef(null);

  usePageTitle(
    selectedSenderId
      ? senders.find((s) => s.id === selectedSenderId)?.name || "Messages"
      : "Messages"
  );

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/list-users-for-messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSenders(res.data.users);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSenders();
  }, [token]);

  useEffect(() => {
    if (!selectedSenderId || !receiverId) return;

    const fetchChat = async () => {
      setLoadingChat(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/get-chat/${selectedSenderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages);
      } catch (e) {
        console.error(e);
      } finally {
        emitEvent("join_room", `${receiverId}_${selectedSenderId}`);
        emitEvent("join_room", `${selectedSenderId}_${receiverId}`);
        setLoadingChat(false);
      }
    };
    fetchChat();
  }, [selectedSenderId, receiverId, token]);

  useEffect(() => {
    const handler = (payload) =>
      setMessages((prev) => [...prev, payload]);

    subscribeToUpdates("receive_message", handler);
    return () => unsubscribeFromUpdates("receive_message");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage) return;
    try {
      await axios.post(
        `${API_BASE_URL}/send-message`,
        { guestId: selectedSenderId, message: newMessage, role: user?.role || 'guest' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      emitEvent("send_message", {
        senderId: receiverId,
        receiverId: selectedSenderId,
        message: newMessage,
      });

      setNewMessage("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ height: { xs: "calc(100vh - 65px)", md: "calc(100vh - 85px)" }, display: "flex", bgcolor: "var(--bg-primary)" }}>

      {(!isMobile || !showChat) && (
        <Box
          sx={{
            width: { xs: "100%", md: 320 },
            borderRight: { md: 1 },
            borderColor: "divider",
            overflowY: "auto",
          }}
        >
          <Typography fontWeight={900} sx={{ p: 2 }}>
            Conversations
          </Typography>

          <List disablePadding>
            {senders.length === 0 ? (
              <Box sx={{ textAlign: "center", mt: 8, opacity: 0.6 }}>
                <InboxOutlinedIcon sx={{ fontSize: 60 }} />
                <Typography>No messages yet</Typography>
              </Box>
            ) : (
              senders.map((s) => (
                <ListItem
                  key={s.id}
                  onClick={() => {
                    setSelectedSenderId(s.id);
                    setShowChat(true);
                  }}
                  sx={{
                    cursor: "pointer",
                    px: 2,
                    py: 1.5,
                    bgcolor:
                      selectedSenderId === s.id
                        ? "var(--bg-secondary)"
                        : isMobile ? "var(--bg-secondary)" : "transparent",
                    "&:hover": { bgcolor: "var(--bg-secondary)" },
                  }}
                >
                  <Avatar src={s.photoProfile} sx={{ mr: 2 }}>
                    {s.name?.[0]}
                  </Avatar>
                  <ListItemText
                    primary={<Typography fontWeight={700}>{s.name}</Typography>}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      )}

      {(!isMobile || showChat) && (

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedSenderId ? (
            <>
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "var(--bg-primary)",
                }}
              >
                <IconButton
                  onClick={() => {
                    setSelectedSenderId(null);
                    setShowChat(false);
                  }}
                  sx={{ display: { md: "none" } }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ ml: 1, cursor: 'pointer' }}
                  onClick={() => {
                    const targetId = selectedSenderId;
                    const myRole = user?.role || 'guest';
                    const targetRole = myRole === 'host' ? 'guest' : 'host';
                    navigate(`/profile/${targetRole}/${targetId}`);
                  }}
                >
                  <Avatar src={senders.find((s) => s.id === selectedSenderId)?.photoProfile} />
                  <Typography fontWeight={900}>
                    {senders.find((s) => s.id === selectedSenderId)?.name}
                  </Typography>
                </Stack>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                  bgcolor: "var(--bg-secondary)"
                }}
              >
                {loadingChat ? (
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {messages.map((m, i) => {
                      const mine = m.senderId === receiverId;
                      const isAssistant = m.role === 'assistant' || m.isAI;

                      return (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            justifyContent: mine ? "flex-end" : "flex-start",
                            mb: 1.2,
                          }}
                        >
                          <Box
                            sx={{
                              px: 2,
                              py: 1.2,
                              maxWidth: { xs: "85%", md: "70%" },
                              bgcolor: isAssistant
                                ? "linear-gradient(135deg, #f0f7f4 0%, #e8f5e9 100%)"
                                : mine
                                  ? "primary.main"
                                  : "background.paper",
                              backgroundImage: isAssistant
                                ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
                                : 'none',
                              color: isAssistant
                                ? "#1b5e20"
                                : mine
                                  ? "primary.contrastText"
                                  : "text.primary",
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
                              {m.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.6,
                                mt: 0.5,
                                display: "block",
                                textAlign: "right",
                              }}
                            >
                              {new Date(m.timestamp).toLocaleTimeString([], {
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

              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: "divider",
                  display: "flex",
                  gap: 1,
                  bgcolor: "var(--bg-primary)",
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Type a message…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <IconButton onClick={handleSendMessage} disabled={!newMessage}>
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.6,
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 80 }} />
              <Typography>Select a conversation</Typography>
            </Box>
          )}
        </Box>)}
    </Box>
  );
};

export default GuestAllMessages;
