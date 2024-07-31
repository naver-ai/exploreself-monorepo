import axios from 'axios';
import {CompletionRequest} from '../../config/interface'
import dotenv from 'dotenv';
dotenv.config();

class hcxCompExecutor {
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

    async execute(completionRequest: CompletionRequest): Promise<any> {
      console.log("API: ", this.apiKey)
        const headers = {
            'X-NCP-CLOVASTUDIO-API-KEY': this.apiKey,
            'X-NCP-APIGW-API-KEY': this.apiKeyPrimaryVal,
            // 'X-NCP-CLOVASTUDIO-REQUEST-ID': this.requestId,
            'Content-Type': 'application/json; charset=utf-8',
        };

        try {
            const response = await axios.post(
                `${this.host}/testapp/v1/completions/LK-D2`,
                completionRequest,
                {headers}
            );

            const result = {
                inputText: response.data.result.inputText,
                outputText: response.data.result.outputText
            }

            return result
        } catch (error) {
            console.error('Error executing request', error);
        }
    }
}

export default hcxCompExecutor;
