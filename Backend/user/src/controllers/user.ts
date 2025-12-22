import { generatetoken } from "../config/generatetoken.js";
import { publishToQueue } from "../config/rabitmq.js";
import TryCatch from "../config/TryCatch.js";
import { RedisClient } from "../index.js";
import { User } from "../model/user.js";
import type {AuthenticationRequest} from '../middleware/isAuth.js'
import type {Response} from 'express'

export const loginUser = TryCatch(async(req,res)=>{
    const {email}=req.body;

    const ratelimitKey=`otp:ratelimit:${email}`;
    const ratelimit =await RedisClient.get(ratelimitKey);

    if(ratelimit){
        res.status(429).json({message:"Too many request . Please wait before requesting new otp"});
        return;
    }

    const otp =Math.floor(100000 + Math.random()*900000).toString();

    const otpKey=`otp:${email}`;

    await RedisClient.set(otpKey,otp,{
        EX:300   // 300 sec means 5 min
    });

    await RedisClient.set(ratelimitKey,"true",{
        EX:60
    });

    const message ={
        to:email,
        subject:"Your OTP Code",
        body:`Your otp code is ${otp} . It is valid for 5 minutes only.`
    };

    await publishToQueue('send-otp',message);

    res.status(200).json({
        message:`You otp is sent to mail`
    });




});

export const VerifuUser = TryCatch(async (req,res)=>{
    const {email,otp:enteredotp}=req.body;

    const otpKey =`otp:${email}`;

    const storedotp=await RedisClient.get(otpKey);
    if(!storedotp || storedotp!==enteredotp){
        res.status(400).json({
            message:"Invalid or Expired OTP"
        });
        return;
    }

     await RedisClient.del(otpKey);

     let user =await User.findOne({email});
     
     if(!user){
        const name =email.slice(0,8);
        user=await User.create({name,email});
     }

     const token =generatetoken(user);



    
res.json({
    message:"User Verified",
    user,
    token
});

});

export const getmyProfile = TryCatch(async(req:AuthenticationRequest,res:Response)=>{
    const user =req.user;

    res.json(user);
});

export const Updatename = TryCatch(async (req:AuthenticationRequest,res:Response)=>{
    const user = await User.findById(req.user?._id);

   if(!user){
    res.status(401).json({
        message:"User not Found - Login Please"
    });
    return;
   }

   user.name=req.body.name;
   await user.save();

   const token =generatetoken(user);

   res.json({
    message:"User Name is Updared",
    user,
    token
   });


});

export const getAllUser =TryCatch(async (req:AuthenticationRequest,res:Response)=>{
    const users = await User.find();

    res.json(users);
});

export const getAUser =TryCatch(async (req:AuthenticationRequest,res:Response)=>{
    const user = await User.findById(req.params.id);

    res.json(user);
})