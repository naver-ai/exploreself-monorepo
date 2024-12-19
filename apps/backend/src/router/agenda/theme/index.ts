import express from 'express';
import { ThreadItem, QASet } from '../../../config/schema';
import { assertThemeIdParamMiddleward, RequestWithAgenda } from '../../middlewares';
import generateQuestions from '../../../utils/generateQuestions';
import { body, validationResult } from 'express-validator';
import questionRouter from './question'
import generateThemes from 'apps/backend/src/utils/generateThemes';

const router = express.Router();

router.post(
  '/new',
  body('theme').exists(),
  async (req: RequestWithAgenda, res) => {

    const validationErrors = validationResult(req)
    if(validationErrors.isEmpty()){
      const newThreadItem = new ThreadItem({
        aid: req.agenda._id,
        theme: req.body.theme,
      });

      const newThread = await newThreadItem.save();
      req.agenda.threads.push(newThread._id)
      await req.agenda.save()

      res.json(newThread.toJSON());
    }else{
      res.status(400).send("No valid theme in body.")
    }
  }
);



router.post('/recommendation', body('prevThemes').optional().isArray(), body('opt').optional(), async (req: RequestWithAgenda, res) => {
  const validationErrors = validationResult(req)
  
  if(validationErrors.isEmpty()){
    const prevThemes = req.body.prevThemes
    const opt = req.body.opt
    try {
      const themes = await generateThemes(req.user, req.agenda, prevThemes, opt)
      console.log(themes)
      res.json({
        themes: themes
      })
    } catch (err) {
      res.json({
        err: err.message
      })
    }
  }else{
    res.send(400).json(validationErrors.array())
  }
})

router.post('/:tid/populate', async (req: RequestWithAgenda, res) => {
  const tid = req.params.tid;
  try {
    const thread = await ThreadItem.findById(tid);
    if (thread?.questions.length == 0 || !thread.questions) {
      console.log('generate three questions....');
      const questions = await generateQuestions(req.user, req.agenda, thread, 3);
      const qaPromises = questions.map(async (question, index) => {
        const newQASet = new QASet({
          tid: tid,
          question: { content: question.question },
          selected: false,
        });
        return newQASet.save();
      });
      const savedQASets = await Promise.all(qaPromises);
      const qaSetIds = savedQASets.map((qa) => qa._id);

      console.log('Generated questions');

      const updatedThread = await ThreadItem.findByIdAndUpdate(
        tid,
        { $push: { questions: { $each: qaSetIds } } },
        { new: true }
      );

      console.log(updatedThread);

      return res.json({
        threadData: updatedThread,
      });
    }
    return res.json({
      threadData: thread,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error fetching thread data' + err });
  }
});

router.use("/:tid/questions", assertThemeIdParamMiddleward, questionRouter)

export default router;
