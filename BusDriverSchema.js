import mongoose from "mongoose"
const DriverSchema=new mongoose.Schema({
    GoogleId:{
        type:mongoose.Schema.Types.String,
        required:true,
        unique:true,
    },
    displayname:{
        type:mongoose.Schema.Types.String,
        required:true,
    },
    busnumber:{
        type:mongoose.Schema.Types.String,
        required:true,
    },
});
export const Driver=mongoose.model("Driver",DriverSchema);