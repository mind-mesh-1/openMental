import React from 'react';
import { mock } from 'node:test';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';

type Source = {
  id: string;
  name: string;
  fileType: string;
  isActive: boolean;
};

type SourceContextType = {
  sources: Source[];
  uploadSource: (source: any) => void;
  viewSource: (source_id: string) => void;
  toggleSource: (source_id: string) => void;
  deleteSource: (source_id: string) => void;
};

const SourcesContext = React.createContext<SourceContextType | undefined>(
  undefined
);

const mockSources: Source[] = [
  { id: '1', name: 'Source 1', fileType: 'pdf', isActive: true },
  { id: '2', name: 'Source 2', fileType: 'docx', isActive: false },
  { id: '3', name: 'Source 3', fileType: 'pdf', isActive: true },
];

const SourcesProvider = ({ children }: { children: React.ReactNode }) => {
  const [sources, setSources] = React.useState<Source[]>(mockSources);
  const uploadSource = (source: any) => {
    setSources((prev) => [...prev, source]);
  };

  const viewSource = (source_id: string) => {
    console.log(`Viewing source: ${source_id}`);
  };

  const toggleSource = (source_id: string) => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === source_id
          ? { ...source, isActive: !source.isActive }
          : source
      )
    );
  };

  const deleteSource = (source_id: string) => {
    console.log('Deleting source');
  };

  useCopilotReadable({
    description: 'The state of the sources, inactive tasks should ignored',
    value: JSON.stringify(sources),
  });

  useCopilotAction({
    name: 'analyzeSources',
    description: 'Analyze active sources',
    parameters: [
      {
        name: 'source_id',
        type: 'string[]',
        description: 'The id of the source to analyze',
        required: true,
      },
    ],
    handler: ({ source_id }) => {
      alert(`analyzing source ${source_id}`);
    },
  });

  return (
    <SourcesContext.Provider
      value={{
        sources,
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
