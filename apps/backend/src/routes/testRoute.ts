import express from 'express';
import generateThemesMiddleware from "../middlewares/generateThemesMiddleware";
import hcxChatCompMiddleware from '../middlewares/hcxChatCompMiddleware';
import hcxCompMiddleware from '../middlewares/hcxCompMiddleware';

var router = express.Router()

router.get('/generateThemes', generateThemesMiddleware)
router.post('/hcxChatComp', hcxChatCompMiddleware)
router.post('/hcxComp', hcxCompMiddleware)

export default router;