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
  phoneNumber:{
    type:Number,
    require:false
  },
  password: {
    type: String,
    required: true,
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
  CNIC: {
    type: {
      images: [String],
      isVerified: { type: Boolean, default: false },
    },
    required: false,
    default: {},
  }
}, {
  timestamps: true, 
});

const authentication = mongoose.model('Host', hostSchema);
export default authentication;
