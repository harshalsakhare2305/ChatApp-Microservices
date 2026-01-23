import type { Document } from "mongoose";
import type{Response,Request,NextFunction} from 'express'
import dotenv from 'dotenv'
import jwt,{ type JwtPayload }  from 'jsonwebtoken'


interface IUser extends Document{
    name:string;
    email:string;
}

export interface AuthenticationRequest extends Request {
    user?: IUser | null;
};

export const isAuth = async (req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void>=>{
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please login - Auth HEader error"
            });
            return;
        }

        const token = authHeader.split(" ")[1] as string;
        const secret = process.env.JWT_SECRET_KEY;

        if (!secret) {
            res.status(500).json({
                message: "JWT secret not configured",
            });
            return;
        }

        const decodeValue = jwt.verify(token, secret) as JwtPayload;

        if(!decodeValue || !decodeValue.user){
            res.status(401).json({
                message:"Invalid Token"
            });
            return;
        }

        req.user=decodeValue.user;

        next();



    } catch (error) {
       
        res.status(401).json({
            message:"Please login -JWT"
        });
    }
}





