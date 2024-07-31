import { Observable, Subject } from 'rxjs';

export type FocusRequestEventArgs =
  | {
      type: 'narrative';
    }
  | { type: 'thread'; id: string };

export class ShortcutManager {
  private static _instance: ShortcutManager | undefined = undefined;
  public static get instance(): ShortcutManager {
    if (this._instance == null) {
      this._instance = new ShortcutManager();
    }
    return this._instance!;
  }

  private readonly onFocusRequestedEventSubject =
    new Subject<FocusRequestEventArgs>();

  private constructor() {}

  public get onFocusRequestedEvent(): Observable<FocusRequestEventArgs> {
    return this.onFocusRequestedEventSubject;
  }

  public requestFocus(args: FocusRequestEventArgs) {
    this.onFocusRequestedEventSubject.next(args);
  }
}
