
import { uid } from "../config/config"
import { User } from "../config/schema";
import { Request, Response } from "express";

const getUserInfo = async (req: Request, res: Response) => {
  const user = await User.findById(uid)
  if (!user) {
    res.status(400).send("Couldn't find user");
  }

  res.json(user)
}

export {getUserInfo}