import React from 'react';

interface SourceViewerProps {
  content: string | null;
  isLoading: boolean;
  error: string | null;
}

const SourceViewer: React.FC<SourceViewerProps> = ({ content, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a source to view its content
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap font-mono text-sm p-4 h-full overflow-auto">
      {content}
    </div>
  );
};

export { SourceViewer };