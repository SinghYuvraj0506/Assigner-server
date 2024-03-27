import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config();

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
