import express from 'express';
import { ThreadItem, User, QASet } from '../config/schema';
import synthesizeSession from '../utils/old/synthesizeSession';
import { RequestWithUser } from './middlewares';
import { signedInUserMiddleware } from './middlewares';
import generateQuestions from '../utils/generateQuestions';
import { body } from 'express-validator';

var router = express.Router();

const saveThreadItem = async (req, res) => {
  const tid = req.body.tid;
  const question = req.body.question;
  const scaffoldingData = req.body.scaffoldingData;
  const response = req.body.response;
  try {
    await ThreadItem.findByIdAndUpdate(tid, {
      $set: {
        question: question,
        // scaffoldingData: scaffoldingData,
        response: response,
      },
    });
    res.json({
      success: true,
    });
  } catch (err) {
    res.json({
      success: false,
      err: err.message,
    });
  }
};

const getOrientingInput = async (req, res) => {
  const tid = req.body.tid;
  try {
    const thread = await ThreadItem.findById(tid);

    //TODO fix orientingInput error
    res.json({
      //orientingInput: thread.orientingInput
    });
  } catch (err) {
    res.json({
      err: err.message,
    });
  }
};

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

const synthesizeThread = async (req: RequestWithUser, res) => {
  const user = req.user;
  const uid = user._id;
  const tid = req.body.tid;

  console.log('THREaddata: ', tid);
  try {
    const synthesizedData = await synthesizeSession(tid, uid);
    res.json({
      synthesized: synthesizedData,
    });
  } catch (err) {
    res.json({
      err: err.message,
    });
  }
};

const saveSynthesized = async (req, res) => {
  const synthesized = req.body.synthesized;
  const tid = req.body.tid;
  try {
    await ThreadItem.findByIdAndUpdate(tid, {
      $set: {
        synthesized: synthesized,
      },
    });
    res.json({
      success: true,
    });
  } catch (err) {
    res.json({
      success: false,
      err: err.message,
    });
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

router.post('/saveThreadItem', signedInUserMiddleware, saveThreadItem);

router.post('/synthesizeThread', signedInUserMiddleware, synthesizeThread);
router.post('/saveSynthesized', signedInUserMiddleware, saveSynthesized);
router.post('/getOrientingInput', signedInUserMiddleware, getOrientingInput);

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
