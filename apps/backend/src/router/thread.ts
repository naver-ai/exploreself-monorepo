import express from 'express';
import { ThreadItem, User, QASet } from '../config/schema';
import { RequestWithUser } from './middlewares';
import { signedInUserMiddleware } from './middlewares';
import generateQuestions from '../utils/generateQuestions';
import { body } from 'express-validator';
import { synthesizeThread } from '../utils/synthesizeThread';

const router = express.Router();


const getThreadData = async (req: RequestWithUser, res) => {
  const uid = req.user._id;
  const tid = req.params.tid;
  try {
    const thread = await ThreadItem.findById(tid);
    if (thread?.questions.length == 0 || !thread.questions) {
      console.log('generate questions....');
      const questions = await generateQuestions(uid, tid, 3);
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
};



router.post(
  '/new',
  signedInUserMiddleware,
  body('theme').exists(),
  async (req: RequestWithUser, res) => {
    const user = req.user;
    const uid = user._id;

    const newThreadItem = new ThreadItem({
      uid: uid,
      theme: req.body.theme,
    });

    const newThread = await newThreadItem.save();
    await User.findByIdAndUpdate(uid, { $push: { threads: newThread._id } });
    res.json(newThread.toJSON());
  }
);

router.get('/:tid', signedInUserMiddleware, getThreadData);

router.post(
  '/:tid/questions/generate',
  signedInUserMiddleware,
  async (req: RequestWithUser, res) => {
    const uid = req.user._id;
    const tid = req.params.tid;
    try {
      const thread = await ThreadItem.findById(tid);
      if (thread?.questions.length == 0 || !thread.questions) {
        console.log('generate questions....');
        const questions = await generateQuestions(uid, tid, 3);
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

        await ThreadItem.findByIdAndUpdate(tid, {
          $push: { questions: { $each: qaSetIds } },
        });

        res.json({
          questions: savedQASets,
        });
        return;
      } else {
        res.json({
          questions: [],
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Error fetching thread data' + err });
    }
  }
);

export default router;
