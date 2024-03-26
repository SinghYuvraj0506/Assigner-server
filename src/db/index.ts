import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
    try {
        const connnectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("MongoDB connected successfully at DB HOST:",connnectionInstance?.connection?.host)
        
    } catch (error) {
        console.log("MongoDB connection Failed:", error)
        process.exit(1)
    }
}


export default connectDB;