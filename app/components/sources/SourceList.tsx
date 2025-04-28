import Uploady from '@rpldy/uploady';
import { useCopilotChat } from '@copilotkit/react-core';

import UploadSource from '@/components/sources/UploadSource';
import { useSourceDetail } from '@/components/sources/hooks/use-source-detail';
import { useSourceDelete } from '@/components/sources/hooks/use-source-delete';
import { useSources } from '@/components/sources/hooks/use-sources';
import { SourceViewer } from '@/components/sources/SourceViewer';

const UPLOAD_ENDPOINT = process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT;

const SourceList = () => {
  const { sources, toggleSource } = useSources();
  const { setMessages } = useCopilotChat();
  const {
    selectedSourceId,
    content,
    isLoading,
    error,
    viewType,
    setViewType,
    getSourceDetail,
  } = useSourceDetail();
  const { deleteSource } = useSourceDelete();

  return (
    <div className="flex flex-col h-full">
      {viewType === 'sourceList' && (
        <div className="flex-none p-4">
          <div className="text-lg font-semibold mb-4">Sources</div>

          <Uploady destination={{ url: UPLOAD_ENDPOINT }}>
            <UploadSource />
          </Uploady>

          <div>
            <button onClick={() => setMessages([])} className="mt-4">
              reset chat
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {sources.map((source) => (
              <div key={source.id} className="flex justify-between w-full">
                <div
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedSourceId === source.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => getSourceDetail(source.id)}
                >
                  <span className="text-sm font-medium">{source.fileType}</span>
                  <span className="flex-1">{source.filename}</span>
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
                    onClick={() => deleteSource(source.id)}
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
                Close
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
