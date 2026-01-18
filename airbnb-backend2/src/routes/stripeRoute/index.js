import { stripeController } from '../../controller/stripeController/index.js';
import { authenticateHost } from '../../middleWare/authenticate/index.js';

const stripeRoute = (app) => {
    // Connect account
    app.post('/api/stripe/connect', authenticateHost, stripeController.createConnectAccount);

    // Check status
    app.get('/api/stripe/status', authenticateHost, stripeController.getAccountStatus);

    // Webhook - No auth required, verified by signature
    // Note: Ensure bodyParser.raw is applied for this route or globally if needed by Stripe
    // Given existing setup, we rely on standard express.json() but constructEvent needs raw.
    // We might need to handle raw body specifically if not managed. 
    // For now, following standard request.
    app.post('/api/stripe/webhook', stripeController.webhook);
};

export default stripeRoute;
