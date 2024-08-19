import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import jwt from 'jsonwebtoken';
import { signedInAdminUserMiddleware } from './middleware';
import bcrypt from 'bcrypt';
import path from 'path';
import dotenv from 'dotenv';
import { Interaction, User } from '../../config/schema';

const router = express.Router();

router.get('/all', query('exclude').optional().isArray(), async (req, res) => {
    const exclude: Array<string> = req.query.exclude || [];
    console.log("exclude: ", exclude)
    const users = (await User.find({ _id: { $not: { $in: exclude } } }).populate(
        {
            path: 'threads',
            populate: {
                path: 'questions',
            },
        }
    )).map(user => user.toJSON())

    const interactionLogs = (await Interaction.find({user:{$not: {$in: exclude}}})).map(log => log.toJSON())

    res.json({users, logs: interactionLogs})
});



export default router;
