import express from 'express';
import { generateListing, assistantChat, getSmartRecommendations, getSmartPricing } from '../../controller/aiController/index.js';


const aiRoute = (app) => {
    const router = express.Router();

    router.post('/generate-listing', generateListing);
    router.post('/assistant-chat', assistantChat);
    
    // New Intelligent System Routes
    router.get('/recommendations', getSmartRecommendations);
    router.post('/smart-pricing', getSmartPricing);

    app.use('/api/v1/ai', router);
};

export default aiRoute;
