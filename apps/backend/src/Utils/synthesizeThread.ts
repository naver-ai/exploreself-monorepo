import { ThreadItem, User } from "../config/schema"
import nunjucks from 'nunjucks'

const synthesizeThread = async (tid: string) => {
  const threadItem = await ThreadItem.findById(tid).populate('questions')
  
  const synthesis = nunjucks.renderString(`
  Theme: {{theme}}\n
  {% for set in questions%}
  Q: {{set.question.content}}\n
  A: {{set.response}}\n
  {% else %}
  The session doesn't have log yet. \n
  {% endfor %}
  `,{theme: threadItem.theme, questions: threadItem.questions})

  return synthesis
}

const synthesizePrevThreads = async (uid: string) => {
  const user = await User.findById(uid);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const threadRefs = user.threadRef;
  if (threadRefs.length) {
    const syntheses = await Promise.all(threadRefs.map(async (ref) => {
      return synthesizeThread(ref.toString());
    }));
    
    return syntheses.join();
  } else {
    return ''
  }
}

export default synthesizePrevThreads;