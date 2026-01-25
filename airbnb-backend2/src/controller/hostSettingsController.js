
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
            const host = await Host.findByIdAndUpdate(
                req.user._id,
                { $set: { settings } },
                { new: true, runValidators: true }
            ).select('settings');

            if (!host) {
                return res.status(404).json({ message: 'Host not found' });
            }
            return res.status(200).json({ message: 'Settings updated successfully', settings: host.settings });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};
