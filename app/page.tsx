'use client';

import TasksList from '@/components/TasksList';

import { TasksProvider } from '@/lib/hooks/use-tasks';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import { Sources } from '@/components/sources';
import { SourcesProvider } from '@/lib/hooks/use-sources';
import '@copilotkit/react-ui/styles.css';
import '@radix-ui/themes/styles.css';
import React from 'react';

export default function Home() {

    process.env.NEXT_PUBLIC_COPILOT_RUNTIME_ENDPOINT;
  // const COPILOT_CLOUD_PUBLIC_API_KEY =
  //   process.env.NEXT_PUBLIC_COPILOT_CLOUD_PUBLIC_API_KEY;

  const [studioCollapsed, setStudioCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen border">
      <div className="flex h-screen border w-[95vw]">
        <CopilotKit runtimeUrl="api/copilotkit">
          <div className="flex-1 border border-red-500 p-4 m-2 rounded">
            <SourcesProvider>
              <Sources />
            </SourcesProvider>
          </div>
          <div className="flex-1 border border-blue-500 p-4 m-2 rounded flex flex-col">
            <div> Agent</div>
            <CopilotChat
              className="border border-yellow-500 flex-1 overflow-auto"
              labels={{
                title: 'Your Assistant',
                initial: 'Hi! 👋 How can I assist you today?',
              }}
            />
          </div>
          {!studioCollapsed && (
            <div className="flex-1 border border-green-500 p-4 m-2 rounded flex flex-col">
              <div className="flex justify-between items-center">
                <span>Task Studio</span>
              </div>
              <TasksProvider>
                <TasksList className="flex-1 overflow-auto" />
              </TasksProvider>
            </div>
          )}
        </CopilotKit>
      </div>
      <div className="h-screen border w-[5vw]">
        <button
          onClick={() => setStudioCollapsed(!studioCollapsed)}
          className={`border p-1 rounded mb-2 ${studioCollapsed ? 'border-gray-500' : 'border-green-500 bg-green-100'}`}
        >
          studio
        </button>
      </div>
    </div>
  );
}
