import mongoose, { Document, Schema } from "mongoose";

interface PricingDocument extends Document{
    for:"Assignment",
    amountWithoutReasearch:number,
    amountWithReasearch:number,
    pageRange:{from:number,to:number}
}

const pricingSchema = new Schema({
    for:{
        type:String,
        enum:["Assignment"],
        required:true
    },
    amountWithoutReasearch:{
        type:Number,
        required:true
    },
    amountWithReasearch:{
        type:Number,
        required:true
    },
    pageRange:{
        from:{
            type:Number,
            required:true
        },
        to:{
            type:Number,
            required:true
        }
    }

},{
    timestamps:true
})


const Pricing = mongoose.model<PricingDocument>("pricing",pricingSchema)


export default Pricing;