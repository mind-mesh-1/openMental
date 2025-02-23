import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  OpenAIAdapter,
} from '@copilotkit/runtime';
import { NextRequest } from 'next/server';

const RUNTIME_URL = process.env.NEXT_PUBLIC_COPILOT_RUNTIME_ENDPOINT;

const serviceAdapter = new OpenAIAdapter();
const runtime = new CopilotRuntime({
  // remoteActions: (
  //
  // ) => {
  //   return [];
  // },

  actions: () => {
    return [
      // {
      //   name: 'analyzeSources',
      //   description:
      //     'Analyze active sources based on user questions, and includes number of citations',
      //   parameters: [
      //     {
      //       name: 'source_ids',
      //       type: 'string',
      //       description: 'The ids of the source to analyze',
      //       required: true,
      //     },
      //     {
      //       name: 'question',
      //       type: 'string',
      //       description: 'The question to ask the LLM on the source',
      //       required: true,
      //     },
      //   ],
      //
      //   handler: async ({ source_ids, question }) => {
      //     console.log(
      //       'COPILOT RUNTIME',
      //       'analyzeSources',
      //       source_ids,
      //       question
      //     );
      //
      //     const sourceIdsArray = source_ids.split(',');
      //
      //     const idx = new KnowledgeIndex('sources');
      //
      //     const engineResponse = await idx.queryDocuments(
      //       sourceIdsArray,
      //       question
      //     );
      //
      //     console.log(
      //       engineResponse.metadata,
      //       engineResponse.sourceNodes?.length
      //     );
      //     console.log('response', engineResponse);
      //     return engineResponse;
      //   },
      // },
      //
      // {
      //   name: 'summarizeSource',
      //   description:
      //     'Summarize the active source and include the number of citations',
      //   parameters: [
      //     {
      //       name: 'source_id',
      //       type: 'string',
      //       description: 'The id of the source to summarize',
      //       required: true,
      //     },
      //   ],
      //   handler: async ({ source_id }) => {
      //     console.log('COPILOT RUNTIME', 'summarizeSource', source_id);
      //
      //     const idx = new KnowledgeIndex('sources');
      //
      //     const engineResponse = await idx.summarizeSource(source_id);
      //
      //     console.log('response', engineResponse);
      //
      //     return {
      //       citations: engineResponse.sourceNodes?.length,
      //       answer: engineResponse.message.content,
      //     };
      //
      //     return engineResponse;
      //   },
      // },
    ];
  },
});
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: RUNTIME_URL as string,
  });

  return handleRequest(req);
};
