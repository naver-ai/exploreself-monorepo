import express from 'express';
import generateThemes from "../middlewares/generateThemesMiddleware";

var router = express.Router()

router.get('/generateThemes', generateThemes)

export default router;