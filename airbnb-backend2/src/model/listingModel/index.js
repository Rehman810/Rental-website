import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: false,
  },
  placeType: {
    type: String,
    enum: ['House', 'Apartment', 'Shared Room', 'Bed & breakfast', 'Boat', 'Cabin', 'Campervan/motorhome', 'Casa particular', 'Castle'],
    required: false,
  },
  roomType: {
    type: String,
    enum: ['Entire Place', 'A Room', 'A Shared Room'],
    required: false,
  },
  bookingMode: {
    enum: ['instant', 'request'],
  },
  guestRequirementsOverride: {
    requireVerifiedPhone: { type: Boolean },
    requireCNIC: { type: Boolean },
    requireVerifiedEmail: { type: Boolean },
    requireProfilePhoto: { type: Boolean },
    minAccountAgeDays: { type: Number },
    requireCompletedProfile: { type: Boolean },
  },
  minNights: { type: Number },
  maxNights: { type: Number },
  allowSameDayBooking: { type: Boolean },
  minNoticeDays: { type: Number, enum: [0, 1, 2, 7] },
  bookingWindowMonths: { type: Number, enum: [1, 3, 6, 12] },
  checkInFrom: { type: String },
  checkOutBy: { type: String },
  street: { type: String, required: false },
  flat: { type: String },
  city: { type: String, required: false },
  town: { type: String },
  postcode: { type: String, required: false },
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },

  guestCapacity: { type: Number, required: false },
  beds: { type: Number, required: false },
  bathrooms: { type: Number, required: false },
  bedrooms: { type: Number, required: false },
  amenities: { type: [String], required: false },
  photos: {
    type: [String],
    validate: {
      validator: function (value) {
        return value && value.length >= 3;
      },
      message: 'At least 3 photos are required.',
    },
    required: true,
  },
  title: { type: String, required: false },
  description: { type: String, required: false },
  weekdayPrice: { type: Number, required: true, default: 0 },
  weekendPrice: { type: Number, required: true, default: 0 },
  weekdayCommission: { type: Number, default: 13 },
  weekendCommission: { type: Number, default: 13 },
  weekdayActualPrice: {
    type: Number,
    required: false,
    default: function () {
      if (!this.weekdayPrice) return 0;
      return Math.round(this.weekdayPrice * (1 + this.weekdayCommission / 100));
    },
  },

  weekendActualPrice: {
    type: Number,
    required: false,
    default: function () {
      if (!this.weekendPrice) return 0;
      return Math.round(this.weekendPrice * (1 + this.weekendCommission / 100));
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  ratingDetails: {
    cleanliness: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    value: { type: Number, default: 0 }
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },

});

listingSchema.index({ location: '2dsphere' });

listingSchema.pre('save', function (next) {
  if (this.latitude && this.longitude) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude]
    };
  }
  next();
});

listingSchema.virtual('confirmedBookings', {
  ref: 'ConfirmedBooking',
  localField: '_id',
  foreignField: 'listingId',
});

export default mongoose.model('Listing', listingSchema);
