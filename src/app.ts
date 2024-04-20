import express, { Response, Request } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";
import "./utils/auth.js";
import session from "express-session";
import passport from "passport";

const app = express();

app.use(cors({
    origin: ["https://assigner-client.vercel.app", "https://localhost:5173"],
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET as string,
        name: "session",
        resave: false,
        saveUninitialized: true, // Change to true to save uninitialized sessions
        cookie: {
            maxAge: 24 * 60 * 24 * 100 * 12,
            httpOnly: true, // Set to true to prevent client-side access to cookies
            secure: false // Set to true if serving over HTTPS
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/healthcheck", (_, res: Response) => {
    return res.send("Hello I am Aalas");
});

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import fileRoutes from "./routes/fileupload.routes.js";
import assignmentRoutes from "./routes/assignments.routes.js";
import institutionRoutes from "./routes/institutions.routes.js";

// Use routes
app.use("/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/file", fileRoutes);
app.use("/api/v1/assignments", assignmentRoutes);
app.use("/api/v1/institutions", institutionRoutes);

// 404 route handler
app.all("*", (req: Request, res: Response) => {
    throw new ApiError(404, `Route ${req.originalUrl} Not Found!!!`);
});

// Error handling middleware
app.use(ErrorMiddleware);

export default app;
