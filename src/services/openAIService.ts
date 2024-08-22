import OpenAI from 'openai';
import { config } from '../config';

export class OpenAIService {
    private openai: OpenAI;
    private systemPrompt: string;

    constructor(systemPrompt: string) {
        this.openai = new OpenAI({
            apiKey: config.openaiApiKey,
        });
        this.systemPrompt = systemPrompt;
    }

    async generateResponse(userPrompt: string, maxTokens?: number): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini", // Specify the model
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: maxTokens,

            //   temperature: 0.7, // Control the randomness of the response
            // seed: 0, // Seed value for random number generation
            // n: 1, // Number of completions to generate
            // max_tokens: 60, // Maximum number of tokens to generate

        });

        return response.choices[0]?.message?.content?.trim() || "No response";
    }
}
