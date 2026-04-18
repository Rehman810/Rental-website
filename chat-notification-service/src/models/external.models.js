import mongoose from 'mongoose';

// Minimal Listing schema for AI context
const ListingSchema = new mongoose.Schema({
  hostId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  aiSummary: String,
  autoReplyEnabled: { type: Boolean, default: false },
}, { strict: false });

// Minimal User/Host schema for AI settings
const UserSchema = new mongoose.Schema({
  userName: String,
  settings: {
    aiAssistant: {
      enabled: Boolean,
      geminiApiKey: String,
    }
  }
}, { strict: false });

export const Listing = mongoose.model('Listing', ListingSchema);
export const User = mongoose.model('User', UserSchema);
