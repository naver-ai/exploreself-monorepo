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
      console.log(decoded, process.env['ADMIN_ID'])
      try {
        if (decoded.sub == process.env['ADMIN_ID']) {
          console.log("Admin password check passed")
          next();
        }else throw "WrongCredential"
      } catch (err) {
        res.status(400).send('WrongCredential' + err);
      }
    }
  } catch (err) {
    res.status(400).send('No auth header provided.' + err);
  }
   
};
