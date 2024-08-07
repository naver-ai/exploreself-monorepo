import { Request, Response } from 'express';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import mongoose from 'mongoose';

export const signedInAdminUserMiddleware = [
  expressjwt({
    secret: process.env.AUTH_SECRET,
    algorithms: ['HS256'],
  }),
  async (req: JWTRequest, res: Response, next) => {
    if (req.auth) {
      if (req.auth.sub == process.env['ADMIN_ID']) {
        next();
      } else {
        res.status(400).send('WrongCredential');
      }
    } else {
      res.status(400).send('No auth header provided.');
    }
  },
];
