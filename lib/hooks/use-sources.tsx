import React from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';

type Source = {
  id: string;
  name: string;
  fileType: string;
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
  const [sources, setSources] = React.useState<Source[]>([]);

  React.useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch('/api/sources');
        if (!response.ok) {
          throw new Error('Failed to fetch sources');
        }
        const data = await response.json();
        setSources(data.sources);
      } catch (error) {
        console.error('Error fetching sources:', error);
      }
    };

    fetchSources();
  }, []);
  const uploadSource = async (source: Source) => {
    try {
      const response = await fetch('/api/sources');
      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }
      const data = await response.json();
      setSources(data.sources);
    } catch (error) {
      console.error('Error refreshing sources:', error);
    }
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
    setSources((prev) => prev.filter((source) => source.id !== source_id));
  };

  useCopilotReadable({
    description: 'The state of the sources, inactive tasks should ignored',
    value: JSON.stringify(sources),
  });

  useCopilotAction({
    name: 'analyzeSources',
    available: 'enabled',
    description: 'answer questions based selected sources',
    parameters: [
      {
        name: 'question',
        type: 'string',
        description: 'The question to ask the LLM on the source',
        required: true,
      },
    ],
    handler: ({ question }) => {
      console.log(
        'analyzing source',
        sources.filter((el) => el.isActive),
        question
      );

      const response = fetch('/api/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceIds: sources.filter((el) => el.isActive).map((el) => el.id),
          question,
        }),
      });

      alert(response);
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
