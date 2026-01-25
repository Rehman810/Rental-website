import express from 'express';
import { getHostAnalytics } from '../../controller/hostDashboard/hostDashboard.controller.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';

const router = express.Router();

// GET /host/dashboard/analytics
router.get('/analytics', combinedAuthenticate, getHostAnalytics);

export default (app) => {
    app.use('/api/host/dashboard', router);
};
