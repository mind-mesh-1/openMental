import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import { config } from 'dotenv';
import { askArticle } from './scripts/core';

// Load environment variables from .env file
config();

const serviceAdapter = new OpenAIAdapter();

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const runtime = new CopilotRuntime({
        actions: ({ properties, url }) => {
            return [
                {
                    name: "fetchNameForUserId",
                    description: "Fetches user name from the database for a given ID.",
                    parameters: [
                        {
                            name: "userId",
                            type: "string",
                            description: "The ID of the user to fetch data for.",
                            required: true,
                        },
                    ],
                    handler: async (userId: string) => {
                        return {
                            name: "Darth Doe",
                        };
                    },
                },
                {
                    name: "askArticle",
                    description: "Summarizes the key points of a given essay using function",
                    parameters: [

                    ],
                    handler: async () => {
                        console.log();
                        const response = await askArticle();
                        return {
                            response,
                        };
                    },
                },
            ];
        },
    });

    const handler = copilotRuntimeNodeHttpEndpoint({
        endpoint: '/copilotkit',
        runtime,
        serviceAdapter,
    });

    return handler(req, res);
});

server.listen(4000, () => {
    console.log('Listening at http://localhost:4000/copilotkit');
});