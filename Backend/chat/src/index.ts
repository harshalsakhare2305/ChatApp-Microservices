import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import ChatRoutes from './routes/chat.js'



const app =express();

dotenv.config();

connectDb();

app.use(express.json());

app.use('/api/v1',ChatRoutes);





app.listen(process.env.PORT,()=>{
    console.log(`Server is Running on PORT : ${process.env.PORT} `);
})