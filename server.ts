import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import { config } from 'dotenv';
import { askArticle } from '@/app/controllers/core';

config();

const serviceAdapter = new OpenAIAdapter();

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  console.log('request', req.url, req.method, req.headers);

  const runtime = new CopilotRuntime({
    // remoteActions: (
    //
    // ) => {
    //   return [];
    // },

    actions: () => {
      return [
        {
          name: 'fetchNameForUserId',
          description: 'Fetches user name from the database for a given ID.',
          parameters: [
            {
              name: 'userId',
              type: 'string',
              description: 'The ID of the user to fetch data for.',
              required: true,
            },
          ],
          handler: async () => {
            return {
              name: 'Darth Doe',
            };
          },
        },
        {
          name: 'askArticle',
          description: 'answer any question on the paul graham essay',
          parameters: [
            {
              name: 'query',
              type: 'string',
              description:
                'The question to ask the LLM on the paul graham essay',
              required: true,
            },
          ],
          handler: async (payload: { query: string }) => {
            const { query } = payload;
            const response = await askArticle(query);
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
