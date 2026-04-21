// import io from 'socket.io-client';
// import API_CONFIG from '../config/Api/Api'; 

// const { apiKey } = API_CONFIG;
// let socket;

// export const initializeSocket = () => {
//   if (!socket) {
//     socket = io("http://localhost:5000", {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,  // Limit to 5 reconnection attempts
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//     });

//     socket.on('connect', () => {
//       console.log('Connected to WebSocket server');
//     });

//     socket.on('disconnect', () => {
//       console.log('Disconnected from WebSocket server');
//     });

//     socket.on('connect_error', (error) => {
//       console.error('Connection error:', error);
//     });

//     socket.on('error', (error) => {
//       console.error('Socket.IO error:', error);
//     });
//   }
// };

// export const subscribeToUpdates = (eventName, callback) => {
//   if (!socket) {
//     console.error('Socket is not initialized. Call initializeSocket() first.');
//     return;
//   }

//   socket.on(eventName, callback);
// };

// export const unsubscribeFromUpdates = (eventName) => {
//   if (!socket) {
//     console.error('Socket is not initialized. Call initializeSocket() first.');
//     return;
//   }

//   socket.off(eventName);
// };

// export const emitEvent = (eventName, data) => {
//   if (!socket) {
//     console.error('Socket is not initialized. Call initializeSocket() first.');
//     return;
//   }

//   socket.emit(eventName, data);
// };

// // Helper function to disconnect socket when not needed
// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//     console.log('Socket disconnected');
//   }
// };


import io from "socket.io-client";
import { API_BASE_URL } from "../config/env";
import API_CONFIG from "../config/Api/Api";
import { getAuthToken } from "../utils/cookieUtils";

const { apiKey } = API_CONFIG;
let socket;

/**
 * Initialize the WebSocket connection.
 */
export const initializeSocket = () => {
  if (!socket) {
    const token = getAuthToken();
    const CHAT_SERVICE_URL = API_BASE_URL;

    socket = io(CHAT_SERVICE_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5, // Limit to 5 reconnection attempts
      reconnectionDelay: 1000, // Initial delay (in ms) between retries
      reconnectionDelayMax: 5000, // Max delay (in ms) between retries
      auth: { token },
      query: { apiKey }, // Optional: Add API key or other query params
      withCredentials: true,
    });

    // Connection events
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      console.log("Socket ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn(`Disconnected from WebSocket server. Reason: ${reason}`);
    });

    // Error events
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message || error);
    });

    socket.on("error", (error) => {
      console.error("Socket.IO error:", error.message || error);
    });

    // Reconnection events
    socket.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt #${attempt}`);
    });

    socket.on("reconnect", () => {
      console.log("Reconnected to WebSocket server");
    });

    socket.on("reconnect_failed", () => {
      console.error("Reconnection failed after maximum attempts");
    });
  } else {
    console.log("Socket is already initialized");
  }
};

/**
 * Subscribe to a specific WebSocket event.
 * @param {string} eventName - The name of the event to subscribe to.
 * @param {function} callback - The callback function to handle the event.
 */
export const subscribeToUpdates = (eventName, callback) => {
  console.log("eventName", eventName)
  console.log("callback", callback)
  if (!socket) {
    console.error("Socket is not initialized. Call initializeSocket() first.");
    return;
  }

  socket.on(eventName, callback);
};

/**
 * Unsubscribe from a specific WebSocket event.
 * @param {string} eventName - The name of the event to unsubscribe from.
 */
export const unsubscribeFromUpdates = (eventName) => {
  console.log("event name", eventName)
  if (!socket) {
    console.error("Socket is not initialized. Call initializeSocket() first.");
    return;
  }

  socket.off(eventName);
};

/**
 * Emit an event with optional data to the WebSocket server.
 * @param {string} eventName - The name of the event to emit.
 * @param {object} data - The data to send with the event.
 */
export const emitEvent = (eventName, data) => {
  if (!socket) {
    console.error("Socket is not initialized. Call initializeSocket() first.");
    return;
  }

  socket.emit(eventName, data);
};

/**
 * Disconnect the WebSocket connection and clean up.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected and cleaned up");
  } else {
    console.log("Socket is already disconnected");
  }
};
