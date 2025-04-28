// app/lib/hooks/use-source-detail.ts
import { useState } from 'react';
import { SourceDetailResponse } from '@/types';

const SOURCE_URL = process.env.NEXT_PUBLIC_SOURCE_URL as string;

export const useSourceDetail = () => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'sourceList' | 'sourceDetail'>(
    'sourceList'
  );

  const getSourceDetail = async (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SOURCE_URL}/${sourceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch source content');
      }
      const data = (await response.json()) as SourceDetailResponse;
      setContent(data.text);
      setViewType('sourceDetail');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedSourceId,
    content,
    isLoading,
    error,
    viewType,
    setViewType,
    getSourceDetail,
  };
};
