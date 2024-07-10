import express from 'express';
import { hcxChatCompletion, hcxCompletion } from '../controllers/hcxController';
import dbTestController from '../controllers/dbTestController';
import { generateQuestion } from '../controllers/questionController';

var router = express.Router()

router.post('/hcxChatComp', hcxChatCompletion)
router.post('/hcxComp', hcxCompletion)
router.post('/dbTest', dbTestController)
router.post('/generateQuestion', generateQuestion)

export default router;