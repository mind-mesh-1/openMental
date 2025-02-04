'use client';

import TasksList from '@/components/TasksList';

import { TasksProvider } from '@/lib/hooks/use-tasks';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotChat, CopilotKitCSSProperties } from '@copilotkit/react-ui';
import { SourceList } from '@/components/sources';
import { SourcesProvider } from '@/lib/hooks/use-sources';
import '@copilotkit/react-ui/styles.css';
import '@radix-ui/themes/styles.css';

export default function Home() {
  const COPILOT_RUNTIME_ENDPOINT =
    process.env.NEXT_PUBLIC_COPILOT_RUNTIME_ENDPOINT;
  const COPILOT_CLOUD_PUBLIC_API_KEY =
    process.env.NEXT_PUBLIC_COPILOT_CLOUD_PUBLIC_API_KEY;

  console.log('runtime_endpoint', COPILOT_RUNTIME_ENDPOINT);

  return (
    <div className="flex h-screen">
      <CopilotKit runtimeUrl={COPILOT_RUNTIME_ENDPOINT}>
        <div className="flex-1 border border-red-500 p-4 m-2 rounded">
          <SourcesProvider>
            <SourceList />
          </SourcesProvider>
        </div>
        <div className="flex-1 border border-blue-500 p-4 m-2 rounded flex flex-col">
          <div> Chat</div>
          <CopilotChat
            className="border border-black-500 flex-1 overflow-auto"
            labels={{
              title: 'Your Assistant',
              initial: 'Hi! 👋 How can I assist you today?',
            }}
          />
        </div>
        <div className="flex-1 border border-green-500 p-4 m-2 rounded flex flex-col">
          studio
          <TasksProvider>
            <TasksList className="flex-1 overflow-auto" />
          </TasksProvider>
        </div>
      </CopilotKit>
    </div>
  );
}
