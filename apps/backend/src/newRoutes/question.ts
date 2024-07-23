import express from 'express';
import {generateInitialThemes, generateQuestions} from '../newControllers/questionController';
var router = express.Router()

router.post('/generateInitialThemes', generateInitialThemes);
router.post('/generateQuestions', generateQuestions);

export default router;

 