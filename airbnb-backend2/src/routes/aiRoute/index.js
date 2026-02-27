import express from 'express';
import { generateListing } from '../../controller/aiController/index.js';

const aiRoute = (app) => {
    const router = express.Router();

    router.post('/generate-listing', generateListing);

    app.use('/api/v1/ai', router);
};

export default aiRoute;
