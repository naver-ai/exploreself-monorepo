import express from 'express';
import generateThemesMiddleware from "../middlewares/generateThemesMiddleware";
import executeHCXMiddleware from '../middlewares/executeHCXMiddleware';

var router = express.Router()

router.get('/generateThemes', generateThemesMiddleware)
router.post('/executeHCX', executeHCXMiddleware)

export default router;