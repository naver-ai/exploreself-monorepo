import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const signedInAdminUserMiddleware = async (
  req: Request,
  res: Response,
  next
) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.AUTH_SECRET);
      try {
        if (decoded.sub == process.env['ADMIN_ID']) {
          next();
        }
      } catch (err) {
        res.status(400).send('WrongCredential' + err);
      }
    }
  } catch (err) {
    res.status(400).send('No auth header provided.' + err);
  }
   
};
