import express from 'express'
import dotenv from 'dotenv'
import { startSendotpConsumer } from './consumer.js';



const app = express();

dotenv.config();


startSendotpConsumer();


app.listen(process.env.PORT,()=>{
    console.log(`The mail Server is running on PORT: ${process.env.PORT}`);
});


