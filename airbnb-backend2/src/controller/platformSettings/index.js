import PlatformSettings from '../../model/platformSettings/index.js';

const platformSettingsController = {
    getSettings: async (req, res) => {
        try {
            const userId = req.user?._id; // Assuming req.user is populated by auth middleware

            let settings = await PlatformSettings.findOne({ userId });

            if (!settings) {
                // Return defaults if no document exists, but don't create it yet
                return res.status(200).json({
                    appMode: 'system',
                    language: 'en'
                });
            }

            res.status(200).json({
                appMode: settings.appMode,
                language: settings.language
            });
        } catch (error) {
            console.error('Error fetching platform settings:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    updateSettings: async (req, res) => {
        try {
            const userId = req.user?._id;
            const { appMode, language } = req.body;

            // Validation
            if (appMode && !['light', 'dark', 'system'].includes(appMode)) {
                return res.status(400).json({ message: 'Invalid appMode' });
            }
            if (language && !['en', 'ur', 'zh', 'tr', 'ar', 'fr', 'de'].includes(language)) {
                return res.status(400).json({ message: 'Invalid language' });
            }

            const updateData = {};
            if (appMode) updateData.appMode = appMode;
            if (language) updateData.language = language;

            const settings = await PlatformSettings.findOneAndUpdate(
                { userId },
                { $set: updateData },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            res.status(200).json({
                appMode: settings.appMode,
                language: settings.language
            });
        } catch (error) {
            console.error('Error updating platform settings:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

export default platformSettingsController;
