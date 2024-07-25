import express from 'express';
import {saveResponse, generateKeywords, generateSentences, getScaffoldingQuestions, saveOrientingInput, getThemeScaffoldingKeywords} from '../newControllers/responseController';
var router = express.Router()

router.post('/saveResponse', saveResponse);
router.post('/generateKeywords', generateKeywords);
router.post('/generateSentences', generateSentences);
router.post('/getScaffoldingQuestions', getScaffoldingQuestions);
router.post('/saveOrientingInput', saveOrientingInput);
router.post('/getThemeScaffoldingKeywords', getThemeScaffoldingKeywords)

export default router;

