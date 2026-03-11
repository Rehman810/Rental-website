
import Host from '../model/hostModel/index.js'

export const hostSettingsController = {
    getSettings: async (req, res) => {
        try {
            const host = await Host.findById(req.user._id).select('settings');
            if (!host) {
                return res.status(404).json({ message: 'Host not found' });
            }
            return res.status(200).json({ settings: host.settings });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    updateSettings: async (req, res) => {
        try {
            const { settings } = req.body;
            const currentHost = await Host.findById(req.user._id).select('+settings.aiAssistant.geminiApiKey');
            
            if (!currentHost) {
                return res.status(404).json({ message: 'Host not found' });
            }

            // Deep merge or specific updates to handle geminiApiKey
            const updateData = { ...settings };
            
            if (updateData.aiAssistant) {
                // If geminiApiKey is empty/missing in request, keep the existing one
                if (!updateData.aiAssistant.geminiApiKey && currentHost.settings?.aiAssistant?.geminiApiKey) {
                    updateData.aiAssistant.geminiApiKey = currentHost.settings.aiAssistant.geminiApiKey;
                }
            }

            currentHost.settings = { ...currentHost.settings, ...updateData };
            await currentHost.save();

            return res.status(200).json({ 
                message: 'Settings updated successfully', 
                settings: currentHost.settings 
            });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};
