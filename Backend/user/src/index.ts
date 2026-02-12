import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import {createClient} from 'redis'
import UserRoutes from './routes/user.js'
import { ConnectToRabbitMQ } from './config/rabitmq.js';
import cookieParser from "cookie-parser";
import cors from 'cors'


dotenv.config();

connectDb();

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined"); 
}

export const RedisClient= createClient({
    url:process.env.REDIS_URL,
});

RedisClient.connect().then(()=>{console.log("✅The redis client is connected")}).catch(console.error)

ConnectToRabbitMQ();


const app =express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));


app.options("*", cors());


app.use(express.json());

app.use(cookieParser());




const PORT =process.env.PORT;

app.use('/api/v1',UserRoutes);


app.listen(PORT,()=>{
    console.log(`The Server is running on PORT : ${PORT}`)
})

