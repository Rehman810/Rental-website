import mongoose from 'mongoose';

const temporaryListingSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: false,
  },
  placeType: {
    type: String,
    enum: ['House', 'Apartment', 'Shared Room','Bed & breakfast','Boat','Cabin','Campervan/motorhome','Casa particular','Castle'],
    required: false,
  },
  roomType: {
    type: String,
    enum: ['Entire Place', 'A Room', 'A Shared Room'],
    required: false,
  },
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
      return this.weekdayPrice
        ? Math.round(this.weekdayPrice * (1 + this.weekdayCommission / 100))
        : 0;
    },
  },
  weekendActualPrice: {
    type: Number,
    required: false,
    default: function () {
      return this.weekendPrice
        ? Math.round(this.weekendPrice * (1 + this.weekendCommission / 100))
        : 0;
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

temporaryListingSchema.virtual('confirmedBookings', {
  ref: 'ConfirmedBooking',
  localField: '_id',
  foreignField: 'listingId',
});

export default mongoose.model('temporaryListing', temporaryListingSchema);
