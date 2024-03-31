import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


interface AssignmentDocument extends mongoose.Document{
    owner:string,
    name:string,
    instructions:string,
    file:string[],
    completionTime:Date,
    status: 0 | 1;
    amount:number,
    createdAt: Date;
    updatedAt: Date;
}


const assignmentSchema = new Schema(
    {
        owner:{
            type:mongoose.Types.ObjectId,
            ref:"User",
            required:true       
        },
        name:{
            type:"String",
            required:true
        },
        instructions:{
            type:String,
            required:true,
        },
        file:[{
            type:mongoose.Types.ObjectId,        // upload file url -----------------
            ref:"file_upload"   
        }],
        completionTime: {
            type: Date,
            required: true,
            validate: {
                validator: function(value:Date) {
                    return value > new Date(); // Check if completionTime is greater than current date
                },
                message: (props:{value:string}) => `${props.value} is not a future date.`
            }
        },
        status:{
            type:Number,
            enum:{values:[0,1,2],message:"Invalid Status Value!!!"},        // 0 for deleted/inactive and 1 for active,2 for done
            default:1
        },
        amount:{
            type:Number
        }
    },{
        timestamps:true
    }
)


assignmentSchema.plugin(mongooseAggregatePaginate)

export const Assignments = mongoose.model<AssignmentDocument>("Assignment",assignmentSchema)