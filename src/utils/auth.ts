
import Google from "passport-google-oauth20"
import passport from "passport";

passport.use(new Google.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "/auth/google/callback",
    passReqToCallback   : true,
    scope:["profile","email"],
},
    function (request, accessToken, refreshToken, profile, done) {
       done(null,profile)
    }
));

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user:{}, done) => {
    done(null, user);
});

