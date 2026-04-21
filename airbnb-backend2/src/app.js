import express from 'express';
// Force restart
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

import { startCronJob } from './cron/expirePendingBookings.js';
import { startReminderCron } from './cron/sendBookingReminders.js';

import { FRONTEND_BASE_URL } from './config/appConfig.js';

dotenv.config();

const app = express();
// app.use(cors({ origin: FRONTEND_BASE_URL, credentials: true }));
const allowedOrigins = [
  FRONTEND_BASE_URL,
  "http://localhost:5174",
  "http://localhost:5173",
  "https://rental-website-alpha.vercel.app",
  "https://www.mehman.site"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(passport.initialize());

// app.use(session({
//   secret: process.env.JWT_SECRET,
//   resave: false,
//   saveUninitialized: false,
// }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
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
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Start Cron Job
      startCronJob();
      startReminderCron();
      import('./controller/cancellationPolicy/seedPolicies.js').then(module => module.default());
    });
  } catch (error) {
    console.error('Error during server initialization:', error.message);
  }
};

export default startServer;