import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface ResponseMessage {
    jsonMessage: string | null;
    refusal: string | null;
    finishReason: string;
}

export class OpenAIService {
    private openai: OpenAI;
    private systemPrompt: string;

    constructor(systemPrompt: string) {
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey,
        });
        this.systemPrompt = systemPrompt;
    }

    async generateResponse(userPrompt: string, maxTokens?: number): Promise<ResponseMessage | null> {

        // do not use openai.completions.create, and use Chat Completion API instead

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: maxTokens,
            response_format: { type: "json_object" },

            // temperature: 0.7, // Control the randomness of the response
            // seed: 0, // Seed value for random number generation
            // n: 1, // Number of completions to generate
            // max_tokens: 60, // Maximum number of tokens to generate

        });

        if (response.choices.length != 1) {
            logger.error('response.choices.length: ', response.choices.length);
            return null;
        }

        // if refusal message is present
        if (response.choices[0].message?.refusal) {
            logger.error('refusal: ', response.choices[0].message.refusal);
            logger.error('message: ', response.choices[0].message);
        }

        if (response.choices[0].finish_reason !== "stop") {
            logger.error('finish_reason: ', response.choices[0].finish_reason);
        }

        return {
            jsonMessage: response.choices[0].message?.content?.trim() || null,
            refusal: response.choices[0].message?.refusal || null,
            finishReason: response.choices[0].finish_reason,
        };
    }
}
