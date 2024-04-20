import mongoose, { Schema } from "mongoose";
const pricingSchema = new Schema({
    for: {
        type: String,
        enum: ["Assignment"],
        required: true
    },
    amountWithoutReasearch: {
        type: Number,
        required: true
    },
    amountWithReasearch: {
        type: Number,
        required: true
    },
    pageRange: {
        from: {
            type: Number,
            required: true
        },
        to: {
            type: Number,
            required: true
        }
    }
}, {
    timestamps: true
});
const Pricing = mongoose.model("pricing", pricingSchema);
export default Pricing;
