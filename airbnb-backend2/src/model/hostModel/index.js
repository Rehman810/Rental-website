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
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date
  },
  emailVerifyCode: {
    type: String,
    select: false
  },
  emailVerifyExpiry: {
    type: Date,
    select: false
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
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
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
      requireVerifiedEmail: { type: Boolean, default: false },
      requireProfilePhoto: { type: Boolean, default: false },
      minAccountAgeDays: { type: Number, default: 0 },
      requireCompletedProfile: { type: Boolean, default: false },
    },
    pricing: {
      basePrice: { type: Number, default: 0 },
      weekendPrice: { type: Number, default: 0 },
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    availability: {
      minNights: { type: Number, default: 1 },
      maxNights: { type: Number, default: 30 },
      allowSameDayBooking: { type: Boolean, default: false },
      minNoticeDays: { type: Number, enum: [0, 1, 2, 7], default: 1 },
      bookingWindowMonths: { type: Number, enum: [1, 3, 6, 12], default: 6 },
      checkInFrom: { type: String, default: "14:00" },
      checkOutBy: { type: String, default: "11:00" }
    }
  },
}, {
  timestamps: true,
});

const authentication = mongoose.model('Host', hostSchema);
export default authentication;
