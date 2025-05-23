'use client';

import React, { useEffect } from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { useAuditAction } from '@/lib/hooks/use-audit';
import { SourceItem, SourceListResponse } from '@/types';
import { renderCitations } from '@/components/Citation';

const SOURCE_URL = process.env.NEXT_PUBLIC_SOURCE_URL as string;
const QA_URL = process.env.NEXT_PUBLIC_QA_URL as string;

type Source = SourceItem & {
  isActive: boolean;
};

type SourceContextType = {
  sources: Source[];
  uploadSource: (source: Source) => void;
  viewSource: (source_id: string) => void;
  toggleSource: (source_id: string) => void;
  deleteSource: (source_id: string) => void;
};

const SourcesContext = React.createContext<SourceContextType | undefined>(
  undefined
);

const SourcesProvider = ({ children }: { children: React.ReactNode }) => {
  const [sourcesState, setSourcesState] = React.useState<Source[]>([]);

  const { logAction } = useAuditAction();
  const uploadSource = async () => {
    try {
      const response = await fetch(`${SOURCE_URL}/list`);
      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }
      const data = await response.json();
      setSourcesState(data.sources);
    } catch (error) {
      console.error('Error refreshing sources:', error);
    }
  };

  const viewSource = (source_id: string) => {
    console.log(`Viewing source: ${source_id}`);
  };

  const toggleSource = (source_id: string) => {
    setSourcesState((prev) =>
      prev.map((source) =>
        source.id === source_id
          ? { ...source, isActive: !source.isActive }
          : source
      )
    );
  };

  const deleteSource = (source_id: string) => {
    setSourcesState((prev) => prev.filter((source) => source.id !== source_id));
  };

  useCopilotReadable({
    description: 'The state of the sources',
    value: JSON.stringify(sourcesState),
  });

  useCopilotAction({
    name: 'analyzeActiveSources',
    available: 'enabled',
    description: 'answer question directly based on active sources selected',
    followUp: false,
    parameters: [
      {
        name: 'question',
        type: 'string',
        description: 'the question to be asked based on the active sources',
        required: true,
      },
    ],
    handler: async ({ question }) => {
      const sources = sourcesState.filter((el) => el.isActive);
      const sourceIds = sources.map((el) => el.id);
      logAction(
        `copilot analyzeActiveSources ${question} with with reference ${sourceIds} `,
        'QA'
      );

      const resp = await fetch(QA_URL, {
        method: 'POST',
        body: JSON.stringify({
          sourceIds: sources.map((el) => el.id),
          question,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await resp.json();
    },

    render: ({ status, result }) => {
      if (status === 'executing' || status === 'inProgress') {
        return 'loading';
      } else if (status === 'complete') {
        return (
          <>
            {result.response}
            {renderCitations(result.citations)}
          </>
        );
      } else {
        return <div className="text-red-500">No meseting found</div>;
      }
    },
  });

  useCopilotAction({
    name: 'unCheckAllSources',
    available: 'enabled',
    description:
      'Uncheck all active sources if there are any, upon user request',
    followUp: false,
    parameters: [],
    handler: async () => {
      logAction('COPILOT unchecked all sources', 'SOURCES');
      setSourcesState((prev) =>
        prev.map((source) => ({ ...source, isActive: false }))
      );
    },
  });

  useCopilotAction({
    name: 'checkAllSources',
    available: 'enabled',
    description: 'Check all active sources upon user request',
    followUp: false,
    parameters: [],
    handler: async () => {
      logAction('COPILOT checked all sources', 'SOURCES');
      setSourcesState((prev) =>
        prev.map((source) => ({ ...source, isActive: true }))
      );
    },
  });

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch(`${SOURCE_URL}/list`);
        if (!response.ok) {
          throw new Error('Failed to fetch sources');
        }
        const data = (await response.json()) as SourceListResponse;
        console.log('fetched sources', data);
        setSourcesState(data.items);
      } catch (error) {
        console.error('Error fetching sources:', error);
      }
    };

    fetchSources();
  }, []);

  return (
    <SourcesContext.Provider
      value={{
        sources: sourcesState,
        uploadSource,
        viewSource,
        toggleSource,
        deleteSource,
      }}
    >
      {children}
    </SourcesContext.Provider>
  );
};

const useSources = () => {
  const context = React.useContext(SourcesContext);
  if (!context) {
    throw new Error('useSources must be used within a SourcesProvider');
  }
  return context;
};

export { SourcesProvider, useSources };
