import mongoose, { Schema } from "mongoose";


const InstituteSchema = new Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        location:{
            type:String,
            required:true,
            trim:true,
        },
        status:{
            type:Number,
            enum:{values:[0,1],message:"Invalid Status Value!!!"},        // 0 for inactive and 1 for active
            default:1
        }
    },{
        timestamps:true
    }
)



export const Institutions = mongoose.model("Institute",InstituteSchema)
