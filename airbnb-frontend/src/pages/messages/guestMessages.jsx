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
  const [listingDetails, setListingDetails] = useState(null);

  useEffect(() => {
    if (listingId) {
      axios.get(`${API_BASE_URL}/listing/${listingId}`)
        .then(res => setListingDetails(res.data.listing))
        .catch(err => console.error("Error fetching listing details:", err));
    }
  }, [listingId]);

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

  // Automated first message with listing details
  useEffect(() => {
    if (listingDetails && messages.length === 0 && !loading && !sending) {
      const sendAutomatedInquiry = async () => {
        const inquiryData = {
          type: "LISTING_INQUIRY",
          listingId: listingDetails._id,
          title: listingDetails.title,
          image: listingDetails.photos?.[0],
          price: listingDetails.weekdayPrice,
          location: `${listingDetails.city}, ${listingDetails.country || 'Pakistan'}`
        };

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        try {
          await axios.post(
            `${API_BASE_URL}/send-message`,
            {
              guestId: receiverId,
              message: `JSON_TYPE_LISTING:${JSON.stringify(inquiryData)}`,
              listingId: listingDetails._id,
              role: 'guest'
            },
            config
          );
          // The socket will handle updating the messages state
        } catch (error) {
          console.error("Error sending automated inquiry:", error);
        }
      };

      sendAutomatedInquiry();
    }
  }, [listingDetails, messages.length, loading]);

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
        height: { xs: "calc(100dvh - 135px)", md: "calc(100vh - 85px)" },
        overflow: "hidden",
        position: "fixed",
        top: { xs: "65px", md: "85px" },
        left: 0,
        right: 0,
        bottom: { xs: "70px", md: 0 }
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

      {/* Listing Preview Card */}
      {listingDetails && (
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid var(--border-light)",
            animation: "slideDown 0.3s ease-out",
            "@keyframes slideDown": {
              from: { transform: "translateY(-10px)", opacity: 0 },
              to: { transform: "translateY(0)", opacity: 1 },
            },
          }}
        >
          <Avatar
            variant="rounded"
            src={listingDetails.photos?.[0]}
            sx={{ width: 60, height: 60, borderRadius: 1.5 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" fontWeight={800} color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Inquiring about
            </Typography>
            <Typography variant="body2" fontWeight={700} noWrap>
              {listingDetails.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {listingDetails.city}, {listingDetails.country || "Pakistan"}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/rooms/${listingId}`)}
            sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 700 }}
          >
            View
          </Button>
        </Box>
      )}

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
                      {msg.message?.startsWith("JSON_TYPE_LISTING:") ? (() => {
                        try {
                          const data = JSON.parse(msg.message.replace("JSON_TYPE_LISTING:", ""));
                          return (
                            <Box sx={{ minWidth: { xs: 200, sm: 250 }, my: 1 }}>
                              <Box
                                component="img"
                                src={data.image}
                                sx={{
                                  width: '100%',
                                  height: 140,
                                  borderRadius: 2,
                                  objectFit: 'cover',
                                  mb: 1
                                }}
                              />
                              <Typography variant="caption" fontWeight={800} color="primary" sx={{ display: 'block', textTransform: 'uppercase' }}>
                                Listing Inquiry
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                                {data.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {data.location}
                              </Typography>
                              <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/rooms/${data.listingId}`);
                                }}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  borderRadius: '8px',
                                  bgcolor: 'primary.main',
                                  boxShadow: 'none'
                                }}
                              >
                                View Listing
                              </Button>
                            </Box>
                          );
                        } catch (e) {
                          return <Typography variant="body2">{msg.message}</Typography>;
                        }
                      })() : (
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                          {msg.message}
                        </Typography>
                      )}
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
