import express from 'express';
import {saveResponse, generateKeywords, generateSentences, getScaffoldingQuestions} from '../newControllers/responseController';
var router = express.Router()

router.post('/saveResponse', saveResponse);
router.post('/generateKeywords', generateKeywords);
router.post('/generateSentences', generateSentences);
router.post('/getScaffoldingQuestions', getScaffoldingQuestions);

export default router;

