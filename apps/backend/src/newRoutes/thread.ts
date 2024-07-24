import express from 'express';
import {saveThreadItem, createThreadItem, getThreadList, getThreadData, getThreadTitleList, synthesizeThread, saveSynthesized} from '../newControllers/threadController';
var router = express.Router()

router.post('/saveThreadItem', saveThreadItem);
router.post('/createThreadItem', createThreadItem);
router.post('/getThreadList', getThreadList);
router.post ('/getThreadData', getThreadData);
router.post('/getThreadTitleList', getThreadTitleList)
router.post('/synthesizeThread', synthesizeThread)
router.post('/saveSynthesized', saveSynthesized)

export default router;

