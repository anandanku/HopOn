import mongoose from "mongoose";

const LiveBusesSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true
  },
  onRoute:{type:Boolean,default:false},
  lat:{type:Number},
  lng:{type:Number},
  lastlat:{type:Number,default:null},
  lastlng:{type:Number,default:null}
});

export default mongoose.model("LiveBus", LiveBusesSchema);
