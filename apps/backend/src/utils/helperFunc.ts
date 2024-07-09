import { HistoryItem, Question, Answer } from "../config/schema";

const processHistory = async(history, res) => {
  if (history.length === 0) {
    return []
  }
  const history_log = [];
  for (const historyItem of history) {
    const hItemId = historyItem._id;
    const hItem = await HistoryItem.findById(hItemId);
    if (!hItem) {
      console.log("hItem not found");
      return res.send({ error: "History item not found" });
    }

    const qid = historyItem.question;
    const aid = historyItem.answer;
    const qItem = await Question.findById(new qid);
    const aItem = await Answer.findById(aid);
    
    if (!qItem) {
      console.log("qItem not found");
      return res.send({ error: "Question not found" });
    }
    
    if (!aItem) {
      console.log("aItem not found");
      return res.send({ error: "Answer not found" });
    }
    
    history_log.push(`Question: ${qItem.content}, User's answer: ${aItem.content}\n`);
  }

  return history_log
}

export {processHistory}