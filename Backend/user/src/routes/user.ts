import express from 'express'
import { loginUser, VerifuUser } from '../controllers/user.js';

const router =express.Router();


router.post('/login',loginUser);

router.post('/verify',VerifuUser);


export default router;