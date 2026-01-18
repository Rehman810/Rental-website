import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import ConnectDB from './dbConnector/index.js';
import config from './config/index.js';
import allRoutes from './routes/allRoutes/index.js';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';
import initializeSocket from './socket.io/index.js';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json());

app.use(passport.initialize());

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
  transports: ["websocket", "polling"],
});

initializeSocket(io); 

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5, 
  message: { error: 'You have exceeded the maximum number of requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

allRoutes(app, io); 

app.get('/', (req, res) => {
  res.send({ code: 200, message: 'Server is running successfully.' });
});

const startServer = async () => {
  try {
    await ConnectDB(config.db, console);
    console.log('Database initialized.');
    console.log("DB CONFIG =>", config.db);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error during server initialization:', error.message);
  }
};

export default startServer;