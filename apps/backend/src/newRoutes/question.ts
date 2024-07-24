import express from 'express';
import {generateSocraticQuestionController, generateOrientincQuestionsController} from '../newControllers/questionController';
var router = express.Router()

router.post('/generateSocratic', generateSocraticQuestionController);
router.post('/generateOrienting', generateOrientincQuestionsController)

export default router;

 