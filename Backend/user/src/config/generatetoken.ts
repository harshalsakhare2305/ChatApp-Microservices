import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();


const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;

export const generatetoken = (user:any)=>{
    return jwt.sign({user},JWT_SECRET_KEY,{expiresIn:"15d"});
}
