import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';
import { getPolicies, createCustomPolicy } from '../../controller/cancellationPolicy/index.js';

const cancellationPolicyRoute = (app) => {
    app.get('/api/cancellation-policies', combinedAuthenticate, getPolicies);
    app.post('/api/cancellation-policies', combinedAuthenticate, createCustomPolicy);
};

export default cancellationPolicyRoute;
