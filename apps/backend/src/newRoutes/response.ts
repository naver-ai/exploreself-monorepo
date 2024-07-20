import express from 'express';
import {saveResponse, generateKeywords, generateSentences, breakDownQuestion} from '../newControllers/responseController';
var router = express.Router()

router.post('/saveResponse', saveResponse);
router.post('/generateKeywords', generateKeywords);
router.post('/generateSentences', generateSentences);
router.post('/breakDownQuestion', breakDownQuestion);

export default router;

