import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
connectDB()
    .then(() => {
    app.on("error", (err) => {
        console.log("Error occured in express server", err);
        throw err;
    });
    app.listen(process.env.PORT, () => {
        console.log("Server running at port", process.env.PORT);
    });
})
    .catch(() => {
    console.log("MongoDB connection Failed");
});
