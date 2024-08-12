import { eventWithTime } from "@rrweb/types";
import { Http } from "../net/http";
import {Mutex} from 'async-mutex';

export class SessionRecordingManager{
    private static _instance: SessionRecordingManager | undefined = undefined;
    public static get instance(): SessionRecordingManager {
      if (this._instance == null) {
        this._instance = new SessionRecordingManager();
      }
      return this._instance!;
    }
  
    private readonly uploadTaskMutex = new Mutex()

    private constructor() {

    }

    private _token: string | undefined = undefined
    private _sessionId: string | undefined = undefined
    private _isLogUploadingOn: boolean = false
    private _logUploadingInterval: number = 1000
    private _logUploadingTimeout : any | undefined = undefined

    private _eventQueue: Array<eventWithTime> = []

    public get currentSessionId(): string | undefined {
        return this._sessionId
    }

    pushEvent(event: eventWithTime){
        this._eventQueue.push(event)
    }

    async uploadLogs(): Promise<void>{
        if(this._eventQueue.length > 0){
            const eventsToUpload = this._eventQueue.slice()
            const body = {
                sessionId: this._sessionId,
                events: JSON.stringify(this._eventQueue)
            }

            this._eventQueue = []
            await this.uploadTaskMutex.runExclusive(() => {
                return Http.axios.post("/user/logs/upload", body, {headers: Http.makeSignedInHeader(this._token!)}).catch(ex => {
                    console.log(ex)
                    this._eventQueue = [...eventsToUpload, ...this._eventQueue]
                    return
                })
            })
            console.log("Upload complete")
        }
    }

    startLogUploading(token: string, sessionId: string, interval: number = 1000){
        if(this._isLogUploadingOn == false){
            this._isLogUploadingOn = true
            this._token = token
            this._sessionId = sessionId
            this._logUploadingInterval = interval
            this._logUploadingTimeout = setInterval(()=>{
                this.uploadLogs().then()
            }, this._logUploadingInterval)
        }
    }

    stopLogUploading(){
        if(this._isLogUploadingOn){
            this.uploadLogs().finally(()=>{
                this._eventQueue = []
            })

            this._isLogUploadingOn = false
            this._token = undefined
            this._sessionId = undefined
            if(this._logUploadingTimeout != null){
                clearInterval(this._logUploadingTimeout)
            }
        }
    }
}