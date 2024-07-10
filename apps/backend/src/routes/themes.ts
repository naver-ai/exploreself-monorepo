import express from 'express';
import { generateThemes, saveTheme, activateTheme, deActivateTheme } from '../controllers/themeController';
var router = express.Router()

router.get('/generateThemes', generateThemes)
router.post('/saveTheme', saveTheme)
router.post('/activateTheme', activateTheme)
router.post('/deActivateTheme', deActivateTheme)

