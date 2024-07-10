import { Request, Response } from "express";
import { Question, HistoryItem } from "../config/schema";
import { uid } from "../config/config";
import { ObjectId } from "mongodb";
import { Error } from "mongoose";

const submitResponse = async (req: Request, res: Response) => {
  const question = req.body.question;
  const qid = question.qid;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(qid, {$set: {userAnswer: question.userAnswer}}).exec();

    if (!updatedQuestion){
      console.log('Error in updating question --- Q not found')
      return null;
    }

    // TODO: content of history item
    const newHistory = new HistoryItem({
      user: uid,
      question: qid,
      content: ''
    })

  } catch (err) {
    console.log("Error in updating question")
    throw err;
  }
}

const editResponse = (req: Request, res: Response) => {
  // TODO: implement
}



export {submitResponse, editResponse}