import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        fullName:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            immutable:true
        },
        phone:{
            type:String,
            unique:true,
            validate: {
                validator: function (value: string) {
                  // Custom phone number validation logic
                  const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
                  return phoneRegex.test(value);
                },
                message: (props:{value:string}) => `${props?.value} is not a valid phone number!`,
              }
        },
        password:{
            type:String,
        },
        signInFrom:{
            type:String,
            enum:{values:["google","email"],message:"Invalid Signin Method!!"},
            required:true
        },
        institute:{
            type:mongoose.Types.ObjectId,
            ref:"Institute"
        },
        refreshToken:{
            type:String
        },
        status:{
            type:Number,
            enum:{values:[0,1],message:"Invalid Status Value!!!"},          // 0 for inactive and 1 for active
            default:1
        }
    },{
        timestamps:true
    }
)


export const User = mongoose.model("User",userSchema);