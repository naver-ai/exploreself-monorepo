import express from 'express';
import {generateReflexiveQuestionsController, generateOrientincQuestionsController} from '../newControllers/questionController';
var router = express.Router()

router.post('/generateReflexive', generateReflexiveQuestionsController);
router.post('/generateOrienting', generateOrientincQuestionsController)

export default router;

 