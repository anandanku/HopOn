
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  GoogleId: {
    type: String,
    required: true,
    unique: true
  },
  displayname: {
    type: String,
    required: true
  }
});

export const User = mongoose.model("User", UserSchema);
