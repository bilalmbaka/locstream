import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { AIChat } from 'src/domain/models/ai_chat.model';
import { AIChatDTO } from 'src/domain/dtos/ai_dto';
import axios from 'axios';

@Injectable()
export class AiService {
    private readonly client = new GoogleGenAI({ apiKey: process.env.AI_KEY });

    private systemInstructions =
        'You are the core, omni-capable AI assistant for a real-time mobile application. ' +
        'Your job is to act as a conversational interface that helps users perform any action ' +
        'available within the application.\n\n' +
        'CRITICAL RULES:\n' +
        '1. Your functional capabilities are strictly and dynamically defined by the tools provided in your tools list. ' +
        'This includes, but is not limited to: live location sharing, contact searching, permission toggles, profile picture updates, and account functions like logging out.\n' +
        '2. You must never state or imply that an action has been successfully executed or that user data has been changed ' +
        'unless the corresponding backend tool returns a successful confirmation response.\n' +
        '3. If a user requests a change or feature for which you currently have no tool, politely explain that the action is not supported via chat.';

    private changeProfilePictureFunction = {
        type: 'function' as const,
        name: 'update_user_profile',
        description: 'Updates a user profile',
        parameters: {
            type: 'object' as const,
            properties: {
                authToken: { type: 'string' as const, description: 'The auth token' },
                userName: {
                    type: 'string' as const,
                    description: 'UserName (e.g., "jhondoe")',
                    constraints: ['minimum length of 5'],
                },
                currentLocation: {
                    type: 'object' as const,
                    description: 'currentLocation (e.g., "{ lat: 1.2345, lng: 0.14455, }")',
                },
            },
            required: ['authToken'],
        },
    };

    async chat(accessToken: string, dto: AIChatDTO): Promise<AIChat> {
        const tools = [this.changeProfilePictureFunction];

        const interaction = await this.client.interactions.create({
            model: 'gemini-3-flash-preview',
            system_instruction: this.systemInstructions,
            input: `${dto.message} authorization header is ${accessToken}`,
            tools: tools,
        });

        console.log(`interaction response ${JSON.stringify(interaction)}`);

        for (const step of interaction.steps) {
            if (step.type === 'function_call') {
                console.log(`Function to call: ${step.name}`);
                console.log(`Arguments: ${JSON.stringify(step.arguments)}`);

                if (step.name === 'update_user_profile') {
                    const { authToken, ...body } = step.arguments;

                    console.log('attempting to update user profile');

                    const response = await axios.patch(
                        'http://localhost:3001/api/v1/user/update-profile',
                        body,
                        {
                            headers: {
                                Authorization: authToken,
                            },
                        },
                    );

                    const message = JSON.stringify(response.data);

                    console.log('profile update picture response ', message);

                    console.log('attempting to consume final interaction');

                    const finalInteraction = await this.client.interactions.create({
                        model: 'gemini-3-flash-preview',
                        input: [
                            {
                                type: 'function_result',
                                name: step.name,
                                call_id: step.id,
                                result: [{ type: 'text', text: message }],
                            },
                        ],
                        tools: tools,
                        previous_interaction_id: interaction.id,
                    });

                    console.log(`final interaction response ${JSON.stringify(finalInteraction)}`);

                    return {
                        message: finalInteraction.output_text || 'No response message generated.',
                    };
                }
            }
        }

        return {
            message: interaction.output_text || 'No response message generated.',
        };
    }
}
