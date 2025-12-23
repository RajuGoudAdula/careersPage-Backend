import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },  // store hashed OTP
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTPVerification", otpSchema);
