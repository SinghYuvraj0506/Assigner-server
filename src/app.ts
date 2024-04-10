import express, { Response,Request } from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import { ErrorMiddleware } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";

const app = express()

app.use(cors(({
    origin:process.env.CORS_ORIGIN,
    credentials:true
})))

app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.get("/healthcheck",(_,res:Response)=>{
    return res.send("Hello I am Aalas")
})

// routes ----------------------
import userRoutes from "./routes/user.routes.js"
import fileRoutes from "./routes/fileupload.routes.js"
import assignmentRoutes from "./routes/assignments.routes.js"


app.use("/api/v1/users",userRoutes);
app.use("/api/v1/file",fileRoutes);
app.use("/api/v1/assignments",assignmentRoutes);

app.all("*",(req:Request,res:Response)=>{
    throw new ApiError(404,`Route ${req.originalUrl} Not Found!!!`)
})


app.use(ErrorMiddleware);

export default app;