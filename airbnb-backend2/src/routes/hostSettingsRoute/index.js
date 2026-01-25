import { hostSettingsController } from '../../controller/hostSettingsController.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';

const hostSettingsRoute = (app) => {
    app.get('/host/settings', combinedAuthenticate, hostSettingsController.getSettings);
    app.put('/host/settings', combinedAuthenticate, hostSettingsController.updateSettings);
}

export default hostSettingsRoute;
