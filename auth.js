import passport from "passport";
import express, { Router } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {User} from "./userschema.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router=express.Router();
passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // fetch user from DB
    done(null, user); // pass full user object
  } catch (err) {
    done(err, null);
  }
});
passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/google/callback"
   },
   async (accessToken, refreshToken, profile, done) => {
    let findUser;
    try {
        findUser=await User.findOne({GoogleId:profile.id});
        console.log("finding the user");
    } catch (error) {
        console.log("user not found");
        return done(error,null);
    }
    try {
        if(!findUser){
            const newuser=new User({
                GoogleId:profile.id,
                displayname:profile.displayName
        });
        const newsaveduser=await newuser.save();
        console.log("saved a user");
        return done(null,newsaveduser);
        }
        return done(null,findUser);
    } catch (error) {
        return done(error,null);
    }
  }
));
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "loginpage.html"));
});
router.get("/auth/google",passport.authenticate("google",{scope:["profile"]}));
router.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/"}),(req,res)=>{
       res.redirect("/home");
});
export default router;