import express from 'express';
import {generateInitialThemes, generateThemesFromResp} from '../newControllers/themeController';
var router = express.Router()

router.post('/generateInitialThemes', generateInitialThemes);
router.post('/generateThemesFromResp', generateThemesFromResp)

export default router;