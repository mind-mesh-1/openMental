import { AddSourceButton } from '@/components/sources/AddSource';
import { SourceViewer } from '@/components/sources/SourceViewer';
import { useSources } from '@/lib/hooks/use-sources';
import Uploady from '@rpldy/uploady';
import { useState } from 'react';
const UPLOAD_ENDPOINT = process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT;

const SourceList = () => {
  const { sources, toggleSource } = useSources();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'sourceList' | 'sourceDetail'>(
    'sourceList'
  );

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
      setViewType('sourceDetail');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete source');
      }
      alert(`${sourceId} deleted`);
    } catch (error) {
      console.error('Error deleting source:', error);
      alert('Failed to delete source');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {viewType === 'sourceList' && (
        <div className="flex-none p-4">
          <div className="text-lg font-semibold mb-4">Sources</div>

          <Uploady destination={{ url: UPLOAD_ENDPOINT }}>
            <AddSourceButton />
          </Uploady>

          <div className="mt-4 space-y-2">
            {sources.map((source) => (
              <div key={source.id} className="flex justify-between  w-full">
                <div
                  key={source.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedSourceId === source.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleSourceClick(source.id)}
                >
                  <span className="text-sm font-medium">{source.fileType}</span>
                  <span className="flex-1">{source.name}</span>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <input
                    className="mr-2"
                    type="checkbox"
                    checked={source.isActive}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSource(source.id);
                    }}
                  />

                  <button
                    className="m-2 text-red-500 hover:text-red-700"
                    onClick={() => {
                      handleDeleteSource(source.id);
                    }}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewType === 'sourceDetail' && selectedSourceId && (
        <div className="flex-1 border-t mt-4 min-h-0">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setViewType('sourceList')}
                className="text-red-500 hover:text-red-700"
              >
                X
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <SourceViewer
                content={content}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceList;
