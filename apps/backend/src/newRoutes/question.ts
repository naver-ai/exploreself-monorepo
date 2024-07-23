import express from 'express';
import {generateInitialThemes, generateSocraticQuestionController, generateOrientincQuestionsController} from '../newControllers/questionController';
var router = express.Router()

router.post('/generateInitialThemes', generateInitialThemes);
router.post('/generateSocratic', generateSocraticQuestionController);
router.post('/generateOrienting', generateOrientincQuestionsController)

export default router;

 