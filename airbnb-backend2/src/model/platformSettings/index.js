import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true,
        unique: true
    },
    appMode: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
    },
    language: {
        type: String,
        enum: ['en', 'ur', 'zh', 'tr', 'ar', 'fr', 'de'],
        default: 'en'
    }
}, { timestamps: true });

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);
export default PlatformSettings;
