import express from 'express';
import { getUserInfo } from '../controllers/userController';
var router = express.Router()

router.get('/getUserInfo', getUserInfo);

export default router;

