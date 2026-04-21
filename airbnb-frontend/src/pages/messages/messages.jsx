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
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchTerm, setSearchTerm] = useState("");
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
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight={900}>
              Chats
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small"><FilterListIcon fontSize="small" /></IconButton>
              <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
            </Stack>
          </Box>

          <Box sx={{ px: 2, pb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search or start new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                ),
                sx: { 
                  borderRadius: '10px', 
                  bgcolor: 'var(--bg-secondary)',
                  '& fieldset': { border: 'none' }
                }
              }}
            />
          </Box>

          <List disablePadding>
            {senders.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
              <Box sx={{ textAlign: "center", mt: 8, opacity: 0.6 }}>
                <InboxOutlinedIcon sx={{ fontSize: 60 }} />
                <Typography>No messages yet</Typography>
              </Box>
            ) : (
              senders
                .filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((s) => (
                  <ListItem
                    key={s.id}
                    component={motion.div}
                    whileHover={{ backgroundColor: "var(--bg-secondary)" }}
                    onClick={() => {
                      setSelectedSenderId(s.id);
                      setShowChat(true);
                    }}
                    sx={{
                      cursor: "pointer",
                      px: 2,
                      py: 1.5,
                      transition: 'all 0.2s',
                      bgcolor:
                        selectedSenderId === s.id
                          ? "var(--bg-secondary)"
                          : "transparent",
                      borderLeft: selectedSenderId === s.id ? '4px solid var(--primary)' : '4px solid transparent',
                    }}
                  >
                    <Avatar 
                      src={s.photoProfile} 
                      sx={{ width: 48, height: 48, mr: 2, border: '1px solid var(--border-light)' }}
                    >
                      {s.name?.[0]}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography fontWeight={700} variant="body1">{s.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            12:45 PM
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '0.8rem',
                          mt: 0.5
                        }}>
                          {s.lastMessage || "Start a conversation"}
                        </Typography>
                      }
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
                  sx={{ ml: 1, cursor: 'pointer', flex: 1 }}
                  onClick={() => {
                    const targetId = selectedSenderId;
                    const myRole = user?.role || 'guest';
                    const targetRole = myRole === 'host' ? 'guest' : 'host';
                    navigate(`/profile/${targetRole}/${targetId}`);
                  }}
                >
                  <Avatar src={senders.find((s) => s.id === selectedSenderId)?.photoProfile} sx={{ width: 40, height: 40 }} />
                  <Box>
                    <Typography fontWeight={700} sx={{ lineHeight: 1.2 }}>
                      {senders.find((s) => s.id === selectedSenderId)?.name}
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

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                  bgcolor: "var(--bg-secondary)",
                  backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                  backgroundOpacity: 0.06,
                  backgroundBlendMode: 'overlay',
                }}
              >
                {loadingChat ? (
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    <AnimatePresence>
                      {messages.map((m, i) => {
                        const mine = m.senderId === receiverId;
                        const isAssistant = m.role === 'assistant' || m.isAI;

                        return (
                          <Box
                            key={i}
                            component={motion.div}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            sx={{
                              display: "flex",
                              justifyContent: mine ? "flex-end" : "flex-start",
                              mb: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.8,
                                maxWidth: { xs: "85%", md: "70%" },
                                bgcolor: isAssistant
                                  ? "#e8f5e9"
                                  : mine
                                    ? "#d9fdd3"
                                    : "#ffffff",
                                backgroundImage: isAssistant
                                  ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
                                  : 'none',
                                color: isAssistant
                                  ? "#1b5e20"
                                  : "#111b21",
                                position: "relative",
                                borderRadius: '12px',
                                borderTopLeftRadius: !mine ? '0px' : '12px',
                                borderTopRightRadius: mine ? '0px' : '12px',
                                boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                                border: isAssistant ? '1px solid rgba(46, 125, 50, 0.1)' : 'none',
                                '&::before': {
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
                                {m.message}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.2, gap: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    opacity: 0.5,
                                    fontSize: '0.65rem',
                                  }}
                                >
                                  {new Date(m.timestamp).toLocaleTimeString([], {
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

              <Box
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#f0f2f5",
                }}
              >
                <IconButton size="small"><EmojiEmotionsIcon sx={{ color: '#54656f' }} /></IconButton>
                <IconButton size="small"><AttachFileIcon sx={{ color: '#54656f', transform: 'rotate(45deg)' }} /></IconButton>
                <TextField
                  fullWidth
                  placeholder="Type a message"
                  variant="outlined"
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
