import { ThreadItem } from "../../config/schema"
import synthesizeProfilicInfo from "../synthesizeProfilicInfo";
import { User } from "../../config/schema";
import mongoose from 'mongoose'

const synthesizePrevInput = async (uid: mongoose.Types.ObjectId) => {

  const userInfo = await User.findById(uid)
  if (!userInfo){
    console.log("Err in fetching user")
  }
  const synthesizedProfilic = synthesizeProfilicInfo(userInfo.initial_narrative, userInfo.value_set, userInfo.background);
  const threads = userInfo.threads
  const synthesizedThreadList = await ThreadItem.find({_id: {$in: threads}}).select('synthesized')
  if (!synthesizedThreadList){
    console.log("Err in fetching synthesizedThreadList")
  }
  const previous_input = 
  `----previous input start----
  [Initial information]\n
  "${synthesizedProfilic}"\n` + 
  synthesizedThreadList.map((item, index) => {
    if(item.synthesized && item.synthesized.length > 0){
      return `[Session]\n
    "${item.synthesized}"
    `
    }
  }) + 
  `\n----previous input end----`

  return previous_input
}

export default synthesizePrevInput;