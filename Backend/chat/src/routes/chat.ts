import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';
import { CreatenewChat, getAllChats,getMessagesByChat,SendMessage } from '../controllers/chat.js';
import {upload} from '../middlewares/multer.js'


const router =express.Router();

router.post('/createchat',isAuth,CreatenewChat);

router.get('/getchats',isAuth,getAllChats);

router.post("/message",isAuth,upload.single('image'),SendMessage)

router.get("/message/:chatId",isAuth,getMessagesByChat);

export default router;