// components/Application.tsx
import React, { useState } from 'react';
import { SourcesProvider } from '@/lib/hooks/use-sources';
import { Sources } from '@/components/sources';
import { CopilotChat } from '@copilotkit/react-ui';
import { TasksProvider } from '@/lib/hooks/use-tasks';
import TasksList from '@/components/TasksList';
import { useAuditAction } from '@/lib/hooks/use-audit';

const Application = () => {
  const [toolState, setToolState] = useState<'studio' | 'audit' | undefined>(
    undefined
  );

  const { actions } = useAuditAction();

  return (
    <div className="flex h-screen border">
      <div className="flex h-screen border w-[95vw] shadow">
        <div className="flex-1 border border-red-500 p-4 m-2 rounded">
          <SourcesProvider>
            <Sources />
          </SourcesProvider>
        </div>
        <div className="flex-1 border border-gray-500 p-4 m-2 rounded flex flex-col shadow">
          <div> WorkSpace Copilot</div>
          <CopilotChat
            className=" flex-1 overflow-auto"
            labels={{
              title: 'Your Copilot',
              initial: 'Hi! 👋 How can I assist you today?',
            }}
          />
        </div>
        <TasksProvider>
          {toolState === 'studio' && (
            <div className="flex-1 border border-green-500 p-4 m-2 rounded flex flex-col bg-white shadow-lg">
              <div className="flex justify-between items-center">
                <span>Task Studio</span>
              </div>
              <TasksList className="flex-1 overflow-auto" />
            </div>
          )}
        </TasksProvider>
        {toolState === 'audit' && (
          <div className="flex-1 border border-gray-100 p-4 m-2 rounded flex flex-col bg-gray-200 shadow-lg">
            <span>Audit</span>

            <ul>
              {actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-col h-screen border w-[5vw]">
        <button
          onClick={() => {
            if (toolState === 'studio') {
              setToolState(undefined);
            } else {
              setToolState('studio');
            }
          }}
          className={`border p-1 rounded mb-2 ${toolState !== 'studio' ? 'border-gray-500' : 'border-green-500 bg-green-100'}`}
        >
          studio
        </button>
        <button
          onClick={() => {
            if (toolState === 'audit') {
              setToolState(undefined);
            } else {
              setToolState('audit');
            }
          }}
          className={`border p-1 rounded mb-2 ${toolState !== 'audit' ? 'border-gray-500' : 'border-green-500 bg-green-100'}`}
        >
          Audit
        </button>
      </div>
    </div>
  );
};

export { Application };
