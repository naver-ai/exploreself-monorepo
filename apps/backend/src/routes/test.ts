import express from 'express';
import testMiddleware from "../middlewares/testMiddleware";

var router = express.Router()

router.get('/', testMiddleware)

export default router;