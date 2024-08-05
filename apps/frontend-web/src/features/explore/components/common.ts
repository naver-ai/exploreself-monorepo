import { ShortcutManager } from '../../../services/shortcut';

export function focusToThread(tid: string) {
  requestAnimationFrame(() => {
    ShortcutManager.instance.requestFocus({
      id: tid,
      type: 'thread',
    });
  });
}

export const POPULATE_NEW_THREAD_OPTS = {
  onThreadCreated: focusToThread,
  onQuestionsGenerated: focusToThread,
};
