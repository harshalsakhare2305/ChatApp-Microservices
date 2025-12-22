import express from 'express'
import { getAllUser, getAUser, getmyProfile, loginUser, Updatename, VerifuUser } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';

const router =express.Router();


router.post('/login',loginUser);

router.post('/verify',VerifuUser);

router.get('/me',isAuth,getmyProfile);

router.get('/user/all',isAuth,getAllUser);

router.get('/user/:id',getAUser);

router.post('/update/user',isAuth,Updatename);


export default router;