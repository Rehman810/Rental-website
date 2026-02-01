import platformSettingsController from '../../controller/platformSettings/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';

const platformSettingsRoute = (app) => {
    app.get('/platform-settings', combinedAuthenticate, platformSettingsController.getSettings);
    app.put('/platform-settings', combinedAuthenticate, platformSettingsController.updateSettings);
};

export default platformSettingsRoute;
