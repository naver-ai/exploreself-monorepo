import express from 'express';
import {generateInitialThemes, generateQuestions} from '../newControllers/questionController';
var router = express.Router()

router.get('/generateInitialThemes', generateInitialThemes);
router.post('/generateQuestions', generateQuestions);

export default router;

 