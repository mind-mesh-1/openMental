import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import { config } from 'dotenv';

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
        // {
        //   name: 'fetchNameForUserId',
        //   description: 'Fetches user name from the database for a given ID.',
        //   parameters: [
        //     {
        //       name: 'userId',
        //       type: 'string',
        //       description: 'The ID of the user to fetch data for.',
        //       required: true,
        //     },
        //   ],
        //   handler: async () => {
        //     return {
        //       name: 'Darth Doe',
        //     };
        //   },
        // },
        // {
        //   name: 'askArticle',
        //   description: 'answer any question on the paul graham essay',
        //   parameters: [
        //     {
        //       name: 'query',
        //       type: 'string',
        //       description:
        //         'The question to ask the LLM on the paul graham essay',
        //       required: true,
        //     },
        //   ],
        //   handler: async (payload: { query: string }) => {
        //     const { query } = payload;
        //     const response = await askArticle(query);
        //     return {
        //       response,
        //     };
        //   },
        // },

        {
          name: 'analyzeSources',
          description: 'Analyze active sources based on user questions',
          parameters: [
            {
              name: 'source_ids',
              type: 'string[]',
              description: 'The ids of the source to analyze',
              required: true,
            },
            {
              name: 'question',
              type: 'string',
              description: 'The question to ask the LLM on the source',
              required: true,
            },
          ],

          handler: async ({ source_ids, question }) => {
            console.log('copilot run time', source_ids, question);
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
