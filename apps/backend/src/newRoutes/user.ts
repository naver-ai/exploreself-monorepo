import express from 'express';
import {getUserInfo, setInitialNarrative, setValueSet, setBackground} from '../newControllers/userInfoController';
var router = express.Router()

router.get('/getUserInfo', getUserInfo);
router.post('/setInitialNarrative', setInitialNarrative)
router.post('/setValueSet', setValueSet)
router.post('setBackground', setBackground)


export default router;

