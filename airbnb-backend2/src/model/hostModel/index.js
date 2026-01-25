import mongoose from "mongoose";

const hostSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    immutable: true,

  },
  phoneNumber: {
    type: Number,
    require: false
  },
  password: {
    type: String,
    required: function () { return this.authProvider === 'local'; }
  },
  verifyToken: {
    type: String,
    default: '',
  },
  isVerify: {
    type: Boolean,
    default: false,
  },
  verifyCode: {
    type: String,
    default: '',
  },
  photoProfile: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    default: 'local',
    enum: ['local', 'google']
  },
  role: {
    type: String,
    enum: ['guest', 'host'],
    default: 'guest'
  },
  CNIC: {
    type: {
      images: [String],
      isVerified: { type: Boolean, default: false },
    },
    required: false,
    default: {},
  },
  stripeAccountId: { type: String, default: null },
  stripeOnboardingCompleted: { type: Boolean, default: false },
  settings: {
    bookingMode: { type: String, enum: ['instant', 'request'], default: 'request' },
    cancellationPolicy: { type: String, enum: ['flexible', 'moderate', 'strict'], default: 'moderate' },
    houseRules: {
      quietHours: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      petsAllowed: { type: Boolean, default: false },
    },
    guestRequirements: {
      requireVerifiedPhone: { type: Boolean, default: false },
      requireCNIC: { type: Boolean, default: false },
    },
    pricing: {
      basePrice: { type: Number, default: 0 },
      weekendPrice: { type: Number, default: 0 },
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    }
  },
}, {
  timestamps: true,
});

const authentication = mongoose.model('Host', hostSchema);
export default authentication;
