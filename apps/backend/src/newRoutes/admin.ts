import express from 'express';
import loginHandler from '../newControllers/adminController';
var router = express.Router()

router.post('/login', loginHandler);

export default router;

