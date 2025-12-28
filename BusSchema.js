import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  busnumber: {
    type: String,
    required: true,
    trim: true
  },
  route: [
    {
      name: String,
      latitude: Number,
      longitude: Number
    }
  ]
});

BusSchema.index({ "route.latitude": 1, "route.longitude": 1 });

export default mongoose.model("Bus", BusSchema);
