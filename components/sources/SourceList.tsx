import { AddSourceButton } from '@/components/sources/AddSource';
import { SourceViewer } from '@/components/sources/SourceViewer';
import { useSources } from '@/lib/hooks/use-sources';
import Uploady from '@rpldy/uploady';
import { useState } from 'react';

const SourceList = () => {
  const { sources, toggleSource } = useSources();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSourceClick = async (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sources/${sourceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch source content');
      }
      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4">
        <div className="text-lg font-semibold mb-4">Sources</div>

        <Uploady destination={{ url: '/api/upload' }}>
          <AddSourceButton />
        </Uploady>

        <div className="mt-4 space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                selectedSourceId === source.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSourceClick(source.id)}
            >
              <span className="text-sm font-medium">{source.fileType}</span>
              <span className="flex-1">{source.name}</span>
              <input
                type="checkbox"
                checked={source.isActive}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSource(source.id);
                }}
                className="ml-2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 border-t mt-4 min-h-0">
        <SourceViewer content={content} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default SourceList;
