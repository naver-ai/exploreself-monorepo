import express from 'express';
import { assertAgendaIdParamMiddleware, RequestWithAgenda, RequestWithUser, signedInUserMiddleware } from '../middlewares';
import { AgendaItem, User } from '../../config/schema';
import { body, validationResult } from 'express-validator';
import { generateSummary, generateTitleFromNarrative, mapSummaryToQIDs } from '../../utils/summary';
import { InteractionType, SessionStatus } from '@core';
import { logInteraction } from '../../utils/logInteraction';
import themeRouter from './theme'

const router = express.Router();

/*
router.get("/all", signedInUserMiddleware, async (req: RequestWithUser, res) => {
    const uid = req.user._id
    try{
        const agendas = (await AgendaItem.find({
            uid: uid,
            deleted: {$ne: true}
        })).map(doc => doc.toJSON())
        res.status(200).send({
            agendas
        })
    }catch (err) {
        res.status(500).send(err)
    }
})*/

router.get(
  '/:aid',
  signedInUserMiddleware,
  async (req: RequestWithUser, res) => {
    const uid = req.user._id;
    const aid = req.params.aid;

    try {
      const agenda = await AgendaItem.findOne({ _id: aid, uid: uid }).populate({
        path: 'threads',
        populate: {
          path: 'questions',
        },
      });
      res.json({
        agenda: agenda.toJSON(),
      });
    } catch (ex) {
      return res
        .status(500)
        .json({ message: `Error fetching agenda data ${aid}` + ex });
    }
  }
);

router.post(
  '/new',
  signedInUserMiddleware,
  body('narrative').isString().notEmpty(),
  async (req: RequestWithUser, res) => {
    const uid = req.user._id;

    const validationErrors = validationResult(req);
    if (validationErrors.isEmpty()) {
      // Create a new agenda item and return the object
      const initialNarrative: string = req.body.narrative;

      const title: string = await generateTitleFromNarrative(
        req.user,
        initialNarrative
      );

      const newAgenda = await new AgendaItem({
        uid: uid,
        initialNarrative,
        title,
      }).save();

      await User.findByIdAndUpdate(uid, { $push: { agendas: newAgenda._id } });

      res.json({
        agenda: newAgenda.toJSON(),
      })
    } else {
      res.send(400).send('InvalidNarrative');
    }
  }
);

router.post(
    '/:aid/pin',
    signedInUserMiddleware,
    body('theme').exists().trim(),
    async (req: RequestWithUser, res) => {
      const updatedAgenda = await AgendaItem.findOneAndUpdate(
        {_id: req.params.aid, uid: req.user._id},
        { $addToSet: { pinnedThemes: req.body.theme } },
        { new: true }
      );

      res.json({
        pinnedThemes: updatedAgenda.pinnedThemes,
      });
    }
  );
  
  router.post(
    '/:aid/unpin',
    signedInUserMiddleware,
    body('theme').exists().trim(),
    body("intentional").exists().isBoolean().toBoolean(),
    async (req: RequestWithUser, res) => {
      const updatedAgenda = await AgendaItem.findOneAndUpdate(
        {_id: req.params.aid, uid: req.user._id},
        { $pull: { pinnedThemes: req.body.theme } },
        { new: true }
      );
  
      if(req.body.intentional){
          //This is the case when the user unpinned a theme deliberately.
      }else{
          //This is the case when the system unpinned a theme; such as when generating a thread from the theme.
      }
  
      res.json({
        pinnedThemes: updatedAgenda.pinnedThemes,
      });
    }
  );

router.post(
  '/:aid/debriefing',
  signedInUserMiddleware,
  body('debriefing').exists().trim(),
  async (req: RequestWithUser, res) => {
    const debriefing = req.body.debriefing;

    const updatedAgenda = await AgendaItem.findOneAndUpdate({
        _id: req.params.aid,
        uid: req.user._id
    }, {
        debriefing
    })

    res.json({
      debriefing: updatedAgenda.debriefing
    });
  }
);

router.put(
  '/:aid/status',
  signedInUserMiddleware,
  body('status').exists().isIn(Object.keys(SessionStatus)),
  async (req: RequestWithUser, res) => {
    const newStatus = req.body.status;

    const agenda =  await AgendaItem.findOne({
        _id: req.params.aid,
        uid: req.user._id
    })
    const oldStatus = agenda.sessionStatus

    const updateResult = await AgendaItem.updateOne({
        _id: req.params.aid,
        uid: req.user._id
    }, {
        sessionStatus: newStatus
    })

    if(updateResult.modifiedCount > 0){
        await logInteraction(
            req.user,
            req.browserSessionId,
            InteractionType.UserChangeSessionStatus,
            { from: oldStatus, to: newStatus },
            undefined,
            Date.now()
          );
    }

    res.json({
      sessionStatus: newStatus,
    });
  }
);

router.post(
  '/:aid/terminate',
  signedInUserMiddleware,
  body('debriefing').optional().isString().trim(),
  async (req: RequestWithUser, res) => {
    const timestamp = Date.now();

    const debriefing = req.body.debriefing;

    const update = {} as any

    if (req.body.debriefing !== undefined) {
      update.debriefing = debriefing;
    }

    update.sessionStatus = SessionStatus.Terminated;

    const updatedAgenda = await AgendaItem.findOneAndUpdate({_id: req.params.aid, uid: req.user._id}, update, {new: true})

    await logInteraction(
      req.user,
      req.browserSessionId,
      InteractionType.UserTerminateExploration,
      { debriefing: updatedAgenda.debriefing },
      undefined,
      timestamp
    );

    res.json({
      debriefing: updatedAgenda.debriefing,
      sessionStatus: updatedAgenda.sessionStatus,
    });
  }
);

router.post(
  '/:aid/revert_terminate',
  signedInUserMiddleware,
  async (req: RequestWithUser, res) => {
    const timestamp = Date.now();

    await AgendaItem.updateOne({_id: req.params.aid, uid: req.user._id}, {
        sessionStatus: SessionStatus.Reviewing
    })

    await logInteraction(
      req.user,
      req.browserSessionId,
      InteractionType.UserRevertTermination,
      {},
      undefined,
      timestamp
    );

    res.json({
      sessionStatus: SessionStatus.Reviewing
    });
  }
);


router.put('/:aid/summarize', assertAgendaIdParamMiddleware, async(req: RequestWithAgenda, res) => {
  const user = req.user;
  try {
    const summary = await generateSummary(req.user, req.agenda)
    const mappings = await mapSummaryToQIDs(req.agenda, summary);
    req.agenda.summaries.push(summary)
    await req.agenda.save()
    // TODO: Add log interaction data
    res.json({summaryMappings: mappings})
  } catch (err) {
    res.json({
      err: err.message
    })
  }
})

router.delete(
  '/:aid',
  signedInUserMiddleware,
  async (req: RequestWithUser, res) => {
    const uid = req.user._id;
    const aid: string = req.params.aid;
    const updateResult = await AgendaItem.updateOne(
      {
        _id: aid,
        uid,
      },
      {
        deleted: true,
      }
    );

    if (updateResult.matchedCount == 0) {
      res.status(400).send('WrongParameter');
    } else {
      res.sendStatus(200);
    }
  }
);

router.use('/:aid/themes', assertAgendaIdParamMiddleware, themeRouter)


export default router;
