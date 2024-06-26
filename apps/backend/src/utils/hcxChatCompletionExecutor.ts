import axios from 'axios';
import {ChatCompletionRequest} from './interfaces'

class hcxChatcompletionExecutor {
    private host: string;
    private apiKey: string;
    private apiKeyPrimaryVal: string;
    // private requestId: string;

    constructor(host: string, apiKey: string, apiKeyPrimaryVal: string, requestId: string) {
        this.host = host;
        this.apiKey = apiKey;
        this.apiKeyPrimaryVal = apiKeyPrimaryVal;
        // this.requestId = requestId;
    }

    async execute(completionRequest: ChatCompletionRequest): Promise<void> {
        const headers = {
            'X-NCP-CLOVASTUDIO-API-KEY': this.apiKey,
            'X-NCP-APIGW-API-KEY': this.apiKeyPrimaryVal,
            // 'X-NCP-CLOVASTUDIO-REQUEST-ID': this.requestId,
            'Content-Type': 'application/json; charset=utf-8',
        };

        try {
            const response = await axios.post(
                `${this.host}/testapp/v1/chat-completions/HCX-003`,
                completionRequest,
                {headers}
            );

            return response.data.result
        } catch (error) {
            console.error('Error executing request', error);
        }
    }
}

export default hcxChatcompletionExecutor;
