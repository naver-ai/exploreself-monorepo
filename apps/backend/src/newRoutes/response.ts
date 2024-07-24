import express from 'express';
import {saveResponse, generateKeywords, generateSentences, getScaffoldingQuestions, saveOrientingInput} from '../newControllers/responseController';
var router = express.Router()

router.post('/saveResponse', saveResponse);
router.post('/generateKeywords', generateKeywords);
router.post('/generateSentences', generateSentences);
router.post('/getScaffoldingQuestions', getScaffoldingQuestions);
router.post('/saveOrientingInput', saveOrientingInput);

export default router;

